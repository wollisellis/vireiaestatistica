'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { useModuleProgress } from '@/contexts/ModuleProgressContext'
import ModuleProgressCard from './ModuleProgressCard'
import { 
  Trophy, 
  Clock, 
  Target, 
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Star,
  CheckCircle2,
  Activity
} from 'lucide-react'

interface OverallProgressDashboardProps {
  onModuleClick?: (moduleId: string) => void
  className?: string
}

export function OverallProgressDashboard({
  onModuleClick,
  className = ''
}: OverallProgressDashboardProps) {
  const { 
    studentProgress, 
    isLoading, 
    getProgressReport,
    newAchievements 
  } = useModuleProgress()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!studentProgress) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum progresso encontrado
        </h3>
        <p className="text-gray-600">
          Comece seu primeiro módulo para ver seu progresso aqui.
        </p>
      </div>
    )
  }

  const {
    modules,
    totalNormalizedScore,
    overallProgress,
    currentStreak,
    totalTimeSpent,
    achievementLevel,
    lastActivity
  } = studentProgress

  const report = getProgressReport()
  
  // Estatísticas gerais
  const completedModules = modules.filter(m => m.isCompleted).length
  const totalModules = modules.length
  const inProgressModules = modules.filter(m => 
    !m.isCompleted && m.exercises.some(e => e.completed)
  ).length

  // Formatação de tempo
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  // Nível de performance geral
  const getOverallPerformance = () => {
    if (overallProgress >= 100) return { text: 'Expert', color: 'purple', icon: Trophy }
    if (overallProgress >= 75) return { text: 'Avançado', color: 'green', icon: Award }
    if (overallProgress >= 50) return { text: 'Intermediário', color: 'blue', icon: Target }
    if (overallProgress >= 25) return { text: 'Progredindo', color: 'yellow', icon: TrendingUp }
    return { text: 'Iniciante', color: 'gray', icon: BookOpen }
  }

  const performance = getOverallPerformance()
  const PerformanceIcon = performance.icon

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas gerais */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <span>Progresso Geral - AvaliaNutri</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Progresso Geral */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {overallProgress}%
              </div>
              <div className="text-sm text-gray-600">Progresso Geral</div>
              <Progress value={overallProgress} className="mt-2 h-2" />
            </div>

            {/* Pontuação Total */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {totalNormalizedScore}
                <span className="text-lg text-gray-500">/400</span>
              </div>
              <div className="text-sm text-gray-600">Pontuação Total</div>
              <Badge 
                variant={performance.color === 'purple' ? 'success' : 'info'} 
                className="mt-2"
              >
                <PerformanceIcon className="w-3 h-3 mr-1" />
                {achievementLevel}
              </Badge>
            </div>

            {/* Módulos Concluídos */}
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {completedModules}
                <span className="text-lg text-gray-500">/{totalModules}</span>
              </div>
              <div className="text-sm text-gray-600">Módulos Concluídos</div>
              <div className="flex justify-center space-x-1 mt-2">
                {Array.from({ length: totalModules }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < completedModules ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tempo Total */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {formatTime(totalTimeSpent)}
              </div>
              <div className="text-sm text-gray-600">Tempo Estudado</div>
              {currentStreak > 0 && (
                <Badge variant="warning" className="mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  {currentStreak} dias
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas Recentes */}
      {newAchievements.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Trophy className="w-5 h-5" />
              <span>Conquistas Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {newAchievements.map((achievement, index) => (
                <Badge key={index} variant="warning" className="animate-pulse">
                  <Star className="w-3 h-3 mr-1" />
                  {achievement.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Progresso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Módulos Concluídos: {completedModules}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Em Progresso: {inProgressModules}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Última Atividade: {lastActivity.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="text-sm p-2 bg-blue-50 rounded border-l-2 border-blue-500">
                  {recommendation}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.nextSteps.slice(0, 3).map((step, index) => (
                <div key={index} className="text-sm p-2 bg-green-50 rounded border-l-2 border-green-500">
                  {step}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Módulos */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Módulos da Disciplina</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <ModuleProgressCard
              key={module.moduleId}
              moduleProgress={module}
              onStartModule={() => onModuleClick?.(module.moduleId)}
              onContinueModule={() => onModuleClick?.(module.moduleId)}
              onViewDetails={() => onModuleClick?.(module.moduleId)}
            />
          ))}
        </div>
      </div>

      {/* CTA para próxima ação */}
      {overallProgress < 100 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Continue Sua Jornada de Aprendizado
            </h3>
            <p className="text-indigo-700 mb-4">
              Você está no nível {achievementLevel}. Continue estudando para se tornar um Expert!
            </p>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                const nextModule = modules.find(m => !m.isCompleted && m.isUnlocked)
                if (nextModule) onModuleClick?.(nextModule.moduleId)
              }}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Continuar Estudando
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OverallProgressDashboard