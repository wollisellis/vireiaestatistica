/**
 * Script para corrigir os problemas finais identificados:
 * 1. Contador de estudantes inconsistente (lista vs detalhes)
 * 2. Pontuação da Nicole incorreta (deve ser 7.5, não 8)
 * 3. Dashboard mostra apenas 1 estudante total
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, updateDoc, writeBatch, query, where } = require('firebase/firestore');

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
  console.log('🔧 CORRIGINDO PROBLEMAS FINAIS IDENTIFICADOS');
  console.log('============================================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. Diagnosticar problema do contador de estudantes
    await diagnoseStudentCountIssue();
    
    // 2. Corrigir pontuação da Nicole
    await fixNicoleScore();
    
    // 3. Verificar e corrigir dashboard de professores
    await fixProfessorDashboard();
    
    // 4. Verificar consistência geral
    await verifySystemConsistency();
    
    console.log('\n🎉 CORREÇÃO DE PROBLEMAS FINAIS COMPLETA!');
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

async function diagnoseStudentCountIssue() {
  console.log('👥 1. DIAGNOSTICANDO PROBLEMA DO CONTADOR DE ESTUDANTES');
  console.log('=====================================================');
  
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    
    for (const classDoc of classesSnapshot.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      
      // Contar estudantes reais na coleção classStudents
      const classStudentsSnapshot = await getDocs(
        query(collection(db, 'classStudents'), where('classId', '==', classId))
      );
      
      // Contar estudantes reais na coleção class_students (formato alternativo)
      const altClassStudentsSnapshot = await getDocs(
        query(collection(db, 'class_students'), where('classId', '==', classId))
      );
      
      const realStudentCount1 = classStudentsSnapshot.size;
      const realStudentCount2 = altClassStudentsSnapshot.size;
      const storedStudentCount = classData.studentsCount || 0;
      
      console.log(`🔍 Turma: ${classData.name}`);
      console.log(`   Contador armazenado: ${storedStudentCount}`);
      console.log(`   Estudantes em 'classStudents': ${realStudentCount1}`);
      console.log(`   Estudantes em 'class_students': ${realStudentCount2}`);
      
      // Usar o maior valor como referência
      const actualStudentCount = Math.max(realStudentCount1, realStudentCount2);
      
      if (storedStudentCount !== actualStudentCount) {
        console.log(`🔧 Corrigindo: ${storedStudentCount} → ${actualStudentCount}`);
        
        const classRef = doc(db, 'classes', classId);
        await updateDoc(classRef, {
          studentsCount: actualStudentCount,
          studentsCountCorrectedAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        console.log(`   ✅ Contador correto`);
      }
      
      // Listar estudantes para debug
      if (actualStudentCount > 0) {
        console.log(`   📋 Estudantes encontrados:`);
        
        // Listar da primeira coleção
        classStudentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`      - ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
        });
        
        // Listar da segunda coleção se diferente
        if (realStudentCount2 > realStudentCount1) {
          altClassStudentsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`      - ALT: ${data.studentName || data.name || 'Nome não disponível'} (${data.studentId?.slice(-6) || 'ID não disponível'})`);
          });
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erro ao diagnosticar contador de estudantes:', error);
  }
}

async function fixNicoleScore() {
  console.log('🎯 2. CORRIGINDO PONTUAÇÃO DA NICOLE');
  console.log('===================================');
  
  try {
    // Buscar Nicole nos dados de pontuação
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    
    for (const scoreDoc of scoresSnapshot.docs) {
      const scoreData = scoreDoc.data();
      const studentId = scoreDoc.id;
      
      // Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      if (userData && userData.fullName && userData.fullName.includes('Nicole')) {
        console.log(`👤 Encontrada Nicole: ${userData.fullName}`);
        console.log(`   ID: ${studentId.slice(-6)}`);
        console.log(`   Pontuação atual: ${scoreData.totalScore}`);
        console.log(`   Pontuação normalizada atual: ${scoreData.normalizedScore}`);
        
        // Verificar se a pontuação está incorreta (normalizada 8 mas total 7.5)
        if (scoreData.normalizedScore === 8 && scoreData.totalScore === 7.5) {
          console.log(`🔧 Corrigindo pontuação normalizada: 8 → 7.5`);
          
          const scoreRef = doc(db, 'unified_scores', studentId);
          await updateDoc(scoreRef, {
            normalizedScore: 7.5, // Corrigir para valor real
            scoreCorrectedAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`✅ Pontuação da Nicole corrigida!`);
        } else if (scoreData.normalizedScore !== scoreData.totalScore) {
          console.log(`⚠️ Inconsistência: normalizada=${scoreData.normalizedScore}, total=${scoreData.totalScore}`);
          console.log(`🔧 Corrigindo normalizada para ${scoreData.totalScore}`);
          
          const scoreRef = doc(db, 'unified_scores', studentId);
          await updateDoc(scoreRef, {
            normalizedScore: scoreData.totalScore, // Usar totalScore como referência
            scoreCorrectedAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`✅ Pontuação da Nicole corrigida!`);
        } else {
          console.log(`✅ Pontuação da Nicole está correta`);
        }
        
        // Mostrar detalhes dos módulos
        if (scoreData.moduleScores) {
          console.log(`   📊 Pontuações por módulo:`);
          Object.keys(scoreData.moduleScores).forEach(moduleId => {
            const moduleData = scoreData.moduleScores[moduleId];
            if (typeof moduleData === 'object') {
              console.log(`      ${moduleId}: score=${moduleData.score}, bestScore=${moduleData.bestScore || moduleData.score}`);
            } else {
              console.log(`      ${moduleId}: ${moduleData}`);
            }
          });
        }
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir pontuação da Nicole:', error);
  }
}

async function fixProfessorDashboard() {
  console.log('👨‍🏫 3. CORRIGINDO DASHBOARD DE PROFESSORES');
  console.log('==========================================');
  
  try {
    // Contar total real de estudantes no sistema
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'student')));
    const totalStudentsInSystem = usersSnapshot.size;
    
    console.log(`📊 Total de estudantes no sistema: ${totalStudentsInSystem}`);
    
    // Contar estudantes ativos (com pontuação)
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    const studentsWithScores = scoresSnapshot.docs.filter(doc => {
      const data = doc.data();
      return (data.totalScore || 0) > 0;
    });
    
    console.log(`📊 Estudantes com pontuação: ${studentsWithScores.length}`);
    
    // Contar estudantes por turma
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    let totalStudentsInClasses = 0;
    
    console.log(`📋 Estudantes por turma:`);
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const studentsCount = classData.studentsCount || 0;
      totalStudentsInClasses += studentsCount;
      
      console.log(`   ${classData.name}: ${studentsCount} estudantes`);
    }
    
    console.log(`📊 Total de estudantes em turmas: ${totalStudentsInClasses}`);
    
    // Verificar se há inconsistência
    if (totalStudentsInSystem !== totalStudentsInClasses) {
      console.log(`⚠️ INCONSISTÊNCIA DETECTADA:`);
      console.log(`   Estudantes no sistema: ${totalStudentsInSystem}`);
      console.log(`   Estudantes em turmas: ${totalStudentsInClasses}`);
      console.log(`   Diferença: ${Math.abs(totalStudentsInSystem - totalStudentsInClasses)}`);
    } else {
      console.log(`✅ Contadores consistentes`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dashboard de professores:', error);
  }
}

async function verifySystemConsistency() {
  console.log('🔍 4. VERIFICANDO CONSISTÊNCIA GERAL DO SISTEMA');
  console.log('===============================================');
  
  try {
    // Verificar se todos os estudantes com pontuação têm dados de usuário
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`📊 Registros de pontuação: ${scoresSnapshot.size}`);
    
    let studentsWithoutUserData = 0;
    let studentsWithoutAnonymousId = 0;
    
    for (const scoreDoc of scoresSnapshot.docs) {
      const studentId = scoreDoc.id;
      const scoreData = scoreDoc.data();
      
      // Verificar se existe dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId));
      if (!userDoc.exists()) {
        studentsWithoutUserData++;
        console.log(`⚠️ Estudante sem dados de usuário: ${studentId.slice(-6)}`);
      } else {
        const userData = userDoc.data();
        if (!userData.anonymousId) {
          studentsWithoutAnonymousId++;
          console.log(`⚠️ Estudante sem anonymousId: ${userData.fullName || studentId.slice(-6)}`);
        }
      }
    }
    
    console.log(`📊 Resumo da verificação:`);
    console.log(`   Estudantes sem dados de usuário: ${studentsWithoutUserData}`);
    console.log(`   Estudantes sem anonymousId: ${studentsWithoutAnonymousId}`);
    
    if (studentsWithoutUserData === 0 && studentsWithoutAnonymousId === 0) {
      console.log(`✅ Sistema consistente!`);
    } else {
      console.log(`⚠️ Sistema precisa de correções adicionais`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar consistência:', error);
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
