'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface MatchingItem {
  id: string
  content: string
  type: 'concept' | 'example'
  matchId: string
  explanation: string
  dailyLifeAnalogy?: string
  icon?: React.ReactNode
}

interface MatchingGameProps {
  title: string
  instruction: string
  items: MatchingItem[]
  onComplete: (correct: boolean, score: number) => void
  showAnalogies?: boolean
}

export function MatchingGame({
  title,
  instruction,
  items,
  onComplete,
  showAnalogies = true
}: MatchingGameProps) {
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number } | null>(null)
  const [showHints, setShowHints] = useState(false)

  const concepts = items.filter(item => item.type === 'concept')
  const examples = items.filter(item => item.type === 'example')

  const handleItemClick = (itemId: string) => {
    if (isCompleted) return

    if (selectedItem === null) {
      setSelectedItem(itemId)
    } else {
      const selectedItemData = items.find(item => item.id === selectedItem)
      const currentItemData = items.find(item => item.id === itemId)
      
      if (selectedItemData && currentItemData) {
        // Check if they're different types and can be matched
        if (selectedItemData.type !== currentItemData.type) {
          const conceptId = selectedItemData.type === 'concept' ? selectedItemData.id : currentItemData.id
          const exampleId = selectedItemData.type === 'example' ? selectedItemData.id : currentItemData.id
          
          setMatches(prev => ({
            ...prev,
            [conceptId]: exampleId
          }))
        }
      }
      setSelectedItem(null)
    }
  }

  const handleSubmit = () => {
    let correctMatches = 0
    const totalConcepts = concepts.length

    concepts.forEach(concept => {
      const matchedExampleId = matches[concept.id]
      if (matchedExampleId) {
        const matchedExample = examples.find(ex => ex.id === matchedExampleId)
        if (matchedExample && matchedExample.matchId === concept.matchId) {
          correctMatches++
        }
      }
    })

    const score = Math.round((correctMatches / totalConcepts) * 100)
    const isCorrect = correctMatches === totalConcepts

    setFeedback({ correct: isCorrect, score })
    setIsCompleted(true)
    onComplete(isCorrect, score)
  }

  const handleReset = () => {
    setMatches({})
    setSelectedItem(null)
    setIsCompleted(false)
    setFeedback(null)
    setShowHints(false)
  }

  const isItemMatched = (itemId: string) => {
    return Object.values(matches).includes(itemId) || Object.keys(matches).includes(itemId)
  }

  const getMatchedPartner = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return null

    if (item.type === 'concept') {
      const exampleId = matches[itemId]
      return examples.find(ex => ex.id === exampleId)
    } else {
      const conceptId = Object.keys(matches).find(key => matches[key] === itemId)
      return concepts.find(c => c.id === conceptId)
    }
  }

  const isMatchCorrect = (itemId: string) => {
    if (!isCompleted) return null
    
    const item = items.find(i => i.id === itemId)
    const partner = getMatchedPartner(itemId)
    
    if (!item || !partner) return false
    
    return item.matchId === partner.matchId
  }

  const getItemStyle = (itemId: string) => {
    const isSelected = selectedItem === itemId
    const isMatched = isItemMatched(itemId)
    const matchCorrect = isMatchCorrect(itemId)

    if (isCompleted && isMatched) {
      return matchCorrect 
        ? 'border-green-500 bg-green-50 text-green-800'
        : 'border-red-500 bg-red-50 text-red-800'
    }
    
    if (isSelected) {
      return 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-200'
    }
    
    if (isMatched) {
      return 'border-purple-500 bg-purple-50 text-purple-800'
    }
    
    return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="flex items-center space-x-2"
          >
            <Lightbulb className="w-4 h-4" />
            <span>{showHints ? 'Ocultar' : 'Ver'} Dicas</span>
          </Button>
        </div>
        <p className="text-gray-600">{instruction}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como Jogar:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Clique em um conceito estatístico (lado esquerdo)</li>
              <li>Depois clique no exemplo correspondente (lado direito)</li>
              <li>Continue até conectar todos os pares</li>
              <li>Clique em "Verificar" para ver o resultado</li>
            </ol>
          </div>

          {/* Hints */}
          <AnimatePresence>
            {showHints && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Dicas para Iniciantes:
                </h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>• <strong>Pense no dia a dia:</strong> Estatística está em tudo - desde escolher o melhor produto no supermercado até entender se um exercício funciona</p>
                  <p>• <strong>Não se preocupe com nomes complicados:</strong> Cada conceito tem uma ideia simples por trás</p>
                  <p>• <strong>Use as analogias:</strong> Compare com situações que você já conhece</p>
                  <p>• <strong>Leia as explicações:</strong> Cada item tem uma explicação em linguagem simples</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Matching Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Concepts Column */}
            <div>
              <h4 className="font-medium mb-3 text-center p-2 bg-blue-100 rounded-lg">
                📊 Conceitos Estatísticos
              </h4>
              <div className="space-y-3">
                {concepts.map(concept => (
                  <motion.button
                    key={concept.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(concept.id)}
                    disabled={isCompleted}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getItemStyle(concept.id)}`}
                  >
                    <div className="flex items-center space-x-3">
                      {concept.icon && <div className="text-blue-600">{concept.icon}</div>}
                      <div className="flex-1">
                        <div className="font-medium">{concept.content}</div>
                        {showAnalogies && concept.dailyLifeAnalogy && (
                          <div className="text-xs text-gray-600 mt-1">
                            💡 {concept.dailyLifeAnalogy}
                          </div>
                        )}
                      </div>
                      {isCompleted && isItemMatched(concept.id) && (
                        <div className="ml-2">
                          {isMatchCorrect(concept.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Examples Column */}
            <div>
              <h4 className="font-medium mb-3 text-center p-2 bg-green-100 rounded-lg">
                🌟 Exemplos Práticos
              </h4>
              <div className="space-y-3">
                {examples.map(example => (
                  <motion.button
                    key={example.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(example.id)}
                    disabled={isCompleted}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getItemStyle(example.id)}`}
                  >
                    <div className="flex items-center space-x-3">
                      {example.icon && <div className="text-green-600">{example.icon}</div>}
                      <div className="flex-1">
                        <div className="font-medium">{example.content}</div>
                        {showAnalogies && example.dailyLifeAnalogy && (
                          <div className="text-xs text-gray-600 mt-1">
                            💡 {example.dailyLifeAnalogy}
                          </div>
                        )}
                      </div>
                      {isCompleted && isItemMatched(example.id) && (
                        <div className="ml-2">
                          {isMatchCorrect(example.id) ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
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
                disabled={Object.keys(matches).length !== concepts.length}
              >
                Verificar Conexões ({Object.keys(matches).length}/{concepts.length})
              </Button>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                feedback.correct ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              <div className="flex items-center space-x-2 mb-3">
                {feedback.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
                <span className="font-medium">
                  {feedback.correct 
                    ? '🎉 Perfeito! Você conectou tudo corretamente!' 
                    : `📚 Quase lá! Pontuação: ${feedback.score}%`
                  }
                </span>
              </div>
              
              {!feedback.correct && (
                <div className="text-sm">
                  <p className="mb-2">💡 <strong>Dica:</strong> Olhe as conexões em vermelho e pense:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Qual situação do dia a dia se parece com esse conceito?</li>
                    <li>Quando você usaria essa análise na vida real?</li>
                    <li>Que tipo de pergunta essa estatística responde?</li>
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Detailed Explanations */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="font-medium text-gray-900">📖 Explicações Detalhadas:</h4>
              {concepts.map(concept => {
                const matchedExample = getMatchedPartner(concept.id)
                const isCorrect = isMatchCorrect(concept.id)
                
                return (
                  <div
                    key={concept.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{concept.content}</h5>
                        <p className="text-sm text-gray-700 mb-2">{concept.explanation}</p>
                        {matchedExample && (
                          <div className="text-sm">
                            <span className="font-medium">Sua conexão:</span> {matchedExample.content}
                            {!isCorrect && (
                              <div className="mt-1 text-red-700">
                                <span className="font-medium">Conexão correta:</span> {
                                  examples.find(ex => ex.matchId === concept.matchId)?.content
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
