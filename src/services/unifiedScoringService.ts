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
  writeBatch,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { AdvancedScoringSystem } from '@/lib/scoringSystem'
import { ModuleProgressSystem } from '@/lib/moduleProgressSystem'

export interface UnifiedScore {
  studentId: string
  userId: string // Alias para compatibilidade
  userName?: string
  totalScore: number
  normalizedScore: number // 0-100
  moduleScores: Record<string, number>
  gameScores: Record<string, number>
  exerciseScores?: Record<string, number> // Para exercícios individuais
  achievements: {
    level?: string
    currentStreak?: number
    longestStreak?: number
  } | string[] // Compatibilidade com ambos formatos
  lastActivity: Date
  streak: number
  level: number
  completionRate?: number
  classRank?: number
  moduleProgress?: Record<string, {
    title?: string
    completionPercentage?: number
    exercises?: any[]
    timeSpent?: number
    lastActivity?: Date
    averageAttempts?: number
  }>
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
      
      // Calcular pontuação normalizada (0-100) - mantendo precisão decimal
      const normalizedScore = (score / maxScore) * 100
      
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
        currentScore.moduleScores[moduleId] = moduleAverage
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
    const moduleScores = Object.values(score.moduleScores)
    const gameScores = Object.values(score.gameScores)

    // Para sistema educacional, usar média das pontuações dos módulos como base
    if (moduleScores.length === 0) return 0

    const moduleAverage = moduleScores.reduce((sum, s) => sum + s, 0) / moduleScores.length
    const gameAverage = gameScores.length > 0 ? gameScores.reduce((sum, s) => sum + s, 0) / gameScores.length : 0

