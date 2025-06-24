'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface NormalDistributionScenario {
  id: number
  title: string
  description: string
  mean: number
  standardDeviation: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const scenarios: NormalDistributionScenario[] = [
  {
    id: 1,
    title: "IMC em População Adulta",
    description: "O IMC de adultos brasileiros segue distribuição normal com média 25,2 kg/m² e desvio padrão 4,1 kg/m²",
    mean: 25.2,
    standardDeviation: 4.1,
    question: "Qual porcentagem da população tem IMC entre 21,1 e 29,3 kg/m² (±1 desvio padrão)?",
    options: [
      "50%",
      "68%",
      "95%",
      "99,7%"
    ],
    correctAnswer: 1,
    explanation: "Na distribuição normal, aproximadamente 68% dos dados estão dentro de ±1 desvio padrão da média. Isso é uma propriedade fundamental da curva normal."
  },
  {
    id: 2,
    title: "Tempo de Corrida em Maratona",
    description: "Tempos de maratona seguem distribuição normal com média 4h30min (270 min) e DP 45 min",
    mean: 270,
    standardDeviation: 45,
    question: "Qual a probabilidade de um corredor terminar em menos de 3h45min (225 min)?",
    options: [
      "2,5%",
      "16%",
      "84%",
      "97,5%"
    ],
    correctAnswer: 1,
    explanation: "225 min está 1 desvio padrão abaixo da média (270-45=225). Em uma distribuição normal, 16% dos valores estão abaixo de -1 desvio padrão."
  },
  {
    id: 3,
    title: "Consumo Calórico Diário",
    description: "Consumo calórico de atletas: média 3200 kcal, desvio padrão 400 kcal",
    mean: 3200,
    standardDeviation: 400,
    question: "Entre que valores estão 95% dos consumos calóricos?",
    options: [
      "2800 - 3600 kcal",
      "2400 - 4000 kcal",
      "2000 - 4400 kcal",
      "1600 - 4800 kcal"
    ],
    correctAnswer: 1,
    explanation: "95% dos dados estão dentro de ±2 desvios padrão: 3200 ± (2 × 400) = 2400 a 4000 kcal."
  },
  {
    id: 4,
    title: "Altura de Jogadores de Basquete",
    description: "Altura de jogadores profissionais: média 198 cm, desvio padrão 8 cm",
    mean: 198,
    standardDeviation: 8,
    question: "Um jogador com 214 cm está em qual percentil aproximadamente?",
    options: [
      "84º percentil",
      "97,5º percentil",
      "99,9º percentil",
      "50º percentil"
    ],
    correctAnswer: 1,
    explanation: "214 cm = 198 + (2 × 8) = média + 2 desvios padrão. Isso corresponde ao 97,5º percentil na distribuição normal."
  }
]

interface Game5NormalDistributionProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game5NormalDistribution({ onBack, onComplete }: Game5NormalDistributionProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    currentLevel: 'facil',
    score: 0,
    answers: [],
    timeElapsed: 0,
    isCompleted: false,
    feedback: [],
    showEducation: false
  })
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const currentScenario = scenarios[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentScenario.correctAnswer
    const points = isCorrect ? 25 : 0

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, { questionId: currentScenario.id, selectedAnswer, isCorrect, points }]
    }))

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    if (gameState.currentQuestion < scenarios.length - 1) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setGameState(prev => ({ ...prev, isCompleted: true }))
    }
  }

  // Generate normal distribution curve data
  const generateNormalCurve = () => {
    const data = []
    const mean = currentScenario.mean
    const sd = currentScenario.standardDeviation
    const start = mean - 4 * sd
    const end = mean + 4 * sd
    const step = (end - start) / 100

    for (let x = start; x <= end; x += step) {
      const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2))
      data.push({ x: x.toFixed(1), y: y.toFixed(6) })
    }
    return data
  }

  const curveData = generateNormalCurve()

  return (
    <GameBase
      gameId={5}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={scenarios.length}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentScenario.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-center mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{currentScenario.mean}</div>
                <div className="text-sm text-gray-600">Média (μ)</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{currentScenario.standardDeviation}</div>
                <div className="text-sm text-gray-600">Desvio Padrão (σ)</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Curva Normal</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={curveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <ReferenceLine x={currentScenario.mean} stroke="#ef4444" strokeDasharray="5 5" label="μ" />
                  <ReferenceLine x={currentScenario.mean - currentScenario.standardDeviation} stroke="#10b981" strokeDasharray="3 3" label="-1σ" />
                  <ReferenceLine x={currentScenario.mean + currentScenario.standardDeviation} stroke="#10b981" strokeDasharray="3 3" label="+1σ" />
                  <ReferenceLine x={currentScenario.mean - 2*currentScenario.standardDeviation} stroke="#f59e0b" strokeDasharray="3 3" label="-2σ" />
                  <ReferenceLine x={currentScenario.mean + 2*currentScenario.standardDeviation} stroke="#f59e0b" strokeDasharray="3 3" label="+2σ" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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

            <div className="flex justify-between mt-6">
              <div></div>
              {!showFeedback ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
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

        {showFeedback && (
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
                <p className="text-gray-700">{currentScenario.explanation}</p>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <h4 className="font-medium mb-2">Regra 68-95-99,7</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 68% dos dados estão dentro de ±1 desvio padrão</li>
                    <li>• 95% dos dados estão dentro de ±2 desvios padrão</li>
                    <li>• 99,7% dos dados estão dentro de ±3 desvios padrão</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
