'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Star,
  Medal,
  Zap,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRBAC } from '@/hooks/useRBAC'
import { useStudentProgress } from '@/contexts/StudentProgressContext'

interface PersonalProgress {
  overallScore: number
  moduleProgress: ModuleProgress[]
  achievements: Achievement[]
  rankingPosition: number
  totalStudents: number
}

interface ModuleProgress {
  moduleId: number
  moduleName: string
  isCompleted: boolean
  isLocked: boolean
  score: number
  maxScore: number
  completionDate?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earnedAt: string
  points: number
}

interface NextStep {
  type: 'module' | 'exercise' | 'collaboration'
  title: string
  description: string
  estimatedTime: string
  priority: 'high' | 'medium' | 'low'
}

export function StudentDashboard() {
  const { user, loading } = useRBAC()
  const { progress } = useStudentProgress()
  const [personalProgress, setPersonalProgress] = useState<PersonalProgress | null>(null)
  const [nextSteps, setNextSteps] = useState<NextStep[]>([])
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (user && user.role === 'student') {
      loadPersonalData()
    }
  }, [user, progress])

  const loadPersonalData = async () => {
    // Mock data for now - will be replaced with real Firestore queries
    const mockProgress: PersonalProgress = {
      overallScore: progress.totalScore,
      moduleProgress: [
        { moduleId: 1, moduleName: 'Indicadores Antropométricos', isCompleted: true, isLocked: false, score: 85, maxScore: 100, completionDate: '2024-01-15' },
        { moduleId: 2, moduleName: 'Indicadores Clínicos', isCompleted: false, isLocked: true, score: 0, maxScore: 100 },
        { moduleId: 3, moduleName: 'Fatores Socioeconômicos', isCompleted: false, isLocked: true, score: 0, maxScore: 100 },
        { moduleId: 4, moduleName: 'Curvas de Crescimento', isCompleted: progress.gamesCompleted >= 2, isLocked: false, score: progress.gamesCompleted >= 2 ? 78 : 0, maxScore: 100, completionDate: progress.gamesCompleted >= 2 ? '2024-01-20' : undefined },
      ],
      achievements: user.achievements.map(achievementId => ({
        id: achievementId,
        title: getAchievementTitle(achievementId),
        description: getAchievementDescription(achievementId),
        icon: getAchievementIcon(achievementId),
        rarity: getAchievementRarity(achievementId),
        earnedAt: '2024-01-15',
        points: getAchievementPoints(achievementId)
      })),
      rankingPosition: progress.currentRank,
      totalStudents: 45
    }

    const mockNextSteps: NextStep[] = [
      {
        type: 'module',
        title: 'Continuar Curvas de Crescimento',
        description: 'Complete os exercícios interativos de plotagem de dados antropométricos',
        estimatedTime: '15-20 min',
        priority: 'high'
      },
      {
        type: 'collaboration',
        title: 'Estudo de Caso Colaborativo',
        description: 'Participe de um exercício em dupla sobre avaliação nutricional',
        estimatedTime: '30-40 min',
        priority: 'medium'
      }
    ]

    const mockRecentAchievements: Achievement[] = progress.achievements.slice(-3).map(achievementId => ({
      id: achievementId,
      title: getAchievementTitle(achievementId),
      description: getAchievementDescription(achievementId),
      icon: getAchievementIcon(achievementId),
      rarity: getAchievementRarity(achievementId),
      earnedAt: '2024-01-20',
      points: getAchievementPoints(achievementId)
    }))

    setPersonalProgress(mockProgress)
    setNextSteps(mockNextSteps)
    setRecentAchievements(mockRecentAchievements)
  }

  // Helper functions for achievements
  const getAchievementTitle = (id: string): string => {
    const titles: Record<string, string> = {
      'first-game': 'Primeiro Passo',
      'perfect-score': 'Pontuação Perfeita',
      'quick-learner': 'Aprendiz Rápido',
      'high-performer': 'Alto Desempenho',
      'improvement-streak': 'Em Evolução'
    }
    return titles[id] || 'Conquista'
  }

  const getAchievementDescription = (id: string): string => {
    const descriptions: Record<string, string> = {
      'first-game': 'Completou seu primeiro jogo com sucesso',
      'perfect-score': 'Obteve pontuação máxima em um exercício',
      'quick-learner': 'Completou exercício em menos de 10 minutos',
      'high-performer': 'Mantém média acima de 85%',
      'improvement-streak': 'Melhorou a pontuação em 3 tentativas consecutivas'
    }
    return descriptions[id] || 'Conquista especial'
  }

  const getAchievementIcon = (id: string): string => {
    const icons: Record<string, string> = {
      'first-game': '🎯',
      'perfect-score': '⭐',
      'quick-learner': '⚡',
      'high-performer': '🏆',
      'improvement-streak': '📈'
    }
    return icons[id] || '🏅'
  }

  const getAchievementRarity = (id: string): 'common' | 'rare' | 'epic' | 'legendary' => {
    const rarities: Record<string, 'common' | 'rare' | 'epic' | 'legendary'> = {
      'first-game': 'common',
      'perfect-score': 'rare',
      'quick-learner': 'rare',
      'high-performer': 'epic',
      'improvement-streak': 'rare'
    }
    return rarities[id] || 'common'
  }

  const getAchievementPoints = (id: string): number => {
    const points: Record<string, number> = {
      'first-game': 10,
      'perfect-score': 25,
      'quick-learner': 20,
      'high-performer': 50,
      'improvement-streak': 30
    }
    return points[id] || 10
  }

  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      'common': 'text-gray-600 bg-gray-100',
      'rare': 'text-blue-600 bg-blue-100',
      'epic': 'text-purple-600 bg-purple-100',
      'legendary': 'text-yellow-600 bg-yellow-100'
    }
    return colors[rarity] || 'text-gray-600 bg-gray-100'
  }

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      'high': 'border-red-200 bg-red-50',
      'medium': 'border-yellow-200 bg-yellow-50',
      'low': 'border-green-200 bg-green-50'
    }
    return colors[priority] || 'border-gray-200 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Esta área é exclusiva para estudantes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meu Painel de Aprendizagem
          </h1>
          <p className="text-gray-600">
            Olá, {user.fullName}! • ID: {user.anonymousId} • NT600 - Avaliação Nutricional
          </p>
        </div>

        {/* Progress Overview */}
        {personalProgress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pontuação Total</p>
                      <p className="text-2xl font-bold text-gray-900">{personalProgress.overallScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Posição no Ranking</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {personalProgress.rankingPosition}º / {personalProgress.totalStudents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Módulos Concluídos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {personalProgress.moduleProgress.filter(m => m.isCompleted).length} / {personalProgress.moduleProgress.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conquistas</p>
                      <p className="text-2xl font-bold text-gray-900">{personalProgress.achievements.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Module Progress and Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Module Progress */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Progresso nos Módulos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalProgress?.moduleProgress.map((module) => (
                  <div key={module.moduleId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{module.moduleName}</h4>
                      <div className="flex items-center space-x-2">
                        {module.isCompleted && <Star className="w-4 h-4 text-yellow-500" />}
                        {module.isLocked && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Bloqueado</span>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${module.isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${(module.score / module.maxScore) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{module.score}/{module.maxScore} pontos</span>
                      {module.completionDate && (
                        <span>Concluído em {new Date(module.completionDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Próximos Passos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextSteps.map((step, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${getPriorityColor(step.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {step.estimatedTime}
                        </div>
                      </div>
                      <Button size="sm" className="ml-4">
                        Iniciar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Medal className="w-5 h-5 mr-2" />
                Conquistas Recentes
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{achievement.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-center text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {achievement.points} pontos
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