    // Peso: 80% módulos, 20% jogos (priorizar aprendizado) - mantendo precisão
    return moduleAverage * 0.8 + gameAverage * 0.2
  }

  // Calcular pontuação normalizada (0-100)
  private calculateNormalizedScore(score: UnifiedScore): number {
    // Para sistema educacional, usar diretamente a média das pontuações dos módulos
    const moduleScores = Object.values(score.moduleScores)
    if (moduleScores.length === 0) return 0

    // Calcular média das pontuações dos módulos (já estão em escala 0-100)
    const averageModuleScore = moduleScores.reduce((sum, s) => sum + s, 0) / moduleScores.length
    return Math.min(100, Math.max(0, averageModuleScore))
  }

  // Calcular nível baseado na pontuação (escala 0-100)
  private calculateLevel(totalScore: number): number {
    // Níveis educacionais baseados na pontuação 0-100
    if (totalScore >= 95) return 5 // Excelência
    if (totalScore >= 85) return 4 // Muito Bom
    if (totalScore >= 75) return 3 // Bom
    if (totalScore >= 60) return 2 // Regular
    if (totalScore >= 40) return 1 // Iniciante
    return 0 // Não iniciado
  }

  // Verificar novas conquistas
  private checkAchievements(score: UnifiedScore): string[] {
    const newAchievements: string[] = []

    // Conquistas por nível
    if (score.level >= 5 && !score.achievements.includes('level_5')) {
      newAchievements.push('level_5')
    }

    // Conquistas por módulos completos (🚀 CORREÇÃO: Critério padronizado para 70%)
    const completedModules = Object.values(score.moduleScores).filter(s => s >= 70).length
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
      userId: studentId, // Alias para compatibilidade
      userName: 'Estudante',
      totalScore: 0,
      normalizedScore: 0,
      moduleScores: {},
      gameScores: {},
      achievements: [],
      lastActivity: new Date(),
      streak: 0,
      level: 1,
      completionRate: 0,
      classRank: 0,
      moduleProgress: {}
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
    // Para sistema educacional, a pontuação máxima é 100 (escala 0-100)
    return 100
  }

  // 🚀 NOVO: Obter módulos concluídos de forma consistente
  async getCompletedModules(studentId: string): Promise<string[]> {
    const score = await this.getUnifiedScore(studentId)
    if (!score) return []
    
    return Object.entries(score.moduleScores)
      .filter(([_, moduleScore]) => moduleScore >= 70)
      .map(([moduleId, _]) => moduleId)
  }

  // 🚀 NOVO: Verificar se módulo específico está concluído
  async isModuleCompleted(studentId: string, moduleId: string): Promise<boolean> {
    const score = await this.getUnifiedScore(studentId)
    if (!score) return false
    
    return (score.moduleScores[moduleId] || 0) >= 70
  }

  // 🚀 NOVO: Obter estatísticas de conclusão
  async getCompletionStats(studentId: string): Promise<{
    completedModules: number
    totalModules: number
    completionRate: number
    completedModuleIds: string[]
  }> {
    const score = await this.getUnifiedScore(studentId)
    if (!score) {
      return {
        completedModules: 0,
        totalModules: 4, // Número total de módulos do sistema
        completionRate: 0,
        completedModuleIds: []
      }
    }
    
    const completedModuleIds = Object.entries(score.moduleScores)
      .filter(([_, moduleScore]) => moduleScore >= 70)
      .map(([moduleId, _]) => moduleId)
    
    const completedModules = completedModuleIds.length
    const totalModules = 1 // ✅ ATUALIZADO: Apenas 1 módulo disponível atualmente
    const completionRate = (completedModules / totalModules) * 100
    
    return {
      completedModules,
      totalModules,
      completionRate,
      completedModuleIds
    }
  }

  // 🚀 TESTE: Validar alinhamento entre sistemas
  async validateSystemAlignment(studentId: string): Promise<{
    isAligned: boolean
    discrepancies: string[]
    unifiedData: any
    legacyData: any
    rankingData: any
  }> {
    try {
      const discrepancies: string[] = []
      
      // 1. Buscar dados do sistema unificado
      const unifiedScore = await this.getUnifiedScore(studentId)
      
      // 2. Buscar dados legacy (userProgress)
      const userProgressDoc = await getDoc(doc(db, 'userProgress', studentId))
      const legacyData = userProgressDoc.exists() ? userProgressDoc.data() : null
      
      // 3. Buscar dados do ranking (moduleProgress)
      const moduleProgressQuery = query(
        collection(db, 'student_module_progress'),
        where('studentId', '==', studentId)
      )
      const moduleProgressSnapshot = await getDocs(moduleProgressQuery)
      const rankingData = moduleProgressSnapshot.docs.map(doc => doc.data())
      
      if (!unifiedScore) {
        discrepancies.push('❌ Dados unificados não encontrados')
        return {
          isAligned: false,
          discrepancies,
          unifiedData: null,
          legacyData,
          rankingData
        }
      }
      
      // 4. Validar critérios de conclusão
      const unifiedCompleted = Object.entries(unifiedScore.moduleScores)
        .filter(([_, score]) => score >= 70)
        .map(([moduleId, _]) => moduleId)
      
      // Verificar legacy data
      if (legacyData?.modules) {
        Object.entries(legacyData.modules).forEach(([moduleId, moduleData]: [string, any]) => {
          const legacyCompleted = moduleData.completed || (moduleData.totalScore || 0) >= 70
          const unifiedCompleted = (unifiedScore.moduleScores[moduleId] || 0) >= 70
          
          if (legacyCompleted !== unifiedCompleted) {
            discrepancies.push(
              `⚠️ Módulo ${moduleId}: Legacy=${legacyCompleted}, Unificado=${unifiedCompleted}`
            )
          }
        })
      }
      
      // Verificar ranking data
      rankingData.forEach((moduleData: any) => {
        const rankingCompleted = moduleData.isCompleted || (moduleData.score || 0) >= 70
        const unifiedCompleted = (unifiedScore.moduleScores[moduleData.moduleId] || 0) >= 70
        
        if (rankingCompleted !== unifiedCompleted) {
          discrepancies.push(
            `⚠️ Ranking ${moduleData.moduleId}: Ranking=${rankingCompleted}, Unificado=${unifiedCompleted}`
          )
        }
      })
      
      return {
        isAligned: discrepancies.length === 0,
        discrepancies,
        unifiedData: {
          totalScore: unifiedScore.totalScore,
          normalizedScore: unifiedScore.normalizedScore,
          moduleScores: unifiedScore.moduleScores,
          completedModules: unifiedCompleted
        },
        legacyData,
        rankingData
      }
      
    } catch (error) {
      console.error('Erro ao validar alinhamento:', error)
      return {
        isAligned: false,
        discrepancies: [`❌ Erro na validação: ${error.message}`],
        unifiedData: null,
        legacyData: null,
        rankingData: null
      }
    }
  }

  // 🚀 NOVO: Método saveExerciseScore compatível com useUnifiedProgress
  async saveExerciseScore(
    studentId: string,
    moduleId: string,
    exerciseId: string,
    questionMetrics: any[], // QuestionMetrics from scoringSystem
    timeSpent: number
  ): Promise<void> {
    try {
      console.log('[UnifiedScoringService] 💾 Salvando pontuação de exercício:', {
        studentId, moduleId, exerciseId, metrics: questionMetrics.length, timeSpent
      })

      // Calcular pontuação baseada nas métricas das questões
      const totalQuestions = questionMetrics.length
      const correctAnswers = questionMetrics.filter(m => m.correct).length
      const exerciseScore = (correctAnswers / totalQuestions) * 100

      // Usar método existente updateExerciseScore
      await this.updateExerciseScore(studentId, moduleId, exerciseId, exerciseScore, 100)
      
      console.log('[UnifiedScoringService] ✅ Exercício salvo com sucesso')
    } catch (error) {
      console.error('[UnifiedScoringService] ❌ Erro ao salvar exercício:', error)
      throw error
    }
  }

  // 🚀 UTILITÁRIO: Sincronizar dados manualmente (para migração)
  async updateStudentRanking(studentId: string): Promise<void> {
    if (!db || !studentId) return;

    try {
      // Buscar score atual do estudante
      const score = await this.getUnifiedScore(studentId);
      if (!score) {
        console.log(`[UnifiedScoring] Nenhum score encontrado para ${studentId}`);
        return;
      }

      // 🎯 FIX: Não tentar atualizar módulo "overall" - apenas sincronizar dados existentes
      // Sincronizar dados dos módulos reais que o estudante completou
      const batch = writeBatch(db);

      // Atualizar documento principal do estudante
      const studentRef = doc(db, 'unified_scores', studentId);
      batch.set(studentRef, {
        ...score,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      await batch.commit();

      console.log(`[UnifiedScoring] Ranking atualizado para estudante ${studentId}`);
    } catch (error) {
      console.error(`[UnifiedScoring] Erro ao atualizar ranking:`, error);
      // Não propagar erro para não quebrar o fluxo
    }
  }

  async syncAllSystems(studentId: string): Promise<boolean> {
    try {
      console.log(`🔄 Sincronizando sistemas para ${studentId}`)
      
      const unifiedScore = await this.getUnifiedScore(studentId)
      if (!unifiedScore) {
        console.log('❌ Dados unificados não encontrados')
        return false
      }
      
      const batch = writeBatch(db)
      
      // Sincronizar userProgress
      const userProgressRef = doc(db, 'userProgress', studentId)
      const modules: any = {}
      
      Object.entries(unifiedScore.moduleScores).forEach(([moduleId, score]) => {
        modules[moduleId] = {
          totalScore: score,
          score: score,
          percentage: score, // Score já está normalizado 0-100
          completed: score >= 70,
          lastAccessed: new Date()
        }
      })
      
      batch.set(userProgressRef, { modules }, { merge: true })
      
      // Sincronizar moduleProgress
      Object.entries(unifiedScore.moduleScores).forEach(([moduleId, score]) => {
        const moduleProgressRef = doc(db, 'student_module_progress', `${studentId}_${moduleId}`)
        batch.set(moduleProgressRef, {
          studentId,
          moduleId,
          score: score,
          maxScore: 100,
          progress: score,
          isCompleted: score >= 70,
          updatedAt: new Date()
        }, { merge: true })
      })
      
      await batch.commit()
      console.log(`✅ Sincronização completa para ${studentId}`)
      return true
      
    } catch (error) {
      console.error('Erro na sincronização:', error)
      return false
    }
  }

  // 🚀 NOVO: Inicializar pontuação do estudante (usado no registro via convite)
  async initializeStudentScore(studentId: string): Promise<boolean> {
    try {
      console.log(`[UnifiedScoringService] 🎯 Inicializando pontuação para estudante: ${studentId}`)

      // Verificar se já existe score para o estudante
      const existingScore = await this.getUnifiedScore(studentId)
      if (existingScore) {
        console.log(`[UnifiedScoringService] ✅ Score já existe para ${studentId}, não é necessário inicializar`)
        return true
      }

      // Criar score vazio
      const emptyScore = this.createEmptyScore(studentId)

      // Salvar no Firebase
      await setDoc(doc(db, 'unified_scores', studentId), {
        ...emptyScore,
        lastActivity: serverTimestamp()
      })

      console.log(`[UnifiedScoringService] ✅ Score inicializado com sucesso para ${studentId}`)
      return true

    } catch (error) {
      console.error(`[UnifiedScoringService] ❌ Erro ao inicializar score para ${studentId}:`, error)
      return false
    }
  }

  // Limpar cache
  clearCache() {
    this.cache.clear()
  }
}

export default UnifiedScoringService.getInstance()