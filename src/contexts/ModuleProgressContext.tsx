'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  ModuleProgressSystem, 
  StudentModuleProgress, 
  ModuleProgress, 
  ExerciseProgress 
} from '@/lib/moduleProgressSystem'
import ModuleProgressService from '@/services/moduleProgressService'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { AdvancedScoringSystem, QuestionMetrics } from '@/lib/scoringSystem'
import { modules } from '@/data/modules'

interface ModuleProgressContextType {
  // Estado principal
  studentProgress: StudentModuleProgress | null
  isLoading: boolean
  error: string | null

  // Ações de progresso
  completeExercise: (
    moduleId: string,
    exerciseId: string,
    questionMetrics: QuestionMetrics[],
    timeSpent: number
  ) => Promise<void>
  
  updateExerciseProgress: (
    moduleId: string,
    exerciseId: string,
    progress: Partial<ExerciseProgress>
  ) => Promise<void>
  
  completeModule: (moduleId: string) => Promise<void>
  unlockNextModule: (currentModuleId: string) => Promise<string | null>
  
  // Consultas
  getModuleProgress: (moduleId: string) => ModuleProgress | null
  getExerciseProgress: (moduleId: string, exerciseId: string) => ExerciseProgress | null
  canAccessModule: (moduleId: string) => boolean
  getProgressReport: () => ReturnType<typeof ModuleProgressSystem.generateProgressReport>
  
  // Ranking e comparações
  getStudentRanking: () => Promise<StudentModuleProgress[]>
  updateRanking: () => Promise<void>
  
  // Conquistas e notificações
  newAchievements: string[]
  clearNewAchievements: () => void
  
  // Utilitários
  refreshProgress: () => Promise<void>
  syncOfflineProgress: () => Promise<void>
}

const ModuleProgressContext = createContext<ModuleProgressContextType | undefined>(undefined)

// Estados de progresso inicial
const createInitialProgress = (studentId: string, studentName: string): StudentModuleProgress => {
  const initialModules: ModuleProgress[] = modules.map((module, index) => ({
    moduleId: module.id,
    moduleName: module.title,
    isUnlocked: index === 0, // Apenas o primeiro módulo desbloqueado
    isCompleted: false,
    totalScore: 0,
    maxPossibleScore: module.exercises.reduce((sum, ex) => sum + ex.points, 0),
    normalizedScore: 0,
    completionPercentage: 0,
    exercises: module.exercises.map(exercise => ({
      exerciseId: exercise.id,
      completed: false,
      score: 0,
      maxScore: exercise.points,
      normalizedScore: 0,
      attempts: 0,
      timeSpent: 0,
      lastAttemptAt: new Date(),
      bestScore: 0,
      improvement: 0
    })),
    timeSpent: 0,
    lastActivityAt: new Date(),
    streakDays: 0,
    perfectExercises: 0,
    averageAttempts: 0
  }))

  return {
    studentId,
    studentName,
    modules: initialModules,
    totalNormalizedScore: 0,
    overallProgress: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    lastActivity: new Date(),
    achievementLevel: 'Iniciante',
    isActive: true,
    ranking: {
      position: 0,
      category: 'Geral',
      percentile: 0
    }
  }
}

