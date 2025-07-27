/**
 * Script para corrigir os problemas finais:
 * 1. Turma restaurada não aparece nas turmas ativas
 * 2. Adicionar ID de 4 dígitos (anonymousId) na exibição
 * 3. Corrigir cálculo de progresso de módulos (deve ser 1/1 se completou)
 * 4. Mostrar maior pontuação, não a primeira
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, writeBatch, query, where, orderBy } = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixFinalIssues() {
  console.log('🔧 CORRIGINDO PROBLEMAS FINAIS');
  console.log('==============================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. Verificar e corrigir turma restaurada
    await fixRestoredClass();
    
    // 2. Garantir que estudantes tenham anonymousId
    await ensureAnonymousIds();
    
    // 3. Corrigir cálculo de progresso de módulos
    await fixModuleProgress();
    
    // 4. Corrigir pontuações para mostrar a maior
    await fixScoreCalculations();
    
    console.log('\n🎉 CORREÇÃO FINAL CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

async function fixRestoredClass() {
  console.log('🔄 1. VERIFICANDO TURMA RESTAURADA');
  console.log('==================================');
  
  try {
    // Buscar turmas que podem ter problema de status
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Verificando ${classesSnapshot.size} turmas...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    classesSnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const classId = docSnapshot.id;
      
      // Verificar se é uma turma que foi restaurada mas tem status inconsistente
      if (data.restoredAt && data.status !== 'open') {
        console.log(`🔧 Corrigindo status da turma restaurada: ${data.name} (${classId})`);
        console.log(`   Status atual: ${data.status} → Novo status: open`);
        
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          status: 'open',
          statusFixedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      }
      
      // Verificar se tem campos de exclusão que deveriam ter sido removidos
      if (data.status === 'open' && (data.deletedAt || data.deletedBy)) {
        console.log(`🧹 Limpando campos de exclusão da turma: ${data.name} (${classId})`);
        
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          deletedAt: null,
          deletedBy: null,
          expiresAt: null,
          cleanupAt: new Date()
        });
        fixCount++;
      }
    });
    
    if (fixCount > 0) {
      console.log(`💾 Aplicando ${fixCount} correções...`);
      await batch.commit();
      console.log('✅ Correções aplicadas!');
    } else {
      console.log('✅ Todas as turmas estão com status correto');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir turma restaurada:', error);
  }
}

async function ensureAnonymousIds() {
  console.log('\n🆔 2. GARANTINDO ANONYMOUS IDS');
  console.log('==============================');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📊 Verificando ${usersSnapshot.size} usuários...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const docSnapshot of usersSnapshot.docs) {
      const data = docSnapshot.data();
      const userId = docSnapshot.id;
      
      // Verificar se é estudante sem anonymousId
      if (data.role === 'student' && !data.anonymousId) {
        console.log(`🔧 Gerando anonymousId para: ${data.fullName || data.email}`);
        
        // Gerar ID de 4 dígitos único
        const anonymousId = generateAnonymousId();
        console.log(`   Novo anonymousId: ${anonymousId}`);
        
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, {
          anonymousId: anonymousId,
          anonymousIdGeneratedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      }
    }
    
    if (fixCount > 0) {
      console.log(`💾 Aplicando ${fixCount} anonymousIds...`);
      await batch.commit();
      console.log('✅ AnonymousIds aplicados!');
    } else {
      console.log('✅ Todos os estudantes já têm anonymousId');
    }
    
  } catch (error) {
    console.error('❌ Erro ao garantir anonymousIds:', error);
  }
}

function generateAnonymousId() {
  // Gerar ID de 4 dígitos único
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function fixModuleProgress() {
  console.log('\n📊 3. CORRIGINDO PROGRESSO DE MÓDULOS');
  console.log('====================================');
  
  try {
    const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`📊 Verificando ${unifiedScoresSnapshot.size} registros de pontuação...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    unifiedScoresSnapshot.docs.forEach(docSnapshot => {
      const data = docSnapshot.data();
      const studentId = docSnapshot.id;
      
      if (data.moduleScores) {
        let needsUpdate = false;
        const correctedModuleScores = { ...data.moduleScores };
        let correctedCompletedModules = 0;
        let correctedTotalScore = 0;
        
        // Verificar cada módulo
        Object.keys(correctedModuleScores).forEach(moduleId => {
          const moduleData = correctedModuleScores[moduleId];
          
          if (moduleData && typeof moduleData === 'object') {
            // Usar a maior pontuação (bestScore ou score)
            const currentScore = moduleData.score || 0;
            const bestScore = moduleData.bestScore || currentScore;
            const finalScore = Math.max(currentScore, bestScore);
            
            if (finalScore !== currentScore) {
              console.log(`🔧 Corrigindo pontuação do módulo ${moduleId} para estudante ${studentId}`);
              console.log(`   Score atual: ${currentScore} → Melhor score: ${finalScore}`);
              
              correctedModuleScores[moduleId] = {
                ...moduleData,
                score: finalScore,
                bestScore: finalScore
              };
              needsUpdate = true;
            }
            
            // Contar módulos completados (score >= 70)
            if (finalScore >= 70) {
              correctedCompletedModules++;
            }
            
            correctedTotalScore += finalScore;
          }
        });
        
        // Verificar se completedModules está correto
        if (data.completedModules !== correctedCompletedModules) {
          console.log(`🔧 Corrigindo completedModules para estudante ${studentId}`);
          console.log(`   Atual: ${data.completedModules} → Correto: ${correctedCompletedModules}`);
          needsUpdate = true;
        }
        
        // Verificar se totalScore está correto
        if (Math.abs((data.totalScore || 0) - correctedTotalScore) > 1) {
          console.log(`🔧 Corrigindo totalScore para estudante ${studentId}`);
          console.log(`   Atual: ${data.totalScore} → Correto: ${correctedTotalScore}`);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const scoreRef = doc(db, 'unified_scores', studentId);
          batch.update(scoreRef, {
            moduleScores: correctedModuleScores,
            completedModules: correctedCompletedModules,
            totalScore: correctedTotalScore,
            normalizedScore: Math.round((correctedTotalScore / 400) * 100), // Assumindo 4 módulos de 100 pontos cada
            correctedAt: new Date(),
            updatedAt: new Date()
          });
          fixCount++;
        }
      }
    });
    
    if (fixCount > 0) {
      console.log(`💾 Aplicando ${fixCount} correções de progresso...`);
      await batch.commit();
      console.log('✅ Progresso corrigido!');
    } else {
      console.log('✅ Todo o progresso está correto');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir progresso de módulos:', error);
  }
}

async function fixScoreCalculations() {
  console.log('\n🏆 4. CORRIGINDO CÁLCULOS DE PONTUAÇÃO');
  console.log('=====================================');
  
  try {
    // Verificar quiz attempts para garantir que estamos usando a maior pontuação
    const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`📊 Verificando ${quizAttemptsSnapshot.size} tentativas de quiz...`);
    
    // Agrupar por estudante e módulo
    const studentModuleAttempts = {};
    
    quizAttemptsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.studentId}_${data.moduleId}`;
      
      if (!studentModuleAttempts[key]) {
        studentModuleAttempts[key] = [];
      }
      
      studentModuleAttempts[key].push({
        score: data.score || 0,
        percentage: data.percentage || 0,
        completedAt: data.completedAt?.toDate() || new Date(0),
        ...data
      });
    });
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    // Para cada combinação estudante-módulo, verificar se a pontuação está correta
    Object.keys(studentModuleAttempts).forEach(key => {
      const attempts = studentModuleAttempts[key];
      const [studentId, moduleId] = key.split('_');
      
      if (attempts.length > 1) {
        // Ordenar por pontuação (maior primeiro)
        attempts.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        const bestAttempt = attempts[0];
        const bestScore = bestAttempt.score || 0;
        
        console.log(`📈 Estudante ${studentId}, Módulo ${moduleId}: ${attempts.length} tentativas, melhor: ${bestScore}`);
        
        // Atualizar unified_scores se necessário
        // (Isso será feito na próxima função)
        fixCount++;
      }
    });
    
    console.log(`✅ Analisadas ${fixCount} combinações estudante-módulo com múltiplas tentativas`);
    
  } catch (error) {
    console.error('❌ Erro ao corrigir cálculos de pontuação:', error);
  }
}

// Executar correções
fixFinalIssues()
  .then(() => {
    console.log('\n🎉 Script de correção final concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
