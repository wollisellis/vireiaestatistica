'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  Home,
  BookOpen
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { gameDefinitions } from '@/lib/gameData'
import { useAuth, useGameProgress } from '@/hooks/useHybridAuth'

export interface GameState {
  currentQuestion: number
  currentLevel: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  score: number
  answers: any[]
  timeElapsed: number
  isCompleted: boolean
  feedback: string[]
  showEducation: boolean
}

export interface GameBaseProps {
  gameId: number
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
  children: React.ReactNode
  gameState: GameState
  onGameStateChange: (state: GameState) => void
  totalQuestions: number
  educationComponent?: React.ReactNode
  showLevelIndicator?: boolean
}

export function GameBase({
  gameId,
  onBack,
  onComplete,
  children,
  gameState,
  onGameStateChange,
  totalQuestions,
  educationComponent,
  showLevelIndicator = false
}: GameBaseProps) {
  const [startTime] = useState(Date.now())
  const [currentTime, setCurrentTime] = useState(Date.now())
  const { user } = useAuth()
  const userId = (user as { uid?: string; id?: string })?.uid || (user as { uid?: string; id?: string })?.id || ''
  const { updateProgress } = useGameProgress(userId)

  const game = gameDefinitions.find(g => g.id === gameId)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now())
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      onGameStateChange({
        ...gameState,
        timeElapsed: elapsed
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, gameState, onGameStateChange])

  const handleComplete = async () => {
    const finalScore = Math.round((gameState.score / game!.maxScore) * 100)
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000)
    
    // Update progress in database
    if (userId) {
      await updateProgress(gameId, finalScore, true)
    }
    
    onComplete(finalScore, timeElapsed)
  }

  const handleRestart = () => {
    onGameStateChange({
      currentQuestion: 0,
      currentLevel: 'muito-facil',
      score: 0,
      answers: [],
      timeElapsed: 0,
      isCompleted: false,
      feedback: [],
      showEducation: false
    })
  }

  const toggleEducation = () => {
    onGameStateChange({
      ...gameState,
      showEducation: !gameState.showEducation
    })
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'muito-facil': return 'text-green-600 bg-green-100'
      case 'facil': return 'text-blue-600 bg-blue-100'
      case 'medio': return 'text-yellow-600 bg-yellow-100'
      case 'dificil': return 'text-orange-600 bg-orange-100'
      case 'muito-dificil': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'muito-facil': return 'Muito Fácil'
      case 'facil': return 'Fácil'
      case 'medio': return 'Médio'
      case 'dificil': return 'Difícil'
      case 'muito-dificil': return 'Muito Difícil'
      default: return 'Desconhecido'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!game) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Jogo não encontrado</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Jogos
        </Button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
          <p className="text-gray-600">{game.description}</p>
          {showLevelIndicator && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(gameState.currentLevel)}`}>
                Nível: {getLevelLabel(gameState.currentLevel)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(gameState.timeElapsed)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="w-4 h-4" />
            <span>{gameState.score}/{game.maxScore}</span>
          </div>
          {educationComponent && (
            <button
              onClick={toggleEducation}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Conteúdo</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{gameState.currentQuestion + 1}/{totalQuestions}</span>
            </div>
            <ProgressBar 
              value={gameState.currentQuestion + 1} 
              max={totalQuestions}
              color="blue"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Education Content */}
      {gameState.showEducation && educationComponent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {educationComponent}
        </motion.div>
      )}

      {/* Game Content */}
      {!gameState.showEducation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {children}
        </motion.div>
      )}

      {/* Game Completion Modal */}
      {gameState.isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="mb-4">
                {gameState.score >= game.maxScore * 0.7 ? (
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-16 h-16 text-yellow-600 mx-auto" />
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Jogo Concluído!
              </h2>
              
              <div className="space-y-2 text-gray-600 mb-6">
                <p>Pontuação: {gameState.score}/{game.maxScore}</p>
                <p>Tempo: {formatTime(gameState.timeElapsed)}</p>
                <p>Precisão: {Math.round((gameState.score / game.maxScore) * 100)}%</p>
              </div>

              {gameState.score >= game.maxScore * 0.7 ? (
                <p className="text-green-600 font-medium mb-6">
                  Excelente trabalho! Você dominou este conceito.
                </p>
              ) : (
                <p className="text-yellow-600 font-medium mb-6">
                  Bom esforço! Considere revisar o material e tentar novamente.
                </p>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleRestart} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  <Home className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Learning Objectives Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="fixed right-4 top-1/2 transform -translate-y-1/2 w-64 hidden xl:block"
      >
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold">Objetivos de Aprendizado</h3>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-600 space-y-2">
              {game.learningObjectives.map((objective, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
