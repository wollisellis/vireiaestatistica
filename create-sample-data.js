// Script simples para criar dados de exemplo no Firebase
// Este script cria estudantes e scores de exemplo para testar o ranking

const admin = require('firebase-admin');

// Inicializar Firebase Admin (usando variáveis de ambiente ou service account)
if (!admin.apps.length) {
  try {
    // Tentar usar service account se disponível
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'vireiestatistica-ba7c5'
    });
  } catch (error) {
    // Fallback para usar variáveis de ambiente
    admin.initializeApp({
      projectId: 'vireiestatistica-ba7c5'
    });
  }
}

const db = admin.firestore();

async function createSampleData() {
  console.log('🔧 Criando dados de exemplo para o ranking...');

  try {
    // Dados de estudantes de exemplo
    const sampleStudents = [
      {
        id: 'student_demo_001',
        fullName: 'Ana Silva',
        email: 'ana.silva@exemplo.com',
        anonymousId: 'A001',
        role: 'student',
        score: 92
      },
      {
        id: 'student_demo_002',
        fullName: 'Carlos Santos',
        email: 'carlos.santos@exemplo.com',
        anonymousId: 'C002',
        role: 'student',
        score: 85
      },
      {
        id: 'student_demo_003',
        fullName: 'Maria Oliveira',
        email: 'maria.oliveira@exemplo.com',
        anonymousId: 'M003',
        role: 'student',
        score: 78
      },
      {
        id: 'student_demo_004',
        fullName: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        anonymousId: 'P004',
        role: 'student',
        score: 88
      },
      {
        id: 'student_demo_005',
        fullName: 'Julia Lima',
        email: 'julia.lima@exemplo.com',
        anonymousId: 'J005',
        role: 'student',
        score: 76
      }
    ];

    const batch = db.batch();

    // Criar usuários e scores
    for (const student of sampleStudents) {
      // Criar usuário
      const userRef = db.collection('users').doc(student.id);
      batch.set(userRef, {
        fullName: student.fullName,
        email: student.email,
        anonymousId: student.anonymousId,
        role: student.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastActivity: admin.firestore.FieldValue.serverTimestamp()
      });

      // Criar score unificado
      const scoreRef = db.collection('unified_scores').doc(student.id);
      batch.set(scoreRef, {
        studentId: student.id,
        totalScore: student.score,
        normalizedScore: student.score,
        moduleScores: {
          'introducao-avaliacao-nutricional': student.score
        },
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`   ✅ Preparado: ${student.fullName} (${student.score} pts)`);
    }

    // Executar batch
    await batch.commit();
    console.log('\n🎉 Dados de exemplo criados com sucesso!');
    console.log('🏆 Ranking esperado:');
    
    sampleStudents
      .sort((a, b) => b.score - a.score)
      .forEach((student, index) => {
        console.log(`   ${index + 1}º ${student.fullName} (${student.anonymousId}): ${student.score} pts`);
      });

  } catch (error) {
    console.error('❌ Erro ao criar dados:', error);
  }
}

// Executar
createSampleData()
  .then(() => {
    console.log('\n✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });