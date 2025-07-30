// Script simples para criar dados de exemplo usando Firebase Web SDK
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} = require('firebase/firestore');

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vireiestatistica-ba7c5',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSimpleData() {
  console.log('🔧 Criando dados de exemplo simples...');
  console.log('📊 Projeto:', firebaseConfig.projectId);

  try {
    // Dados básicos de estudantes
    const students = [
      { id: 'demo_001', name: 'Ana Silva', anonymousId: 'A001', score: 92 },
      { id: 'demo_002', name: 'Carlos Santos', anonymousId: 'C002', score: 85 },
      { id: 'demo_003', name: 'Maria Oliveira', anonymousId: 'M003', score: 78 },
      { id: 'demo_004', name: 'Pedro Costa', anonymousId: 'P004', score: 88 },
      { id: 'demo_005', name: 'Julia Lima', anonymousId: 'J005', score: 76 }
    ];

    for (const student of students) {
      try {
        // Criar usuário
        await setDoc(doc(db, 'users', student.id), {
          fullName: student.name,
          email: `${student.id}@exemplo.com`,
          anonymousId: student.anonymousId,
          role: 'student',
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        });

        // Criar score
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

        console.log(`   ✅ Criado: ${student.name} (${student.score} pts)`);
        
        // Pequeno delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Erro ao criar ${student.name}:`, error.message);
      }
    }

    console.log('\n🎉 Dados criados com sucesso!');
    console.log('🏆 Ranking esperado:');
    
    students
      .sort((a, b) => b.score - a.score)
      .forEach((student, index) => {
        console.log(`   ${index + 1}º ${student.name} (${student.anonymousId}): ${student.score} pts`);
      });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createSimpleData()
  .then(() => {
    console.log('\n✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });