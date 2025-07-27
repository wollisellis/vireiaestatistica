// Script para popular dados de ranking usando Firebase CLI
// Executa: node scripts/populate-ranking-via-cli.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Dados de teste para o ranking
const testData = {
  users: [
    {
      id: 'student-001',
      data: {
        fullName: 'Ana Silva',
        email: 'ana.silva@example.com',
        anonymousId: 'ANA001',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: 'student-002',
      data: {
        fullName: 'Bruno Santos',
        email: 'bruno.santos@example.com',
        anonymousId: 'BRU002',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: 'student-003',
      data: {
        fullName: 'Carla Oliveira',
        email: 'carla.oliveira@example.com',
        anonymousId: 'CAR003',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: 'student-004',
      data: {
        fullName: 'Diego Costa',
        email: 'diego.costa@example.com',
        anonymousId: 'DIG004',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    {
      id: 'student-005',
      data: {
        fullName: 'Elena Ferreira',
        email: 'elena.ferreira@example.com',
        anonymousId: 'ELE005',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  ],
  unified_scores: [
    {
      id: 'student-001',
      data: {
        studentId: 'student-001',
        userId: 'student-001',
        userName: 'Ana Silva',
        totalScore: 850,
        normalizedScore: 85,
        moduleScores: { '1': 90, '2': 80, 'module-1': 90, 'module-2': 80 },
        gameScores: { '1': 90, '4': 80 },
        achievements: [],
        lastActivity: new Date().toISOString(),
        streak: 0,
        level: 8,
        completionRate: 85,
        classRank: 3,
        moduleProgress: {}
      }
    },
    {
      id: 'student-002',
      data: {
        studentId: 'student-002',
        userId: 'student-002',
        userName: 'Bruno Santos',
        totalScore: 920,
        normalizedScore: 92,
        moduleScores: { '1': 95, '2': 89, 'module-1': 95, 'module-2': 89 },
        gameScores: { '1': 95, '4': 89 },
        achievements: [],
        lastActivity: new Date().toISOString(),
        streak: 0,
        level: 9,
        completionRate: 92,
        classRank: 2,
        moduleProgress: {}
      }
    },
    {
      id: 'student-003',
      data: {
        studentId: 'student-003',
        userId: 'student-003',
        userName: 'Carla Oliveira',
        totalScore: 780,
        normalizedScore: 78,
        moduleScores: { '1': 82, '2': 74, 'module-1': 82, 'module-2': 74 },
        gameScores: { '1': 82, '4': 74 },
        achievements: [],
        lastActivity: new Date().toISOString(),
        streak: 0,
        level: 7,
        completionRate: 78,
        classRank: 4,
        moduleProgress: {}
      }
    },
    {
      id: 'student-004',
      data: {
        studentId: 'student-004',
        userId: 'student-004',
        userName: 'Diego Costa',
        totalScore: 950,
        normalizedScore: 95,
        moduleScores: { '1': 98, '2': 92, 'module-1': 98, 'module-2': 92 },
        gameScores: { '1': 98, '4': 92 },
        achievements: [],
        lastActivity: new Date().toISOString(),
        streak: 0,
        level: 9,
        completionRate: 95,
        classRank: 1,
        moduleProgress: {}
      }
    },
    {
      id: 'student-005',
      data: {
        studentId: 'student-005',
        userId: 'student-005',
        userName: 'Elena Ferreira',
        totalScore: 720,
        normalizedScore: 72,
        moduleScores: { '1': 75, '2': 69, 'module-1': 75, 'module-2': 69 },
        gameScores: { '1': 75, '4': 69 },
        achievements: [],
        lastActivity: new Date().toISOString(),
        streak: 0,
        level: 7,
        completionRate: 72,
        classRank: 5,
        moduleProgress: {}
      }
    }
  ]
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️ Warning: ${stderr}`);
      }
      console.log(`✅ Sucesso: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function populateData() {
  console.log('🚀 Populando dados de ranking via Firebase CLI...\n');

  try {
    // 1. Popular usuários
    console.log('👥 1. Populando usuários...');
    for (const user of testData.users) {
      const tempFile = path.join(__dirname, `temp-user-${user.id}.json`);
      fs.writeFileSync(tempFile, JSON.stringify(user.data, null, 2));
      
      try {
        await runCommand(`firebase firestore:set users/${user.id} ${tempFile} --project vireiestatistica-ba7c5`);
        console.log(`   ✅ Usuário ${user.data.fullName} criado`);
      } catch (error) {
        console.error(`   ❌ Erro ao criar usuário ${user.data.fullName}:`, error.message);
      }
      
      // Limpar arquivo temporário
      fs.unlinkSync(tempFile);
    }

    // 2. Popular pontuações unificadas
    console.log('\n📊 2. Populando pontuações unificadas...');
    for (const score of testData.unified_scores) {
      const tempFile = path.join(__dirname, `temp-score-${score.id}.json`);
      fs.writeFileSync(tempFile, JSON.stringify(score.data, null, 2));
      
      try {
        await runCommand(`firebase firestore:set unified_scores/${score.id} ${tempFile} --project vireiestatistica-ba7c5`);
        console.log(`   ✅ Pontuação de ${score.data.userName} criada`);
      } catch (error) {
        console.error(`   ❌ Erro ao criar pontuação de ${score.data.userName}:`, error.message);
      }
      
      // Limpar arquivo temporário
      fs.unlinkSync(tempFile);
    }

    console.log('\n🎉 Dados populados com sucesso!');
    console.log('\n🏆 Ranking esperado:');
    const sortedStudents = testData.unified_scores.sort((a, b) => b.data.totalScore - a.data.totalScore);
    sortedStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.data.userName} - ${student.data.totalScore} pontos (${student.data.normalizedScore}%)`);
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
populateData().then(() => {
  console.log('\n✅ Script concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});
