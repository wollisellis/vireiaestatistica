'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  DollarSign, 
  GraduationCap, 
  Home, 
  MapPin, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowLeft,
  Play,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  Heart,
  Utensils,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdvancedEducationalContent } from '@/components/games/AdvancedEducationalContent'
import { socioeconomicDataset, assessFoodSecurity, formatNutritionalCitation } from '@/lib/nutritionalAssessmentData'

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
  socialFactors?: any
}

const exercises: Exercise[] = [
  {
    id: 1,
    title: 'Segurança Alimentar e Nutricional',
    description: 'Compreenda os diferentes níveis de segurança alimentar e seu impacto nutricional',
    scenario: 'Família Silva, Nordeste: Renda 0,8 salários mínimos, 6 pessoas, educação fundamental. SISVAN classificou como "Insegurança Alimentar Moderada".',
    question: 'O que significa "Insegurança Alimentar Moderada" e qual o impacto nutricional esperado?',
    options: [
      'Acesso adequado aos alimentos - sem impacto nutricional',
      'Preocupação com alimentos - impacto psicológico apenas',
      'Redução quantitativa de alimentos entre adultos - risco de desnutrição',
      'Fome severa em toda família - desnutrição grave'
    ],
    correctAnswer: 2,
    explanation: 'Insegurança Alimentar Moderada significa redução na quantidade de alimentos consumidos pelos adultos da família, com possível comprometimento da qualidade nutricional. As crianças ainda são protegidas, mas há risco de progressão.',
    difficulty: 'muito-facil',
    learningObjective: 'Classificar níveis de segurança alimentar e impactos nutricionais',
    realData: socioeconomicDataset.data[2],
    socialFactors: { income: 0.8, familySize: 6, education: 'Fundamental', foodSecurity: 'Moderada' }
  },
  {
    id: 2,
    title: 'Renda e Estado Nutricional',
    description: 'Analise a relação entre renda familiar e estado nutricional',
    scenario: 'Estudo SISVAN: Família A (renda 3,2 SM, 2 pessoas, superior) - IMC médio 26,1. Família B (renda 0,9 SM, 7 pessoas, fundamental) - IMC médio 23,7.',
    question: 'Como interpretar essa aparente contradição entre renda e IMC?',
    options: [
      'Dados incorretos - maior renda sempre resulta em melhor nutrição',
      'Transição nutricional: maior renda pode levar ao sobrepeso, menor renda à desnutrição',
      'Renda não influencia estado nutricional',
      'Tamanho da família é irrelevante'
    ],
    correctAnswer: 1,
    explanation: 'A transição nutricional mostra que famílias de maior renda podem ter sobrepeso (acesso a alimentos processados), enquanto famílias de baixa renda podem ter peso normal por restrição alimentar, mas com risco de deficiências nutricionais.',
    difficulty: 'facil',
    learningObjective: 'Compreender a transição nutricional e seus determinantes socioeconômicos',
    realData: { familyA: { income: 3.2, size: 2, bmi: 26.1 }, familyB: { income: 0.9, size: 7, bmi: 23.7 } }
  },
  {
    id: 3,
    title: 'Educação Materna e Nutrição Infantil',
    description: 'Avalie o impacto da escolaridade materna no estado nutricional dos filhos',
    scenario: 'Dados nacionais: Crianças de mães com ensino superior têm 15% de sobrepeso vs 8% de desnutrição. Crianças de mães sem escolaridade têm 25% de desnutrição vs 5% de sobrepeso.',
    question: 'Qual o principal mecanismo que explica essa associação?',
    options: [
      'Renda é o único fator determinante',
      'Conhecimento nutricional, práticas alimentares e acesso a serviços de saúde',
      'Genética é mais importante que educação',
      'Não há relação real entre educação e nutrição'
    ],
    correctAnswer: 1,
    explanation: 'A educação materna influencia através de múltiplos mecanismos: conhecimento sobre nutrição, práticas de cuidado infantil, utilização de serviços de saúde, poder de decisão familiar e capacidade de interpretar informações nutricionais.',
    difficulty: 'medio',
    learningObjective: 'Analisar mecanismos pelos quais educação materna afeta nutrição infantil',
    realData: { higherEducation: { overweight: 15, malnutrition: 8 }, noEducation: { overweight: 5, malnutrition: 25 } }
  },
  {
    id: 4,
    title: 'Desigualdades Regionais em Nutrição',
    description: 'Compreenda as disparidades nutricionais entre regiões brasileiras',
    scenario: 'SISVAN 2023: Norte/Nordeste - 35% insegurança alimentar, 20% desnutrição infantil. Sul/Sudeste - 15% insegurança alimentar, 8% desnutrição infantil, 25% sobrepeso adulto.',
    question: 'Quais fatores estruturais explicam essas desigualdades regionais?',
    options: [
      'Apenas diferenças climáticas e geográficas',
      'Desenvolvimento econômico, infraestrutura, políticas públicas e acesso a serviços',
      'Diferenças culturais alimentares exclusivamente',
      'Fatores genéticos populacionais'
    ],
    correctAnswer: 1,
    explanation: 'As desigualdades refletem diferenças históricas no desenvolvimento econômico, infraestrutura (saneamento, transporte), implementação de políticas públicas, acesso a serviços de saúde e educação, além de oportunidades de emprego e renda.',
    difficulty: 'dificil',
    learningObjective: 'Identificar determinantes estruturais das desigualdades nutricionais regionais',
    realData: { 
      northNortheast: { foodInsecurity: 35, childMalnutrition: 20 }, 
      southSoutheast: { foodInsecurity: 15, childMalnutrition: 8, adultOverweight: 25 } 
    }
  },
  {
    id: 5,
    title: 'Políticas Públicas e Impacto Nutricional',
    description: 'Avalie o impacto de políticas públicas no estado nutricional populacional',
    scenario: 'Análise 2003-2023: Programa Bolsa Família reduziu desnutrição infantil em 60%. Programa Nacional de Alimentação Escolar atende 40 milhões. Lei do Aleitamento aumentou amamentação exclusiva de 2,9% para 45,7%.',
    question: 'Qual a interpretação mais adequada sobre efetividade das políticas nutricionais?',
    options: [
      'Políticas são ineficazes - problemas persistem',
      'Apenas transferência de renda resolve problemas nutricionais',
      'Abordagem multissetorial com políticas integradas é mais efetiva',
      'Educação nutricional é suficiente para resolver todos os problemas'
    ],
    correctAnswer: 2,
    explanation: 'Os dados mostram que políticas integradas (transferência de renda + alimentação escolar + promoção do aleitamento) são mais efetivas. Cada programa atua em determinantes específicos, criando sinergia para melhoria do estado nutricional populacional.',
    difficulty: 'muito-dificil',
    learningObjective: 'Avaliar efetividade de políticas públicas nutricionais integradas',
    realData: { 
      bolsaFamilia: { malnutritionReduction: 60 }, 
      schoolFeeding: { coverage: 40000000 }, 
      breastfeeding: { exclusiveIncrease: { from: 2.9, to: 45.7 } } 
    }
  }
]

