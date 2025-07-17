'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useModuleProgress } from '@/contexts/ModuleProgressContext'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Zap,
  Crown,
  X,
  Bell
} from 'lucide-react'

export interface Achievement {
  id: string
  type: 'module_completed' | 'exercise_completed' | 'perfect_score' | 'streak' | 'rank_up' | 'level_up' | 'time_bonus' | 'improvement'
  title: string
  description: string
  icon: React.ReactNode
  color: string
  points?: number
  moduleId?: string
  exerciseId?: string
  timestamp: Date
}

export interface ProgressNotification {
  id: string
  type: 'achievement' | 'milestone' | 'encouragement' | 'tip'
  message: string
  subMessage?: string
  icon: React.ReactNode
  color: string
  duration: number // em segundos
  actionLabel?: string
  onAction?: () => void
  timestamp: Date
}

// Definições de conquistas
const ACHIEVEMENT_DEFINITIONS: { [key: string]: Omit<Achievement, 'id' | 'timestamp'> } = {
  first_exercise_completed: {
    type: 'exercise_completed',
    title: 'Primeiro Passo!',
    description: 'Você completou seu primeiro exercício',
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'blue',
    points: 10
  },
  perfect_score: {
    type: 'perfect_score',
    title: 'Pontuação Perfeita!',
    description: 'Você obteve mais de 95% em um exercício',
    icon: <Star className="w-6 h-6" />,
    color: 'yellow',
    points: 25
  },
  module_completed: {
    type: 'module_completed',
    title: 'Módulo Concluído!',
    description: 'Parabéns! Você dominou este módulo',
    icon: <Trophy className="w-6 h-6" />,
    color: 'green',
    points: 50
  },
  streak_7_days: {
    type: 'streak',
    title: 'Sequência de Ouro!',
    description: '7 dias consecutivos estudando',
    icon: <Zap className="w-6 h-6" />,
    color: 'orange',
    points: 30
  },
  rank_up_top_10: {
    type: 'rank_up',
    title: 'Top 10!',
    description: 'Você entrou no top 10 do ranking',
    icon: <Crown className="w-6 h-6" />,
    color: 'purple',
    points: 40
  },
  level_up_intermediario: {
    type: 'level_up',
    title: 'Nível Intermediário!',
    description: 'Você avançou para o nível Intermediário',
    icon: <Award className="w-6 h-6" />,
    color: 'blue',
    points: 35
  },
  level_up_avancado: {
    type: 'level_up',
    title: 'Nível Avançado!',
    description: 'Você avançou para o nível Avançado',
    icon: <Award className="w-6 h-6" />,
    color: 'green',
    points: 50
  },
  level_up_expert: {
    type: 'level_up',
    title: 'Expert em Avaliação Nutricional!',
    description: 'Você alcançou o nível máximo!',
    icon: <Crown className="w-6 h-6" />,
    color: 'purple',
    points: 100
  },
  time_bonus: {
    type: 'time_bonus',
    title: 'Resposta Rápida!',
    description: 'Você respondeu muito rapidamente',
    icon: <Clock className="w-6 h-6" />,
    color: 'cyan',
    points: 15
  },
  improvement: {
    type: 'improvement',
    title: 'Melhoria Significativa!',
    description: 'Sua pontuação melhorou em mais de 20%',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'green',
    points: 20
  }
}

interface ProgressNotificationSystemProps {
  className?: string
}

