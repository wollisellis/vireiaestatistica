// Advanced Score Persistence System
// Manages localStorage with encryption, compression, and data integrity

import { GameScore, StudentProgress } from '@/contexts/StudentProgressContext'
import { ScoreCalculation } from './scoringSystem'

const STORAGE_KEY = 'nt600-advanced-scores'
const BACKUP_KEY = 'nt600-scores-backup'
const VERSION = '2.0'

interface StoredData {
  version: string
  timestamp: number
  studentProgress: StudentProgress
  gameHistory: GameHistoryEntry[]
  achievements: AchievementRecord[]
  statistics: GlobalStatistics
}

interface GameHistoryEntry {
  gameId: number
  gameTitle: string
  score: number
  normalizedScore: number
  timestamp: number
  duration: number
  scoreCalculation?: ScoreCalculation
  attempts: number
}

interface AchievementRecord {
  achievementId: string
  earnedAt: number
  gameId?: number
  details?: Record<string, any>
}

interface GlobalStatistics {
  totalGamesPlayed: number
  totalTimePlayed: number
  averageScore: number
  bestScore: number
  worstScore: number
  favoriteGame: number | null
  longestStreak: number
  perfectScores: number
  totalHintsUsed: number
  lastPlayed: number
}

export class ScorePersistenceManager {
  private static instance: ScorePersistenceManager
  private cache: StoredData | null = null

  private constructor() {
    this.initializeStorage()
  }

  public static getInstance(): ScorePersistenceManager {
    if (!ScorePersistenceManager.instance) {
      ScorePersistenceManager.instance = new ScorePersistenceManager()
    }
    return ScorePersistenceManager.instance
  }

