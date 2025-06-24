'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface ChartData {
  [key: string]: string | number
}

interface StatChartProps {
  data: ChartData[]
  type: 'bar' | 'line' | 'scatter' | 'pie'
  xKey: string
  yKey: string
  title?: string
  color?: string
  height?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function StatChart({
  data,
  type,
  xKey,
  yKey,
  title,
  color = '#8884d8',
  height = 300,
}: StatChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={color} />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} />
          </LineChart>
        )

      case 'scatter':
        return (
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis dataKey={yKey} />
            <Tooltip />
            <Scatter fill={color} />
          </ScatterChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart() || <div>No chart available</div>}
      </ResponsiveContainer>
    </div>
  )
}

// Utility functions for statistical calculations
export const calculateMean = (values: number[]): number => {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export const calculateMedian = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export const calculateMode = (values: number[]): number[] => {
  const frequency: { [key: number]: number } = {}
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1
  })
  
  const maxFreq = Math.max(...Object.values(frequency))
  return Object.keys(frequency)
    .filter(key => frequency[Number(key)] === maxFreq)
    .map(Number)
}

export const calculateStandardDeviation = (values: number[]): number => {
  const mean = calculateMean(values)
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  const variance = calculateMean(squaredDiffs)
  return Math.sqrt(variance)
}

export const calculateCorrelation = (x: number[], y: number[]): number => {
  const meanX = calculateMean(x)
  const meanY = calculateMean(y)
  
  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0)
  const denomX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0))
  const denomY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0))
  
  return numerator / (denomX * denomY)
}
