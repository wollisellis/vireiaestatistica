'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

interface LabResult {
  parameter: string
  value: number
  unit: string
  referenceMin: number
  referenceMax: number
  status: 'low' | 'normal' | 'high'
  clinicalSignificance: string
}

interface LabResultsChartProps {
  patientData: {
    name: string
    age: number
    gender: 'M' | 'F'
    clinicalHistory: string
  }
  labResults: LabResult[]
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
}

export function LabResultsChart({ 
  patientData, 
  labResults, 
  onComplete, 
  maxAttempts 
}: LabResultsChartProps) {
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null)
  const [interpretations, setInterpretations] = useState<{[key: string]: string}>({})
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showReferenceRanges, setShowReferenceRanges] = useState(true)

  const interpretationOptions = [
    'Normal - dentro dos valores de referência',
    'Baixo - abaixo dos valores de referência',
    'Alto - acima dos valores de referência',
    'Limítrofe - próximo aos limites de referência'
  ]

  const getBarColor = (result: LabResult) => {
    if (result.status === 'low') return '#ef4444' // red-500
    if (result.status === 'high') return '#f59e0b' // amber-500
    return '#10b981' // emerald-500
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      case 'high':
        return <TrendingUp className="w-4 h-4 text-amber-500" />
      default:
        return <Minus className="w-4 h-4 text-emerald-500" />
    }
  }

  const handleParameterClick = (parameter: string) => {
    setSelectedParameter(selectedParameter === parameter ? null : parameter)
  }

  const handleInterpretationSelect = (parameter: string, interpretation: string) => {
    setInterpretations(prev => ({
      ...prev,
      [parameter]: interpretation
    }))
  }

  const handleSubmit = useCallback(() => {
    if (Object.keys(interpretations).length !== labResults.length) {
      setFeedback('⚠️ Complete a interpretação de todos os parâmetros laboratoriais.')
      return
    }

    let correctCount = 0
    const detailedFeedback: string[] = []

    labResults.forEach(result => {
      const userInterpretation = interpretations[result.parameter]
      const correctInterpretation = getCorrectInterpretation(result.status)
      
      if (userInterpretation === correctInterpretation) {
        correctCount++
        detailedFeedback.push(`✅ ${result.parameter}: Interpretação correta`)
      } else {
        detailedFeedback.push(`❌ ${result.parameter}: ${userInterpretation} → Correto: ${correctInterpretation}`)
      }
    })

    const percentage = (correctCount / labResults.length) * 100
    let score = 0
    let feedbackMessage = ''

    if (percentage === 100) {
      score = 100
      feedbackMessage = `🏆 Perfeito! Todas as ${labResults.length} interpretações estão corretas. Você demonstra excelente conhecimento em análise laboratorial!`
    } else if (percentage >= 80) {
      score = 85
      feedbackMessage = `✅ Muito bom! ${correctCount}/${labResults.length} interpretações corretas. Você tem boa compreensão dos valores de referência.`
    } else if (percentage >= 60) {
      score = 70
      feedbackMessage = `✓ Bom trabalho! ${correctCount}/${labResults.length} interpretações corretas. Revise alguns conceitos para melhorar.`
    } else {
      score = 50
      feedbackMessage = `📚 ${correctCount}/${labResults.length} interpretações corretas. É importante revisar os valores de referência laboratoriais.`
    }

    feedbackMessage += '\n\nDetalhes:\n' + detailedFeedback.join('\n')

    setAttempts(prev => prev + 1)
    setIsCompleted(true)
    setFeedback(feedbackMessage)
    onComplete(score, feedbackMessage)
  }, [interpretations, labResults, onComplete])

  const getCorrectInterpretation = (status: string): string => {
    switch (status) {
      case 'low':
        return 'Baixo - abaixo dos valores de referência'
      case 'high':
        return 'Alto - acima dos valores de referência'
      default:
        return 'Normal - dentro dos valores de referência'
    }
  }

  const chartData = labResults.map(result => ({
    name: result.parameter,
    value: result.value,
    referenceMin: result.referenceMin,
    referenceMax: result.referenceMax,
    status: result.status,
    unit: result.unit
  }))

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Dados do Paciente
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-emerald-800">Nome:</span>
              <div className="text-emerald-700">{patientData.name}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Idade/Sexo:</span>
              <div className="text-emerald-700">{patientData.age} anos, {patientData.gender === 'M' ? 'Masculino' : 'Feminino'}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Tentativa:</span>
              <div className="text-emerald-700">{attempts + 1}/{maxAttempts}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className="font-medium text-emerald-800">História Clínica:</span>
            <div className="text-emerald-700 text-sm mt-1">{patientData.clinicalHistory}</div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Chart */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Resultados Laboratoriais Interativos
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReferenceRanges(!showReferenceRanges)}
              className="text-blue-600 border-blue-300"
            >
              {showReferenceRanges ? 'Ocultar' : 'Mostrar'} Faixas de Referência
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => [
                    `${value} ${props.payload.unit}`,
                    'Valor'
                  ]}
                  labelFormatter={(label) => `Parâmetro: ${label}`}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-600">
                            Valor: {data.value} {data.unit}
                          </p>
                          {showReferenceRanges && (
                            <p className="text-gray-600 text-sm">
                              Referência: {data.referenceMin} - {data.referenceMax} {data.unit}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Clique na barra para interpretar
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="value" 
                  onClick={(data) => handleParameterClick(data.name)}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(labResults[index])}
                      stroke={selectedParameter === entry.name ? '#1f2937' : 'none'}
                      strokeWidth={selectedParameter === entry.name ? 2 : 0}
                    />
                  ))}
                </Bar>
                
                {/* Reference Range Lines */}
                {showReferenceRanges && chartData.map((data, index) => (
                  <g key={`ref-${index}`}>
                    <ReferenceLine 
                      y={data.referenceMin} 
                      stroke="#6b7280" 
                      strokeDasharray="2 2"
                      strokeWidth={1}
                    />
                    <ReferenceLine 
                      y={data.referenceMax} 
                      stroke="#6b7280" 
                      strokeDasharray="2 2"
                      strokeWidth={1}
                    />
                  </g>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>💡 <strong>Dica:</strong> Clique nas barras para interpretar cada parâmetro. As linhas tracejadas mostram os valores de referência.</p>
          </div>
        </CardContent>
      </Card>

      {/* Parameter Interpretation */}
      {selectedParameter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Interpretação: {selectedParameter}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {interpretationOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleInterpretationSelect(selectedParameter, option)}
                      disabled={isCompleted}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        interpretations[selectedParameter] === option
                          ? 'border-yellow-500 bg-yellow-100 text-yellow-900'
                          : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                      } ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {interpretations[selectedParameter] && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-sm text-gray-700">
                      <strong>Interpretação selecionada:</strong> {interpretations[selectedParameter]}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress Summary */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-gray-900">Progresso da Interpretação</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {labResults.map((result) => (
              <div 
                key={result.parameter}
                className={`p-3 rounded-lg border text-center ${
                  interpretations[result.parameter] 
                    ? 'border-emerald-300 bg-emerald-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  {getStatusIcon(result.status)}
                </div>
                <div className="text-sm font-medium text-gray-900">{result.parameter}</div>
                <div className="text-xs text-gray-600">{result.value} {result.unit}</div>
                <div className="mt-2">
                  {interpretations[result.parameter] ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              Interpretações completas: {Object.keys(interpretations).length}/{labResults.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={Object.keys(interpretations).length !== labResults.length || isCompleted}
          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Confirmar Interpretações
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
                    <h4 className="font-semibold text-gray-900 mb-3">Significado Clínico dos Parâmetros:</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      {labResults.map((result) => (
                        <div key={result.parameter} className="p-2 bg-gray-50 rounded">
                          <strong>{result.parameter}:</strong> {result.clinicalSignificance}
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
