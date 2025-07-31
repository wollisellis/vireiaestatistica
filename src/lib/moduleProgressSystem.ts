// Sistema de Progresso e Pontuação por Módulo - AvaliaNutri Platform
// Created by Ellis Abhulime - UNICAMP

import { modules } from '@/data/modules'
import { AdvancedScoringSystem, QuestionMetrics } from './scoringSystem'

export interface ExerciseProgress {
  exerciseId: string
  completed: boolean
  score: number
  maxScore: number
  normalizedScore: number // 0-100
  attempts: number
  timeSpent: number
  completedAt?: Date
  lastAttemptAt: Date
  questionMetrics?: QuestionMetrics[]
  bestScore: number
  improvement: number // Percentual de melhoria desde primeira tentativa
}

export interface ModuleProgress {
  moduleId: string
  moduleName: string
  isUnlocked: boolean
  isCompleted: boolean
  totalScore: number
  maxPossibleScore: number
  normalizedScore: number // 0-100 baseado na conclusão dos exercícios
  completionPercentage: number // 0-100 baseado em exercícios completados
  exercises: ExerciseProgress[]
  timeSpent: number
  startedAt?: Date
  completedAt?: Date
  lastActivityAt: Date
  streakDays: number
  perfectExercises: number // Exercícios com 100% de acerto
  averageAttempts: number
}

export interface StudentModuleProgress {
  studentId: string
  studentName: string
  modules: ModuleProgress[]
  totalNormalizedScore: number // Soma dos módulos concluídos (0-400)
  overallProgress: number // 0-100 baseado na conclusão de todos os módulos
  currentStreak: number
  longestStreak: number
  totalTimeSpent: number
  lastActivity: Date
  achievementLevel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert'
  isActive: boolean
  ranking: {
    position: number
    category: string // Por classe ou geral
    percentile: number
  }
}

export class ModuleProgressSystem {
  private static readonly COMPLETION_THRESHOLD = 0 // Qualquer pontuação é aceita para conclusão
  private static readonly MODULE_COMPLETION_THRESHOLD = 0 // Qualquer progresso completa o módulo
  private static readonly PERFECT_SCORE_THRESHOLD = 95 // 95%+ para considerar perfeito
  
  // Calcular progresso de um exercício
  static calculateExerciseProgress(
    exerciseId: string,
    questionMetrics: QuestionMetrics[],
    timeSpent: number,
    previousProgress?: ExerciseProgress
  ): ExerciseProgress {
    const exercise = this.findExerciseById(exerciseId)
    if (!exercise) throw new Error(`Exercício ${exerciseId} não encontrado`)

    // Calcular pontuação usando sistema avançado
    const scoreCalculation = AdvancedScoringSystem.calculateScore(
      questionMetrics,
      timeSpent,
      false // Não colaborativo por padrão
    )
    
    const normalizedScore = AdvancedScoringSystem.calculateNormalizedScore(scoreCalculation)
    const maxScore = exercise.points
    
    // Calcular melhoria
    const firstAttemptScore = previousProgress?.bestScore || 0
    const improvement = firstAttemptScore > 0 
      ? ((normalizedScore - firstAttemptScore) / firstAttemptScore) * 100 
      : 0

    const attempts = (previousProgress?.attempts || 0) + 1
    const bestScore = Math.max(previousProgress?.bestScore || 0, normalizedScore)
    const completed = attempts > 0 // Considera completo se teve pelo menos uma tentativa

    return {
      exerciseId,
      completed,
      score: scoreCalculation.finalScore,
      maxScore,
      normalizedScore,
      attempts,
      timeSpent,
      completedAt: completed ? new Date() : undefined,
      lastAttemptAt: new Date(),
      questionMetrics,
      bestScore,
      improvement
    }
  }

