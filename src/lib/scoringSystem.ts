// Advanced Scoring System for AvaliaNutri Platform
// Created by Ellis Abhulime - Unicamp

export interface ScoreCalculation {
  baseScore: number
  timeBonus: number
  streakMultiplier: number
  difficultyMultiplier: number
  collaborationBonus: number
  perfectBonus: number
  penaltyDeduction: number
  finalScore: number
  breakdown: ScoreBreakdown
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
  private static readonly TIME_BONUSES = {
    VERY_FAST: { threshold: 15, multiplier: 1.5 },    // < 15 seconds
    FAST: { threshold: 30, multiplier: 1.25 },        // < 30 seconds
    NORMAL: { threshold: 60, multiplier: 1.1 },       // < 60 seconds
    SLOW: { threshold: 120, multiplier: 1.0 },        // < 120 seconds
    VERY_SLOW: { threshold: Infinity, multiplier: 0.9 } // > 120 seconds
  }

  private static readonly DIFFICULTY_MULTIPLIERS = {
    'muito-facil': 1.0,
    'facil': 1.2,
    'medio': 1.5,
    'dificil': 2.0,
    'muito-dificil': 2.5
  }

  private static readonly STREAK_BONUSES = {
    3: 1.1,   // 3 correct in a row
    5: 1.2,   // 5 correct in a row
    10: 1.5,  // 10 correct in a row
    15: 2.0,  // 15 correct in a row
    20: 2.5   // 20+ correct in a row
  }

  private static readonly HINT_PENALTIES = {
    0: 1.0,   // No hints used
    1: 0.9,   // 1 hint used
    2: 0.8,   // 2 hints used
    3: 0.7    // 3+ hints used
  }

  private static readonly COLLABORATION_BONUS = 1.15 // 15% bonus for collaborative work
  private static readonly PERFECT_SCORE_BONUS = 500 // Fixed bonus for 100% accuracy
  private static readonly BASE_POINTS_PER_QUESTION = 100

  public static calculateScore(
    questionMetrics: QuestionMetrics[],
    totalTimeElapsed: number,
    isCollaborative: boolean = false
  ): ScoreCalculation {
    const breakdown = this.calculateBreakdown(questionMetrics)
    
    // 1. Calculate base score (accuracy-based)
    const baseScore = this.calculateBaseScore(breakdown)
    
    // 2. Calculate time bonus
    const timeBonus = this.calculateTimeBonus(breakdown, questionMetrics)
    
    // 3. Calculate streak multiplier
    const streakMultiplier = this.calculateStreakMultiplier(questionMetrics)
    
    // 4. Calculate difficulty multiplier
    const difficultyMultiplier = this.calculateDifficultyMultiplier(questionMetrics)
    
    // 5. Calculate collaboration bonus
    const collaborationBonus = isCollaborative ? this.COLLABORATION_BONUS : 1.0
    
    // 6. Calculate perfect score bonus
    const perfectBonus = breakdown.accuracy === 100 ? this.PERFECT_SCORE_BONUS : 0
    
    // 7. Calculate penalty deductions
    const penaltyDeduction = this.calculatePenalties(breakdown)
    
    // 8. Calculate final score
    let finalScore = baseScore * timeBonus * streakMultiplier * difficultyMultiplier * collaborationBonus
    finalScore = Math.round(finalScore - penaltyDeduction + perfectBonus)
    
    // Ensure score doesn't go below 0 or above maximum possible
    const maxPossibleScore = questionMetrics.length * this.BASE_POINTS_PER_QUESTION * 3 // Maximum with all bonuses
    finalScore = Math.max(0, Math.min(finalScore, maxPossibleScore))

    return {
      baseScore: Math.round(baseScore),
      timeBonus: Math.round((timeBonus - 1) * 100), // Convert to percentage
      streakMultiplier: Math.round((streakMultiplier - 1) * 100), // Convert to percentage
      difficultyMultiplier: Math.round((difficultyMultiplier - 1) * 100), // Convert to percentage
      collaborationBonus: Math.round((collaborationBonus - 1) * 100), // Convert to percentage
      perfectBonus,
      penaltyDeduction: Math.round(penaltyDeduction),
      finalScore,
      breakdown
    }
  }

  private static calculateBreakdown(questionMetrics: QuestionMetrics[]): ScoreBreakdown {
    const correctAnswers = questionMetrics.filter(q => q.correct).length
    const totalQuestions = questionMetrics.length
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
    
    const times = questionMetrics.map(q => q.timeSpent).filter(t => t > 0)
    const averageTimePerQuestion = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0
    
    const fastestAnswer = times.length > 0 ? Math.min(...times) : 0
    const slowestAnswer = times.length > 0 ? Math.max(...times) : 0
    
    const { currentStreak, maxStreak } = this.calculateStreaks(questionMetrics)
    
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
    // Base score is percentage of correct answers multiplied by base points
    return (breakdown.accuracy / 100) * breakdown.totalQuestions * this.BASE_POINTS_PER_QUESTION
  }

  private static calculateTimeBonus(breakdown: ScoreBreakdown, metrics: QuestionMetrics[]): number {
    // Calculate time bonus based on average response time
    const avgTime = breakdown.averageTimePerQuestion
    
    if (avgTime <= this.TIME_BONUSES.VERY_FAST.threshold) {
      return this.TIME_BONUSES.VERY_FAST.multiplier
    } else if (avgTime <= this.TIME_BONUSES.FAST.threshold) {
      return this.TIME_BONUSES.FAST.multiplier
    } else if (avgTime <= this.TIME_BONUSES.NORMAL.threshold) {
      return this.TIME_BONUSES.NORMAL.multiplier
    } else if (avgTime <= this.TIME_BONUSES.SLOW.threshold) {
      return this.TIME_BONUSES.SLOW.multiplier
    } else {
      return this.TIME_BONUSES.VERY_SLOW.multiplier
    }
  }

