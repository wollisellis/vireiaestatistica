'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface GameScore {
  gameId: number
  score: number
  maxScore: number
  timeElapsed: number
  completedAt: Date
  exercisesCompleted: number
  totalExercises: number
  difficulty: string
}

export interface StudentProgress {
  studentId: string
  totalScore: number
  totalPossibleScore: number
  gamesCompleted: number
  totalGames: number
  averageScore: number
  totalTimeSpent: number
  gameScores: GameScore[]
  achievements: string[]
  lastActivity: Date
}

interface StudentProgressContextType {
  progress: StudentProgress
  updateGameScore: (gameScore: GameScore) => void
  resetProgress: () => void
  getGameProgress: (gameId: number) => GameScore | null
  calculateOverallPerformance: () => {
    performance: 'Excelente' | 'Bom' | 'Regular' | 'Precisa Melhorar'
    color: string
    recommendation: string
  }
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined)

const initialProgress: StudentProgress = {
  studentId: 'student-' + Date.now(),
  totalScore: 0,
  totalPossibleScore: 0,
  gamesCompleted: 0,
  totalGames: 4, // AvaliaNutri has 4 games
  averageScore: 0,
  totalTimeSpent: 0,
  gameScores: [],
  achievements: [],
  lastActivity: new Date()
}

export function StudentProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<StudentProgress>(initialProgress)

  // Load progress from localStorage on mount
  useEffect(() => {
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
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nt600-student-progress', JSON.stringify(progress))
  }, [progress])

  const updateGameScore = (gameScore: GameScore) => {
    setProgress(prev => {
      const existingScoreIndex = prev.gameScores.findIndex(score => score.gameId === gameScore.gameId)
      let newGameScores: GameScore[]
      
      if (existingScoreIndex >= 0) {
        // Update existing score
        newGameScores = [...prev.gameScores]
        newGameScores[existingScoreIndex] = gameScore
      } else {
        // Add new score
        newGameScores = [...prev.gameScores, gameScore]
      }

      // Calculate new totals
      const totalScore = newGameScores.reduce((sum, score) => sum + score.score, 0)
      const totalPossibleScore = newGameScores.reduce((sum, score) => sum + score.maxScore, 0)
      const totalTimeSpent = newGameScores.reduce((sum, score) => sum + score.timeElapsed, 0)
      const gamesCompleted = newGameScores.length
      const averageScore = gamesCompleted > 0 ? (totalScore / totalPossibleScore) * 100 : 0

      // Check for achievements
      const newAchievements = [...prev.achievements]
      
      // First game completed
      if (gamesCompleted === 1 && !newAchievements.includes('first-game')) {
        newAchievements.push('first-game')
      }
      
      // All games completed
      if (gamesCompleted === 3 && !newAchievements.includes('all-games')) {
        newAchievements.push('all-games')
      }
      
      // Perfect score on any game
      if (gameScore.score === gameScore.maxScore && !newAchievements.includes('perfect-score')) {
        newAchievements.push('perfect-score')
      }
      
      // High average (>85%)
      if (averageScore >= 85 && !newAchievements.includes('high-performer')) {
        newAchievements.push('high-performer')
      }

      return {
        ...prev,
        totalScore,
        totalPossibleScore,
        gamesCompleted,
        averageScore,
        totalTimeSpent,
        gameScores: newGameScores,
        achievements: newAchievements,
        lastActivity: new Date()
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

  return (
    <StudentProgressContext.Provider value={{
      progress,
      updateGameScore,
      resetProgress,
      getGameProgress,
      calculateOverallPerformance
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