  // Calcular progresso de um módulo
  static calculateModuleProgress(
    moduleId: string,
    exerciseProgresses: ExerciseProgress[],
    previousModuleProgress?: ModuleProgress
  ): ModuleProgress {
    const module = modules.find(m => m.id === moduleId)
    if (!module) throw new Error(`Módulo ${moduleId} não encontrado`)

    // Exercícios do módulo
    const moduleExercises = module.exercises.map(exercise => {
      const existingProgress = exerciseProgresses.find(ep => ep.exerciseId === exercise.id)
      return existingProgress || this.createEmptyExerciseProgress(exercise.id, exercise.points)
    })

    // Cálculos de progresso
    const completedExercises = moduleExercises.filter(ex => ex.completed)
    const totalExercises = moduleExercises.length
    const completionPercentage = Math.round((completedExercises.length / totalExercises) * 100)
    
    // Pontuação total
    const totalScore = moduleExercises.reduce((sum, ex) => sum + ex.score, 0)
    const maxPossibleScore = moduleExercises.reduce((sum, ex) => sum + ex.maxScore, 0)
    
    // Pontuação normalizada (0-100) baseada na média dos exercícios completados
    const completedScores = completedExercises.map(ex => ex.normalizedScore)
    const normalizedScore = completedScores.length > 0 
      ? Math.round(completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length)
      : 0

    // Tempo total gasto
    const timeSpent = moduleExercises.reduce((sum, ex) => sum + ex.timeSpent, 0)
    
    // Módulo está completo se houver alguma tentativa nos exercícios
    const isCompleted = moduleExercises.some(ex => ex.attempts > 0)
    
    // Estatísticas adicionais
    const perfectExercises = moduleExercises.filter(ex => 
      ex.normalizedScore >= this.PERFECT_SCORE_THRESHOLD
    ).length
    
    const totalAttempts = moduleExercises.reduce((sum, ex) => sum + ex.attempts, 0)
    const averageAttempts = totalExercises > 0 ? totalAttempts / totalExercises : 0

    // Calcular streak (dias consecutivos)
    const streakDays = this.calculateStreakDays(moduleExercises)

    return {
      moduleId,
      moduleName: module.title,
      isUnlocked: !module.isLocked,
      isCompleted,
      totalScore,
      maxPossibleScore,
      normalizedScore,
      completionPercentage,
      exercises: moduleExercises,
      timeSpent,
      startedAt: previousModuleProgress?.startedAt || this.getFirstActivityDate(moduleExercises),
      completedAt: isCompleted ? new Date() : undefined,
      lastActivityAt: this.getLastActivityDate(moduleExercises),
      streakDays,
      perfectExercises,
      averageAttempts
    }
  }

  // Calcular progresso geral do estudante
  static calculateStudentProgress(
    studentId: string,
    studentName: string,
    moduleProgresses: ModuleProgress[]
  ): StudentModuleProgress {
    // Módulos completados
    const completedModules = moduleProgresses.filter(mp => mp.isCompleted)
    
    // Pontuação total normalizada (soma dos módulos completados)
    const totalNormalizedScore = completedModules.reduce((sum, mp) => sum + mp.normalizedScore, 0)
    
    // Progresso geral (0-100 baseado na conclusão de todos os módulos)
    const overallProgress = Math.round((completedModules.length / modules.length) * 100)
    
    // Tempo total gasto
    const totalTimeSpent = moduleProgresses.reduce((sum, mp) => sum + mp.timeSpent, 0)
    
    // Streak atual e mais longo
    const streaks = moduleProgresses.map(mp => mp.streakDays)
    const currentStreak = Math.max(...streaks, 0)
    const longestStreak = currentStreak // Simplificado por ora
    
    // Última atividade
    const lastActivities = moduleProgresses.map(mp => mp.lastActivityAt).filter(Boolean)
    const lastActivity = lastActivities.length > 0 
      ? new Date(Math.max(...lastActivities.map(d => d.getTime())))
      : new Date()

    // Nível de conquista baseado apenas na pontuação (sem requisito mínimo)
    const achievementLevel = this.calculateAchievementLevel(overallProgress, totalNormalizedScore)
    
    // Atividade recente (últimos 7 dias)
    const isActive = this.isRecentActivity(lastActivity)

    return {
      studentId,
      studentName,
      modules: moduleProgresses,
      totalNormalizedScore,
      overallProgress,
      currentStreak,
      longestStreak,
      totalTimeSpent,
      lastActivity,
      achievementLevel,
      isActive,
      ranking: {
        position: 0, // Será calculado pelo sistema de ranking
        category: 'Geral',
        percentile: 0
      }
    }
  }

  // Desbloquear próximo módulo
  static unlockNextModule(currentModuleId: string, moduleProgresses: ModuleProgress[]): string | null {
    const currentModule = modules.find(m => m.id === currentModuleId)
    if (!currentModule) return null

    const currentProgress = moduleProgresses.find(mp => mp.moduleId === currentModuleId)
    if (!currentProgress?.isCompleted) return null

    // Encontrar próximo módulo
    const nextModuleOrder = currentModule.order + 1
    const nextModule = modules.find(m => m.order === nextModuleOrder)
    
    return nextModule?.id || null
  }

  // Verificar se o estudante pode acessar um módulo
  static canAccessModule(moduleId: string, moduleProgresses: ModuleProgress[]): boolean {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return false

    // Primeiro módulo sempre desbloqueado
    if (module.order === 1) return true

    // Verificar se módulo anterior foi completado
    const previousModule = modules.find(m => m.order === module.order - 1)
    if (!previousModule) return false

    const previousProgress = moduleProgresses.find(mp => mp.moduleId === previousModule.id)
    return previousProgress?.isCompleted || false
  }

