'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Play, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface SimulationScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  context: string
  simulationType: 'correlation' | 'ttest' | 'sample-size'
  parameters: {
    [key: string]: {
      label: string
      min: number
      max: number
      default: number
      step: number
      unit?: string
    }
  }
  learningObjectives: string[]
  interpretation: {
    [key: string]: string
  }
}

const simulationScenarios: SimulationScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: 'Simulação de Correlação - Altura vs Peso',
    description: 'Explore como a força da correlação afeta a relação entre altura e peso',
    context: 'Você é um nutricionista estudando a relação entre altura e peso em atletas. Ajuste a força da correlação e veja como isso afeta os dados.',
    simulationType: 'correlation',
    parameters: {
      correlation: {
        label: 'Força da Correlação',
        min: -1,
        max: 1,
        default: 0.7,
        step: 0.1,
        unit: ''
      },
      sampleSize: {
        label: 'Número de Atletas',
        min: 20,
        max: 200,
        default: 50,
        step: 10,
        unit: ' pessoas'
      }
    },
    learningObjectives: [
      'Entender como a correlação afeta a dispersão dos pontos',
      'Ver a diferença entre correlação forte e fraca',
      'Compreender que correlação não implica causalidade'
    ],
    interpretation: {
      'strong_positive': 'Correlação forte positiva (>0.7): Pessoas mais altas tendem a pesar mais',
      'moderate_positive': 'Correlação moderada positiva (0.3-0.7): Há uma tendência, mas com variação',
      'weak_positive': 'Correlação fraca positiva (0-0.3): Pouca relação entre altura e peso',
      'weak_negative': 'Correlação fraca negativa (-0.3-0): Pouca relação inversa',
      'moderate_negative': 'Correlação moderada negativa (-0.7--0.3): Tendência inversa moderada',
      'strong_negative': 'Correlação forte negativa (<-0.7): Pessoas mais altas tendem a pesar menos (raro na realidade)'
    }
  },
  {
    id: 2,
    level: 'facil',
    title: 'Simulação de Teste t - Efeito de uma Dieta',
    description: 'Veja como o tamanho do efeito e da amostra afetam a significância estatística',
    context: 'Você está testando se uma nova dieta realmente funciona. Ajuste o efeito da dieta e o número de participantes para ver quando o resultado fica "estatisticamente significativo".',
    simulationType: 'ttest',
    parameters: {
      effectSize: {
        label: 'Efeito da Dieta (kg perdidos)',
        min: 0,
        max: 10,
        default: 2,
        step: 0.5,
        unit: ' kg'
      },
      sampleSize: {
        label: 'Participantes por Grupo',
        min: 10,
        max: 100,
        default: 30,
        step: 5,
        unit: ' pessoas'
      },
      variability: {
        label: 'Variabilidade Individual',
        min: 1,
        max: 8,
        default: 3,
        step: 0.5,
        unit: ' kg'
      }
    },
    learningObjectives: [
      'Ver como o tamanho da amostra afeta a significância',
      'Entender que efeitos pequenos podem ser significativos com amostras grandes',
      'Compreender a diferença entre significância estatística e relevância prática'
    ],
    interpretation: {
      'significant': 'p < 0.05: Resultado estatisticamente significativo - provavelmente a dieta funciona',
      'not_significant': 'p ≥ 0.05: Resultado não significativo - não podemos afirmar que a dieta funciona',
      'large_effect': 'Efeito grande (>5kg): Muito relevante na prática, mesmo se não significativo',
      'small_effect': 'Efeito pequeno (<1kg): Pode ser significativo mas pouco relevante na prática'
    }
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Simulações Estatísticas - Aprendendo Fazendo",
    content: (
      <div className="space-y-4">
        <p>🎮 <strong>Por que usar simulações?</strong> É como um videogame educativo - você pode experimentar e ver o que acontece!</p>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🔬 O que você vai aprender:</h4>
          <ul className="text-blue-700 space-y-1">
            <li>• Como diferentes fatores afetam os resultados estatísticos</li>
            <li>• Por que às vezes os resultados mudam quando repetimos o estudo</li>
            <li>• A diferença entre "estatisticamente significativo" e "importante na prática"</li>
          </ul>
        </div>
        
        <p>🎯 <strong>Como funciona:</strong> Você vai ajustar parâmetros (como botões de volume) e ver como isso muda os gráficos e resultados em tempo real!</p>
        
        <p>💡 <strong>Dica:</strong> Experimente valores extremos para ver o que acontece. É seguro - é só uma simulação!</p>
      </div>
    ),
    concepts: [
      {
        term: "Simulação",
        definition: "Modelo computacional que imita situações reais para aprendizado",
        example: "Simular 1000 jogadas de moeda para entender probabilidade"
      },
      {
        term: "Parâmetro",
        definition: "Valor que você pode ajustar para mudar o comportamento da simulação",
        example: "Tamanho da amostra, força da correlação"
      }
    ]
  },
  {
    title: "Interpretando Resultados - O que os Números Significam",
    content: (
      <div className="space-y-4">
        <p>📊 <strong>Aprender a ler resultados é como aprender a ler um mapa:</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Significância Estatística</h4>
            <p className="text-green-700 text-sm">
              <strong>p &lt; 0.05:</strong> "Provavelmente não foi sorte"<br/>
              <strong>p ≥ 0.05:</strong> "Pode ter sido sorte"
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🎯 Relevância Prática</h4>
            <p className="text-yellow-700 text-sm">
              <strong>Efeito grande:</strong> "Faz diferença na vida real"<br/>
              <strong>Efeito pequeno:</strong> "Estatisticamente real, mas pouco importante"
            </p>
          </div>
        </div>
        
        <p>⚖️ <strong>O ideal:</strong> Resultado que é tanto estatisticamente significativo quanto praticamente relevante!</p>
      </div>
    ),
    concepts: [
      {
        term: "Valor-p",
        definition: "Probabilidade de obter esses resultados se não houvesse efeito real",
        example: "p = 0.03 significa 3% de chance de ser coincidência"
      },
      {
        term: "Tamanho do Efeito",
        definition: "O quanto uma intervenção realmente muda o resultado",
        example: "Dieta que faz perder 0.1kg vs 5kg"
      }
    ]
  }
]

