/**
 * Script para popular o ranking com dados REAIS dos estudantes
 * Busca estudantes matriculados que completaram módulos/jogos
 * Usa Firebase SDK com configuração correta
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuração do Firebase (mesma que está funcionando)
const firebaseConfig = {
  apiKey: "AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0",
  authDomain: "vireiestatistica-ba7c5.firebaseapp.com",
  projectId: "vireiestatistica-ba7c5",
  storageBucket: "vireiestatistica-ba7c5.firebasestorage.app",
  messagingSenderId: "717809660419",
  appId: "1:717809660419:web:564836c9876cf33d2a9436"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findRealStudentData() {
  console.log('🔍 Buscando dados REAIS dos estudantes...\n');

  try {
    // 1. Buscar todos os estudantes matriculados
    console.log('👥 1. Buscando estudantes matriculados...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`   📊 Total de matrículas encontradas: ${classStudentsSnapshot.size}`);

    const enrolledStudents = [];
    classStudentsSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.status === 'accepted' && data.studentId) {
        enrolledStudents.push({
          studentId: data.studentId,
          studentName: data.studentName,
          anonymousId: data.anonymousId,
          classId: data.classId,
          className: data.className
        });
      }
    });

    console.log(`   ✅ Estudantes aceitos encontrados: ${enrolledStudents.length}`);
    enrolledStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.studentName} (${student.anonymousId}) - Turma: ${student.className}`);
    });

    // 2. Buscar progresso de jogos dos estudantes
    console.log('\n🎮 2. Buscando progresso de jogos...');
    const gameProgressSnapshot = await getDocs(collection(db, 'gameProgress'));
    console.log(`   📊 Total de progressos de jogos: ${gameProgressSnapshot.size}`);

    const studentGameScores = {};
    gameProgressSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.userId && data.score && data.completed) {
        if (!studentGameScores[data.userId]) {
          studentGameScores[data.userId] = [];
        }
        studentGameScores[data.userId].push({
          gameId: data.gameId,
          score: data.score,
          normalizedScore: data.normalizedScore || data.score,
          completedAt: data.completedAt
        });
      }
    });

    console.log(`   ✅ Estudantes com progresso de jogos: ${Object.keys(studentGameScores).length}`);

    // 3. Buscar progresso de módulos
    console.log('\n📚 3. Buscando progresso de módulos...');
    const moduleProgressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    console.log(`   📊 Total de progressos de módulos: ${moduleProgressSnapshot.size}`);

    const studentModuleScores = {};
    moduleProgressSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.studentId && data.score && data.isCompleted) {
        if (!studentModuleScores[data.studentId]) {
          studentModuleScores[data.studentId] = [];
        }
        studentModuleScores[data.studentId].push({
          moduleId: data.moduleId,
          score: data.score,
          progress: data.progress,
          completedAt: data.updatedAt
        });
      }
    });

    console.log(`   ✅ Estudantes com progresso de módulos: ${Object.keys(studentModuleScores).length}`);

    // 4. Buscar dados dos usuários
    console.log('\n👤 4. Buscando dados dos usuários...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userData = {};
    usersSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      userData[docSnapshot.id] = {
        fullName: data.fullName,
        email: data.email,
        anonymousId: data.anonymousId,
        role: data.role
      };
    });

    console.log(`   ✅ Dados de usuários carregados: ${Object.keys(userData).length}`);

    // 5. Combinar dados e calcular pontuações reais
    console.log('\n🏆 5. Calculando pontuações reais...');
    const realRankingData = [];

    for (const student of enrolledStudents) {
      const studentId = student.studentId;
      const gameScores = studentGameScores[studentId] || [];
      const moduleScores = studentModuleScores[studentId] || [];
      const user = userData[studentId];

      if (gameScores.length > 0 || moduleScores.length > 0) {
        // Calcular pontuação total
        const totalGameScore = gameScores.reduce((sum, game) => sum + (game.normalizedScore || 0), 0);
        const totalModuleScore = moduleScores.reduce((sum, module) => sum + (module.score || 0), 0);
        const totalScore = totalGameScore + totalModuleScore;

        // Calcular pontuação normalizada (0-100)
        const gameCount = gameScores.length;
        const moduleCount = moduleScores.length;
        const averageScore = (gameCount + moduleCount) > 0 ? totalScore / (gameCount + moduleCount) : 0;
        const normalizedScore = Math.min(100, Math.max(0, averageScore));

        // Preparar dados para unified_scores
        const moduleScoresObj = {};
        moduleScores.forEach(module => {
          moduleScoresObj[module.moduleId] = module.score;
        });

        const gameScoresObj = {};
        gameScores.forEach(game => {
          gameScoresObj[game.gameId] = game.normalizedScore;
        });

        realRankingData.push({
          studentId: studentId,
          studentName: student.studentName || user?.fullName || 'Estudante',
          anonymousId: student.anonymousId || user?.anonymousId || 'N/A',
          totalScore: Math.round(totalScore),
          normalizedScore: Math.round(normalizedScore),
          moduleScores: moduleScoresObj,
          gameScores: gameScoresObj,
          gameCount: gameCount,
          moduleCount: moduleCount,
          className: student.className
        });
      }
    }

    // Ordenar por pontuação
    realRankingData.sort((a, b) => b.totalScore - a.totalScore);

    console.log(`   ✅ Estudantes com pontuação calculada: ${realRankingData.length}`);

    // 6. Exibir ranking real
    console.log('\n🏆 RANKING REAL DOS ESTUDANTES:');
    console.log('================================');
    
    if (realRankingData.length === 0) {
      console.log('❌ NENHUM ESTUDANTE COM PONTUAÇÃO ENCONTRADO!');
      console.log('   - Verifique se há estudantes que completaram jogos ou módulos');
      console.log('   - Pode ser que os dados estejam em outras coleções');
      return false;
    }

    realRankingData.forEach((student, index) => {
      console.log(`${index + 1}. ${student.studentName} (${student.anonymousId})`);
      console.log(`   📊 Pontuação: ${student.totalScore} (${student.normalizedScore}%)`);
      console.log(`   🎮 Jogos: ${student.gameCount} | 📚 Módulos: ${student.moduleCount}`);
      console.log(`   🏫 Turma: ${student.className}`);
      console.log('');
    });

    // 7. Popular unified_scores com dados reais
    console.log('💾 7. Populando unified_scores com dados reais...');

    for (const student of realRankingData) {
      const unifiedScoreRef = doc(db, 'unified_scores', student.studentId);

      const unifiedScoreData = {
        studentId: student.studentId,
        userId: student.studentId,
        userName: student.studentName,
        totalScore: student.totalScore,
        normalizedScore: student.normalizedScore,
        moduleScores: student.moduleScores,
        gameScores: student.gameScores,
        achievements: [],
        lastActivity: serverTimestamp(),
        streak: 0,
        level: Math.floor(student.totalScore / 100) + 1,
        completionRate: student.normalizedScore,
        classRank: 0, // Será calculado depois
        moduleProgress: {}
      };

      try {
        await setDoc(unifiedScoreRef, unifiedScoreData);
        console.log(`   ✅ Salvo: ${student.studentName}`);
      } catch (error) {
        console.log(`   ❌ Erro ao salvar ${student.studentName}: ${error.message}`);
      }
    }

    console.log(`   ✅ ${realRankingData.length} registros processados em unified_scores`);

    return true;

  } catch (error) {
    console.error('❌ Erro ao buscar dados reais:', error);
    return false;
  }
}

// Executar
findRealStudentData().then((success) => {
  if (success) {
    console.log('\n🎉 SUCESSO! Ranking populado com dados REAIS dos estudantes!');
    console.log('   - Agora o ranking mostrará apenas estudantes que realmente completaram atividades');
    console.log('   - Dados baseados em progresso real de jogos e módulos');
  } else {
    console.log('\n❌ Não foi possível encontrar dados suficientes para o ranking');
  }
  console.log('\n✅ Script concluído');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro no script:', error);
  process.exit(1);
});
