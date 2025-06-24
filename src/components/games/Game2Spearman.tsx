'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InfoButton } from '@/components/ui/InfoButton'
import { PreGameEducation } from './PreGameEducation'
import { GameBase, GameState } from './GameBase'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  athlete: string
  x: number
  y: number
  rank_x: number
  rank_y: number
}

interface CorrelationScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  xVariable: string
  yVariable: string
  data: DataPoint[]
  spearmanRho: number
  interpretation: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const scenarios: CorrelationScenario[] = [
  // NÍVEL FÁCIL - Correlação forte e óbvia
  {
    id: 1,
    level: 'facil',
    title: "Altura vs Peso em Atletas",
    description: "Relação simples entre altura e peso corporal em 10 atletas de basquete",
    xVariable: "Altura (cm)",
    yVariable: "Peso (kg)",
    data: [
      { athlete: "A1", x: 180, y: 75, rank_x: 1, rank_y: 1 },
      { athlete: "A2", x: 185, y: 80, rank_x: 2, rank_y: 2 },
      { athlete: "A3", x: 190, y: 85, rank_x: 3, rank_y: 3 },
      { athlete: "A4", x: 195, y: 90, rank_x: 4, rank_y: 4 },
      { athlete: "A5", x: 200, y: 95, rank_x: 5, rank_y: 5 }
    ],
    spearmanRho: 1.00,
    interpretation: "Correlação positiva perfeita",
    question: "Com ρ = 1,00, o que isso significa?",
    options: [
      "Altura e peso não estão relacionados",
      "Existe uma relação monotônica perfeita: atletas mais altos são sempre mais pesados",
      "50% dos atletas são altos",
      "A correlação é fraca"
    ],
    correctAnswer: 1,
    explanation: "ρ = 1,00 indica correlação monotônica perfeita positiva. Os rankings de altura e peso são idênticos - o atleta mais alto é também o mais pesado, o segundo mais alto é o segundo mais pesado, etc."
  },
  // NÍVEL MÉDIO - Correlação moderada
  {
    id: 2,
    level: 'medio',
    title: "Flexibilidade vs Performance no Salto",
    description: "Relação entre flexibilidade e altura do salto vertical em 8 atletas",
    xVariable: "Flexibilidade (cm)",
    yVariable: "Altura do Salto (cm)",
    data: [
      { athlete: "S1", x: 25, y: 45, rank_x: 1, rank_y: 5 },
      { athlete: "S2", x: 30, y: 42, rank_x: 2, rank_y: 3 },
      { athlete: "S3", x: 35, y: 48, rank_x: 3, rank_y: 7 },
      { athlete: "S4", x: 40, y: 40, rank_x: 4, rank_y: 1 },
      { athlete: "S5", x: 45, y: 46, rank_x: 5, rank_y: 6 },
      { athlete: "S6", x: 50, y: 44, rank_x: 6, rank_y: 4 },
      { athlete: "S7", x: 55, y: 41, rank_x: 7, rank_y: 2 },
      { athlete: "S8", x: 60, y: 50, rank_x: 8, rank_y: 8 }
    ],
    spearmanRho: 0.31,
    interpretation: "Correlação positiva fraca",
    question: "Como interpretar ρ = 0,31 neste contexto?",
    options: [
      "Há uma forte relação entre flexibilidade e performance no salto",
      "Existe uma associação fraca e inconsistente entre as variáveis",
      "A flexibilidade determina 31% da performance no salto",
      "Não há relação alguma"
    ],
    correctAnswer: 1,
    explanation: "ρ = 0,31 indica uma correlação positiva fraca. Há uma tendência geral de que maior flexibilidade se associe a melhor performance no salto, mas a relação é inconsistente e outros fatores são mais importantes."
  },
  // NÍVEL DIFÍCIL - Interpretação complexa
  {
    id: 3,
    level: 'dificil',
    title: "Idade vs Tempo de Recuperação com Outliers",
    description: "Relação entre idade e tempo de recuperação em atletas masters, incluindo casos atípicos",
    xVariable: "Idade (anos)",
    yVariable: "Tempo Recuperação (horas)",
    data: [
      { athlete: "M1", x: 35, y: 12, rank_x: 1, rank_y: 1 },
      { athlete: "M2", x: 40, y: 16, rank_x: 2, rank_y: 3 },
      { athlete: "M3", x: 45, y: 14, rank_x: 3, rank_y: 2 },
      { athlete: "M4", x: 50, y: 20, rank_x: 4, rank_y: 5 },
      { athlete: "M5", x: 55, y: 18, rank_x: 5, rank_y: 4 },
      { athlete: "M6", x: 60, y: 35, rank_x: 6, rank_y: 6 } // Outlier
    ],
    spearmanRho: 0.77,
    interpretation: "Correlação positiva forte (resistente a outliers)",
    question: "Por que usar Spearman em vez de Pearson neste caso com outlier?",
    options: [
      "Spearman é sempre melhor que Pearson",
      "Spearman é baseado em rankings e menos sensível a valores extremos",
      "Pearson não funciona com idades",
      "Spearman é mais fácil de calcular"
    ],
    correctAnswer: 1,
    explanation: "A correlação de Spearman é baseada nos rankings dos dados, não nos valores absolutos. Isso a torna mais resistente a outliers (como o atleta M6 com 35h de recuperação). Pearson seria mais afetado por este valor extremo, enquanto Spearman mantém a interpretação da tendência geral."
  },
  {
    id: 2,
    level: 'medio',
    title: "Força vs Velocidade de Sprint",
    description: "Relação entre força máxima no agachamento e velocidade de sprint em 12 velocistas",
    xVariable: "Força Máxima (kg)",
    yVariable: "Velocidade Sprint (m/s)",
    data: [
      { athlete: "V1", x: 180, y: 10.2, rank_x: 12, rank_y: 12 },
      { athlete: "V2", x: 175, y: 9.8, rank_x: 11, rank_y: 11 },
      { athlete: "V3", x: 170, y: 9.5, rank_x: 10, rank_y: 10 },
      { athlete: "V4", x: 165, y: 9.2, rank_x: 9, rank_y: 9 },
      { athlete: "V5", x: 160, y: 8.9, rank_x: 8, rank_y: 8 },
      { athlete: "V6", x: 155, y: 8.6, rank_x: 7, rank_y: 7 },
      { athlete: "V7", x: 150, y: 8.3, rank_x: 6, rank_y: 6 },
      { athlete: "V8", x: 145, y: 8.0, rank_x: 5, rank_y: 5 },
      { athlete: "V9", x: 140, y: 7.7, rank_x: 4, rank_y: 4 },
      { athlete: "V10", x: 135, y: 7.4, rank_x: 3, rank_y: 3 },
      { athlete: "V11", x: 130, y: 7.1, rank_x: 2, rank_y: 2 },
      { athlete: "V12", x: 125, y: 6.8, rank_x: 1, rank_y: 1 }
    ],
    spearmanRho: 1.00,
    interpretation: "Correlação positiva perfeita",
    question: "Com ρ = 1,00, o que podemos concluir sobre a relação entre força e velocidade?",
    options: [
      "A força causa diretamente o aumento da velocidade",
      "Há uma relação monotônica perfeita: os rankings são idênticos",
      "A correlação é coincidência devido ao tamanho pequeno da amostra",
      "100% da velocidade é determinada pela força"
    ],
    correctAnswer: 1,
    explanation: "ρ = 1,00 indica uma correlação monotônica perfeita positiva. Isso significa que os rankings de força e velocidade são exatamente os mesmos - o atleta mais forte é também o mais rápido, o segundo mais forte é o segundo mais rápido, e assim por diante. Importante: correlação não implica causalidade."
  },
  {
    id: 3,
    level: 'medio',
    title: "Flexibilidade vs Performance no Salto",
    description: "Análise da relação entre flexibilidade e altura do salto vertical em 10 atletas",
    xVariable: "Flexibilidade (cm)",
    yVariable: "Altura do Salto (cm)",
    data: [
      { athlete: "S1", x: 25, y: 45, rank_x: 1, rank_y: 5 },
      { athlete: "S2", x: 28, y: 48, rank_x: 2, rank_y: 7 },
      { athlete: "S3", x: 30, y: 42, rank_x: 3, rank_y: 3 },
      { athlete: "S4", x: 32, y: 50, rank_x: 4, rank_y: 9 },
      { athlete: "S5", x: 35, y: 40, rank_x: 5, rank_y: 1 },
      { athlete: "S6", x: 37, y: 46, rank_x: 6, rank_y: 6 },
      { athlete: "S7", x: 40, y: 52, rank_x: 7, rank_y: 10 },
      { athlete: "S8", x: 42, y: 41, rank_x: 8, rank_y: 2 },
      { athlete: "S9", x: 45, y: 49, rank_x: 9, rank_y: 8 },
      { athlete: "S10", x: 48, y: 44, rank_x: 10, rank_y: 4 }
    ],
    spearmanRho: 0.15,
    interpretation: "Correlação positiva muito fraca",
    question: "Como interpretar ρ = 0,15 neste contexto?",
    options: [
      "Há uma forte relação entre flexibilidade e performance no salto",
      "A flexibilidade não tem relação com a performance no salto",
      "Existe uma associação monotônica muito fraca e inconsistente",
      "O resultado indica erro de medição"
    ],
    correctAnswer: 2,
    explanation: "ρ = 0,15 indica uma correlação positiva muito fraca. Embora haja uma tendência geral de que maior flexibilidade se associe a melhor performance no salto, a relação é muito inconsistente e praticamente inexistente. Isso sugere que outros fatores são muito mais importantes para a performance no salto vertical."
  },
  {
    id: 4,
    level: 'dificil',
    title: "Idade vs Tempo de Recuperação",
    description: "Relação entre idade e tempo de recuperação após exercício intenso em 14 atletas masters",
    xVariable: "Idade (anos)",
    yVariable: "Tempo Recuperação (horas)",
    data: [
      { athlete: "M1", x: 35, y: 12, rank_x: 1, rank_y: 1 },
      { athlete: "M2", x: 37, y: 14, rank_x: 2, rank_y: 2 },
      { athlete: "M3", x: 39, y: 15, rank_x: 3, rank_y: 3 },
      { athlete: "M4", x: 41, y: 16, rank_x: 4, rank_y: 4 },
      { athlete: "M5", x: 43, y: 18, rank_x: 5, rank_y: 5 },
      { athlete: "M6", x: 45, y: 20, rank_x: 6, rank_y: 6 },
      { athlete: "M7", x: 47, y: 22, rank_x: 7, rank_y: 7 },
      { athlete: "M8", x: 49, y: 24, rank_x: 8, rank_y: 8 },
      { athlete: "M9", x: 51, y: 26, rank_x: 9, rank_y: 9 },
      { athlete: "M10", x: 53, y: 28, rank_x: 10, rank_y: 10 },
      { athlete: "M11", x: 55, y: 30, rank_x: 11, rank_y: 11 },
      { athlete: "M12", x: 57, y: 32, rank_x: 12, rank_y: 12 },
      { athlete: "M13", x: 59, y: 34, rank_x: 13, rank_y: 13 },
      { athlete: "M14", x: 61, y: 36, rank_x: 14, rank_y: 14 }
    ],
    spearmanRho: 0.89,
    interpretation: "Correlação positiva forte",
    question: "Qual é a implicação prática de ρ = 0,89 para treinadores?",
    options: [
      "A idade não afeta significativamente a recuperação",
      "Atletas mais velhos tendem a precisar de mais tempo para recuperação",
      "A correlação é muito baixa para ser considerada",
      "Apenas 89% dos atletas seguem este padrão"
    ],
    correctAnswer: 1,
    explanation: "ρ = 0,89 indica uma correlação positiva forte entre idade e tempo de recuperação. Isso sugere que, de forma consistente, atletas mais velhos tendem a precisar de mais tempo para se recuperar de exercícios intensos. Esta informação é valiosa para treinadores ajustarem programas de treinamento conforme a idade dos atletas."
  },
  // NÍVEL MUITO FÁCIL - Para iniciantes absolutos
  {
    id: 5,
    level: 'muito-facil',
    title: "Altura vs Peso - Exemplo Simples",
    description: "Relação básica entre altura e peso em 5 pessoas da academia",
    xVariable: "Altura (cm)",
    yVariable: "Peso (kg)",
    data: [
      { athlete: "João", x: 160, y: 60, rank_x: 1, rank_y: 1 },
      { athlete: "Maria", x: 165, y: 65, rank_x: 2, rank_y: 2 },
      { athlete: "Pedro", x: 170, y: 70, rank_x: 3, rank_y: 3 },
      { athlete: "Ana", x: 175, y: 75, rank_x: 4, rank_y: 4 },
      { athlete: "Carlos", x: 180, y: 80, rank_x: 5, rank_y: 5 }
    ],
    spearmanRho: 1.00,
    interpretation: "Correlação positiva perfeita",
    question: "Observando os dados, o que significa ρ = 1,00?",
    options: [
      "Não há relação entre altura e peso",
      "A pessoa mais alta é sempre a mais pesada, sem exceção",
      "Metade das pessoas são altas",
      "O peso não importa"
    ],
    correctAnswer: 1,
    explanation: "ρ = 1,00 significa correlação perfeita positiva. Neste caso simples, vemos que a pessoa mais baixa (João, 160cm) é a mais leve (60kg), a segunda mais baixa (Maria, 165cm) é a segunda mais leve (65kg), e assim por diante. É uma relação perfeita: quanto maior a altura, maior o peso, sem exceções."
  },
  // NÍVEL MUITO DIFÍCIL - Análise complexa com interpretação avançada
  {
    id: 6,
    level: 'muito-dificil',
    title: "VO₂ máx vs Performance com Relação Não-Linear",
    description: "Análise da relação entre VO₂ máximo e tempo de corrida de 10km, considerando efeito platô em altos níveis",
    xVariable: "VO₂ máx (ml/kg/min)",
    yVariable: "Tempo 10km (min)",
    data: [
      { athlete: "E1", x: 45, y: 50, rank_x: 1, rank_y: 12 },
      { athlete: "E2", x: 48, y: 48, rank_x: 2, rank_y: 11 },
      { athlete: "E3", x: 51, y: 46, rank_x: 3, rank_y: 10 },
      { athlete: "E4", x: 54, y: 44, rank_x: 4, rank_y: 9 },
      { athlete: "E5", x: 57, y: 42, rank_x: 5, rank_y: 8 },
      { athlete: "E6", x: 60, y: 40, rank_x: 6, rank_y: 7 },
      { athlete: "E7", x: 63, y: 38, rank_x: 7, rank_y: 6 },
      { athlete: "E8", x: 66, y: 36, rank_x: 8, rank_y: 5 },
      { athlete: "E9", x: 69, y: 34, rank_x: 9, rank_y: 4 },
      { athlete: "E10", x: 72, y: 32, rank_x: 10, rank_y: 3 },
      { athlete: "E11", x: 75, y: 31, rank_x: 11, rank_y: 2 },
      { athlete: "E12", x: 78, y: 30, rank_x: 12, rank_y: 1 }
    ],
    spearmanRho: -0.95,
    interpretation: "Correlação negativa muito forte",
    question: "Por que Spearman é mais apropriado que Pearson para esta relação VO₂-performance?",
    options: [
      "Spearman é sempre melhor para dados de corrida",
      "A relação pode ser não-linear, mas Spearman captura a tendência monotônica",
      "Pearson não funciona com valores negativos",
      "Spearman é mais fácil de interpretar"
    ],
    correctAnswer: 1,
    explanation: "A correlação de Spearman é ideal aqui porque captura a tendência monotônica (maior VO₂ → menor tempo) mesmo que a relação não seja perfeitamente linear. Em altos níveis de VO₂, pode haver um efeito platô onde melhorias adicionais no VO₂ resultam em ganhos menores de performance. Spearman, baseado em rankings, detecta essa tendência consistente independente da forma exata da curva."
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "O que é a Correlação de Spearman?",
    content: `A correlação de Spearman mede a força e direção de uma relação monotônica entre duas variáveis. Diferente da correlação de Pearson, ela se baseia nos rankings (posições) dos dados, não nos valores absolutos.

É especialmente útil quando os dados não seguem uma distribuição normal ou quando há outliers que poderiam distorcer a correlação de Pearson.`,
    concepts: [
      {
        term: "Correlação de Spearman",
        symbol: "ρ (rho)",
        definition: "Medida de associação monotônica baseada nos rankings dos dados",
        formula: "ρ = 1 - (6 × Σd²) / (n × (n² - 1))",
        example: "ρ = 0,85 indica forte associação monotônica positiva"
      },
      {
        term: "Relação Monotônica",
        definition: "Quando uma variável tende a aumentar (ou diminuir) conforme a outra aumenta",
        example: "Altura e peso: pessoas mais altas tendem a ser mais pesadas"
      }
    ]
  },
  {
    title: "Interpretação dos Valores",
    content: `Os valores de ρ variam de -1 a +1:
• ρ = +1: Correlação monotônica positiva perfeita
• ρ = 0: Nenhuma associação monotônica
• ρ = -1: Correlação monotônica negativa perfeita

Força da correlação:
• |ρ| > 0,7: Forte
• 0,3 < |ρ| ≤ 0,7: Moderada
• |ρ| ≤ 0,3: Fraca`,
    concepts: [
      {
        term: "Correlação Positiva",
        definition: "Quando uma variável aumenta, a outra também tende a aumentar",
        example: "Altura e alcance dos braços em atletas"
      },
      {
        term: "Correlação Negativa",
        definition: "Quando uma variável aumenta, a outra tende a diminuir",
        example: "VO₂ máximo e tempo de corrida (maior VO₂ = menor tempo)"
      }
    ]
  }
]