export function ModuleProgressProvider({ children }: { children: React.ReactNode }) {
  const [studentProgress, setStudentProgress] = useState<StudentModuleProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const { user } = useFirebaseAuth()

  // Carregar progresso ao inicializar
  useEffect(() => {
    if (user?.uid) {
      loadStudentProgress()
    } else {
      // Modo convidado - criar progresso demo
      const demoProgress = createDemoProgress()
      setStudentProgress(demoProgress)
      setIsLoading(false)
    }
  }, [user])

  // Carregar progresso do Firebase
  const loadStudentProgress = async () => {
    if (!user?.uid) return

    try {
      setIsLoading(true)
      setError(null)

      let progress = await ModuleProgressService.loadStudentProgress(user.uid)
      
      if (!progress) {
        // Criar novo progresso se não existe
        progress = createInitialProgress(user.uid, user.displayName || 'Estudante')
        await ModuleProgressService.saveStudentProgress(progress)
      }

      setStudentProgress(progress)
    } catch (err) {
      console.error('Erro ao carregar progresso:', err)
      setError('Erro ao carregar progresso do estudante')
      
      // Fallback para progresso inicial
      const fallbackProgress = createInitialProgress(user.uid, user.displayName || 'Estudante')
      setStudentProgress(fallbackProgress)
    } finally {
      setIsLoading(false)
    }
  }

  // Criar progresso demo para modo convidado
  const createDemoProgress = (): StudentModuleProgress => {
    const demoProgress = createInitialProgress('demo-user', 'Usuário Demo')
    
    // Simular progresso no primeiro módulo
    const firstModule = demoProgress.modules[0]
    firstModule.exercises[0].completed = true
    firstModule.exercises[0].score = 85
    firstModule.exercises[0].normalizedScore = 85
    firstModule.exercises[0].attempts = 1
    firstModule.exercises[0].timeSpent = 300
    firstModule.exercises[0].completedAt = new Date()
    
    // Recalcular progresso do módulo
    const moduleProgress = ModuleProgressSystem.calculateModuleProgress(
      firstModule.moduleId,
      firstModule.exercises
    )
    
    demoProgress.modules[0] = moduleProgress
    demoProgress.totalNormalizedScore = moduleProgress.normalizedScore
    demoProgress.overallProgress = 25 // 1 de 4 módulos
    
    return demoProgress
  }

  // Completar exercício
  const completeExercise = async (
    moduleId: string,
    exerciseId: string,
    questionMetrics: QuestionMetrics[],
    timeSpent: number
  ): Promise<void> => {
    if (!studentProgress) return

    try {
      // Encontrar progresso atual do exercício
      const currentModule = studentProgress.modules.find(m => m.moduleId === moduleId)
      const currentExercise = currentModule?.exercises.find(e => e.exerciseId === exerciseId)

      // Calcular novo progresso do exercício
      const newExerciseProgress = ModuleProgressSystem.calculateExerciseProgress(
        exerciseId,
        questionMetrics,
        timeSpent,
        currentExercise
      )

      // Atualizar lista de exercícios do módulo
      const updatedExercises = currentModule!.exercises.map(exercise =>
        exercise.exerciseId === exerciseId ? newExerciseProgress : exercise
      )

      // Recalcular progresso do módulo
      const updatedModuleProgress = ModuleProgressSystem.calculateModuleProgress(
        moduleId,
        updatedExercises,
        currentModule
      )

      // Atualizar lista de módulos
      const updatedModules = studentProgress.modules.map(module =>
        module.moduleId === moduleId ? updatedModuleProgress : module
      )

      // Recalcular progresso geral do estudante
      const updatedStudentProgress = ModuleProgressSystem.calculateStudentProgress(
        studentProgress.studentId,
        studentProgress.studentName,
        updatedModules
      )

      // Salvar no Firebase
      if (user?.uid && user.uid !== 'demo-user') {
        await ModuleProgressService.updateExerciseProgress(
          studentProgress.studentId,
          moduleId,
          newExerciseProgress
        )
        await ModuleProgressService.saveStudentProgress(updatedStudentProgress)
      }

      // Atualizar estado local
      setStudentProgress(updatedStudentProgress)

      // Verificar se módulo foi completado e desbloquear próximo
      if (updatedModuleProgress.isCompleted && !currentModule?.isCompleted) {
        await completeModule(moduleId)
      }

      // Verificar conquistas
      checkAchievements(updatedStudentProgress, newExerciseProgress)

    } catch (err) {
      console.error('Erro ao completar exercício:', err)
      setError('Erro ao salvar progresso do exercício')
    }
  }

  // Atualizar progresso de exercício (parcial)
  const updateExerciseProgress = async (
    moduleId: string,
    exerciseId: string,
    progress: Partial<ExerciseProgress>
  ): Promise<void> => {
    if (!studentProgress) return

    const updatedModules = studentProgress.modules.map(module => {
      if (module.moduleId === moduleId) {
        const updatedExercises = module.exercises.map(exercise => {
          if (exercise.exerciseId === exerciseId) {
            return { ...exercise, ...progress }
          }
          return exercise
        })
        return { ...module, exercises: updatedExercises }
      }
      return module
    })

    const updatedProgress = { ...studentProgress, modules: updatedModules }
    setStudentProgress(updatedProgress)

    // Salvar no Firebase se não for demo
    if (user?.uid && user.uid !== 'demo-user') {
      await ModuleProgressService.saveStudentProgress(updatedProgress)
    }
  }

  // Completar módulo
  const completeModule = async (moduleId: string): Promise<void> => {
    if (!studentProgress || !user?.uid) return

    try {
      // Marcar módulo como concluído no Firebase
      if (user.uid !== 'demo-user') {
        await ModuleProgressService.completeModule(studentProgress.studentId, moduleId)
      }

      // Desbloquear próximo módulo
      const nextModuleId = await unlockNextModule(moduleId)
      
      if (nextModuleId) {
        console.log('Próximo módulo desbloqueado:', nextModuleId)
        setNewAchievements(prev => [...prev, `module_${moduleId}_completed`])
      }

    } catch (err) {
      console.error('Erro ao completar módulo:', err)
      setError('Erro ao completar módulo')
    }
  }

  // Desbloquear próximo módulo
  const unlockNextModule = async (currentModuleId: string): Promise<string | null> => {
    if (!studentProgress) return null

    const nextModuleId = ModuleProgressSystem.unlockNextModule(
      currentModuleId,
      studentProgress.modules
    )

    if (nextModuleId && user?.uid && user.uid !== 'demo-user') {
      await ModuleProgressService.unlockModule(studentProgress.studentId, nextModuleId)
      
      // Atualizar estado local
      const updatedModules = studentProgress.modules.map(module => 
        module.moduleId === nextModuleId 
          ? { ...module, isUnlocked: true }
          : module
      )
      
      setStudentProgress(prev => prev ? { ...prev, modules: updatedModules } : null)
    }

    return nextModuleId
  }

  // Obter progresso de módulo específico
  const getModuleProgress = (moduleId: string): ModuleProgress | null => {
    return studentProgress?.modules.find(m => m.moduleId === moduleId) || null
  }

  // Obter progresso de exercício específico
  const getExerciseProgress = (moduleId: string, exerciseId: string): ExerciseProgress | null => {
    const module = getModuleProgress(moduleId)
    return module?.exercises.find(e => e.exerciseId === exerciseId) || null
  }

  // Verificar se pode acessar módulo
  const canAccessModule = (moduleId: string): boolean => {
    if (!studentProgress) return false
    return ModuleProgressSystem.canAccessModule(moduleId, studentProgress.modules)
  }

  // Gerar relatório de progresso
  const getProgressReport = () => {
    if (!studentProgress) {
      return {
        summary: 'Nenhum progresso carregado',
        recommendations: [],
        nextSteps: [],
        achievements: []
      }
    }
    return ModuleProgressSystem.generateProgressReport(studentProgress)
  }

  // Obter ranking dos estudantes
  const getStudentRanking = async (): Promise<StudentModuleProgress[]> => {
    try {
      return await ModuleProgressService.getRankingByScore(10)
    } catch (err) {
      console.error('Erro ao obter ranking:', err)
      return []
    }
  }

  // Atualizar ranking
  const updateRanking = async (): Promise<void> => {
    // Implementar atualização de ranking se necessário
  }

  // Verificar conquistas
  const checkAchievements = (progress: StudentModuleProgress, exerciseProgress: ExerciseProgress) => {
    const achievements: string[] = []

    // Primeira conclusão de exercício
    if (exerciseProgress.completed && exerciseProgress.attempts === 1) {
      achievements.push('first_exercise_completed')
    }

    // Pontuação perfeita
    if (exerciseProgress.normalizedScore >= 95) {
      achievements.push('perfect_score')
    }

    // Módulo completo
    const module = progress.modules.find(m => 
      m.exercises.some(e => e.exerciseId === exerciseProgress.exerciseId)
    )
    if (module?.isCompleted) {
      achievements.push(`module_${module.moduleId}_completed`)
    }

    // Progresso de 50%
    if (progress.overallProgress >= 50 && !newAchievements.includes('halfway_there')) {
      achievements.push('halfway_there')
    }

    // Todos os módulos completos
    if (progress.overallProgress >= 100) {
      achievements.push('all_modules_completed')
    }

    if (achievements.length > 0) {
      setNewAchievements(prev => [...prev, ...achievements])
    }
  }

  // Limpar conquistas
  const clearNewAchievements = () => {
    setNewAchievements([])
  }

  // Atualizar progresso
  const refreshProgress = async (): Promise<void> => {
    await loadStudentProgress()
  }

  // Sincronizar progresso offline
  const syncOfflineProgress = async (): Promise<void> => {
    if (!studentProgress || !user?.uid || user.uid === 'demo-user') return

    try {
      await ModuleProgressService.saveStudentProgress(studentProgress)
    } catch (err) {
      console.error('Erro na sincronização:', err)
      setError('Erro na sincronização')
    }
  }

  const contextValue: ModuleProgressContextType = {
    studentProgress,
    isLoading,
    error,
    completeExercise,
    updateExerciseProgress,
    completeModule,
    unlockNextModule,
    getModuleProgress,
    getExerciseProgress,
    canAccessModule,
    getProgressReport,
    getStudentRanking,
    updateRanking,
    newAchievements,
    clearNewAchievements,
    refreshProgress,
    syncOfflineProgress
  }

  return (
    <ModuleProgressContext.Provider value={contextValue}>
      {children}
    </ModuleProgressContext.Provider>
  )
}

