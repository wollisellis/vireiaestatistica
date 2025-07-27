/**
 * Script para corrigir as pontuações baseado nas melhores tentativas
 * Analisará quiz_attempts e atualizará unified_scores com as maiores pontuações
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, writeBatch, setDoc, getDoc } = require('firebase/firestore');

// Configuração do Firebase
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

async function fixBestScores() {
  console.log('🏆 CORRIGINDO PONTUAÇÕES BASEADO NAS MELHORES TENTATIVAS');
  console.log('======================================================');
  console.log(`🎯 Conectado ao projeto: ${firebaseConfig.projectId}\n`);
  
  try {
    // 1. Buscar todas as tentativas de quiz
    console.log('📊 Buscando tentativas de quiz...');
    const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`✅ ${quizAttemptsSnapshot.size} tentativas encontradas`);
    
    // 2. Agrupar por estudante e módulo
    const studentModuleAttempts = {};
    
    quizAttemptsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const key = `${data.studentId}_${data.moduleId}`;
      
      if (!studentModuleAttempts[key]) {
        studentModuleAttempts[key] = [];
      }
      
      studentModuleAttempts[key].push({
        score: data.score || 0,
        percentage: data.percentage || 0,
        completedAt: data.completedAt?.toDate() || new Date(0),
        ...data
      });
    });
    
    console.log(`📋 ${Object.keys(studentModuleAttempts).length} combinações estudante-módulo encontradas`);
    
    // 3. Calcular melhores pontuações
    const bestScores = {};
    
    Object.keys(studentModuleAttempts).forEach(key => {
      const attempts = studentModuleAttempts[key];
      const [studentId, moduleId] = key.split('_');
      
      // Ordenar por pontuação (maior primeiro)
      attempts.sort((a, b) => (b.score || 0) - (a.score || 0));
      
      const bestAttempt = attempts[0];
      const bestScore = bestAttempt.score || 0;
      
      if (!bestScores[studentId]) {
        bestScores[studentId] = {};
      }
      
      bestScores[studentId][moduleId] = {
        score: bestScore,
        bestScore: bestScore,
        attempts: attempts.length,
        lastAttempt: attempts[0].completedAt,
        isCompleted: bestScore >= 70
      };
      
      console.log(`📈 ${studentId} - ${moduleId}: ${attempts.length} tentativas, melhor: ${bestScore}`);
    });
    
    // 4. Atualizar unified_scores
    console.log('\n💾 Atualizando unified_scores...');
    const batch = writeBatch(db);
    let updateCount = 0;
    
    for (const studentId of Object.keys(bestScores)) {
      const moduleScores = bestScores[studentId];

      // Calcular estatísticas
      const totalScore = Object.values(moduleScores).reduce((sum, mod) => sum + mod.score, 0);
      const completedModules = Object.values(moduleScores).filter(mod => mod.isCompleted).length;
      const normalizedScore = Math.round((totalScore / 100) * 100); // Assumindo 1 módulo de 100 pontos

      console.log(`🔧 Atualizando ${studentId}:`);
      console.log(`   Total Score: ${totalScore}`);
      console.log(`   Completed Modules: ${completedModules}`);
      console.log(`   Normalized Score: ${normalizedScore}`);

      const scoreRef = doc(db, 'unified_scores', studentId);

      // ✅ CORREÇÃO: Verificar se documento existe antes de atualizar
      try {
        const scoreDoc = await getDoc(scoreRef);

        const scoreData = {
          moduleScores: moduleScores,
          totalScore: totalScore,
          completedModules: completedModules,
          normalizedScore: normalizedScore,
          averageScore: completedModules > 0 ? Math.round(totalScore / completedModules) : 0,
          bestScoresCorrectedAt: new Date(),
          updatedAt: new Date()
        };

        if (scoreDoc.exists()) {
          // Documento existe, fazer update
          batch.update(scoreRef, scoreData);
          console.log(`   ✅ Atualizando documento existente`);
        } else {
          // Documento não existe, criar novo
          batch.set(scoreRef, {
            studentId: studentId,
            ...scoreData,
            createdAt: new Date()
          });
          console.log(`   ✨ Criando novo documento`);
        }

        updateCount++;
      } catch (error) {
        console.error(`   ❌ Erro ao processar ${studentId}:`, error.message);
      }
    }
    
    if (updateCount > 0) {
      console.log(`\n💾 Aplicando ${updateCount} atualizações...`);
      await batch.commit();
      console.log('✅ Pontuações atualizadas com sucesso!');
    } else {
      console.log('ℹ️ Nenhuma atualização necessária');
    }
    
    // 5. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    Object.keys(bestScores).forEach(studentId => {
      const moduleScores = bestScores[studentId];
      const totalScore = Object.values(moduleScores).reduce((sum, mod) => sum + mod.score, 0);
      const completedModules = Object.values(moduleScores).filter(mod => mod.isCompleted).length;
      
      console.log(`👤 ${studentId}:`);
      console.log(`   📊 Pontuação Total: ${totalScore}`);
      console.log(`   ✅ Módulos Completados: ${completedModules}/1`);
      console.log(`   🎯 Status: ${completedModules > 0 ? 'COMPLETO' : 'EM PROGRESSO'}`);
      console.log('');
    });
    
    console.log('🎉 CORREÇÃO DE PONTUAÇÕES CONCLUÍDA!');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

// Executar correção
fixBestScores()
  .then(() => {
    console.log('\n🎉 Script de correção de pontuações concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
