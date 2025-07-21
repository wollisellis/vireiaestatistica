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
  }> {
    try {
      const lastAttempt = await this.getLastAttempt(studentId, moduleId);
      
      if (!lastAttempt) {
        return { canAttempt: true };
      }

      if (lastAttempt.passed) {
        return {
          canAttempt: true,
          reason: 'Módulo concluído - você pode tentar melhorar sua nota',
          lastAttempt
        };
      }

      // Pode tentar novamente se não passou
      return { canAttempt: true, lastAttempt };

    } catch (error) {
      console.error('Erro ao verificar tentativas:', error);
      return { canAttempt: false, reason: 'Erro interno' };
    }
  }

  /**
   * Processa conclusão do quiz (integração com sistema existente)
   */
  private static async processQuizCompletion(attempt: QuizAttempt): Promise<void> {
    try {
      const { studentId, moduleId, score, timeSpent, passed } = attempt;

      // 1. Atualizar sistema de pontuação unificado
      await unifiedScoringService.updateScore(studentId, {
        moduleId,
        exerciseId: 'randomized-quiz',
        score,
        maxScore: 10,
        timeSpent,
        completed: passed
      });

      // 2. Se passou, marcar módulo como completo
      if (passed) {
        await this.completeModule(studentId, moduleId, attempt);
      }

      // 3. Atualizar ranking em tempo real
      await this.updateStudentRanking(studentId, score, moduleId);

      // 4. Verificar e atribuir conquistas
      await this.checkAndAwardAchievements(studentId, attempt);

      // 5. Limpar sessão ativa
      await this.cleanupSession(attempt.quizId);

    } catch (error) {
      console.error('Erro ao processar conclusão do quiz:', error);
      // Não relançar erro para não afetar a submissão principal
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
      // Atualizar progresso do módulo
      const progressRef = doc(db, 'user_progress', studentId);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        const currentProgress = progressDoc.data();
        const gameProgress = currentProgress.gameProgress || {};
        
        // Marcar módulo como completo
        gameProgress[moduleId] = {
          ...gameProgress[moduleId],
          completed: true,
          score: attempt.score,
          completedAt: Timestamp.now(),
          attempts: attempt.attemptNumber
        };

        await updateDoc(progressRef, {
          gameProgress,
          lastActivity: Timestamp.now()
        });

        console.log(`Módulo ${moduleId} marcado como completo para estudante ${studentId}`);
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