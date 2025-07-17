// Hook para usar o Sistema Unificado de Pontuação

import { useState, useEffect } from 'react'
import { useFirebaseAuth } from './useFirebaseAuth'
import UnifiedScoringService, { UnifiedScore } from '@/services/unifiedScoringService'
import ProgressNotificationService from '@/services/progressNotificationService'

export function useUnifiedScore() {
  const { user } = useFirebaseAuth()
  const [score, setScore] = useState<UnifiedScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    loadScore()
  }, [user])

  const loadScore = async () => {
    if (!user) return

    try {
      setLoading(true)
      const unifiedScore = await UnifiedScoringService.getUnifiedScore(user.uid)
      setScore(unifiedScore)
    } catch (err) {
      console.error('Erro ao carregar pontuação:', err)
      setError('Erro ao carregar pontuação')
    } finally {
      setLoading(false)
    }
  }

  const updateModuleScore = async (
    moduleId: string,
    exerciseScore: number,
    metadata?: any
  ) => {
    if (!user) return false

    try {
      const success = await UnifiedScoringService.updateModuleScore(
        user.uid,
        moduleId,
        exerciseScore,
        metadata
      )

      if (success) {
        // Recarregar pontuação
        await loadScore()

        // Verificar marcos e conquistas
        if (exerciseScore >= 100) {
          await ProgressNotificationService.notifyMilestone(user.uid, {
            type: 'perfect_score',
            title: 'Pontuação Perfeita!',
            description: `Você acertou tudo no módulo ${moduleId}!`,
            value: 100
          })
        }
      }

      return success
    } catch (err) {
      console.error('Erro ao atualizar pontuação:', err)
      return false
    }
  }

  const updateGameScore = async (
    gameId: string,
    gameScore: number,
    metadata?: any
  ) => {
    if (!user) return false

    try {
      const success = await UnifiedScoringService.updateGameScore(
        user.uid,
        gameId,
        gameScore,
        metadata
      )

      if (success) {
        await loadScore()
      }

      return success
    } catch (err) {
      console.error('Erro ao atualizar pontuação do jogo:', err)
      return false
    }
  }

  return {
    score,
    loading,
    error,
    updateModuleScore,
    updateGameScore,
    reload: loadScore
  }
}