'use client'

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Ruler, 
  Scale, 
  Target, 
  CheckCircle, 
  AlertCircle,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react'

interface PatientData {
  name: string
  age: number
  gender: 'M' | 'F'
  weight: number
  height: number
  waist: number
  hip: number
  region: string
}

interface SliderMeasurementExerciseProps {
  patientData: PatientData
  onComplete: (score: number, feedback: string) => void
  maxAttempts: number
}

export function SliderMeasurementExercise({ 
  patientData, 
  onComplete, 
  maxAttempts 
}: SliderMeasurementExerciseProps) {
  const [weightValue, setWeightValue] = useState(70)
  const [heightValue, setHeightValue] = useState(170)
  const [waistValue, setWaistValue] = useState(80)
  const [hipValue, setHipValue] = useState(95)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<string>('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTargetValues, setShowTargetValues] = useState(false)

  const calculateAccuracy = (actual: number, target: number, tolerance: number) => {
    const difference = Math.abs(actual - target)
    if (difference <= tolerance) return 100
    if (difference <= tolerance * 2) return 80
    if (difference <= tolerance * 3) return 60
    if (difference <= tolerance * 5) return 40
    return 20
  }

  const handleSubmit = useCallback(() => {
    const weightAccuracy = calculateAccuracy(weightValue, patientData.weight, 2)
    const heightAccuracy = calculateAccuracy(heightValue, patientData.height, 3)
    const waistAccuracy = calculateAccuracy(waistValue, patientData.waist, 3)
    const hipAccuracy = calculateAccuracy(hipValue, patientData.hip, 3)

    const averageAccuracy = (weightAccuracy + heightAccuracy + waistAccuracy + hipAccuracy) / 4
    const score = Math.round(averageAccuracy)

    let feedbackMessage = ''
    const differences = {
      weight: Math.abs(weightValue - patientData.weight),
      height: Math.abs(heightValue - patientData.height),
      waist: Math.abs(waistValue - patientData.waist),
      hip: Math.abs(hipValue - patientData.hip)
    }

    if (score >= 90) {
      feedbackMessage = `🏆 Excelente precisão! Todas as medições estão muito próximas dos valores reais. Você demonstra excelente habilidade de estimativa antropométrica.`
    } else if (score >= 80) {
      feedbackMessage = `✅ Muito bom! A maioria das medições está próxima dos valores reais. Pequenos ajustes melhorariam ainda mais a precisão.`
    } else if (score >= 70) {
      feedbackMessage = `✓ Bom trabalho! Algumas medições estão próximas, mas outras precisam de ajuste. Continue praticando a estimativa visual.`
    } else if (score >= 60) {
      feedbackMessage = `⚠️ Desempenho regular. Várias medições estão distantes dos valores reais. Revise as técnicas de estimativa antropométrica.`
    } else {
      feedbackMessage = `📚 É necessário melhorar a precisão. A estimativa visual de medidas antropométricas requer prática e conhecimento dos padrões populacionais.`
    }

    // Add specific feedback for each measurement
    feedbackMessage += `\n\nDetalhes das medições:`
    feedbackMessage += `\n• Peso: ${weightValue}kg (real: ${patientData.weight}kg, diferença: ${differences.weight.toFixed(1)}kg)`
    feedbackMessage += `\n• Altura: ${heightValue}cm (real: ${patientData.height}cm, diferença: ${differences.height.toFixed(1)}cm)`
    feedbackMessage += `\n• Cintura: ${waistValue}cm (real: ${patientData.waist}cm, diferença: ${differences.waist.toFixed(1)}cm)`
    feedbackMessage += `\n• Quadril: ${hipValue}cm (real: ${patientData.hip}cm, diferença: ${differences.hip.toFixed(1)}cm)`

    setAttempts(prev => prev + 1)
    setIsCompleted(true)
    setFeedback(feedbackMessage)
    onComplete(score, feedbackMessage)
  }, [weightValue, heightValue, waistValue, hipValue, patientData, onComplete])

  const handleReset = () => {
    setWeightValue(70)
    setHeightValue(170)
    setWaistValue(80)
    setHipValue(95)
    setFeedback('')
    setIsCompleted(false)
    setShowTargetValues(false)
  }

  const getSliderColor = (current: number, target: number, tolerance: number) => {
    const difference = Math.abs(current - target)
    if (difference <= tolerance) return 'slider-green'
    if (difference <= tolerance * 2) return 'slider-yellow'
    return 'slider-red'
  }

  const getSliderStyle = (current: number, target: number, tolerance: number) => {
    const difference = Math.abs(current - target)
    if (difference <= tolerance) return { accentColor: '#10b981' } // green-500
    if (difference <= tolerance * 2) return { accentColor: '#f59e0b' } // amber-500
    return { accentColor: '#ef4444' } // red-500
  }

  return (
    <div className="space-y-6">
      {/* Patient Information */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-emerald-900 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Estimativa de Medidas Antropométricas
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-emerald-800">Paciente:</span>
              <div className="text-emerald-700">{patientData.name}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Idade:</span>
              <div className="text-emerald-700">{patientData.age} anos</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Sexo:</span>
              <div className="text-emerald-700">{patientData.gender === 'M' ? 'Masculino' : 'Feminino'}</div>
            </div>
            <div>
              <span className="font-medium text-emerald-800">Região:</span>
              <div className="text-emerald-700">{patientData.region}</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-emerald-100 rounded">
            <p className="text-sm text-emerald-800">
              <strong>Instruções:</strong> Use os controles deslizantes para estimar as medidas antropométricas deste paciente. 
              Considere idade, sexo e região para fazer estimativas precisas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Sliders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weight Slider */}
        <Card className="border-blue-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-blue-900 flex items-center">
              <Scale className="w-5 h-5 mr-2" />
              Peso Corporal
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{weightValue} kg</div>
                {showTargetValues && (
                  <div className="text-sm text-blue-600">Valor real: {patientData.weight} kg</div>
                )}
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="40"
                  max="120"
                  step="0.5"
                  value={weightValue}
                  onChange={(e) => setWeightValue(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={getSliderStyle(weightValue, patientData.weight, 2)}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>40 kg</span>
                  <span>120 kg</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Height Slider */}
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-green-900 flex items-center">
              <Ruler className="w-5 h-5 mr-2" />
              Altura
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-900">{heightValue} cm</div>
                {showTargetValues && (
                  <div className="text-sm text-green-600">Valor real: {patientData.height} cm</div>
                )}
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="140"
                  max="200"
                  step="0.5"
                  value={heightValue}
                  onChange={(e) => setHeightValue(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={getSliderStyle(heightValue, patientData.height, 3)}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>140 cm</span>
                  <span>200 cm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waist Slider */}
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Circunferência da Cintura
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-900">{waistValue} cm</div>
                {showTargetValues && (
                  <div className="text-sm text-yellow-600">Valor real: {patientData.waist} cm</div>
                )}
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="60"
                  max="130"
                  step="0.5"
                  value={waistValue}
                  onChange={(e) => setWaistValue(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={getSliderStyle(waistValue, patientData.waist, 3)}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>60 cm</span>
                  <span>130 cm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hip Slider */}
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-purple-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Circunferência do Quadril
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-900">{hipValue} cm</div>
                {showTargetValues && (
                  <div className="text-sm text-purple-600">Valor real: {patientData.hip} cm</div>
                )}
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="70"
                  max="140"
                  step="0.5"
                  value={hipValue}
                  onChange={(e) => setHipValue(Number(e.target.value))}
                  disabled={isCompleted}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={getSliderStyle(hipValue, patientData.hip, 3)}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>70 cm</span>
                  <span>140 cm</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculated Indicators */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold text-emerald-900">Indicadores Calculados</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white rounded">
              <div className="font-medium text-gray-700">IMC</div>
              <div className="text-xl font-bold text-emerald-600">
                {(weightValue / Math.pow(heightValue / 100, 2)).toFixed(1)} kg/m²
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-medium text-gray-700">RCQ</div>
              <div className="text-xl font-bold text-emerald-600">
                {(waistValue / hipValue).toFixed(2)}
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded">
              <div className="font-medium text-gray-700">CC</div>
              <div className="text-xl font-bold text-emerald-600">
                {waistValue} cm
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowTargetValues(!showTargetValues)}
            disabled={isCompleted}
            className="text-blue-600 border-blue-300"
          >
            {showTargetValues ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showTargetValues ? 'Ocultar' : 'Mostrar'} Valores Reais
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

        <div className="text-right text-sm text-gray-600 mr-4">
          Tentativa {attempts + 1}/{maxAttempts}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isCompleted}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar Estimativas
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
                    <h4 className="font-semibold text-gray-900 mb-2">Dicas para Estimativa Antropométrica:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Considere a idade: adultos jovens tendem a ter medidas diferentes de idosos</li>
                      <li>• Observe o sexo: homens geralmente têm maior massa muscular e altura</li>
                      <li>• Região geográfica pode influenciar padrões antropométricos</li>
                      <li>• A relação entre peso e altura deve ser proporcional</li>
                      <li>• Circunferências variam com a distribuição de gordura corporal</li>
                    </ul>
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
