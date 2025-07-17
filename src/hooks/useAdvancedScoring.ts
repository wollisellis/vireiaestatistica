import { useState, useCallback, useRef } from 'react'
import { QuestionMetrics, ScoreCalculation, EnhancedScoringSystem } from '@/lib/scoringSystem'
import { useStudentProgress } from '@/contexts/StudentProgressContext'

interface UseAdvancedScoringProps {
  gameId: number
  totalQuestions: number
  difficulty?: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  isCollaborative?: boolean
}

interface UseAdvancedScoringReturn {
  // State
  currentScore: number
  streak: number
  questionMetrics: QuestionMetrics[]
  scoreCalculation: ScoreCalculation | null
  
  // Actions
  recordAnswer: (correct: boolean, timeSpent: number, hintsUsed: number) => void
  calculateFinalScore: () => ScoreCalculation
  resetScoring: () => void
  
  // Utilities
  getCurrentQuestionNumber: () => number
  getAccuracy: () => number
  getAverageTime: () => number
}

export function useAdvancedScoring({
  gameId,
  totalQuestions,
  difficulty = 'medio',
  isCollaborative = false
}: UseAdvancedScoringProps): UseAdvancedScoringReturn {
  const { updateGameScoreAdvanced } = useStudentProgress()
  
  // State
  const [currentScore, setCurrentScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [questionMetrics, setQuestionMetrics] = useState<QuestionMetrics[]>([])
  const [scoreCalculation, setScoreCalculation] = useState<ScoreCalculation | null>(null)
  
  // Refs for timing
  const questionStartTime = useRef<number>(Date.now())
  const gameStartTime = useRef<number>(Date.now())
  
  // Record an answer
  const recordAnswer = useCallback((
    correct: boolean, 
    timeSpent: number, 
    hintsUsed: number = 0
  ) => {
    const newMetric: QuestionMetrics = {
      questionId: questionMetrics.length + 1,
      correct,
      timeSpent,
      hintsUsed,
      attempts: 1, // Could be enhanced to track multiple attempts
      difficulty
    }
    
    setQuestionMetrics(prev => [...prev, newMetric])
    
    // Update streak
    if (correct) {
      setStreak(prev => prev + 1)
      // Basic scoring for display (advanced calculation happens at the end)
      setCurrentScore(prev => prev + 100)
    } else {
      setStreak(0)
    }
    
    // Reset timer for next question
    questionStartTime.current = Date.now()
  }, [questionMetrics, difficulty])
  
  // Calculate final score
  const calculateFinalScore = useCallback(() => {
    const totalTimeElapsed = Math.floor((Date.now() - gameStartTime.current) / 1000)
    
    const calculation = EnhancedScoringSystem.calculateScore(
      questionMetrics,
      totalTimeElapsed,
      isCollaborative
    )
    
    setScoreCalculation(calculation)
    
    // Update progress with enhanced scoring
    updateGameScoreAdvanced(
      {
        gameId,
        score: calculation.finalScore,
        maxScore: 1000, // Normalized max score
        timeElapsed: totalTimeElapsed,
        completedAt: new Date(),
        exercisesCompleted: questionMetrics.filter(m => m.correct).length,
        totalExercises: totalQuestions,
        difficulty,
        isCollaborative
      },
      questionMetrics
    )
    
    return calculation
  }, [questionMetrics, isCollaborative, gameId, totalQuestions, difficulty, updateGameScoreAdvanced])
  
  // Reset scoring
  const resetScoring = useCallback(() => {
    setCurrentScore(0)
    setStreak(0)
    setQuestionMetrics([])
    setScoreCalculation(null)
    questionStartTime.current = Date.now()
    gameStartTime.current = Date.now()
  }, [])
  
  // Utility functions
  const getCurrentQuestionNumber = useCallback(() => {
    return questionMetrics.length + 1
  }, [questionMetrics])
  
  const getAccuracy = useCallback(() => {
    if (questionMetrics.length === 0) return 0
    const correct = questionMetrics.filter(m => m.correct).length
    return Math.round((correct / questionMetrics.length) * 100)
  }, [questionMetrics])
  
  const getAverageTime = useCallback(() => {
    if (questionMetrics.length === 0) return 0
    const totalTime = questionMetrics.reduce((sum, m) => sum + m.timeSpent, 0)
    return Math.round(totalTime / questionMetrics.length)
  }, [questionMetrics])
  
  return {
    // State
    currentScore,
    streak,
    questionMetrics,
    scoreCalculation,
    
    // Actions
    recordAnswer,
    calculateFinalScore,
    resetScoring,
    
    // Utilities
    getCurrentQuestionNumber,
    getAccuracy,
    getAverageTime
  }
}