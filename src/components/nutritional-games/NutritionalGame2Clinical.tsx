'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  Heart,
  Droplets,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowLeft,
  Play,
  Clock,
  Target,
  BookOpen,
  TestTube,
  Home,
  Eye,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdvancedEducationalContent } from '@/components/games/AdvancedEducationalContent'
import { clinicalBiochemicalDataset, formatNutritionalCitation } from '@/lib/nutritionalAssessmentData'

interface Exercise {
  id: number
  title: string
  description: string
  scenario: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  learningObjective: string
  realData: any
  labValues?: any
}

const exercises: Exercise[] = [
  {
    id: 1,
    title: 'Interpretação de Hemoglobina - Anemia',
    description: 'Aprenda a identificar anemia através dos valores de hemoglobina',
    scenario: 'Maria, 34 anos, Sudeste, realizou exames na Pesquisa Nacional de Saúde. Hemoglobina: 12,8 g/dL, Hematócrito: 38,5%',
    question: 'Como interpretar os valores de hemoglobina de Maria?',
    options: [
      'Hemoglobina normal (≥12 g/dL para mulheres) - sem anemia',
      'Anemia leve (10-11,9 g/dL) - necessita suplementação',
      'Anemia moderada (7-9,9 g/dL) - investigação urgente',
      'Anemia grave (<7 g/dL) - internação necessária'
    ],
    correctAnswer: 0,
    explanation: 'Para mulheres adultas, hemoglobina ≥12 g/dL é considerada normal pela OMS. Maria tem 12,8 g/dL, portanto não apresenta anemia. O hematócrito de 38,5% também está dentro da normalidade (≥36% para mulheres).',
    difficulty: 'muito-facil',
    learningObjective: 'Interpretar valores de hemoglobina e identificar anemia',
    realData: clinicalBiochemicalDataset.data[0],
    labValues: { hemoglobin: 12.8, hematocrit: 38.5, reference: { hemoglobin: '≥12 g/dL', hematocrit: '≥36%' } }
  },
  {
    id: 2,
    title: 'Avaliação de Proteínas Séricas',
    description: 'Entenda como albumina e proteínas totais refletem o estado nutricional',
    scenario: 'João, 28 anos, Sul: Albumina = 4,5 g/dL, Proteínas totais = 7,4 g/dL. Paciente saudável, sem doenças hepáticas ou renais.',
    question: 'Qual a interpretação nutricional desses marcadores proteicos?',
    options: [
      'Estado nutricional proteico adequado - valores normais',
      'Desnutrição proteica leve - albumina baixa',
      'Desnutrição proteica grave - proteínas muito baixas',
      'Excesso proteico - valores acima do normal'
    ],
    correctAnswer: 0,
    explanation: 'Albumina normal: 3,5-5,0 g/dL. Proteínas totais normais: 6,0-8,0 g/dL. João apresenta valores normais (4,5 e 7,4 respectivamente), indicando estado nutricional proteico adequado.',
    difficulty: 'facil',
    learningObjective: 'Avaliar estado nutricional através de proteínas séricas',
    realData: clinicalBiochemicalDataset.data[1],
    labValues: { albumin: 4.5, totalProtein: 7.4, reference: { albumin: '3,5-5,0 g/dL', totalProtein: '6,0-8,0 g/dL' } }
  },
  {
    id: 3,
    title: 'Status de Vitamina D',
    description: 'Avalie a adequação de vitamina D na população brasileira',
    scenario: 'Ana, 45 anos, Nordeste: Vitamina D = 22,3 ng/mL. Mora em região ensolarada, trabalha em escritório, usa protetor solar diariamente.',
    question: 'Como classificar o status de vitamina D de Ana?',
    options: [
      'Deficiência grave (<10 ng/mL) - risco de raquitismo',
      'Deficiência (<20 ng/mL) - suplementação necessária',
      'Insuficiência (20-29 ng/mL) - exposição solar recomendada',
      'Adequado (≥30 ng/mL) - manter hábitos atuais'
    ],
    correctAnswer: 2,
    explanation: 'Vitamina D: 22,3 ng/mL está na faixa de insuficiência (20-29 ng/mL). Apesar de morar no Nordeste (região ensolarada), o trabalho indoor e uso de protetor solar limitam a síntese cutânea.',
    difficulty: 'medio',
    learningObjective: 'Classificar status de vitamina D e fatores determinantes',
    realData: clinicalBiochemicalDataset.data[2],
    labValues: { vitaminD: 22.3, reference: { deficient: '<20', insufficient: '20-29', adequate: '≥30' } }
  },
  {
    id: 4,
    title: 'Perfil Lipídico e Risco Cardiovascular',
    description: 'Integre múltiplos marcadores lipídicos para avaliação de risco',
    scenario: 'Carlos, 52 anos, Norte: Colesterol total = 195 mg/dL, HDL = 38 mg/dL, LDL = 125 mg/dL, Triglicerídeos = 160 mg/dL. Hipertenso, sedentário.',
    question: 'Qual a avaliação do perfil lipídico e risco cardiovascular?',
    options: [
      'Perfil lipídico normal - baixo risco cardiovascular',
      'HDL baixo e triglicerídeos elevados - risco cardiovascular aumentado',
      'LDL muito alto - risco cardiovascular muito alto',
      'Apenas colesterol total elevado - risco moderado'
    ],
    correctAnswer: 1,
    explanation: 'HDL <40 mg/dL (homens) é baixo. Triglicerídeos >150 mg/dL são elevados. Associado à hipertensão e sedentarismo, configura risco cardiovascular aumentado, mesmo com colesterol total e LDL em níveis aceitáveis.',
    difficulty: 'dificil',
    learningObjective: 'Integrar marcadores lipídicos para avaliação de risco',
    realData: clinicalBiochemicalDataset.data[3],
    labValues: { cholesterol: 195, hdl: 38, ldl: 125, triglycerides: 160 }
  },
  {
    id: 5,
    title: 'Interpretação Populacional de Biomarcadores',
    description: 'Analise tendências populacionais de marcadores bioquímicos',
    scenario: 'Dados PNS 2019: 30% dos brasileiros têm deficiência de vitamina D, 25% têm anemia (mulheres), 40% têm colesterol elevado. Maiores prevalências no Norte/Nordeste.',
    question: 'Qual interpretação epidemiológica é mais apropriada?',
    options: [
      'Problemas nutricionais resolvidos - baixas prevalências',
      'Dupla carga nutricional: deficiências e excessos coexistem',
      'Apenas problemas de excesso nutricional',
      'Dados inconsistentes - metodologia inadequada'
    ],
    correctAnswer: 1,
    explanation: 'Os dados mostram dupla carga nutricional: deficiências (vitamina D, ferro) coexistem com excessos (colesterol elevado). Reflete transição nutricional brasileira com desigualdades regionais.',
    difficulty: 'muito-dificil',
    learningObjective: 'Interpretar dados populacionais de biomarcadores',
    realData: { vitaminDDeficiency: 30, anemia: 25, highCholesterol: 40, regions: ['Norte', 'Nordeste'] }
  }
]