  private static calculateStreaks(metrics: QuestionMetrics[]): { currentStreak: number, maxStreak: number } {
    let currentStreak = 0
    let maxStreak = 0
    
    for (const metric of metrics) {
      if (metric.correct) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    return { currentStreak, maxStreak }
  }

  private static calculateStreakMultiplier(metrics: QuestionMetrics[]): number {
    const { maxStreak } = this.calculateStreaks(metrics)
    
    if (maxStreak >= 20) return this.STREAK_BONUSES[20]
    if (maxStreak >= 15) return this.STREAK_BONUSES[15]
    if (maxStreak >= 10) return this.STREAK_BONUSES[10]
    if (maxStreak >= 5) return this.STREAK_BONUSES[5]
    if (maxStreak >= 3) return this.STREAK_BONUSES[3]
    
    return 1.0 // No streak bonus
  }

  private static calculateDifficultyMultiplier(metrics: QuestionMetrics[]): number {
    if (metrics.length === 0) return 1.0
    
    // Calculate weighted average based on correct answers at each difficulty
    let totalMultiplier = 0
    let correctCount = 0
    
    for (const metric of metrics) {
      if (metric.correct) {
        totalMultiplier += this.DIFFICULTY_MULTIPLIERS[metric.difficulty]
        correctCount++
      }
    }
    
    return correctCount > 0 ? totalMultiplier / correctCount : 1.0
  }

  private static calculatePenalties(breakdown: ScoreBreakdown): number {
    let penalty = 0
    
    // Hint usage penalty
    const hintPenaltyMultiplier = this.HINT_PENALTIES[Math.min(breakdown.hintsUsed, 3)]
    penalty += (1 - hintPenaltyMultiplier) * 100 * breakdown.totalQuestions
    
    // Multiple attempts penalty (5 points per extra attempt)
    const extraAttempts = breakdown.attemptsCount - breakdown.totalQuestions
    penalty += extraAttempts * 5
    
    return penalty
  }

  // Utility method to format score for display
  public static formatScoreDisplay(calculation: ScoreCalculation): string {
    const lines = [
      `Pontuação Final: ${calculation.finalScore}`,
      ``,
      `📊 Detalhamento:`,
      `• Pontuação Base: ${calculation.baseScore}`,
      `• Bônus de Tempo: +${calculation.timeBonus}%`,
      `• Multiplicador de Sequência: +${calculation.streakMultiplier}%`,
      `• Multiplicador de Dificuldade: +${calculation.difficultyMultiplier}%`,
    ]

    if (calculation.collaborationBonus > 0) {
      lines.push(`• Bônus Colaborativo: +${calculation.collaborationBonus}%`)
    }

    if (calculation.perfectBonus > 0) {
      lines.push(`• Bônus de Pontuação Perfeita: +${calculation.perfectBonus}`)
    }

    if (calculation.penaltyDeduction > 0) {
      lines.push(`• Penalidades: -${calculation.penaltyDeduction}`)
    }

    lines.push(
      ``,
      `📈 Estatísticas:`,
      `• Precisão: ${calculation.breakdown.accuracy.toFixed(1)}%`,
      `• Sequência Máxima: ${calculation.breakdown.maxStreak} acertos`,
      `• Tempo Médio: ${calculation.breakdown.averageTimePerQuestion.toFixed(1)}s`,
      `• Dicas Usadas: ${calculation.breakdown.hintsUsed}`
    )

    return lines.join('\n')
  }

  // Method to calculate normalized score (0-100)
  public static calculateNormalizedScore(calculation: ScoreCalculation): number {
    // Normalize based on maximum possible score with reasonable bonuses
    const maxReasonableScore = calculation.breakdown.totalQuestions * this.BASE_POINTS_PER_QUESTION * 2
    return Math.min(100, Math.round((calculation.finalScore / maxReasonableScore) * 100))
  }

  // Method to get performance rating
  public static getPerformanceRating(normalizedScore: number): {
    rating: string
    color: string
    emoji: string
    message: string
  } {
    if (normalizedScore >= 95) {
      return {
        rating: 'Excepcional',
        color: 'purple',
        emoji: '🏆',
        message: 'Desempenho extraordinário! Você é um mestre!'
      }
    } else if (normalizedScore >= 85) {
      return {
        rating: 'Excelente',
        color: 'green',
        emoji: '⭐',
        message: 'Excelente trabalho! Você domina o conteúdo!'
      }
    } else if (normalizedScore >= 70) {
      return {
        rating: 'Muito Bom',
        color: 'blue',
        emoji: '👍',
        message: 'Muito bom! Continue assim!'
      }
    } else if (normalizedScore >= 60) {
      return {
        rating: 'Bom',
        color: 'yellow',
        emoji: '✅',
        message: 'Bom trabalho! Há espaço para melhorar.'
      }
    } else if (normalizedScore >= 50) {
      return {
        rating: 'Regular',
        color: 'orange',
        emoji: '📚',
        message: 'Continue estudando e praticando!'
      }
    } else {
      return {
        rating: 'Precisa Melhorar',
        color: 'red',
        emoji: '💪',
        message: 'Não desista! Revise o conteúdo e tente novamente.'
      }
    }
  }
}

// Export a singleton instance for convenience
export const scoringSystem = AdvancedScoringSystem