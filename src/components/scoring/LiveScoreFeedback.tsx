'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Target,
  Flame,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface LiveScoreFeedbackProps {
  currentScore: number
  streak: number
  lastAnswerTime: number
  lastAnswerCorrect: boolean
  showFeedback: boolean
  hintsUsed: number
  questionsAnswered: number
  totalQuestions: number
}

interface Feedback {
  id: string
  type: 'success' | 'bonus' | 'warning' | 'streak'
  message: string
  icon: React.ReactNode
  points?: number
}

export function LiveScoreFeedback({
  currentScore,
  streak,
  lastAnswerTime,
  lastAnswerCorrect,
  showFeedback,
  hintsUsed,
  questionsAnswered,
  totalQuestions
}: LiveScoreFeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [comboLevel, setComboLevel] = useState(0)

  // Calculate combo level based on streak
  useEffect(() => {
    if (streak >= 20) setComboLevel(5)
    else if (streak >= 15) setComboLevel(4)
    else if (streak >= 10) setComboLevel(3)
    else if (streak >= 5) setComboLevel(2)
    else if (streak >= 3) setComboLevel(1)
    else setComboLevel(0)
  }, [streak])

  // Generate feedback based on performance
  useEffect(() => {
    if (!showFeedback) return

    const newFeedback: Feedback[] = []

    if (lastAnswerCorrect) {
      // Basic correct answer feedback
      newFeedback.push({
        id: `correct-${Date.now()}`,
        type: 'success',
        message: 'Resposta Correta!',
        icon: <CheckCircle className="w-5 h-5" />,
        points: 100
      })

      // Time bonus feedback
      if (lastAnswerTime < 15) {
        newFeedback.push({
          id: `time-${Date.now()}`,
          type: 'bonus',
          message: 'Velocidade Relâmpago!',
          icon: <Zap className="w-5 h-5" />,
          points: 50
        })
      } else if (lastAnswerTime < 30) {
        newFeedback.push({
          id: `time-${Date.now()}`,
          type: 'bonus',
          message: 'Resposta Rápida!',
          icon: <Clock className="w-5 h-5" />,
          points: 25
        })
      }

      // Streak feedback
      if (streak === 3) {
        newFeedback.push({
          id: `streak-${Date.now()}`,
          type: 'streak',
          message: 'Sequência de 3!',
          icon: <TrendingUp className="w-5 h-5" />,
          points: 30
        })
      } else if (streak === 5) {
        newFeedback.push({
          id: `streak-${Date.now()}`,
          type: 'streak',
          message: 'Sequência de 5! Incrível!',
          icon: <Flame className="w-5 h-5" />,
          points: 50
        })
      } else if (streak === 10) {
        newFeedback.push({
          id: `streak-${Date.now()}`,
          type: 'streak',
          message: 'Sequência de 10! Fenomenal!',
          icon: <Star className="w-5 h-5" />,
          points: 100
        })
      } else if (streak === 15) {
        newFeedback.push({
          id: `streak-${Date.now()}`,
          type: 'streak',
          message: 'Sequência de 15! Lendário!',
          icon: <Star className="w-5 h-5" />,
          points: 150
        })
      } else if (streak === 20) {
        newFeedback.push({
          id: `streak-${Date.now()}`,
          type: 'streak',
          message: 'Sequência de 20! ÉPICO!',
          icon: <Star className="w-5 h-5" />,
          points: 200
        })
      }

      // No hints bonus
      if (questionsAnswered > 0 && hintsUsed === 0 && questionsAnswered % 5 === 0) {
        newFeedback.push({
          id: `nohints-${Date.now()}`,
          type: 'bonus',
          message: 'Sem Dicas! Impressionante!',
          icon: <Target className="w-5 h-5" />,
          points: 75
        })
      }
    } else {
      // Wrong answer feedback
      newFeedback.push({
        id: `wrong-${Date.now()}`,
        type: 'warning',
        message: 'Resposta Incorreta',
        icon: <AlertTriangle className="w-5 h-5" />
      })

      if (streak >= 5) {
        newFeedback.push({
          id: `streak-lost-${Date.now()}`,
          type: 'warning',
          message: `Sequência de ${streak} perdida`,
          icon: <TrendingUp className="w-5 h-5 rotate-180" />
        })
      }
    }

    setFeedbacks(prev => [...prev, ...newFeedback])

    // Remove feedbacks after animation
    newFeedback.forEach(feedback => {
      setTimeout(() => {
        setFeedbacks(prev => prev.filter(f => f.id !== feedback.id))
      }, 3000)
    })
  }, [showFeedback, lastAnswerCorrect, lastAnswerTime, streak, hintsUsed, questionsAnswered])

  const getComboColor = () => {
    switch (comboLevel) {
      case 1: return 'text-blue-600 bg-blue-100'
      case 2: return 'text-green-600 bg-green-100'
      case 3: return 'text-purple-600 bg-purple-100'
      case 4: return 'text-orange-600 bg-orange-100'
      case 5: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getComboMessage = () => {
    switch (comboLevel) {
      case 1: return 'Combo x1.1'
      case 2: return 'Combo x1.2'
      case 3: return 'Super Combo x1.5'
      case 4: return 'Mega Combo x2.0'
      case 5: return 'ULTRA COMBO x2.5'
      default: return ''
    }
  }

  return (
    <>
      {/* Score and Progress Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Pontuação: {currentScore}</span>
            </div>
            {comboLevel > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1 rounded-full text-sm font-bold ${getComboColor()}`}
              >
                {getComboMessage()}
              </motion.div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(questionsAnswered / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-center">
            {questionsAnswered} de {totalQuestions} questões respondidas
          </p>
        </div>
      </div>

      {/* Floating Feedback */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <AnimatePresence>
          {feedbacks.map((feedback, index) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 50, x: 0 }}
              animate={{ 
                opacity: 1, 
                y: -index * 60,
                x: feedback.type === 'streak' ? [-10, 10, -10, 10, 0] : 0
              }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ 
                duration: 0.5,
                x: { duration: 0.3, repeat: feedback.type === 'streak' ? 1 : 0 }
              }}
              className={`mb-2 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${
                feedback.type === 'success' ? 'bg-green-500 text-white' :
                feedback.type === 'bonus' ? 'bg-blue-500 text-white' :
                feedback.type === 'streak' ? 'bg-purple-500 text-white' :
                'bg-yellow-500 text-white'
              }`}
            >
              {feedback.icon}
              <span className="font-medium">{feedback.message}</span>
              {feedback.points && (
                <span className="font-bold">+{feedback.points}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Streak Indicator */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
            streak >= 20 ? 'bg-red-500 text-white' :
            streak >= 15 ? 'bg-orange-500 text-white' :
            streak >= 10 ? 'bg-purple-500 text-white' :
            streak >= 5 ? 'bg-green-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <Flame className={`w-5 h-5 ${streak >= 10 ? 'animate-pulse' : ''}`} />
            <span className="font-bold">Sequência: {streak}</span>
          </div>
        </motion.div>
      )}
    </>
  )
}