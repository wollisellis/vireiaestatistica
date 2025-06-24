'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Dice1 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface ProbabilityScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  context: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  dailyLifeAnalogy: string
  probability: number
}

const scenarios: ProbabilityScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: "Probabilidade Básica - Moeda",
    description: "João vai jogar uma moeda honesta",
    context: "João tem uma moeda normal (não viciada) e vai jogá-la uma vez. A moeda pode dar cara ou coroa.",
    question: "Qual a probabilidade de dar CARA?",
    options: [
      "50% (ou 0,5) - porque há 2 possibilidades iguais",
      "25% (ou 0,25) - porque cara é menos provável",
      "75% (ou 0,75) - porque cara é mais provável",
      "100% (ou 1,0) - porque sempre dá cara"
    ],
    correctAnswer: 0,
    explanation: "A probabilidade é 50% (ou 0,5)! Como há 2 resultados possíveis (cara ou coroa) e ambos são igualmente prováveis, cada um tem 1/2 = 0,5 = 50% de chance.",
    dailyLifeAnalogy: "É como escolher entre duas portas iguais: você tem 50% de chance de escolher cada uma!",
    probability: 0.5
  },
  {
    id: 2,
    level: 'facil',
    title: "Probabilidade com Dados - Nutrição",
    description: "Uma nutricionista usa um dado para sortear qual fruta recomendar",
    context: "O dado tem 6 faces: 1-Maçã, 2-Banana, 3-Laranja, 4-Uva, 5-Pêra, 6-Manga. Ela vai jogar o dado uma vez.",
    question: "Qual a probabilidade de sair uma fruta cítrica (Laranja)?",
    options: [
      "1/6 ≈ 16,7% - porque só há 1 fruta cítrica entre 6 opções",
      "2/6 ≈ 33,3% - porque cítrica é mais comum",
      "3/6 = 50% - porque metade das frutas são cítricas",
      "1/2 = 50% - porque ou sai ou não sai"
    ],
    correctAnswer: 0,
    explanation: "A probabilidade é 1/6 ≈ 16,7%! Das 6 frutas, apenas 1 é cítrica (laranja). Então: P(cítrica) = 1 fruta cítrica / 6 frutas totais = 1/6.",
    dailyLifeAnalogy: "É como ter 6 caixas e só 1 tem o prêmio que você quer. Sua chance é 1 em 6!",
    probability: 0.167
  },
  {
    id: 3,
    level: 'medio',
    title: "Probabilidade Condicional - Academia",
    description: "Uma academia analisa a frequência dos alunos",
    context: "Na academia: 60% dos alunos são mulheres. Entre as mulheres, 80% fazem musculação. Entre os homens, 90% fazem musculação.",
    question: "Se você encontrar alguém fazendo musculação, qual a probabilidade de ser mulher?",
    options: [
      "Cerca de 57% - considerando que há mais mulheres e muitas fazem musculação",
      "60% - porque 60% dos alunos são mulheres",
      "80% - porque 80% das mulheres fazem musculação",
      "50% - porque tanto homens quanto mulheres fazem musculação"
    ],
    correctAnswer: 0,
    explanation: "A resposta é cerca de 57%! Vamos calcular: Mulheres fazendo musculação = 60% × 80% = 48%. Homens fazendo musculação = 40% × 90% = 36%. Total fazendo musculação = 84%. Então: P(mulher|musculação) = 48%/84% ≈ 57%.",
    dailyLifeAnalogy: "É como numa festa onde há mais mulheres, e a maioria delas dança. Se você vê alguém dançando, provavelmente é mulher!",
    probability: 0.57
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "O que é Probabilidade? - Como Apostar no Futuro",
    content: (
      <div className="space-y-4">
        <p>🎲 <strong>Probabilidade é nossa forma de medir incerteza:</strong></p>
        
        <p>🤔 <strong>Pense assim:</strong> Quando você não tem certeza se algo vai acontecer, a probabilidade te ajuda a "apostar" melhor.</p>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📊 Escala de Probabilidade</h4>
          <ul className="text-blue-700 space-y-1">
            <li><strong>0% (ou 0):</strong> Impossível - nunca vai acontecer</li>
            <li><strong>25%:</strong> Pouco provável - raramente acontece</li>
            <li><strong>50%:</strong> Meio a meio - tanto faz</li>
            <li><strong>75%:</strong> Muito provável - quase sempre acontece</li>
            <li><strong>100% (ou 1):</strong> Certeza - sempre acontece</li>
          </ul>
        </div>
        
        <p>🏠 <strong>Exemplos do dia a dia:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Probabilidade de chover = 30% (pouco provável)</li>
          <li>Probabilidade de acordar amanhã = 99,9% (quase certeza)</li>
          <li>Probabilidade de ganhar na loteria = 0,000001% (quase impossível)</li>
        </ul>
      </div>
    ),
    concepts: [
      {
        term: "Probabilidade",
        definition: "Medida de chance de algo acontecer, entre 0 (impossível) e 1 (certeza)",
        example: "Probabilidade de tirar cara numa moeda = 0,5 ou 50%"
      },
      {
        term: "Evento",
        definition: "Algo que pode ou não acontecer",
        example: "Tirar um número par no dado, chover amanhã"
      }
    ]
  },
  {
    title: "Como Calcular Probabilidade - Receita Simples",
    content: (
      <div className="space-y-4">
        <p>🧮 <strong>Fórmula básica (super simples):</strong></p>
        
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-green-800 text-lg font-semibold">
            Probabilidade = <span className="text-blue-600">Casos Favoráveis</span> ÷ <span className="text-red-600">Casos Possíveis</span>
          </p>
        </div>
        
        <p>🎯 <strong>Exemplo prático:</strong></p>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800">
            <strong>Situação:</strong> Você tem uma caixa com 10 bombons: 3 de chocolate e 7 de morango.<br/>
            <strong>Pergunta:</strong> Qual a chance de pegar um de chocolate?<br/>
            <strong>Cálculo:</strong> 3 (chocolates) ÷ 10 (total) = 0,3 = 30%
          </p>
        </div>
        
        <p>💡 <strong>Dica importante:</strong> A soma de todas as probabilidades sempre dá 100% (ou 1)!</p>
      </div>
    ),
    concepts: [
      {
        term: "Casos Favoráveis",
        definition: "Número de resultados que você quer que aconteçam",
        example: "Se você quer tirar número par no dado: 2, 4, 6 = 3 casos"
      },
      {
        term: "Casos Possíveis",
        definition: "Número total de resultados que podem acontecer",
        example: "No dado: 1, 2, 3, 4, 5, 6 = 6 casos possíveis"
      }
    ]
  }
]

