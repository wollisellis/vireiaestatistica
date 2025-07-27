/**
 * Script para gerar ranking com dados REAIS usando Firebase Admin SDK
 * Usa as credenciais do Firebase CLI para autenticação
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin usando as credenciais padrão do projeto
try {
  admin.initializeApp({
    projectId: 'vireiestatistica-ba7c5'
  });
  console.log('✅ Firebase Admin inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function generateRealRanking() {
  console.log('🔍 GERANDO RANKING COM DADOS REAIS DOS ESTUDANTES');
  console.log('================================================\n');

  try {
    // 1. Buscar estudantes matriculados
    console.log('👥 1. Buscando estudantes matriculados...');
    const classStudentsSnapshot = await db.collection('classStudents').get();
    console.log(`   📊 Total de matrículas: ${classStudentsSnapshot.size}`);

    const enrolledStudents = {};
    classStudentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'accepted' && data.studentId) {
        enrolledStudents[data.studentId] = {
          studentName: data.studentName,
          anonymousId: data.anonymousId,
          className: data.className,
          classId: data.classId
        };
      }
    });

    console.log(`   ✅ Estudantes aceitos: ${Object.keys(enrolledStudents).length}`);
    
    // Mostrar alguns estudantes encontrados
    const studentIds = Object.keys(enrolledStudents).slice(0, 5);
    studentIds.forEach((id, index) => {
      const student = enrolledStudents[id];
      console.log(`   ${index + 1}. ${student.studentName} (${student.anonymousId}) - ${student.className}`);
    });

    // 2. Buscar progresso de jogos
    console.log('\n🎮 2. Buscando progresso de jogos...');
    const gameProgressSnapshot = await db.collection('gameProgress').get();
    console.log(`   📊 Total de registros de jogos: ${gameProgressSnapshot.size}`);

    const studentGameScores = {};
    let completedGamesCount = 0;

    gameProgressSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId && data.score !== undefined && data.completed && enrolledStudents[data.userId]) {
        if (!studentGameScores[data.userId]) {
          studentGameScores[data.userId] = [];
        }
        studentGameScores[data.userId].push({
          gameId: data.gameId,
          score: data.normalizedScore || data.score,
          completedAt: data.completedAt,
          attempts: data.attempts || 1
        });
        completedGamesCount++;
      }
    });

    console.log(`   ✅ Estudantes com jogos completados: ${Object.keys(studentGameScores).length}`);
    console.log(`   ✅ Total de jogos completados: ${completedGamesCount}`);

    // 3. Buscar progresso de módulos
    console.log('\n📚 3. Buscando progresso de módulos...');
    const moduleProgressSnapshot = await db.collection('student_module_progress').get();
    console.log(`   📊 Total de registros de módulos: ${moduleProgressSnapshot.size}`);

    const studentModuleScores = {};
    let completedModulesCount = 0;

    moduleProgressSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.score !== undefined && data.isCompleted && enrolledStudents[data.studentId]) {
        if (!studentModuleScores[data.studentId]) {
          studentModuleScores[data.studentId] = [];
        }
        studentModuleScores[data.studentId].push({
          moduleId: data.moduleId,
          score: data.score,
          progress: data.progress,
          completedAt: data.updatedAt
        });
        completedModulesCount++;
      }
    });

    console.log(`   ✅ Estudantes com módulos completados: ${Object.keys(studentModuleScores).length}`);
    console.log(`   ✅ Total de módulos completados: ${completedModulesCount}`);

    // 4. Buscar quiz attempts (dados adicionais)
    console.log('\n📝 4. Buscando tentativas de quiz...');
    const quizAttemptsSnapshot = await db.collection('quiz_attempts').get();
    console.log(`   📊 Total de tentativas de quiz: ${quizAttemptsSnapshot.size}`);

    const studentQuizScores = {};
    let completedQuizzesCount = 0;

    quizAttemptsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.percentage !== undefined && data.isCompleted && enrolledStudents[data.studentId]) {
        if (!studentQuizScores[data.studentId]) {
          studentQuizScores[data.studentId] = [];
        }
        studentQuizScores[data.studentId].push({
          moduleId: data.moduleId,
          percentage: data.percentage,
          score: data.score || data.percentage,
          completedAt: data.completedAt
        });
        completedQuizzesCount++;
      }
    });

    console.log(`   ✅ Estudantes com quizzes completados: ${Object.keys(studentQuizScores).length}`);
    console.log(`   ✅ Total de quizzes completados: ${completedQuizzesCount}`);

    // 5. Combinar dados e calcular ranking
    console.log('\n🏆 5. Calculando ranking real...');
    const rankingData = [];

    // Obter todos os estudantes que têm alguma atividade
    const allActiveStudents = new Set([
      ...Object.keys(studentGameScores),
      ...Object.keys(studentModuleScores),
      ...Object.keys(studentQuizScores)
    ]);

    console.log(`   📊 Estudantes com atividades: ${allActiveStudents.size}`);

    allActiveStudents.forEach(studentId => {
      const student = enrolledStudents[studentId];
      if (!student) return;

      const gameScores = studentGameScores[studentId] || [];
      const moduleScores = studentModuleScores[studentId] || [];
      const quizScores = studentQuizScores[studentId] || [];

      // Calcular pontuação total
      const totalGameScore = gameScores.reduce((sum, game) => sum + (game.score || 0), 0);
      const totalModuleScore = moduleScores.reduce((sum, module) => sum + (module.score || 0), 0);
      const totalQuizScore = quizScores.reduce((sum, quiz) => sum + (quiz.score || 0), 0);
      
      const totalScore = totalGameScore + totalModuleScore + totalQuizScore;
      const totalActivities = gameScores.length + moduleScores.length + quizScores.length;
      
      // Calcular pontuação normalizada (0-100)
      const normalizedScore = totalActivities > 0 ? Math.round(totalScore / totalActivities) : 0;

      if (totalScore > 0) {
        // Preparar dados estruturados
        const moduleScoresObj = {};
        moduleScores.forEach(module => {
          moduleScoresObj[module.moduleId] = module.score;
        });
        quizScores.forEach(quiz => {
          moduleScoresObj[`quiz_${quiz.moduleId}`] = quiz.score;
        });

        const gameScoresObj = {};
        gameScores.forEach(game => {
          gameScoresObj[game.gameId] = game.score;
        });

        rankingData.push({
          studentId: studentId,
          studentName: student.studentName,
          anonymousId: student.anonymousId,
          className: student.className,
          totalScore: Math.round(totalScore),
          normalizedScore: Math.min(100, Math.max(0, normalizedScore)),
          moduleScores: moduleScoresObj,
          gameScores: gameScoresObj,
          activitiesCount: totalActivities,
          gamesCompleted: gameScores.length,
          modulesCompleted: moduleScores.length,
          quizzesCompleted: quizScores.length
        });
      }
    });

    // Ordenar por pontuação total
    rankingData.sort((a, b) => b.totalScore - a.totalScore);

    console.log(`   ✅ Ranking gerado com ${rankingData.length} estudantes`);

    // 6. Exibir ranking
    console.log('\n🏆 RANKING REAL DOS ESTUDANTES:');
    console.log('===============================');

    if (rankingData.length === 0) {
      console.log('❌ NENHUM ESTUDANTE COM PONTUAÇÃO ENCONTRADO!');
      console.log('   Possíveis causas:');
      console.log('   - Estudantes não completaram atividades ainda');
      console.log('   - Dados podem estar em outras coleções');
      console.log('   - Problemas na estrutura dos dados');
      return false;
    }

    rankingData.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.studentName} (${student.anonymousId})`);
      console.log(`   📊 Pontuação Total: ${student.totalScore} (${student.normalizedScore}%)`);
      console.log(`   🏫 Turma: ${student.className}`);
      console.log(`   📈 Atividades: ${student.activitiesCount} total`);
      console.log(`   🎮 Jogos: ${student.gamesCompleted} | 📚 Módulos: ${student.modulesCompleted} | 📝 Quizzes: ${student.quizzesCompleted}`);
      
      if (Object.keys(student.moduleScores).length > 0) {
        console.log(`   📚 Módulos: ${JSON.stringify(student.moduleScores)}`);
      }
      if (Object.keys(student.gameScores).length > 0) {
        console.log(`   🎮 Jogos: ${JSON.stringify(student.gameScores)}`);
      }
    });

    // 7. Salvar no unified_scores
    console.log('\n💾 7. Salvando no unified_scores...');
    const batch = db.batch();

    for (const student of rankingData) {
      const unifiedScoreRef = db.collection('unified_scores').doc(student.studentId);
      
      const unifiedScoreData = {
        studentId: student.studentId,
        userId: student.studentId,
        userName: student.studentName,
        anonymousId: student.anonymousId,
        totalScore: student.totalScore,
        normalizedScore: student.normalizedScore,
        moduleScores: student.moduleScores,
        gameScores: student.gameScores,
        achievements: [],
        lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        streak: 0,
        level: Math.floor(student.totalScore / 100) + 1,
        completionRate: student.normalizedScore,
        classRank: 0,
        moduleProgress: {},
        activitiesCount: student.activitiesCount,
        gamesCompleted: student.gamesCompleted,
        modulesCompleted: student.modulesCompleted,
        quizzesCompleted: student.quizzesCompleted,
        className: student.className
      };

      batch.set(unifiedScoreRef, unifiedScoreData);
    }

    await batch.commit();
    console.log(`   ✅ ${rankingData.length} registros salvos em unified_scores`);

    return true;

  } catch (error) {
    console.error('❌ Erro ao gerar ranking:', error);
    return false;
  }
}

// Executar
generateRealRanking().then((success) => {
  if (success) {
    console.log('\n🎉 SUCESSO! Ranking gerado com dados REAIS!');
    console.log('   ✅ Apenas estudantes que completaram atividades estão no ranking');
    console.log('   ✅ Dados baseados em progresso real de jogos, módulos e quizzes');
    console.log('   ✅ Dados salvos na coleção unified_scores');
    console.log('\n🚀 Próximo passo: Testar o ranking na aplicação web');
  } else {
    console.log('\n❌ Não foi possível gerar o ranking');
    console.log('   Verifique se há estudantes que completaram atividades');
  }
  
  console.log('\n✅ Script concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});
