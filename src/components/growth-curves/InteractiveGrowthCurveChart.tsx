'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceDot,
  Scatter,
  ScatterChart
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  getGrowthCurveData, 
  calculateRealTimePercentile, 
  validatePlottedPoint,
  generateEducationalFeedback,
  getPercentileColor,
  brazilianChildrenData,
  type ChildMeasurement,
  type GrowthPoint,
  type PlottedPoint,
  type InteractionHistory
} from '@/lib/brazilianGrowthCurves'
import {
  Target,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Hand,
  MousePointer,
  Eye
} from 'lucide-react'

interface InteractiveGrowthCurveChartProps {
  exerciseId: number
  chartType: 'weight' | 'height' | 'both'
  gender: 'M' | 'F'
  targetChild?: string
  interactionType: 'click-to-identify' | 'guided-plot' | 'independent-plot' | 'multi-plot' | 'hover-and-read' | 'clinical-interpretation'
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
  targetPercentile?: number
}

export default function InteractiveGrowthCurveChart({
  exerciseId,
  chartType,
  gender,
  targetChild,
  interactionType,
  onComplete,
  maxAttempts,
  targetPercentile
}: InteractiveGrowthCurveChartProps) {
  const [plottedPoints, setPlottedPoints] = useState<PlottedPoint[]>([])
  const [interactionHistory, setInteractionHistory] = useState<InteractionHistory[]>([])
  const [currentAttempt, setCurrentAttempt] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [hoveredPercentile, setHoveredPercentile] = useState<number | null>(null)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const child = targetChild ? brazilianChildrenData.find(c => c.id === targetChild) : null
  const weightData = getGrowthCurveData('weight', gender)
  const heightData = getGrowthCurveData('height', gender)

  // Handle mouse/touch interactions for plotting
  const handleChartClick = useCallback((event: any) => {
    // Store click position for visual feedback
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      setClickPosition({ x, y })

      // Clear click position after 2 seconds
      setTimeout(() => setClickPosition(null), 2000)
    }

    if (interactionType === 'click-to-identify') {
      // Handle percentile line identification
      const clickedPercentile = identifyClickedPercentile(event)

      // Allow for some tolerance in percentile identification
      const tolerance = 5 // Allow clicking within 5 percentile points
      const isCorrect = Math.abs(clickedPercentile - (targetPercentile || 50)) <= tolerance

      if (isCorrect) {
        setFeedback(`✅ Correto! Você identificou a linha P${targetPercentile} (clicou próximo ao P${clickedPercentile}).`)
        onComplete(100, 'Identificação de percentil realizada com sucesso!')
        setIsCompleted(true)
      } else {
        setCurrentAttempt(prev => prev + 1)
        setFeedback(`❌ Incorreto. Você clicou próximo ao P${clickedPercentile}, mas o alvo era P${targetPercentile}. Tente novamente.`)
        if (currentAttempt >= maxAttempts) {
          onComplete(30, `Máximo de tentativas atingido. A resposta correta era P${targetPercentile}.`)
          setIsCompleted(true)
        }
      }
      return
    }

    if (!chartRef.current || isCompleted) return

    const rect = chartRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to chart values with improved precision
    const chartWidth = rect.width - 80 // Account for margins
    const chartHeight = rect.height - 80

    // Ensure we're clicking within the chart area
    if (x < 40 || x > chartWidth + 40 || y < 40 || y > chartHeight + 40) {
      setFeedback('⚠️ Clique dentro da área do gráfico.')
      return
    }

    const age = Math.max(0, Math.min(60, (x - 40) / chartWidth * 60))
    const maxValue = chartType === 'weight' ? 25 : 120
    const value = Math.max(0, Math.min(maxValue, maxValue - (y - 40) / chartHeight * maxValue))

    plotPoint(age, value)
  }, [interactionType, targetPercentile, currentAttempt, maxAttempts, isCompleted, chartType])

  // Plot a point on the chart
  const plotPoint = useCallback((age: number, value: number) => {
    const validation = validatePlottedPoint(age, value, chartType === 'both' ? 'weight' : chartType, gender)
    
    if (!validation.isValid) {
      setFeedback(`⚠️ ${validation.message}`)
      return
    }

    const percentile = calculateRealTimePercentile(age, value, chartType === 'both' ? 'weight' : chartType, gender)
    
    const newPoint: PlottedPoint = {
      id: `point-${Date.now()}`,
      age,
      value,
      type: chartType === 'both' ? 'weight' : chartType,
      gender,
      percentile,
      nutritionalStatus: classifyNutritionalStatus(percentile),
      timestamp: Date.now()
    }

    setPlottedPoints(prev => [...prev, newPoint])
    
    const educationalFeedback = generateEducationalFeedback(newPoint, child)
    setFeedback(educationalFeedback)

    // Check if exercise is completed
    if (child && interactionType.includes('plot')) {
      const targetPercentile = chartType === 'weight' ? child.percentileWeight! : child.percentileHeight!
      const accuracy = Math.abs(percentile - targetPercentile)

      // Improved scoring logic with better tolerance
      if (accuracy <= 5) {
        const score = 100
        onComplete(score, `🏆 Excelente! Plotagem muito precisa. ${educationalFeedback}`)
        setIsCompleted(true)
      } else if (accuracy <= 10) {
        const score = Math.max(85, 100 - accuracy * 2)
        onComplete(score, `✅ Muito bom! Plotagem próxima do alvo. ${educationalFeedback}`)
        setIsCompleted(true)
      } else if (accuracy <= 20) {
        const score = Math.max(70, 100 - accuracy * 1.5)
        onComplete(score, `✓ Bom trabalho! Plotagem aceitável. ${educationalFeedback}`)
        setIsCompleted(true)
      } else if (currentAttempt >= maxAttempts) {
        onComplete(50, `Tentativas esgotadas. O percentil correto era P${targetPercentile.toFixed(1)}. ${educationalFeedback}`)
        setIsCompleted(true)
      } else {
        setCurrentAttempt(prev => prev + 1)
        setFeedback(`${educationalFeedback}\n\n⚠️ Tente plotar mais próximo do percentil P${targetPercentile.toFixed(1)}. Tentativa ${currentAttempt + 1}/${maxAttempts}.`)
      }
    }
  }, [chartType, gender, child, interactionType, currentAttempt, maxAttempts])

  // Identify which percentile line was clicked
  const identifyClickedPercentile = (event: any): number => {
    if (!chartRef.current) return 50

    const rect = chartRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert pixel coordinates to chart values
    const chartWidth = rect.width - 80 // Account for margins
    const chartHeight = rect.height - 80

    const age = Math.max(0, Math.min(60, (x - 40) / chartWidth * 60))
    const maxValue = chartType === 'weight' ? 25 : 120
    const value = Math.max(0, Math.min(maxValue, maxValue - (y - 40) / chartHeight * maxValue))

    // Get the growth curve data for the current chart type
    const curveData = chartType === 'weight' ? weightData : heightData

    // Find the closest age point for interpolation
    const closestAgePoint = curveData.reduce((prev, curr) =>
      Math.abs(curr.age - age) < Math.abs(prev.age - age) ? curr : prev
    )

    // Calculate which percentile line the clicked value is closest to
    const percentileValues = [
      { percentile: 3, value: closestAgePoint.p3 },
      { percentile: 10, value: closestAgePoint.p10 },
      { percentile: 25, value: closestAgePoint.p25 },
      { percentile: 50, value: closestAgePoint.p50 },
      { percentile: 75, value: closestAgePoint.p75 },
      { percentile: 90, value: closestAgePoint.p90 },
      { percentile: 97, value: closestAgePoint.p97 }
    ]

    // Find the closest percentile line to the clicked value
    const closestPercentile = percentileValues.reduce((prev, curr) =>
      Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
    )

    // Only return the percentile if the click was close enough to the line (within 5% tolerance)
    const tolerance = maxValue * 0.05
    if (Math.abs(closestPercentile.value - value) <= tolerance) {
      return closestPercentile.percentile
    }

    // If not close to any line, return the closest one anyway for feedback
    return closestPercentile.percentile
  }

  // Classify nutritional status based on percentile
  const classifyNutritionalStatus = (percentile: number): string => {
    if (percentile < 3) return 'Desnutrição severa'
    if (percentile < 10) return 'Baixo peso'
    if (percentile <= 85) return 'Eutrófico'
    if (percentile <= 97) return 'Sobrepeso'
    return 'Obesidade'
  }

  // Undo last action
  const undoLastAction = useCallback(() => {
    if (plottedPoints.length > 0) {
      setPlottedPoints(prev => prev.slice(0, -1))
      setFeedback('Último ponto removido.')
    }
  }, [plottedPoints])

  // Reset exercise
  const resetExercise = useCallback(() => {
    setPlottedPoints([])
    setInteractionHistory([])
    setCurrentAttempt(1)
    setFeedback('')
    setIsCompleted(false)
    setHoveredPercentile(null)
  }, [])

  // Handle mouse hover for percentile reading
  const handleMouseMove = useCallback((event: any) => {
    if (interactionType === 'hover-and-read' && chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Convert pixel coordinates to chart values
      const chartWidth = rect.width - 80
      const chartHeight = rect.height - 80

      const age = Math.max(0, Math.min(60, (x - 40) / chartWidth * 60))
      const maxValue = chartType === 'weight' ? 25 : 120
      const value = Math.max(0, Math.min(maxValue, maxValue - (y - 40) / chartHeight * maxValue))

      // Calculate the actual percentile for this age and value
      if (age >= 0 && age <= 60 && value >= 0 && value <= maxValue) {
        const percentile = calculateRealTimePercentile(age, value, chartType === 'both' ? 'weight' : chartType, gender)
        setHoveredPercentile(Math.round(percentile))
      } else {
        setHoveredPercentile(null)
      }
    }
  }, [interactionType, chartType, gender])

  return (
    <div className="space-y-6">
      {/* Exercise Instructions */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Exercício {exerciseId}: Curvas de Crescimento Interativas
              </h3>
              <p className="text-sm text-emerald-700">
                {child ? `Criança: ${child.name}, ${child.age} meses, ${child.region}` : 'Exercício de identificação'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-emerald-800">
                {interactionType === 'click-to-identify' && <MousePointer className="w-4 h-4" />}
                {interactionType === 'hover-and-read' && <Eye className="w-4 h-4" />}
                {interactionType.includes('plot') && <Hand className="w-4 h-4" />}
                <span className="font-medium">
                  {interactionType === 'click-to-identify' && `Clique na linha P${targetPercentile} (${targetPercentile === 50 ? 'mediana' : 'percentil ' + targetPercentile})`}
                  {interactionType === 'hover-and-read' && 'Passe o mouse sobre o gráfico para ler percentis'}
                  {interactionType.includes('plot') && child && `Plote: ${child.name}, ${child.age} meses, ${chartType === 'weight' ? child.weight + ' kg' : child.height + ' cm'}`}
                </span>
              </div>
              {interactionType === 'click-to-identify' && (
                <div className="text-xs text-emerald-600 bg-emerald-100 p-2 rounded">
                  💡 Dica: As linhas de percentil estão mais espessas para facilitar o clique. Procure pela linha P{targetPercentile} (cor verde para P50).
                </div>
              )}
              {interactionType.includes('plot') && child && (
                <div className="text-xs text-emerald-600 bg-emerald-100 p-2 rounded">
                  💡 Dica: Encontre {child.age} meses no eixo X e {chartType === 'weight' ? child.weight + ' kg' : child.height + ' cm'} no eixo Y. Clique na intersecção.
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-700">
                Tentativa {currentAttempt} de {maxAttempts}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undoLastAction}
                  disabled={plottedPoints.length === 0 || isCompleted}
                  className="text-emerald-700 border-emerald-300"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Desfazer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetExercise}
                  className="text-emerald-700 border-emerald-300"
                >
                  Reiniciar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Chart */}
      <Card className="overflow-hidden">
        <CardHeader>
          <h4 className="text-lg font-semibold text-gray-900">
            Gráfico de {chartType === 'weight' ? 'Peso' : chartType === 'height' ? 'Altura' : 'Peso e Altura'} por Idade
            {gender === 'M' ? ' - Meninos' : ' - Meninas'}
          </h4>
          {hoveredPercentile && (
            <p className="text-sm text-emerald-600">
              Percentil aproximado: P{hoveredPercentile}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div
            ref={chartRef}
            className={`relative w-full h-96 ${
              interactionType === 'click-to-identify' ? 'cursor-pointer' :
              interactionType.includes('plot') ? 'cursor-crosshair' :
              'cursor-default'
            } ${interactionType === 'click-to-identify' ? 'border-2 border-dashed border-blue-300' : ''}`}
            onClick={handleChartClick}
            onMouseMove={handleMouseMove}
            style={{
              touchAction: 'manipulation',
              userSelect: 'none'
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartType === 'height' ? heightData : weightData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="age" 
                  domain={[0, 60]}
                  type="number"
                  label={{ value: 'Idade (meses)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  domain={[0, chartType === 'weight' ? 25 : 120]}
                  label={{ 
                    value: chartType === 'weight' ? 'Peso (kg)' : 'Altura (cm)', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${chartType === 'weight' ? 'kg' : 'cm'}`,
                    name
                  ]}
                  labelFormatter={(age) => `Idade: ${age} meses`}
                />
                <Legend />
                
                {/* Percentile Lines - Made thicker for better clickability */}
                <Line
                  dataKey="p3"
                  stroke="#dc2626"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P3"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p10"
                  stroke="#ea580c"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P10"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p25"
                  stroke="#d97706"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P25"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p50"
                  stroke="#059669"
                  strokeWidth={interactionType === 'click-to-identify' ? 5 : 3}
                  dot={false}
                  name="P50 (Mediana)"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p75"
                  stroke="#0891b2"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P75"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p90"
                  stroke="#7c3aed"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P90"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                <Line
                  dataKey="p97"
                  stroke="#dc2626"
                  strokeWidth={interactionType === 'click-to-identify' ? 4 : 2}
                  dot={false}
                  name="P97"
                  className={interactionType === 'click-to-identify' ? 'cursor-pointer' : ''}
                />
                
                {/* Plotted Points */}
                {plottedPoints.map((point) => (
                  <ReferenceDot
                    key={point.id}
                    x={point.age}
                    y={point.value}
                    r={6}
                    fill={getPercentileColor(point.percentile)}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
                
                {/* Target Child Point (if applicable) */}
                {child && interactionType.includes('guided') && (
                  <ReferenceDot
                    x={child.age}
                    y={chartType === 'weight' ? child.weight : child.height}
                    r={4}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={2}
                    opacity={0.5}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>

            {/* Click Position Indicator */}
            {clickPosition && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pointer-events-none"
                style={{
                  left: clickPosition.x - 8,
                  top: clickPosition.y - 8,
                  zIndex: 10
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      {feedback && (
        <Card className={`border-l-4 ${
          feedback.includes('✅') ? 'border-l-green-500 bg-green-50' :
          feedback.includes('❌') ? 'border-l-red-500 bg-red-50' :
          feedback.includes('⚠️') ? 'border-l-yellow-500 bg-yellow-50' :
          'border-l-blue-500 bg-blue-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              {feedback.includes('✅') && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
              {feedback.includes('❌') && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
              {feedback.includes('⚠️') && <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />}
              {!feedback.includes('✅') && !feedback.includes('❌') && !feedback.includes('⚠️') && 
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plotted Points Summary */}
      {plottedPoints.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="text-lg font-semibold text-gray-900">Pontos Plotados</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plottedPoints.map((point, index) => (
                <div key={point.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">
                    Ponto {index + 1}: {point.age.toFixed(1)} meses, {point.value.toFixed(1)} {point.type === 'weight' ? 'kg' : 'cm'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: getPercentileColor(point.percentile), color: 'white' }}>
                      P{point.percentile.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-600">{point.nutritionalStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
