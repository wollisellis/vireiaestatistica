/**
 * Script para gerar anonymousIds para estudantes que não têm
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

function generateAnonymousId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function fixAnonymousIds() {
  console.log('🆔 GERANDO ANONYMOUS IDS PARA ESTUDANTES');
  console.log('=======================================');
  
  try {
    // Buscar todos os estudantes com pontuação
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`📊 Verificando ${scoresSnapshot.size} estudantes com pontuação...`);
    
    const batch = writeBatch(db);
    let fixCount = 0;
    
    for (const scoreDoc of scoresSnapshot.docs) {
      const studentId = scoreDoc.id;
      
      // Verificar se existe dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (!userData.anonymousId) {
          const anonymousId = generateAnonymousId();
          
          console.log(`🔧 Gerando anonymousId para: ${userData.fullName || userData.email || studentId.slice(-6)}`);
          console.log(`   Novo anonymousId: ${anonymousId}`);
          
          const userRef = doc(db, 'users', studentId);
          batch.update(userRef, {
            anonymousId: anonymousId,
            anonymousIdGeneratedAt: new Date(),
            updatedAt: new Date()
          });
          fixCount++;
        } else {
          console.log(`✅ ${userData.fullName || userData.email || studentId.slice(-6)} já tem anonymousId: ${userData.anonymousId}`);
        }
      } else {
        console.log(`⚠️ Estudante sem dados de usuário: ${studentId.slice(-6)}`);
        
        // Criar dados básicos do usuário se não existir
        const userRef = doc(db, 'users', studentId);
        const anonymousId = generateAnonymousId();
        
        batch.set(userRef, {
          fullName: `Estudante ${studentId.slice(-6)}`,
          anonymousId: anonymousId,
          role: 'student',
          createdAt: new Date(),
          anonymousIdGeneratedAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`🔧 Criando usuário e anonymousId: ${anonymousId}`);
        fixCount++;
      }
    }
    
    if (fixCount > 0) {
      console.log(`💾 Aplicando ${fixCount} correções de anonymousId...`);
      await batch.commit();
      console.log('✅ AnonymousIds aplicados!');
    } else {
      console.log('✅ Todos os estudantes já têm anonymousId');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar anonymousIds:', error);
  }
}

async function verifyFinalSystem() {
  console.log('\n🔍 VERIFICAÇÃO FINAL DO SISTEMA');
  console.log('==============================');
  
  try {
    // 1. Verificar ranking atualizado
    console.log('🏆 1. VERIFICANDO RANKING ATUALIZADO:');
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    
    const rankingData = [];
    for (const scoreDoc of scoresSnapshot.docs) {
      const scoreData = scoreDoc.data();
      const studentId = scoreDoc.id;
      
      const userDoc = await getDoc(doc(db, 'users', studentId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      if (userData) {
        rankingData.push({
          name: userData.fullName || 'Estudante',
          anonymousId: userData.anonymousId || 'N/A',
          totalScore: scoreData.totalScore || 0,
          normalizedScore: scoreData.normalizedScore || 0
        });
      }
    }
    
    // Ordenar ranking
    const sortedRanking = rankingData
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, index) => ({ ...entry, position: index + 1 }));
    
    console.log('🏆 RANKING FINAL:');
    sortedRanking.forEach(entry => {
      console.log(`${entry.position}º ${entry.name} (${entry.anonymousId}) - ${entry.totalScore} pontos (normalizada: ${entry.normalizedScore})`);
    });
    
    // 2. Verificar contadores de turmas
    console.log('\n📊 2. VERIFICANDO CONTADORES DE TURMAS:');
    const classesSnapshot = await getDocs(collection(db, 'classes'));
    let totalStudentsInSystem = 0;
    
    for (const classDoc of classesSnapshot.docs) {
      const classData = classDoc.data();
      const studentsCount = classData.studentsCount || 0;
      totalStudentsInSystem += studentsCount;
      
      if (studentsCount > 0) {
        console.log(`   ${classData.name}: ${studentsCount} estudantes`);
      }
    }
    
    console.log(`📊 Total de estudantes em turmas: ${totalStudentsInSystem}`);
    
    // 3. Verificar estudantes com dados completos
    console.log('\n👤 3. VERIFICANDO DADOS DOS ESTUDANTES:');
    let studentsWithCompleteData = 0;
    let studentsWithIncompleteData = 0;
    
    for (const entry of sortedRanking) {
      if (entry.anonymousId !== 'N/A' && entry.name !== 'Estudante') {
        studentsWithCompleteData++;
        console.log(`✅ ${entry.name} (${entry.anonymousId}) - dados completos`);
      } else {
        studentsWithIncompleteData++;
        console.log(`⚠️ ${entry.name} (${entry.anonymousId}) - dados incompletos`);
      }
    }
    
    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`   Estudantes com dados completos: ${studentsWithCompleteData}`);
    console.log(`   Estudantes com dados incompletos: ${studentsWithIncompleteData}`);
    console.log(`   Total de estudantes no ranking: ${sortedRanking.length}`);
    console.log(`   Total de estudantes em turmas: ${totalStudentsInSystem}`);
    
    if (studentsWithIncompleteData === 0 && totalStudentsInSystem > 0) {
      console.log(`\n🎉 SISTEMA TOTALMENTE CORRIGIDO!`);
    } else {
      console.log(`\n⚠️ Sistema ainda precisa de ajustes`);
    }
    
  } catch (error) {
    console.error('❌ Erro na verificação final:', error);
  }
}

// Executar correções
async function runFinalFixes() {
  await fixAnonymousIds();
  await verifyFinalSystem();
}

runFinalFixes()
  .then(() => {
    console.log('\n🎉 Correção final de anonymousIds concluída!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
