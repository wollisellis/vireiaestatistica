'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Info, Target, TrendingUp, Download, RotateCcw } from 'lucide-react'

// Growth curve data for Brazilian children (WHO standards adapted)
interface GrowthPoint {
  age: number // in months
  p3: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p97: number
}

interface PatientData {
  id: string
  name: string
  age: number // in months
  weight?: number // in kg
  height?: number // in cm
  gender: 'male' | 'female'
  birthDate: string
}

interface PlottedPoint {
  age: number
  value: number
  percentile?: number
  interpretation?: string
  color: string
}

interface GrowthCurveChartProps {
  chartType: 'weight-for-age' | 'height-for-age' | 'weight-for-height' | 'bmi-for-age'
  gender: 'male' | 'female'
  patient?: PatientData
  onPointPlotted?: (point: PlottedPoint) => void
  onInterpretationComplete?: (interpretation: string) => void
  interactive?: boolean
  showInstructions?: boolean
}

// Mock growth curve data (in real implementation, this would come from WHO/Brazilian standards)
const generateGrowthCurveData = (
  chartType: string, 
  gender: 'male' | 'female'
): GrowthPoint[] => {
  const data: GrowthPoint[] = []
  
  // Generate data points for 0-60 months
  for (let age = 0; age <= 60; age += 3) {
    let baseValue: number
    let variation: number
    
    switch (chartType) {
      case 'weight-for-age':
        baseValue = gender === 'male' ? 3.3 + (age * 0.25) : 3.2 + (age * 0.23)
        variation = baseValue * 0.15
        break
      case 'height-for-age':
        baseValue = gender === 'male' ? 50 + (age * 1.2) : 49.5 + (age * 1.15)
        variation = baseValue * 0.08
        break
      case 'bmi-for-age':
        baseValue = 16.5 + Math.sin(age * 0.1) * 2
        variation = 2.5
        break
      default:
        baseValue = 50 + age
        variation = 10
    }
    
    data.push({
      age,
      p3: baseValue - variation * 2,
      p10: baseValue - variation * 1.3,
      p25: baseValue - variation * 0.7,
      p50: baseValue,
      p75: baseValue + variation * 0.7,
      p90: baseValue + variation * 1.3,
      p97: baseValue + variation * 2
    })
  }
  
  return data
}

