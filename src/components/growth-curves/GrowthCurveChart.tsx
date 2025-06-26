'use client'

import React, { useState } from 'react'
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
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  getGrowthCurveData,
  calculatePercentile,
  classifyNutritionalStatus,
  formatAge,
  type ChildMeasurement,
  type GrowthPoint
} from '@/lib/brazilianGrowthCurves'
import { TrendingUp, Users, Info, Target } from 'lucide-react'

interface GrowthCurveChartProps {
  type: 'weight' | 'height'
  gender: 'M' | 'F'
  childData?: ChildMeasurement
  showPercentiles?: number[]
  interactive?: boolean
  title?: string
  onPointClick?: (age: number, value: number) => void
}

export function GrowthCurveChart({
  type,
  gender,
  childData,
  showPercentiles = [3, 10, 25, 50, 75, 90, 97],
  interactive = false,
  title,
  onPointClick
}: GrowthCurveChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<{age: number, value: number} | null>(null)
  
  const curveData = getGrowthCurveData(type, gender)
  const unit = type === 'weight' ? 'kg' : 'cm'
  const yAxisLabel = type === 'weight' ? 'Peso (kg)' : 'Altura (cm)'
  
  // Transform data for recharts
  const chartData = curveData.map(point => ({
    age: point.age,
    ageLabel: formatAge(point.age),
    p3: point.p3,
    p10: point.p10,
    p25: point.p25,
    p50: point.p50,
    p75: point.p75,
    p90: point.p90,
    p97: point.p97
  }))

  // Calculate child's percentile if data provided
  let childPercentile: number | null = null
  let nutritionalStatus: any = null
  
  if (childData) {
    const measurement = type === 'weight' ? childData.weight : childData.height
    childPercentile = calculatePercentile(childData.age, measurement, type, gender)
    
    if (type === 'weight') {
      const heightPercentile = calculatePercentile(childData.age, childData.height, 'height', gender)
      nutritionalStatus = classifyNutritionalStatus(childPercentile, heightPercentile)
    }
  }

  const percentileColors = {
    p3: '#dc2626',   // red-600
    p10: '#ea580c',  // orange-600
    p25: '#d97706',  // amber-600
    p50: '#059669',  // emerald-600
    p75: '#0891b2',  // cyan-600
    p90: '#2563eb',  // blue-600
    p97: '#7c3aed'   // violet-600
  }

  const handleChartClick = (data: any) => {
    if (interactive && onPointClick && data && data.activePayload) {
      const point = data.activePayload[0].payload
      setSelectedPoint({ age: point.age, value: point.p50 })
      onPointClick(point.age, point.p50)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Idade: ${formatAge(label)}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`P${entry.dataKey.substring(1)}: ${entry.value.toFixed(1)} ${unit}`}
            </p>
          ))}
          {childData && childData.age === label && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-semibold text-blue-600">
                {childData.name}: {type === 'weight' ? childData.weight : childData.height} {unit}
              </p>
              {childPercentile && (
                <p className="text-sm text-gray-600">
                  Percentil {childPercentile}
                </p>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title || `Curva de Crescimento - ${type === 'weight' ? 'Peso' : 'Altura'} por Idade`}
              </h3>
              <p className="text-sm text-gray-600">
                {gender === 'M' ? 'Meninos' : 'Meninas'} • 0-5 anos • Padrões brasileiros
              </p>
            </div>
          </div>
          {childData && nutritionalStatus && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              nutritionalStatus.color === 'green' ? 'bg-green-100 text-green-800' :
              nutritionalStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              nutritionalStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {nutritionalStatus.status}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="age"
                type="number"
                scale="linear"
                domain={[0, 60]}
                tickFormatter={(value) => `${Math.floor(value/12)}a`}
                label={{ value: 'Idade (anos)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Percentile lines */}
              {showPercentiles.includes(3) && (
                <Line 
                  type="monotone" 
                  dataKey="p3" 
                  stroke={percentileColors.p3}
                  strokeWidth={1}
                  dot={false}
                  name="P3"
                />
              )}
              {showPercentiles.includes(10) && (
                <Line 
                  type="monotone" 
                  dataKey="p10" 
                  stroke={percentileColors.p10}
                  strokeWidth={1}
                  dot={false}
                  name="P10"
                />
              )}
              {showPercentiles.includes(25) && (
                <Line 
                  type="monotone" 
                  dataKey="p25" 
                  stroke={percentileColors.p25}
                  strokeWidth={2}
                  dot={false}
                  name="P25"
                />
              )}
              {showPercentiles.includes(50) && (
                <Line 
                  type="monotone" 
                  dataKey="p50" 
                  stroke={percentileColors.p50}
                  strokeWidth={3}
                  dot={false}
                  name="P50 (Mediana)"
                />
              )}
              {showPercentiles.includes(75) && (
                <Line 
                  type="monotone" 
                  dataKey="p75" 
                  stroke={percentileColors.p75}
                  strokeWidth={2}
                  dot={false}
                  name="P75"
                />
              )}
              {showPercentiles.includes(90) && (
                <Line 
                  type="monotone" 
                  dataKey="p90" 
                  stroke={percentileColors.p90}
                  strokeWidth={1}
                  dot={false}
                  name="P90"
                />
              )}
              {showPercentiles.includes(97) && (
                <Line 
                  type="monotone" 
                  dataKey="p97" 
                  stroke={percentileColors.p97}
                  strokeWidth={1}
                  dot={false}
                  name="P97"
                />
              )}
              
              {/* Child's measurement point */}
              {childData && (
                <ReferenceDot
                  x={childData.age}
                  y={type === 'weight' ? childData.weight : childData.height}
                  r={6}
                  fill="#1f2937"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
              
              {/* Selected point */}
              {selectedPoint && (
                <ReferenceDot
                  x={selectedPoint.age}
                  y={selectedPoint.value}
                  r={4}
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend and interpretation */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-600"></div>
              <span>P3 - Baixo peso severo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-orange-600"></div>
              <span>P10 - Baixo peso</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-emerald-600"></div>
              <span>P50 - Mediana</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-violet-600"></div>
              <span>P97 - Sobrepeso/Obesidade</span>
            </div>
          </div>
          
          {childData && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Interpretação para {childData.name}
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>
                      <strong>Idade:</strong> {formatAge(childData.age)} • 
                      <strong> {type === 'weight' ? 'Peso' : 'Altura'}:</strong> {type === 'weight' ? childData.weight : childData.height} {unit}
                    </p>
                    {childPercentile && (
                      <p>
                        <strong>Percentil:</strong> P{childPercentile} - 
                        {childPercentile < 3 ? ' Abaixo do esperado (< P3)' :
                         childPercentile < 10 ? ' Baixo para a idade (P3-P10)' :
                         childPercentile < 25 ? ' Limite inferior normal (P10-P25)' :
                         childPercentile < 75 ? ' Normal (P25-P75)' :
                         childPercentile < 90 ? ' Limite superior normal (P75-P90)' :
                         childPercentile < 97 ? ' Acima do esperado (P90-P97)' :
                         ' Muito acima do esperado (> P97)'}
                      </p>
                    )}
                    {nutritionalStatus && (
                      <p>
                        <strong>Status Nutricional:</strong> {nutritionalStatus.status} - {nutritionalStatus.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {interactive && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Clique em qualquer ponto da curva para ver os valores dos percentis naquela idade
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Simplified component for quick percentile reference
export function PercentileReference() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Interpretação dos Percentis</h3>
            <p className="text-sm text-gray-600">Guia rápido para avaliação nutricional infantil</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Classificação por Percentis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span>&lt; P3</span>
                  <span className="font-medium text-red-700">Desnutrição severa</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span>P3 - P10</span>
                  <span className="font-medium text-orange-700">Baixo peso</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span>P10 - P85</span>
                  <span className="font-medium text-green-700">Eutrófico</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span>P85 - P97</span>
                  <span className="font-medium text-yellow-700">Sobrepeso</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span>&gt; P97</span>
                  <span className="font-medium text-red-700">Obesidade</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Analogia do Dia a Dia</h4>
              <div className="text-sm text-gray-700 space-y-2">
                <p>
                  <strong>Imagine 100 crianças da mesma idade em fila:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• P50 = criança no meio da fila (posição 50)</li>
                  <li>• P25 = criança na posição 25</li>
                  <li>• P75 = criança na posição 75</li>
                  <li>• P3 = uma das 3 menores</li>
                  <li>• P97 = uma das 3 maiores</li>
                </ul>
                <p className="mt-3 text-xs text-gray-600 italic">
                  Os percentis mostram onde a criança está em relação a outras da mesma idade e sexo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
