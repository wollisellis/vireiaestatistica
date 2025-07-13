'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Target, 
  BookOpen,
  Zap,
  Info,
  HelpCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'

export interface Hint {
  id: string
  type: 'tip' | 'warning' | 'info' | 'strategy' | 'concept'
  title: string
  content: string
  level: 'beginner' | 'intermediate' | 'advanced'
  trigger?: 'onLoad' | 'onError' | 'onRequest' | 'onTime'
  delay?: number // in seconds
  relatedConcepts?: string[]
  example?: string
}

interface HintSystemProps {
  hints: Hint[]
  gameId?: number
  exerciseId?: string
  onHintViewed?: (hintId: string) => void
  showInitialHint?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

export function HintSystem({
  hints,
  gameId,
  exerciseId,
  onHintViewed,
  showInitialHint = true,
  position = 'bottom'
}: HintSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [viewedHints, setViewedHints] = useState<Set<string>>(new Set())
  const [autoHintShown, setAutoHintShown] = useState(false)

  // Auto-show hints based on triggers
  useEffect(() => {
    if (!showInitialHint || autoHintShown) return

    const autoHints = hints.filter(hint => hint.trigger === 'onLoad')
    if (autoHints.length > 0) {
      const delay = autoHints[0].delay || 3
      const timer = setTimeout(() => {
        setIsOpen(true)
        setAutoHintShown(true)
      }, delay * 1000)

      return () => clearTimeout(timer)
    }
  }, [hints, showInitialHint, autoHintShown])

  const currentHint = hints[currentHintIndex]

  const handleHintViewed = (hintId: string) => {
    setViewedHints(prev => new Set([...prev, hintId]))
    onHintViewed?.(hintId)
  }

  const nextHint = () => {
    if (currentHintIndex < hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1)
      handleHintViewed(currentHint.id)
    }
  }

  const prevHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(prev => prev - 1)
    }
  }

  const openHints = () => {
    setIsOpen(true)
    if (currentHint) {
      handleHintViewed(currentHint.id)
    }
  }

  const closeHints = () => {
    setIsOpen(false)
    if (currentHint) {
      handleHintViewed(currentHint.id)
    }
  }

  const getHintIcon = (type: Hint['type']) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
      case 'warning':
        return <Info className="w-5 h-5 text-orange-600" />
      case 'info':
        return <HelpCircle className="w-5 h-5 text-blue-600" />
      case 'strategy':
        return <Target className="w-5 h-5 text-green-600" />
      case 'concept':
        return <BookOpen className="w-5 h-5 text-purple-600" />
      default:
        return <Lightbulb className="w-5 h-5 text-yellow-600" />
    }
  }

  const getHintColor = (type: Hint['type']) => {
    switch (type) {
      case 'tip':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'strategy':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'concept':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  const getLevelBadge = (level: Hint['level']) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level]}`}>
        {labels[level]}
      </span>
    )
  }

  if (hints.length === 0) return null

  return (
    <>
      {/* Hint Button */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`fixed z-50 ${
            position === 'bottom' ? 'bottom-6 right-6' :
            position === 'top' ? 'top-6 right-6' :
            position === 'left' ? 'left-6 top-1/2 -translate-y-1/2' :
            position === 'right' ? 'right-6 top-1/2 -translate-y-1/2' :
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          }`}
        >
          <Button
            onClick={openHints}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full w-14 h-14 shadow-lg"
            size="sm"
          >
            <Lightbulb className="w-6 h-6" />
          </Button>
          
          {/* Hint count badge */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {hints.length}
          </div>
        </motion.div>
      )}

      {/* Hint Modal */}
      <AnimatePresence>
        {isOpen && currentHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeHints}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full"
            >
              <Card className={`${getHintColor(currentHint.type)} border-2`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getHintIcon(currentHint.type)}
                      <div>
                        <h3 className="font-semibold text-lg">{currentHint.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getLevelBadge(currentHint.level)}
                          <span className="text-xs opacity-75">
                            Dica {currentHintIndex + 1} de {hints.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={closeHints}
                      className="bg-white/80 hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Main content */}
                  <div className="bg-white/80 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">{currentHint.content}</p>
                  </div>

                  {/* Example */}
                  {currentHint.example && (
                    <div className="bg-white/60 p-3 rounded-lg border-l-4 border-current">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Exemplo:
                      </h4>
                      <p className="text-sm opacity-90">{currentHint.example}</p>
                    </div>
                  )}

                  {/* Related concepts */}
                  {currentHint.relatedConcepts && currentHint.relatedConcepts.length > 0 && (
                    <div className="bg-white/60 p-3 rounded-lg">
                      <h4 className="font-medium mb-2 text-sm">Conceitos relacionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentHint.relatedConcepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/80 rounded text-xs font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevHint}
                      disabled={currentHintIndex === 0}
                      className="bg-white/80 hover:bg-white"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>

                    <div className="flex space-x-1">
                      {hints.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentHintIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentHintIndex
                              ? 'bg-current'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextHint}
                      disabled={currentHintIndex === hints.length - 1}
                      className="bg-white/80 hover:bg-white"
                    >
                      Próxima
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Hook for managing hints in components
export function useHints(gameId?: number, exerciseId?: string) {
  const [viewedHints, setViewedHints] = useState<Set<string>>(new Set())
  const [hintStats, setHintStats] = useState({
    totalViewed: 0,
    totalAvailable: 0
  })

  const markHintViewed = (hintId: string) => {
    setViewedHints(prev => {
      const newSet = new Set([...prev, hintId])
      setHintStats(prevStats => ({
        ...prevStats,
        totalViewed: newSet.size
      }))
      return newSet
    })
  }

  const updateAvailableHints = (count: number) => {
    setHintStats(prev => ({
      ...prev,
      totalAvailable: count
    }))
  }

  return {
    viewedHints,
    hintStats,
    markHintViewed,
    updateAvailableHints,
    isHintViewed: (hintId: string) => viewedHints.has(hintId)
  }
}