interface NutritionalGame3SocioeconomicProps {
  onBack: () => void
  onComplete: () => void
}

export function NutritionalGame3Socioeconomic({ onBack, onComplete }: NutritionalGame3SocioeconomicProps) {
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
        title: 'Determinantes Sociais da Nutrição',
        icon: <Users className="w-6 h-6 text-purple-600" />,
        content: `A nutrição não depende apenas do que comemos, mas de onde vivemos, quanto ganhamos, que escola frequentamos e que oportunidades temos. É como uma "receita" onde os ingredientes sociais e econômicos determinam o resultado nutricional final.`,
        concepts: [
          {
            term: 'Determinantes Sociais da Saúde',
            definition: 'Condições sociais, econômicas, culturais e ambientais que influenciam a saúde e nutrição das populações',
            whenToUse: 'Para compreender e intervir nas causas profundas dos problemas nutricionais populacionais',
            dailyLifeAnalogy: {
              title: 'Ingredientes de uma Receita',
              description: 'É como fazer um bolo - não basta ter farinha (alimentos), precisa de forno (renda), conhecimento (educação) e tempo (condições sociais)',
              icon: <Utensils className="w-4 h-4" />,
              connection: 'Assim como uma receita precisa de todos os ingredientes, boa nutrição precisa de condições sociais adequadas'
            },
            brazilianExample: {
              title: 'Sistema de Vigilância Alimentar e Nutricional (SISVAN)',
              context: 'Sistema nacional que monitora estado nutricional e fatores socioeconômicos da população usuária do SUS',
              data: 'Acompanha 125.000 famílias brasileiras relacionando renda, educação e segurança alimentar',
              interpretation: 'Mostra que famílias com menor renda e escolaridade têm maior risco de insegurança alimentar',
              source: formatNutritionalCitation(socioeconomicDataset.citation)
            },
            keyPoints: [
              'Renda familiar determina acesso quantitativo aos alimentos',
              'Educação influencia escolhas e práticas alimentares',
              'Local de moradia afeta disponibilidade de alimentos saudáveis',
              'Políticas públicas podem modificar determinantes sociais'
            ],
            commonMistakes: [
              'Culpabilizar indivíduos por problemas estruturais',
              'Ignorar contexto socioeconômico nas intervenções',
              'Focar apenas em educação nutricional sem abordar acesso'
            ]
          }
        ],
        estimatedTime: 5
      },
      {
        id: 'food-security',
        title: 'Segurança Alimentar e Nutricional',
        icon: <Shield className="w-6 h-6 text-green-600" />,
        content: `Segurança alimentar é como ter uma "despensa sempre cheia" - não só com comida suficiente, mas com alimentos nutritivos, seguros e culturalmente adequados para toda a família.`,
        concepts: [
          {
            term: 'Segurança Alimentar e Nutricional',
            definition: 'Acesso regular e permanente a alimentos de qualidade, em quantidade suficiente, sem comprometer outras necessidades essenciais',
            whenToUse: 'Para avaliar risco nutricional familiar e orientar políticas públicas de alimentação',
            dailyLifeAnalogy: {
              title: 'Despensa da Casa',
              description: 'É como ter uma despensa sempre bem abastecida - você sabe que tem comida boa para toda a família, sem se preocupar',
              icon: <Utensils className="w-4 h-4" />,
              connection: 'Assim como uma despensa vazia gera ansiedade, insegurança alimentar afeta a saúde mental e física'
            },
            brazilianExample: {
              title: 'Insegurança Alimentar no Brasil - SISVAN',
              context: 'Sistema nacional monitora segurança alimentar de famílias usuárias do SUS',
              data: '35% das famílias do Norte/Nordeste vivem algum grau de insegurança alimentar',
              interpretation: 'Desigualdades regionais refletem diferenças socioeconômicas e acesso a políticas públicas',
              source: formatNutritionalCitation(socioeconomicDataset.citation)
            },
            keyPoints: [
              'Segura: acesso adequado sempre',
              'Leve: preocupação com acesso futuro',
              'Moderada: redução de alimentos para adultos',
              'Grave: redução de alimentos para crianças'
            ],
            commonMistakes: [
              'Confundir fome com insegurança alimentar',
              'Não considerar qualidade dos alimentos',
              'Ignorar aspectos culturais da alimentação'
            ]
          }
        ],
        estimatedTime: 6
      },
      {
        id: 'social-policies',
        title: 'Políticas Públicas e Nutrição',
        icon: <Heart className="w-6 h-6 text-blue-600" />,
        content: `As políticas públicas são como "ferramentas do governo" para melhorar a nutrição da população. É como ter programas que ajudam as famílias a ter acesso a comida boa e conhecimento sobre alimentação saudável.`,
        concepts: [
          {
            term: 'Políticas Públicas de Alimentação e Nutrição',
            definition: 'Conjunto de ações governamentais para garantir direito humano à alimentação adequada e saudável',
            whenToUse: 'Para compreender e avaliar intervenções populacionais em nutrição',
            dailyLifeAnalogy: {
              title: 'Rede de Proteção Social',
              description: 'É como uma rede de segurança no circo - se alguém cair (passar dificuldades), a rede protege e ajuda a se levantar',
              icon: <Shield className="w-4 h-4" />,
              connection: 'Assim como a rede protege o acrobata, políticas públicas protegem famílias vulneráveis'
            },
            brazilianExample: {
              title: 'Programas Brasileiros de Alimentação e Nutrição',
              context: 'Brasil tem histórico de políticas inovadoras em alimentação e nutrição',
              data: 'Bolsa Família, PNAE, Programa Leite é Vida, SUS com foco nutricional',
              interpretation: 'Políticas integradas reduziram desnutrição infantil em 60% entre 2003-2023',
              source: 'Ministério da Saúde e Ministério do Desenvolvimento Social'
            },
            keyPoints: [
              'Transferência de renda aumenta acesso aos alimentos',
              'Alimentação escolar garante refeições nutritivas',
              'Educação nutricional melhora escolhas alimentares',
              'Políticas integradas são mais efetivas'
            ],
            commonMistakes: [
              'Esperar resultados imediatos de políticas de longo prazo',
              'Não considerar aspectos culturais nas intervenções',
              'Implementar políticas isoladas sem integração'
            ]
          }
        ],
        estimatedTime: 7
      }
    ]

    return (
      <AdvancedEducationalContent
        gameId={3}
        gameTitle="Fatores Demográficos e Socioeconômicos"
        gameDescription="Entenda como fatores sociais, econômicos e culturais influenciam o estado nutricional populacional usando dados reais do SISVAN"
        sections={educationalSections}
        onStartGame={handleStartGame}
        totalEstimatedTime={18}
      />
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto p-8"
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-purple-600" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Fantástico! Jogo Concluído
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                Você compreendeu os determinantes socioeconômicos da nutrição populacional
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{score}</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Tempo</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{exercises.length}</div>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                  <Users className="w-8 h-8 text-purple-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{currentEx.title}</h1>
                    <p className="text-gray-600">{currentEx.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentEx.difficulty)}`}>
                  {currentEx.difficulty.replace('-', ' ')}
                </span>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Cenário Populacional - Dados SISVAN
                </h3>
                <p className="text-purple-800">{currentEx.scenario}</p>
                {currentEx.socialFactors && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <div className="text-sm text-gray-700">
                      <strong>Fatores Socioeconômicos:</strong>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {Object.entries(currentEx.socialFactors).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
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
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-red-500 bg-red-50'
                              : 'border-purple-500 bg-purple-50'
                            : showFeedback && index === currentEx.correctAnswer
                            ? 'border-purple-500 bg-purple-50'
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
                                <CheckCircle className="w-5 h-5 text-purple-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
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
                      Análise Socioeconômica
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{currentEx.explanation}</p>
                    
                    <div className="mt-4 p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                      <div className="text-sm text-purple-800">
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
