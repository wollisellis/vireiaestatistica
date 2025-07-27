// Script para testar e verificar dados do ranking no Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.split('.')[0] :
      'vireiestatistica-ba7c5'),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRankingData() {
  console.log('🔍 Testando dados do ranking...');
  
  try {
    // 1. Verificar dados na coleção unified_scores
    console.log('\n📊 Verificando coleção unified_scores...');
    const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`Documentos encontrados: ${unifiedScoresSnapshot.size}`);
    
    if (unifiedScoresSnapshot.size > 0) {
      unifiedScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Estudante ${doc.id}:`, {
          totalScore: data.totalScore,
          normalizedScore: data.normalizedScore,
          moduleScores: data.moduleScores,
          lastActivity: data.lastActivity
        });
      });
    } else {
      console.log('❌ Nenhum documento encontrado na coleção unified_scores');
    }

    // 2. Verificar dados na coleção users
    console.log('\n👥 Verificando coleção users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Usuários encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Usuário ${doc.id}:`, {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          anonymousId: data.anonymousId
        });
      });
    }

    // 3. Verificar dados na coleção classStudents
    console.log('\n🎓 Verificando coleção classStudents...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`Matrículas encontradas: ${classStudentsSnapshot.size}`);
    
    if (classStudentsSnapshot.size > 0) {
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Matrícula ${doc.id}:`, {
          studentId: data.studentId,
          classId: data.classId,
          status: data.status,
          enrolledAt: data.enrolledAt
        });
      });
    }

    // 4. Verificar dados na coleção student_module_progress
    console.log('\n📈 Verificando coleção student_module_progress...');
    const progressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    console.log(`Progressos encontrados: ${progressSnapshot.size}`);
    
    if (progressSnapshot.size > 0) {
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Progresso ${doc.id}:`, {
          studentId: data.studentId,
          moduleId: data.moduleId,
          completed: data.completed,
          score: data.score,
          normalizedScore: data.normalizedScore
        });
      });
    }

    // 5. Verificar dados na coleção quiz_attempts
    console.log('\n📝 Verificando coleção quiz_attempts...');
    const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`Tentativas de quiz encontradas: ${quizAttemptsSnapshot.size}`);
    
    if (quizAttemptsSnapshot.size > 0) {
      quizAttemptsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Tentativa ${doc.id}:`, {
          studentId: data.studentId,
          moduleId: data.moduleId,
          score: data.score,
          normalizedScore: data.normalizedScore,
          completed: data.completed
        });
      });
    }

  } catch (error) {
    console.error('❌ Erro ao testar dados do ranking:', error);
  }
}

// Executar teste
testRankingData();
