// Script para testar e verificar dados do ranking no Firebase
// Executa: node scripts/test-ranking-data.js

const { initializeApp } = require('firebase/app');
const { getFirestore, connectToEmulator, collection, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function testRankingData() {
  console.log('🔍 Verificando dados do ranking...\n');

  try {
    // 1. Verificar coleção unified_scores
    console.log('📊 1. Verificando unified_scores...');
    const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`   Total de documentos: ${unifiedScoresSnapshot.size}`);

    if (unifiedScoresSnapshot.size > 0) {
      console.log('   Primeiros 5 estudantes:');
      let count = 0;
      unifiedScoresSnapshot.forEach(docSnapshot => {
        if (count < 5) {
          const data = docSnapshot.data();
          console.log(`   - ${docSnapshot.id}: Score ${data.totalScore || 0}, Normalizado: ${data.normalizedScore || 0}`);
          console.log(`     Módulos: ${JSON.stringify(data.moduleScores || {})}`);
          console.log(`     Jogos: ${JSON.stringify(data.gameScores || {})}`);
          console.log(`     Última atividade: ${data.lastActivity?.toDate?.() || data.lastActivity}`);
          console.log('');
          count++;
        }
      });
    }

    // 2. Verificar coleção users
    console.log('👥 2. Verificando users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`   Total de usuários: ${usersSnapshot.size}`);

    let studentCount = 0;
    usersSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.role === 'student') {
        studentCount++;
      }
    });
    console.log(`   Estudantes: ${studentCount}`);

    // 3. Verificar coleção gameProgress
    console.log('🎮 3. Verificando gameProgress...');
    const gameProgressSnapshot = await getDocs(collection(db, 'gameProgress'));
    console.log(`   Total de progressos de jogos: ${gameProgressSnapshot.size}`);

    if (gameProgressSnapshot.size > 0) {
      console.log('   Primeiros 3 progressos:');
      let count = 0;
      gameProgressSnapshot.forEach(docSnapshot => {
        if (count < 3) {
          const data = docSnapshot.data();
          console.log(`   - ${docSnapshot.id}: User ${data.userId}, Game ${data.gameId}, Score ${data.score}`);
          count++;
        }
      });
    }

    // 4. Verificar coleção module_progress
    console.log('📚 4. Verificando module_progress...');
    const moduleProgressSnapshot = await getDocs(collection(db, 'module_progress'));
    console.log(`   Total de progressos de módulos: ${moduleProgressSnapshot.size}`);

    // 5. Verificar coleção student_module_progress
    console.log('📖 5. Verificando student_module_progress...');
    const studentModuleProgressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    console.log(`   Total de progressos de estudantes: ${studentModuleProgressSnapshot.size}`);

    // 6. Verificar estudantes com pontuação > 0
    console.log('🏆 6. Estudantes com pontuação > 0:');
    const studentsWithScores = [];
    unifiedScoresSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.totalScore > 0 || data.normalizedScore > 0) {
        studentsWithScores.push({
          id: docSnapshot.id,
          totalScore: data.totalScore || 0,
          normalizedScore: data.normalizedScore || 0,
          moduleScores: data.moduleScores || {},
          gameScores: data.gameScores || {}
        });
      }
    });

    console.log(`   Total de estudantes com pontuação: ${studentsWithScores.length}`);
    studentsWithScores.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.id}:`);
      console.log(`      Total: ${student.totalScore}, Normalizado: ${student.normalizedScore}`);
      console.log(`      Módulos: ${JSON.stringify(student.moduleScores)}`);
      console.log(`      Jogos: ${JSON.stringify(student.gameScores)}`);
      console.log('');
    });

    // 7. Verificar estrutura de dados específica
    console.log('🔧 7. Verificando estrutura de dados...');
    if (studentsWithScores.length > 0) {
      const firstStudent = studentsWithScores[0];
      console.log('   Estrutura do primeiro estudante com pontuação:');
      console.log('   Campos disponíveis:', Object.keys(firstStudent));
      
      // Buscar dados do usuário
      const userDocRef = doc(db, 'users', firstStudent.id);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('   Dados do usuário:');
        console.log(`   - Nome: ${userData.fullName || 'N/A'}`);
        console.log(`   - Email: ${userData.email || 'N/A'}`);
        console.log(`   - Role: ${userData.role || 'N/A'}`);
        console.log(`   - AnonymousId: ${userData.anonymousId || 'N/A'}`);
      }
    }

    // 8. Verificar se há dados de módulos específicos
    console.log('📋 8. Verificando módulos específicos...');
    const moduleIds = ['module-1', 'module-2', 'module-3', '1', '2', '3'];
    for (const moduleId of moduleIds) {
      const studentsWithModule = studentsWithScores.filter(s => s.moduleScores[moduleId] !== undefined);
      if (studentsWithModule.length > 0) {
        console.log(`   Módulo ${moduleId}: ${studentsWithModule.length} estudantes`);
        studentsWithModule.forEach(s => {
          console.log(`     - ${s.id}: ${s.moduleScores[moduleId]} pontos`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  }
}

// Executar teste
testRankingData().then(() => {
  console.log('✅ Verificação concluída');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro na verificação:', error);
  process.exit(1);
});