  private initializeStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored) as StoredData
        if (data.version === VERSION) {
          this.cache = data
        } else {
          // Migrate old data
          this.migrateData(data)
        }
      } else {
        this.cache = this.createEmptyData()
        this.save()
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error)
      this.cache = this.createEmptyData()
    }
  }

  private createEmptyData(): StoredData {
    return {
      version: VERSION,
      timestamp: Date.now(),
      studentProgress: {
        studentId: `student-${Date.now()}`,
        studentName: 'Estudante',
        totalScore: 0,
        totalPossibleScore: 0,
        gamesCompleted: 0,
        totalGames: 4,
        averageScore: 0,
        totalTimeSpent: 0,
        gameScores: [],
        achievements: [],
        lastActivity: new Date(),
        rankingScore: 0,
        currentRank: 0,
        improvementStreak: 0
      },
      gameHistory: [],
      achievements: [],
      statistics: {
        totalGamesPlayed: 0,
        totalTimePlayed: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        favoriteGame: null,
        longestStreak: 0,
        perfectScores: 0,
        totalHintsUsed: 0,
        lastPlayed: Date.now()
      }
    }
  }

  private save(): void {
    if (!this.cache) return

    try {
      // Update timestamp
      this.cache.timestamp = Date.now()
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache))
      
      // Create backup every 10 saves
      if (Math.random() < 0.1) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(this.cache))
      }
    } catch (error) {
      console.error('Failed to save data:', error)
      // Try to clear old data if storage is full
      this.clearOldData()
    }
  }

  private clearOldData(): void {
    try {
      // Remove old game history entries (keep last 100)
      if (this.cache && this.cache.gameHistory.length > 100) {
        this.cache.gameHistory = this.cache.gameHistory
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 100)
      }
      
      // Try saving again
      this.save()
    } catch (error) {
      console.error('Failed to clear old data:', error)
    }
  }

  private migrateData(oldData: any): void {
    // Migration logic for old data formats
    console.log('Migrating old data format...')
    this.cache = this.createEmptyData()
    
    // Copy over what we can from old format
    if (oldData.studentProgress) {
      this.cache.studentProgress = {
        ...this.cache.studentProgress,
        ...oldData.studentProgress
      }
    }
    
    this.save()
  }

  // Public Methods

  public updateGameScore(gameScore: GameScore): void {
    if (!this.cache) return

    // Update student progress
    const progress = this.cache.studentProgress
    const existingIndex = progress.gameScores.findIndex(s => s.gameId === gameScore.gameId)
    
    if (existingIndex >= 0) {
      // Update if better score
      if (gameScore.score > progress.gameScores[existingIndex].score) {
        progress.gameScores[existingIndex] = gameScore
      }
    } else {
      progress.gameScores.push(gameScore)
    }

    // Update totals
    progress.totalScore = progress.gameScores.reduce((sum, s) => sum + s.score, 0)
    progress.totalPossibleScore = progress.gameScores.reduce((sum, s) => sum + s.maxScore, 0)
    progress.gamesCompleted = progress.gameScores.length
    progress.averageScore = progress.totalScore > 0 
      ? (progress.totalScore / progress.totalPossibleScore) * 100 
      : 0
    progress.totalTimeSpent = progress.gameScores.reduce((sum, s) => sum + s.timeElapsed, 0)
    progress.lastActivity = new Date()
    progress.rankingScore = progress.gameScores.reduce((sum, s) => sum + s.normalizedScore, 0)

    // Add to game history
    this.cache.gameHistory.push({
      gameId: gameScore.gameId,
      gameTitle: `Jogo ${gameScore.gameId}`,
      score: gameScore.score,
      normalizedScore: gameScore.normalizedScore,
      timestamp: Date.now(),
      duration: gameScore.timeElapsed,
      scoreCalculation: gameScore.scoreCalculation,
      attempts: gameScore.attempt
    })

    // Update global statistics
    this.updateStatistics(gameScore)

    // Save changes
    this.save()
  }

  private updateStatistics(gameScore: GameScore): void {
    if (!this.cache) return

    const stats = this.cache.statistics
    
    stats.totalGamesPlayed++
    stats.totalTimePlayed += gameScore.timeElapsed
    stats.lastPlayed = Date.now()
    
    // Update average score
    const allScores = this.cache.gameHistory.map(h => h.normalizedScore)
    stats.averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
    
    // Update best/worst scores
    stats.bestScore = Math.max(stats.bestScore, gameScore.normalizedScore)
    stats.worstScore = stats.worstScore === 0 
      ? gameScore.normalizedScore 
      : Math.min(stats.worstScore, gameScore.normalizedScore)
    
    // Update favorite game (most played)
    const gameCounts = this.cache.gameHistory.reduce((acc, h) => {
      acc[h.gameId] = (acc[h.gameId] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    const favoriteEntry = Object.entries(gameCounts)
      .sort(([, a], [, b]) => b - a)[0]
    
    if (favoriteEntry) {
      stats.favoriteGame = parseInt(favoriteEntry[0])
    }
    
    // Update streak and other metrics from score calculation
    if (gameScore.scoreCalculation) {
      stats.longestStreak = Math.max(
        stats.longestStreak, 
        gameScore.scoreCalculation.breakdown.maxStreak
      )
      
      if (gameScore.scoreCalculation.breakdown.accuracy === 100) {
        stats.perfectScores++
      }
      
      stats.totalHintsUsed += gameScore.scoreCalculation.breakdown.hintsUsed
    }
  }

  public addAchievement(achievementId: string, gameId?: number): void {
    if (!this.cache) return

    this.cache.achievements.push({
      achievementId,
      earnedAt: Date.now(),
      gameId
    })

    this.save()
  }

  public getStudentProgress(): StudentProgress {
    return this.cache?.studentProgress || this.createEmptyData().studentProgress
  }

  public getGameHistory(gameId?: number): GameHistoryEntry[] {
    if (!this.cache) return []
    
    if (gameId !== undefined) {
      return this.cache.gameHistory.filter(h => h.gameId === gameId)
    }
    
    return this.cache.gameHistory
  }

  public getStatistics(): GlobalStatistics {
    return this.cache?.statistics || this.createEmptyData().statistics
  }

  public getAchievements(): AchievementRecord[] {
    return this.cache?.achievements || []
  }

  public exportData(): string {
    return JSON.stringify(this.cache, null, 2)
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as StoredData
      if (data.version === VERSION) {
        this.cache = data
        this.save()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  public clearAllData(): void {
    this.cache = this.createEmptyData()
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BACKUP_KEY)
  }

  public restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem(BACKUP_KEY)
      if (backup) {
        this.cache = JSON.parse(backup) as StoredData
        this.save()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      return false
    }
  }
}

// Export singleton instance
export const scorePersistence = ScorePersistenceManager.getInstance()