  // Métodos auxiliares
  private static findExerciseById(exerciseId: string) {
    for (const module of modules) {
      const exercise = module.exercises.find(ex => ex.id === exerciseId)
      if (exercise) return exercise
    }
    return null
  }

  private static createEmptyExerciseProgress(exerciseId: string, maxScore: number): ExerciseProgress {
    return {
      exerciseId,
      completed: false,
      score: 0,
      maxScore,
      normalizedScore: 0,
      attempts: 0,
      timeSpent: 0,
      lastAttemptAt: new Date(),
      bestScore: 0,
      improvement: 0
    }
  }

  private static calculateStreakDays(exercises: ExerciseProgress[]): number {
    // Calcular dias consecutivos com atividade
    const activities = exercises
      .filter(ex => ex.lastAttemptAt)
      .map(ex => ex.lastAttemptAt)
      .sort((a, b) => b.getTime() - a.getTime())

    if (activities.length === 0) return 0

    let streak = 1
    const today = new Date()
    const oneDay = 24 * 60 * 60 * 1000

    for (let i = 0; i < activities.length - 1; i++) {
      const diffDays = Math.floor((activities[i].getTime() - activities[i + 1].getTime()) / oneDay)
      if (diffDays <= 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  private static getFirstActivityDate(exercises: ExerciseProgress[]): Date | undefined {
    const activities = exercises
      .map(ex => ex.lastAttemptAt)
      .filter(Boolean)
      .sort((a, b) => a.getTime() - b.getTime())
    
    return activities[0]
  }

  private static getLastActivityDate(exercises: ExerciseProgress[]): Date {
    const activities = exercises
      .map(ex => ex.lastAttemptAt)
      .filter(Boolean)
      .sort((a, b) => b.getTime() - a.getTime())
    
    return activities[0] || new Date()
  }

  private static calculateAchievementLevel(overallProgress: number, totalScore: number): string {
    // Critério baseado apenas no progresso e pontuação total (sem mínimos)
    if (overallProgress >= 100 && totalScore >= 350) return 'Expert'
    if (overallProgress >= 75 && totalScore >= 250) return 'Avançado'
    if (overallProgress >= 50 && totalScore >= 150) return 'Intermediário'
    return 'Iniciante'
  }

  private static isRecentActivity(lastActivity: Date): boolean {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return lastActivity > sevenDaysAgo
  }

  // Método para gerar relatório de progresso
  static generateProgressReport(studentProgress: StudentModuleProgress): {
    summary: string
    recommendations: string[]
    nextSteps: string[]
    achievements: string[]
  } {
    const { modules, overallProgress, totalNormalizedScore, achievementLevel } = studentProgress
    
    const completedModules = modules.filter(m => m.isCompleted).length
    const totalModules = modules.length
    
    // Resumo
    const summary = `
      Progresso Geral: ${overallProgress}% (${completedModules}/${totalModules} módulos)
      Pontuação Total: ${totalNormalizedScore}/400 pontos
      Nível: ${achievementLevel}
    `

    // Recomendações
    const recommendations = []
    if (overallProgress < 25) {
      recommendations.push('Foque na conclusão do Módulo 1 - Introdução à Avaliação Nutricional')
    }
    if (overallProgress >= 25 && overallProgress < 50) {
      recommendations.push('Continue com o Módulo 2 - Métodos de Avaliação da Composição Corporal')
    }
    if (overallProgress >= 50 && overallProgress < 75) {
      recommendations.push('Avance para o Módulo 3 - Medidas Corporais e Antropometria')
    }
    if (overallProgress >= 75) {
      recommendations.push('Finalize com o Módulo 4 - Integração de Dados e Diagnóstico')
    }

    // Próximos passos
    const nextSteps = []
    const incompleteModules = modules.filter(m => !m.isCompleted && m.isUnlocked)
    if (incompleteModules.length > 0) {
      const nextModule = incompleteModules[0]
      const incompleteExercises = nextModule.exercises.filter(ex => !ex.completed)
      nextSteps.push(`Completar ${incompleteExercises.length} exercícios do ${nextModule.moduleName}`)
    }

    // Conquistas sem requisitos mínimos
    const achievements = []
    if (completedModules > 0) achievements.push(`${completedModules} módulo(s) completado(s)`)
    if (totalNormalizedScore >= 350) achievements.push('Pontuação de Elite (350+)')
    if (studentProgress.currentStreak >= 7) achievements.push('Sequência de 7+ dias')

    return {
      summary: summary.trim(),
      recommendations,
      nextSteps,
      achievements
    }
  }
}

// Export singleton
export const moduleProgressSystem = ModuleProgressSystem