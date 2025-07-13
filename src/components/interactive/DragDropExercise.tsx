'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Target, 
  Info,
  Trophy,
  Clock
} from 'lucide-react'

// Drag and drop interfaces
interface DragItem {
  id: string
  content: string
  category: string
  description?: string
  imageUrl?: string
}

interface DropZone {
  id: string
  title: string
  description: string
  acceptedCategories: string[]
  color: string
  items: DragItem[]
}

interface DragDropExerciseProps {
  title: string
  instructions: string
  items: DragItem[]
  dropZones: DropZone[]
  onComplete?: (score: number, timeElapsed: number) => void
  onItemDropped?: (item: DragItem, zone: DropZone) => void
  showFeedback?: boolean
  timeLimit?: number // in seconds
}

// Nutritional categorization exercises data
const nutritionalCategories = {
  macronutrients: {
    title: 'Classificação de Macronutrientes',
    instructions: 'Arraste os alimentos para a categoria correta de macronutriente predominante.',
    items: [
      { id: 'rice', content: 'Arroz', category: 'carbohydrates', description: 'Fonte de carboidratos complexos' },
      { id: 'chicken', content: 'Frango', category: 'proteins', description: 'Proteína animal de alto valor biológico' },
      { id: 'olive-oil', content: 'Azeite', category: 'fats', description: 'Gordura monoinsaturada' },
      { id: 'beans', content: 'Feijão', category: 'proteins', description: 'Proteína vegetal e fibras' },
      { id: 'bread', content: 'Pão', category: 'carbohydrates', description: 'Carboidrato simples' },
      { id: 'avocado', content: 'Abacate', category: 'fats', description: 'Gordura saudável e fibras' },
      { id: 'fish', content: 'Peixe', category: 'proteins', description: 'Proteína e ômega-3' },
      { id: 'pasta', content: 'Macarrão', category: 'carbohydrates', description: 'Carboidrato complexo' },
      { id: 'nuts', content: 'Castanhas', category: 'fats', description: 'Gorduras e proteínas' },
      { id: 'eggs', content: 'Ovos', category: 'proteins', description: 'Proteína completa' }
    ],
    dropZones: [
      {
        id: 'carbohydrates',
        title: 'Carboidratos',
        description: 'Fonte principal de energia',
        acceptedCategories: ['carbohydrates'],
        color: 'bg-blue-100 border-blue-300',
        items: []
      },
      {
        id: 'proteins',
        title: 'Proteínas',
        description: 'Construção e reparo tecidual',
        acceptedCategories: ['proteins'],
        color: 'bg-red-100 border-red-300',
        items: []
      },
      {
        id: 'fats',
        title: 'Gorduras',
        description: 'Energia e vitaminas lipossolúveis',
        acceptedCategories: ['fats'],
        color: 'bg-yellow-100 border-yellow-300',
        items: []
      }
    ]
  },
  ageGroups: {
    title: 'Alimentos por Faixa Etária',
    instructions: 'Classifique os alimentos de acordo com a faixa etária mais apropriada para introdução.',
    items: [
      { id: 'breast-milk', content: 'Leite Materno', category: '0-6months', description: 'Alimento exclusivo até 6 meses' },
      { id: 'baby-cereal', content: 'Papa de Cereais', category: '6-12months', description: 'Introdução alimentar' },
      { id: 'honey', content: 'Mel', category: '12months+', description: 'Risco de botulismo em menores de 1 ano' },
      { id: 'mashed-fruits', content: 'Frutas Amassadas', category: '6-12months', description: 'Primeiras frutas' },
      { id: 'whole-nuts', content: 'Castanhas Inteiras', category: '4years+', description: 'Risco de engasgo' },
      { id: 'cow-milk', content: 'Leite de Vaca', category: '12months+', description: 'Após 1 ano de idade' },
      { id: 'soft-vegetables', content: 'Vegetais Cozidos', category: '6-12months', description: 'Textura adequada' },
      { id: 'raw-vegetables', content: 'Vegetais Crus', category: '12months+', description: 'Capacidade mastigatória' }
    ],
    dropZones: [
      {
        id: '0-6months',
        title: '0-6 meses',
        description: 'Aleitamento exclusivo',
        acceptedCategories: ['0-6months'],
        color: 'bg-green-100 border-green-300',
        items: []
      },
      {
        id: '6-12months',
        title: '6-12 meses',
        description: 'Introdução alimentar',
        acceptedCategories: ['6-12months'],
        color: 'bg-orange-100 border-orange-300',
        items: []
      },
      {
        id: '12months+',
        title: '12+ meses',
        description: 'Alimentação diversificada',
        acceptedCategories: ['12months+'],
        color: 'bg-purple-100 border-purple-300',
        items: []
      },
      {
        id: '4years+',
        title: '4+ anos',
        description: 'Alimentos com restrições',
        acceptedCategories: ['4years+'],
        color: 'bg-red-100 border-red-300',
        items: []
      }
    ]
  }
}

