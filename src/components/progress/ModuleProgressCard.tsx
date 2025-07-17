'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { ModuleProgress } from '@/lib/moduleProgressSystem'
import { useModuleProgress } from '@/contexts/ModuleProgressContext'
import { 
  CheckCircle, 
  Clock, 
  Lock, 
  PlayCircle, 
  Trophy, 
  Target,
  Star,
  BookOpen,
  Award
} from 'lucide-react'

interface ModuleProgressCardProps {
  moduleProgress: ModuleProgress
  onStartModule?: () => void
  onContinueModule?: () => void
  onViewDetails?: () => void
  className?: string
}

export function ModuleProgressCard({
  moduleProgress,
  onStartModule,
  onContinueModule,
  onViewDetails,
  className = ''
}: ModuleProgressCardProps) {
  const { canAccessModule } = useModuleProgress()
  const canAccess = canAccessModule(moduleProgress.moduleId)

  const {
    moduleName,
    isUnlocked,
    isCompleted,
    normalizedScore,
    completionPercentage,
    timeSpent,
    exercises,
    perfectExercises,
    averageAttempts
  } = moduleProgress

  // Estatísticas
  const completedExercises = exercises.filter(ex => ex.completed).length
  const totalExercises = exercises.length
  const hasStarted = completedExercises > 0

  // Status do módulo
  const getModuleStatus = () => {
    if (!isUnlocked) return { text: 'Bloqueado', color: 'gray', icon: Lock }
    if (isCompleted) return { text: 'Concluído', color: 'green', icon: CheckCircle }
    if (hasStarted) return { text: 'Em Progresso', color: 'blue', icon: PlayCircle }
    return { text: 'Disponível', color: 'yellow', icon: BookOpen }
  }

  const status = getModuleStatus()
  const StatusIcon = status.icon

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Nível de performance baseado na pontuação
  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { text: 'Excelente', color: 'green', icon: Trophy }
    if (score >= 80) return { text: 'Muito Bom', color: 'blue', icon: Award }
    if (score >= 70) return { text: 'Bom', color: 'yellow', icon: Star }
    if (score >= 60) return { text: 'Regular', color: 'orange', icon: Target }
    return { text: 'Precisa Melhorar', color: 'red', icon: Target }
  }

  const performance = getPerformanceLevel(normalizedScore)
  const PerformanceIcon = performance.icon

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      !canAccess ? 'opacity-50' : ''
    } ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {moduleName}
            </CardTitle>
            
            {/* Status Badge */}
            <Badge 
              variant={status.color === 'green' ? 'success' : 
                     status.color === 'blue' ? 'info' :
                     status.color === 'yellow' ? 'warning' : 'secondary'}
              className="mb-3"
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.text}
            </Badge>
          </div>

          {/* Score Badge (apenas se houver progresso) */}
          {hasStarted && (
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {normalizedScore}
                <span className="text-sm text-gray-500">/100</span>
              </div>
              {isCompleted && (
                <Badge variant={performance.color === 'green' ? 'success' : 'info'} className="mt-1">
                  <PerformanceIcon className="w-3 h-3 mr-1" />
                  {performance.text}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        {canAccess && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso dos Exercícios</span>
              <span>{completedExercises}/{totalExercises} completados</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2"
              indicatorClassName={
                isCompleted ? 'bg-green-500' :
                completionPercentage > 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }
            />
            <div className="text-xs text-gray-500 mt-1">
              {completionPercentage}% concluído
            </div>
          </div>
        )}

        {/* Estatísticas (apenas se houver progresso) */}
        {hasStarted && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="font-medium">Tempo Gasto</div>
                <div className="text-gray-600">{formatTime(timeSpent)}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <div>
                <div className="font-medium">Exercícios Perfeitos</div>
                <div className="text-gray-600">{perfectExercises}</div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex space-x-2 pt-2">
          {!canAccess ? (
            <Button disabled variant="outline" className="flex-1">
              <Lock className="w-4 h-4 mr-2" />
              Bloqueado
            </Button>
          ) : !hasStarted ? (
            <Button 
              onClick={onStartModule}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Iniciar Módulo
            </Button>
          ) : !isCompleted ? (
            <Button 
              onClick={onContinueModule}
              variant="outline"
              className="flex-1"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={onContinueModule}
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Revisar
            </Button>
          )}

          {hasStarted && (
            <Button 
              onClick={onViewDetails}
              variant="ghost"
              size="sm"
            >
              <Target className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Indicador de Conquista (módulo concluído) */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <div className="flex items-center space-x-2 text-green-800">
              <Trophy className="w-5 h-5" />
              <span className="font-medium">Módulo Concluído!</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              Parabéns! Você dominou este módulo com {normalizedScore}% de aproveitamento.
            </div>
          </div>
        )}

        {/* Próximos passos (se não concluído) */}
        {canAccess && !isCompleted && hasStarted && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Próximo passo:</span>
              {" "}Completar os exercícios restantes para desbloquear o próximo módulo.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ModuleProgressCard