export function useModuleProgress() {
  const context = useContext(ModuleProgressContext)
  if (context === undefined) {
    throw new Error('useModuleProgress must be used within a ModuleProgressProvider')
  }
  return context
}

// Hook para verificar se módulo está acessível
export function useModuleAccess(moduleId: string) {
  const { canAccessModule, getModuleProgress } = useModuleProgress()
  const moduleProgress = getModuleProgress(moduleId)
  
  return {
    canAccess: canAccessModule(moduleId),
    isUnlocked: moduleProgress?.isUnlocked || false,
    isCompleted: moduleProgress?.isCompleted || false,
    progress: moduleProgress
  }
}

// Hook para obter progresso de exercício
export function useExerciseProgress(moduleId: string, exerciseId: string) {
  const { getExerciseProgress, updateExerciseProgress, completeExercise } = useModuleProgress()
  const exerciseProgress = getExerciseProgress(moduleId, exerciseId)
  
  return {
    progress: exerciseProgress,
    updateProgress: (progress: Partial<ExerciseProgress>) => 
      updateExerciseProgress(moduleId, exerciseId, progress),
    completeExercise: (questionMetrics: QuestionMetrics[], timeSpent: number) =>
      completeExercise(moduleId, exerciseId, questionMetrics, timeSpent)
  }
}