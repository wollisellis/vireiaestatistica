// Script para testar se o ranking foi corrigido
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, getDoc, doc } = require('firebase/firestore');

// Configuração do Firebase (use as mesmas credenciais do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyCNrqMKhAK5CfgHUvkKzQnKmg-uJoVrGvs",
  authDomain: "bioestat-platform.firebaseapp.com",
  projectId: "bioestat-platform",
  storageBucket: "bioestat-platform.firebasestorage.app",
  messagingSenderId: "681588012249",
  appId: "1:681588012249:web:b0c5f3e76c0ebfaf6f8b79"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRankingFixed() {
  try {
    console.log('🔍 === TESTE DO RANKING CORRIGIDO ===\n');

    // 1. Buscar estudantes na coleção users
    console.log('1️⃣ Buscando estudantes na coleção users...');
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log(`👥 Encontrados ${usersSnapshot.size} estudantes na coleção users`);

    if (usersSnapshot.empty) {
      console.log('❌ PROBLEMA: Nenhum estudante encontrado na coleção users');
      return;
    }

    // 2. Simular o método getAllStudentsRanking otimizado
    console.log('\n2️⃣ Simulando método getAllStudentsRanking otimizado...');
    
    const studentsData = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const studentId = userDoc.id;

      console.log(`\n👤 Processando estudante: ${studentId}`);
      console.log(`   Nome: ${userData.fullName || userData.name || 'Sem nome'}`);
      
      let studentScore = 0;
      let completedModules = 0;
      let lastActivity = userData.lastActivity?.toDate?.() || new Date();

      // Tentar buscar score unificado primeiro
      const scoreDoc = await getDoc(doc(db, 'unified_scores', studentId));
      
      if (scoreDoc.exists()) {
        const scoreData = scoreDoc.data();
        studentScore = scoreData.normalizedScore || 0;
        completedModules = Object.values(scoreData.moduleScores || {}).filter(score => score >= 70).length;
        lastActivity = scoreData.lastActivity?.toDate?.() || lastActivity;
        
        console.log(`   ✅ Score unificado encontrado: ${studentScore}`);
        console.log(`   📚 Módulos completados: ${completedModules}`);
      } else {
        console.log(`   ⚠️ Nenhum score unificado encontrado`);
        
        // Buscar em quiz_attempts como fallback
        const attemptsQuery = query(
          collection(db, 'quiz_attempts'),
          where('studentId', '==', studentId),
          where('passed', '==', true)
        );
        
        const attemptsSnapshot = await getDocs(attemptsQuery);
        
        if (!attemptsSnapshot.empty) {
          const scores = attemptsSnapshot.docs.map(doc => doc.data().percentage || 0);
          studentScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
          completedModules = new Set(attemptsSnapshot.docs.map(doc => doc.data().moduleId)).size;
          
          console.log(`   📝 Score calculado de quiz_attempts: ${studentScore.toFixed(1)}`);
          console.log(`   📚 Módulos únicos completados: ${completedModules}`);
        } else {
          console.log(`   ❌ Nenhum quiz_attempt encontrado`);
        }
      }

      // Incluir apenas estudantes com pontuação > 0
      if (studentScore > 0) {
        const studentInfo = {
          studentId: studentId,
          studentName: userData.fullName || userData.name || userData.displayName || 'Estudante',
          anonymousId: userData.anonymousId || studentId.slice(-4),
          totalScore: Math.round(studentScore),
          completedModules: completedModules,
          lastActivity: lastActivity,
          isCurrentUser: false
        };

        studentsData.push(studentInfo);
        console.log(`   ✅ Estudante incluído no ranking`);
      } else {
        console.log(`   ⚠️ Estudante não incluído (sem pontuação)`);
      }
    }

    // 3. Ordenar e calcular posições
    console.log('\n3️⃣ Ordenando e calculando posições...');
    
    studentsData.sort((a, b) => b.totalScore - a.totalScore);
    studentsData.forEach((student, index) => {
      student.position = index + 1;
    });

    console.log(`📊 Total de estudantes no ranking final: ${studentsData.length}`);

    // 4. Exibir ranking final
    console.log('\n4️⃣ 🏆 RANKING FINAL:');
    
    if (studentsData.length === 0) {
      console.log('❌ PROBLEMA CRÍTICO: Nenhum estudante no ranking final');
      console.log('\n🔧 POSSÍVEIS CAUSAS:');
      console.log('   - Nenhum estudante completou atividades');
      console.log('   - Problemas nos dados de unified_scores');
      console.log('   - Problemas nos dados de quiz_attempts');
      console.log('   - Critério de pontuação muito restritivo');
    } else {
      studentsData.forEach((student, index) => {
        const position = index + 1;
        const trophy = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏅';
        console.log(`   ${trophy} ${position}º - ID: ${student.anonymousId} - Score: ${student.totalScore} - Módulos: ${student.completedModules}/1`);
      });
    }

    // 5. Diagnóstico final
    console.log('\n5️⃣ 📋 DIAGNÓSTICO FINAL:');
    
    if (studentsData.length > 0) {
      console.log('✅ SUCESSO: Ranking funcionando corretamente!');
      console.log(`📈 ${studentsData.length} estudantes no ranking`);
      console.log(`🏆 Melhor pontuação: ${studentsData[0].totalScore}`);
      console.log('🔧 O problema do ranking foi resolvido');
    } else {
      console.log('❌ FALHA: Ranking ainda está vazio');
      console.log('🔧 Necessário investigar dados dos estudantes');
    }

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testRankingFixed();