export function ProgressNotificationSystem({ className = '' }: ProgressNotificationSystemProps) {
  const { newAchievements, clearNewAchievements, studentProgress } = useModuleProgress()
  const [notifications, setNotifications] = useState<ProgressNotification[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])

  // Processar novas conquistas
  useEffect(() => {
    if (newAchievements.length > 0) {
      const newAchievementObjects = newAchievements.map(achievementId => {
        const definition = ACHIEVEMENT_DEFINITIONS[achievementId] || ACHIEVEMENT_DEFINITIONS.first_exercise_completed
        return {
          id: `${achievementId}-${Date.now()}`,
          ...definition,
          timestamp: new Date()
        }
      })

      setAchievements(prev => [...newAchievementObjects, ...prev.slice(0, 9)]) // Manter apenas 10 mais recentes
      
      // Converter conquistas em notificações
      const achievementNotifications = newAchievementObjects.map(achievement => ({
        id: `notif-${achievement.id}`,
        type: 'achievement' as const,
        message: achievement.title,
        subMessage: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        duration: 5,
        timestamp: new Date()
      }))

      setNotifications(prev => [...achievementNotifications, ...prev])
      
      // Limpar conquistas após processamento
      setTimeout(() => clearNewAchievements(), 100)
    }
  }, [newAchievements, clearNewAchievements])

  // Gerar notificações de marco baseadas no progresso
  useEffect(() => {
    if (!studentProgress) return

    const { overallProgress, totalNormalizedScore, completedModules } = studentProgress
    const milestoneNotifications: ProgressNotification[] = []

    // Marcos de progresso
    if (overallProgress === 25 && completedModules === 1) {
      milestoneNotifications.push({
        id: `milestone-25-${Date.now()}`,
        type: 'milestone',
        message: '25% Concluído!',
        subMessage: 'Você está no caminho certo. Continue assim!',
        icon: <Target className="w-6 h-6" />,
        color: 'blue',
        duration: 4,
        actionLabel: 'Próximo Módulo',
        onAction: () => console.log('Navegar para próximo módulo'),
        timestamp: new Date()
      })
    }

    if (overallProgress === 50 && completedModules === 2) {
      milestoneNotifications.push({
        id: `milestone-50-${Date.now()}`,
        type: 'milestone',
        message: 'Metade do Caminho!',
        subMessage: '50% concluído. Você está indo muito bem!',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'green',
        duration: 4,
        timestamp: new Date()
      })
    }

    if (overallProgress === 100) {
      milestoneNotifications.push({
        id: `milestone-100-${Date.now()}`,
        type: 'milestone',
        message: 'Curso Concluído!',
        subMessage: 'Parabéns! Você dominou a Avaliação Nutricional!',
        icon: <Crown className="w-6 h-6" />,
        color: 'purple',
        duration: 6,
        timestamp: new Date()
      })
    }

    // Pontuação alta
    if (totalNormalizedScore >= 300 && totalNormalizedScore < 320) {
      milestoneNotifications.push({
        id: `score-300-${Date.now()}`,
        type: 'milestone',
        message: 'Pontuação de Elite!',
        subMessage: 'Mais de 300 pontos! Você é um estudante excepcional!',
        icon: <Star className="w-6 h-6" />,
        color: 'yellow',
        duration: 4,
        timestamp: new Date()
      })
    }

    if (milestoneNotifications.length > 0) {
      setNotifications(prev => [...milestoneNotifications, ...prev])
    }
  }, [studentProgress])

  // Gerar dicas e encorajamento
  useEffect(() => {
    if (!studentProgress) return

    const encouragementNotifications: ProgressNotification[] = []
    const { overallProgress, currentStreak, isActive } = studentProgress

    // Encorajamento para estudantes iniciantes
    if (overallProgress < 10 && isActive) {
      encouragementNotifications.push({
        id: `encourage-start-${Date.now()}`,
        type: 'encouragement',
        message: 'Bem-vindo à AvaliaNutri!',
        subMessage: 'Comece devagar e seja consistente. Você consegue!',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'blue',
        duration: 4,
        timestamp: new Date()
      })
    }

    // Parabenizar sequência
    if (currentStreak >= 3 && currentStreak < 7) {
      encouragementNotifications.push({
        id: `streak-${currentStreak}-${Date.now()}`,
        type: 'encouragement',
        message: `${currentStreak} dias consecutivos!`,
        subMessage: 'Consistência é a chave do sucesso!',
        icon: <Zap className="w-6 h-6" />,
        color: 'orange',
        duration: 3,
        timestamp: new Date()
      })
    }

    // Dica para inatividade
    if (!isActive) {
      encouragementNotifications.push({
        id: `tip-inactive-${Date.now()}`,
        type: 'tip',
        message: 'Que tal estudar um pouquinho hoje?',
        subMessage: 'Mesmo 10 minutos fazem a diferença!',
        icon: <Bell className="w-6 h-6" />,
        color: 'yellow',
        duration: 5,
        actionLabel: 'Estudar Agora',
        timestamp: new Date()
      })
    }

    if (encouragementNotifications.length > 0) {
      setNotifications(prev => [...encouragementNotifications, ...prev])
    }
  }, [studentProgress])

  // Auto-remover notificações após o tempo especificado
  useEffect(() => {
    const timers = notifications.map(notification => {
      return setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, notification.duration * 1000)
    })

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [notifications])

  // Remover notificação manualmente
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className={`fixed top-4 right-4 z-50 space-y-2 max-w-sm ${className}`}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <NotificationCard
              notification={notification}
              onDismiss={() => dismissNotification(notification.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface NotificationCardProps {
  notification: ProgressNotification
  onDismiss: () => void
}

function NotificationCard({ notification, onDismiss }: NotificationCardProps) {
  const getBackgroundClass = (type: string, color: string) => {
    const baseClass = 'bg-gradient-to-r'
    
    switch (color) {
      case 'green': return `${baseClass} from-green-500 to-emerald-500 text-white`
      case 'blue': return `${baseClass} from-blue-500 to-cyan-500 text-white`
      case 'purple': return `${baseClass} from-purple-500 to-indigo-500 text-white`
      case 'yellow': return `${baseClass} from-yellow-400 to-orange-400 text-white`
      case 'orange': return `${baseClass} from-orange-500 to-red-500 text-white`
      case 'cyan': return `${baseClass} from-cyan-400 to-blue-400 text-white`
      default: return `${baseClass} from-gray-500 to-gray-600 text-white`
    }
  }

  return (
    <Card className={`shadow-lg border-0 overflow-hidden ${getBackgroundClass(notification.type, notification.color)}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {notification.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-sm leading-tight">
                  {notification.message}
                </h4>
                {notification.subMessage && (
                  <p className="text-xs opacity-90 mt-1">
                    {notification.subMessage}
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-white hover:bg-white/20 p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {notification.actionLabel && notification.onAction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={notification.onAction}
                className="mt-2 text-white hover:bg-white/20 text-xs p-1 h-auto"
              >
                {notification.actionLabel}
              </Button>
            )}
          </div>
        </div>
        
        {/* Barra de progresso do tempo */}
        <motion.div 
          className="h-1 bg-white/30 rounded-full mt-3 overflow-hidden"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration, ease: 'linear' }}
        >
          <div className="h-full bg-white/60 rounded-full" />
        </motion.div>
      </CardContent>
    </Card>
  )
}

// Hook para usar o sistema de notificações
export function useProgressNotifications() {
  const { newAchievements, clearNewAchievements } = useModuleProgress()
  
  const triggerAchievement = (achievementId: string) => {
    // Simular nova conquista para testes
    console.log('Conquista ativada:', achievementId)
  }
  
  const triggerMilestone = (message: string, subMessage?: string) => {
    // Simular marco para testes
    console.log('Marco ativado:', message, subMessage)
  }
  
  return {
    newAchievements,
    clearNewAchievements,
    triggerAchievement,
    triggerMilestone
  }
}

export default ProgressNotificationSystem