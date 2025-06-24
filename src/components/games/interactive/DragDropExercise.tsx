'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface DragItem {
  id: string
  content: string
  correctZone: string
  value?: number
}

interface DropZone {
  id: string
  label: string
  description?: string
  acceptsMultiple?: boolean
}

interface DragDropExerciseProps {
  title: string
  instruction: string
  items: DragItem[]
  zones: DropZone[]
  onComplete: (correct: boolean, score: number) => void
  showFeedback?: boolean
}

export function DragDropExercise({
  title,
  instruction,
  items,
  zones,
  onComplete,
  showFeedback = true
}: DragDropExerciseProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [droppedItems, setDroppedItems] = useState<Record<string, string[]>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number } | null>(null)

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault()
    
    if (!draggedItem) return

    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return

    // Remove item from previous zone
    const newDroppedItems = { ...droppedItems }
    Object.keys(newDroppedItems).forEach(key => {
      newDroppedItems[key] = newDroppedItems[key].filter(id => id !== draggedItem)
    })

    // Add item to new zone
    if (!newDroppedItems[zoneId]) {
      newDroppedItems[zoneId] = []
    }

    if (zone.acceptsMultiple || newDroppedItems[zoneId].length === 0) {
      newDroppedItems[zoneId].push(draggedItem)
    } else {
      // Replace existing item if zone doesn't accept multiple
      newDroppedItems[zoneId] = [draggedItem]
    }

    setDroppedItems(newDroppedItems)
    setDraggedItem(null)
  }

  const handleSubmit = () => {
    let correctCount = 0
    let totalItems = items.length

    items.forEach(item => {
      const currentZone = Object.keys(droppedItems).find(zoneId =>
        droppedItems[zoneId].includes(item.id)
      )
      if (currentZone === item.correctZone) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / totalItems) * 100)
    const isCorrect = correctCount === totalItems

    setFeedback({ correct: isCorrect, score })
    setIsCompleted(true)
    onComplete(isCorrect, score)
  }

  const handleReset = () => {
    setDroppedItems({})
    setIsCompleted(false)
    setFeedback(null)
    setDraggedItem(null)
  }

  const getItemsInZone = (zoneId: string) => {
    return droppedItems[zoneId] || []
  }

  const getUnplacedItems = () => {
    const placedItems = Object.values(droppedItems).flat()
    return items.filter(item => !placedItems.includes(item.id))
  }

  const isItemCorrect = (itemId: string) => {
    if (!feedback) return null
    const item = items.find(i => i.id === itemId)
    if (!item) return null
    
    const currentZone = Object.keys(droppedItems).find(zoneId =>
      droppedItems[zoneId].includes(itemId)
    )
    return currentZone === item.correctZone
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{instruction}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Unplaced Items */}
          <div>
            <h4 className="font-medium mb-3">Arraste os itens para as categorias corretas:</h4>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border-2 border-dashed border-gray-300 rounded-lg">
              {getUnplacedItems().map(item => (
                <motion.div
                  key={item.id}
                  draggable={!isCompleted}
                  onDragStart={(e) => handleDragStart(e as any, item.id)}
                  className={`px-3 py-2 bg-blue-100 text-blue-800 rounded-lg cursor-move select-none ${
                    draggedItem === item.id ? 'opacity-50' : ''
                  } ${isCompleted ? 'cursor-default' : 'hover:bg-blue-200'}`}
                  whileHover={!isCompleted ? { scale: 1.05 } : {}}
                  whileDrag={{ scale: 1.1, zIndex: 1000 }}
                >
                  {item.content}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map(zone => (
              <div
                key={zone.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, zone.id)}
                className={`min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-colors ${
                  draggedItem ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <h5 className="font-medium text-gray-900 mb-2">{zone.label}</h5>
                {zone.description && (
                  <p className="text-sm text-gray-600 mb-3">{zone.description}</p>
                )}
                
                <div className="space-y-2">
                  {getItemsInZone(zone.id).map(itemId => {
                    const item = items.find(i => i.id === itemId)
                    if (!item) return null
                    
                    const correctness = isItemCorrect(itemId)
                    
                    return (
                      <div
                        key={itemId}
                        className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                          correctness === null
                            ? 'bg-gray-100 text-gray-800'
                            : correctness
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <span>{item.content}</span>
                        {correctness !== null && (
                          correctness ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>

            {!isCompleted && (
              <Button
                onClick={handleSubmit}
                disabled={getUnplacedItems().length > 0}
              >
                Verificar Respostas
              </Button>
            )}
          </div>

          {/* Feedback */}
          {feedback && showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {feedback.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium">
                  {feedback.correct 
                    ? 'Excelente! Todas as respostas estão corretas!' 
                    : `Pontuação: ${feedback.score}%. Revise os itens em vermelho.`
                  }
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
