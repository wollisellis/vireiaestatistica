'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  ArrowLeft,
  Clock,
  Target,
  BookOpen,
  CheckCircle,
  Award,
  BarChart3,
  Users,
  Ruler,
  Scale
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdvancedEducationalContent } from '@/components/games/AdvancedEducationalContent'
import InteractiveGrowthCurveChart from '@/components/growth-curves/InteractiveGrowthCurveChart'
import {
  interactiveExercises,
  preGameEducationalContent,
  brazilianChildrenData,
  growthCurvesCitation
} from '@/lib/brazilianGrowthCurves'
import { useStudentProgress } from '@/contexts/StudentProgressContext'

interface NutritionalGame4GrowthCurvesProps {
  onBack: () => void
  onComplete: () => void
}

export function NutritionalGame4GrowthCurves({ onBack, onComplete }: NutritionalGame4GrowthCurvesProps) {
  const [showEducation, setShowEducation] = useState(true)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [exerciseScores, setExerciseScores] = useState<number[]>([])
  const [showFinalScore, setShowFinalScore] = useState(false)
  const { updateGameScore } = useStudentProgress()

  const maxScore = interactiveExercises.reduce((sum, ex) => sum + ex.points, 0)

  useEffect(() => {
    if (!showEducation && !isCompleted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showEducation, isCompleted])

  const handleStartGame = () => {
    setShowEducation(false)
  }

  const handleExerciseComplete = (exerciseScore: number, feedback: string) => {
    const newScores = [...exerciseScores]
    newScores[currentExercise] = exerciseScore
    setExerciseScores(newScores)
    setScore(prev => prev + exerciseScore)
    
    if (currentExercise < interactiveExercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
    } else {
      // All exercises completed
      const finalScore = score + exerciseScore
      setIsCompleted(true)
      setShowFinalScore(true)
      
      // Update student progress
      updateGameScore({
        gameId: 4,
        score: finalScore,
        maxScore: maxScore,
        timeElapsed: timeElapsed,
        completedAt: new Date(),
        exercisesCompleted: interactiveExercises.length,
        totalExercises: interactiveExercises.length,
        difficulty: 'Variada'
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excelente', color: 'text-emerald-600', icon: '🏆' }
    if (percentage >= 80) return { level: 'Muito Bom', color: 'text-green-600', icon: '⭐' }
    if (percentage >= 70) return { level: 'Bom', color: 'text-blue-600', icon: '✅' }
    if (percentage >= 60) return { level: 'Regular', color: 'text-yellow-600', icon: '⚠️' }
    return { level: 'Precisa Melhorar', color: 'text-red-600', icon: '📚' }
  }

  // Educational content for Game 4
  if (showEducation) {
    const educationalSections = [
      {
        id: 'growth-curves-intro',
        title: 'Avaliação do Crescimento Infantil: Aplicação Clínica das Curvas de Referência',
        icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
        content: `As curvas de crescimento representam ferramenta fundamental na prática da nutrição pediátrica, constituindo método padronizado para avaliação do estado nutricional e monitoramento do crescimento infantil. Como futuros nutricionistas, vocês aplicarão estes instrumentos na identificação precoce de agravos nutricionais, no acompanhamento de intervenções terapêuticas e na promoção da saúde nutricional infantil.`,
        concepts: [
          {
            term: 'Curvas de Crescimento e Interpretação de Percentis',
            definition: 'Instrumentos gráficos baseados em distribuições estatísticas que permitem comparar medidas antropométricas individuais com padrões populacionais de referência, expressos em percentis ou escores-z',
            whenToUse: 'Consultas de puericultura, avaliação nutricional pediátrica, monitoramento de crescimento, identificação de riscos nutricionais, acompanhamento de tratamentos em nutrição infantil',
            dailyLifeAnalogy: preGameEducationalContent.analogies?.[0] || {
              title: 'Sistema de Classificação Acadêmica',
              description: 'Assim como as notas classificam estudantes em relação à turma, os percentis classificam crianças em relação à população de referência da mesma idade e sexo'
            },
            brazilianExample: {
              title: 'Protocolo SISVAN para Avaliação Nutricional Infantil',
              context: 'O Sistema de Vigilância Alimentar e Nutricional utiliza as curvas da OMS (2006/2007) como referência para avaliação do estado nutricional de crianças brasileiras',
              data: 'Indicadores: peso/idade (0-60m), estatura/idade (0-19a), peso/estatura (0-60m), IMC/idade (0-19a). Pontos de corte: P3, P15, P85, P97',
              interpretation: 'Permite diagnóstico nutricional padronizado: magreza acentuada (<P3), magreza (P3-P15), eutrofia (P15-P85), sobrepeso (P85-P97), obesidade (>P97)',
              source: `${growthCurvesCitation.authors} (${growthCurvesCitation.year})`
            },
            keyPoints: [
              'Percentis indicam a posição relativa da criança na distribuição populacional de referência',
              'P50 representa a mediana populacional - valor que divide a população em duas metades iguais',
              'Faixa P3-P97 engloba 94% da população de referência considerada saudável',
              'Velocidade de crescimento e tendência temporal são mais relevantes que valores pontuais isolados'
            ]
          }
        ],
        estimatedTime: 5
      },
      {
        id: 'interactive-plotting',
        title: 'Técnicas de Plotagem e Interpretação Clínica',
        icon: <Target className="w-6 h-6 text-teal-600" />,
        content: `Este módulo desenvolve habilidades práticas essenciais para a aplicação clínica das curvas de crescimento. Você praticará a plotagem precisa de dados antropométricos e a interpretação clínica dos resultados, utilizando casos reais de crianças brasileiras atendidas em serviços de saúde.`,
        concepts: [
          {
            term: 'Plotagem Antropométrica e Interpretação Clínica',
            definition: 'Técnica de marcação precisa de dados antropométricos nas curvas de referência, seguida de interpretação clínica baseada na posição percentílica e análise de tendências de crescimento',
            whenToUse: 'Consultas nutricionais pediátricas, avaliação de crescimento, monitoramento de intervenções nutricionais, elaboração de planos terapêuticos em nutrição infantil',
            dailyLifeAnalogy: preGameEducationalContent.analogies?.[1] || {
              title: 'Sistema de Coordenadas GPS Nutricional',
              description: 'Assim como o GPS localiza sua posição exata no mapa usando coordenadas, a plotagem localiza a posição nutricional da criança usando idade e medida antropométrica'
            },
            brazilianExample: {
              title: 'Casos Clínicos da Atenção Básica Brasileira',
              context: 'Dados antropométricos de crianças atendidas em Unidades Básicas de Saúde de diferentes regiões brasileiras, representando a diversidade socioeconômica e nutricional do país',
              data: 'Amostra de 15 crianças (6-54 meses) com diferentes perfis nutricionais: eutrofia, risco nutricional, sobrepeso e déficits de crescimento',
              interpretation: 'Cada caso permite aplicação prática dos critérios diagnósticos do SISVAN e desenvolvimento de raciocínio clínico nutricional',
              source: 'Baseado em protocolos do SISVAN e dados de vigilância nutricional do Ministério da Saúde'
            },
            keyPoints: [
              'Localização precisa: idade (eixo X) e medida antropométrica (eixo Y)',
              'Identificação do percentil através da intersecção com as curvas de referência',
              'Interpretação clínica baseada nos pontos de corte do SISVAN',
              'Análise de tendências: comparação com medições anteriores quando disponíveis'
            ]
          }
        ],
        estimatedTime: 3
      }
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <AdvancedEducationalContent
          gameId={4}
          gameTitle="Avaliação do Crescimento Infantil: Aplicação Clínica das Curvas de Referência"
          gameDescription="Desenvolva competências em avaliação nutricional pediátrica através da plotagem e interpretação clínica de dados antropométricos, utilizando casos reais de crianças brasileiras e protocolos do SISVAN"
          sections={educationalSections}
          onStartGame={handleStartGame}
          totalEstimatedTime={8}
        />
      </div>
    )
  }

  // Final Score Display
  if (showFinalScore) {
    const percentage = Math.round((score / maxScore) * 100)
    const performance = getPerformanceLevel(percentage)
    const passed = percentage >= 70

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
                  <h1 className="text-3xl font-bold mb-2">
                    Jogo 4: Curvas de Crescimento Interativas
                  </h1>
                  <p className="text-emerald-100">Resultado Final</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-emerald-600 mb-2">
                    {percentage}%
                  </div>
                  <div className={`text-2xl font-semibold ${performance.color} mb-4`}>
                    {performance.icon} {performance.level}
                  </div>
                  <div className={`text-lg px-4 py-2 rounded-full inline-block ${
                    passed ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {passed ? '✅ Aprovado' : '📚 Necessita Revisão'}
                  </div>
                </div>

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
                          <span className="font-semibold">{interactiveExercises.length}/{interactiveExercises.length}</span>
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
                          <span className="font-semibold">{formatTime(Math.round(timeElapsed / interactiveExercises.length))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Precisão Média:</span>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Pontuação por Exercício
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {interactiveExercises.map((exercise, index) => (
                      <div key={exercise.id} className="bg-emerald-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-emerald-700 mb-1">Ex. {exercise.id}</div>
                        <div className="font-semibold text-emerald-900">
                          {exerciseScores[index] || 0}/{exercise.points}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {Math.round(((exerciseScores[index] || 0) / exercise.points) * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Competências Desenvolvidas
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-800">
                    <div>
                      <h4 className="font-semibold mb-2">✅ Habilidades Adquiridas:</h4>
                      <ul className="space-y-1">
                        <li>• Identificação de linhas de percentil</li>
                        <li>• Plotagem precisa de medições</li>
                        <li>• Interpretação de percentis</li>
                        <li>• Classificação nutricional</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🎯 Aplicação Prática:</h4>
                      <ul className="space-y-1">
                        <li>• Avaliação de crescimento infantil</li>
                        <li>• Uso de dados brasileiros reais</li>
                        <li>• Tomada de decisão clínica</li>
                        <li>• Comunicação com famílias</li>
                      </ul>
                    </div>
                  </div>
                </div>

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

  // Main Game Interface
  const currentEx = interactiveExercises[currentExercise]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="text-emerald-700 border-emerald-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  Jogo 4: Curvas de Crescimento Interativas
                </h1>
                <p className="text-emerald-700">
                  Exercício {currentExercise + 1} de {interactiveExercises.length} - {currentEx.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-emerald-600">Pontuação</div>
                <div className="text-xl font-bold text-emerald-900">
                  {score}/{maxScore}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-emerald-600">Tempo</div>
                <div className="text-xl font-bold text-emerald-900 flex items-center">
                  <Clock className="w-5 h-5 mr-1" />
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Exercise Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InteractiveGrowthCurveChart
          exerciseId={currentEx.id}
          chartType={currentEx.chartType}
          gender={currentEx.gender}
          targetChild={currentEx.targetChild}
          interactionType={currentEx.type}
          onComplete={handleExerciseComplete}
          maxAttempts={currentEx.maxAttempts}
          targetPercentile={currentEx.targetPercentile}
        />
      </div>
    </div>
  )
}
