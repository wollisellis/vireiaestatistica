'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Award,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ChartData {
  label: string
  value: number
  color: string
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
}

interface InteractiveChartProps {
  title: string
  type: 'bar' | 'pie' | 'line'
  data: ChartData[]
  height?: number
  showTrends?: boolean
  interactive?: boolean
}

export function InteractiveChart({ 
  title, 
  type, 
  data, 
  height = 200, 
  showTrends = false,
  interactive = true 
}: InteractiveChartProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const maxValue = Math.max(...data.map(d => d.value))

  const renderBarChart = () => (
    <div className="flex items-end justify-between space-x-2" style={{ height }}>
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          className="flex flex-col items-center flex-1"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="text-xs text-gray-600 mb-1 font-medium">
            {item.value}
          </div>
          <motion.div
            className={`w-full rounded-t-lg cursor-pointer transition-all duration-200 ${
              selectedItem === item.label ? 'ring-2 ring-blue-500' : ''
            } ${hoveredItem === item.label ? 'opacity-80' : ''}`}
            style={{ 
              backgroundColor: item.color,
              height: `${(item.value / maxValue) * (height - 40)}px`
            }}
            onClick={() => interactive && setSelectedItem(
              selectedItem === item.label ? null : item.label
            )}
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
            whileHover={{ scale: interactive ? 1.05 : 1 }}
            whileTap={{ scale: interactive ? 0.95 : 1 }}
          />
          <div className="text-xs text-gray-700 mt-2 text-center">
            {item.label}
          </div>
          {showTrends && item.trend && (
            <div className={`flex items-center mt-1 text-xs ${
              item.trend === 'up' ? 'text-green-600' : 
              item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {item.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
               item.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
              {item.percentage && `${item.percentage}%`}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = 0

    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="relative">
          <svg width="160" height="160" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (item.value / total) * 360
              const radius = 70
              const circumference = 2 * Math.PI * radius
              const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`
              const strokeDashoffset = -((currentAngle / 360) * circumference)
              
              const result = (
                <motion.circle
                  key={item.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedItem === item.label ? 'stroke-width-[24]' : ''
                  }`}
                  onClick={() => interactive && setSelectedItem(
                    selectedItem === item.label ? null : item.label
                  )}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{ strokeWidth: interactive ? 24 : 20 }}
                />
              )
              
              currentAngle += angle
              return result
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item) => (
            <motion.div
              key={item.label}
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded ${
                selectedItem === item.label ? 'bg-blue-50' : ''
              }`}
              onClick={() => interactive && setSelectedItem(
                selectedItem === item.label ? null : item.label
              )}
              whileHover={{ scale: interactive ? 1.02 : 1 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const renderLineChart = () => (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        <motion.polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={data.map((item, index) => 
            `${(index / (data.length - 1)) * 100}%,${100 - (item.value / maxValue) * 100}%`
          ).join(' ')}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Data points */}
        {data.map((item, index) => (
          <motion.circle
            key={item.label}
            cx={`${(index / (data.length - 1)) * 100}%`}
            cy={`${100 - (item.value / maxValue) * 100}%`}
            r="4"
            fill={item.color}
            className="cursor-pointer"
            onClick={() => interactive && setSelectedItem(
              selectedItem === item.label ? null : item.label
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: interactive ? 1.5 : 1 }}
          />
        ))}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            {type === 'bar' && <BarChart3 className="w-5 h-5 mr-2" />}
            {type === 'pie' && <PieChart className="w-5 h-5 mr-2" />}
            {type === 'line' && <LineChart className="w-5 h-5 mr-2" />}
            {title}
          </h3>
          {interactive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItem(null)}
              disabled={!selectedItem}
            >
              Limpar Seleção
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {type === 'bar' && renderBarChart()}
        {type === 'pie' && renderPieChart()}
        {type === 'line' && renderLineChart()}
        
        {selectedItem && (
          <motion.div
            className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm">
              <strong>{selectedItem}:</strong> {data.find(d => d.label === selectedItem)?.value}
              {showTrends && data.find(d => d.label === selectedItem)?.trend && (
                <span className={`ml-2 ${
                  data.find(d => d.label === selectedItem)?.trend === 'up' ? 'text-green-600' : 
                  data.find(d => d.label === selectedItem)?.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  ({data.find(d => d.label === selectedItem)?.trend === 'up' ? '↑' : 
                    data.find(d => d.label === selectedItem)?.trend === 'down' ? '↓' : '→'} 
                  {data.find(d => d.label === selectedItem)?.percentage}%)
                </span>
              )}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Predefined chart configurations for common use cases
export const ProfessorChartConfigs = {
  performanceDistribution: {
    title: 'Distribuição de Desempenho',
    type: 'pie' as const,
    data: [
      { label: 'Excelente', value: 25, color: '#10b981' },
      { label: 'Bom', value: 45, color: '#3b82f6' },
      { label: 'Regular', value: 20, color: '#f59e0b' },
      { label: 'Precisa Melhorar', value: 10, color: '#ef4444' }
    ]
  },
  
  moduleProgress: {
    title: 'Progresso por Módulo',
    type: 'bar' as const,
    data: [
      { label: 'Módulo 1', value: 85, color: '#10b981', trend: 'up' as const, percentage: 12 },
      { label: 'Módulo 2', value: 72, color: '#3b82f6', trend: 'up' as const, percentage: 8 },
      { label: 'Módulo 3', value: 0, color: '#6b7280', trend: 'stable' as const },
      { label: 'Módulo 4', value: 0, color: '#6b7280', trend: 'stable' as const }
    ]
  },
  
  engagementTrend: {
    title: 'Tendência de Engajamento',
    type: 'line' as const,
    data: [
      { label: 'Jan', value: 65, color: '#3b82f6' },
      { label: 'Fev', value: 72, color: '#3b82f6' },
      { label: 'Mar', value: 78, color: '#3b82f6' },
      { label: 'Abr', value: 85, color: '#3b82f6' },
      { label: 'Mai', value: 82, color: '#3b82f6' }
    ]
  }
}
