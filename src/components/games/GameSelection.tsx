'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Clock, 
  Target, 
  Trophy, 
  BookOpen,
  CheckCircle,
  Lock,
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { gameDefinitions } from '@/lib/gameData'

import { useAuth, useGameProgress } from '@/hooks/useHybridAuth'

interface GameSelectionProps {
  onGameSelect: (gameId: number) => void
}

export function GameSelection({ onGameSelect }: GameSelectionProps) {
  const { user } = useAuth()
  const userId = (user as { uid?: string; id?: string })?.uid || (user as { uid?: string; id?: string })?.id || ''
  const { progress } = useGameProgress(userId)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Pedagogical difficulty levels based on curriculum progression
  const difficultyLevels = [
    {
      id: 'muito-facil',
      label: 'Muito Fácil',
      icon: BookOpen,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Fundamentos - Zero conhecimento assumido',
      games: [11, 12, 15]
    },
    {
      id: 'facil',
      label: 'Fácil',
      icon: Target,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Estatística Descritiva Básica',
      games: [3, 4, 5]
    },
    {
      id: 'medio',
      label: 'Médio',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      description: 'Estatística Inferencial',
      games: [1, 2, 6, 7, 8, 9, 10]
    },
    {
      id: 'dificil',
      label: 'Difícil',
      icon: CheckCircle,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      description: 'Métodos Avançados',
      games: [31, 33, 34]
    },
    {
      id: 'muito-dificil',
      label: 'Muito Difícil',
      icon: Trophy,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Jogos Interativos Avançados',
      games: [35, 36, 37, 38]
    }
  ]

  const categories = [
    { id: 'all', label: 'Todos os Jogos', icon: BookOpen },
    ...difficultyLevels
  ]

  const filteredGames = selectedCategory === 'all'
    ? gameDefinitions
    : selectedCategory.startsWith('muito-') || ['facil', 'medio', 'dificil'].includes(selectedCategory)
      ? gameDefinitions.filter(game => {
          const level = difficultyLevels.find(l => l.id === selectedCategory)
          return level?.games.includes(game.id)
        })
      : gameDefinitions.filter(game => game.category === selectedCategory)

  const getGameProgress = (gameId: number) => {
    return progress.find(p => (p as any).gameId === gameId || (p as any).game_id === gameId)
  }

  const getDifficultyInfo = (gameId: number) => {
    for (const level of difficultyLevels) {
      if (level.games.includes(gameId)) {
        return {
          label: level.label,
          color: level.color,
          description: level.description
        }
      }
    }
    // Fallback for games not in difficulty levels
    return {
      label: 'Intermediário',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      description: 'Nível intermediário'
    }
  }

  const getCompletionBadge = (gameProgress: any, gameId: number) => {
    if (!gameProgress) return null

    const score = gameProgress.score || 0
    const maxScore = gameDefinitions.find(g => g.id === gameId)?.maxScore || 100
    const percentage = (score / maxScore) * 100

    if (percentage >= 80) {
      return (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
          <CheckCircle className="w-4 h-4" />
        </div>
      )
    }
    return null
  }

  const isGameUnlocked = () => {
    // All games are now immediately accessible
    return true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AvaliaNutri - Jogos de Avaliação Nutricional
        </h1>
        <p className="text-gray-600 text-lg mb-4">
          Aprenda avaliação nutricional através de jogos interativos com abordagem ultra-iniciante
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-blue-800 text-sm">
            <strong>Filosofia Pedagógica:</strong> Assumimos zero conhecimento prévio.
            Cada conceito é explicado com analogias do dia a dia e exemplos brasileiros de nutrição e esporte.
          </p>
        </div>
      </motion.div>

      {/* Difficulty Level Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-center text-gray-800">
          Escolha seu Nível de Dificuldade
        </h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory === category.id
            const levelInfo = difficultyLevels.find(l => l.id === category.id)

            return (
              <Button
                key={category.id}
                variant={isSelected ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center space-y-1 p-3 h-auto min-w-[120px] ${
                  levelInfo && !isSelected ? levelInfo.color : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{category.label}</span>
                {levelInfo && (
                  <span className="text-xs opacity-75 text-center">
                    {levelInfo.description}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      </motion.div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, index) => {
          const gameProgress = getGameProgress(game.id)
          const isUnlocked = isGameUnlocked()
          const isCompleted = gameProgress?.completed || false
          
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {getCompletionBadge(gameProgress, game.id)}
              <Card
                className={`h-full transition-all duration-200 ${
                  isUnlocked
                    ? 'hover:shadow-lg cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                } ${isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''}`}
                onClick={() => isUnlocked && onGameSelect(game.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {game.id}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                        {!isUnlocked && (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Difficulty and Time */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyInfo(game.id).color}`}>
                      {getDifficultyInfo(game.id).label}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{game.estimatedTime} min</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Learning Objectives */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Objetivos de Aprendizado:
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {game.learningObjectives.slice(0, 2).map((objective, idx) => (
                        <li key={idx} className="flex items-start space-x-1">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                      {game.learningObjectives.length > 2 && (
                        <li className="text-gray-400 text-xs">
                          +{game.learningObjectives.length - 2} mais...
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Progress */}
                  {gameProgress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Melhor Pontuação</span>
                        <span>{gameProgress.score}/{game.maxScore}</span>
                      </div>
                      <ProgressBar 
                        value={gameProgress.score} 
                        max={game.maxScore}
                        color={isCompleted ? 'green' : 'blue'}
                        size="sm"
                      />
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    disabled={!isUnlocked}
                    variant={isCompleted ? 'outline' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isUnlocked) onGameSelect(game.id)
                    }}
                  >
                    {!isUnlocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Bloqueado
                      </>
                    ) : isCompleted ? (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        Jogar Novamente
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Jogo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Learning Pathway Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-4"
      >
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Trilha de Aprendizado - Progresso por Nível</h3>
            <p className="text-sm text-gray-600">
              Siga a progressão pedagógica recomendada baseada no currículo universitário
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {difficultyLevels.map((level) => {
                const levelGames = gameDefinitions.filter(g => level.games.includes(g.id))
                const completedInLevel = progress.filter(p =>
                  p.completed && level.games.includes((p as any).gameId || (p as any).game_id)
                ).length
                const totalInLevel = levelGames.length
                const levelProgress = totalInLevel > 0 ? (completedInLevel / totalInLevel) * 100 : 0

                return (
                  <div key={level.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <level.icon className="w-5 h-5" />
                        <span className="font-medium">{level.label}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${level.color}`}>
                          {level.description}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {completedInLevel}/{totalInLevel}
                      </span>
                    </div>
                    <ProgressBar
                      value={completedInLevel}
                      max={totalInLevel}
                      color={levelProgress === 100 ? 'green' : 'blue'}
                      size="sm"
                    />
                  </div>
                )
              })}
            </div>

            {/* Overall Progress */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span className="font-medium">Progresso Geral da Plataforma</span>
                <span>{progress.filter(p => p.completed).length}/{gameDefinitions.length} jogos</span>
              </div>
              <ProgressBar
                value={progress.filter(p => p.completed).length}
                max={gameDefinitions.length}
                color="green"
              />
              <p className="text-xs text-gray-500 mt-2">
                Complete 80% ou mais em cada jogo para obter a marca de conclusão ✓
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
