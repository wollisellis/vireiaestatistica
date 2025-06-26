'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Calculator, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface NutritionData {
  participant: string
  value: number
  category?: string
}

interface CentralTendencyScenario {
  id: number
  title: string
  description: string
  variable: string
  unit: string
  data: NutritionData[]
  mean: number
  median: number
  mode: number[]
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  interpretation: string
}

const scenarios: CentralTendencyScenario[] = [
  {
    id: 1,
    title: "Consumo Diário de Fibras",
    description: "Análise do consumo diário de fibras (gramas) em 20 adultos brasileiros",
    variable: "Fibras",
    unit: "gramas/dia",
    data: [
      { participant: "P1", value: 15 },
      { participant: "P2", value: 18 },
      { participant: "P3", value: 22 },
      { participant: "P4", value: 25 },
      { participant: "P5", value: 25 },
      { participant: "P6", value: 28 },
      { participant: "P7", value: 30 },
      { participant: "P8", value: 32 },
      { participant: "P9", value: 35 },
      { participant: "P10", value: 35 },
      { participant: "P11", value: 35 },
      { participant: "P12", value: 38 },
      { participant: "P13", value: 40 },
      { participant: "P14", value: 42 },
      { participant: "P15", value: 45 },
      { participant: "P16", value: 48 },
      { participant: "P17", value: 50 },
      { participant: "P18", value: 55 },
      { participant: "P19", value: 60 },
      { participant: "P20", value: 65 }
    ],
    mean: 37.4,
    median: 35,
    mode: [35],
    question: "Considerando que a recomendação diária de fibras é 25g, qual medida de tendência central melhor representa o consumo típico desta população?",
    options: [
      "Média (37,4g) - representa o consumo médio da população",
      "Mediana (35g) - não é influenciada por valores extremos",
      "Moda (35g) - representa o valor mais comum",
      "Todas são igualmente representativas"
    ],
    correctAnswer: 1,
    explanation: "A mediana (35g) é a melhor escolha porque não é influenciada pelos valores extremos (60g e 65g). Em dados nutricionais, frequentemente temos outliers que podem distorcer a média. A mediana representa melhor o consumo 'típico' da população.",
    interpretation: "A população estudada tem consumo adequado de fibras, com 50% consumindo 35g ou mais, acima da recomendação de 25g/dia."
  },
  {
    id: 2,
    title: "Ingestão de Proteínas por Atletas",
    description: "Consumo diário de proteínas (g/kg peso corporal) em 15 atletas de força",
    variable: "Proteínas",
    unit: "g/kg/dia",
    data: [
      { participant: "A1", value: 1.2 },
      { participant: "A2", value: 1.5 },
      { participant: "A3", value: 1.6 },
      { participant: "A4", value: 1.8 },
      { participant: "A5", value: 2.0 },
      { participant: "A6", value: 2.0 },
      { participant: "A7", value: 2.2 },
      { participant: "A8", value: 2.2 },
      { participant: "A9", value: 2.2 },
      { participant: "A10", value: 2.5 },
      { participant: "A11", value: 2.8 },
      { participant: "A12", value: 3.0 },
      { participant: "A13", value: 3.2 },
      { participant: "A14", value: 3.5 },
      { participant: "A15", value: 4.0 }
    ],
    mean: 2.38,
    median: 2.2,
    mode: [2.2],
    question: "Para estabelecer recomendações nutricionais para atletas de força, qual medida seria mais apropriada?",
    options: [
      "Média (2,38 g/kg) - considera todos os valores igualmente",
      "Mediana (2,2 g/kg) - representa o atleta 'médio'",
      "Moda (2,2 g/kg) - representa o consumo mais frequente",
      "Valor máximo (4,0 g/kg) - garante adequação para todos"
    ],
    correctAnswer: 0,
    explanation: "Para recomendações nutricionais, a média é mais apropriada porque considera todos os valores e fornece uma estimativa do consumo total da população. A média de 2,38 g/kg está dentro da faixa recomendada para atletas de força (1,6-2,2 g/kg), mas alguns atletas podem precisar de mais.",
    interpretation: "Os atletas estudados consomem proteína adequadamente, com média acima das recomendações mínimas para atletas de força."
  },
  {
    id: 3,
    title: "Consumo de Cálcio em Adolescentes",
    description: "Ingestão diária de cálcio (mg) em 18 adolescentes do sexo feminino",
    variable: "Cálcio",
    unit: "mg/dia",
    data: [
      { participant: "T1", value: 400 },
      { participant: "T2", value: 450 },
      { participant: "T3", value: 500 },
      { participant: "T4", value: 550 },
      { participant: "T5", value: 600 },
      { participant: "T6", value: 650 },
      { participant: "T7", value: 700 },
      { participant: "T8", value: 750 },
      { participant: "T9", value: 800 },
      { participant: "T10", value: 800 },
      { participant: "T11", value: 850 },
      { participant: "T12", value: 900 },
      { participant: "T13", value: 950 },
      { participant: "T14", value: 1000 },
      { participant: "T15", value: 1200 },
      { participant: "T16", value: 1500 },
      { participant: "T17", value: 1800 },
      { participant: "T18", value: 2000 }
    ],
    mean: 916.7,
    median: 825,
    mode: [800],
    question: "Sabendo que a recomendação de cálcio para adolescentes é 1300mg/dia, qual interpretação está correta?",
    options: [
      "A média (916,7mg) indica que a maioria atende às recomendações",
      "A mediana (825mg) mostra que 50% da população está abaixo da recomendação",
      "A moda (800mg) representa o consumo mais comum, que é adequado",
      "Todas as medidas indicam consumo adequado"
    ],
    correctAnswer: 1,
    explanation: "A mediana de 825mg indica que 50% das adolescentes consomem menos que isso, bem abaixo da recomendação de 1300mg/dia. A média é inflacionada pelos valores altos (1500-2000mg), não representando a realidade da maioria. A moda (800mg) também está muito abaixo da recomendação.",
    interpretation: "Há deficiência significativa no consumo de cálcio nesta população, com metade das adolescentes consumindo menos de 825mg/dia."
  },
  {
    id: 4,
    title: "Tempo de Jejum Intermitente",
    description: "Duração do jejum (horas) praticado por 16 adultos em protocolo 16:8",
    variable: "Jejum",
    unit: "horas",
    data: [
      { participant: "J1", value: 14 },
      { participant: "J2", value: 15 },
      { participant: "J3", value: 16 },
      { participant: "J4", value: 16 },
      { participant: "J5", value: 16 },
      { participant: "J6", value: 16 },
      { participant: "J7", value: 16 },
      { participant: "J8", value: 16 },
      { participant: "J9", value: 16 },
      { participant: "J10", value: 17 },
      { participant: "J11", value: 17 },
      { participant: "J12", value: 18 },
      { participant: "J13", value: 18 },
      { participant: "J14", value: 19 },
      { participant: "J15", value: 20 },
      { participant: "J16", value: 22 }
    ],
    mean: 16.9,
    median: 16,
    mode: [16],
    question: "Para um protocolo de jejum 16:8, qual medida melhor avalia a aderência ao protocolo?",
    options: [
      "Média (16,9h) - mostra que em média o protocolo é seguido",
      "Mediana (16h) - indica que 50% seguem exatamente o protocolo",
      "Moda (16h) - mostra que a maioria segue o protocolo corretamente",
      "Todas indicam boa aderência ao protocolo"
    ],
    correctAnswer: 2,
    explanation: "A moda (16h) é a melhor medida neste caso porque mostra que o valor mais frequente é exatamente o protocolo prescrito. Isso indica que a maioria dos participantes está seguindo corretamente o jejum de 16 horas. A média é ligeiramente inflacionada por alguns valores mais altos.",
    interpretation: "Excelente aderência ao protocolo 16:8, com a maioria dos participantes seguindo exatamente as 16 horas de jejum recomendadas."
  },
  {
    id: 5,
    title: "Hidratação de Maratonistas Brasileiros",
    description: "Análise do consumo de água (litros) durante treinos de 25 maratonistas da equipe brasileira",
    variable: "Hidratação",
    unit: "litros/treino",
    data: [
      { participant: "M1", value: 2.5 },
      { participant: "M2", value: 3.0 },
      { participant: "M3", value: 2.8 },
      { participant: "M4", value: 3.2 },
      { participant: "M5", value: 2.7 },
      { participant: "M6", value: 3.1 },
      { participant: "M7", value: 2.9 },
      { participant: "M8", value: 3.0 },
      { participant: "M9", value: 2.6 },
      { participant: "M10", value: 3.3 },
      { participant: "M11", value: 2.8 },
      { participant: "M12", value: 3.0 },
      { participant: "M13", value: 2.9 },
      { participant: "M14", value: 3.1 },
      { participant: "M15", value: 2.7 },
      { participant: "M16", value: 3.0 },
      { participant: "M17", value: 2.8 },
      { participant: "M18", value: 3.2 },
      { participant: "M19", value: 2.9 },
      { participant: "M20", value: 3.0 },
      { participant: "M21", value: 2.8 },
      { participant: "M22", value: 3.1 },
      { participant: "M23", value: 2.9 },
      { participant: "M24", value: 3.0 },
      { participant: "M25", value: 2.8 }
    ],
    mean: 2.9,
    median: 2.9,
    mode: [3.0],
    question: "Considerando que a recomendação é 2,5-3,5L por treino, qual medida de tendência central melhor representa o grupo?",
    options: [
      "Média (2,9L) - representa bem o centro da distribuição",
      "Mediana (2,9L) - não é afetada por valores extremos",
      "Moda (3,0L) - valor mais comum entre os atletas",
      "Todas são igualmente válidas pois são muito próximas"
    ],
    correctAnswer: 3,
    explanation: "Quando média, mediana e moda são próximas (2,9; 2,9; 3,0), indica distribuição simétrica. Todas as medidas são válidas e representam bem o grupo.",
    interpretation: "Excelente hidratação da equipe brasileira, com consumo médio dentro da faixa recomendada e baixa variabilidade entre atletas."
  }
]

