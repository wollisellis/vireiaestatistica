// Tipos para o sistema robusto de gerenciamento de turmas

export interface EnhancedClass {
  id: string
  name: string
  description?: string
  semester: string
  year: number
  inviteCode: string
  professorId: string
  professorName: string
  status: 'open' | 'closed' | 'archived'
  maxStudents?: number
  acceptingNewStudents: boolean
  createdAt: Date
  updatedAt: Date
  settings: ClassSettings
  
  // Estatísticas básicas
  studentsCount: number
  activeStudents: number
  totalModules: number
  avgProgress: number
  avgScore: number
  lastActivity?: Date
}

export interface ClassSettings {
  allowLateSubmissions: boolean
  showRanking: boolean
  enableCollaboration: boolean
  modulesAvailable: string[]
  autoGrading: boolean
  maxAttempts?: number
  timeLimit?: number // em minutos
  requireApproval: boolean // aprovação manual de novos alunos
  whitelistEmails?: string[] // emails permitidos
  enrollmentPeriod?: {
    start: Date
    end: Date
  }
}

export interface EnhancedStudentOverview {
  studentId: string
  studentName: string
  email: string
  anonymousId?: string // ID anônimo de 4 dígitos para exibição
  avatarUrl?: string
  enrolledAt: Date
  lastActivity: Date
  status: 'active' | 'inactive' | 'removed'
  role: 'student' | 'monitor'
  
  // Progresso e pontuação
  overallProgress: number
  totalNormalizedScore: number
  classRank: number
  completedModules: number
  totalTimeSpent: number // em minutos
  
  // Estatísticas de engajamento
  activeDays: number
  currentStreak: number
  longestStreak: number
  averageSessionTime: number
  
  // Módulos individuais
  moduleProgress: StudentModuleProgress[]
  
  // Badges e conquistas
  badges: string[]
  achievements: StudentAchievement[]
  
  // Notas do professor
  notes?: string
  
  // 🎯 CAMPOS ADICIONAIS para melhor exibição na interface
  moduleScores?: { [moduleId: string]: number } // Notas específicas por módulo (0-100)
  normalizedScore?: number // Score normalizado para exibição
  name?: string // Campo name para compatibilidade
  totalScore?: number // Campo totalScore para compatibilidade
}

export interface StudentModuleProgress {
  moduleId: string
  moduleName: string
  progress: number // 0-100
  score: number
  maxScore: number
  timeSpent: number
  completedExercises: number
  totalExercises: number
  attempts: number
  bestScore: number
  lastAttempt: Date
  isCompleted: boolean
  
  // Detalhes por exercício
  exercises: StudentExerciseProgress[]
}

export interface StudentExerciseProgress {
  exerciseId: string
  exerciseTitle: string
  completed: boolean
  score: number
  maxScore: number
  attempts: number
  timeSpent: number
  hintsUsed: number
  lastAttempt: Date
  completedAt?: Date
  
  // Métricas detalhadas
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  improvement: number // comparado com tentativa anterior
}

export interface StudentAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'progress' | 'performance' | 'engagement' | 'collaboration'
}

export interface ClassAnalytics {
  id: string
  classId: string
  date: Date
  
  // Métricas básicas
  totalStudents: number
  activeStudents: number
  averageProgress: number
  averageScore: number
  completedModules: number
  totalTimeSpent: number
  
  // Métricas de engajamento
  dailyActiveUsers: number
  weeklyActiveUsers: number
  sessionDuration: number
  retentionRate: number
  
  // Distribuição de progresso
  progressDistribution: {
    range: string // "0-25%", "25-50%", etc.
    count: number
  }[]
  
  // Módulos mais populares
  moduleStats: {
    moduleId: string
    moduleName: string
    completionRate: number
    averageScore: number
    averageTime: number
  }[]
  
  // Exercícios com mais dificuldade
  difficultExercises: {
    exerciseId: string
    exerciseTitle: string
    moduleId: string
    successRate: number
    averageAttempts: number
  }[]
  
  engagementMetrics: EngagementMetrics
}

export interface EngagementMetrics {
  peakHours: { hour: number; activity: number }[]
  weeklyPattern: { day: string; activity: number }[]
  averageSessionsPerWeek: number
  dropoffPoints: string[] // pontos onde alunos param de estudar
}

export interface ClassRanking {
  classId: string
  rankings: {
    overall: RankingEntry[]
    byModule: { [moduleId: string]: RankingEntry[] }
    byEngagement: RankingEntry[]
    byImprovement: RankingEntry[]
  }
  lastUpdated: Date
}

export interface RankingEntry {
  rank: number
  studentId: string
  studentName: string
  score: number
  metric: string // tipo de métrica usada para ranking
  change: number // mudança de posição desde última atualização
  badge?: string
}

export interface ClassFilter {
  status?: 'active' | 'inactive' | 'all'
  progressRange?: { min: number; max: number }
  moduleCompletion?: string[]
  lastActivity?: { days: number }
  sortBy?: 'name' | 'progress' | 'score' | 'lastActivity' | 'enrolledAt'
  sortOrder?: 'asc' | 'desc'
  search?: string
}

export interface ClassExportData {
  classInfo: EnhancedClass
  students: EnhancedStudentOverview[]
  analytics: ClassAnalytics
  rankings: ClassRanking
  exportDate: Date
  format: 'csv' | 'excel' | 'pdf'
}

// Tipos para ações em massa
export interface BulkAction {
  type: 'remove' | 'message' | 'export' | 'updateStatus'
  studentIds: string[]
  data?: any
}

export interface ClassAlert {
  id: string
  classId: string
  type: 'inactive_students' | 'low_progress' | 'high_dropout' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  studentIds?: string[]
  createdAt: Date
  resolved: boolean
  resolvedAt?: Date
}

// Tipos adicionais para compatibilidade com as páginas
export interface ClassEnrollment {
  id: string
  classId: string
  studentId: string
  status: 'active' | 'inactive' | 'removed'
  enrolledAt: Date
  name?: string
  email: string
  totalScore: number
  completedModules: number
  lastActivity?: Date
}

export interface StudentProgress {
  modules: Record<string, {
    completed: boolean
    score: number
    completedAt?: Date
    timeSpent?: number
  }>
  overallProgress: number
  totalScore: number
}

export interface StudentAnalytics {
  totalTimeSpent: number
  averageScore: number
  correctAnswers: number
  totalAttempts: number
  hintsUsed: number
  studySessions: number
  classRank?: number
  preferredStudyTime?: string
  mostActiveDay?: string
  avgSessionTime?: number
  consistencyScore?: number
}