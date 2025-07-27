import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import unifiedScoringService from '@/services/unifiedScoringService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Iniciando teste dos dados do ranking...');
    
    const results = {
      timestamp: new Date().toISOString(),
      collections: {} as any,
      analysis: [] as string[],
      recommendations: [] as string[]
    };

    // 1. Verificar unified_scores
    console.log('📊 Verificando coleção unified_scores...');
    try {
      const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
      results.collections.unified_scores = {
        count: unifiedScoresSnapshot.size,
        documents: []
      };
      
      unifiedScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        results.collections.unified_scores.documents.push({
          id: doc.id,
          totalScore: data.totalScore || 0,
          normalizedScore: data.normalizedScore || 0,
          moduleScores: data.moduleScores || {},
          lastActivity: data.lastActivity ? new Date(data.lastActivity.seconds * 1000).toISOString() : null
        });
      });
      
      console.log(`unified_scores: ${unifiedScoresSnapshot.size} documentos`);
    } catch (error: any) {
      results.collections.unified_scores = { error: error.message };
      console.error('Erro ao acessar unified_scores:', error);
    }

    // 2. Verificar users
    console.log('👥 Verificando coleção users...');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      results.collections.users = {
        count: usersSnapshot.size,
        documents: []
      };
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        results.collections.users.documents.push({
          id: doc.id,
          fullName: data.fullName || 'N/A',
          email: data.email || 'N/A',
          role: data.role || 'N/A',
          anonymousId: data.anonymousId || 'N/A'
        });
      });
      
      console.log(`users: ${usersSnapshot.size} documentos`);
    } catch (error: any) {
      results.collections.users = { error: error.message };
      console.error('Erro ao acessar users:', error);
    }

    // 3. Verificar classStudents
    console.log('🎓 Verificando coleção classStudents...');
    try {
      const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
      results.collections.classStudents = {
        count: classStudentsSnapshot.size,
        documents: []
      };
      
      classStudentsSnapshot.forEach((doc) => {
        const data = doc.data();
        results.collections.classStudents.documents.push({
          id: doc.id,
          studentId: data.studentId || 'N/A',
          classId: data.classId || 'N/A',
          status: data.status || 'N/A',
          enrolledAt: data.enrolledAt ? new Date(data.enrolledAt.seconds * 1000).toISOString() : null
        });
      });
      
      console.log(`classStudents: ${classStudentsSnapshot.size} documentos`);
    } catch (error: any) {
      results.collections.classStudents = { error: error.message };
      console.error('Erro ao acessar classStudents:', error);
    }

    // 4. Verificar student_module_progress
    console.log('📈 Verificando coleção student_module_progress...');
    try {
      const progressSnapshot = await getDocs(collection(db, 'student_module_progress'));
      results.collections.student_module_progress = {
        count: progressSnapshot.size,
        documents: []
      };
      
      progressSnapshot.forEach((doc) => {
        const data = doc.data();
        results.collections.student_module_progress.documents.push({
          id: doc.id,
          studentId: data.studentId || 'N/A',
          moduleId: data.moduleId || 'N/A',
          completed: data.completed || false,
          score: data.score || 0,
          normalizedScore: data.normalizedScore || 0,
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toISOString() : null
        });
      });
      
      console.log(`student_module_progress: ${progressSnapshot.size} documentos`);
    } catch (error: any) {
      results.collections.student_module_progress = { error: error.message };
      console.error('Erro ao acessar student_module_progress:', error);
    }

    // 5. Verificar quiz_attempts
    console.log('📝 Verificando coleção quiz_attempts...');
    try {
      const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
      results.collections.quiz_attempts = {
        count: quizAttemptsSnapshot.size,
        documents: []
      };
      
      quizAttemptsSnapshot.forEach((doc) => {
        const data = doc.data();
        results.collections.quiz_attempts.documents.push({
          id: doc.id,
          studentId: data.studentId || 'N/A',
          moduleId: data.moduleId || 'N/A',
          score: data.score || 0,
          normalizedScore: data.normalizedScore || 0,
          completed: data.completed || false,
          completedAt: data.completedAt ? new Date(data.completedAt.seconds * 1000).toISOString() : null
        });
      });
      
      console.log(`quiz_attempts: ${quizAttemptsSnapshot.size} documentos`);
    } catch (error: any) {
      results.collections.quiz_attempts = { error: error.message };
      console.error('Erro ao acessar quiz_attempts:', error);
    }

    // Análise dos resultados
    const unifiedScoresCount = results.collections.unified_scores?.count || 0;
    const usersCount = results.collections.users?.count || 0;
    const classStudentsCount = results.collections.classStudents?.count || 0;
    const progressCount = results.collections.student_module_progress?.count || 0;
    const quizAttemptsCount = results.collections.quiz_attempts?.count || 0;

    // Análise do problema
    if (unifiedScoresCount === 0) {
      results.analysis.push('❌ PROBLEMA PRINCIPAL: Coleção unified_scores está vazia');
      results.analysis.push('💡 O ranking depende desta coleção para funcionar');
      
      if (classStudentsCount > 0) {
        results.analysis.push('⚠️ Há estudantes matriculados mas sem pontuação unificada');
        results.recommendations.push('Executar sincronização do sistema de pontuação unificada');
      }
      
      if (progressCount > 0 || quizAttemptsCount > 0) {
        results.analysis.push('✅ Há dados de progresso que podem ser usados para gerar o ranking');
        results.recommendations.push('Popular a coleção unified_scores com base nos dados existentes');
      }
    } else {
      results.analysis.push(`✅ Coleção unified_scores tem ${unifiedScoresCount} documentos`);
      results.analysis.push('🔍 Verificar se o componente de ranking está buscando os dados corretamente');
    }

    if (classStudentsCount === 0) {
      results.analysis.push('❌ Nenhum estudante matriculado encontrado');
      results.recommendations.push('Verificar se há turmas ativas com estudantes matriculados');
    }

    console.log('✅ Teste concluído com sucesso!');
    
    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro ao testar dados do ranking:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao testar dados do ranking',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'populate') {
      console.log('🔄 Iniciando população de dados de teste...');
      
      // Buscar estudantes matriculados
      const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
      console.log(`📚 Encontrados ${classStudentsSnapshot.size} estudantes matriculados`);

      if (classStudentsSnapshot.size === 0) {
        return NextResponse.json(
          { 
            error: 'Nenhum estudante matriculado encontrado',
            message: 'É necessário ter estudantes matriculados para popular os dados'
          },
          { status: 400 }
        );
      }

      const results = [];

      // Para cada estudante, sincronizar dados
      for (const classDoc of classStudentsSnapshot.docs) {
        const classData = classDoc.data();
        const studentId = classData.studentId;
        
        console.log(`🔍 Sincronizando dados para estudante: ${studentId}`);
        
        try {
          // Verificar se já tem pontuação unificada
          const unifiedScoreDoc = await getDoc(doc(db, 'unified_scores', studentId));
          
          if (!unifiedScoreDoc.exists()) {
            console.log(`📝 Criando pontuação unificada para: ${studentId}`);
            await unifiedScoringService.syncAllSystems(studentId);
            results.push({ studentId, action: 'created', success: true });
          } else {
            console.log(`✅ Estudante ${studentId} já tem pontuação unificada`);
            results.push({ studentId, action: 'exists', success: true });
          }
        } catch (error: any) {
          console.error(`❌ Erro ao sincronizar ${studentId}:`, error);
          results.push({ studentId, action: 'error', success: false, error: error.message });
        }
      }

      console.log('✅ População de dados concluída!');
      
      return NextResponse.json({
        message: 'População de dados concluída',
        results,
        timestamp: new Date().toISOString()
      });

    } else {
      return NextResponse.json(
        { error: 'Ação não reconhecida' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro ao processar requisição POST:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar requisição',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