interface Game3CentralTendencyProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game3CentralTendency({ onBack, onComplete }: Game3CentralTendencyProps) {
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

  // Prepare data for histogram
  const histogramData = currentScenario.data.reduce((acc, item) => {
    const existing = acc.find(d => d.value === item.value)
    if (existing) {
      existing.frequency += 1
    } else {
      acc.push({ value: item.value, frequency: 1 })
    }
    return acc
  }, [] as { value: number; frequency: number }[])
  .sort((a, b) => a.value - b.value)

  return (
    <GameBase
      gameId={3}
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
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentScenario.mean.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Média</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentScenario.median}</div>
                <div className="text-sm text-gray-600">Mediana</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentScenario.mode.join(', ')}
                </div>
                <div className="text-sm text-gray-600">Moda</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Visualization */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Distribuição dos Dados</h3>
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
              {/* Histogram */}
              <div>
                <h4 className="font-medium mb-2">Histograma de Frequências</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="value" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [value, 'Frequência']}
                      labelFormatter={(label) => `${currentScenario.variable}: ${label} ${currentScenario.unit}`}
                    />
                    <Bar dataKey="frequency" fill="#3b82f6" />
                    <ReferenceLine x={currentScenario.mean} stroke="#ef4444" strokeDasharray="5 5" label="Média" />
                    <ReferenceLine x={currentScenario.median} stroke="#10b981" strokeDasharray="5 5" label="Mediana" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Raw Data */}
              <div>
                <h4 className="font-medium mb-2">Dados Originais</h4>
                <div className="max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {currentScenario.data.map((item, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-center">
                        <div className="font-medium">{item.participant}</div>
                        <div className="text-gray-600">{item.value} {currentScenario.unit}</div>
                      </div>
                    ))}
                  </div>
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
                <h4 className="font-medium mb-3">Cálculos das Medidas de Tendência Central</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-600 mb-2">Média</h5>
                    <p>Soma de todos os valores dividida pelo número de observações</p>
                    <p className="mt-1 font-mono">
                      Σx / n = {currentScenario.data.reduce((sum, item) => sum + item.value, 0)} / {currentScenario.data.length} = {currentScenario.mean.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-green-600 mb-2">Mediana</h5>
                    <p>Valor central quando os dados estão ordenados</p>
                    <p className="mt-1">
                      Posição: {Math.ceil(currentScenario.data.length / 2)}ª observação = {currentScenario.median}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-purple-600 mb-2">Moda</h5>
                    <p>Valor(es) que aparecem com maior frequência</p>
                    <p className="mt-1">
                      Valor mais frequente: {currentScenario.mode.join(', ')}
                    </p>
                  </div>
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
                <h3 className="text-lg font-semibold text-green-600">Interpretação Nutricional</h3>
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
