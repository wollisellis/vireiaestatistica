// Sistema Unificado de Pontuação - AvaliaNutri
// Unifica pontuação de jogos e módulos em um único sistema consistente

import { db } from '@/lib/firebase'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore'
import { AdvancedScoringSystem } from '@/lib/scoringSystem'
import { ModuleProgressSystem } from '@/lib/moduleProgressSystem'

export interface UnifiedScore {
  studentId: string
  totalScore: number
  normalizedScore: number // 0-100
  moduleScores: Record<string, number>
  gameScores: Record<string, number>
  exerciseScores?: Record<string, number> // Para exercícios individuais
  achievements: string[]
  lastActivity: Date
  streak: number
  level: number
}

export interface ScoreValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

class UnifiedScoringService {
  private static instance: UnifiedScoringService
  private cache: Map<string, { data: UnifiedScore, timestamp: number }> = new Map()
  private cacheExpiration = 5 * 60 * 1000 // 5 minutos

  static getInstance(): UnifiedScoringService {
    if (!UnifiedScoringService.instance) {
      UnifiedScoringService.instance = new UnifiedScoringService()
    }
    return UnifiedScoringService.instance
  }

  // Validação robusta de pontuação
  validateScore(score: Partial<UnifiedScore>): ScoreValidation {
    const errors: string[] = []
    const warnings: string[] = []

    // Validações críticas
    if (score.totalScore !== undefined && score.totalScore < 0) {
      errors.push('Pontuação total não pode ser negativa')
    }

    if (score.normalizedScore !== undefined) {
      if (score.normalizedScore < 0 || score.normalizedScore > 100) {
        errors.push('Pontuação normalizada deve estar entre 0 e 100')
      }
    }

    // Validar pontuações de módulos
    if (score.moduleScores) {
      Object.entries(score.moduleScores).forEach(([module, moduleScore]) => {
        if (moduleScore < 0) {
          errors.push(`Pontuação do módulo ${module} não pode ser negativa`)
        }
        if (moduleScore > 100) {
          warnings.push(`Pontuação do módulo ${module} excede 100`)
        }
      })
    }

    // Validar nível e streak
    if (score.level !== undefined && score.level < 1) {
      errors.push('Nível deve ser pelo menos 1')
    }

    if (score.streak !== undefined && score.streak < 0) {
      errors.push('Sequência não pode ser negativa')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Buscar pontuação com cache
  async getUnifiedScore(studentId: string): Promise<UnifiedScore | null> {
    // Verificar cache primeiro
    const cached = this.cache.get(studentId)
    if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
      return cached.data
    }

    try {
      const scoreDoc = await getDoc(doc(db, 'unified_scores', studentId))
      
      if (!scoreDoc.exists()) {
        return null
      }

      const score = scoreDoc.data() as UnifiedScore
      
      // Atualizar cache
      this.cache.set(studentId, {
        data: score,
        timestamp: Date.now()
      })

      return score
    } catch (error) {
      console.error('Erro ao buscar pontuação unificada:', error)
      return null
    }
  }

  // Atualizar pontuação de exercício individual
  async updateExerciseScore(
    studentId: string,
    moduleId: string,
    exerciseId: string,
    score: number,
    maxScore: number
  ): Promise<boolean> {
    try {
      // Criar um ID único para o exercício
      const exerciseKey = `${moduleId}_${exerciseId}`
      
      // Calcular pontuação normalizada (0-100)
      const normalizedScore = Math.round((score / maxScore) * 100)
      
      const currentScore = await this.getUnifiedScore(studentId) || this.createEmptyScore(studentId)
      
      // Atualizar pontuação do exercício específico
      if (!currentScore.exerciseScores) {
        currentScore.exerciseScores = {}
      }
      currentScore.exerciseScores[exerciseKey] = normalizedScore
      
      // Recalcular pontuação do módulo baseada nos exercícios concluídos
      const moduleExercises = Object.keys(currentScore.exerciseScores)
        .filter(key => key.startsWith(`${moduleId}_`))
      
      if (moduleExercises.length > 0) {
        const moduleAverage = moduleExercises
          .reduce((sum, key) => sum + currentScore.exerciseScores[key], 0) / moduleExercises.length
        currentScore.moduleScores[moduleId] = Math.round(moduleAverage)
      }
      
      // Recalcular totais
      currentScore.totalScore = this.calculateTotalScore(currentScore)
      currentScore.normalizedScore = this.calculateNormalizedScore(currentScore)
      currentScore.level = this.calculateLevel(currentScore.totalScore)
      
      // Salvar no Firebase
      await setDoc(doc(db, 'unified_scores', studentId), {
        ...currentScore,
        lastActivity: serverTimestamp()
      })
      
      // Limpar cache
      this.cache.delete(studentId)
      
      console.log(`Exercício ${exerciseId} salvo:`, { score, normalizedScore, moduleAverage: currentScore.moduleScores[moduleId] })
      return true
      
    } catch (error) {
      console.error('Erro ao salvar exercício:', error)
      return false
    }
  }

  // Atualizar pontuação de módulo
  async updateModuleScore(
    studentId: string, 
    moduleId: string, 
    exerciseScore: number,
    metadata?: {
      timeSpent?: number
      hintsUsed?: number
      attempts?: number
    }
  ): Promise<boolean> {
    try {
      // Validar entrada
      const validation = this.validateScore({
        moduleScores: { [moduleId]: exerciseScore }
      })

      if (!validation.isValid) {
        console.error('Validação falhou:', validation.errors)
        return false
      }

      // Buscar pontuação atual
      const currentScore = await this.getUnifiedScore(studentId) || this.createEmptyScore(studentId)

      // Calcular nova pontuação do módulo
      const moduleProgress = ModuleProgressSystem.calculateModuleProgress(
        moduleId,
        exerciseScore,
        metadata
      )

      // Atualizar pontuações
      currentScore.moduleScores[moduleId] = moduleProgress.normalizedScore
      currentScore.totalScore = this.calculateTotalScore(currentScore)
      currentScore.normalizedScore = this.calculateNormalizedScore(currentScore)
      currentScore.lastActivity = new Date()

      // Verificar conquistas
      const newAchievements = this.checkAchievements(currentScore)
      currentScore.achievements = [...new Set([...currentScore.achievements, ...newAchievements])]

      // Salvar no Firebase com batch para atomicidade
      const batch = writeBatch(db)

      // Atualizar pontuação unificada
      batch.set(doc(db, 'unified_scores', studentId), {
        ...currentScore,
        lastActivity: serverTimestamp()
      })

      // Atualizar progresso do módulo
      batch.set(doc(db, 'module_progress', studentId, 'modules', moduleId), {
        ...moduleProgress,
        updatedAt: serverTimestamp()
      })

      await batch.commit()

      // Limpar cache
      this.cache.delete(studentId)

      // Notificar mudanças
      this.notifyScoreUpdate(studentId, currentScore)

      return true
    } catch (error) {
      console.error('Erro ao atualizar pontuação do módulo:', error)
      return false
    }
  }

  // Atualizar pontuação de jogo
  async updateGameScore(
    studentId: string,
    gameId: string,
    score: number,
    metadata?: {
      timeSpent?: number
      accuracy?: number
      streak?: number
    }
  ): Promise<boolean> {
    try {
      const validation = this.validateScore({
        gameScores: { [gameId]: score }
      })

      if (!validation.isValid) {
        console.error('Validação falhou:', validation.errors)
        return false
      }

      const currentScore = await this.getUnifiedScore(studentId) || this.createEmptyScore(studentId)

      // Aplicar sistema de pontuação avançado
      const advancedScore = AdvancedScoringSystem.calculateScore({
        baseScore: score,
        timeSpent: metadata?.timeSpent || 0,
        accuracy: metadata?.accuracy || 0,
        streak: metadata?.streak || 0
      })

      // Atualizar pontuações
      currentScore.gameScores[gameId] = advancedScore.totalScore
      currentScore.totalScore = this.calculateTotalScore(currentScore)
      currentScore.normalizedScore = this.calculateNormalizedScore(currentScore)
      currentScore.streak = metadata?.streak || currentScore.streak

      // Atualizar nível
      currentScore.level = this.calculateLevel(currentScore.totalScore)

      // Salvar
      await setDoc(doc(db, 'unified_scores', studentId), {
        ...currentScore,
        lastActivity: serverTimestamp()
      })

      // Limpar cache
      this.cache.delete(studentId)

      return true
    } catch (error) {
      console.error('Erro ao atualizar pontuação do jogo:', error)
      return false
    }
  }

  // Calcular pontuação total
  private calculateTotalScore(score: UnifiedScore): number {
    const moduleTotal = Object.values(score.moduleScores).reduce((sum, s) => sum + s, 0)
    const gameTotal = Object.values(score.gameScores).reduce((sum, s) => sum + s, 0)
    
    // Peso: 70% módulos, 30% jogos
    return Math.round(moduleTotal * 0.7 + gameTotal * 0.3)
  }

  // Calcular pontuação normalizada (0-100)
  private calculateNormalizedScore(score: UnifiedScore): number {
    const maxPossibleScore = this.getMaxPossibleScore()
    return Math.min(100, Math.round((score.totalScore / maxPossibleScore) * 100))
  }

  // Calcular nível baseado na pontuação
  private calculateLevel(totalScore: number): number {
    const levelThresholds = [0, 1000, 2500, 5000, 10000, 20000, 50000, 100000]
    return levelThresholds.findIndex(threshold => totalScore < threshold) || levelThresholds.length
  }

  // Verificar novas conquistas
  private checkAchievements(score: UnifiedScore): string[] {
    const newAchievements: string[] = []

    // Conquistas por nível
    if (score.level >= 5 && !score.achievements.includes('level_5')) {
      newAchievements.push('level_5')
    }

    // Conquistas por módulos completos
    const completedModules = Object.values(score.moduleScores).filter(s => s >= 80).length
    if (completedModules >= 3 && !score.achievements.includes('module_master_3')) {
      newAchievements.push('module_master_3')
    }

    // Conquistas por sequência
    if (score.streak >= 7 && !score.achievements.includes('week_streak')) {
      newAchievements.push('week_streak')
    }

    return newAchievements
  }

  // Criar pontuação vazia
  private createEmptyScore(studentId: string): UnifiedScore {
    return {
      studentId,
      totalScore: 0,
      normalizedScore: 0,
      moduleScores: {},
      gameScores: {},
      achievements: [],
      lastActivity: new Date(),
      streak: 0,
      level: 1
    }
  }

  // Notificar atualização de pontuação
  private notifyScoreUpdate(studentId: string, score: UnifiedScore) {
    // Implementar sistema de notificações em tempo real
    // Por enquanto, apenas log
    console.log(`Pontuação atualizada para ${studentId}:`, score.normalizedScore)
  }

  // Obter pontuação máxima possível
  private getMaxPossibleScore(): number {
    // Calcular baseado em todos os módulos e jogos disponíveis
    return 100000 // Placeholder - calcular dinamicamente
  }

  // Limpar cache
  clearCache() {
    this.cache.clear()
  }
}

export default UnifiedScoringService.getInstance()