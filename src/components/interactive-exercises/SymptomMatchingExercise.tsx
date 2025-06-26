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
  Heart,
  Eye,
  Zap
} from 'lucide-react'

interface Symptom {
  id: string
  name: string
  description: string
  category: 'visual' | 'physical' | 'cognitive' | 'systemic'
}

interface Deficiency {
  id: string
  nutrient: string
  fullName: string
  color: string
  symptoms: string[]
}

interface SymptomMatchingExerciseProps {
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
}

export function SymptomMatchingExercise({ 
  onComplete, 
  maxAttempts 
}: SymptomMatchingExerciseProps) {
  const deficiencies: Deficiency[] = [
    {
      id: 'vitamin-a',
      nutrient: 'Vitamina A',
      fullName: 'Retinol/Beta-caroteno',
      color: 'bg-orange-100 border-orange-300 text-orange-800',
      symptoms: ['cegueira-noturna', 'xeroftalmia', 'pele-seca', 'infeccoes-frequentes']
    },
    {
      id: 'iron',
      nutrient: 'Ferro',
      fullName: 'Anemia Ferropriva',
      color: 'bg-red-100 border-red-300 text-red-800',
      symptoms: ['fadiga', 'palidez', 'unhas-quebradicas', 'desejo-gelo']
    },
    {
      id: 'vitamin-d',
      nutrient: 'Vitamina D',
      fullName: 'Calciferol',
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      symptoms: ['dor-ossea', 'fraqueza-muscular', 'deformidades-osseas', 'fraturas-frequentes']
    },
    {
      id: 'vitamin-b12',
      nutrient: 'Vitamina B12',
      fullName: 'Cobalamina',
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      symptoms: ['formigamento', 'confusao-mental', 'anemia-megaloblastica', 'perda-memoria']
    }
  ]

  const symptoms: Symptom[] = [
    { id: 'cegueira-noturna', name: 'Cegueira Noturna', description: 'Dificuldade para enxergar em ambientes com pouca luz', category: 'visual' },
    { id: 'xeroftalmia', name: 'Xeroftalmia', description: 'Ressecamento da conjuntiva e córnea', category: 'visual' },
    { id: 'pele-seca', name: 'Pele Seca e Descamativa', description: 'Ressecamento e descamação da pele', category: 'physical' },
    { id: 'infeccoes-frequentes', name: 'Infecções Frequentes', description: 'Maior suscetibilidade a infecções respiratórias', category: 'systemic' },
    
    { id: 'fadiga', name: 'Fadiga Extrema', description: 'Cansaço excessivo e falta de energia', category: 'systemic' },
    { id: 'palidez', name: 'Palidez', description: 'Coloração pálida da pele e mucosas', category: 'physical' },
    { id: 'unhas-quebradicas', name: 'Unhas Quebradiças', description: 'Unhas fracas, quebradiças e em formato de colher', category: 'physical' },
    { id: 'desejo-gelo', name: 'Desejo de Gelo (Pagofagia)', description: 'Compulsão por mastigar gelo ou substâncias não alimentares', category: 'cognitive' },
    
    { id: 'dor-ossea', name: 'Dor Óssea', description: 'Dores nos ossos, especialmente na coluna e pelve', category: 'physical' },
    { id: 'fraqueza-muscular', name: 'Fraqueza Muscular', description: 'Diminuição da força muscular e dificuldade de movimentação', category: 'physical' },
    { id: 'deformidades-osseas', name: 'Deformidades Ósseas', description: 'Alterações na forma dos ossos (raquitismo em crianças)', category: 'physical' },
    { id: 'fraturas-frequentes', name: 'Fraturas Frequentes', description: 'Maior propensão a fraturas ósseas', category: 'physical' },
    
    { id: 'formigamento', name: 'Formigamento', description: 'Sensação de formigamento nas mãos e pés', category: 'physical' },
    { id: 'confusao-mental', name: 'Confusão Mental', description: 'Dificuldade de concentração e confusão', category: 'cognitive' },
    { id: 'anemia-megaloblastica', name: 'Anemia Megaloblástica', description: 'Anemia com glóbulos vermelhos grandes e imaturos', category: 'systemic' },
    { id: 'perda-memoria', name: 'Perda de Memória', description: 'Dificuldades de memória e demência', category: 'cognitive' }
  ]

  const [draggedSymptom, setDraggedSymptom] = useState<string | null>(null)
  const [assignments, setAssignments] = useState<{[key: string]: string}>({})
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [shuffledSymptoms, setShuffledSymptoms] = useState<Symptom[]>([])

  React.useEffect(() => {
    setShuffledSymptoms([...symptoms].sort(() => Math.random() - 0.5))
  }, [])

  const handleDragStart = (symptomId: string) => {
    setDraggedSymptom(symptomId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, deficiencyId: string) => {
    e.preventDefault()
    if (draggedSymptom && !isCompleted) {
      setAssignments(prev => ({
        ...prev,
        [draggedSymptom]: deficiencyId
      }))
      setDraggedSymptom(null)
    }
  }

  const handleSymptomClick = (symptomId: string, deficiencyId: string) => {
    if (!isCompleted) {
      setAssignments(prev => ({
        ...prev,
        [symptomId]: deficiencyId
      }))
    }
  }

  const removeAssignment = (symptomId: string) => {
    if (!isCompleted) {
      setAssignments(prev => {
        const newAssignments = { ...prev }
        delete newAssignments[symptomId]
        return newAssignments
      })
    }
  }

  const handleSubmit = useCallback(() => {
    let correctCount = 0
    const totalSymptoms = symptoms.length
    const detailedFeedback: string[] = []

    symptoms.forEach(symptom => {
      const userAssignment = assignments[symptom.id]
      const correctDeficiency = deficiencies.find(def => def.symptoms.includes(symptom.id))
      
      if (userAssignment === correctDeficiency?.id) {
        correctCount++
        detailedFeedback.push(`✅ ${symptom.name} → ${correctDeficiency.nutrient}`)
      } else {
        const userDeficiency = deficiencies.find(def => def.id === userAssignment)
        detailedFeedback.push(`❌ ${symptom.name} → ${userDeficiency?.nutrient || 'Não atribuído'} (Correto: ${correctDeficiency?.nutrient})`)
      }
    })

    const percentage = (correctCount / totalSymptoms) * 100
    let score = 0
    let feedbackMessage = ''

    if (percentage === 100) {
      score = 100
      feedbackMessage = `🏆 Perfeito! Todas as ${totalSymptoms} correspondências estão corretas. Você domina completamente os sinais clínicos de deficiências nutricionais!`
    } else if (percentage >= 80) {
      score = 85
      feedbackMessage = `✅ Muito bom! ${correctCount}/${totalSymptoms} correspondências corretas. Você tem excelente conhecimento clínico.`
    } else if (percentage >= 70) {
      score = 75
      feedbackMessage = `✓ Bom trabalho! ${correctCount}/${totalSymptoms} correspondências corretas. Revise alguns sinais clínicos para melhorar.`
    } else if (percentage >= 50) {
      score = 60
      feedbackMessage = `⚠️ ${correctCount}/${totalSymptoms} correspondências corretas. É importante estudar mais os sinais clínicos de deficiências.`
    } else {
      score = 40
      feedbackMessage = `📚 ${correctCount}/${totalSymptoms} correspondências corretas. Revise sistematicamente os sinais clínicos de cada deficiência nutricional.`
    }

    feedbackMessage += '\n\nDetalhes:\n' + detailedFeedback.join('\n')

    setAttempts(prev => prev + 1)
    setIsCompleted(true)
    setFeedback(feedbackMessage)
    onComplete(score, feedbackMessage)
  }, [assignments, onComplete])

  const handleReset = () => {
    setAssignments({})
    setFeedback('')
    setIsCompleted(false)
    setShuffledSymptoms([...symptoms].sort(() => Math.random() - 0.5))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visual': return <Eye className="w-4 h-4" />
      case 'physical': return <Heart className="w-4 h-4" />
      case 'cognitive': return <Zap className="w-4 h-4" />
      case 'systemic': return <Target className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getAssignedSymptoms = (deficiencyId: string) => {
    return Object.entries(assignments)
      .filter(([_, assignedDeficiency]) => assignedDeficiency === deficiencyId)
      .map(([symptomId, _]) => symptoms.find(s => s.id === symptomId))
      .filter(Boolean)
  }

  const getUnassignedSymptoms = () => {
    return shuffledSymptoms.filter(symptom => !assignments[symptom.id])
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Correspondência: Sintomas e Deficiências Nutricionais
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-emerald-800">
              Arraste os sintomas para as deficiências nutricionais correspondentes. 
              Você também pode clicar nos sintomas e depois na deficiência desejada.
            </p>
            <div className="flex items-center justify-between text-sm text-emerald-700">
              <span>Tentativa {attempts + 1}/{maxAttempts}</span>
              <span>Atribuições: {Object.keys(assignments).length}/{symptoms.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Symptoms Pool */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-blue-900">Sintomas Clínicos</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getUnassignedSymptoms().map((symptom) => (
                <motion.div
                  key={symptom.id}
                  draggable={!isCompleted}
                  onDragStart={() => handleDragStart(symptom.id)}
                  className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                    draggedSymptom === symptom.id 
                      ? 'border-blue-500 bg-blue-100 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  } ${isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isCompleted ? { scale: 1.02 } : {}}
                  whileDrag={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="flex items-start space-x-2">
                    <div className="text-gray-500 mt-1">
                      {getCategoryIcon(symptom.category)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{symptom.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{symptom.description}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deficiencies */}
        <div className="lg:col-span-2 space-y-4">
          {deficiencies.map((deficiency) => (
            <Card 
              key={deficiency.id}
              className="border-gray-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, deficiency.id)}
            >
              <CardHeader className="pb-3">
                <h3 className={`text-lg font-semibold p-3 rounded-lg ${deficiency.color}`}>
                  Deficiência de {deficiency.nutrient}
                  <span className="text-sm font-normal block">{deficiency.fullName}</span>
                </h3>
              </CardHeader>
              <CardContent>
                <div className="min-h-24 border-2 border-dashed border-gray-300 rounded-lg p-3">
                  {getAssignedSymptoms(deficiency.id).length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Arraste sintomas aqui</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {getAssignedSymptoms(deficiency.id).map((symptom) => (
                        <motion.div
                          key={symptom!.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-2 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="text-emerald-600">
                              {getCategoryIcon(symptom!.category)}
                            </div>
                            <span className="text-sm font-medium text-emerald-900">
                              {symptom!.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeAssignment(symptom!.id)}
                            disabled={isCompleted}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isCompleted}
            className="text-gray-600 border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShuffledSymptoms([...symptoms].sort(() => Math.random() - 0.5))}
            disabled={isCompleted}
            className="text-blue-600 border-blue-300"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Embaralhar
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={Object.keys(assignments).length !== symptoms.length || isCompleted}
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
                <div className="text-sm leading-relaxed whitespace-pre-line">{feedback}</div>
                {isCompleted && (
                  <div className="mt-4 p-4 bg-white rounded border">
                    <h4 className="font-semibold text-gray-900 mb-3">Resumo das Deficiências Nutricionais:</h4>
                    <div className="space-y-3">
                      {deficiencies.map((deficiency) => (
                        <div key={deficiency.id} className={`p-3 rounded ${deficiency.color}`}>
                          <div className="font-medium mb-2">{deficiency.nutrient} ({deficiency.fullName})</div>
                          <div className="text-sm">
                            <strong>Sintomas principais:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {deficiency.symptoms.map(symptomId => {
                                const symptom = symptoms.find(s => s.id === symptomId)
                                return <li key={symptomId}>{symptom?.name}</li>
                              })}
                            </ul>
                          </div>
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
