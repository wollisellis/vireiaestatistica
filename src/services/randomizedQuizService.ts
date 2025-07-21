// Serviço principal para gerenciamento de questões aleatórias
// Integração completa com sistema de progresso, ranking e Firebase

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  QuestionBank, 
  RandomizedQuiz, 
  QuizAttempt, 
  QuizSession,
  StudentQuizStats
} from '@/types/randomizedQuiz';
import { QuizShuffler } from '@/utils/quizShuffler';
import { QuizScoringService } from './quizScoringService';
import { module1QuestionBank } from '@/data/questionBanks/module1QuestionBank';
import unifiedScoringService from './unifiedScoringService';

export class RandomizedQuizService {
  private static readonly COLLECTION_QUIZZES = 'randomized_quizzes';
  private static readonly COLLECTION_ATTEMPTS = 'quiz_attempts';
  private static readonly COLLECTION_SESSIONS = 'quiz_sessions';

  /**
   * Gera novo quiz personalizado para um estudante
   */
  static async generateQuizForStudent(
    studentId: string,
    moduleId: string
  ): Promise<RandomizedQuiz> {
    try {
      console.log(`Gerando quiz para estudante ${studentId}, módulo ${moduleId}`);

      // Obter banco de questões
      const questionBank = await this.getQuestionBank(moduleId);
      if (!questionBank) {
        throw new Error(`Banco de questões não encontrado para módulo ${moduleId}`);
      }

      // Verificar se estudante pode fazer nova tentativa
      const canAttempt = await this.canAttemptQuiz(studentId, moduleId);
      if (!canAttempt.canAttempt) {
        throw new Error(canAttempt.reason || 'Não é possível fazer nova tentativa');
      }

      // Gerar seed único para esta tentativa
      const attemptNumber = await this.getNextAttemptNumber(studentId, moduleId);
      const seed = QuizShuffler.generateSeed(studentId, moduleId, attemptNumber);
      
      // Selecionar questões aleatórias (7 de 14)
      const selectedQuestions = QuizShuffler.selectBalancedQuestions(
        questionBank.questions,
        questionBank.questionsPerQuiz,
        seed
      );

      // Embaralhar alternativas de cada questão
      const shuffledQuestions = selectedQuestions.map(question =>
        QuizShuffler.shuffleQuestionOptions(question, seed)
      );

      // Validar embaralhamento
      if (!QuizShuffler.validateShuffling(selectedQuestions, shuffledQuestions)) {
        throw new Error('Falha na validação do embaralhamento das questões');
      }

      const quiz: RandomizedQuiz = {
        id: `quiz_${studentId}_${moduleId}_${Date.now()}`,
        studentId,
        questionBankId: questionBank.id,
        moduleId,
        selectedQuestions: shuffledQuestions,
        createdAt: new Date(),
        seed,
        timeLimit: 30 // 30 minutos
      };

      // Salvar quiz no Firebase
      await this.saveQuiz(quiz);
      
      // Inicializar sessão
      await this.initializeSession(quiz.id, studentId);

      console.log(`Quiz ${quiz.id} gerado com sucesso`);
      return quiz;

    } catch (error) {
      console.error('Erro ao gerar quiz:', error);
      throw error;
    }
  }

  /**
   * Submete tentativa e processa resultado
   */
  static async submitQuizAttempt(
    quizId: string,
    studentId: string,
    answers: Record<string, string>,
    timeSpent: number
  ): Promise<QuizAttempt> {
    try {
      console.log(`Submetendo tentativa do quiz ${quizId} para estudante ${studentId}`);

      // Carregar quiz
      const quiz = await this.getQuiz(quizId);
      if (!quiz) {
        throw new Error('Quiz não encontrado');
      }

      if (quiz.studentId !== studentId) {
        throw new Error('Quiz não pertence ao estudante');
      }

      // Obter número da tentativa
      const attemptNumber = await this.getNextAttemptNumber(studentId, quiz.moduleId);

      // Calcular pontuação
      const attempt = QuizScoringService.calculateScore(
        answers,
        quiz,
        10, // total de pontos
        attemptNumber
      );

      // Definir tempo gasto
      attempt.timeSpent = timeSpent;
      attempt.completedAt = new Date();

      // Salvar tentativa
      await this.saveAttempt(attempt);

      // Processar conclusão (atualizar progresso, ranking, etc.)
      await this.processQuizCompletion(attempt);

      console.log(`Tentativa processada: ${attempt.percentage}% (${attempt.passed ? 'PASSOU' : 'NÃO PASSOU'})`);
      return attempt;

    } catch (error) {
      console.error('Erro ao submeter tentativa:', error);
      throw error;
    }
  }

