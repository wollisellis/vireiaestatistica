// Enhanced Scoring System for AvaliaNutri Platform
// Created by Ellis Abhulime - Unicamp
// Version 2.0 - Improved consistency and balance

export interface ScoreCalculation {
  baseScore: number
  timeBonus: number
  streakBonus: number
  difficultyBonus: number
  collaborationBonus: number
  perfectBonus: number
  penaltyDeduction: number
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

export class EnhancedScoringSystem {
  // Base scoring configuration
  private static readonly BASE_POINTS_PER_QUESTION = 100
  private static readonly MAX_POSSIBLE_SCORE = 1000 // Maximum score for normalization
  
  // Time-based bonuses (additive, not multiplicative)
  private static readonly TIME_BONUSES = {
    VERY_FAST: { threshold: 15, bonus: 25 },    // < 15 seconds: +25 points
    FAST: { threshold: 30, bonus: 15 },         // < 30 seconds: +15 points
    NORMAL: { threshold: 60, bonus: 5 },        // < 60 seconds: +5 points
    SLOW: { threshold: 120, bonus: 0 },         // < 120 seconds: 0 points
    VERY_SLOW: { threshold: Infinity, bonus: -10 } // > 120 seconds: -10 points
  }

  // Difficulty-based bonuses (additive)
  private static readonly DIFFICULTY_BONUSES = {
    'muito-facil': 0,
    'facil': 10,
    'medio': 25,
    'dificil': 50,
    'muito-dificil': 75
  }

  // Streak bonuses (additive)
  private static readonly STREAK_BONUSES = {
    3: 20,   // 3 correct in a row: +20 points
    5: 40,   // 5 correct in a row: +40 points
    10: 80,  // 10 correct in a row: +80 points
    15: 150, // 15 correct in a row: +150 points
    20: 250  // 20+ correct in a row: +250 points
  }

  // Hint penalties (fixed per hint)
  private static readonly HINT_PENALTY = 10 // -10 points per hint
  private static readonly ATTEMPT_PENALTY = 5 // -5 points per extra attempt
  
  // Bonuses
  private static readonly COLLABORATION_BONUS = 50 // Fixed bonus for collaborative work
  private static readonly PERFECT_SCORE_BONUS = 100 // Fixed bonus for 100% accuracy

