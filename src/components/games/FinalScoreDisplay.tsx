'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  BookOpen, 
  Target, 
  Clock, 
  BarChart3, 
  Award, 
  ArrowLeft,
  TrendingUp,
  Star,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Exercise {
  id: number
  title: string
  points: number
  difficulty: string
}

interface FinalScoreDisplayProps {
  gameId: number
  gameTitle: string
  score: number
  maxScore: number
  timeElapsed: number
  exercises: Exercise[]
  exerciseScores: number[]
  onBack: () => void
  onComplete: () => void
  strengthAreas?: string[]
  improvementAreas?: string[]
  competenciesAcquired?: string[]
  practicalApplications?: string[]
}

export function FinalScoreDisplay({
  gameId,
  gameTitle,
  score,
  maxScore,
  timeElapsed,
  exercises,
  exerciseScores,
  onBack,
  onComplete,
  strengthAreas = [],
  improvementAreas = [],
  competenciesAcquired = [],
  practicalApplications = []
}: FinalScoreDisplayProps) {
  
  const percentage = Math.round((score / maxScore) * 100)
  const passed = percentage >= 70

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { 
      level: 'Excelente', 
      color: 'text-emerald-600', 
      bgColor: 'bg-emerald-100',
      icon: '🏆',
      description: 'Desempenho excepcional! Você domina completamente o conteúdo.'
    }
    if (percentage >= 80) return { 
      level: 'Muito Bom', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: '⭐',
      description: 'Ótimo desempenho! Você tem excelente compreensão do tema.'
    }
    if (percentage >= 70) return { 
      level: 'Bom', 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100',
      icon: '✅',
      description: 'Bom desempenho! Você atingiu os objetivos de aprendizagem.'
    }
    if (percentage >= 60) return { 
      level: 'Regular', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: '⚠️',
      description: 'Desempenho regular. Revise alguns conceitos para melhorar.'
    }
    return { 
      level: 'Precisa Melhorar', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: '📚',
      description: 'É necessário revisar o conteúdo e praticar mais.'
    }
  }

  const performance = getPerformanceLevel(percentage)

  const getStrengthsAndImprovements = () => {
    const strengths: string[] = []
    const improvements: string[] = []

    exercises.forEach((exercise, index) => {
      const exerciseScore = exerciseScores[index] || 0
      const exercisePercentage = (exerciseScore / exercise.points) * 100

      if (exercisePercentage >= 80) {
        strengths.push(`${exercise.title} (${exercisePercentage.toFixed(0)}%)`)
      } else if (exercisePercentage < 60) {
        improvements.push(`${exercise.title} (${exercisePercentage.toFixed(0)}%)`)
      }
    })

    return { strengths, improvements }
  }

  const { strengths, improvements } = getStrengthsAndImprovements()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="overflow-hidden border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  {passed ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-yellow-600" />
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{gameTitle}</h1>
                <p className="text-emerald-100">Resultado Final</p>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Performance Summary */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-emerald-600 mb-2">
                  {percentage}%
                </div>
                <div className={`text-2xl font-semibold ${performance.color} mb-2`}>
                  {performance.icon} {performance.level}
                </div>
                <p className="text-gray-600 mb-4">{performance.description}</p>
                <div className={`text-lg px-4 py-2 rounded-full inline-block ${
                  passed ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {passed ? '✅ Aprovado' : '📚 Necessita Revisão'}
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card className="border-emerald-200">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Pontuação Detalhada
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Pontos Obtidos:</span>
                        <span className="font-semibold text-emerald-600">{score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pontos Possíveis:</span>
                        <span className="font-semibold">{maxScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exercícios Completados:</span>
                        <span className="font-semibold">{exercises.length}/{exercises.length}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Nota Mínima:</span>
                        <span className="font-semibold">70%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200">
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Desempenho
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tempo Total:</span>
                        <span className="font-semibold">{formatTime(timeElapsed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo Médio/Exercício:</span>
                        <span className="font-semibold">{formatTime(Math.round(timeElapsed / exercises.length))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Precisão:</span>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold ${passed ? 'text-emerald-600' : 'text-yellow-600'}`}>
                          {passed ? 'Aprovado' : 'Revisar'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Exercise Breakdown */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Pontuação por Exercício
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exercises.map((exercise, index) => {
                    const exerciseScore = exerciseScores[index] || 0
                    const exercisePercentage = Math.round((exerciseScore / exercise.points) * 100)
                    
                    return (
                      <div key={exercise.id} className="bg-emerald-50 p-3 rounded-lg">
                        <div className="text-sm text-emerald-700 mb-1 font-medium">
                          Exercício {exercise.id}
                        </div>
                        <div className="text-xs text-emerald-600 mb-2 truncate">
                          {exercise.title}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-emerald-900">
                            {exerciseScore}/{exercise.points}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            exercisePercentage >= 80 ? 'bg-green-100 text-green-800' :
                            exercisePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {exercisePercentage}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {strengths.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold text-green-900 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        Pontos Fortes
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-green-800">
                        {strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {improvements.length > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Áreas para Melhoria
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-yellow-800">
                        {improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Competencies and Applications */}
              {(competenciesAcquired.length > 0 || practicalApplications.length > 0) && (
                <div className="bg-emerald-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Competências Desenvolvidas
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6 text-sm text-emerald-800">
                    {competenciesAcquired.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Habilidades Adquiridas:
                        </h4>
                        <ul className="space-y-1">
                          {competenciesAcquired.map((competency, index) => (
                            <li key={index}>• {competency}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {practicalApplications.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Aplicação Prática:
                        </h4>
                        <ul className="space-y-1">
                          {practicalApplications.map((application, index) => (
                            <li key={index}>• {application}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="text-emerald-700 border-emerald-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar aos Jogos
                </Button>
                <Button
                  onClick={onComplete}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Concluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