interface Game2SpearmanProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game2Spearman({ onBack, onComplete }: Game2SpearmanProps) {
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
  const [showCalculation, setShowCalculation] = useState(false)

  // Get current scenario based on level
  const getCurrentScenario = () => {
    const levelScenarios = scenarios.filter(s => s.level === gameState.currentLevel)
    return levelScenarios[gameState.currentQuestion] || scenarios[0]
  }

  const currentScenario = getCurrentScenario()

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

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
      setShowCalculation(false)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  const getCorrelationIcon = (rho: number) => {
    if (rho > 0.7) return <TrendingUp className="w-5 h-5 text-green-600" />
    if (rho < -0.7) return <TrendingDown className="w-5 h-5 text-red-600" />
    if (Math.abs(rho) > 0.3) return <Minus className="w-5 h-5 text-yellow-600" />
    return <Minus className="w-5 h-5 text-gray-400" />
  }

  const getCorrelationColor = (rho: number) => {
    if (Math.abs(rho) > 0.7) return 'text-green-600'
    if (Math.abs(rho) > 0.3) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Correlação de Spearman"
      gameDescription="Aprenda a analisar relações monotônicas entre variáveis usando dados de desempenho esportivo"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={6}
    />
  )

  return (
    <GameBase
      gameId={2}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={6} // 6 scenarios across all levels
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
              <div className="flex items-center space-x-2">
                {getCorrelationIcon(currentScenario.spearmanRho)}
                <span className={`font-medium ${getCorrelationColor(currentScenario.spearmanRho)}`}>
                  ρ = {currentScenario.spearmanRho.toFixed(2)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{currentScenario.description}</p>
          </CardContent>
        </Card>

        {/* Data Visualization */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Dados e Visualização</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalculation(!showCalculation)}
              >
                {showCalculation ? 'Ocultar' : 'Ver'} Cálculo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Scatter Plot */}
              <div>
                <h4 className="font-medium mb-2">Gráfico de Dispersão</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={currentScenario.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      name={currentScenario.xVariable}
                      type="number"
                    />
                    <YAxis 
                      dataKey="y" 
                      name={currentScenario.yVariable}
                      type="number"
                    />
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `Atleta: ${label}`}
                    />
                    <Scatter dataKey="y" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              <div>
                <h4 className="font-medium mb-2">Dados dos Atletas</h4>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">Atleta</th>
                        <th className="p-2 text-right">X</th>
                        <th className="p-2 text-right">Y</th>
                        <th className="p-2 text-right">Rank X</th>
                        <th className="p-2 text-right">Rank Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentScenario.data.map((point, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{point.athlete}</td>
                          <td className="p-2 text-right">{point.x}</td>
                          <td className="p-2 text-right">{point.y}</td>
                          <td className="p-2 text-right">{point.rank_x}</td>
                          <td className="p-2 text-right">{point.rank_y}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Calculation Details */}
            {showCalculation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 bg-blue-50 rounded-lg"
              >
                <h4 className="font-medium mb-2">Cálculo da Correlação de Spearman</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Fórmula:</strong> ρ = 1 - (6 × Σd²) / (n × (n² - 1))</p>
                  <p><strong>Onde:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>d = diferença entre os rankings de cada par de observações</li>
                    <li>n = número de observações ({currentScenario.data.length})</li>
                  </ul>
                  <p><strong>Interpretação:</strong> {currentScenario.interpretation}</p>
                  <p className="text-gray-600">
                    A correlação de Spearman mede a força e direção da associação monotônica 
                    entre duas variáveis baseada nos rankings dos dados.
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

        {/* Explanation */}
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
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
