'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InfoButton } from '@/components/ui/InfoButton'
import { PreGameEducation } from './PreGameEducation'
import { GameBase, GameState } from './GameBase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Question {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  scenario: string
  studyData: {
    intervention: string
    control: string
    pValue: number
    effectSize: number
    sampleSize: number
    confidenceInterval: [number, number]
  }
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  reference: string
}

const questions: Question[] = [
  // NÍVEL FÁCIL - Conceitos básicos
  {
    id: 1,
    level: 'facil',
    scenario: "Um estudo simples comparou duas dietas para perda de peso. O resultado mostrou p = 0,02.",
    studyData: {
      intervention: "Dieta A",
      control: "Dieta B",
      pValue: 0.02,
      effectSize: -2.5,
      sampleSize: 50,
      confidenceInterval: [-4.2, -0.8]
    },
    question: "O que significa p = 0,02 neste contexto?",
    options: [
      "Há 2% de chance de que a Dieta A funcione",
      "Se não houvesse diferença real, haveria 2% de chance de observar esta diferença ou maior",
      "A Dieta A é 2% melhor que a Dieta B",
      "98% das pessoas vão perder peso com a Dieta A"
    ],
    correctAnswer: 1,
    explanation: "O valor-p representa a probabilidade de observar os dados (ou mais extremos) assumindo que a hipótese nula (não há diferença) é verdadeira. P = 0,02 significa 2% de chance de ver esta diferença se realmente não houvesse diferença entre as dietas.",
    reference: "Wasserstein, R. L., & Lazar, N. A. (2016). The ASA statement on p-values. The American Statistician, 70(2), 129-133."
  },
  // NÍVEL MÉDIO - Interpretação mais complexa
  {
    id: 2,
    level: 'medio',
    scenario: "Um estudo sobre suplementação com proteína em atletas mostrou os seguintes resultados: diferença média no ganho de massa muscular = 1,2kg, p = 0,08, IC 95% = [-0,1; 2,5]kg.",
    studyData: {
      intervention: "Grupo Proteína",
      control: "Grupo Placebo",
      pValue: 0.08,
      effectSize: 1.2,
      sampleSize: 80,
      confidenceInterval: [-0.1, 2.5]
    },
    question: "Como interpretar este resultado considerando significância estatística E relevância clínica?",
    options: [
      "O suplemento não funciona porque p > 0,05",
      "Não há evidência estatística significativa, mas o efeito pode ser clinicamente relevante",
      "O resultado é definitivamente negativo",
      "Devemos ignorar este estudo"
    ],
    correctAnswer: 1,
    explanation: "Com p = 0,08 > 0,05, não temos evidência estatisticamente significativa. Porém, o ganho médio de 1,2kg pode ser clinicamente relevante para atletas. O IC inclui zero (não significativo), mas a maioria dos valores são positivos, sugerindo possível benefício que um estudo maior poderia detectar.",
    reference: "Sullivan, G. M., & Feinn, R. (2012). Using effect size—or why the P value is not enough. Journal of Graduate Medical Education, 4(3), 279-282."
  },
  // NÍVEL DIFÍCIL - Análise crítica e limitações
  {
    id: 3,
    level: 'dificil',
    scenario: "Meta-análise de 15 estudos sobre ômega-3 e performance cognitiva: p = 0,03, tamanho de efeito = 0,12, I² = 78% (alta heterogeneidade), viés de publicação detectado (p = 0,02 no teste de Egger).",
    studyData: {
      intervention: "Ômega-3",
      control: "Placebo",
      pValue: 0.03,
      effectSize: 0.12,
      sampleSize: 2450,
      confidenceInterval: [0.01, 0.23]
    },
    question: "Considerando TODOS os aspectos metodológicos, qual é a interpretação mais apropriada?",
    options: [
      "O ômega-3 definitivamente melhora a cognição (p < 0,05)",
      "Apesar da significância estatística, a alta heterogeneidade e viés de publicação limitam a confiabilidade",
      "O resultado é válido porque o IC não inclui zero",
      "Devemos aceitar o resultado porque é uma meta-análise"
    ],
    correctAnswer: 1,
    explanation: "Embora p = 0,03 seja estatisticamente significativo, a alta heterogeneidade (I² = 78%) indica grande variabilidade entre estudos, e o viés de publicação detectado sugere que estudos negativos podem não ter sido publicados. Estes fatores metodológicos limitam severamente a confiabilidade da conclusão, mesmo com significância estatística.",
    reference: "Ioannidis, J. P. (2005). Why most published research findings are false. PLoS Medicine, 2(8), e124."
  },
  // NÍVEL MUITO FÁCIL - Para iniciantes absolutos
  {
    id: 4,
    level: 'muito-facil',
    scenario: "Você quer saber se beber água antes do treino melhora o desempenho. Testou com 20 amigos: 10 beberam água, 10 não beberam. O grupo que bebeu água se saiu melhor. O valor-p foi 0,01.",
    studyData: {
      intervention: "Grupo Água",
      control: "Grupo Sem Água",
      pValue: 0.01,
      effectSize: 3.2,
      sampleSize: 20,
      confidenceInterval: [1.1, 5.3]
    },
    question: "O que significa p = 0,01 neste exemplo simples?",
    options: [
      "1% das pessoas se beneficiam da água",
      "A água funciona 1% melhor",
      "Se a água não funcionasse, haveria apenas 1% de chance de ver essa diferença",
      "99% das pessoas devem beber água antes do treino"
    ],
    correctAnswer: 2,
    explanation: "P = 0,01 significa que se a água realmente não fizesse diferença nenhuma, haveria apenas 1% de chance de observar uma diferença tão grande entre os grupos. Como 1% é muito pouco, provavelmente a água realmente ajuda no desempenho. É como ganhar na loteria - a chance é tão pequena que se acontecer, provavelmente há algo especial.",
    reference: "Conceito básico de valor-p para iniciantes."
  },
  // NÍVEL MUITO DIFÍCIL - Análise avançada com múltiplas comparações
  {
    id: 5,
    level: 'muito-dificil',
    scenario: "Estudo testou 20 suplementos diferentes para performance atlética. Um deles mostrou p = 0,02. Sem correção para múltiplas comparações, α = 0,05. Com correção de Bonferroni, α ajustado = 0,0025.",
    studyData: {
      intervention: "Suplemento X",
      control: "Placebo",
      pValue: 0.02,
      effectSize: 0.8,
      sampleSize: 100,
      confidenceInterval: [0.1, 1.5]
    },
    question: "Considerando o problema de múltiplas comparações, qual é a interpretação correta?",
    options: [
      "O resultado é significativo porque p = 0,02 < 0,05",
      "O resultado não é significativo após correção (p = 0,02 > 0,0025)",
      "Devemos ignorar a correção porque encontramos um resultado positivo",
      "A correção de Bonferroni é muito conservadora, então o resultado é válido"
    ],
    correctAnswer: 1,
    explanation: "Quando testamos múltiplas hipóteses simultaneamente, aumentamos a chance de encontrar resultados 'significativos' por acaso (erro Tipo I). Com 20 testes e α = 0,05, esperaríamos 1 resultado 'significativo' por pura sorte. A correção de Bonferroni ajusta α para 0,05/20 = 0,0025. Como p = 0,02 > 0,0025, o resultado não é significativo após correção apropriada.",
    reference: "Bland, J. M., & Altman, D. G. (1995). Multiple significance tests: the Bonferroni method. BMJ, 310(6973), 170."
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "O que é o Valor-p? (Explicação Super Simples)",
    content: (
      <div className="space-y-4">
        <p>🤔 <strong>Imagine esta situação do dia a dia:</strong> Você quer saber se um novo café realmente te deixa mais esperto para estudar.</p>

        <p>🎯 <strong>O valor-p responde uma pergunta simples:</strong> "Se esse café não funcionasse NADA, qual seria a chance de eu ver esses resultados mesmo assim?"</p>

        <p>📊 <strong>Exemplo prático:</strong> Se p = 0,03 (3%), significa que há apenas 3% de chance dos resultados terem acontecido por pura sorte, se o café não funcionasse. Isso é bem pouco! Então provavelmente o café realmente funciona.</p>

        <p>💡 <strong>Pense assim:</strong> É como jogar uma moeda 10 vezes e dar cara 9 vezes. Qual a chance disso acontecer se a moeda fosse honesta? Muito pequena! Então provavelmente a moeda está viciada.</p>

        <p>🔑 <strong>A regra simples:</strong> Se p for menor que 0,05 (5%), dizemos que o resultado é "estatisticamente significativo" - ou seja, provavelmente não foi só sorte.</p>
      </div>
    ),
    concepts: [
      {
        term: "Valor-p",
        symbol: "p",
        definition: "Probabilidade de observar os dados obtidos (ou mais extremos) assumindo que a hipótese nula é verdadeira",
        example: "p = 0,03 significa 3% de chance de observar esta diferença se não houvesse efeito real"
      },
      {
        term: "Hipótese Nula",
        symbol: "H₀",
        definition: "Afirmação de que não há diferença ou efeito real entre os grupos comparados",
        example: "H₀: A suplementação com proteína não afeta o ganho de massa muscular"
      },
      {
        term: "Significância Estatística",
        symbol: "α = 0,05",
        definition: "Convenção de que p < 0,05 indica evidência suficiente para rejeitar a hipótese nula",
        example: "Se p = 0,02, dizemos que o resultado é estatisticamente significativo"
      }
    ]
  },
  {
    title: "Interpretação Correta do Valor-p",
    content: `O valor-p NÃO nos diz:
• A probabilidade de que o tratamento funcione
• A probabilidade de que o resultado seja verdadeiro
• A magnitude do efeito

O valor-p nos diz apenas: assumindo que não há efeito real, qual a probabilidade de observar estes dados?`,
    concepts: [
      {
        term: "Interpretação Incorreta",
        definition: "p = 0,05 NÃO significa que há 5% de chance de que o resultado seja falso",
        example: "❌ Incorreto: 'Há 95% de chance de que o suplemento funcione'"
      },
      {
        term: "Interpretação Correta",
        definition: "p = 0,05 significa que, se não houvesse efeito real, haveria 5% de chance de observar esta diferença",
        example: "✅ Correto: 'Se o suplemento não tivesse efeito, haveria 5% de chance de observar esta diferença'"
      }
    ]
  },
  {
    title: "Limitações e Cuidados",
    content: (
      <div className="space-y-4">
        <p>O valor-p tem limitações importantes que todo pesquisador deve conhecer:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li><strong>Não indica magnitude:</strong> p = 0,001 não significa efeito maior que p = 0,04</li>
          <li><strong>Depende do tamanho da amostra:</strong> amostras grandes podem tornar diferenças triviais "significativas"</li>
          <li><strong>Não considera relevância clínica:</strong> significância estatística ≠ importância prática</li>
        </ol>
      </div>
    ),
    concepts: [
      {
        term: "Tamanho do Efeito",
        definition: "Medida da magnitude prática da diferença, independente da significância estatística",
        example: "Diferença de 0,1kg pode ser significativa (p < 0,05) mas clinicamente irrelevante"
      },
      {
        term: "Relevância Clínica",
        definition: "Importância prática do resultado para a saúde ou performance, além da significância estatística",
        example: "Melhora de 1% na performance pode ser estatisticamente significativa mas praticamente irrelevante"
      }
    ]
  },
  {
    title: "Para Iniciantes Absolutos: Analogias do Dia a Dia",
    content: (
      <div className="space-y-4">
        <p>🏪 <strong>Analogia do Supermercado:</strong> Imagine que você quer saber se uma marca de biscoito é realmente mais gostosa que outra. Você faz um teste com 20 amigos. Se 18 preferirem a marca A, qual a chance disso ter acontecido por acaso? O valor-p te diz isso!</p>

        <p>🎲 <strong>Analogia dos Dados:</strong> É como suspeitar que um dado está viciado. Se você jogar 20 vezes e sair 6 em 15 vezes, qual a probabilidade disso acontecer com um dado honesto? Muito pequena! O valor-p calcula exatamente isso.</p>

        <p>☕ <strong>Analogia do Café:</strong> Você testa se café realmente melhora a concentração. Dá café para 10 pessoas e água para outras 10. Se o grupo do café se sair muito melhor, o valor-p te diz se isso pode ter sido só coincidência.</p>

        <p>🎯 <strong>A ideia principal:</strong> O valor-p sempre responde: "Qual a chance desses resultados terem acontecido por pura sorte?"</p>
      </div>
    ),
    concepts: [
      {
        term: "Pensamento Estatístico Simples",
        definition: "Sempre perguntar: 'Isso pode ter sido só coincidência?'",
        example: "Como quando você nota que sempre chove quando lava o carro - pode ser só azar ou há uma explicação?"
      },
      {
        term: "Significância na Prática",
        definition: "Quando a chance de ser coincidência é muito pequena (menos de 5%)",
        example: "Como ganhar na loteria - a chance é tão pequena que se acontecer, provavelmente há algo especial"
      }
    ]
  }
]

