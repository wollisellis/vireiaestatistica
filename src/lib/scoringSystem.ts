// Sistema de Pontuação Simplificado - AvaliaNutri Platform
// Focado em aprendizagem educacional, não competição
// Version 3.0 - Simplified Educational Focus

export interface ScoreCalculation {
  baseScore: number
  timeBonus: number // Mantido como 0 para compatibilidade
  streakBonus: number // Mantido como 0 para compatibilidade
  difficultyBonus: number // Mantido como 0 para compatibilidade
  collaborationBonus: number // Mantido como 0 para compatibilidade
  perfectBonus: number // Mantido como 0 para compatibilidade
  penaltyDeduction: number // Mantido como 0 para compatibilidade
  finalScore: number
  normalizedScore: number // 0-100 standardized score
  breakdown: ScoreBreakdown
  performance: PerformanceRating
}

export interface PerformanceRating {
  rating: string
  color: string
  emoji: string
  message: string
  percentile: number
}

export interface ScoreBreakdown {
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  averageTimePerQuestion: number
  fastestAnswer: number
  slowestAnswer: number
  currentStreak: number
  maxStreak: number
  hintsUsed: number
  attemptsCount: number
}

export interface QuestionMetrics {
  questionId: number
  correct: boolean
  timeSpent: number
  hintsUsed: number
  attempts: number
  difficulty: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
}

export class AdvancedScoringSystem {
  // Simplified configuration - focus on learning, not gaming
  private static readonly BASE_POINTS_PER_QUESTION = 100
  private static readonly MAX_POSSIBLE_SCORE = 1000

  public static calculateScore(
    questionMetrics: QuestionMetrics[],
    totalTimeElapsed: number,
    isCollaborative: boolean = false
  ): ScoreCalculation {
    const breakdown = this.calculateBreakdown(questionMetrics)
    
    // Simplified scoring: only accuracy matters
    const baseScore = this.calculateBaseScore(breakdown)
    
    // All bonuses set to 0 - focus on learning, not gaming mechanics
    const timeBonus = 0
    const streakBonus = 0
    const difficultyBonus = 0
    const collaborationBonus = 0
    const perfectBonus = 0
    const penaltyDeduction = 0
    
    // Final score is just the base score (accuracy-based)
    const finalScore = Math.max(0, baseScore)
    
    // Normalize to 0-100 scale based on accuracy
    const normalizedScore = breakdown.accuracy
    
    // Educational performance assessment
    const performance = this.assessEducationalPerformance(normalizedScore, breakdown)
    
    return {
      baseScore,
      timeBonus,
      streakBonus,
      difficultyBonus,
      collaborationBonus,
      perfectBonus,
      penaltyDeduction,
      finalScore,
      normalizedScore,
      breakdown,
      performance
    }
  }

  private static calculateBreakdown(questionMetrics: QuestionMetrics[]): ScoreBreakdown {
    const totalQuestions = questionMetrics.length
    const correctAnswers = questionMetrics.filter(q => q.correct).length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    const timeTaken = questionMetrics.map(q => q.timeSpent)
    const averageTimePerQuestion = timeTaken.length > 0 ? timeTaken.reduce((sum, time) => sum + time, 0) / timeTaken.length : 0
    const fastestAnswer = timeTaken.length > 0 ? Math.min(...timeTaken) : 0
    const slowestAnswer = timeTaken.length > 0 ? Math.max(...timeTaken) : 0

    // Calculate streaks (for educational feedback, not scoring)
    let currentStreak = 0
    let maxStreak = 0
    let tempStreak = 0

    questionMetrics.forEach(q => {
      if (q.correct) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 0
      }
    })

    // Current streak from the end
    for (let i = questionMetrics.length - 1; i >= 0; i--) {
      if (questionMetrics[i].correct) {
        currentStreak++
      } else {
        break
      }
    }

    const hintsUsed = questionMetrics.reduce((sum, q) => sum + q.hintsUsed, 0)
    const attemptsCount = questionMetrics.reduce((sum, q) => sum + q.attempts, 0)

    return {
      correctAnswers,
      totalQuestions,
      accuracy,
      averageTimePerQuestion,
      fastestAnswer,
      slowestAnswer,
      currentStreak,
      maxStreak,
      hintsUsed,
      attemptsCount
    }
  }

  private static calculateBaseScore(breakdown: ScoreBreakdown): number {
    // Simple accuracy-based scoring
    return Math.round((breakdown.accuracy / 100) * this.MAX_POSSIBLE_SCORE)
  }

  private static assessEducationalPerformance(
    normalizedScore: number,
    breakdown: ScoreBreakdown
  ): PerformanceRating {
    // Educational performance levels instead of competitive ratings
    if (normalizedScore >= 90) {
      return {
        rating: 'Domínio Excelente',
        color: 'emerald',
        emoji: '🌟',
        message: 'Você demonstra excelente compreensão dos conceitos de avaliação nutricional.',
        percentile: 95
      }
    }
    
    if (normalizedScore >= 80) {
      return {
        rating: 'Bom Entendimento',
        color: 'blue',
        emoji: '📚',
        message: 'Você tem uma boa base dos conceitos. Continue praticando para aprofundar.',
        percentile: 80
      }
    }
    
    if (normalizedScore >= 70) {
      return {
        rating: 'Em Desenvolvimento',
        color: 'yellow',
        emoji: '📖',
        message: 'Você está progredindo bem. Revise os conceitos e pratique mais.',
        percentile: 70
      }
    }
    
    if (normalizedScore >= 50) {
      return {
        rating: 'Iniciante',
        color: 'orange',
        emoji: '🌱',
        message: 'Bom começo! Continue estudando para fortalecer sua compreensão.',
        percentile: 50
      }
    }
    
    return {
      rating: 'Precisa de Apoio',
      color: 'red',
      emoji: '📝',
      message: 'Recomendamos revisar o material e buscar apoio para fortalecer os conceitos básicos.',
      percentile: 30
    }
  }
}

// Backward compatibility alias
export const EnhancedScoringSystem = AdvancedScoringSystem