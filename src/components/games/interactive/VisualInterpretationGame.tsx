'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Eye, Target } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts'

interface ClickableArea {
  id: string
  x: number
  y: number
  width: number
  height: number
  label: string
  isCorrect: boolean
  explanation: string
}

interface VisualInterpretationGameProps {
  title: string
  instruction: string
  question: string
  chartData: any[]
  chartType: 'bar' | 'line' | 'scatter'
  clickableAreas: ClickableArea[]
  onComplete: (correct: boolean, score: number) => void
  allowMultipleClicks?: boolean
}

export function VisualInterpretationGame({
  title,
  instruction,
  question,
  chartData,
  chartType,
  clickableAreas,
  onComplete,
  allowMultipleClicks = false
}: VisualInterpretationGameProps) {
  const [clickedAreas, setClickedAreas] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number; explanations: string[] } | null>(null)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)

  const handleAreaClick = (areaId: string) => {
    if (isCompleted) return

    if (allowMultipleClicks) {
      setClickedAreas(prev => 
        prev.includes(areaId) 
          ? prev.filter(id => id !== areaId)
          : [...prev, areaId]
      )
    } else {
      setClickedAreas([areaId])
      // Auto-submit for single click games
      setTimeout(() => handleSubmit([areaId]), 500)
    }
  }

  const handleSubmit = (areas = clickedAreas) => {
    const correctAreas = clickableAreas.filter(area => area.isCorrect)
    const clickedCorrectAreas = areas.filter(areaId => 
      clickableAreas.find(area => area.id === areaId)?.isCorrect
    )
    
    const score = Math.round((clickedCorrectAreas.length / correctAreas.length) * 100)
    const isCorrect = clickedCorrectAreas.length === correctAreas.length && 
                     areas.length === correctAreas.length

    const explanations = areas.map(areaId => {
      const area = clickableAreas.find(a => a.id === areaId)
      return area?.explanation || ''
    }).filter(Boolean)

    setFeedback({ correct: isCorrect, score, explanations })
    setIsCompleted(true)
    onComplete(isCorrect, score)
  }

  const renderChart = () => {
    const commonProps = {
      width: '100%',
      height: 300,
      data: chartData
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <Tooltip />
              <Scatter dataKey="y" fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          {title}
        </h3>
        <p className="text-gray-600">{instruction}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Question */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              {question}
            </h4>
            <p className="text-sm text-blue-700">
              {allowMultipleClicks 
                ? 'Clique em todas as áreas relevantes do gráfico'
                : 'Clique na área mais relevante do gráfico'
              }
            </p>
          </div>

          {/* Interactive Chart */}
          <div className="relative">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              {renderChart()}
            </div>
            
            {/* Clickable Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="relative w-full h-full">
                {clickableAreas.map(area => (
                  <button
                    key={area.id}
                    className={`absolute pointer-events-auto transition-all duration-200 ${
                      clickedAreas.includes(area.id)
                        ? isCompleted
                          ? area.isCorrect
                            ? 'bg-green-500 bg-opacity-30 border-2 border-green-500'
                            : 'bg-red-500 bg-opacity-30 border-2 border-red-500'
                          : 'bg-blue-500 bg-opacity-30 border-2 border-blue-500'
                        : hoveredArea === area.id
                        ? 'bg-gray-500 bg-opacity-20 border-2 border-gray-400'
                        : 'bg-transparent border-2 border-transparent hover:bg-gray-500 hover:bg-opacity-10'
                    }`}
                    style={{
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      width: `${area.width}%`,
                      height: `${area.height}%`
                    }}
                    onClick={() => handleAreaClick(area.id)}
                    onMouseEnter={() => setHoveredArea(area.id)}
                    onMouseLeave={() => setHoveredArea(null)}
                    title={area.label}
                    disabled={isCompleted && !allowMultipleClicks}
                  >
                    {clickedAreas.includes(area.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isCompleted ? (
                          area.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )
                        ) : (
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hovered Area Info */}
          {hoveredArea && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gray-50 rounded-lg"
            >
              <p className="text-sm text-gray-700">
                <strong>Área:</strong> {clickableAreas.find(a => a.id === hoveredArea)?.label}
              </p>
            </motion.div>
          )}

          {/* Submit Button for Multiple Click Games */}
          {allowMultipleClicks && !isCompleted && (
            <div className="flex justify-center">
              <Button
                onClick={() => handleSubmit()}
                disabled={clickedAreas.length === 0}
              >
                Verificar Respostas
              </Button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                feedback.correct ? 'bg-green-50' : 'bg-yellow-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-3">
                {feedback.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  feedback.correct ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {feedback.correct 
                    ? 'Excelente! Interpretação correta!' 
                    : `Pontuação: ${feedback.score}%`
                  }
                </span>
              </div>
              
              {feedback.explanations.length > 0 && (
                <div className="space-y-2">
                  <h5 className={`font-medium ${
                    feedback.correct ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    Explicações:
                  </h5>
                  {feedback.explanations.map((explanation, index) => (
                    <p key={index} className={`text-sm ${
                      feedback.correct ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      • {explanation}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
