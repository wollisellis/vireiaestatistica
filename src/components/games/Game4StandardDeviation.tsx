'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Calculator, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface VariabilityScenario {
  id: number
  title: string
  description: string
  variable: string
  unit: string
  data: number[]
  mean: number
  variance: number
  standardDeviation: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  interpretation: string
}

const scenarios: VariabilityScenario[] = [
  {
    id: 1,
    title: "Variabilidade no VO₂ Máximo",
    description: "Análise da variabilidade do VO₂ máximo em dois grupos de atletas: corredores de elite vs amadores",
    variable: "VO₂ Máximo",
    unit: "ml/kg/min",
    data: [58, 62, 65, 68, 70, 72, 75, 78, 80, 82], // Elite runners
    mean: 71.0,
    variance: 64.0,
    standardDeviation: 8.0,
    question: "Comparando com corredores amadores (DP = 12,5), o que indica o desvio padrão menor (8,0) dos atletas de elite?",
    options: [
      "Os atletas de elite têm VO₂ máximo menor",
      "Há maior homogeneidade no condicionamento dos atletas de elite",
      "Os dados dos atletas de elite são menos confiáveis",
      "Não há diferença significativa entre os grupos"
    ],
    correctAnswer: 1,
    explanation: "Um desvio padrão menor (8,0 vs 12,5) indica menor variabilidade nos dados. Isso significa que os atletas de elite têm níveis de VO₂ máximo mais homogêneos, sugerindo treinamento mais consistente e seleção natural no esporte de alto rendimento.",
    interpretation: "A menor variabilidade entre atletas de elite reflete a padronização do treinamento e a seleção natural no esporte de alto rendimento."
  },
  {
    id: 2,
    title: "Consistência na Força Muscular",
    description: "Medidas de força máxima no supino em 12 atletas antes e após programa de treinamento",
    variable: "Força Máxima",
    unit: "kg",
    data: [85, 88, 90, 92, 95, 98, 100, 102, 105, 108, 110, 112],
    mean: 98.75,
    variance: 75.02,
    standardDeviation: 8.66,
    question: "Se após o treinamento o desvio padrão aumentou para 12,3 kg, isso indica:",
    options: [
      "O treinamento foi ineficaz para todos",
      "Alguns atletas responderam melhor ao treinamento que outros",
      "Houve erro nas medições pós-treinamento",
      "A força média diminuiu"
    ],
    correctAnswer: 1,
    explanation: "O aumento do desvio padrão (de 8,66 para 12,3 kg) indica maior variabilidade nas respostas ao treinamento. Alguns atletas provavelmente tiveram ganhos maiores que outros, aumentando a dispersão dos dados. Isso é comum em programas de treinamento devido a diferenças individuais.",
    interpretation: "A maior variabilidade pós-treinamento sugere respostas individualizadas, indicando a necessidade de personalização dos programas."
  },
  {
    id: 3,
    title: "Precisão em Medidas Antropométricas",
    description: "Medições repetidas do percentual de gordura corporal em 10 atletas usando dois métodos diferentes",
    variable: "Gordura Corporal",
    unit: "%",
    data: [8.2, 8.4, 8.3, 8.5, 8.1, 8.6, 8.2, 8.4, 8.3, 8.5],
    mean: 8.35,
    variance: 0.025,
    standardDeviation: 0.16,
    question: "Um desvio padrão de 0,16% indica que este método de medição é:",
    options: [
      "Impreciso e não confiável",
      "Muito preciso com baixa variabilidade",
      "Adequado apenas para pesquisa",
      "Inferior a métodos tradicionais"
    ],
    correctAnswer: 1,
    explanation: "Um desvio padrão muito baixo (0,16%) indica alta precisão nas medições. Para percentual de gordura corporal, uma variabilidade menor que 0,5% é considerada excelente, sugerindo que o método é muito confiável e reprodutível.",
    interpretation: "A baixa variabilidade confirma a precisão do método, tornando-o adequado para monitoramento de atletas."
  },
  {
    id: 4,
    title: "Variabilidade Nutricional",
    description: "Consumo diário de proteínas em atletas de diferentes modalidades esportivas",
    variable: "Proteínas",
    unit: "g/kg/dia",
    data: [1.2, 1.8, 2.1, 2.5, 2.8, 3.2, 3.5, 3.8, 4.2, 4.5],
    mean: 2.96,
    variance: 1.18,
    standardDeviation: 1.09,
    question: "O coeficiente de variação (CV = DP/média × 100) de 36,8% indica:",
    options: [
      "Baixa variabilidade no consumo proteico",
      "Alta variabilidade, refletindo diferentes necessidades por modalidade",
      "Erro sistemático nas medições",
      "Consumo inadequado de proteínas"
    ],
    correctAnswer: 1,
    explanation: "Um coeficiente de variação de 36,8% indica alta variabilidade relativa. Isso é esperado quando comparamos atletas de diferentes modalidades, pois esportes de força requerem mais proteína que esportes de resistência. A alta variabilidade reflete necessidades nutricionais específicas.",
    interpretation: "A alta variabilidade é apropriada, refletindo as diferentes demandas proteicas entre modalidades esportivas."
  }
]