  public static calculateScore(
    questionMetrics: QuestionMetrics[],
    totalTimeElapsed: number,
    isCollaborative: boolean = false
  ): ScoreCalculation {
    const breakdown = this.calculateBreakdown(questionMetrics)
    
    // 1. Calculate base score (accuracy-based)
    const baseScore = this.calculateBaseScore(breakdown)
    
    // 2. Calculate time bonus (additive)
    const timeBonus = this.calculateTimeBonus(breakdown, questionMetrics)
    
    // 3. Calculate streak bonus (additive)
    const streakBonus = this.calculateStreakBonus(questionMetrics)
    
    // 4. Calculate difficulty bonus (additive)
    const difficultyBonus = this.calculateDifficultyBonus(questionMetrics)
    
    // 5. Calculate collaboration bonus
    const collaborationBonus = isCollaborative ? this.COLLABORATION_BONUS : 0
    
    // 6. Calculate perfect score bonus
    const perfectBonus = breakdown.accuracy === 100 ? this.PERFECT_SCORE_BONUS : 0
    
    // 7. Calculate penalty deductions
    const penaltyDeduction = this.calculatePenalties(breakdown)
    
    // 8. Calculate final score (additive system)
    let finalScore = baseScore + timeBonus + streakBonus + difficultyBonus + collaborationBonus + perfectBonus - penaltyDeduction
    
    // Ensure score doesn't go below 0
    finalScore = Math.max(0, finalScore)
    
    // Calculate normalized score (0-100)
    const normalizedScore = this.calculateNormalizedScore(finalScore, questionMetrics.length)
    
    // Get performance rating
    const performance = this.getPerformanceRating(normalizedScore)

    return {
      baseScore: Math.round(baseScore),
      timeBonus: Math.round(timeBonus),
      streakBonus: Math.round(streakBonus),
      difficultyBonus: Math.round(difficultyBonus),
      collaborationBonus: Math.round(collaborationBonus),
      perfectBonus: Math.round(perfectBonus),
      penaltyDeduction: Math.round(penaltyDeduction),
      finalScore: Math.round(finalScore),
      normalizedScore: Math.round(normalizedScore),
      breakdown,
      performance
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
    // Base score is number of correct answers multiplied by base points
    return breakdown.correctAnswers * this.BASE_POINTS_PER_QUESTION
  }

  private static calculateTimeBonus(breakdown: ScoreBreakdown, metrics: QuestionMetrics[]): number {
    // Calculate time bonus based on average response time
    const avgTime = breakdown.averageTimePerQuestion
    let bonus = 0
    
    if (avgTime <= this.TIME_BONUSES.VERY_FAST.threshold) {
      bonus = this.TIME_BONUSES.VERY_FAST.bonus
    } else if (avgTime <= this.TIME_BONUSES.FAST.threshold) {
      bonus = this.TIME_BONUSES.FAST.bonus
    } else if (avgTime <= this.TIME_BONUSES.NORMAL.threshold) {
      bonus = this.TIME_BONUSES.NORMAL.bonus
    } else if (avgTime <= this.TIME_BONUSES.SLOW.threshold) {
      bonus = this.TIME_BONUSES.SLOW.bonus
    } else {
      bonus = this.TIME_BONUSES.VERY_SLOW.bonus
    }
    
    // Apply bonus per correct answer
    return bonus * breakdown.correctAnswers
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

  private static calculateStreakBonus(metrics: QuestionMetrics[]): number {
    const { maxStreak } = this.calculateStreaks(metrics)
    
    if (maxStreak >= 20) return this.STREAK_BONUSES[20]
    if (maxStreak >= 15) return this.STREAK_BONUSES[15]
    if (maxStreak >= 10) return this.STREAK_BONUSES[10]
    if (maxStreak >= 5) return this.STREAK_BONUSES[5]
    if (maxStreak >= 3) return this.STREAK_BONUSES[3]
    
    return 0 // No streak bonus
  }

  private static calculateDifficultyBonus(metrics: QuestionMetrics[]): number {
    if (metrics.length === 0) return 0
    
    // Calculate difficulty bonus based on correct answers at each difficulty
    let totalBonus = 0
    
    for (const metric of metrics) {
      if (metric.correct) {
        totalBonus += this.DIFFICULTY_BONUSES[metric.difficulty]
      }
    }
    
    return totalBonus
  }

  private static calculatePenalties(breakdown: ScoreBreakdown): number {
    let penalty = 0
    
    // Hint usage penalty
    penalty += breakdown.hintsUsed * this.HINT_PENALTY
    
    // Multiple attempts penalty
    const extraAttempts = breakdown.attemptsCount - breakdown.totalQuestions
    penalty += extraAttempts * this.ATTEMPT_PENALTY
    
    return penalty
  }

  // Utility method to format score for display
  public static formatScoreDisplay(calculation: ScoreCalculation): string {
    const lines = [
      `Pontuação Final: ${calculation.finalScore} (${calculation.normalizedScore}%)`,
      `Classificação: ${calculation.performance.rating} ${calculation.performance.emoji}`,
      ``,
      `📊 Detalhamento:`,
      `• Pontuação Base: ${calculation.baseScore}`,
      `• Bônus de Tempo: +${calculation.timeBonus}`,
      `• Bônus de Sequência: +${calculation.streakBonus}`,
      `• Bônus de Dificuldade: +${calculation.difficultyBonus}`,
    ]

    if (calculation.collaborationBonus > 0) {
      lines.push(`• Bônus Colaborativo: +${calculation.collaborationBonus}`)
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
      `• Dicas Usadas: ${calculation.breakdown.hintsUsed}`,
      `• Percentil: ${calculation.performance.percentile}%`
    )

    return lines.join('\n')
  }

  // Method to calculate normalized score (0-100)
  public static calculateNormalizedScore(finalScore: number, totalQuestions: number): number {
    // Calculate maximum possible score for this number of questions
    const maxPossibleScore = totalQuestions * (
      this.BASE_POINTS_PER_QUESTION + // Base points
      this.TIME_BONUSES.VERY_FAST.bonus + // Max time bonus
      this.DIFFICULTY_BONUSES['muito-dificil'] + // Max difficulty bonus
      (this.STREAK_BONUSES[20] / Math.max(1, totalQuestions)) + // Streak bonus normalized
      this.COLLABORATION_BONUS + // Collaboration bonus
      (this.PERFECT_SCORE_BONUS / Math.max(1, totalQuestions)) // Perfect bonus normalized
    )
    
    return Math.min(100, Math.max(0, (finalScore / maxPossibleScore) * 100))
  }

  // Method to get performance rating with percentile
  public static getPerformanceRating(normalizedScore: number): PerformanceRating {
    let rating: PerformanceRating
    
    if (normalizedScore >= 95) {
      rating = {
        rating: 'Excepcional',
        color: 'purple',
        emoji: '🏆',
        message: 'Desempenho extraordinário! Você é um mestre!',
        percentile: 95
      }
    } else if (normalizedScore >= 85) {
      rating = {
        rating: 'Excelente',
        color: 'green',
        emoji: '⭐',
        message: 'Excelente trabalho! Você domina o conteúdo!',
        percentile: 85
      }
    } else if (normalizedScore >= 70) {
      rating = {
        rating: 'Muito Bom',
        color: 'blue',
        emoji: '👍',
        message: 'Muito bom! Continue assim!',
        percentile: 70
      }
    } else if (normalizedScore >= 60) {
      rating = {
        rating: 'Bom',
        color: 'yellow',
        emoji: '✅',
        message: 'Bom trabalho! Há espaço para melhorar.',
        percentile: 60
      }
    } else if (normalizedScore >= 50) {
      rating = {
        rating: 'Regular',
        color: 'orange',
        emoji: '📚',
        message: 'Continue estudando e praticando!',
        percentile: 50
      }
    } else {
      rating = {
        rating: 'Precisa Melhorar',
        color: 'red',
        emoji: '💪',
        message: 'Não desista! Revise o conteúdo e tente novamente.',
        percentile: Math.max(0, normalizedScore)
      }
    }
    
    return rating
  }
}

// Export a singleton instance for convenience
export const scoringSystem = EnhancedScoringSystem

// For backward compatibility
export const AdvancedScoringSystem = EnhancedScoringSystem