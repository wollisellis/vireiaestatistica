'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { evaluateAchievements, calculateAchievementPoints } from '@/lib/achievementSystem'
import { useAchievementNotifications } from '@/components/achievements/AchievementNotification'

export interface GameScore {
  gameId: number
  score: number
  maxScore: number
  timeElapsed: number
  completedAt: Date
  exercisesCompleted: number
  totalExercises: number
  difficulty: string
  normalizedScore: number // 0-100 based on completion rate
  isPersonalBest: boolean
  previousBestScore?: number
  attempt: number
  isCollaborative?: boolean
  partnerId?: string
  partnerName?: string
}

export interface StudentProgress {
  studentId: string
  studentName: string
  totalScore: number
  totalPossibleScore: number
  gamesCompleted: number
  totalGames: number
  averageScore: number
  totalTimeSpent: number
  gameScores: GameScore[]
  achievements: string[]
  lastActivity: Date
  rankingScore: number // Total normalized score (0-200 for 2 games)
  currentRank: number
  improvementStreak: number
}

export interface RankingEntry {
  studentId: string
  studentName: string
  rankingScore: number
  gamesCompleted: number
  averageScore: number
  lastActivity: Date
}

interface StudentProgressContextType {
  progress: StudentProgress
  updateGameScore: (gameScore: Omit<GameScore, 'normalizedScore' | 'isPersonalBest' | 'attempt'>) => void
  resetProgress: () => void
  getGameProgress: (gameId: number) => GameScore | null
  newAchievements: string[]
  clearNewAchievements: () => void
  calculateOverallPerformance: () => {
    performance: 'Excelente' | 'Bom' | 'Regular' | 'Precisa Melhorar'
    color: string
    recommendation: string
  }
  getRankingData: () => RankingEntry[]
  getCurrentRank: () => number
  getTopPerformers: (limit?: number) => RankingEntry[]
  calculateNormalizedScore: (exercisesCompleted: number, totalExercises: number) => number
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined)

const generateStudentName = () => {
  const names = ['Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Souza', 'Lucas Lima', 'Fernanda Alves', 'Rafael Pereira']
  return names[Math.floor(Math.random() * names.length)]
}

const getInitialProgress = (): StudentProgress => {
  // Check if in guest mode
  const isGuestMode = typeof window !== 'undefined' &&
    document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))

  return {
    studentId: isGuestMode ? 'guest-user' : 'student-default',
    studentName: isGuestMode ? 'Usuário Visitante' : 'Estudante',
    totalScore: isGuestMode ? 850 : 0,
    totalPossibleScore: isGuestMode ? 1000 : 0,
    gamesCompleted: isGuestMode ? 2 : 0,
    totalGames: 4, // AvaliaNutri has 4 games
    averageScore: isGuestMode ? 85 : 0,
    totalTimeSpent: isGuestMode ? 1800 : 0, // 30 minutes for demo
    gameScores: isGuestMode ? [
      {
        gameId: 1,
        score: 85,
        maxScore: 100,
        timeElapsed: 900,
        completedAt: new Date('2024-01-01'), // Fixed date for SSR consistency
        exercisesCompleted: 5,
        totalExercises: 5,
        difficulty: 'intermediate',
        normalizedScore: 85,
        isPersonalBest: true,
        attempt: 1
      },
      {
        gameId: 2,
        score: 92,
        maxScore: 100,
        timeElapsed: 720,
        completedAt: new Date('2024-01-02'), // Fixed date for SSR consistency
        exercisesCompleted: 4,
        totalExercises: 5,
        difficulty: 'intermediate',
        normalizedScore: 92,
        isPersonalBest: true,
        attempt: 1
      }
    ] : [],
    achievements: isGuestMode ? ['first-game', 'quick-learner'] : [],
    lastActivity: new Date('2024-01-02'),
    rankingScore: isGuestMode ? 850 : 0,
    currentRank: isGuestMode ? 3 : 0,
    improvementStreak: isGuestMode ? 2 : 0
  }
}

