// Script para verificar se os dados foram criados
const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'vireiestatistica-ba7c5'
    });
  } catch (error) {
    admin.initializeApp({
      projectId: 'vireiestatistica-ba7c5'
    });
  }
}

const db = admin.firestore();

async function checkData() {
  console.log('🔍 Verificando dados no Firebase...\n');

  try {
    // Verificar users
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .get();
    
    console.log(`📚 Estudantes encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      console.log('\n👥 Lista de estudantes:');
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.fullName} (${doc.id})`);
      });
    }

    // Verificar unified_scores
    const scoresSnapshot = await db.collection('unified_scores').get();
    console.log(`\n📊 Scores encontrados: ${scoresSnapshot.size}`);

    if (scoresSnapshot.size > 0) {
      console.log('\n🏆 Ranking:');
      const scores = [];
      scoresSnapshot.forEach(doc => {
        scores.push({
          id: doc.id,
          score: doc.data().normalizedScore || doc.data().totalScore || 0
        });
      });
      
      scores.sort((a, b) => b.score - a.score);
      scores.forEach((s, idx) => {
        console.log(`   ${idx + 1}º ID: ${s.id} - ${s.score} pts`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

checkData()
  .then(() => {
    console.log('\n✅ Verificação concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro:', error);
    process.exit(1);
  });