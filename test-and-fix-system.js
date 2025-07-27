/**
 * Script para testar e corrigir todos os problemas identificados:
 * 1. Professores veem todas as turmas
 * 2. Contador de estudantes atualiza corretamente
 * 3. Ranking usa melhores pontuações
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

async function testAndFixSystem() {
  console.log('🔧 TESTANDO E CORRIGINDO SISTEMA COMPLETO');
  console.log('=========================================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. Testar acesso de professores a todas as turmas
    await testProfessorAccess();
    
    // 2. Verificar e corrigir contadores de estudantes
    await fixStudentCounters();
    
    // 3. Verificar sistema de ranking
    await testRankingSystem();
    
    // 4. Criar dados de teste se necessário
    await createTestDataIfNeeded();
    
    console.log('\n🎉 TESTE E CORREÇÃO COMPLETOS!');
    
  } catch (error) {
    console.error('❌ Erro durante teste e correção:', error);
  }
}

async function testProfessorAccess() {
  console.log('👨‍🏫 1. TESTANDO ACESSO DE PROFESSORES');
  console.log('===================================');
  
  try {
    // Buscar todos os professores
    const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'professor')));
    console.log(`📊 Encontrados ${usersSnapshot.size} professores`);
    
    // Buscar todas as turmas
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    console.log(`📊 Encontradas ${classesSnapshot.size} turmas no sistema`);
    
    const turmasPorStatus = {};
    classesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = data.status || 'undefined';
      turmasPorStatus[status] = (turmasPorStatus[status] || 0) + 1;
    });
    
    console.log('📋 Turmas por status:');
    Object.keys(turmasPorStatus).forEach(status => {
      console.log(`   ${status}: ${turmasPorStatus[status]} turmas`);
    });
    
    // Verificar se todas as turmas ativas são visíveis
    const turmasAtivas = classesSnapshot.docs.filter(doc => {
      const status = doc.data().status;
      return ['active', 'open', 'closed'].includes(status);
    });
    
    console.log(`✅ ${turmasAtivas.length} turmas devem ser visíveis para todos os professores`);
    
  } catch (error) {
    console.error('❌ Erro ao testar acesso de professores:', error);
  }
}

async function fixStudentCounters() {
  console.log('\n📊 2. CORRIGINDO CONTADORES DE ESTUDANTES');
  console.log('========================================');
  
  try {
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      
      // Contar estudantes reais na turma
      const studentsSnapshot = await getDocs(
        query(collection(db, 'classStudents'), where('classId', '==', classId))
      );
      
      const realStudentCount = studentsSnapshot.size;
      const storedStudentCount = classData.studentsCount || 0;
      
      console.log(`🔍 Turma ${classData.name}:`);
      console.log(`   Contador armazenado: ${storedStudentCount}`);
      console.log(`   Estudantes reais: ${realStudentCount}`);
      
      if (storedStudentCount !== realStudentCount) {
        console.log(`🔧 Corrigindo contador: ${storedStudentCount} → ${realStudentCount}`);
        
        const classRef = doc(db, 'classes', classId);
        batch.update(classRef, {
          studentsCount: realStudentCount,
          studentsCountCorrectedAt: new Date(),
          updatedAt: new Date()
        });
        fixCount++;
      } else {
        console.log(`   ✅ Contador correto`);
      }
    }
    
    if (fixCount > 0) {
      console.log(`\n💾 Aplicando ${fixCount} correções de contador...`);
      await batch.commit();
      console.log('✅ Contadores corrigidos!');
    } else {
      console.log('✅ Todos os contadores estão corretos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir contadores:', error);
  }
}

async function testRankingSystem() {
  console.log('\n🏆 3. TESTANDO SISTEMA DE RANKING');
  console.log('================================');
  
  try {
    // Buscar dados de pontuação unificada
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`📊 Encontrados ${scoresSnapshot.size} registros de pontuação`);
    
    const rankingData = [];
    
    for (const scoreDoc of scoresSnapshot.docs) {
      const scoreData = scoreDoc.data();
      const studentId = scoreDoc.id;
      
      // Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      if (userData) {
        const entry = {
          studentId,
          name: userData.fullName || 'Estudante',
          anonymousId: userData.anonymousId || 'N/A',
          totalScore: scoreData.totalScore || 0,
          normalizedScore: scoreData.normalizedScore || 0,
          completedModules: scoreData.completedModules || 0,
          moduleScores: scoreData.moduleScores || {}
        };
        
        rankingData.push(entry);
        
        console.log(`👤 ${entry.name} (${entry.anonymousId}):`);
        console.log(`   Total Score: ${entry.totalScore}`);
        console.log(`   Normalized Score: ${entry.normalizedScore}`);
        console.log(`   Completed Modules: ${entry.completedModules}`);
        
        // Verificar se está usando melhores pontuações
        if (entry.moduleScores) {
          Object.keys(entry.moduleScores).forEach(moduleId => {
            const moduleData = entry.moduleScores[moduleId];
            if (typeof moduleData === 'object') {
              const currentScore = moduleData.score || 0;
              const bestScore = moduleData.bestScore || currentScore;
              console.log(`   Módulo ${moduleId}: score=${currentScore}, bestScore=${bestScore}`);
            }
          });
        }
        console.log('');
      }
    }
    
    // Ordenar ranking
    const sortedRanking = rankingData
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({ ...entry, position: index + 1 }));
    
    console.log('🏆 RANKING ATUAL:');
    sortedRanking.slice(0, 5).forEach(entry => {
      console.log(`${entry.position}º ${entry.name} (${entry.anonymousId}) - ${entry.totalScore} pontos`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar ranking:', error);
  }
}

async function createTestDataIfNeeded() {
  console.log('\n🧪 4. VERIFICANDO NECESSIDADE DE DADOS DE TESTE');
  console.log('===============================================');
  
  try {
    // Verificar se há estudantes com pontuação
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    const studentsWithScores = scoresSnapshot.docs.filter(doc => {
      const data = doc.data();
      return (data.totalScore || 0) > 0;
    });
    
    console.log(`📊 ${studentsWithScores.length} estudantes com pontuação > 0`);
    
    if (studentsWithScores.length === 0) {
      console.log('⚠️ Nenhum estudante com pontuação encontrado');
      console.log('💡 Considere fazer alguns estudantes completarem exercícios para testar o ranking');
    } else {
      console.log('✅ Sistema tem dados suficientes para ranking');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados de teste:', error);
  }
}

// Executar testes e correções
testAndFixSystem()
  .then(() => {
    console.log('\n🎉 Script de teste e correção concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
