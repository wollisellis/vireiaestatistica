'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, Info, Zap } from 'lucide-react'

interface LoadingStep {
  id: string
  label: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  duration?: number
  error?: string
}

interface IntelligentLoaderProps {
  steps: LoadingStep[]
  onComplete?: () => void
  onError?: (error: string) => void
  className?: string
  showProgress?: boolean
  estimatedTime?: number
}

export const IntelligentLoader: React.FC<IntelligentLoaderProps> = ({
  steps,
  onComplete,
  onError,
  className = '',
  showProgress = true,
  estimatedTime = 3000
}) => {
  const [currentSteps, setCurrentSteps] = useState<LoadingStep[]>(steps)
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    setCurrentSteps(steps)
  }, [steps])

  // Calcular progresso geral
  useEffect(() => {
    const completed = currentSteps.filter(step => step.status === 'completed').length
    const progress = (completed / currentSteps.length) * 100
    setOverallProgress(progress)

    // Verificar se todos os steps estão completos
    if (progress === 100) {
      setTimeout(() => {
        onComplete?.()
      }, 500)
    }

    // Verificar se algum step teve erro
    const errorStep = currentSteps.find(step => step.status === 'error')
    if (errorStep) {
      onError?.(errorStep.error || 'Erro desconhecido')
    }
  }, [currentSteps, onComplete, onError])

  // Encontrar step atual
  useEffect(() => {
    const loadingIndex = currentSteps.findIndex(step => step.status === 'loading')
    const nextPendingIndex = currentSteps.findIndex(step => step.status === 'pending')
    
    if (loadingIndex !== -1) {
      setCurrentStepIndex(loadingIndex)
    } else if (nextPendingIndex !== -1) {
      setCurrentStepIndex(nextPendingIndex)
    }
  }, [currentSteps])

  const updateStep = (id: string, updates: Partial<LoadingStep>) => {
    setCurrentSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const getStepIcon = (step: LoadingStep) => {
    switch (step.status) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    }
  }

  const getStepColor = (step: LoadingStep) => {
    switch (step.status) {
      case 'loading':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          animate={{ rotate: overallProgress === 100 ? 0 : 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-6 h-6 text-blue-500" />
        </motion.div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {overallProgress === 100 ? 'Carregamento Completo!' : 'Preparando Módulo...'}
          </h3>
          <p className="text-sm text-gray-600">
            {overallProgress === 100 
              ? 'Redirecionando para o módulo...' 
              : `Passo ${currentStepIndex + 1} de ${currentSteps.length}`
            }
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3">
        <AnimatePresence>
          {currentSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                step.status === 'loading' ? 'bg-blue-50 border border-blue-200' :
                step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                step.status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step)}
              </div>
              
              <div className="flex-1">
                <div className={`font-medium ${getStepColor(step)}`}>
                  {step.label}
                </div>
                {step.status === 'error' && step.error && (
                  <div className="text-sm text-red-600 mt-1">
                    {step.error}
                  </div>
                )}
                {step.status === 'loading' && step.duration && (
                  <div className="text-sm text-blue-600 mt-1">
                    ~{Math.round(step.duration / 1000)}s restantes
                  </div>
                )}
              </div>

              {/* Loading animation for current step */}
              {step.status === 'loading' && (
                <motion.div
                  className="w-1 h-6 bg-blue-500 rounded-full"
                  animate={{ scaleY: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Time Estimate */}
      {estimatedTime > 0 && overallProgress < 100 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              Tempo estimado: ~{Math.round(estimatedTime * (1 - overallProgress / 100) / 1000)}s
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para gerenciar loading steps
export const useLoadingSteps = (initialSteps: Omit<LoadingStep, 'status'>[]) => {
  const [steps, setSteps] = useState<LoadingStep[]>(
    initialSteps.map(step => ({ ...step, status: 'pending' as const }))
  )

  const updateStep = (id: string, updates: Partial<LoadingStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ))
  }

  const startStep = (id: string) => {
    updateStep(id, { status: 'loading' })
  }

  const completeStep = (id: string) => {
    updateStep(id, { status: 'completed' })
  }

  const errorStep = (id: string, error: string) => {
    updateStep(id, { status: 'error', error })
  }

  const resetSteps = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })))
  }

  const executeStepsSequentially = async (
    stepExecutors: Record<string, () => Promise<void>>
  ) => {
    for (const step of steps) {
      if (stepExecutors[step.id]) {
        try {
          startStep(step.id)
          await stepExecutors[step.id]()
          completeStep(step.id)
        } catch (error) {
          errorStep(step.id, error instanceof Error ? error.message : 'Erro desconhecido')
          throw error
        }
      }
    }
  }

  return {
    steps,
    updateStep,
    startStep,
    completeStep,
    errorStep,
    resetSteps,
    executeStepsSequentially
  }
}