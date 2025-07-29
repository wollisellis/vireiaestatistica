const admin = require('firebase-admin');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  
  if (!serviceAccountKey) {
    console.log('❌ FIREBASE_SERVICE_ACCOUNT_KEY não encontrada');
    process.exit(1);
  }

  const serviceAccount = JSON.parse(serviceAccountKey);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugRankingIssue() {
  try {
    console.log('🔍 === DEBUG RANKING ISSUE ===\n');
    
    // 1. Verificar estudantes na coleção users
    console.log('1️⃣ Verificando coleção USERS...');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'student')
      .limit(10)
      .get();
    
    console.log(`📁 Encontrados ${usersSnapshot.size} estudantes na coleção users`);
    
    if (usersSnapshot.empty) {
      console.log('❌ PROBLEMA: Nenhum estudante encontrado na coleção users com role="student"');
      return;
    }
    
    const studentsData = [];
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      studentsData.push({
        id: doc.id,
        name: data.fullName || data.name || data.displayName,
        email: data.email,
        anonymousId: data.anonymousId,
        role: data.role
      });
      console.log(`  👤 ${doc.id} - ${data.fullName || data.name} (${data.anonymousId})`);
    });
    
    // 2. Verificar scores na coleção unified_scores
    console.log('\n2️⃣ Verificando coleção UNIFIED_SCORES...');
    const scoresSnapshot = await db.collection('unified_scores').get();
    console.log(`📊 Encontrados ${scoresSnapshot.size} scores na coleção unified_scores`);
    
    if (scoresSnapshot.empty) {
      console.log('❌ PROBLEMA: Nenhum score encontrado na coleção unified_scores');
    } else {
      scoresSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  📊 ${doc.id} - Score: ${data.normalizedScore || 0}, Módulos: ${Object.keys(data.moduleScores || {}).length}`);
      });
    }
    
    // 3. Verificar tentativas de quiz
    console.log('\n3️⃣ Verificando coleção QUIZ_ATTEMPTS...');
    const attemptsSnapshot = await db.collection('quiz_attempts').limit(10).get();
    console.log(`📝 Encontrados ${attemptsSnapshot.size} attempts na coleção quiz_attempts`);
    
    if (!attemptsSnapshot.empty) {
      attemptsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const studentId = data.studentId;
        const moduleId = data.moduleId;
        const percentage = data.percentage || 0;
        const passed = data.passed;
        console.log(`  📝 ${studentId} - Módulo: ${moduleId}, Score: ${percentage}%, Passou: ${passed}`);
      });
    }
    
    // 4. Teste do método getAllStudentsRanking
    console.log('\n4️⃣ Testando método getAllStudentsRanking...');
    
    const rankingData = [];
    
    for (const student of studentsData) {
      // Buscar score unificado
      const scoreDoc = await db.collection('unified_scores').doc(student.id).get();
      const scoreData = scoreDoc.exists ? scoreDoc.data() : null;
      
      const studentRanking = {
        studentId: student.id,
        studentName: student.name || 'Estudante',
        email: student.email || '',
        anonymousId: student.anonymousId || student.id.slice(-4),
        totalScore: scoreData?.normalizedScore || 0,
        totalNormalizedScore: scoreData?.normalizedScore || 0,
        completedModules: scoreData ? Object.values(scoreData.moduleScores || {}).filter(score => score >= 70).length : 0,
        lastActivity: scoreData?.lastActivity?.toDate?.() || new Date(),
        isCurrentUser: false,
        classRank: 0
      };
      
      rankingData.push(studentRanking);
    }
    
    // Ordenar por pontuação
    rankingData.sort((a, b) => b.totalScore - a.totalScore);
    
    // Atribuir posições
    rankingData.forEach((student, index) => {
      student.classRank = index + 1;
      student.position = index + 1;
    });
    
    console.log('\n🏆 RANKING GERADO:');
    if (rankingData.length === 0) {
      console.log('❌ PROBLEMA: Nenhum estudante no ranking final');
    } else {
      rankingData.forEach(student => {
        console.log(`  ${student.position}º - ID: ${student.anonymousId} - Score: ${student.totalScore} - Módulos: ${student.completedModules}/1`);
      });
    }
    
    // 5. Verificar se há problemas de dados
    console.log('\n5️⃣ DIAGNÓSTICO FINAL:');
    
    if (usersSnapshot.size === 0) {
      console.log('❌ Problema crítico: Nenhum estudante encontrado na coleção users');
    } else if (scoresSnapshot.size === 0) {
      console.log('❌ Problema crítico: Nenhum score encontrado na coleção unified_scores');  
    } else if (rankingData.length === 0) {
      console.log('❌ Problema crítico: Ranking vazio mesmo com dados disponíveis');
    } else {
      console.log('✅ Dados encontrados, ranking deve funcionar');
      console.log(`📊 Total de estudantes no ranking: ${rankingData.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
}

debugRankingIssue();