interface Game15BasicProbabilityProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game15BasicProbability({ onBack, onComplete }: Game15BasicProbabilityProps) {
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

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const currentScenario = scenarios[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentScenario.correctAnswer
    const points = isCorrect ? 35 : 0

    const newAnswers = [...gameState.answers, {
      questionId: currentScenario.id,
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
    if (gameState.currentQuestion < scenarios.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Probabilidade Básica"
      gameDescription="Aprenda os fundamentos da probabilidade usando exemplos simples e práticos"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={7}
    />
  )

  if (gameState.showEducation) {
    return educationComponent
  }

  return (
    <GameBase
      gameId={15}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={scenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Dice1 className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
                <p className="text-sm text-gray-600">Nível: {currentScenario.level.replace('-', ' ')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{currentScenario.description}</p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800"><strong>Situação:</strong> {currentScenario.context}</p>
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
            <p className="text-gray-700 mb-4">{currentScenario.question}</p>
            
            <div className="space-y-3">
              {currentScenario.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showFeedback
                        ? index === currentScenario.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && index === currentScenario.correctAnswer
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
                      index === currentScenario.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )
                    )}
                    {showFeedback && selectedAnswer !== index && index === currentScenario.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <div></div>
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {gameState.currentQuestion < scenarios.length - 1 ? 'Próxima Questão' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">💡 Explicação</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{currentScenario.explanation}</p>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800"><strong>🏠 Analogia do dia a dia:</strong> {currentScenario.dailyLifeAnalogy}</p>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800"><strong>🎯 Probabilidade:</strong> {(currentScenario.probability * 100).toFixed(1)}%</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
