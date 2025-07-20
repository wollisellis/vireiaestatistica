// Serviço de Ranking - AvaliaNutri
// Gerencia o ranking de estudantes baseado na pontuação ponderada dos módulos

import { db } from '@/lib/firebase'
import { 
  doc, 
  getDoc, 
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore'
import unifiedScoringService, { UnifiedScore } from './unifiedScoringService'
import { modules } from '@/data/modules'

export interface RankingEntry {
  studentId: string
  anonymousId: string
  fullName: string
  totalScore: number
  normalizedScore: number
  moduleScores: Record<string, number>
  position: number
  lastActivity: Date
  isCurrentUser?: boolean
}

export interface ModuleRanking {
  moduleId: string
  moduleName: string
  maxPoints: number
  entries: RankingEntry[]
}

export interface RankingStats {
  totalStudents: number
  averageScore: number
  highestScore: number
  userPosition: number
}

class RankingService {
  private static instance: RankingService
  private cache: Map<string, { data: RankingEntry[], timestamp: number }> = new Map()
  private cacheExpiration = 2 * 60 * 1000 // 2 minutos

  static getInstance(): RankingService {
    if (!RankingService.instance) {
      RankingService.instance = new RankingService()
    }
    return RankingService.instance
  }

  // Calcular pontuação ponderada de um módulo (100 pontos máximo)
  calculateModuleScore(moduleId: string, exerciseScores: Record<string, number>): number {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return 0

    const totalExercises = module.exercises.length
    if (totalExercises === 0) return 0

    // Calcular média dos exercícios
    const scores = Object.values(exerciseScores)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // Normalizar para 100 pontos
    return Math.min(100, Math.round(averageScore))
  }

  // Obter ranking geral
  async getGeneralRanking(currentUserId?: string, limitCount: number = 10): Promise<RankingEntry[]> {
    try {
      // Verificar cache
      const cacheKey = `general_${limitCount}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
        return this.markCurrentUser(cached.data, currentUserId)
      }

      // Buscar todas as pontuações unificadas
      const scoresSnapshot = await getDocs(collection(db, 'unified_scores'))
      const rankings: RankingEntry[] = []

      for (const doc of scoresSnapshot.docs) {
        const scoreData = doc.data() as UnifiedScore
        
        // Buscar dados do usuário
        const userDoc = await getDoc(doc(db, 'users', scoreData.studentId))
        const userData = userDoc.data()

        if (userData) {
          const entry: RankingEntry = {
            studentId: scoreData.studentId,
            anonymousId: userData.anonymousId || 'N/A',
            fullName: userData.fullName || 'Estudante',
            totalScore: scoreData.totalScore,
            normalizedScore: scoreData.normalizedScore,
            moduleScores: scoreData.moduleScores,
            position: 0, // Será calculado após ordenação
            lastActivity: scoreData.lastActivity.toDate ? scoreData.lastActivity.toDate() : new Date(scoreData.lastActivity),
            isCurrentUser: false
          }
          rankings.push(entry)
        }
      }

      // Ordenar por pontuação total (decrescente)
      rankings.sort((a, b) => b.totalScore - a.totalScore)

      // Definir posições
      rankings.forEach((entry, index) => {
        entry.position = index + 1
      })

      // Limitar resultados
      const limitedRankings = rankings.slice(0, limitCount)

      // Atualizar cache
      this.cache.set(cacheKey, {
        data: limitedRankings,
        timestamp: Date.now()
      })

      return this.markCurrentUser(limitedRankings, currentUserId)
    } catch (error) {
      console.error('Erro ao buscar ranking geral:', error)
      return []
    }
  }

  // Obter ranking de um módulo específico
  async getModuleRanking(moduleId: string, currentUserId?: string, limitCount: number = 10): Promise<RankingEntry[]> {
    try {
      const rankings = await this.getGeneralRanking(currentUserId, 100) // Buscar mais dados para filtrar

      // Filtrar estudantes que têm pontuação no módulo
      const moduleRankings = rankings
        .filter(entry => entry.moduleScores[moduleId] !== undefined)
        .map(entry => ({
          ...entry,
          totalScore: entry.moduleScores[moduleId], // Usar pontuação do módulo
          normalizedScore: entry.moduleScores[moduleId]
        }))
        .sort((a, b) => b.totalScore - a.totalScore)

      // Reposicionar
      moduleRankings.forEach((entry, index) => {
        entry.position = index + 1
      })

      return moduleRankings.slice(0, limitCount)
    } catch (error) {
      console.error('Erro ao buscar ranking do módulo:', error)
      return []
    }
  }

  // Obter estatísticas do ranking
  async getRankingStats(currentUserId?: string): Promise<RankingStats> {
    try {
      const rankings = await this.getGeneralRanking(currentUserId, 1000)

      const totalStudents = rankings.length
      const averageScore = rankings.reduce((sum, entry) => sum + entry.totalScore, 0) / totalStudents
      const highestScore = rankings.length > 0 ? rankings[0].totalScore : 0
      
      let userPosition = 0
      if (currentUserId) {
        const userEntry = rankings.find(entry => entry.studentId === currentUserId)
        userPosition = userEntry ? userEntry.position : 0
      }

      return {
        totalStudents,
        averageScore: Math.round(averageScore),
        highestScore,
        userPosition
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        userPosition: 0
      }
    }
  }

  // Marcar usuário atual no ranking
  private markCurrentUser(rankings: RankingEntry[], currentUserId?: string): RankingEntry[] {
    if (!currentUserId) return rankings

    return rankings.map(entry => ({
      ...entry,
      isCurrentUser: entry.studentId === currentUserId
    }))
  }

  // Subscription em tempo real para o ranking
  subscribeToRanking(
    callback: (rankings: RankingEntry[]) => void,
    currentUserId?: string,
    limitCount: number = 10
  ): () => void {
    const unsubscribe = onSnapshot(
      collection(db, 'unified_scores'),
      (snapshot) => {
        this.clearCache() // Limpar cache quando dados mudam
        this.getGeneralRanking(currentUserId, limitCount).then(callback)
      },
      (error) => {
        console.error('Erro na subscription do ranking:', error)
      }
    )

    return unsubscribe
  }

  // Limpar cache
  clearCache(): void {
    this.cache.clear()
  }

  // Obter posição do usuário específico
  async getUserPosition(userId: string): Promise<number> {
    try {
      const rankings = await this.getGeneralRanking(userId, 1000)
      const userEntry = rankings.find(entry => entry.studentId === userId)
      return userEntry ? userEntry.position : 0
    } catch (error) {
      console.error('Erro ao buscar posição do usuário:', error)
      return 0
    }
  }
}

export default RankingService.getInstance()