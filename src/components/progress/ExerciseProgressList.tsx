'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { ExerciseProgress } from '@/lib/moduleProgressSystem'
import { 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  RotateCcw,
  Trophy, 
  Target,
  Star,
  TrendingUp,
  AlertCircle,
  BookOpen
} from 'lucide-react'

interface ExerciseProgressListProps {
  exercises: ExerciseProgress[]
  moduleId: string
  onStartExercise?: (exerciseId: string) => void
  onRetryExercise?: (exerciseId: string) => void
  onViewExercise?: (exerciseId: string) => void
  className?: string
}

interface ExerciseProgressItemProps {
  exercise: ExerciseProgress
  exerciseNumber: number
  onStart?: () => void
  onRetry?: () => void
  onView?: () => void
}

function ExerciseProgressItem({
  exercise,
  exerciseNumber,
  onStart,
  onRetry,
  onView
}: ExerciseProgressItemProps) {
  const {
    exerciseId,
    completed,
    normalizedScore,
    attempts,
    timeSpent,
    bestScore,
    improvement,
    completedAt
  } = exercise

  // Status do exercício
  const getExerciseStatus = () => {
    if (completed && normalizedScore >= 90) return { text: 'Excelente', color: 'green', icon: Trophy }
    if (completed && normalizedScore >= 80) return { text: 'Muito Bom', color: 'blue', icon: Star }
    if (completed && normalizedScore >= 70) return { text: 'Bom', color: 'yellow', icon: Target }
    if (completed) return { text: 'Concluído', color: 'gray', icon: CheckCircle }
    if (attempts > 0) return { text: 'Em Progresso', color: 'blue', icon: PlayCircle }
    return { text: 'Não Iniciado', color: 'gray', icon: BookOpen }
  }

  const status = getExerciseStatus()
  const StatusIcon = status.icon

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  // Cores baseadas na pontuação
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      completed ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              completed ? 'bg-green-100 text-green-800' : 
              attempts > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {exerciseNumber}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">
                Exercício {exerciseNumber}
              </h4>
              <Badge 
                variant={status.color === 'green' ? 'success' : 
                        status.color === 'blue' ? 'info' :
                        status.color === 'yellow' ? 'warning' : 'secondary'}
                className="text-xs"
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {status.text}
              </Badge>
            </div>
          </div>

          {/* Pontuação */}
          {completed && (
            <div className="text-right">
              <div className={`text-xl font-bold ${getScoreColor(normalizedScore)}`}>
                {normalizedScore}
                <span className="text-sm text-gray-500">/100</span>
              </div>
              {improvement > 0 && (
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{improvement.toFixed(1)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Barra de progresso (apenas se iniciado) */}
        {attempts > 0 && (
          <div className="mb-3">
            <Progress 
              value={normalizedScore} 
              className="h-2"
              indicatorClassName={
                normalizedScore >= 90 ? 'bg-green-500' :
                normalizedScore >= 80 ? 'bg-blue-500' :
                normalizedScore >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
              }
            />
          </div>
        )}

        {/* Estatísticas */}
        {attempts > 0 && (
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Tempo: {formatTime(timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <RotateCcw className="w-3 h-3" />
              <span>Tentativas: {attempts}</span>
            </div>
          </div>
        )}

        {/* Data de conclusão */}
        {completed && completedAt && (
          <div className="text-xs text-gray-500 mb-3">
            Concluído em {completedAt.toLocaleDateString('pt-BR')} às {completedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex space-x-2">
          {!attempts ? (
            <Button 
              onClick={onStart}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Iniciar
            </Button>
          ) : !completed ? (
            <Button 
              onClick={onStart}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={onView}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Revisar
            </Button>
          )}

          {completed && normalizedScore < 90 && (
            <Button 
              onClick={onRetry}
              size="sm"
              variant="ghost"
              className="px-3"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Dicas de melhoria */}
        {completed && normalizedScore < 80 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center space-x-1 text-yellow-800">
              <AlertCircle className="w-3 h-3" />
              <span className="font-medium">Dica:</span>
            </div>
            <div className="text-yellow-700 mt-1">
              {normalizedScore < 60 
                ? 'Revise o conteúdo teórico antes de tentar novamente.'
                : 'Tente novamente para melhorar sua pontuação e compreensão.'}
            </div>
          </div>
        )}

        {/* Conquista de pontuação perfeita */}
        {completed && normalizedScore >= 95 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
            <div className="flex items-center space-x-1 text-green-800">
              <Trophy className="w-3 h-3" />
              <span className="font-medium">Excelente!</span>
            </div>
            <div className="text-green-700 mt-1">
              Pontuação quase perfeita! Você domina este tópico.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ExerciseProgressList({
  exercises,
  moduleId,
  onStartExercise,
  onRetryExercise,
  onViewExercise,
  className = ''
}: ExerciseProgressListProps) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum exercício encontrado
        </h3>
        <p className="text-gray-600">
          Este módulo ainda não possui exercícios cadastrados.
        </p>
      </div>
    )
  }

  // Estatísticas dos exercícios
  const completedExercises = exercises.filter(ex => ex.completed).length
  const totalExercises = exercises.length
  const averageScore = exercises.filter(ex => ex.completed).length > 0 
    ? exercises.filter(ex => ex.completed).reduce((sum, ex) => sum + ex.normalizedScore, 0) / completedExercises
    : 0
  const perfectScores = exercises.filter(ex => ex.normalizedScore >= 95).length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com estatísticas */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Progresso dos Exercícios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {completedExercises}/{totalExercises}
              </div>
              <div className="text-sm text-gray-600">Concluídos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {averageScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Média</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {perfectScores}
              </div>
              <div className="text-sm text-gray-600">Perfeitos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((completedExercises / totalExercises) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progresso</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de exercícios */}
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <ExerciseProgressItem
            key={exercise.exerciseId}
            exercise={exercise}
            exerciseNumber={index + 1}
            onStart={() => onStartExercise?.(exercise.exerciseId)}
            onRetry={() => onRetryExercise?.(exercise.exerciseId)}
            onView={() => onViewExercise?.(exercise.exerciseId)}
          />
        ))}
      </div>

      {/* Resumo final */}
      {completedExercises === totalExercises && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="text-center py-6">
            <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Módulo Concluído!
            </h3>
            <p className="text-green-700 mb-3">
              Parabéns! Você completou todos os exercícios com uma média de {averageScore.toFixed(1)}%.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Badge variant="success">
                {perfectScores} exercícios perfeitos
              </Badge>
              {averageScore >= 80 && (
                <Badge variant="info">
                  Desempenho excelente
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExerciseProgressList