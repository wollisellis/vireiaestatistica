"use strict";
// Cloud Functions para Rankings Pré-Agregados - bioestat-platform
// Automatização completa do sistema de rankings com triggers em tempo real
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRankingStats = exports.regenerateRankings = exports.updateClassRanking = exports.onUnifiedScoreUpdate = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Inicializar Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// 🎯 FUNÇÃO 1: Trigger automático quando pontuação é atualizada
exports.onUnifiedScoreUpdate = functions.firestore
    .document('unified_scores/{studentId}')
    .onWrite(async (change, context) => {
    const studentId = context.params.studentId;
    console.log(`🔄 [CloudFunction] Trigger executado para estudante: ${studentId}`);
    try {
        // Verificar se o documento foi deletado
        if (!change.after.exists) {
            console.log(`⚠️ [CloudFunction] Documento deletado para ${studentId}, removendo de rankings`);
            return removeStudentFromAllRankings(studentId);
        }
        const scoreData = change.after.data();
        const previousData = change.before.exists ? change.before.data() : null;
        // Verificar se houve mudança significativa na pontuação
        const currentScore = (scoreData === null || scoreData === void 0 ? void 0 : scoreData.normalizedScore) || 0;
        const previousScore = (previousData === null || previousData === void 0 ? void 0 : previousData.normalizedScore) || 0;
        if (Math.abs(currentScore - previousScore) < 0.1) {
            console.log(`📊 [CloudFunction] Mudança insignificante na pontuação (${previousScore} → ${currentScore}), ignorando`);
            return null;
        }
        console.log(`📈 [CloudFunction] Pontuação mudou: ${previousScore} → ${currentScore}`);
        // Buscar turmas do estudante
        const enrollmentsSnapshot = await db
            .collection('classStudents')
            .where('studentId', '==', studentId)
            .where('status', '==', 'active')
            .get();
        if (enrollmentsSnapshot.empty) {
            console.log(`⚠️ [CloudFunction] Estudante ${studentId} não matriculado em nenhuma turma`);
            return null;
        }
        const enrolledClasses = enrollmentsSnapshot.docs.map(doc => doc.data().classId);
        console.log(`🎯 [CloudFunction] Atualizando rankings para ${enrolledClasses.length} turmas: ${enrolledClasses.join(', ')}`);
        // Atualizar rankings de todas as turmas em paralelo
        const updatePromises = enrolledClasses.map(classId => updateClassRankingForStudent(classId, studentId, scoreData));
        const results = await Promise.allSettled(updatePromises);
        // Log dos resultados
        results.forEach((result, index) => {
            const classId = enrolledClasses[index];
            if (result.status === 'fulfilled') {
                console.log(`✅ [CloudFunction] Ranking atualizado com sucesso para turma ${classId}`);
            }
            else {
                console.error(`❌ [CloudFunction] Erro ao atualizar turma ${classId}:`, result.reason);
            }
        });
        return { updated: results.filter(r => r.status === 'fulfilled').length };
    }
    catch (error) {
        console.error(`❌ [CloudFunction] Erro geral no trigger:`, error);
        throw error;
    }
});
// 🎯 FUNÇÃO 2: HTTP trigger para regenerar ranking de uma turma específica
exports.updateClassRanking = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar autenticação
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário deve estar logado');
    }
    const { classId } = data;
    if (!classId) {
        throw new functions.https.HttpsError('invalid-argument', 'classId é obrigatório');
    }
    console.log(`🔄 [CloudFunction] Regeneração manual solicitada para turma: ${classId}`);
    try {
        const result = await generateCompleteClassRanking(classId);
        if (result.success) {
            console.log(`✅ [CloudFunction] Regeneração completa para turma ${classId}: ${result.studentsCount} estudantes`);
            return {
                success: true,
                classId,
                studentsCount: result.studentsCount,
                averageScore: result.averageScore,
                completionRate: result.completionRate
            };
        }
        else {
            throw new functions.https.HttpsError('internal', result.error || 'Erro desconhecido');
        }
    }
    catch (error) {
        console.error(`❌ [CloudFunction] Erro na regeneração:`, error);
        throw new functions.https.HttpsError('internal', `Erro ao regenerar ranking: ${error.message}`);
    }
});
// 🎯 FUNÇÃO 3: Scheduled function para manutenção automática (diária)
exports.regenerateRankings = functions.pubsub
    .schedule('0 2 * * *') // Todo dia às 2:00 AM
    .timeZone('America/Sao_Paulo')
    .onRun(async (context) => {
    console.log(`🕐 [CloudFunction] Manutenção automática iniciada às 2:00 AM`);
    try {
        // Buscar turmas ativas
        const classesSnapshot = await db
            .collection('classes')
            .where('status', '==', 'active')
            .get();
        if (classesSnapshot.empty) {
            console.log(`⚠️ [CloudFunction] Nenhuma turma ativa encontrada`);
            return null;
        }
        const classes = classesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        console.log(`📋 [CloudFunction] Manutenção para ${classes.length} turmas ativas`);
        let successful = 0;
        let failed = 0;
        // Processar turmas em lotes para não sobrecarregar
        const batchSize = 3;
        for (let i = 0; i < classes.length; i += batchSize) {
            const batch = classes.slice(i, i + batchSize);
            const batchPromises = batch.map(async (classData) => {
                try {
                    const result = await generateCompleteClassRanking(classData.id);
                    if (result.success) {
                        successful++;
                        console.log(`✅ [CloudFunction] Manutenção turma ${classData.id}: ${result.studentsCount} estudantes`);
                    }
                    else {
                        failed++;
                        console.error(`❌ [CloudFunction] Falha na turma ${classData.id}: ${result.error}`);
                    }
                }
                catch (error) {
                    failed++;
                    console.error(`❌ [CloudFunction] Erro na turma ${classData.id}:`, error);
                }
            });
            await Promise.all(batchPromises);
            // Pausa entre lotes
            if (i + batchSize < classes.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        console.log(`🎉 [CloudFunction] Manutenção concluída: ${successful} sucessos, ${failed} falhas`);
        return {
            totalClasses: classes.length,
            successful,
            failed,
            timestamp: new Date().toISOString()
        };
    }
    catch (error) {
        console.error(`❌ [CloudFunction] Erro na manutenção automática:`, error);
        throw error;
    }
});
// 🔧 HELPER: Atualizar ranking de uma turma para um estudante específico
async function updateClassRankingForStudent(classId, studentId, newScoreData) {
    try {
        console.log(`🎯 [Helper] Atualizando estudante ${studentId} na turma ${classId}`);
        // Buscar documento de ranking atual
        const rankingRef = db.collection('class_rankings').doc(classId);
        const rankingDoc = await rankingRef.get();
        if (!rankingDoc.exists) {
            console.log(`⚠️ [Helper] Ranking não existe para turma ${classId}, gerando completo...`);
            const result = await generateCompleteClassRanking(classId);
            return result.success;
        }
        const rankingData = rankingDoc.data();
        let rankings = [...(rankingData.rankings || [])];
        // Buscar dados atuais do estudante
        const userDoc = await db.collection('users').doc(studentId).get();
        if (!userDoc.exists) {
            console.error(`❌ [Helper] Usuário ${studentId} não encontrado`);
            return false;
        }
        const userData = userDoc.data();
        // Encontrar estudante no ranking
        const studentIndex = rankings.findIndex(entry => entry.studentId === studentId);
        if (studentIndex === -1) {
            // Estudante não estava no ranking, adicionar
            console.log(`➕ [Helper] Adicionando novo estudante ${studentId} ao ranking`);
            rankings.push({
                studentId,
                studentName: extractFirstName((userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || 'Estudante'),
                anonymousId: (userData === null || userData === void 0 ? void 0 : userData.anonymousId) || studentId.slice(-4).toUpperCase(),
                totalNormalizedScore: Math.min(100, Math.max(0, newScoreData.normalizedScore || 0)),
                completedModules: Object.values(newScoreData.moduleScores || {}).filter((score) => score >= 70).length,
                lastActivity: new Date(),
                classRank: 0, // Será recalculado
                isActive: true,
                email: (userData === null || userData === void 0 ? void 0 : userData.email) || ''
            });
        }
        else {
            // Atualizar estudante existente
            console.log(`🔄 [Helper] Atualizando estudante existente ${studentId}`);
            rankings[studentIndex] = Object.assign(Object.assign({}, rankings[studentIndex]), { totalNormalizedScore: Math.min(100, Math.max(0, newScoreData.normalizedScore || 0)), completedModules: Object.values(newScoreData.moduleScores || {}).filter((score) => score >= 70).length, lastActivity: new Date(), studentName: extractFirstName((userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || rankings[studentIndex].studentName), email: (userData === null || userData === void 0 ? void 0 : userData.email) || rankings[studentIndex].email });
        }
        // Re-calcular rankings (ordenar e posicionar)
        rankings = rankings
            .filter(entry => entry.isActive) // Apenas ativos
            .sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
            .map((entry, index) => (Object.assign(Object.assign({}, entry), { classRank: index + 1 })));
        // Recalcular metadados
        const totalScore = rankings.reduce((sum, r) => sum + r.totalNormalizedScore, 0);
        const averageScore = rankings.length > 0 ? totalScore / rankings.length : 0;
        const completedStudents = rankings.filter(r => r.totalNormalizedScore >= 70).length;
        const completionRate = rankings.length > 0 ? (completedStudents / rankings.length) * 100 : 0;
        // Atualizar documento
        await rankingRef.update({
            rankings,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            studentsCount: rankings.length,
            'metadata.averageScore': Math.round(averageScore * 10) / 10,
            'metadata.completionRate': Math.round(completionRate * 10) / 10,
            'metadata.activeStudents': rankings.filter(r => r.isActive).length
        });
        const newPosition = rankings.findIndex(r => r.studentId === studentId) + 1;
        console.log(`✅ [Helper] Estudante ${studentId} atualizado, posição: #${newPosition}`);
        return true;
    }
    catch (error) {
        console.error(`❌ [Helper] Erro ao atualizar estudante no ranking:`, error);
        return false;
    }
}
// 🔧 HELPER: Gerar ranking completo para uma turma
async function generateCompleteClassRanking(classId) {
    try {
        console.log(`🔄 [Helper] Gerando ranking completo para turma: ${classId}`);
        // Buscar informações da turma
        const classDoc = await db.collection('classes').doc(classId).get();
        if (!classDoc.exists) {
            return { success: false, error: `Turma ${classId} não encontrada` };
        }
        const classData = classDoc.data();
        // Buscar estudantes matriculados
        const enrollmentsSnapshot = await db
            .collection('classStudents')
            .where('classId', '==', classId)
            .where('status', '==', 'active')
            .get();
        if (enrollmentsSnapshot.empty) {
            console.log(`⚠️ [Helper] Nenhum estudante ativo na turma ${classId}`);
            return { success: true, studentsCount: 0, averageScore: 0, completionRate: 0 };
        }
        const studentIds = enrollmentsSnapshot.docs.map(doc => doc.data().studentId);
        console.log(`📋 [Helper] Processando ${studentIds.length} estudantes`);
        // Buscar dados dos estudantes em paralelo
        const studentPromises = studentIds.map(async (studentId) => {
            try {
                const [userDoc, scoreDoc] = await Promise.all([
                    db.collection('users').doc(studentId).get(),
                    db.collection('unified_scores').doc(studentId).get()
                ]);
                if (!userDoc.exists)
                    return null;
                const userData = userDoc.data();
                const scoreData = scoreDoc.exists ? scoreDoc.data() : {
                    normalizedScore: 0,
                    moduleScores: {},
                    lastActivity: new Date()
                };
                return {
                    studentId,
                    studentName: extractFirstName((userData === null || userData === void 0 ? void 0 : userData.displayName) || (userData === null || userData === void 0 ? void 0 : userData.name) || 'Estudante'),
                    anonymousId: (userData === null || userData === void 0 ? void 0 : userData.anonymousId) || studentId.slice(-4).toUpperCase(),
                    totalNormalizedScore: Math.min(100, Math.max(0, scoreData.normalizedScore || 0)),
                    completedModules: Object.values(scoreData.moduleScores || {}).filter((score) => score >= 70).length,
                    lastActivity: scoreData.lastActivity || new Date(),
                    classRank: 0, // Será definido depois
                    isActive: true,
                    email: (userData === null || userData === void 0 ? void 0 : userData.email) || ''
                };
            }
            catch (error) {
                console.error(`❌ [Helper] Erro ao processar estudante ${studentId}:`, error);
                return null;
            }
        });
        const studentResults = await Promise.all(studentPromises);
        const validStudents = studentResults.filter(student => student !== null);
        // Ordenar e posicionar
        const rankedStudents = validStudents
            .sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
            .map((student, index) => (Object.assign(Object.assign({}, student), { classRank: index + 1 })));
        // Calcular metadados
        const totalScore = rankedStudents.reduce((sum, s) => sum + s.totalNormalizedScore, 0);
        const averageScore = rankedStudents.length > 0 ? totalScore / rankedStudents.length : 0;
        const completedStudents = rankedStudents.filter(s => s.totalNormalizedScore >= 70).length;
        const completionRate = rankedStudents.length > 0 ? (completedStudents / rankedStudents.length) * 100 : 0;
        // Criar documento de ranking
        const rankingDocument = {
            classId,
            className: (classData === null || classData === void 0 ? void 0 : classData.name) || `Turma ${classId}`,
            lastUpdated: new Date(),
            studentsCount: rankedStudents.length,
            rankings: rankedStudents,
            metadata: {
                averageScore: Math.round(averageScore * 10) / 10,
                completionRate: Math.round(completionRate * 10) / 10,
                activeStudents: rankedStudents.filter(s => s.isActive).length,
                lastFullRebuild: new Date(),
                version: '2.0'
            }
        };
        // Salvar no Firestore
        await db.collection('class_rankings').doc(classId).set(Object.assign(Object.assign({}, rankingDocument), { lastUpdated: admin.firestore.FieldValue.serverTimestamp(), 'metadata.lastFullRebuild': admin.firestore.FieldValue.serverTimestamp() }));
        console.log(`✅ [Helper] Ranking gerado: ${rankedStudents.length} estudantes, média: ${averageScore.toFixed(1)}`);
        return {
            success: true,
            studentsCount: rankedStudents.length,
            averageScore: Math.round(averageScore * 10) / 10,
            completionRate: Math.round(completionRate * 10) / 10
        };
    }
    catch (error) {
        console.error(`❌ [Helper] Erro ao gerar ranking completo:`, error);
        return { success: false, error: error.message };
    }
}
// 🔧 HELPER: Remover estudante de todos os rankings
async function removeStudentFromAllRankings(studentId) {
    try {
        console.log(`🗑️ [Helper] Removendo estudante ${studentId} de todos os rankings`);
        // Buscar todos os rankings que contém o estudante
        const rankingsSnapshot = await db.collection('class_rankings').get();
        const updatePromises = rankingsSnapshot.docs.map(async (doc) => {
            const rankingData = doc.data();
            const rankings = rankingData.rankings || [];
            const studentIndex = rankings.findIndex(entry => entry.studentId === studentId);
            if (studentIndex !== -1) {
                console.log(`➖ [Helper] Removendo de turma ${doc.id}`);
                // Remover estudante e re-calcular posições
                const updatedRankings = rankings
                    .filter(entry => entry.studentId !== studentId)
                    .map((entry, index) => (Object.assign(Object.assign({}, entry), { classRank: index + 1 })));
                // Recalcular metadados
                const totalScore = updatedRankings.reduce((sum, r) => sum + r.totalNormalizedScore, 0);
                const averageScore = updatedRankings.length > 0 ? totalScore / updatedRankings.length : 0;
                const completedStudents = updatedRankings.filter(r => r.totalNormalizedScore >= 70).length;
                const completionRate = updatedRankings.length > 0 ? (completedStudents / updatedRankings.length) * 100 : 0;
                await doc.ref.update({
                    rankings: updatedRankings,
                    studentsCount: updatedRankings.length,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    'metadata.averageScore': Math.round(averageScore * 10) / 10,
                    'metadata.completionRate': Math.round(completionRate * 10) / 10,
                    'metadata.activeStudents': updatedRankings.filter(r => r.isActive).length
                });
            }
        });
        await Promise.all(updatePromises);
        console.log(`✅ [Helper] Estudante removido de todos os rankings`);
    }
    catch (error) {
        console.error(`❌ [Helper] Erro ao remover estudante dos rankings:`, error);
    }
}
// 🔧 HELPER: Extrair primeiro nome
function extractFirstName(fullName) {
    if (!fullName)
        return 'Estudante';
    return fullName.split(' ')[0];
}
// 🎯 FUNÇÃO 4: HTTP trigger para estatísticas (debug)
exports.getRankingStats = functions.https.onCall(async (data, context) => {
    var _a;
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid)) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário deve estar logado');
    }
    try {
        const rankingsSnapshot = await db.collection('class_rankings').get();
        const rankings = rankingsSnapshot.docs.map(doc => doc.data());
        if (rankings.length === 0) {
            return {
                totalRankings: 0,
                averageStudentsPerClass: 0,
                oldestUpdate: null,
                newestUpdate: null,
                versionDistribution: {}
            };
        }
        const totalStudents = rankings.reduce((sum, r) => sum + r.studentsCount, 0);
        const averageStudentsPerClass = Math.round(totalStudents / rankings.length);
        const updateDates = rankings
            .map(r => r.lastUpdated)
            .filter(date => date)
            .map(date => date instanceof admin.firestore.Timestamp ? date.toDate() : new Date(date))
            .sort((a, b) => a.getTime() - b.getTime());
        const versionDistribution = rankings.reduce((acc, r) => {
            var _a;
            const version = ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.version) || 'unknown';
            acc[version] = (acc[version] || 0) + 1;
            return acc;
        }, {});
        return {
            totalRankings: rankings.length,
            averageStudentsPerClass,
            totalStudents,
            oldestUpdate: updateDates.length > 0 ? updateDates[0].toISOString() : null,
            newestUpdate: updateDates.length > 0 ? updateDates[updateDates.length - 1].toISOString() : null,
            versionDistribution,
            generatedAt: new Date().toISOString()
        };
    }
    catch (error) {
        console.error(`❌ [CloudFunction] Erro ao obter estatísticas:`, error);
        throw new functions.https.HttpsError('internal', `Erro ao obter estatísticas: ${error.message}`);
    }
});
//# sourceMappingURL=index.js.map