interface Game4StandardDeviationProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game4StandardDeviation({ onBack, onComplete }: Game4StandardDeviationProps) {
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
  const [showCalculations, setShowCalculations] = useState(false)

  const currentScenario = scenarios[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentScenario.correctAnswer
    const points = isCorrect ? 25 : 0

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
      setShowCalculations(false)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  // Prepare data for visualization
  const chartData = currentScenario.data.map((value, index) => ({
    index: index + 1,
    value,
    deviation: Math.abs(value - currentScenario.mean)
  }))

  const coefficientOfVariation = (currentScenario.standardDeviation / currentScenario.mean) * 100

  return (
    <GameBase
      gameId={4}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={scenarios.length}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentScenario.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{currentScenario.mean.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Média</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">{currentScenario.variance.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Variância</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{currentScenario.standardDeviation.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Desvio Padrão</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">{coefficientOfVariation.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">CV</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Visualization */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Visualização da Variabilidade</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculations(!showCalculations)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                {showCalculations ? 'Ocultar' : 'Ver'} Cálculos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart with Mean Line */}
              <div>
                <h4 className="font-medium mb-2">Distribuição dos Dados</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="index" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? `${value} ${currentScenario.unit}` : `${Number(value).toFixed(2)} ${currentScenario.unit}`,
                        name === 'value' ? currentScenario.variable : 'Desvio da Média'
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                    <ReferenceLine y={currentScenario.mean} stroke="#ef4444" strokeDasharray="5 5" label="Média" />
                    <ReferenceLine y={currentScenario.mean + currentScenario.standardDeviation} stroke="#10b981" strokeDasharray="3 3" label="+1 DP" />
                    <ReferenceLine y={currentScenario.mean - currentScenario.standardDeviation} stroke="#10b981" strokeDasharray="3 3" label="-1 DP" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div>
                <h4 className="font-medium mb-2">Dados e Desvios</h4>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Observação</th>
                        <th className="p-2 text-right">Valor</th>
                        <th className="p-2 text-right">Desvio</th>
                        <th className="p-2 text-right">Desvio²</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentScenario.data.map((value, index) => {
                        const deviation = value - currentScenario.mean
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2 text-right">{value}</td>
                            <td className="p-2 text-right">{deviation.toFixed(2)}</td>
                            <td className="p-2 text-right">{(deviation * deviation).toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Calculations */}
            {showCalculations && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <h4 className="font-medium mb-3">Cálculos de Variabilidade</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">Variância (σ²)</h5>
                    <p>Média dos quadrados dos desvios</p>
                    <p className="mt-1 font-mono text-xs">
                      σ² = Σ(x - μ)² / n<br/>
                      σ² = {currentScenario.variance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-600 mb-2">Desvio Padrão (σ)</h5>
                    <p>Raiz quadrada da variância</p>
                    <p className="mt-1 font-mono text-xs">
                      σ = √σ²<br/>
                      σ = {currentScenario.standardDeviation.toFixed(2)} {currentScenario.unit}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-orange-600 mb-2">Coeficiente de Variação</h5>
                    <p>Variabilidade relativa</p>
                    <p className="mt-1 font-mono text-xs">
                      CV = (σ / μ) × 100<br/>
                      CV = {coefficientOfVariation.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Interpretação:</strong> O desvio padrão mede a dispersão típica dos dados em relação à média. 
                    Aproximadamente 68% dos dados estão dentro de ±1 desvio padrão da média em distribuições normais.
                  </p>
                </div>
              </motion.div>
            )}
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
                  {gameState.currentQuestion < scenarios.length - 1 ? 'Próximo Cenário' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Explanation and Interpretation */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">Explicação</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{currentScenario.explanation}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-green-600">Interpretação Prática</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{currentScenario.interpretation}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