interface NutritionalGame2ClinicalProps {
  onBack: () => void
  onComplete: () => void
}

export function NutritionalGame2Clinical({ onBack, onComplete }: NutritionalGame2ClinicalProps) {
  const [showEducation, setShowEducation] = useState(true)
  const [currentExercise, setCurrentExercise] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  React.useEffect(() => {
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

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === exercises[currentExercise].correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 20)
    }

    setShowFeedback(true)
  }

  const handleNextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setIsCompleted(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'muito-facil': return 'bg-green-100 text-green-800'
      case 'facil': return 'bg-blue-100 text-blue-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'dificil': return 'bg-orange-100 text-orange-800'
      case 'muito-dificil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (showEducation) {
    const educationalSections = [
      {
        id: 'introduction',
        title: 'Introdução aos Indicadores Clínicos e Bioquímicos',
        icon: <TestTube className="w-6 h-6 text-blue-600" />,
        content: `Os exames de sangue são como "fotografias" do que está acontecendo dentro do seu corpo. Eles mostram se você está bem nutrido, se tem deficiências de vitaminas ou minerais, e se há riscos para sua saúde.`,
        concepts: [
          {
            term: 'Indicadores Bioquímicos',
            definition: 'Substâncias medidas no sangue, urina ou outros fluidos corporais que refletem o estado nutricional',
            whenToUse: 'Para detectar deficiências nutricionais antes dos sintomas clínicos aparecerem',
            dailyLifeAnalogy: {
              title: 'Painel do Carro',
              description: 'É como o painel do carro que mostra se está tudo funcionando bem - os exames mostram se seu corpo está "funcionando" nutricionalmente',
              icon: <Activity className="w-4 h-4" />,
              connection: 'Assim como luzes no painel alertam sobre problemas no carro, alterações nos exames alertam sobre problemas nutricionais'
            },
            brazilianExample: {
              title: 'Pesquisa Nacional de Saúde (PNS)',
              context: 'Estudo nacional que avalia marcadores bioquímicos da população brasileira',
              data: 'Avaliou 8.952 adultos em todo o Brasil com exames laboratoriais',
              interpretation: 'Revelou alta prevalência de deficiência de vitamina D (30%) e anemia em mulheres (25%)',
              source: formatNutritionalCitation(clinicalBiochemicalDataset.citation)
            },
            keyPoints: [
              'Detectam problemas antes dos sintomas aparecerem',
              'Permitem monitoramento objetivo do estado nutricional',
              'Essenciais para diagnóstico de deficiências específicas',
              'Orientam intervenções nutricionais precisas'
            ],
            commonMistakes: [
              'Interpretar valores isoladamente sem contexto clínico',
              'Não considerar fatores que afetam os resultados',
              'Ignorar valores de referência específicos para população'
            ]
          }
        ],
        estimatedTime: 4
      },
      {
        id: 'hemoglobin-anemia',
        title: 'Hemoglobina e Diagnóstico de Anemia',
        icon: <Droplets className="w-6 h-6 text-red-600" />,
        content: `A hemoglobina é como os "caminhões de oxigênio" do seu sangue. Quando há poucos caminhões (hemoglobina baixa), o corpo não consegue transportar oxigênio suficiente - isso é anemia.`,
        concepts: [
          {
            term: 'Anemia',
            definition: 'Condição em que há redução da hemoglobina no sangue, comprometendo o transporte de oxigênio',
            symbol: 'Hb < 12 g/dL (mulheres), < 13 g/dL (homens)',
            whenToUse: 'Para diagnosticar deficiência de ferro, folato, vitamina B12 ou outras causas de anemia',
            dailyLifeAnalogy: {
              title: 'Caminhões de Entrega',
              description: 'É como ter poucos caminhões para entregar oxigênio pela cidade (corpo) - tudo funciona mais devagar',
              icon: <Heart className="w-4 h-4" />,
              connection: 'Assim como poucos caminhões atrasam entregas, pouca hemoglobina causa cansaço e fraqueza'
            },
            brazilianExample: {
              title: 'Anemia no Brasil - PNS 2019',
              context: 'Pesquisa Nacional de Saúde avaliou prevalência de anemia na população brasileira',
              data: '25% das mulheres em idade reprodutiva têm anemia, especialmente no Norte e Nordeste',
              interpretation: 'Alta prevalência indica deficiência de ferro relacionada à dieta e fatores socioeconômicos',
              source: formatNutritionalCitation(clinicalBiochemicalDataset.citation)
            },
            keyPoints: [
              'Valores normais: Mulheres ≥12 g/dL, Homens ≥13 g/dL',
              'Principal causa no Brasil: deficiência de ferro',
              'Sintomas: cansaço, fraqueza, palidez, falta de ar',
              'Mais comum em mulheres, crianças e idosos'
            ],
            commonMistakes: [
              'Não considerar diferenças por sexo e idade',
              'Ignorar causas não nutricionais de anemia',
              'Não investigar deficiências associadas'
            ]
          }
        ],
        estimatedTime: 5
      },
      {
        id: 'proteins-vitamins',
        title: 'Proteínas Séricas e Vitaminas',
        icon: <Zap className="w-6 h-6 text-orange-600" />,
        content: `As proteínas no sangue são como "materiais de construção" que mostram se o corpo está conseguindo se manter e reparar. As vitaminas são como "ferramentas" que fazem tudo funcionar direito.`,
        concepts: [
          {
            term: 'Albumina Sérica',
            definition: 'Principal proteína do sangue, reflete estado nutricional proteico e função hepática',
            symbol: 'Normal: 3,5-5,0 g/dL',
            whenToUse: 'Para avaliar estado nutricional proteico e função hepática',
            dailyLifeAnalogy: {
              title: 'Material de Construção',
              description: 'É como ter tijolos suficientes para construir e reformar uma casa - albumina baixa significa "falta material"',
              icon: <Activity className="w-4 h-4" />,
              connection: 'Assim como construção precisa de material, o corpo precisa de proteínas para se manter'
            },
            brazilianExample: {
              title: 'Estado Nutricional Proteico no Brasil',
              context: 'Dados da PNS mostram adequação proteica na maioria da população brasileira',
              data: 'Albumina média: 4,2 g/dL (adequada), mas varia com idade e região',
              interpretation: 'Transição nutricional: menos desnutrição proteica, mas persistem bolsões de carência',
              source: 'Baseado em dados da Pesquisa Nacional de Saúde'
            },
            keyPoints: [
              'Reflete estado nutricional de médio prazo (2-3 semanas)',
              'Pode estar baixa por desnutrição ou doença hepática',
              'Valores normais não excluem deficiências específicas',
              'Deve ser interpretada junto com outros indicadores'
            ],
            commonMistakes: [
              'Usar apenas albumina para avaliar estado nutricional',
              'Não considerar inflamação que reduz albumina',
              'Ignorar outras proteínas séricas importantes'
            ]
          }
        ],
        estimatedTime: 6
      }
    ]

    return (
      <AdvancedEducationalContent
        gameId={2}
        gameTitle="Indicadores Clínicos e Bioquímicos"
        gameDescription="Domine a interpretação de exames laboratoriais e sinais clínicos para avaliação nutricional usando dados reais da população brasileira"
        sections={educationalSections}
        onStartGame={handleStartGame}
        totalEstimatedTime={15}
      />
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto p-8"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Excelente! Jogo Concluído
              </h2>

              <p className="text-lg text-gray-600 mb-6">
                Você dominou os indicadores clínicos e bioquímicos para avaliação nutricional
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{exercises.length}</div>
                  <div className="text-sm text-gray-600">Exercícios</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={onComplete} size="lg" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar aos Jogos
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentExercise(0)
                    setSelectedAnswer(null)
                    setShowFeedback(false)
                    setScore(0)
                    setTimeElapsed(0)
                    setIsCompleted(false)
                    setShowEducation(true)
                  }}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentEx = exercises[currentExercise]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeElapsed)}
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                {score}/100
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {currentExercise + 1}/{exercises.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentExercise}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <TestTube className="w-8 h-8 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentEx.title}</h1>
                    <p className="text-gray-600">{currentEx.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentEx.difficulty)}`}>
                  {currentEx.difficulty.replace('-', ' ')}
                </span>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Droplets className="w-5 h-5 mr-2" />
                  Caso Clínico - Dados Reais PNS
                </h3>
                <p className="text-green-800">{currentEx.scenario}</p>
                {currentEx.labValues && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="text-sm text-gray-700">
                      <strong>Valores Laboratoriais:</strong>
                      <div className="mt-1 font-mono">
                        {Object.entries(currentEx.labValues).map(([key, value]) => (
                          key !== 'reference' && (
                            <div key={key}>{key}: {typeof value === 'number' ? value : String(value)}</div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentEx.question}</h3>

                  <div className="space-y-3">
                    {currentEx.options.map((option, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          selectedAnswer === index
                            ? showFeedback
                              ? index === currentEx.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-green-500 bg-green-50'
                            : showFeedback && index === currentEx.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                          {showFeedback && selectedAnswer === index && (
                            <span className="ml-auto">
                              {index === currentEx.correctAnswer ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              )}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-50 p-6 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Explicação Clínica
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{currentEx.explanation}</p>

                    <div className="mt-4 p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="text-sm text-green-800">
                        <strong>Objetivo de Aprendizado:</strong> {currentEx.learningObjective}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setShowEducation(true)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Revisar Conteúdo
                  </Button>

                  {!showFeedback ? (
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={selectedAnswer === null}
                    >
                      Confirmar Resposta
                    </Button>
                  ) : (
                    <Button onClick={handleNextExercise}>
                      {currentExercise < exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Jogo'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}