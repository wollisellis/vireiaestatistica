'use client'

import { useState, useCallback } from 'react'
import unifiedScoringService from '@/services/unifiedScoringService'
import { QuestionMetrics } from '@/lib/scoringSystem'
import { StudentModuleProgress, ModuleProgress, ExerciseProgress } from '@/lib/moduleProgressSystem'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

/**
 * Hook para integração com o sistema unificado de pontuação
 * Fornece uma interface compatível com ModuleProgressContext
 * mas usa unifiedScoringService como fonte de verdade
 */
export function useUnifiedProgress() {
  const { user } = useFirebaseAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Carrega progresso unificado e converte para formato StudentModuleProgress
   */
  const loadUnifiedProgress = useCallback(async (studentId: string): Promise<StudentModuleProgress | null> => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('[useUnifiedProgress] 🔄 Carregando progresso unificado para', studentId)
      
      // Buscar dados do sistema unificado
      const unifiedScore = await unifiedScoringService.getUnifiedScore(studentId)
      
      if (!unifiedScore) {
        console.log('[useUnifiedProgress] ⚠️ Nenhum progresso encontrado')
        return null
      }

      // Converter formato unificado para StudentModuleProgress
      const studentProgress: StudentModuleProgress = {
        studentId: unifiedScore.userId,
        studentName: unifiedScore.userName || 'Estudante',
        modules: Object.entries(unifiedScore.moduleScores).map(([moduleId, score]) => {
          // Buscar dados detalhados do módulo
          const moduleData = unifiedScore.moduleProgress?.[moduleId]
          const exercises = moduleData?.exercises || []

          return {
            moduleId,
            moduleName: moduleData?.title || moduleId,
            isUnlocked: true, // TODO: Implementar lógica de desbloqueio
            isCompleted: score >= 70,
            totalScore: score,
            maxPossibleScore: 100,
            normalizedScore: score,
            completionPercentage: moduleData?.completionPercentage || 0,
            exercises: exercises.map((ex: any) => ({
              exerciseId: ex.id,
              completed: ex.completed || false,
              score: ex.score || 0,
              maxScore: ex.maxScore || 100,
              normalizedScore: ex.normalizedScore || ex.score || 0,
              attempts: ex.attempts || 0,
              timeSpent: ex.timeSpent || 0,
              lastAttemptAt: ex.lastAttemptAt || new Date(),
              bestScore: ex.bestScore || ex.score || 0,
              improvement: 0,
              completedAt: ex.completedAt
            })),
            timeSpent: moduleData?.timeSpent || 0,
            lastActivityAt: moduleData?.lastActivity || new Date(),
            streakDays: 0,
            perfectExercises: exercises.filter((ex: any) => ex.score === ex.maxScore).length,
            averageAttempts: moduleData?.averageAttempts || 1
          } as ModuleProgress
        }),
        totalNormalizedScore: unifiedScore.totalScore,
        overallProgress: unifiedScore.completionRate,
        currentStreak: unifiedScore.achievements?.currentStreak || 0,
        longestStreak: unifiedScore.achievements?.longestStreak || 0,
        totalTimeSpent: Object.values(unifiedScore.moduleProgress || {})
          .reduce((sum: number, mod: any) => sum + (mod.timeSpent || 0), 0),
        lastActivity: unifiedScore.lastActivity || new Date(),
        achievementLevel: unifiedScore.achievements?.level || 'Iniciante',
        isActive: true,
        ranking: {
          position: unifiedScore.classRank || 0,
          category: 'Geral',
          percentile: 0
        }
      }

      console.log('[useUnifiedProgress] ✅ Progresso carregado:', studentProgress)
      return studentProgress

    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao carregar progresso:', err)
      setError('Erro ao carregar progresso unificado')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Salva pontuação de exercício no sistema unificado
   */
  const saveExerciseScore = useCallback(async (
    studentId: string,
    moduleId: string,
    exerciseId: string,
    questionMetrics: QuestionMetrics[],
    timeSpent: number
  ): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('[useUnifiedProgress] 💾 Salvando pontuação:', {
        studentId,
        moduleId,
        exerciseId,
        metrics: questionMetrics.length,
        timeSpent
      })

      // Salvar no sistema unificado
      await unifiedScoringService.saveExerciseScore(
        studentId,
        moduleId,
        exerciseId,
        questionMetrics,
        timeSpent
      )

      console.log('[useUnifiedProgress] ✅ Pontuação salva com sucesso')

    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao salvar pontuação:', err)
      setError('Erro ao salvar pontuação do exercício')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Completa um módulo no sistema unificado
   */
  const completeModule = useCallback(async (
    studentId: string,
    moduleId: string
  ): Promise<void> => {
    try {
      console.log('[useUnifiedProgress] 🎯 Completando módulo:', moduleId)
      
      // O sistema unificado marca automaticamente como completo
      // quando a pontuação >= 70%, então só precisamos sincronizar
      await unifiedScoringService.syncAllSystems(studentId)
      
      console.log('[useUnifiedProgress] ✅ Módulo completado')
    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao completar módulo:', err)
      throw err
    }
  }, [])

  /**
   * Verifica se um módulo está completo
   */
  const isModuleCompleted = useCallback(async (
    studentId: string,
    moduleId: string
  ): Promise<boolean> => {
    try {
      const completed = await unifiedScoringService.isModuleCompleted(studentId, moduleId)
      return completed
    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao verificar módulo:', err)
      return false
    }
  }, [])

  /**
   * Obtém módulos completados
   */
  const getCompletedModules = useCallback(async (
    studentId: string
  ): Promise<string[]> => {
    try {
      const completed = await unifiedScoringService.getCompletedModules(studentId)
      return completed
    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao obter módulos completados:', err)
      return []
    }
  }, [])

  /**
   * Sincroniza todos os sistemas
   */
  const syncAllSystems = useCallback(async (studentId: string): Promise<void> => {
    try {
      console.log('[useUnifiedProgress] 🔄 Sincronizando todos os sistemas')
      await unifiedScoringService.syncAllSystems(studentId)
      console.log('[useUnifiedProgress] ✅ Sincronização completa')
    } catch (err) {
      console.error('[useUnifiedProgress] ❌ Erro ao sincronizar:', err)
      throw err
    }
  }, [])

  return {
    isLoading,
    error,
    loadUnifiedProgress,
    saveExerciseScore,
    completeModule,
    isModuleCompleted,
    getCompletedModules,
    syncAllSystems
  }
}