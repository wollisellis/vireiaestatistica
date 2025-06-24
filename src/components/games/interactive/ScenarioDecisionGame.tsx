'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, ArrowRight, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface DecisionOption {
  id: string
  label: string
  description: string
  isCorrect: boolean
  explanation: string
  consequences?: string
}

interface ScenarioStep {
  id: string
  title: string
  description: string
  dataInfo?: string
  question: string
  options: DecisionOption[]
  hint?: string
}

interface ScenarioDecisionGameProps {
  title: string
  scenario: string
  steps: ScenarioStep[]
  onComplete: (correct: boolean, score: number, decisions: string[]) => void
}

export function ScenarioDecisionGame({
  title,
  scenario,
  steps,
  onComplete
}: ScenarioDecisionGameProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [decisions, setDecisions] = useState<string[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const currentStepData = steps[currentStep]

  const handleOptionSelect = (optionId: string) => {
    if (showFeedback) return
    setSelectedOption(optionId)
  }

  const handleSubmitDecision = () => {
    if (!selectedOption) return

    const newDecisions = [...decisions, selectedOption]
    setDecisions(newDecisions)
    setShowFeedback(true)

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1)
        setSelectedOption(null)
        setShowFeedback(false)
        setShowHint(false)
      } else {
        // Game completed
        const correctDecisions = newDecisions.filter((decision, index) => {
          const step = steps[index]
          const option = step.options.find(opt => opt.id === decision)
          return option?.isCorrect || false
        })

        const score = Math.round((correctDecisions.length / steps.length) * 100)
        const allCorrect = correctDecisions.length === steps.length

        setIsCompleted(true)
        onComplete(allCorrect, score, newDecisions)
      }
    }, 3000)
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setDecisions([])
    setSelectedOption(null)
    setShowFeedback(false)
    setIsCompleted(false)
    setShowHint(false)
  }

  const getSelectedOption = () => {
    return currentStepData.options.find(opt => opt.id === selectedOption)
  }

  const getDecisionSummary = () => {
    return decisions.map((decision, index) => {
      const step = steps[index]
      const option = step.options.find(opt => opt.id === decision)
      return {
        step: step.title,
        decision: option?.label || '',
        correct: option?.isCorrect || false
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-gray-600">{scenario}</p>
        
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mt-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!isCompleted ? (
          <div className="space-y-6">
            {/* Current Step */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Etapa {currentStep + 1}: {currentStepData.title}
                </h4>
                <p className="text-blue-800 mb-3">{currentStepData.description}</p>
                
                {currentStepData.dataInfo && (
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-1">Dados Disponíveis:</h5>
                    <p className="text-sm text-blue-700">{currentStepData.dataInfo}</p>
                  </div>
                )}
              </div>

              {/* Question */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-3">{currentStepData.question}</h4>
                
                {/* Hint Button */}
                {currentStepData.hint && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHint(!showHint)}
                    className="mb-3 flex items-center space-x-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showHint ? 'Ocultar' : 'Ver'} Dica</span>
                  </Button>
                )}

                {/* Hint */}
                <AnimatePresence>
                  {showHint && currentStepData.hint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4"
                    >
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">{currentStepData.hint}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentStepData.options.map(option => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedOption === option.id
                        ? showFeedback
                          ? option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">{option.label}</h5>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                      {showFeedback && selectedOption === option.id && (
                        <div className="ml-3">
                          {option.isCorrect ? (
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

              {/* Submit Button */}
              {!showFeedback && (
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={handleSubmitDecision}
                    disabled={!selectedOption}
                    className="flex items-center space-x-2"
                  >
                    <span>Confirmar Decisão</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Feedback */}
              {showFeedback && selectedOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 p-4 rounded-lg ${
                    getSelectedOption()?.isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getSelectedOption()?.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h5 className={`font-medium mb-2 ${
                        getSelectedOption()?.isCorrect ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {getSelectedOption()?.isCorrect ? 'Decisão Correta!' : 'Decisão Incorreta'}
                      </h5>
                      <p className={`text-sm mb-3 ${
                        getSelectedOption()?.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {getSelectedOption()?.explanation}
                      </p>
                      {getSelectedOption()?.consequences && (
                        <div className="p-3 bg-white rounded border border-gray-200">
                          <h6 className="font-medium text-gray-900 mb-1">Consequências:</h6>
                          <p className="text-sm text-gray-700">{getSelectedOption()?.consequences}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Completion Summary */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cenário Concluído!</h3>
              <p className="text-gray-600">
                Você tomou {decisions.length} decisões ao longo do cenário.
              </p>
            </div>

            {/* Decision Summary */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Resumo das Decisões:</h4>
              {getDecisionSummary().map((summary, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    summary.correct
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{summary.step}</h5>
                      <p className="text-sm text-gray-600">{summary.decision}</p>
                    </div>
                    {summary.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Restart Button */}
            <div className="flex justify-center">
              <Button onClick={handleRestart} className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
