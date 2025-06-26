'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Calculator, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Target,
  Ruler,
  Scale
} from 'lucide-react'

interface BMICalculatorExerciseProps {
  patientData: {
    name: string
    age: number
    weight: number
    height: number
    region: string
  }
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
}

export function BMICalculatorExercise({ 
  patientData, 
  onComplete, 
  maxAttempts 
}: BMICalculatorExerciseProps) {
  const [weightInput, setWeightInput] = useState<number | ''>('')
  const [heightInput, setHeightInput] = useState<number | ''>('')
  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null)
  const [selectedClassification, setSelectedClassification] = useState<string>('')
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHints, setShowHints] = useState(false)

  const correctBMI = Number((patientData.weight / Math.pow(patientData.height / 100, 2)).toFixed(1))
  
  const getClassification = (bmi: number): string => {
    if (bmi < 18.5) return 'Baixo peso'
    if (bmi < 25) return 'Eutrófico'
    if (bmi < 30) return 'Sobrepeso'
    return 'Obesidade'
  }

  const correctClassification = getClassification(correctBMI)

  const classifications = [
    'Baixo peso',
    'Eutrófico', 
    'Sobrepeso',
    'Obesidade'
  ]

  const handleCalculate = useCallback(() => {
    if (!weightInput || !heightInput) {
      setFeedback('⚠️ Por favor, insira peso e altura para calcular o IMC.')
      return
    }

    const bmi = Number((Number(weightInput) / Math.pow(Number(heightInput) / 100, 2)).toFixed(1))
    setCalculatedBMI(bmi)

    const accuracy = Math.abs(bmi - correctBMI)
    if (accuracy <= 0.5) {
      setFeedback(`✅ Cálculo correto! IMC = ${bmi} kg/m²`)
    } else {
      setFeedback(`❌ IMC calculado: ${bmi} kg/m². Verifique os valores inseridos.`)
    }
  }, [weightInput, heightInput, correctBMI])

  const handleSubmit = useCallback(() => {
    if (!calculatedBMI || !selectedClassification) {
      setFeedback('⚠️ Complete o cálculo do IMC e selecione a classificação.')
      return
    }

    const bmiAccuracy = Math.abs(calculatedBMI - correctBMI)
    const classificationCorrect = selectedClassification === correctClassification

    let score = 0
    let feedbackMessage = ''

    if (bmiAccuracy <= 0.5 && classificationCorrect) {
      score = 100
      feedbackMessage = `🏆 Excelente! IMC correto (${correctBMI} kg/m²) e classificação correta (${correctClassification}).`
    } else if (bmiAccuracy <= 1.0 && classificationCorrect) {
      score = 85
      feedbackMessage = `✅ Muito bom! Classificação correta, IMC com pequena variação.`
    } else if (classificationCorrect) {
      score = 70
      feedbackMessage = `✓ Classificação correta (${correctClassification}), mas revise o cálculo do IMC.`
    } else if (bmiAccuracy <= 0.5) {
      score = 60
      feedbackMessage = `⚠️ IMC correto, mas classificação incorreta. A classificação correta é: ${correctClassification}.`
    } else {
      score = 30
      feedbackMessage = `❌ IMC e classificação incorretos. IMC correto: ${correctBMI} kg/m², Classificação: ${correctClassification}.`
    }

    setAttempts(prev => prev + 1)
    setIsCompleted(true)
    setFeedback(feedbackMessage)
    onComplete(score, feedbackMessage)
  }, [calculatedBMI, selectedClassification, correctBMI, correctClassification, onComplete])

  const handleReset = () => {
    setWeightInput('')
    setHeightInput('')
    setCalculatedBMI(null)
    setSelectedClassification('')
    setFeedback('')
    setIsCompleted(false)
  }

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-emerald-800">Nome:</span>
              <div className="text-emerald-700">{patientData.name}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Idade:</span>
              <div className="text-emerald-700">{patientData.age} anos</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Região:</span>
              <div className="text-emerald-700">{patientData.region}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Tentativa:</span>
              <div className="text-emerald-700">{attempts + 1}/{maxAttempts}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Calculator */}
      <Card className="border-blue-200">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-blue-900 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Calculadora de IMC Interativa
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Scale className="w-4 h-4 mr-2 text-blue-600" />
                  Peso (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="200"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Ex: 65.2"
                    disabled={isCompleted}
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-sm">kg</div>
                </div>
                {showHints && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 Dica: O peso real é {patientData.weight} kg
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  <Ruler className="w-4 h-4 mr-2 text-blue-600" />
                  Altura (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="250"
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="Ex: 162.0"
                    disabled={isCompleted}
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-sm">cm</div>
                </div>
                {showHints && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                    💡 Dica: A altura real é {patientData.height} cm
                  </div>
                )}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="text-center">
              <Button
                onClick={handleCalculate}
                disabled={!weightInput || !heightInput || isCompleted}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcular IMC
              </Button>
            </div>

            {/* BMI Result */}
            {calculatedBMI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-4 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  IMC = {calculatedBMI} kg/m²
                </div>
                <div className="text-sm text-gray-600">
                  Fórmula: {weightInput} ÷ ({heightInput}/100)² = {calculatedBMI}
                </div>
              </motion.div>
            )}

            {/* Classification Selection */}
            {calculatedBMI && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Selecione a classificação nutricional:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {classifications.map((classification) => (
                    <button
                      key={classification}
                      onClick={() => setSelectedClassification(classification)}
                      disabled={isCompleted}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedClassification === classification
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                      } ${isCompleted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="font-medium text-sm">{classification}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {classification === 'Baixo peso' && '< 18,5'}
                        {classification === 'Eutrófico' && '18,5 - 24,9'}
                        {classification === 'Sobrepeso' && '25,0 - 29,9'}
                        {classification === 'Obesidade' && '≥ 30,0'}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowHints(!showHints)}
                  disabled={isCompleted}
                  className="text-blue-600 border-blue-300"
                >
                  <Info className="w-4 h-4 mr-2" />
                  {showHints ? 'Ocultar' : 'Mostrar'} Dicas
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isCompleted}
                  className="text-gray-600 border-gray-300"
                >
                  Reiniciar
                </Button>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!calculatedBMI || !selectedClassification || isCompleted}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Resposta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <div className="mt-3 p-3 bg-white rounded border">
                    <h4 className="font-semibold text-gray-900 mb-2">Explicação Educacional:</h4>
                    <p className="text-sm text-gray-700">
                      O IMC é calculado dividindo o peso (kg) pela altura ao quadrado (m²). 
                      Para {patientData.name}: {patientData.weight} ÷ ({patientData.height/100})² = {correctBMI} kg/m².
                      Esta classificação ({correctClassification}) é baseada nos critérios da OMS para adultos.
                    </p>
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
