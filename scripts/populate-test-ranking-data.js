// Script para popular dados de teste no ranking
// Executa: node scripts/populate-test-ranking-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase (mesma do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

// Inicializar Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('✅ Firebase inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error.message);
  process.exit(1);
}

// Dados de teste para estudantes
const testStudents = [
  {
    id: 'student-001',
    fullName: 'Ana Silva',
    email: 'ana.silva@example.com',
    anonymousId: 'ANA001',
    role: 'student',
    totalScore: 850,
    normalizedScore: 85,
    moduleScores: {
      '1': 90,
      '2': 80,
      'module-1': 90,
      'module-2': 80
    },
    gameScores: {
      '1': 90,
      '4': 80
    }
  },
  {
    id: 'student-002',
    fullName: 'Bruno Santos',
    email: 'bruno.santos@example.com',
    anonymousId: 'BRU002',
    role: 'student',
    totalScore: 920,
    normalizedScore: 92,
    moduleScores: {
      '1': 95,
      '2': 89,
      'module-1': 95,
      'module-2': 89
    },
    gameScores: {
      '1': 95,
      '4': 89
    }
  },
  {
    id: 'student-003',
    fullName: 'Carla Oliveira',
    email: 'carla.oliveira@example.com',
    anonymousId: 'CAR003',
    role: 'student',
    totalScore: 780,
    normalizedScore: 78,
    moduleScores: {
      '1': 82,
      '2': 74,
      'module-1': 82,
      'module-2': 74
    },
    gameScores: {
      '1': 82,
      '4': 74
    }
  },
  {
    id: 'student-004',
    fullName: 'Diego Costa',
    email: 'diego.costa@example.com',
    anonymousId: 'DIG004',
    role: 'student',
    totalScore: 950,
    normalizedScore: 95,
    moduleScores: {
      '1': 98,
      '2': 92,
      'module-1': 98,
      'module-2': 92
    },
    gameScores: {
      '1': 98,
      '4': 92
    }
  },
  {
    id: 'student-005',
    fullName: 'Elena Ferreira',
    email: 'elena.ferreira@example.com',
    anonymousId: 'ELE005',
    role: 'student',
    totalScore: 720,
    normalizedScore: 72,
    moduleScores: {
      '1': 75,
      '2': 69,
      'module-1': 75,
      'module-2': 69
    },
    gameScores: {
      '1': 75,
      '4': 69
    }
  }
];

async function populateTestData() {
  console.log('🚀 Populando dados de teste...\n');

  try {
    for (const student of testStudents) {
      console.log(`📝 Criando dados para ${student.fullName}...`);

      // 1. Criar usuário
      await setDoc(doc(db, 'users', student.id), {
        fullName: student.fullName,
        email: student.email,
        anonymousId: student.anonymousId,
        role: student.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Criar pontuação unificada
      await setDoc(doc(db, 'unified_scores', student.id), {
        studentId: student.id,
        userId: student.id,
        userName: student.fullName,
        totalScore: student.totalScore,
        normalizedScore: student.normalizedScore,
        moduleScores: student.moduleScores,
        gameScores: student.gameScores,
        achievements: [],
        lastActivity: serverTimestamp(),
        streak: 0,
        level: Math.floor(student.totalScore / 100),
        completionRate: student.normalizedScore,
        classRank: 0,
        moduleProgress: {}
      });

      // 3. Criar progresso de jogos
      for (const [gameId, score] of Object.entries(student.gameScores)) {
        await setDoc(doc(db, 'gameProgress', `${student.id}_${gameId}`), {
          userId: student.id,
          gameId: parseInt(gameId),
          score: score,
          maxScore: 100,
          normalizedScore: score,
          completed: true,
          attempts: 1,
          lastAttemptAt: serverTimestamp(),
          completedAt: serverTimestamp(),
          difficulty: 'medium',
          isPersonalBest: true,
          createdAt: serverTimestamp()
        });
      }

      console.log(`   ✅ ${student.fullName} criado com sucesso`);
    }

    console.log('\n🎉 Dados de teste populados com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - ${testStudents.length} estudantes criados`);
    console.log(`   - ${testStudents.length} pontuações unificadas criadas`);
    console.log(`   - ${testStudents.reduce((acc, s) => acc + Object.keys(s.gameScores).length, 0)} progressos de jogos criados`);
    
    console.log('\n🏆 Ranking esperado:');
    const sortedStudents = [...testStudents].sort((a, b) => b.totalScore - a.totalScore);
    sortedStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} - ${student.totalScore} pontos (${student.normalizedScore}%)`);
    });

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  }
}

// Executar
populateTestData().then(() => {
  console.log('\n✅ Script concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});
