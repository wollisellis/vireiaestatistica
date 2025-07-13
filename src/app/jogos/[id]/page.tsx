'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'
import { useRBAC } from '@/hooks/useRBAC'
import { HintSystem, useHints } from '@/components/ui/HintSystem'
import { getGameHints } from '@/lib/gameHints'
import Link from 'next/link'
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
  const { user, loading } = useRBAC()
  const { markHintViewed, hintStats } = useHints(gameId)

  // Get hints for this game
  const gameHints = getGameHints(gameId)

  const handleBack = () => {
    router.push('/jogos')
  }

  const handleComplete = () => {
    router.push('/jogos')
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Verificando acesso...</h2>
          <p className="text-gray-500 mt-2">Carregando jogo</p>
        </div>
      </div>
    )
  }

  // Show access denied if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para acessar este jogo educacional.
          </p>
          <div className="space-y-3">
            <Link href="/">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Fazer Login
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.push('/jogos')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>
          </div>
        </div>
      </div>
    )
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

      {/* Hint System */}
      {gameHints.length > 0 && (
        <HintSystem
          hints={gameHints}
          gameId={gameId}
          onHintViewed={markHintViewed}
          showInitialHint={true}
          position="bottom"
        />
      )}
    </StudentProgressProvider>
  )
}
