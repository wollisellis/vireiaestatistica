'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Target, 
  CheckCircle, 
  AlertCircle, 
  RotateCcw,
  Shuffle,
  Users
} from 'lucide-react'

interface MatchingPair {
  id: string
  bmi: number
  classification: string
  description: string
  color: string
}

interface NutritionalMatchingExerciseProps {
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
}

export function NutritionalMatchingExercise({ 
  onComplete, 
  maxAttempts 
}: NutritionalMatchingExerciseProps) {
  const matchingPairs: MatchingPair[] = [
    {
      id: 'underweight',
      bmi: 17.2,
      classification: 'Baixo peso',
      description: 'IMC < 18,5 kg/m²',
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    {
      id: 'normal',
      bmi: 22.8,
      classification: 'Eutrófico',
      description: 'IMC 18,5 - 24,9 kg/m²',
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    {
      id: 'overweight',
      bmi: 27.3,
      classification: 'Sobrepeso',
      description: 'IMC 25,0 - 29,9 kg/m²',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    {
      id: 'obese',
      bmi: 32.1,
      classification: 'Obesidade',
      description: 'IMC ≥ 30,0 kg/m²',
      color: 'bg-red-100 border-red-300 text-red-800'
    }
  ]

  const [bmiValues, setBmiValues] = useState<MatchingPair[]>([])
  const [classifications, setClassifications] = useState<MatchingPair[]>([])
  const [matches, setMatches] = useState<{[key: string]: string}>({})
  const [selectedBMI, setSelectedBMI] = useState<string | null>(null)
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [correctMatches, setCorrectMatches] = useState<string[]>([])

  // Initialize shuffled arrays
  React.useEffect(() => {
    shuffleItems()
  }, [])

  const shuffleItems = () => {
    const shuffledBMI = [...matchingPairs].sort(() => Math.random() - 0.5)
    const shuffledClassifications = [...matchingPairs].sort(() => Math.random() - 0.5)
    setBmiValues(shuffledBMI)
    setClassifications(shuffledClassifications)
    setMatches({})
    setSelectedBMI(null)
    setSelectedClassification(null)
    setCorrectMatches([])
    setFeedback('')
    setIsCompleted(false)
  }

  const handleBMISelect = (id: string) => {
    if (isCompleted || matches[id]) return
    setSelectedBMI(selectedBMI === id ? null : id)
    setSelectedClassification(null)
  }

  const handleClassificationSelect = (id: string) => {
    if (isCompleted) return
    
    // Check if this classification is already matched
    const alreadyMatched = Object.values(matches).includes(id)
    if (alreadyMatched) return

    if (selectedBMI) {
      // Create match
      const newMatches = { ...matches, [selectedBMI]: id }
      setMatches(newMatches)

      // Check if match is correct by comparing BMI value with classification
      const selectedBMIData = matchingPairs.find(pair => pair.id === selectedBMI)
      const selectedClassificationData = matchingPairs.find(pair => pair.id === id)

      if (selectedBMIData && selectedClassificationData) {
        // Check if the BMI value matches the classification range
        const bmi = selectedBMIData.bmi
        let isCorrectMatch = false

        if (selectedClassificationData.id === 'underweight' && bmi < 18.5) isCorrectMatch = true
        else if (selectedClassificationData.id === 'normal' && bmi >= 18.5 && bmi < 25) isCorrectMatch = true
        else if (selectedClassificationData.id === 'overweight' && bmi >= 25 && bmi < 30) isCorrectMatch = true
        else if (selectedClassificationData.id === 'obese' && bmi >= 30) isCorrectMatch = true

        if (isCorrectMatch) {
          setCorrectMatches(prev => [...prev, selectedBMI])
        }
      }

      setSelectedBMI(null)
      setSelectedClassification(null)
    } else {
      setSelectedClassification(selectedClassification === id ? null : id)
    }
  }

  const handleSubmit = useCallback(() => {
    if (Object.keys(matches).length !== matchingPairs.length) {
      setFeedback('⚠️ Complete todas as correspondências antes de submeter.')
      return
    }

    const correctCount = correctMatches.length
    const totalPairs = matchingPairs.length
    const percentage = (correctCount / totalPairs) * 100

    let score = 0
    let feedbackMessage = ''

    if (percentage === 100) {
      score = 100
      feedbackMessage = `🏆 Perfeito! Todas as ${totalPairs} correspondências estão corretas. Você domina completamente as classificações de IMC!`
    } else if (percentage >= 75) {
      score = 85
      feedbackMessage = `✅ Muito bom! ${correctCount}/${totalPairs} correspondências corretas. Você tem boa compreensão das classificações.`
    } else if (percentage >= 50) {
      score = 70
      feedbackMessage = `✓ Bom trabalho! ${correctCount}/${totalPairs} correspondências corretas. Revise as faixas de IMC para melhorar.`
    } else {
      score = 50
      feedbackMessage = `📚 ${correctCount}/${totalPairs} correspondências corretas. É importante revisar as classificações de IMC da OMS.`
    }

    setAttempts(prev => prev + 1)
    setIsCompleted(true)
    setFeedback(feedbackMessage)
    onComplete(score, feedbackMessage)
  }, [matches, correctMatches, matchingPairs.length, onComplete])

  const handleReset = () => {
    setMatches({})
    setSelectedBMI(null)
    setSelectedClassification(null)
    setCorrectMatches([])
    setFeedback('')
    setIsCompleted(false)
  }

  const isMatched = (id: string) => {
    return Object.keys(matches).includes(id) || Object.values(matches).includes(id)
  }

  const getMatchedClassification = (bmiId: string) => {
    return matches[bmiId]
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Exercício de Correspondência - Classificações de IMC
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-emerald-800">
              Conecte cada valor de IMC com sua classificação nutricional correta. 
              Clique primeiro no IMC, depois na classificação correspondente.
            </p>
            <div className="flex items-center justify-between text-sm text-emerald-700">
              <span>Tentativa {attempts + 1}/{maxAttempts}</span>
              <span>Correspondências: {Object.keys(matches).length}/{matchingPairs.length}</span>
              <span>Corretas: {correctMatches.length}/{matchingPairs.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Interface */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* BMI Values Column */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Valores de IMC
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bmiValues.map((item) => {
                const isSelected = selectedBMI === item.id
                const isMatchedItem = isMatched(item.id)
                const matchedClassificationId = getMatchedClassification(item.id)
                const isCorrectMatch = correctMatches.includes(item.id)

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleBMISelect(item.id)}
                    disabled={isCompleted}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-100 shadow-md' 
                        : isMatchedItem
                        ? isCorrectMatch
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    } ${isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                    whileHover={!isCompleted ? { scale: 1.02 } : {}}
                    whileTap={!isCompleted ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg text-gray-900">
                          {item.bmi} kg/m²
                        </div>
                        <div className="text-sm text-gray-600">
                          Paciente {item.id === 'underweight' ? 'A' : item.id === 'normal' ? 'B' : item.id === 'overweight' ? 'C' : 'D'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isMatchedItem && (
                          <div className={`w-3 h-3 rounded-full ${
                            isCorrectMatch ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        )}
                        {matchedClassificationId && (
                          <div className="text-xs text-gray-600">
                            → {classifications.find(c => c.id === matchedClassificationId)?.classification}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Classifications Column */}
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Classificações Nutricionais
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classifications.map((item) => {
                const isSelected = selectedClassification === item.id
                const isMatchedItem = Object.values(matches).includes(item.id)
                const isCorrectMatch = correctMatches.includes(item.id)

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleClassificationSelect(item.id)}
                    disabled={isCompleted}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-100 shadow-md' 
                        : isMatchedItem
                        ? isCorrectMatch
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : item.color
                    } ${isCompleted ? 'cursor-default' : 'cursor-pointer'}`}
                    whileHover={!isCompleted ? { scale: 1.02 } : {}}
                    whileTap={!isCompleted ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">
                          {item.classification}
                        </div>
                        <div className="text-sm opacity-75">
                          {item.description}
                        </div>
                      </div>
                      {isMatchedItem && (
                        <div className={`w-3 h-3 rounded-full ${
                          isCorrectMatch ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={shuffleItems}
            disabled={isCompleted}
            className="text-blue-600 border-blue-300"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Embaralhar
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isCompleted}
            className="text-gray-600 border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={Object.keys(matches).length !== matchingPairs.length || isCompleted}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar Correspondências
        </Button>
      </div>

      {/* Feedback */}
      {feedback && (
        <Card className={`border-l-4 ${
          feedback.includes('🏆') || feedback.includes('✅') ? 'border-l-green-500 bg-green-50' :
          feedback.includes('✓') ? 'border-l-blue-500 bg-blue-50' :
          feedback.includes('⚠️') ? 'border-l-yellow-500 bg-yellow-50' :
          'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              {feedback.includes('🏆') || feedback.includes('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : feedback.includes('⚠️') ? (
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{feedback}</p>
                {isCompleted && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <h4 className="font-semibold text-gray-900 mb-3">Classificações Corretas de IMC (OMS):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {matchingPairs.map((pair) => (
                        <div key={pair.id} className={`p-2 rounded ${pair.color}`}>
                          <div className="font-medium">{pair.classification}</div>
                          <div className="text-xs opacity-75">{pair.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
