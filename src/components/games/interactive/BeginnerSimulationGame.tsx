'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Lightbulb, TrendingUp, Users, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface SimulationParameter {
  id: string
  label: string
  simpleLabel: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
  description: string
  dailyLifeAnalogy: string
  icon: React.ReactNode
}

interface BeginnerSimulationGameProps {
  title: string
  simpleTitle: string
  instruction: string
  simpleInstruction: string
  parameters: SimulationParameter[]
  simulationFunction: (params: Record<string, number>) => number[]
  targetConcept: string
  conceptExplanation: string
  dailyLifeScenario: string
  onComplete?: (understanding: boolean) => void
}

export function BeginnerSimulationGame({
  title,
  simpleTitle,
  instruction,
  simpleInstruction,
  parameters,
  simulationFunction,
  targetConcept,
  conceptExplanation,
  dailyLifeScenario,
  onComplete
}: BeginnerSimulationGameProps) {
  const [parameterValues, setParameterValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    parameters.forEach(param => {
      initial[param.id] = param.defaultValue
    })
    return initial
  })
  
  const [results, setResults] = useState<number[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showSimpleMode, setShowSimpleMode] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)

  const runSimulation = () => {
    setIsRunning(true)
    const newResults = simulationFunction(parameterValues)
    setResults(newResults)
    setIsRunning(false)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setResults([])
    setCurrentStep(0)
    parameters.forEach(param => {
      setParameterValues(prev => ({
        ...prev,
        [param.id]: param.defaultValue
      }))
    })
  }

  const handleParameterChange = (paramId: string, value: number) => {
    setParameterValues(prev => ({
      ...prev,
      [paramId]: value
    }))
    
    // Auto-run simulation for immediate feedback
    if (results.length > 0) {
      const newResults = simulationFunction({
        ...parameterValues,
        [paramId]: value
      })
      setResults(newResults)
    }
  }

  const getSimpleStats = () => {
    if (results.length === 0) return null

    const sum = results.reduce((acc, val) => acc + val, 0)
    const average = sum / results.length
    const min = Math.min(...results)
    const max = Math.max(...results)
    
    return { average, min, max, count: results.length }
  }

  const stats = getSimpleStats()

  const getChartData = () => {
    return results.map((value, index) => ({
      index: index + 1,
      value: value,
      label: `Pessoa ${index + 1}`
    }))
  }

  const guidedSteps = [
    {
      title: "🎯 Passo 1: Entenda o Cenário",
      content: dailyLifeScenario,
      action: "Leia o cenário acima e clique em 'Próximo' quando entender"
    },
    {
      title: "🎮 Passo 2: Experimente os Controles",
      content: "Agora você vai mexer nos 'botões' para ver o que acontece. É como ajustar o volume do rádio - cada mudança tem um efeito!",
      action: "Mova os controles deslizantes e veja os números mudarem"
    },
    {
      title: "🚀 Passo 3: Execute a Simulação",
      content: "Hora de ver a mágica acontecer! Clique em 'Executar' para ver os resultados aparecerem no gráfico.",
      action: "Clique no botão 'Executar Simulação' abaixo"
    },
    {
      title: "📊 Passo 4: Interprete os Resultados",
      content: "Agora você pode ver o que aconteceu! Os números e o gráfico mostram o resultado da sua 'experiência'.",
      action: "Observe os resultados e tente mudar os controles para ver diferenças"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {showSimpleMode ? simpleTitle : title}
            </h3>
            <p className="text-gray-600 mt-1">
              {showSimpleMode ? simpleInstruction : instruction}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSimpleMode(!showSimpleMode)}
            >
              {showSimpleMode ? '🎓 Modo Avançado' : '🌟 Modo Simples'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Explicação</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Concept Explanation */}
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                O que você está aprendendo: {targetConcept}
              </h4>
              <p className="text-blue-800 text-sm mb-3">{conceptExplanation}</p>
              <div className="p-3 bg-white rounded border border-blue-200">
                <h5 className="font-medium text-blue-900 mb-1">💡 Cenário do Dia a Dia:</h5>
                <p className="text-blue-700 text-sm">{dailyLifeScenario}</p>
              </div>
            </motion.div>
          )}

          {/* Guided Steps for Beginners */}
          {showSimpleMode && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-900">
                  {guidedSteps[currentStep].title}
                </h4>
                <div className="text-sm text-green-700">
                  {currentStep + 1} de {guidedSteps.length}
                </div>
              </div>
              <p className="text-green-800 text-sm mb-3">
                {guidedSteps[currentStep].content}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-700 italic">
                  👉 {guidedSteps[currentStep].action}
                </p>
                <div className="flex space-x-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Anterior
                    </Button>
                  )}
                  {currentStep < guidedSteps.length - 1 && (
                    <Button
                      size="sm"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Próximo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parameters Control */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              {showSimpleMode ? '🎛️ Seus Controles (Mexa e Veja o que Acontece!)' : '⚙️ Parâmetros da Simulação'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parameters.map(param => (
                <div key={param.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-blue-600">{param.icon}</div>
                    <label className="block text-sm font-medium text-gray-700">
                      {showSimpleMode ? param.simpleLabel : param.label}
                      {param.unit && ` (${param.unit})`}
                    </label>
                  </div>
                  
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={parameterValues[param.id]}
                    onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{param.min}</span>
                    <span className="font-medium text-lg text-blue-600">
                      {parameterValues[param.id]}
                    </span>
                    <span>{param.max}</span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2">
                    {showSimpleMode ? param.dailyLifeAnalogy : param.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <Play className="w-5 h-5" />
              <span>{showSimpleMode ? '🚀 Executar Simulação!' : 'Executar Simulação'}</span>
            </Button>
            
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900">
                {showSimpleMode ? '🎉 Resultados da Sua Experiência!' : '📊 Resultados da Simulação'}
              </h4>

              {/* Simple Statistics */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.average.toFixed(1)}</div>
                    <div className="text-sm text-blue-800">
                      {showSimpleMode ? 'Valor Médio' : 'Média'}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.min.toFixed(1)}</div>
                    <div className="text-sm text-green-800">
                      {showSimpleMode ? 'Menor Valor' : 'Mínimo'}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.max.toFixed(1)}</div>
                    <div className="text-sm text-orange-800">
                      {showSimpleMode ? 'Maior Valor' : 'Máximo'}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.count}</div>
                    <div className="text-sm text-purple-800">
                      {showSimpleMode ? 'Total de Pessoas' : 'Amostras'}
                    </div>
                  </div>
                </div>
              )}

              {/* Visualization */}
              <div className="h-64 border border-gray-200 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [value, showSimpleMode ? 'Resultado' : 'Valor']}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Simple Interpretation */}
              {showSimpleMode && stats && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h5 className="font-medium text-yellow-900 mb-2">
                    🤔 O que isso significa?
                  </h5>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p>
                      • <strong>Valor médio de {stats.average.toFixed(1)}:</strong> Se você somasse todos os resultados e dividisse pelo número de pessoas, daria esse valor
                    </p>
                    <p>
                      • <strong>Variação de {stats.min.toFixed(1)} a {stats.max.toFixed(1)}:</strong> Os resultados não foram todos iguais - alguns foram menores, outros maiores
                    </p>
                    <p>
                      • <strong>💡 Experimente:</strong> Mude os controles acima e execute novamente para ver como os resultados mudam!
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
