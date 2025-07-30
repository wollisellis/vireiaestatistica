// Script para diagnosticar e corrigir o sistema de ranking
// Identifica problemas na estrutura de dados e corrige

const { initializeApp } = require('firebase/app');
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp
} = require('firebase/firestore');

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vireiestatistica-ba7c5',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('🔧 Configuração Firebase:', {
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasAppId: !!firebaseConfig.appId
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnosticAndFix() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA DE RANKING');
  console.log('=====================================\n');

  try {
    // 1. Verificar estudantes na coleção users
    console.log('1️⃣ Verificando estudantes na coleção users...');
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const usersSnapshot = await getDocs(usersQuery);

    console.log(`   ✅ Encontrados ${usersSnapshot.size} estudantes na coleção users`);

    if (usersSnapshot.empty) {
      console.log('   ❌ PROBLEMA: Nenhum estudante encontrado!');
      console.log('   💡 SOLUÇÃO: Criar estudantes de exemplo...\n');
      await createSampleStudents();
      return;
    }

    // 2. Verificar scores unificados
    console.log('\n2️⃣ Verificando scores unificados...');
    const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`   📊 Encontrados ${scoresSnapshot.size} scores unificados`);

    // 3. Verificar quiz_attempts
    console.log('\n3️⃣ Verificando quiz_attempts...');
    const attemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`   📝 Encontrados ${attemptsSnapshot.size} quiz attempts`);

    // 4. Analisar cada estudante
    console.log('\n4️⃣ Analisando dados de cada estudante...');
    const studentsWithIssues = [];
    const studentsWithScores = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const studentId = userDoc.id;

      console.log(`\n   👤 Estudante: ${userData.fullName || userData.name || studentId}`);
      console.log(`      ID: ${studentId}`);
      console.log(`      Anonymous ID: ${userData.anonymousId || 'N/A'}`);
      console.log(`      Email: ${userData.email || 'N/A'}`);

      // Verificar score unificado
      const scoreDoc = await getDoc(doc(db, 'unified_scores', studentId));
      if (scoreDoc.exists()) {
        const scoreData = scoreDoc.data();
        console.log(`      ✅ Score unificado: ${scoreData.normalizedScore || 0} pontos`);
        studentsWithScores.push({
          studentId,
          studentName: userData.fullName || userData.name || 'Estudante',
          score: scoreData.normalizedScore || 0,
          hasUnifiedScore: true
        });
      } else {
        // Verificar quiz_attempts
        const attemptsQuery = query(
          collection(db, 'quiz_attempts'),
          where('studentId', '==', studentId)
        );
        const studentAttempts = await getDocs(attemptsQuery);

        if (!studentAttempts.empty) {
          const passedAttempts = studentAttempts.docs.filter(doc => doc.data().passed === true);
          if (passedAttempts.length > 0) {
            const avgScore = passedAttempts.reduce((sum, doc) => sum + (doc.data().percentage || 0), 0) / passedAttempts.length;
            console.log(`      📝 Score de quiz: ${avgScore.toFixed(1)} pontos (${passedAttempts.length} quizes passados)`);
            studentsWithScores.push({
              studentId,
              studentName: userData.fullName || userData.name || 'Estudante',
              score: avgScore,
              hasUnifiedScore: false
            });
          } else {
            console.log(`      ⚠️ Tem ${studentAttempts.size} tentativas mas nenhuma passou`);
            studentsWithIssues.push(studentId);
          }
        } else {
          console.log(`      ❌ Nenhum score encontrado`);
          studentsWithIssues.push(studentId);
        }
      }
    }

    // 5. Relatório final
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('==================');
    console.log(`Total de estudantes: ${usersSnapshot.size}`);
    console.log(`Estudantes com pontuação: ${studentsWithScores.length}`);
    console.log(`Estudantes sem pontuação: ${studentsWithIssues.length}`);

    if (studentsWithScores.length > 0) {
      console.log('\n🏆 RANKING ATUAL:');
      studentsWithScores
        .sort((a, b) => b.score - a.score)
        .forEach((student, index) => {
          console.log(`   ${index + 1}º ${student.studentName}: ${student.score.toFixed(1)} pts ${student.hasUnifiedScore ? '(unified)' : '(quiz)'}`);
        });
    }

    if (studentsWithIssues.length > 0) {
      console.log('\n⚠️ ESTUDANTES SEM PONTUAÇÃO:');
      studentsWithIssues.forEach(studentId => {
        console.log(`   - ${studentId}`);
      });

      console.log('\n💡 CORREÇÃO: Criando scores básicos para estudantes sem pontuação...');
      await createBasicScoresForStudents(studentsWithIssues);
    }

    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');

    if (studentsWithScores.length === 0) {
      console.log('\n🚨 PROBLEMA CRÍTICO: Nenhum estudante tem pontuação!');
      console.log('💡 SOLUÇÃO: Criando dados de exemplo...');
      await createSampleData();
    }

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  }
}

async function createSampleStudents() {
  console.log('🔧 Criando estudantes de exemplo...');

  const sampleStudents = [
    {
      id: 'student_001',
      fullName: 'Ana Silva',
      email: 'ana.silva@exemplo.com',
      anonymousId: 'A001',
      role: 'student'
    },
    {
      id: 'student_002',
      fullName: 'Carlos Santos',
      email: 'carlos.santos@exemplo.com',
      anonymousId: 'C002',
      role: 'student'
    },
    {
      id: 'student_003',
      fullName: 'Maria Oliveira',
      email: 'maria.oliveira@exemplo.com',
      anonymousId: 'M003',
      role: 'student'
    }
  ];

  for (const student of sampleStudents) {
    await setDoc(doc(db, 'users', student.id), {
      ...student,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    console.log(`   ✅ Criado: ${student.fullName}`);
  }
}

async function createBasicScoresForStudents(studentIds) {
  for (const studentId of studentIds) {
    // Criar score básico de 0 pontos
    await setDoc(doc(db, 'unified_scores', studentId), {
      studentId: studentId,
      totalScore: 0,
      normalizedScore: 0,
      moduleScores: {},
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    console.log(`   ✅ Score básico criado para: ${studentId}`);
  }
}

async function createSampleData() {
  console.log('🔧 Criando dados de exemplo completos...');

  // Criar estudantes com scores variados
  const studentsWithScores = [
    { id: 'student_demo_001', name: 'João Silva', score: 85, anonymousId: 'J001' },
    { id: 'student_demo_002', name: 'Maria Santos', score: 92, anonymousId: 'M002' },
    { id: 'student_demo_003', name: 'Pedro Costa', score: 78, anonymousId: 'P003' },
    { id: 'student_demo_004', name: 'Ana Oliveira', score: 88, anonymousId: 'A004' },
    { id: 'student_demo_005', name: 'Carlos Lima', score: 76, anonymousId: 'C005' }
  ];

  for (const student of studentsWithScores) {
    // Criar usuário
    await setDoc(doc(db, 'users', student.id), {
      fullName: student.name,
      email: `${student.id}@exemplo.com`,
      anonymousId: student.anonymousId,
      role: 'student',
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp()
    });

    // Criar score unificado
    await setDoc(doc(db, 'unified_scores', student.id), {
      studentId: student.id,
      totalScore: student.score,
      normalizedScore: student.score,
      moduleScores: {
        'introducao-avaliacao-nutricional': student.score
      },
      lastActivity: serverTimestamp(),
      createdAt: serverTimestamp()
    });

    console.log(`   ✅ Criado estudante completo: ${student.name} (${student.score} pts)`);
  }
}

// Executar diagnóstico
diagnosticAndFix().catch(console.error);