export function GrowthCurveChart({
  chartType,
  gender,
  patient,
  onPointPlotted,
  onInterpretationComplete,
  interactive = true,
  showInstructions = true
}: GrowthCurveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [growthData] = useState(() => generateGrowthCurveData(chartType, gender))
  const [plottedPoints, setPlottedPoints] = useState<PlottedPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<PlottedPoint | null>(null)
  const [isHighchartsLoaded, setIsHighchartsLoaded] = useState(false)
  const [chart, setChart] = useState<any>(null)

  // Dynamic import of Highcharts to avoid SSR issues
  useEffect(() => {
    const loadHighcharts = async () => {
      try {
        const Highcharts = (await import('highcharts')).default
        const HighchartsReact = (await import('highcharts-react-official')).default
        
        // Initialize Highcharts modules if needed
        if (typeof window !== 'undefined') {
          setIsHighchartsLoaded(true)
          initializeChart(Highcharts)
        }
      } catch (error) {
        console.error('Error loading Highcharts:', error)
        // Fallback to canvas-based chart
        initializeFallbackChart()
      }
    }

    loadHighcharts()
  }, [])

  const initializeChart = (Highcharts: any) => {
    if (!chartRef.current) return

    const chartOptions = {
      chart: {
        type: 'line',
        height: 400,
        backgroundColor: '#fafafa',
        events: {
          click: interactive ? handleChartClick : undefined
        }
      },
      title: {
        text: getChartTitle(),
        style: { fontSize: '16px', fontWeight: 'bold' }
      },
      xAxis: {
        title: { text: 'Idade (meses)' },
        min: 0,
        max: 60,
        gridLineWidth: 1,
        gridLineColor: '#e0e0e0'
      },
      yAxis: {
        title: { text: getYAxisLabel() },
        gridLineWidth: 1,
        gridLineColor: '#e0e0e0'
      },
      legend: {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical'
      },
      plotOptions: {
        line: {
          marker: { enabled: false },
          lineWidth: 2
        },
        scatter: {
          marker: {
            radius: 6,
            symbol: 'circle'
          }
        }
      },
      series: [
        {
          name: 'P3',
          data: growthData.map(point => [point.age, point.p3]),
          color: '#ef4444',
          dashStyle: 'Dash'
        },
        {
          name: 'P10',
          data: growthData.map(point => [point.age, point.p10]),
          color: '#f97316',
          dashStyle: 'Dot'
        },
        {
          name: 'P25',
          data: growthData.map(point => [point.age, point.p25]),
          color: '#eab308'
        },
        {
          name: 'P50 (Mediana)',
          data: growthData.map(point => [point.age, point.p50]),
          color: '#22c55e',
          lineWidth: 3
        },
        {
          name: 'P75',
          data: growthData.map(point => [point.age, point.p75]),
          color: '#eab308'
        },
        {
          name: 'P90',
          data: growthData.map(point => [point.age, point.p90]),
          color: '#f97316',
          dashStyle: 'Dot'
        },
        {
          name: 'P97',
          data: growthData.map(point => [point.age, point.p97]),
          color: '#ef4444',
          dashStyle: 'Dash'
        },
        {
          name: 'Pontos Plotados',
          type: 'scatter',
          data: plottedPoints.map(point => [point.age, point.value]),
          color: '#3b82f6',
          marker: {
            radius: 8,
            fillColor: '#3b82f6',
            lineColor: '#1e40af',
            lineWidth: 2
          }
        }
      ],
      tooltip: {
        shared: false,
        formatter: function(this: any) {
          if (this.series.name === 'Pontos Plotados') {
            const point = plottedPoints.find(p => p.age === this.x && p.value === this.y)
            return `<b>Ponto Plotado</b><br/>
                    Idade: ${this.x} meses<br/>
                    Valor: ${this.y.toFixed(1)}<br/>
                    Percentil: ${point?.percentile || 'Calculando...'}º<br/>
                    ${point?.interpretation || ''}`
          }
          return `<b>${this.series.name}</b><br/>
                  Idade: ${this.x} meses<br/>
                  Valor: ${this.y.toFixed(1)}`
        }
      }
    }

    const newChart = Highcharts.chart(chartRef.current, chartOptions)
    setChart(newChart)
  }

  const initializeFallbackChart = () => {
    // Fallback canvas-based chart implementation
    if (!chartRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 400
    canvas.style.width = '100%'
    canvas.style.height = '400px'
    canvas.style.border = '1px solid #e0e0e0'
    canvas.style.borderRadius = '8px'
    
    chartRef.current.innerHTML = ''
    chartRef.current.appendChild(canvas)
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      drawFallbackChart(ctx, canvas.width, canvas.height)
    }
  }

  const drawFallbackChart = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Set up chart area
    const margin = { top: 40, right: 100, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    // Draw background
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    
    // Vertical grid lines
    for (let i = 0; i <= 12; i++) {
      const x = margin.left + (i * chartWidth / 12)
      ctx.beginPath()
      ctx.moveTo(x, margin.top)
      ctx.lineTo(x, margin.top + chartHeight)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = margin.top + (i * chartHeight / 10)
      ctx.beginPath()
      ctx.moveTo(margin.left, y)
      ctx.lineTo(margin.left + chartWidth, y)
      ctx.stroke()
    }
    
    // Draw percentile curves
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#eab308', '#f97316', '#ef4444']
    const percentiles = ['p3', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97']
    
    percentiles.forEach((percentile, index) => {
      ctx.strokeStyle = colors[index]
      ctx.lineWidth = percentile === 'p50' ? 3 : 2
      ctx.beginPath()
      
      growthData.forEach((point, i) => {
        const x = margin.left + (point.age / 60) * chartWidth
        const value = point[percentile as keyof GrowthPoint] as number
        const maxValue = Math.max(...growthData.map(p => p.p97))
        const y = margin.top + chartHeight - (value / maxValue) * chartHeight
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
    })
    
    // Draw plotted points
    plottedPoints.forEach(point => {
      const x = margin.left + (point.age / 60) * chartWidth
      const maxValue = Math.max(...growthData.map(p => p.p97))
      const y = margin.top + chartHeight - (point.value / maxValue) * chartHeight
      
      ctx.fillStyle = point.color
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
    })
    
    // Add labels
    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(getChartTitle(), width / 2, 25)
    
    // Add click handler for fallback chart
    if (interactive) {
      canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        // Convert to chart coordinates
        const age = ((x - margin.left) / chartWidth) * 60
        const maxValue = Math.max(...growthData.map(p => p.p97))
        const value = ((margin.top + chartHeight - y) / chartHeight) * maxValue
        
        if (age >= 0 && age <= 60 && value > 0) {
          handlePointPlot(age, value)
        }
      })
    }
  }

  const handleChartClick = (event: any) => {
    if (!interactive) return
    
    const age = event.xAxis[0].value
    const value = event.yAxis[0].value
    
    if (age >= 0 && age <= 60 && value > 0) {
      handlePointPlot(age, value)
    }
  }

  const handlePointPlot = (age: number, value: number) => {
    const percentile = calculatePercentile(age, value)
    const interpretation = getInterpretation(percentile)
    
    const newPoint: PlottedPoint = {
      age: Math.round(age * 10) / 10,
      value: Math.round(value * 10) / 10,
      percentile,
      interpretation,
      color: getPercentileColor(percentile)
    }
    
    setPlottedPoints(prev => [...prev, newPoint])
    setSelectedPoint(newPoint)
    
    onPointPlotted?.(newPoint)
    onInterpretationComplete?.(interpretation)
    
    // Update chart if using Highcharts
    if (chart) {
      const scatterSeries = chart.series.find((s: any) => s.name === 'Pontos Plotados')
      if (scatterSeries) {
        scatterSeries.addPoint([newPoint.age, newPoint.value])
      }
    } else {
      // Redraw fallback chart
      const canvas = chartRef.current?.querySelector('canvas')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          drawFallbackChart(ctx, canvas.width, canvas.height)
        }
      }
    }
  }

  const calculatePercentile = (age: number, value: number): number => {
    // Find the closest age points in the growth data
    const lowerIndex = Math.floor(age / 3)
    const upperIndex = Math.ceil(age / 3)
    
    if (lowerIndex >= growthData.length) return 50
    
    const lowerPoint = growthData[lowerIndex]
    const upperPoint = growthData[upperIndex] || lowerPoint
    
    // Interpolate values for the exact age
    const ageRatio = (age - lowerPoint.age) / (upperPoint.age - lowerPoint.age || 1)
    
    const interpolatedValues = {
      p3: lowerPoint.p3 + (upperPoint.p3 - lowerPoint.p3) * ageRatio,
      p10: lowerPoint.p10 + (upperPoint.p10 - lowerPoint.p10) * ageRatio,
      p25: lowerPoint.p25 + (upperPoint.p25 - lowerPoint.p25) * ageRatio,
      p50: lowerPoint.p50 + (upperPoint.p50 - lowerPoint.p50) * ageRatio,
      p75: lowerPoint.p75 + (upperPoint.p75 - lowerPoint.p75) * ageRatio,
      p90: lowerPoint.p90 + (upperPoint.p90 - lowerPoint.p90) * ageRatio,
      p97: lowerPoint.p97 + (upperPoint.p97 - lowerPoint.p97) * ageRatio
    }
    
    // Determine percentile
    if (value <= interpolatedValues.p3) return 3
    if (value <= interpolatedValues.p10) return 10
    if (value <= interpolatedValues.p25) return 25
    if (value <= interpolatedValues.p50) return 50
    if (value <= interpolatedValues.p75) return 75
    if (value <= interpolatedValues.p90) return 90
    if (value <= interpolatedValues.p97) return 97
    return 97
  }

  const getInterpretation = (percentile: number): string => {
    if (percentile < 3) return 'Muito baixo para a idade'
    if (percentile < 10) return 'Baixo para a idade'
    if (percentile < 25) return 'Abaixo da média'
    if (percentile <= 75) return 'Adequado para a idade'
    if (percentile <= 90) return 'Acima da média'
    if (percentile <= 97) return 'Alto para a idade'
    return 'Muito alto para a idade'
  }

  const getPercentileColor = (percentile: number): string => {
    if (percentile < 3 || percentile > 97) return '#ef4444' // Red
    if (percentile < 10 || percentile > 90) return '#f97316' // Orange
    if (percentile < 25 || percentile > 75) return '#eab308' // Yellow
    return '#22c55e' // Green
  }

  const getChartTitle = (): string => {
    const titles = {
      'weight-for-age': 'Peso por Idade',
      'height-for-age': 'Altura por Idade',
      'weight-for-height': 'Peso por Altura',
      'bmi-for-age': 'IMC por Idade'
    }
    return `${titles[chartType]} - ${gender === 'male' ? 'Masculino' : 'Feminino'}`
  }

  const getYAxisLabel = (): string => {
    const labels = {
      'weight-for-age': 'Peso (kg)',
      'height-for-age': 'Altura (cm)',
      'weight-for-height': 'Peso (kg)',
      'bmi-for-age': 'IMC (kg/m²)'
    }
    return labels[chartType]
  }

  const clearPoints = () => {
    setPlottedPoints([])
    setSelectedPoint(null)
    
    if (chart) {
      const scatterSeries = chart.series.find((s: any) => s.name === 'Pontos Plotados')
      if (scatterSeries) {
        scatterSeries.setData([])
      }
    } else {
      // Redraw fallback chart
      const canvas = chartRef.current?.querySelector('canvas')
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          drawFallbackChart(ctx, canvas.width, canvas.height)
        }
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">{getChartTitle()}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {plottedPoints.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearPoints}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Limpar</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showInstructions && interactive && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como usar:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Clique no gráfico para plotar pontos antropométricos</li>
                  <li>Os percentis são calculados automaticamente</li>
                  <li>Cores indicam a interpretação: Verde (adequado), Amarelo (atenção), Vermelho (alerta)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div ref={chartRef} className="w-full h-96 border border-gray-200 rounded-lg" />

        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium">Último Ponto Plotado</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Idade:</span>
                <p className="font-medium">{selectedPoint.age} meses</p>
              </div>
              <div>
                <span className="text-gray-600">Valor:</span>
                <p className="font-medium">{selectedPoint.value} {getYAxisLabel().split(' ')[1]}</p>
              </div>
              <div>
                <span className="text-gray-600">Percentil:</span>
                <p className="font-medium">P{selectedPoint.percentile}</p>
              </div>
              <div>
                <span className="text-gray-600">Interpretação:</span>
                <p className="font-medium" style={{ color: selectedPoint.color }}>
                  {selectedPoint.interpretation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
