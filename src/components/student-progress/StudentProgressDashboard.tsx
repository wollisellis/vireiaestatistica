'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  BarChart3,
  CheckCircle,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useStudentProgress, achievements, formatTime } from '@/contexts/StudentProgressContext'
import { useRBAC } from '@/hooks/useRBAC'
import { AnonymousIdBadge } from '@/components/ui/AnonymousIdBadge'

interface StudentProgressDashboardProps {
  compact?: boolean
}

export function StudentProgressDashboard({ compact = false }: StudentProgressDashboardProps) {
  const { progress, resetProgress, calculateOverallPerformance } = useStudentProgress()
  const { user } = useRBAC()
  const performance = calculateOverallPerformance()

  // Calculate available games (unlocked games only)
  const getAvailableGames = () => {
    // Game 1 is always available
    // Game 2 unlocks after completing Game 1
    // Game 3 unlocks after completing Game 2
    // Game 4 unlocks after completing Game 3
    return Math.min(progress.gamesCompleted + 1, progress.totalGames)
  }

  const getPerformanceColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200'
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'red': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">Seu Progresso</h3>
                  {user?.anonymousId && (
                    <AnonymousIdBadge
                      anonymousId={user.anonymousId}
                      size="sm"
                      variant="student"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {progress.gamesCompleted}/{getAvailableGames()} jogos • {progress.averageScore.toFixed(0)}% média
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceColor(performance.color)}`}>
              {performance.performance}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Overall Performance */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Painel de Progresso</h2>
                <p className="text-gray-600">Acompanhe seu desenvolvimento em avaliação nutricional</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetProgress}
              className="text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{progress.gamesCompleted}</div>
              <div className="text-sm text-gray-600">Jogos Completos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.averageScore.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Média Geral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(progress.totalTimeSpent)}</div>
              <div className="text-sm text-gray-600">Tempo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{progress.achievements.length}</div>
              <div className="text-sm text-gray-600">Conquistas</div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${getPerformanceColor(performance.color)}`}>
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5" />
              <div>
                <div className="font-semibold">Desempenho: {performance.performance}</div>
                <div className="text-sm">{performance.recommendation}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Progress */}
      {progress.gameScores.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Progresso por Jogo</h3>
                <p className="text-sm text-gray-600">Detalhamento do seu desempenho em cada jogo</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.gameScores.map((gameScore) => {
                const percentage = (gameScore.score / gameScore.maxScore) * 100
                const gameNames = {
                  1: 'Indicadores Antropométricos',
                  2: 'Indicadores Clínicos e Bioquímicos',
                  3: 'Fatores Socioeconômicos'
                }
                
                return (
                  <div key={gameScore.gameId} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        Jogo {gameScore.gameId}: {gameNames[gameScore.gameId as keyof typeof gameNames]}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {gameScore.score}/{gameScore.maxScore} pontos
                        </span>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage >= 85 ? 'bg-green-500' :
                          percentage >= 70 ? 'bg-blue-500' :
                          percentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{percentage.toFixed(0)}% de acerto</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(gameScore.timeElapsed)}
                        </span>
                        <span className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          {gameScore.exercisesCompleted}/{gameScore.totalExercises} exercícios
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Conquistas Desbloqueadas</h3>
                <p className="text-sm text-gray-600">Marcos importantes do seu aprendizado</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progress.achievements.map((achievementId) => {
                const achievement = achievements[achievementId as keyof typeof achievements]
                if (!achievement) return null
                
                return (
                  <div key={achievementId} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Zap className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Dicas para Melhorar seu Desempenho</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• <strong>Revise o conteúdo educacional</strong> antes de cada jogo</li>
                <li>• <strong>Pratique regularmente</strong> - a repetição consolida o aprendizado</li>
                <li>• <strong>Analise os feedbacks</strong> dos exercícios para entender seus erros</li>
                <li>• <strong>Use as analogias do cotidiano</strong> para memorizar conceitos</li>
                <li>• <strong>Conecte os jogos</strong> com o material teórico da disciplina</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