interface Game1PValueProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game1PValue({ onBack, onComplete }: Game1PValueProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    currentLevel: 'muito-facil',
    score: 0,
    answers: [],
    timeElapsed: 0,
    isCompleted: false,
    feedback: [],
    showEducation: true
  })
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Get current question based on level and question index
  const getCurrentQuestion = () => {
    const levelQuestions = questions.filter(q => q.level === gameState.currentLevel)
    return levelQuestions[gameState.currentQuestion] || questions[0]
  }

  const currentQuestion = getCurrentQuestion()

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const points = isCorrect ? 20 : 0

    const newAnswers = [...gameState.answers, {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      points
    }]

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: newAnswers
    }))

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    const currentLevelQuestions = questions.filter(q => q.level === gameState.currentLevel)

    if (gameState.currentQuestion < currentLevelQuestions.length - 1) {
      // Next question in current level
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
    } else {
      // Move to next level or complete game
      const nextLevel = gameState.currentLevel === 'muito-facil' ? 'facil' :
                       gameState.currentLevel === 'facil' ? 'medio' :
                       gameState.currentLevel === 'medio' ? 'dificil' :
                       gameState.currentLevel === 'dificil' ? 'muito-dificil' : null

      if (nextLevel) {
        setGameState(prev => ({
          ...prev,
          currentLevel: nextLevel,
          currentQuestion: 0
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          isCompleted: true
        }))
      }
    }

    setSelectedAnswer(null)
    setShowFeedback(false)
    setShowExplanation(false)
  }

  const chartData = [
    {
      name: currentQuestion.studyData.control,
      value: 0,
      color: '#94a3b8'
    },
    {
      name: currentQuestion.studyData.intervention,
      value: Math.abs(currentQuestion.studyData.effectSize),
      color: currentQuestion.studyData.pValue < 0.05 ? '#10b981' : '#f59e0b'
    }
  ]

  const educationComponent = (
    <PreGameEducation
      gameTitle="Compreensão do Valor-p"
      gameDescription="Aprenda a interpretar corretamente valores-p em pesquisas nutricionais e esportivas"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={8}
    />
  )

  return (
    <GameBase
      gameId={1}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={5} // 5 levels, 1 question each
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Cenário do Estudo</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentQuestion.scenario}</p>
            
            {/* Study Results Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Resultados do Estudo</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center space-x-1">
                      <span>Valor-p:</span>
                      <InfoButton
                        title="Valor-p"
                        content="Probabilidade de observar os dados obtidos (ou mais extremos) assumindo que a hipótese nula é verdadeira"
                        symbol="p"
                        example="p = 0,03 significa 3% de chance de observar esta diferença se não houvesse efeito real"
                        size="sm"
                      />
                    </span>
                    <span className={`font-medium ${currentQuestion.studyData.pValue < 0.05 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {currentQuestion.studyData.pValue}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho do Efeito:</span>
                    <span className="font-medium">{currentQuestion.studyData.effectSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tamanho da Amostra:</span>
                    <span className="font-medium">{currentQuestion.studyData.sampleSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IC 95%:</span>
                    <span className="font-medium">
                      [{currentQuestion.studyData.confidenceInterval[0]}, {currentQuestion.studyData.confidenceInterval[1]}]
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Visualização dos Resultados</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Questão {gameState.currentQuestion + 1}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showFeedback
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && index === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )
                    )}
                    {showFeedback && selectedAnswer !== index && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setShowExplanation(!showExplanation)}
                disabled={!showFeedback}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showExplanation ? 'Ocultar' : 'Ver'} Explicação
              </Button>
              
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {gameState.currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Explanation */}
        {showExplanation && showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">Explicação</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{currentQuestion.explanation}</p>
                <div className="text-sm text-gray-600">
                  <strong>Referência:</strong> {currentQuestion.reference}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
