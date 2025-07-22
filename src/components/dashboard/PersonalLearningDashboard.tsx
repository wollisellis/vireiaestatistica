'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle,
  Circle,
  Scale,
  BarChart3,
  Activity,
  Heart,
  User,
  Lightbulb,
  Star,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { useStudentProgress } from '@/contexts/StudentProgressContext'

interface PersonalLearningDashboardProps {
  compact?: boolean
  className?: string
}

// Competências nutricionais - APENAS MÓDULO 1
const NUTRITIONAL_COMPETENCIES = {
  'module-1': [
    { id: 'imc', name: 'Cálculo e Interpretação do IMC', icon: <Scale className="w-4 h-4" /> },
    { id: 'antropometria', name: 'Medidas Antropométricas', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'percentis', name: 'Interpretação de Percentis', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'curvas', name: 'Curvas de Crescimento', icon: <Activity className="w-4 h-4" /> }
  ]
}

const LEARNING_PATHS = [
  {
    id: 'foundational',
    name: 'Fundamentos da Avaliação Nutricional',
    modules: ['module-1'],
    description: 'Base essencial: indicadores antropométricos e medidas corporais',
    color: 'emerald'
  }
]

export const PersonalLearningDashboard: React.FC<PersonalLearningDashboardProps> = ({ 
  compact = false, 
  className = '' 
}) => {
  const { progress, calculateOverallPerformance } = useStudentProgress()
  const performance = calculateOverallPerformance()

  // Calcular competências dominadas - CORRIGIDO para usar gameId: 1
  const getMasteredCompetencies = () => {
    const mastered: string[] = []
    const inProgress: string[] = []
    
    // Buscar especificamente pelo jogo 1 (módulo de antropometria)
    const moduleScore = progress.gameScores.find(score => score.gameId === 1)
    
    if (moduleScore && NUTRITIONAL_COMPETENCIES['module-1']) {
      const completionRate = (moduleScore.score / moduleScore.maxScore) * 100
      const competencies = NUTRITIONAL_COMPETENCIES['module-1']
      
      competencies.forEach(comp => {
        if (completionRate >= 80) {
          mastered.push(comp.name)
        } else if (completionRate >= 50) {
          inProgress.push(comp.name)
        }
      })
    }
    
    return { mastered, inProgress }
  }

  const { mastered, inProgress } = getMasteredCompetencies()

  // Calcular progresso por trilha de aprendizagem - CORRIGIDO
  const getPathProgress = () => {
    return LEARNING_PATHS.map(path => {
      // Para o módulo 1, buscar pelo gameId: 1
      const moduleScore = progress.gameScores.find(score => score.gameId === 1)
      const averageProgress = moduleScore ? (moduleScore.score / moduleScore.maxScore) * 100 : 0
      
      return {
        ...path,
        progress: averageProgress,
        isCompleted: averageProgress >= 80,
        isInProgress: averageProgress > 0 && averageProgress < 80
      }
    })
  }

  const pathsProgress = getPathProgress()

  if (compact) {
    return (
      <Card className={`border-emerald-200 bg-emerald-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-800">Meu Progresso de Aprendizagem</h3>
            <Badge className="bg-emerald-600 text-white">{performance.performance}</Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{mastered.length}</div>
              <div className="text-sm text-emerald-700">Competências Dominadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{inProgress.length}</div>
              <div className="text-sm text-orange-600">Em Desenvolvimento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Visão Geral do Progresso */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-emerald-800 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Meu Percurso de Aprendizagem
            </h2>
            <Badge className={`text-white ${
              performance.color === 'green' ? 'bg-emerald-600' :
              performance.color === 'blue' ? 'bg-orange-500 hover:bg-orange-600 transition-colors' :
              performance.color === 'yellow' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {performance.performance}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas Principais */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-emerald-100">
              <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-600">{mastered.length}</div>
              <div className="text-sm text-emerald-700">Competências Dominadas</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-orange-100">
              <BookOpen className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-500">{inProgress.length}</div>
              <div className="text-sm text-orange-600">Em Desenvolvimento</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{progress.gamesCompleted}</div>
              <div className="text-sm text-purple-700">Jogos Realizados</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg border border-orange-100">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{progress.averageScore.toFixed(0)}%</div>
              <div className="text-sm text-orange-700">Precisão Média</div>
            </div>
          </div>

          {/* Recomendação Personalizada */}
          <div className="bg-white p-4 rounded-lg border border-emerald-200">
            <h3 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recomendação de Estudo
            </h3>
            <p className="text-emerald-700 text-sm">{performance.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Trilhas de Aprendizagem */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Trilhas de Aprendizagem
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {pathsProgress.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                path.isCompleted ? 'border-emerald-200 bg-emerald-50' :
                path.isInProgress ? 'border-orange-200 bg-orange-50' :
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {path.isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : path.isInProgress ? (
                    <Circle className="w-6 h-6 text-orange-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{path.name}</h4>
                    <p className="text-sm text-gray-600">{path.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{path.progress.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500">Concluído</div>
                </div>
              </div>
              
              <Progress value={path.progress} className="h-2 mb-2" />
              
              {path.isCompleted && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Trilha Dominada!</span>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Competências Nutricionais */}
      {mastered.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              Competências Dominadas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {mastered.map((competency, index) => (
                <motion.div
                  key={competency}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800 font-medium text-sm">{competency}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Objetivos */}
      {inProgress.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-orange-500" />
              Competências em Desenvolvimento
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgress.slice(0, 3).map((competency, index) => (
                <div key={competency} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Circle className="w-5 h-5 text-orange-500" />
                    <span className="text-orange-700 font-medium text-sm">{competency}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção de Progresso Acadêmico - Unificada */}
      {mastered.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              🎓 Progresso Acadêmico
            </h3>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg border border-emerald-200">
              <p className="text-emerald-700 text-sm">
                Você conquistou <strong>{mastered.length} competência{mastered.length > 1 ? 's' : ''} essencial{mastered.length > 1 ? 'is' : ''}</strong> 
                para a prática profissional em avaliação nutricional. Continue estudando para dominar todas as habilidades!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}