interface Game36InteractiveStatSimulationProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game36InteractiveStatSimulation({ onBack, onComplete }: Game36InteractiveStatSimulationProps) {
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

  const [parameters, setParameters] = useState<{[key: string]: number}>({})
  const [simulationResults, setSimulationResults] = useState<any>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
    // Initialize parameters with defaults
    const currentScenario = simulationScenarios[gameState.currentQuestion]
    const defaultParams: {[key: string]: number} = {}
    Object.entries(currentScenario.parameters).forEach(([key, param]) => {
      defaultParams[key] = param.default
    })
    setParameters(defaultParams)
  }

  const currentScenario = simulationScenarios[gameState.currentQuestion]

  const runSimulation = () => {
    setIsRunning(true)
    
    // Simulate processing time for realism
    setTimeout(() => {
      const results = generateSimulationResults(currentScenario.simulationType, parameters)
      setSimulationResults(results)
      setIsRunning(false)
      
      // Award points for running simulation
      setGameState(prev => ({
        ...prev,
        score: prev.score + 25
      }))
    }, 1000)
  }

  const generateSimulationResults = (type: string, params: {[key: string]: number}) => {
    switch (type) {
      case 'correlation':
        return generateCorrelationResults(params)
      case 'ttest':
        return generateTTestResults(params)
      default:
        return null
    }
  }

  const generateCorrelationResults = (params: {[key: string]: number}) => {
    const { correlation, sampleSize } = params
    
    // Generate synthetic data points for visualization
    const dataPoints = []
    for (let i = 0; i < sampleSize; i++) {
      const height = 150 + Math.random() * 50 // 150-200cm
      const weight = 50 + height * 0.8 + (Math.random() - 0.5) * 30 * (1 - Math.abs(correlation))
      dataPoints.push({ height, weight })
    }
    
    return {
      correlation: correlation,
      dataPoints,
      interpretation: getCorrelationInterpretation(correlation),
      rSquared: correlation * correlation
    }
  }

  const generateTTestResults = (params: {[key: string]: number}) => {
    const { effectSize, sampleSize, variability } = params
    
    // Simplified t-test calculation
    const standardError = variability / Math.sqrt(sampleSize)
    const tStatistic = effectSize / standardError
    const degreesOfFreedom = (sampleSize * 2) - 2
    
    // Simplified p-value calculation (approximation)
    const pValue = tStatistic > 2 ? 0.01 : tStatistic > 1.5 ? 0.05 : 0.15
    
    return {
      effectSize,
      tStatistic: tStatistic.toFixed(2),
      pValue: pValue.toFixed(3),
      significant: pValue < 0.05,
      interpretation: getTTestInterpretation(pValue, effectSize)
    }
  }

  const getCorrelationInterpretation = (r: number) => {
    if (r > 0.7) return 'strong_positive'
    if (r > 0.3) return 'moderate_positive'
    if (r > 0) return 'weak_positive'
    if (r > -0.3) return 'weak_negative'
    if (r > -0.7) return 'moderate_negative'
    return 'strong_negative'
  }

  const getTTestInterpretation = (p: number, effect: number) => {
    if (p < 0.05 && effect > 5) return 'significant'
    if (p < 0.05) return 'significant'
    if (effect > 5) return 'large_effect'
    if (effect < 1) return 'small_effect'
    return 'not_significant'
  }

  const handleNextScenario = () => {
    if (gameState.currentQuestion < simulationScenarios.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
      setSimulationResults(null)
      // Reset parameters for new scenario
      const nextScenario = simulationScenarios[gameState.currentQuestion + 1]
      const defaultParams: {[key: string]: number} = {}
      Object.entries(nextScenario.parameters).forEach(([key, param]) => {
        defaultParams[key] = param.default
      })
      setParameters(defaultParams)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Simulações Estatísticas Interativas"
      gameDescription="Aprenda estatística através de simulações hands-on com feedback visual imediato"
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
      gameId={36}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={simulationScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Sliders className="w-6 h-6 text-blue-600" />
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
                <p className="text-blue-800"><strong>Contexto:</strong> {currentScenario.context}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parameter Controls */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">🎛️ Controles da Simulação</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(currentScenario.parameters).map(([key, param]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-medium text-gray-700">{param.label}</label>
                    <span className="text-blue-600 font-semibold">
                      {parameters[key]?.toFixed(1) || param.default}{param.unit || ''}
                    </span>
                  </div>
                  <Slider
                    value={[parameters[key] || param.default]}
                    onValueChange={(value) => setParameters(prev => ({ ...prev, [key]: value[0] }))}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{param.min}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              ))}
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={runSimulation} 
                  disabled={isRunning}
                  className="flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Executando...' : 'Executar Simulação'}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setSimulationResults(null)}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Limpar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-green-600">📊 Resultados da Simulação</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentScenario.simulationType === 'correlation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Correlação</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          r = {simulationResults.correlation.toFixed(2)}
                        </p>
                        <p className="text-sm text-blue-700">
                          R² = {simulationResults.rSquared.toFixed(2)} 
                          ({(simulationResults.rSquared * 100).toFixed(0)}% da variação explicada)
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800">Interpretação</h4>
                        <p className="text-sm text-green-700">
                          {currentScenario.interpretation[simulationResults.interpretation]}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {currentScenario.simulationType === 'ttest' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800">Estatística t</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          t = {simulationResults.tStatistic}
                        </p>
                        <p className="text-sm text-blue-700">
                          p = {simulationResults.pValue}
                        </p>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${simulationResults.significant ? 'bg-green-50' : 'bg-red-50'}`}>
                        <h4 className={`font-semibold ${simulationResults.significant ? 'text-green-800' : 'text-red-800'}`}>
                          {simulationResults.significant ? '✅ Significativo' : '❌ Não Significativo'}
                        </h4>
                        <p className={`text-sm ${simulationResults.significant ? 'text-green-700' : 'text-red-700'}`}>
                          {currentScenario.interpretation[simulationResults.interpretation]}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">🎯 Objetivos de Aprendizado</h4>
                    <ul className="text-yellow-700 space-y-1">
                      {currentScenario.learningObjectives.map((objective, index) => (
                        <li key={index} className="text-sm">• {objective}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        {simulationResults && (
          <div className="flex justify-end">
            <Button onClick={handleNextScenario}>
              {gameState.currentQuestion < simulationScenarios.length - 1 ? 'Próxima Simulação' : 'Finalizar Jogo'}
            </Button>
          </div>
        )}
      </div>
    </GameBase>
  )
}