  /**
   * Verifica se estudante pode fazer nova tentativa
   */
  static async canAttemptQuiz(studentId: string, moduleId: string): Promise<{
    canAttempt: boolean;
    reason?: string;
    lastAttempt?: QuizAttempt;
    bestAttempt?: QuizAttempt;
  }> {
    try {
      const lastAttempt = await this.getLastAttempt(studentId, moduleId);
      const bestAttempt = await this.getBestAttempt(studentId, moduleId);
      
      if (!lastAttempt) {
        return { canAttempt: true };
      }

      if (lastAttempt.passed || (bestAttempt && bestAttempt.passed)) {
        return {
          canAttempt: true,
          reason: 'Módulo concluído - você pode tentar melhorar sua nota',
          lastAttempt,
          bestAttempt
        };
      }

      // Pode tentar novamente se não passou
      return { canAttempt: true, lastAttempt, bestAttempt };

    } catch (error) {
      console.error('Erro ao verificar tentativas:', error);
      return { canAttempt: false, reason: 'Erro interno' };
    }
  }

  /**
   * 🚀 CORREÇÃO: Processa conclusão do quiz com sincronização completa
   */
  private static async processQuizCompletion(attempt: QuizAttempt): Promise<void> {
    try {
      const { studentId, moduleId, score, timeSpent, passed, percentage } = attempt;

      console.log(`🔄 Iniciando sincronização completa para ${studentId} - Módulo: ${moduleId}`);

      // 🎯 OPERAÇÃO ATÔMICA: Usar batch para sincronizar todas as fontes
      const batch = writeBatch(db);

      // 1. Sistema de pontuação unificado (fonte principal)
      await unifiedScoringService.updateExerciseScore(
        studentId,
        moduleId,
        'randomized-quiz',
        score,
        10
      );
      console.log(`✅ Sistema unificado atualizado: ${score} pts`);

      // 2. Atualizar userProgress (compatibilidade com página /jogos)
      const progressRef = doc(db, 'userProgress', studentId);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentProgress = progressDoc.data();
        const modules = currentProgress.modules || {};
        
        // Manter a melhor pontuação
        const existingModule = modules[moduleId];
        const bestScore = existingModule?.totalScore ? Math.max(existingModule.totalScore, score) : score;
        const bestPercentage = existingModule?.percentage ? Math.max(existingModule.percentage, percentage) : percentage;
        
        modules[moduleId] = {
          ...modules[moduleId],
          totalScore: bestScore,
          score: bestScore, // Ambos os formatos para compatibilidade
          percentage: bestPercentage,
          completed: bestPercentage >= 70, // Critério padronizado
          lastAccessed: Timestamp.now()
        };

        batch.update(progressRef, {
          modules,
          lastActivity: Timestamp.now()
        });
        console.log(`✅ userProgress atualizado: ${bestScore} pts (${bestPercentage}%)`);
      } else {
        // Criar documento se não existe
        batch.set(progressRef, {
          modules: {
            [moduleId]: {
              totalScore: score,
              score: score,
              percentage: percentage,
              completed: percentage >= 70,
              lastAccessed: Timestamp.now()
            }
          },
          lastActivity: Timestamp.now()
        });
        console.log(`✅ userProgress criado: ${score} pts (${percentage}%)`);
      }

      // 3. Atualizar moduleProgress (compatibilidade com ranking)
      const moduleProgressRef = doc(db, 'student_module_progress', `${studentId}_${moduleId}`);
      batch.set(moduleProgressRef, {
        studentId,
        moduleId,
        score: score,
        maxScore: 10,
        progress: percentage,
        timeSpent: timeSpent || 0,
        attempts: 1, // Simplificado
        bestScore: score,
        isCompleted: percentage >= 70,
        lastAttempt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
      console.log(`✅ moduleProgress atualizado para ranking`);

      // 4. Executar batch atomicamente
      await batch.commit();
      console.log(`🎉 Sincronização completa finalizada para ${studentId}`);

      // 5. Operações não-críticas (podem falhar sem afetar dados principais)
      try {
        // Atualizar ranking em tempo real
        await this.updateStudentRanking(studentId, score, moduleId);
        
        // Verificar e atribuir conquistas
        await this.checkAndAwardAchievements(studentId, attempt);
        
        // Limpar sessão ativa
        await this.cleanupSession(attempt.quizId);
        
        console.log(`✅ Operações secundárias completadas`);
      } catch (secondaryError) {
        console.warn('Erro em operações secundárias (não crítico):', secondaryError);
      }

    } catch (error) {
      console.error('❌ ERRO CRÍTICO na sincronização:', error);
      // Não relançar erro para não afetar a submissão principal
      // TODO: Implementar retry automático ou notificação de erro
    }
  }

  /**
   * Marca módulo como completo no sistema de progresso
   */
  private static async completeModule(
    studentId: string, 
    moduleId: string, 
    attempt: QuizAttempt
  ): Promise<void> {
    try {
      // Buscar a melhor tentativa para registrar sempre a maior pontuação
      const bestAttempt = await this.getBestAttempt(studentId, moduleId);
      const scoreToUse = bestAttempt ? Math.max(bestAttempt.score, attempt.score) : attempt.score;
      const percentageToUse = bestAttempt ? Math.max(bestAttempt.percentage, attempt.percentage) : attempt.percentage;
      
      // Atualizar progresso do módulo
      const progressRef = doc(db, 'user_progress', studentId);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentProgress = progressDoc.data();
        const gameProgress = currentProgress.gameProgress || {};
        
        // Manter a melhor pontuação existente se for maior que a atual
        const existingModule = gameProgress[moduleId];
        const bestScore = existingModule?.score ? Math.max(existingModule.score, scoreToUse) : scoreToUse;
        const bestPercentage = existingModule?.percentage ? Math.max(existingModule.percentage, percentageToUse) : percentageToUse;
        
        // Marcar módulo como completo com a melhor pontuação
        gameProgress[moduleId] = {
          ...gameProgress[moduleId],
          completed: true,
          score: bestScore,
          percentage: bestPercentage,
          completedAt: existingModule?.completedAt || Timestamp.now(), // Manter primeira conclusão
          lastAttemptAt: Timestamp.now(), // Sempre atualizar última tentativa
          attempts: attempt.attemptNumber,
          totalAttempts: (existingModule?.totalAttempts || 0) + 1
        };

        await updateDoc(progressRef, {
          gameProgress,
          lastActivity: Timestamp.now()
        });

        console.log(`Módulo ${moduleId} atualizado para estudante ${studentId} - Melhor score: ${bestScore} (${bestPercentage}%)`);
      }
    } catch (error) {
      console.error('Erro ao marcar módulo como completo:', error);
    }
  }

