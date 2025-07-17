// Serviço de Ranking Melhorado - AvaliaNutri Platform
// Created by Ellis Abhulime - UNICAMP

import { 
  collection, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  where,
  onSnapshot,
  serverTimestamp,
  increment,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { StudentModuleProgress } from '@/lib/moduleProgressSystem'

export interface RankingEntry {
  studentId: string
  studentName: string
  anonymousId: string
  
  // Pontuações por módulo (0-100 cada)
  moduleScores: {
    [moduleId: string]: number
  }
  
  // Pontuação total normalizada (0-400 para 4 módulos)
  totalNormalizedScore: number
  
  // Progresso geral (0-100%)
  overallProgress: number
  
  // Módulos concluídos
  completedModules: number
  totalModules: number
  
  // Tempo total estudado
  totalTimeSpent: number
  
  // Média de pontuação dos módulos concluídos
  averageScore: number
  
  // Nível de conquista
  achievementLevel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert'
  
  // Atividade recente
  isActive: boolean
  lastActivity: any // Firestore Timestamp
  
  // Posição no ranking
  rank: number
  previousRank?: number
  rankChange: 'up' | 'down' | 'same' | 'new'
  
  // Categoria do ranking
  category: 'Geral' | 'Turma' | 'Período'
  percentile: number
  
  // Estatísticas adicionais
  stats: {
    perfectExercises: number
    averageAttempts: number
    currentStreak: number
    exercisesCompleted: number
    totalExercises: number
  }
  
  // Timestamps
  createdAt: any
  updatedAt: any
}

export interface RankingCategory {
  id: string
  name: string
  description: string
  filter?: (entry: RankingEntry) => boolean
}

export interface RankingStats {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  averageScore: number
  topScore: number
  completionRate: number
  categoryBreakdown: { [category: string]: number }
}

export class EnhancedRankingService {
  private static readonly COLLECTION = 'enhanced_rankings'
  private static readonly STATS_COLLECTION = 'ranking_stats'
  private static readonly HISTORY_COLLECTION = 'ranking_history'

  // Categorias de ranking
  static readonly CATEGORIES: RankingCategory[] = [
    {
      id: 'geral',
      name: 'Ranking Geral',
      description: 'Todos os estudantes da plataforma'
    },
    {
      id: 'ativos',
      name: 'Estudantes Ativos',
      description: 'Atividade nos últimos 7 dias',
      filter: (entry) => entry.isActive
    },
    {
      id: 'iniciantes',
      name: 'Iniciantes',
      description: 'Estudantes com menos de 25% de progresso',
      filter: (entry) => entry.overallProgress < 25
    },
    {
      id: 'intermediarios',
      name: 'Intermediários',
      description: 'Estudantes com 25-75% de progresso',
      filter: (entry) => entry.overallProgress >= 25 && entry.overallProgress < 75
    },
    {
      id: 'avancados',
      name: 'Avançados',
      description: 'Estudantes com mais de 75% de progresso',
      filter: (entry) => entry.overallProgress >= 75
    }
  ]

  // Atualizar entrada no ranking
  static async updateRanking(studentProgress: StudentModuleProgress): Promise<void> {
    try {
      const rankingEntry = this.createRankingEntry(studentProgress)
      const docRef = doc(db, this.COLLECTION, studentProgress.studentId)
      
      // Verificar entrada anterior para calcular mudança de rank
      const previousEntry = await this.getRankingEntry(studentProgress.studentId)
      if (previousEntry) {
        rankingEntry.previousRank = previousEntry.rank
      }

      await setDoc(docRef, rankingEntry, { merge: true })
      
      // Recalcular ranks após atualização
      await this.recalculateRanks()
      
      // Atualizar estatísticas
      await this.updateStats()
      
      console.log('Ranking atualizado para:', studentProgress.studentId)
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error)
      throw error
    }
  }

  // Criar entrada de ranking a partir do progresso do estudante
  private static createRankingEntry(studentProgress: StudentModuleProgress): Omit<RankingEntry, 'rank' | 'rankChange' | 'percentile'> {
    const {
      studentId,
      studentName,
      modules,
      totalNormalizedScore,
      overallProgress,
      totalTimeSpent,
      achievementLevel,
      isActive,
      lastActivity
    } = studentProgress

    // Pontuações por módulo
    const moduleScores: { [moduleId: string]: number } = {}
    modules.forEach(module => {
      moduleScores[module.moduleId] = module.normalizedScore
    })

    // Módulos concluídos
    const completedModules = modules.filter(m => m.isCompleted).length
    const totalModules = modules.length

    // Média de pontuação dos módulos concluídos
    const completedScores = modules.filter(m => m.isCompleted).map(m => m.normalizedScore)
    const averageScore = completedScores.length > 0 
      ? completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length
      : 0

    // Estatísticas adicionais
    const stats = {
      perfectExercises: modules.reduce((sum, m) => sum + m.perfectExercises, 0),
      averageAttempts: modules.reduce((sum, m) => sum + m.averageAttempts, 0) / modules.length,
      currentStreak: studentProgress.currentStreak,
      exercisesCompleted: modules.reduce((sum, m) => sum + m.exercises.filter(e => e.completed).length, 0),
      totalExercises: modules.reduce((sum, m) => sum + m.exercises.length, 0)
    }

    // ID anônimo para o ranking
    const anonymousId = `#${Math.floor(Math.random() * 9000) + 1000}`

    return {
      studentId,
      studentName: studentName || 'Estudante',
      anonymousId,
      moduleScores,
      totalNormalizedScore,
      overallProgress,
      completedModules,
      totalModules,
      totalTimeSpent,
      averageScore,
      achievementLevel,
      isActive,
      lastActivity: serverTimestamp(),
      category: 'Geral',
      stats,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
  }

  // Obter ranking por categoria
  static async getRanking(
    categoryId: string = 'geral', 
    limitResults: number = 50
  ): Promise<RankingEntry[]> {
    try {
      const category = this.CATEGORIES.find(c => c.id === categoryId)
      if (!category) throw new Error(`Categoria ${categoryId} não encontrada`)

      let q = query(
        collection(db, this.COLLECTION),
        orderBy('totalNormalizedScore', 'desc'),
        orderBy('overallProgress', 'desc'),
        limit(limitResults)
      )

      const querySnapshot = await getDocs(q)
      let rankings: RankingEntry[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<RankingEntry, 'rank' | 'rankChange' | 'percentile'>
        rankings.push({
          ...data,
          rank: 0, // Será calculado
          rankChange: 'same',
          percentile: 0
        })
      })

      // Aplicar filtro da categoria se houver
      if (category.filter) {
        rankings = rankings.filter(category.filter)
      }

      // Calcular ranks e percentis
      rankings = rankings.map((entry, index) => {
        const rank = index + 1
        const percentile = Math.round(((rankings.length - rank) / rankings.length) * 100)
        
        // Calcular mudança de rank
        let rankChange: 'up' | 'down' | 'same' | 'new' = 'same'
        if (!entry.previousRank) {
          rankChange = 'new'
        } else if (rank < entry.previousRank) {
          rankChange = 'up'
        } else if (rank > entry.previousRank) {
          rankChange = 'down'
        }

        return {
          ...entry,
          rank,
          percentile,
          rankChange,
          category: category.name
        }
      })

      return rankings
    } catch (error) {
      console.error('Erro ao obter ranking:', error)
      return []
    }
  }

  // Obter posição específica de um estudante
  static async getStudentRank(studentId: string, categoryId: string = 'geral'): Promise<{
    rank: number
    totalStudents: number
    percentile: number
    categoryRank: number
  } | null> {
    try {
      const rankings = await this.getRanking(categoryId, 1000) // Buscar mais entradas para cálculo preciso
      const studentIndex = rankings.findIndex(entry => entry.studentId === studentId)
      
      if (studentIndex === -1) return null

      const rank = studentIndex + 1
      const totalStudents = rankings.length
      const percentile = Math.round(((totalStudents - rank) / totalStudents) * 100)

      return {
        rank,
        totalStudents,
        percentile,
        categoryRank: rank
      }
    } catch (error) {
      console.error('Erro ao obter rank do estudante:', error)
      return null
    }
  }

  // Obter top performers
  static async getTopPerformers(categoryId: string = 'geral', limit: number = 10): Promise<RankingEntry[]> {
    return this.getRanking(categoryId, limit)
  }

  // Obter rankings próximos a um estudante
  static async getNearbyRankings(studentId: string, range: number = 5): Promise<{
    above: RankingEntry[]
    current: RankingEntry | null
    below: RankingEntry[]
  }> {
    try {
      const rankings = await this.getRanking('geral', 1000)
      const studentIndex = rankings.findIndex(entry => entry.studentId === studentId)
      
      if (studentIndex === -1) {
        return { above: [], current: null, below: [] }
      }

      const current = rankings[studentIndex]
      const above = rankings.slice(Math.max(0, studentIndex - range), studentIndex)
      const below = rankings.slice(studentIndex + 1, studentIndex + 1 + range)

      return { above, current, below }
    } catch (error) {
      console.error('Erro ao obter rankings próximos:', error)
      return { above: [], current: null, below: [] }
    }
  }

  // Obter estatísticas do ranking
  static async getRankingStats(categoryId: string = 'geral'): Promise<RankingStats> {
    try {
      const rankings = await this.getRanking(categoryId, 1000)
      
      const totalStudents = rankings.length
      const activeStudents = rankings.filter(r => r.isActive).length
      const averageProgress = rankings.reduce((sum, r) => sum + r.overallProgress, 0) / totalStudents
      const averageScore = rankings.reduce((sum, r) => sum + r.averageScore, 0) / totalStudents
      const topScore = rankings.length > 0 ? rankings[0].totalNormalizedScore : 0
      const completionRate = rankings.filter(r => r.overallProgress >= 100).length / totalStudents * 100

      // Breakdown por nível de conquista
      const categoryBreakdown: { [category: string]: number } = {}
      rankings.forEach(ranking => {
        categoryBreakdown[ranking.achievementLevel] = (categoryBreakdown[ranking.achievementLevel] || 0) + 1
      })

      return {
        totalStudents,
        activeStudents,
        averageProgress: Math.round(averageProgress),
        averageScore: Math.round(averageScore),
        topScore,
        completionRate: Math.round(completionRate),
        categoryBreakdown
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        averageScore: 0,
        topScore: 0,
        completionRate: 0,
        categoryBreakdown: {}
      }
    }
  }

  // Métodos auxiliares privados
  private static async getRankingEntry(studentId: string): Promise<RankingEntry | null> {
    try {
      const docRef = doc(db, this.COLLECTION, studentId)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() as RankingEntry : null
    } catch (error) {
      console.error('Erro ao obter entrada de ranking:', error)
      return null
    }
  }

  private static async recalculateRanks(): Promise<void> {
    try {
      const rankings = await this.getRanking('geral', 1000)
      const batch = writeBatch(db)

      rankings.forEach((ranking, index) => {
        const docRef = doc(db, this.COLLECTION, ranking.studentId)
        batch.update(docRef, {
          rank: index + 1,
          percentile: Math.round(((rankings.length - (index + 1)) / rankings.length) * 100),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()
    } catch (error) {
      console.error('Erro ao recalcular ranks:', error)
    }
  }

  private static async updateStats(): Promise<void> {
    try {
      const stats = await this.getRankingStats()
      const statsRef = doc(db, this.STATS_COLLECTION, 'general')
      
      await setDoc(statsRef, {
        ...stats,
        lastUpdated: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error)
    }
  }

  // Subscrição em tempo real
  static subscribeToRanking(
    categoryId: string,
    callback: (rankings: RankingEntry[]) => void,
    limitResults: number = 50
  ): () => void {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('totalNormalizedScore', 'desc'),
      limit(limitResults)
    )

    return onSnapshot(q, (snapshot) => {
      const rankings: RankingEntry[] = []
      snapshot.forEach((doc) => {
        const data = doc.data() as RankingEntry
        rankings.push(data)
      })
      callback(rankings)
    })
  }
}

export default EnhancedRankingService