export function DragDropExercise({
  title,
  instructions,
  items: initialItems,
  dropZones: initialDropZones,
  onComplete,
  onItemDropped,
  showFeedback = true,
  timeLimit
}: DragDropExerciseProps) {
  const [items, setItems] = useState<DragItem[]>(initialItems)
  const [dropZones, setDropZones] = useState<DropZone[]>(initialDropZones)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({})
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  // Check if exercise is complete
  useEffect(() => {
    const allItemsPlaced = items.length === 0
    if (allItemsPlaced && !isComplete) {
      checkAnswers()
    }
  }, [items, isComplete])

  const handleDragStart = (item: DragItem) => {
    setDraggedItem(item)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetZone: DropZone) => {
    e.preventDefault()
    
    if (!draggedItem) return

    // Remove item from items list
    setItems(prev => prev.filter(item => item.id !== draggedItem.id))
    
    // Add item to target zone
    setDropZones(prev => prev.map(zone => 
      zone.id === targetZone.id 
        ? { ...zone, items: [...zone.items, draggedItem] }
        : zone
    ))

    onItemDropped?.(draggedItem, targetZone)
    setDraggedItem(null)
  }

  const handleItemReturn = (item: DragItem, fromZone: DropZone) => {
    // Remove item from zone
    setDropZones(prev => prev.map(zone => 
      zone.id === fromZone.id 
        ? { ...zone, items: zone.items.filter(i => i.id !== item.id) }
        : zone
    ))
    
    // Return item to items list
    setItems(prev => [...prev, item])
  }

  const checkAnswers = () => {
    let correctCount = 0
    const newFeedback: Record<string, 'correct' | 'incorrect'> = {}

    dropZones.forEach(zone => {
      zone.items.forEach(item => {
        const isCorrect = zone.acceptedCategories.includes(item.category)
        newFeedback[item.id] = isCorrect ? 'correct' : 'incorrect'
        if (isCorrect) correctCount++
      })
    })

    const totalItems = initialItems.length
    const finalScore = Math.round((correctCount / totalItems) * 100)
    
    setScore(finalScore)
    setFeedback(newFeedback)
    setIsComplete(true)
    setShowResults(true)
    
    onComplete?.(finalScore, timeElapsed)
  }

  const resetExercise = () => {
    setItems(initialItems)
    setDropZones(initialDropZones.map(zone => ({ ...zone, items: [] })))
    setDraggedItem(null)
    setIsComplete(false)
    setScore(0)
    setFeedback({})
    setShowResults(false)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
            
            {isComplete && (
              <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                <Trophy className="w-4 h-4" />
                <span>{score}%</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetExercise}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Instructions */}
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instruções:</p>
              <p>{instructions}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Items to drag */}
          <div className="lg:col-span-1">
            <h4 className="font-medium text-gray-900 mb-3">Itens para Classificar</h4>
            <div className="space-y-2">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                    whileDrag={{ scale: 1.05, zIndex: 50 }}
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragStart={() => handleDragStart(item)}
                    className="p-3 bg-white border-2 border-gray-200 rounded-lg cursor-move hover:border-blue-300 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {item.content}
                    </div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {item.description}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Drop zones */}
          <div className="lg:col-span-3">
            <h4 className="font-medium text-gray-900 mb-3">Categorias</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dropZones.map((zone) => (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone)}
                  className={`
                    min-h-48 p-4 border-2 border-dashed rounded-lg transition-colors
                    ${zone.color}
                    ${draggedItem ? 'border-opacity-100' : 'border-opacity-50'}
                  `}
                >
                  <div className="text-center mb-3">
                    <h5 className="font-semibold text-gray-900">{zone.title}</h5>
                    <p className="text-xs text-gray-600">{zone.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {zone.items.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`
                            p-2 bg-white rounded border cursor-pointer
                            ${showFeedback && feedback[item.id] === 'correct' 
                              ? 'border-green-500 bg-green-50' 
                              : showFeedback && feedback[item.id] === 'incorrect'
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                            }
                          `}
                          onClick={() => handleItemReturn(item, zone)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.content}</span>
                            {showFeedback && feedback[item.id] && (
                              <div className="ml-2">
                                {feedback[item.id] === 'correct' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Resultado do Exercício</h4>
                  <p className="text-sm text-gray-600">
                    Você acertou {Object.values(feedback).filter(f => f === 'correct').length} de {initialItems.length} itens
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{score}%</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Tempo gasto:</span>
                  <span className="ml-2 font-medium">{formatTime(timeElapsed)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Acertos:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {Object.values(feedback).filter(f => f === 'correct').length}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// Pre-configured exercises
export function MacronutrientClassification(props: Partial<DragDropExerciseProps>) {
  const exercise = nutritionalCategories.macronutrients
  return (
    <DragDropExercise
      title={exercise.title}
      instructions={exercise.instructions}
      items={exercise.items}
      dropZones={exercise.dropZones}
      {...props}
    />
  )
}

export function AgeGroupClassification(props: Partial<DragDropExerciseProps>) {
  const exercise = nutritionalCategories.ageGroups
  return (
    <DragDropExercise
      title={exercise.title}
      instructions={exercise.instructions}
      items={exercise.items}
      dropZones={exercise.dropZones}
      {...props}
    />
  )
}
