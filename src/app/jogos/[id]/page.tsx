'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'
import {
  NutritionalGame1Anthropometric,
  NutritionalGame2Clinical,
  NutritionalGame3Socioeconomic,
  NutritionalGame4GrowthCurves
} from '@/components/nutritional-games'

export default function NutritionalGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = parseInt(params.id as string)

  const handleBack = () => {
    router.push('/jogos')
  }

  const handleComplete = () => {
    router.push('/jogos')
  }

  const renderGame = () => {
    switch (gameId) {
      case 1:
        return (
          <NutritionalGame1Anthropometric
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )
      case 2:
        return (
          <NutritionalGame2Clinical
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )
      case 3:
        return (
          <NutritionalGame3Socioeconomic
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )
      case 4:
        return (
          <NutritionalGame4GrowthCurves
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )
      default:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Jogo não encontrado</h1>
              <p className="text-gray-600 mb-6">O jogo solicitado não existe ou está em desenvolvimento.</p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Jogos
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <StudentProgressProvider>
      {renderGame()}
    </StudentProgressProvider>
  )
}
