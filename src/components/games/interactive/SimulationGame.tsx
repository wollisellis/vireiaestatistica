'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Settings, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface SimulationParameter {
  id: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
  description: string
}

interface SimulationResult {
  iteration: number
  value: number
  parameters: Record<string, number>
}

interface SimulationGameProps {
  title: string
  instruction: string
  parameters: SimulationParameter[]
  simulationFunction: (params: Record<string, number>) => number
  targetRange?: { min: number; max: number; label: string }
  maxIterations?: number
  onComplete?: (results: SimulationResult[], targetAchieved: boolean) => void
  showDistribution?: boolean
}

export function SimulationGame({
  title,
  instruction,
  parameters,
  simulationFunction,
  targetRange,
  maxIterations = 100,
  onComplete,
  showDistribution = true
}: SimulationGameProps) {
  const [parameterValues, setParameterValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    parameters.forEach(param => {
      initial[param.id] = param.defaultValue
    })
    return initial
  })
  
  const [results, setResults] = useState<SimulationResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const runSimulation = () => {
    setIsRunning(true)
    setResults([])
    setCurrentIteration(0)
    setShowResults(true)
  }

  const pauseSimulation = () => {
    setIsRunning(false)
  }

  const resetSimulation = () => {
    setIsRunning(false)
    setResults([])
    setCurrentIteration(0)
    setShowResults(false)
  }

  useEffect(() => {
    if (isRunning && currentIteration < maxIterations) {
      const timer = setTimeout(() => {
        const value = simulationFunction(parameterValues)
        const newResult: SimulationResult = {
          iteration: currentIteration + 1,
          value,
          parameters: { ...parameterValues }
        }
        
        setResults(prev => [...prev, newResult])
        setCurrentIteration(prev => prev + 1)
      }, 100) // 100ms delay between iterations

      return () => clearTimeout(timer)
    } else if (currentIteration >= maxIterations) {
      setIsRunning(false)
      
      // Check if target was achieved
      if (targetRange && onComplete) {
        const targetAchieved = results.some(result => 
          result.value >= targetRange.min && result.value <= targetRange.max
        )
        onComplete(results, targetAchieved)
      }
    }
  }, [isRunning, currentIteration, maxIterations, parameterValues, simulationFunction, results, targetRange, onComplete])

  const handleParameterChange = (paramId: string, value: number) => {
    setParameterValues(prev => ({
      ...prev,
      [paramId]: value
    }))
  }

  const getStatistics = () => {
    if (results.length === 0) return null

    const values = results.map(r => r.value)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)

    return { mean, min, max, stdDev, count: values.length }
  }

  const statistics = getStatistics()

  const getDistributionData = () => {
    if (results.length === 0) return []

    const values = results.map(r => r.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const bins = 10
    const binSize = (max - min) / bins
    
    const distribution = Array.from({ length: bins }, (_, i) => {
      const binStart = min + i * binSize
      const binEnd = binStart + binSize
      const count = values.filter(v => v >= binStart && v < binEnd).length
      
      return {
        range: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
        count,
        binStart
      }
    })

    return distribution
  }

  const isInTargetRange = (value: number) => {
    if (!targetRange) return false
    return value >= targetRange.min && value <= targetRange.max
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <p className="text-gray-600">{instruction}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Parameters Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parameters.map(param => (
              <div key={param.id} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {param.label} {param.unit && `(${param.unit})`}
                </label>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={parameterValues[param.id]}
                  onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isRunning}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{param.min}</span>
                  <span className="font-medium text-gray-700">
                    {parameterValues[param.id]}
                  </span>
                  <span>{param.max}</span>
                </div>
                <p className="text-xs text-gray-600">{param.description}</p>
              </div>
            ))}
          </div>

          {/* Target Range */}
          {targetRange && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">Meta:</h4>
              <p className="text-sm text-green-700">
                {targetRange.label}: {targetRange.min} - {targetRange.max}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {!isRunning ? (
              <Button onClick={runSimulation} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Iniciar Simulação</span>
              </Button>
            ) : (
              <Button onClick={pauseSimulation} variant="outline" className="flex items-center space-x-2">
                <Pause className="w-4 h-4" />
                <span>Pausar</span>
              </Button>
            )}
            
            <Button onClick={resetSimulation} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>

            {isRunning && (
              <div className="text-sm text-gray-600">
                Iteração: {currentIteration}/{maxIterations}
              </div>
            )}
          </div>

          {/* Results Visualization */}
          {showResults && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Time Series */}
              <div>
                <h4 className="font-medium mb-2">Resultados ao Longo do Tempo</h4>
                <div className="h-64 border border-gray-200 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="iteration" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 2 }}
                      />
                      {targetRange && (
                        <>
                          <Line 
                            type="monotone" 
                            dataKey={() => targetRange.min}
                            stroke="#10b981" 
                            strokeDasharray="5 5"
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey={() => targetRange.max}
                            stroke="#10b981" 
                            strokeDasharray="5 5"
                            dot={false}
                          />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution */}
              {showDistribution && (
                <div>
                  <h4 className="font-medium mb-2">Distribuição dos Resultados</h4>
                  <div className="h-48 border border-gray-200 rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Statistics */}
              {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Média</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {statistics.mean.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Desvio Padrão</div>
                    <div className="text-lg font-semibold text-green-900">
                      {statistics.stdDev.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600">Mínimo</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {statistics.min.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-600">Máximo</div>
                    <div className="text-lg font-semibold text-orange-900">
                      {statistics.max.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Target Achievement */}
              {targetRange && (
                <div className={`p-4 rounded-lg ${
                  results.some(r => isInTargetRange(r.value))
                    ? 'bg-green-50 text-green-800'
                    : 'bg-yellow-50 text-yellow-800'
                }`}>
                  <h4 className="font-medium mb-2">Status da Meta</h4>
                  <p>
                    {results.some(r => isInTargetRange(r.value))
                      ? `✅ Meta alcançada! ${results.filter(r => isInTargetRange(r.value)).length} de ${results.length} resultados estão na faixa alvo.`
                      : `⚠️ Meta não alcançada. Ajuste os parâmetros e tente novamente.`
                    }
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
