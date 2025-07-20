// Tipos para o sistema de questões aleatórias estilo Khan Academy
// Projeto: bioestat-platform - Módulo de Avaliação Nutricional

export interface QuestionBank {
  id: string;
  moduleId: string;
  title: string;
  totalQuestions: number;
  questionsPerQuiz: number;
  totalPoints: number;
  passingScore: number; // Porcentagem (70)
  questions: BankQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BankQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  feedback?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  realDataContext?: string;
  timeToAnswer?: number; // segundos sugeridos
}

export interface RandomizedQuiz {
  id: string;
  studentId: string;
  questionBankId: string;
  moduleId: string;
  selectedQuestions: ShuffledQuestion[];
  createdAt: Date;
  seed: string; // Para reproduzibilidade
  timeLimit?: number; // minutos
}

export interface ShuffledQuestion {
  originalId: string;
  text: string;
  shuffledOptions: string[];
  correctOptionIndex: number;
  explanation: string;
  feedback?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  moduleId: string;
  answers: Record<string, string>; // questionId -> selectedAnswer
  score: number; // 0-10
  percentage: number; // 0-100
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // segundos
  feedback: QuestionFeedback[];
  attemptNumber: number;
}

export interface QuestionFeedback {
  questionId: string;
  isCorrect: boolean;
  studentAnswer: string;
  correctAnswer: string;
  explanation: string;
  customFeedback?: string;
  category?: string;
}

export interface ProgressReport {
  score: number;
  percentage: number;
  passed: boolean;
  summary: {
    total: number;
    correct: number;
    incorrect: number;
    timeSpent: number;
    attemptNumber: number;
  };
  recommendations: string[];
  incorrectQuestions: Array<{
    questionId: string;
    category?: string;
    explanation: string;
    feedback?: string;
  }>;
  categoryAnalysis: Array<{
    category: string;
    total: number;
    correct: number;
    percentage: number;
  }>;
}

export interface QuizSession {
  quizId: string;
  studentId: string;
  currentQuestion: number;
  answers: Record<string, string>;
  startedAt: Date;
  lastActivity: Date;
  timeSpent: number;
  isActive: boolean;
}

export interface StudentQuizStats {
  studentId: string;
  moduleId: string;
  totalAttempts: number;
  bestScore: number;
  bestPercentage: number;
  averageScore: number;
  averagePercentage: number;
  totalTimeSpent: number;
  firstAttemptDate: Date;
  lastAttemptDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
}