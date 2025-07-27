// Script para testar dados do ranking dentro do contexto da aplicação
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export async function testRankingData() {
  console.log('🔍 Testando dados do ranking...');
  
  try {
    // 1. Verificar dados na coleção unified_scores
    console.log('\n📊 Verificando coleção unified_scores...');
    const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
    console.log(`Documentos encontrados: ${unifiedScoresSnapshot.size}`);
    
    if (unifiedScoresSnapshot.size > 0) {
      unifiedScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Estudante ${doc.id}:`, {
          totalScore: data.totalScore,
          normalizedScore: data.normalizedScore,
          moduleScores: data.moduleScores,
          lastActivity: data.lastActivity
        });
      });
    } else {
      console.log('❌ Nenhum documento encontrado na coleção unified_scores');
    }

    // 2. Verificar dados na coleção users
    console.log('\n👥 Verificando coleção users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Usuários encontrados: ${usersSnapshot.size}`);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Usuário ${doc.id}:`, {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          anonymousId: data.anonymousId
        });
      });
    }

    // 3. Verificar dados na coleção classStudents
    console.log('\n🎓 Verificando coleção classStudents...');
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    console.log(`Matrículas encontradas: ${classStudentsSnapshot.size}`);
    
    if (classStudentsSnapshot.size > 0) {
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Matrícula ${doc.id}:`, {
          studentId: data.studentId,
          classId: data.classId,
          status: data.status,
          enrolledAt: data.enrolledAt
        });
      });
    }

    // 4. Verificar dados na coleção student_module_progress
    console.log('\n📈 Verificando coleção student_module_progress...');
    const progressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    console.log(`Progressos encontrados: ${progressSnapshot.size}`);
    
    if (progressSnapshot.size > 0) {
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Progresso ${doc.id}:`, {
          studentId: data.studentId,
          moduleId: data.moduleId,
          completed: data.completed,
          score: data.score,
          normalizedScore: data.normalizedScore
        });
      });
    }

    // 5. Verificar dados na coleção quiz_attempts
    console.log('\n📝 Verificando coleção quiz_attempts...');
    const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
    console.log(`Tentativas de quiz encontradas: ${quizAttemptsSnapshot.size}`);
    
    if (quizAttemptsSnapshot.size > 0) {
      quizAttemptsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Tentativa ${doc.id}:`, {
          studentId: data.studentId,
          moduleId: data.moduleId,
          score: data.score,
          normalizedScore: data.normalizedScore,
          completed: data.completed
        });
      });
    }

    return {
      unifiedScores: unifiedScoresSnapshot.size,
      users: usersSnapshot.size,
      classStudents: classStudentsSnapshot.size,
      progress: progressSnapshot.size,
      quizAttempts: quizAttemptsSnapshot.size
    };

  } catch (error) {
    console.error('❌ Erro ao testar dados do ranking:', error);
    throw error;
  }
}

// Função para popular dados de teste se necessário
export async function populateTestRankingData() {
  console.log('🔄 Populando dados de teste para ranking...');
  
  try {
    // Importar o serviço de pontuação unificada
    const { default: unifiedScoringService } = await import('@/services/unifiedScoringService');
    
    // Buscar estudantes matriculados
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    
    if (classStudentsSnapshot.size === 0) {
      console.log('❌ Nenhum estudante matriculado encontrado');
      return;
    }

    console.log(`📚 Encontrados ${classStudentsSnapshot.size} estudantes matriculados`);

    // Para cada estudante, verificar se tem dados de pontuação
    for (const classDoc of classStudentsSnapshot.docs) {
      const classData = classDoc.data();
      const studentId = classData.studentId;
      
      console.log(`🔍 Verificando estudante: ${studentId}`);
      
      // Verificar se já tem pontuação unificada
      const unifiedScoreDoc = await getDoc(doc(db, 'unified_scores', studentId));
      
      if (!unifiedScoreDoc.exists()) {
        console.log(`📝 Criando pontuação unificada para: ${studentId}`);
        
        // Sincronizar dados do estudante
        await unifiedScoringService.syncAllSystems(studentId);
      } else {
        console.log(`✅ Estudante ${studentId} já tem pontuação unificada`);
      }
    }

    console.log('✅ Dados de teste populados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao popular dados de teste:', error);
    throw error;
  }
}