  /**
   * Atualiza ranking do estudante
   */
  private static async updateStudentRanking(
    studentId: string, 
    newScore: number,
    moduleId: string
  ): Promise<void> {
    try {
      // Integrar com sistema de ranking existente
      // Buscar turmas do estudante e atualizar ranking
      const classesQuery = query(
        collection(db, 'classStudents'),
        where('studentId', '==', studentId),
        where('status', '==', 'active')
      );

      const classesSnapshot = await getDocs(classesQuery);
      
      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();
        const classId = classDoc.id.split('_')[0]; // Extrair classId do docId
        
        // Atualizar estatísticas da turma (implementar conforme necessário)
        console.log(`Atualizando ranking para turma ${classId}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
    }
  }

  /**
   * Verifica e atribui conquistas
   */
  private static async checkAndAwardAchievements(
    studentId: string,
    attempt: QuizAttempt
  ): Promise<void> {
    try {
      const achievements = [];

      // Primeira tentativa com 100%
      if (attempt.percentage === 100 && attempt.attemptNumber === 1) {
        achievements.push('perfect-first-try');
      }

      // Completou rapidamente
      if (attempt.timeSpent < 300) { // menos de 5 minutos
        achievements.push('speed-demon');
      }

      // Persistência (múltiplas tentativas)
      if (attempt.attemptNumber > 3 && attempt.passed) {
        achievements.push('persistent-learner');
      }

      // Nota alta
      if (attempt.percentage >= 90) {
        achievements.push('excellence');
      }

      // Implementar sistema de conquistas conforme necessário
      console.log(`Conquistas potenciais para ${studentId}:`, achievements);

    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
    }
  }

  /**
   * Obtém banco de questões por módulo
   */
  private static async getQuestionBank(moduleId: string): Promise<QuestionBank | null> {
    try {
      // Por enquanto, retornar banco local do módulo 1
      if (moduleId === 'module-1') {
        return module1QuestionBank;
      }
      
      // TODO: Implementar busca de outros módulos no Firebase
      return null;
    } catch (error) {
      console.error('Erro ao obter banco de questões:', error);
      return null;
    }
  }

  /**
   * Salva quiz no Firebase
   */
  private static async saveQuiz(quiz: RandomizedQuiz): Promise<void> {
    const quizRef = doc(db, this.COLLECTION_QUIZZES, quiz.id);
    await setDoc(quizRef, {
      ...quiz,
      createdAt: Timestamp.fromDate(quiz.createdAt)
    });
  }

  /**
   * Carrega quiz do Firebase
   */
  private static async getQuiz(quizId: string): Promise<RandomizedQuiz | null> {
    try {
      const quizRef = doc(db, this.COLLECTION_QUIZZES, quizId);
      const quizDoc = await getDoc(quizRef);
      
      if (!quizDoc.exists()) {
        return null;
      }

      const data = quizDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate()
      } as RandomizedQuiz;
    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      return null;
    }
  }

  /**
   * Salva tentativa no Firebase
   */
  private static async saveAttempt(attempt: QuizAttempt): Promise<void> {
    const attemptRef = doc(db, this.COLLECTION_ATTEMPTS, attempt.id);
    await setDoc(attemptRef, {
      ...attempt,
      startedAt: Timestamp.fromDate(attempt.startedAt),
      completedAt: attempt.completedAt ? Timestamp.fromDate(attempt.completedAt) : null
    });
  }

  /**
   * Obtém última tentativa do estudante
   */
  private static async getLastAttempt(
    studentId: string, 
    moduleId: string
  ): Promise<QuizAttempt | null> {
    try {
      const attemptsQuery = query(
        collection(db, this.COLLECTION_ATTEMPTS),
        where('studentId', '==', studentId),
        where('moduleId', '==', moduleId),
        orderBy('startedAt', 'desc'),
        limit(1)
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (attemptsSnapshot.empty) {
        return null;
      }

      const attemptData = attemptsSnapshot.docs[0].data();
      return {
        ...attemptData,
        startedAt: attemptData.startedAt.toDate(),
        completedAt: attemptData.completedAt?.toDate()
      } as QuizAttempt;
    } catch (error) {
      console.error('Erro ao obter última tentativa:', error);
      return null;
    }
  }

  /**
   * Obtém próximo número de tentativa
   */
  private static async getNextAttemptNumber(
    studentId: string, 
    moduleId: string
  ): Promise<number> {
    try {
      const attemptsQuery = query(
        collection(db, this.COLLECTION_ATTEMPTS),
        where('studentId', '==', studentId),
        where('moduleId', '==', moduleId)
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      return attemptsSnapshot.size + 1;
    } catch (error) {
      console.error('Erro ao obter número da tentativa:', error);
      return 1;
    }
  }

  /**
   * Inicializa sessão de quiz
   */
  private static async initializeSession(quizId: string, studentId: string): Promise<void> {
    const session: QuizSession = {
      quizId,
      studentId,
      currentQuestion: 0,
      answers: {},
      startedAt: new Date(),
      lastActivity: new Date(),
      timeSpent: 0,
      isActive: true
    };

    const sessionRef = doc(db, this.COLLECTION_SESSIONS, `${studentId}_${quizId}`);
    await setDoc(sessionRef, {
      ...session,
      startedAt: Timestamp.fromDate(session.startedAt),
      lastActivity: Timestamp.fromDate(session.lastActivity)
    });
  }

  /**
   * Limpa sessão após conclusão
   */
  private static async cleanupSession(quizId: string): Promise<void> {
    try {
      // Implementar limpeza de sessão se necessário
      console.log(`Limpando sessão do quiz ${quizId}`);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }

  /**
   * Obtém melhor tentativa do estudante (maior pontuação)
   */
  private static async getBestAttempt(
    studentId: string, 
    moduleId: string
  ): Promise<QuizAttempt | null> {
    try {
      const attemptsQuery = query(
        collection(db, this.COLLECTION_ATTEMPTS),
        where('studentId', '==', studentId),
        where('moduleId', '==', moduleId),
        orderBy('percentage', 'desc'), // Ordenar por percentual decrescente
        limit(1)
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (attemptsSnapshot.empty) {
        return null;
      }

      const attemptData = attemptsSnapshot.docs[0].data();
      return {
        ...attemptData,
        startedAt: attemptData.startedAt.toDate(),
        completedAt: attemptData.completedAt?.toDate()
      } as QuizAttempt;
    } catch (error) {
      console.error('Erro ao obter melhor tentativa:', error);
      return null;
    }
  }

  /**
   * Obtém estatísticas do estudante
   */
  static async getStudentStats(
    studentId: string, 
    moduleId: string
  ): Promise<StudentQuizStats | null> {
    try {
      const attemptsQuery = query(
        collection(db, this.COLLECTION_ATTEMPTS),
        where('studentId', '==', studentId),
        where('moduleId', '==', moduleId),
        orderBy('startedAt', 'asc')
      );

      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (attemptsSnapshot.empty) {
        return null;
      }

      const attempts = attemptsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startedAt: data.startedAt.toDate(),
          completedAt: data.completedAt?.toDate()
        } as QuizAttempt;
      });

      return QuizScoringService.calculateStudentStats(attempts);
    } catch (error) {
      console.error('Erro ao obter estatísticas do estudante:', error);
      return null;
    }
  }
}