export function StudentProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StudentProgress>(() => {
    // Initialize with safe defaults for SSR
    return {
      studentId: 'student-default',
      studentName: 'Estudante',
      totalScore: 0,
      totalPossibleScore: 0,
      gamesCompleted: 0,
      totalGames: 4,
      averageScore: 0,
      totalTimeSpent: 0,
      gameScores: [],
      achievements: [],
      lastActivity: new Date('2024-01-01'),
      rankingScore: 0,
      currentRank: 0,
      improvementStreak: 0
    }
  })
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load progress from localStorage on mount (skip for guest mode)
  useEffect(() => {
    const isGuestMode = document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))

    if (isGuestMode) {
      // Set guest mode progress
      setProgress(getInitialProgress())
    } else {
      // Load from localStorage for regular users
      const savedProgress = localStorage.getItem('nt600-student-progress')
      if (savedProgress) {
        try {
          const parsed = JSON.parse(savedProgress)
          // Convert date strings back to Date objects
          parsed.lastActivity = new Date(parsed.lastActivity)
          parsed.gameScores = parsed.gameScores.map((score: any) => ({
            ...score,
            completedAt: new Date(score.completedAt)
          }))
          setProgress(parsed)
        } catch (error) {
          console.error('Error loading student progress:', error)
        }
      }
    }

    setIsInitialized(true)
  }, [])

  // Save progress to localStorage whenever it changes (skip for guest mode)
  useEffect(() => {
    if (!isInitialized) return // Don't save until initialized

    const isGuestMode = document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))
    if (isGuestMode) return // Don't save progress for guests

    localStorage.setItem('nt600-student-progress', JSON.stringify(progress))
  }, [progress, isInitialized])

  const calculateNormalizedScore = (exercisesCompleted: number, totalExercises: number): number => {
    return Math.round((exercisesCompleted / totalExercises) * 100)
  }

  const updateGameScore = (gameScore: Omit<GameScore, 'normalizedScore' | 'isPersonalBest' | 'attempt'>) => {
    setProgress(prev => {
      const existingScoreIndex = prev.gameScores.findIndex(score => score.gameId === gameScore.gameId)
      const normalizedScore = calculateNormalizedScore(gameScore.exercisesCompleted, gameScore.totalExercises)

      let isPersonalBest = true
      let previousBestScore: number | undefined
      let attempt = 1

      if (existingScoreIndex >= 0) {
        const existingScore = prev.gameScores[existingScoreIndex]
        previousBestScore = existingScore.normalizedScore
        isPersonalBest = normalizedScore > existingScore.normalizedScore
        attempt = existingScore.attempt + 1
      }

      const enhancedGameScore: GameScore = {
        ...gameScore,
        normalizedScore,
        isPersonalBest,
        previousBestScore,
        attempt
      }

      let newGameScores: GameScore[]

      if (existingScoreIndex >= 0) {
        // Only update if it's a better score
        if (isPersonalBest) {
          newGameScores = [...prev.gameScores]
          newGameScores[existingScoreIndex] = enhancedGameScore
        } else {
          // Keep the existing better score but update attempt count
          newGameScores = [...prev.gameScores]
          newGameScores[existingScoreIndex] = {
            ...newGameScores[existingScoreIndex],
            attempt: attempt
          }
          return prev // Don't update if score didn't improve
        }
      } else {
        // Add new score
        newGameScores = [...prev.gameScores, enhancedGameScore]
      }

      // Calculate new totals
      const totalScore = newGameScores.reduce((sum, score) => sum + score.score, 0)
      const totalPossibleScore = newGameScores.reduce((sum, score) => sum + score.maxScore, 0)
      const totalTimeSpent = newGameScores.reduce((sum, score) => sum + score.timeElapsed, 0)
      const gamesCompleted = newGameScores.length
      const averageScore = gamesCompleted > 0 ? (totalScore / totalPossibleScore) * 100 : 0

      // Calculate ranking score (sum of normalized scores)
      const rankingScore = newGameScores.reduce((sum, score) => sum + score.normalizedScore, 0)

      // Calculate improvement streak
      let improvementStreak = prev.improvementStreak
      if (isPersonalBest) {
        improvementStreak += 1
      } else if (existingScoreIndex >= 0) {
        improvementStreak = 0 // Reset streak if no improvement
      }

      // Evaluate achievements using the comprehensive system
      const currentProgress = {
        totalScore,
        averageScore,
        gamesCompleted: prev.gamesCompleted,
        gameScores: prev.gameScores.map(score => ({
          gameId: score.gameId,
          score: score.score,
          maxScore: score.maxScore,
          timeElapsed: score.timeElapsed,
          isCollaborative: score.isCollaborative,
          partnerId: score.partnerId
        })),
        achievements: prev.achievements,
        improvementStreak
      }

      const earnedAchievements = evaluateAchievements(currentProgress, {
        gameId: gameScore.gameId,
        score: gameScore.score,
        maxScore: gameScore.maxScore,
        timeElapsed: gameScore.timeElapsed,
        isCollaborative: gameScore.isCollaborative,
        partnerId: gameScore.partnerId
      })

      const updatedAchievements = [...prev.achievements, ...earnedAchievements]

      // Set new achievements for notifications
      if (earnedAchievements.length > 0) {
        setNewAchievements(earnedAchievements)
      }

      return {
        ...prev,
        totalScore,
        totalPossibleScore,
        gamesCompleted,
        averageScore,
        totalTimeSpent,
        gameScores: newGameScores,
        achievements: updatedAchievements,
        lastActivity: new Date(),
        rankingScore,
        improvementStreak
      }
    })
  }

  const resetProgress = () => {
    setProgress(initialProgress)
    localStorage.removeItem('nt600-student-progress')
  }

  const getGameProgress = (gameId: number): GameScore | null => {
    return progress.gameScores.find(score => score.gameId === gameId) || null
  }

  const calculateOverallPerformance = () => {
    const { averageScore, gamesCompleted } = progress
    
    if (gamesCompleted === 0) {
      return {
        performance: 'Precisa Melhorar' as const,
        color: 'gray',
        recommendation: 'Comece jogando para avaliar seu progresso!'
      }
    }
    
    if (averageScore >= 85) {
      return {
        performance: 'Excelente' as const,
        color: 'green',
        recommendation: 'Parabéns! Você domina os conceitos de avaliação nutricional.'
      }
    } else if (averageScore >= 70) {
      return {
        performance: 'Bom' as const,
        color: 'blue',
        recommendation: 'Bom desempenho! Continue praticando para aperfeiçoar.'
      }
    } else if (averageScore >= 50) {
      return {
        performance: 'Regular' as const,
        color: 'yellow',
        recommendation: 'Revise o conteúdo teórico e pratique mais os exercícios.'
      }
    } else {
      return {
        performance: 'Precisa Melhorar' as const,
        color: 'red',
        recommendation: 'Recomendamos revisar o material da disciplina antes de continuar.'
      }
    }
  }

  // Generate mock ranking data for demonstration
  const generateMockRankingData = (): RankingEntry[] => {
    const mockStudents = [
      { name: 'Ana Silva', score: 185, games: 2, avg: 92.5 },
      { name: 'João Santos', score: 178, games: 2, avg: 89.0 },
      { name: 'Maria Oliveira', score: 172, games: 2, avg: 86.0 },
      { name: 'Pedro Costa', score: 165, games: 2, avg: 82.5 },
      { name: 'Carla Souza', score: 158, games: 2, avg: 79.0 },
      { name: 'Lucas Lima', score: 145, games: 2, avg: 72.5 },
      { name: 'Fernanda Alves', score: 138, games: 2, avg: 69.0 },
      { name: 'Rafael Pereira', score: 125, games: 1, avg: 62.5 }
    ]

    return mockStudents.map((student, index) => ({
      studentId: `mock-${index}`,
      studentName: student.name,
      rankingScore: student.score,
      gamesCompleted: student.games,
      averageScore: student.avg,
      lastActivity: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000) // Fixed calculation for SSR consistency
    }))
  }

  const getRankingData = (): RankingEntry[] => {
    const mockData = generateMockRankingData()
    const currentStudent: RankingEntry = {
      studentId: progress.studentId,
      studentName: progress.studentName,
      rankingScore: progress.rankingScore,
      gamesCompleted: progress.gamesCompleted,
      averageScore: progress.averageScore,
      lastActivity: progress.lastActivity
    }

    const allStudents = [...mockData, currentStudent]
    return allStudents.sort((a, b) => b.rankingScore - a.rankingScore)
  }

  const getCurrentRank = (): number => {
    const rankings = getRankingData()
    const currentIndex = rankings.findIndex(entry => entry.studentId === progress.studentId)
    return currentIndex + 1
  }

  const getTopPerformers = (limit: number = 5): RankingEntry[] => {
    return getRankingData().slice(0, limit)
  }

  const clearNewAchievements = () => {
    setNewAchievements([])
  }

  return (
    <StudentProgressContext.Provider value={{
      progress,
      updateGameScore,
      resetProgress,
      getGameProgress,
      calculateOverallPerformance,
      getRankingData,
      getCurrentRank,
      getTopPerformers,
      calculateNormalizedScore,
      newAchievements,
      clearNewAchievements
    }}>
      {children}
    </StudentProgressContext.Provider>
  )
}

export function useStudentProgress() {
  const context = useContext(StudentProgressContext)
  if (context === undefined) {
    throw new Error('useStudentProgress must be used within a StudentProgressProvider')
  }
  return context
}

// Achievement definitions
export const achievements = {
  'first-game': {
    title: 'Primeiro Passo',
    description: 'Completou seu primeiro jogo de avaliação nutricional',
    icon: '🎯',
    color: 'blue'
  },
  'all-games': {
    title: 'Explorador Completo',
    description: 'Completou todos os jogos de avaliação nutricional',
    icon: '🏆',
    color: 'gold'
  },
  'perfect-score': {
    title: 'Pontuação Perfeita',
    description: 'Obteve pontuação máxima em um jogo',
    icon: '⭐',
    color: 'yellow'
  },
  'high-performer': {
    title: 'Alto Desempenho',
    description: 'Mantém média acima de 85% nos jogos',
    icon: '🚀',
    color: 'green'
  }
}

// Utility function to format time
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}
