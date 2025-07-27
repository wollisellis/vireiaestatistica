// Script para testar dados do ranking conectando diretamente ao Firebase
// Usa as configurações do .env.local

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuração do Firebase usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('🔥 Configuração Firebase:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING'
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testRankingData() {
  console.log('🔍 Iniciando teste dos dados do ranking...\n');
  
  try {
    // Autenticar anonimamente
    console.log('🔐 Autenticando...');
    await signInAnonymously(auth);
    console.log('✅ Autenticado com sucesso\n');
    
    // 1. Verificar dados na coleção unified_scores
    console.log('📊 Verificando coleção unified_scores...');
    const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`Documentos encontrados: ${unifiedScoresSnapshot.size}`);
    
    if (unifiedScoresSnapshot.size > 0) {
      unifiedScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Estudante ${doc.id}:`, {
          totalScore: data.totalScore || 0,
          normalizedScore: data.normalizedScore || 0,
          moduleScores: data.moduleScores || {},
          lastActivity: data.lastActivity ? new Date(data.lastActivity.seconds * 1000).toLocaleString() : 'N/A'
        });
      });
    } else {
      console.log('  ❌ Nenhum documento encontrado na coleção unified_scores');
    }
    console.log('');

    // 2. Verificar dados na coleção users
    console.log('👥 Verificando coleção users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Usuários encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Usuário ${doc.id}:`, {
          fullName: data.fullName || 'N/A',
          email: data.email || 'N/A',
          role: data.role || 'N/A',
          anonymousId: data.anonymousId || 'N/A'
        });
      });
    }
    console.log('');

    // 3. Verificar dados na coleção classStudents
    console.log('🎓 Verificando coleção classStudents...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`Matrículas encontradas: ${classStudentsSnapshot.size}`);
    
    if (classStudentsSnapshot.size > 0) {
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Matrícula ${doc.id}:`, {
          studentId: data.studentId || 'N/A',
          classId: data.classId || 'N/A',
          status: data.status || 'N/A',
          enrolledAt: data.enrolledAt ? new Date(data.enrolledAt.seconds * 1000).toLocaleString() : 'N/A'
        });
      });
    }
    console.log('');

    // 4. Verificar dados na coleção student_module_progress
    console.log('📈 Verificando coleção student_module_progress...');
    const progressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    console.log(`Progressos encontrados: ${progressSnapshot.size}`);
    
    if (progressSnapshot.size > 0) {
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Progresso ${doc.id}:`, {
          studentId: data.studentId || 'N/A',
          moduleId: data.moduleId || 'N/A',
          completed: data.completed || false,
          score: data.score || 0,
          normalizedScore: data.normalizedScore || 0,
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toLocaleString() : 'N/A'
        });
      });
    }
    console.log('');

    // 5. Verificar dados na coleção quiz_attempts
    console.log('📝 Verificando coleção quiz_attempts...');
    const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`Tentativas de quiz encontradas: ${quizAttemptsSnapshot.size}`);
    
    if (quizAttemptsSnapshot.size > 0) {
      quizAttemptsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Tentativa ${doc.id}:`, {
          studentId: data.studentId || 'N/A',
          moduleId: data.moduleId || 'N/A',
          score: data.score || 0,
          normalizedScore: data.normalizedScore || 0,
          completed: data.completed || false,
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toLocaleString() : 'N/A'
        });
      });
    }
    console.log('');

    // 6. Verificar dados na coleção student_exercise_progress
    console.log('🏋️ Verificando coleção student_exercise_progress...');
    const exerciseProgressSnapshot = await getDocs(collection(db, 'student_exercise_progress'));
    console.log(`Progressos de exercícios encontrados: ${exerciseProgressSnapshot.size}`);
    
    if (exerciseProgressSnapshot.size > 0) {
      exerciseProgressSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  Exercício ${doc.id}:`, {
          studentId: data.studentId || 'N/A',
          moduleId: data.moduleId || 'N/A',
          exerciseId: data.exerciseId || 'N/A',
          completed: data.completed || false,
          score: data.score || 0,
          normalizedScore: data.normalizedScore || 0
        });
      });
    }
    console.log('');

    // Resumo
    console.log('📊 RESUMO DOS DADOS:');
    console.log(`  Unified Scores: ${unifiedScoresSnapshot.size}`);
    console.log(`  Users: ${usersSnapshot.size}`);
    console.log(`  Class Students: ${classStudentsSnapshot.size}`);
    console.log(`  Module Progress: ${progressSnapshot.size}`);
    console.log(`  Quiz Attempts: ${quizAttemptsSnapshot.size}`);
    console.log(`  Exercise Progress: ${exerciseProgressSnapshot.size}`);
    console.log('');

    // Análise do problema
    console.log('🔍 ANÁLISE DO PROBLEMA DO RANKING:');
    
    if (unifiedScoresSnapshot.size === 0) {
      console.log('❌ PROBLEMA IDENTIFICADO: Nenhum documento na coleção unified_scores');
      console.log('💡 SOLUÇÃO: Precisa popular a coleção unified_scores com dados dos estudantes');
    }
    
    if (classStudentsSnapshot.size > 0 && unifiedScoresSnapshot.size === 0) {
      console.log('⚠️  Há estudantes matriculados mas sem pontuação unificada');
      console.log('💡 SOLUÇÃO: Executar sincronização dos dados de pontuação');
    }
    
    if (progressSnapshot.size > 0 || quizAttemptsSnapshot.size > 0) {
      console.log('✅ Há dados de progresso/tentativas que podem ser usados para gerar ranking');
    }

    console.log('\n✅ Teste concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao testar dados do ranking:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar teste
testRankingData();
