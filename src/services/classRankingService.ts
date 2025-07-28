// Serviço de Rankings Pré-Agregados - bioestat-platform
// Fase 2: Coleção class_rankings com dados pré-calculados para máxima performance

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { optimizedCache } from './optimizedCacheService'
import OptimizedClassService from './optimizedClassService'

// 📊 Estrutura do ranking pré-agregado
export interface ClassRankingEntry {
  studentId: string
  studentName: string
  anonymousId: string
  totalNormalizedScore: number
  completedModules: number
  lastActivity: Date
  classRank: number
  isActive: boolean
  email?: string
}

export interface ClassRankingDocument {
  classId: string
  className: string
  lastUpdated: Date
  studentsCount: number
  rankings: ClassRankingEntry[]
  metadata: {
    averageScore: number
    completionRate: number
    activeStudents: number
    lastFullRebuild: Date
    version: string
  }
}

export class ClassRankingService {
  private static readonly COLLECTION_NAME = 'class_rankings'
  private static readonly CURRENT_VERSION = '2.0'

  // ✅ FASE 2.1: Buscar ranking pré-agregado (instantâneo)
  static async getPreAggregatedRanking(
    classId: string,
    useCache: boolean = true
  ): Promise<ClassRankingEntry[]> {
    
    // 1. Verificar cache primeiro
    if (useCache) {
      const cachedRanking = optimizedCache.getClassRanking(classId)
      if (cachedRanking) {
        console.log(`[ClassRankingService] 🎯 Cache hit para ranking ${classId}`)
        return cachedRanking.map(student => ({
          studentId: student.studentId,
          studentName: student.studentName || student.name,
          anonymousId: student.anonymousId,
          totalNormalizedScore: student.totalNormalizedScore || 0,
          completedModules: student.completedModules || 0,
          lastActivity: student.lastActivity,
          classRank: student.classRank || 0,
          isActive: true,
          email: student.email
        }))
      }
    }

    try {
      console.log(`[ClassRankingService] 📊 Buscando ranking pré-agregado: ${classId}`)
      
      // 2. Buscar documento pré-agregado
      const rankingDoc = await getDoc(doc(db, this.COLLECTION_NAME, classId))
      
      if (!rankingDoc.exists()) {
        console.log(`[ClassRankingService] ⚠️ Ranking não existe, gerando...`)
        await this.generateClassRanking(classId)
        return this.getPreAggregatedRanking(classId, false) // Recursão sem cache
      }

      const rankingData = rankingDoc.data() as ClassRankingDocument
      
      // 3. Verificar se precisa atualizar (mais de 5 minutos)
      const now = new Date()
      const lastUpdated = rankingData.lastUpdated?.toDate?.() || rankingData.lastUpdated
      const isStale = now.getTime() - new Date(lastUpdated).getTime() > 5 * 60 * 1000 // 5 min
      
      if (isStale) {
        console.log(`[ClassRankingService] 🔄 Ranking desatualizado, regenerando...`)
        // Regenerar em background sem bloquear
        this.generateClassRanking(classId).catch(error => 
          console.error('Erro ao regenerar ranking:', error)
        )
      }

      // 4. Retornar dados pré-agregados
      const rankings = rankingData.rankings || []
      
      // 5. Cachear resultado
      if (useCache && rankings.length > 0) {
        const cacheData = rankings.map(entry => ({
          studentId: entry.studentId,
          studentName: entry.studentName,
          name: entry.studentName,
          anonymousId: entry.anonymousId,
          totalNormalizedScore: entry.totalNormalizedScore,
          completedModules: entry.completedModules,
          lastActivity: entry.lastActivity,
          classRank: entry.classRank,
          email: entry.email
        }))
        optimizedCache.setClassRanking(classId, cacheData)
      }

      console.log(`[ClassRankingService] ✅ Ranking retornado: ${rankings.length} estudantes`)
      return rankings.filter(entry => entry.isActive)

    } catch (error) {
      console.error(`[ClassRankingService] ❌ Erro ao buscar ranking pré-agregado:`, error)
      
      // Fallback para sistema otimizado da Fase 1
      console.log(`[ClassRankingService] 🔄 Fallback para OptimizedClassService`)
      const fallbackData = await OptimizedClassService.getOptimizedClassStudents(classId)
      
      return fallbackData.map(student => ({
        studentId: student.studentId,
        studentName: student.studentName || student.name,
        anonymousId: student.anonymousId,
        totalNormalizedScore: student.totalNormalizedScore || 0,
        completedModules: student.completedModules || 0,
        lastActivity: student.lastActivity,
        classRank: student.classRank || 0,
        isActive: true,
        email: student.email
      }))
    }
  }

  // ✅ FASE 2.2: Gerar ranking pré-agregado para uma turma
  static async generateClassRanking(classId: string): Promise<boolean> {
    try {
      console.log(`[ClassRankingService] 🔄 Gerando ranking para turma: ${classId}`)

      // 1. Buscar dados da turma
      const classInfo = await OptimizedClassService.getClassInfoOptimized(classId)
      if (!classInfo) {
        console.error(`[ClassRankingService] ❌ Turma não encontrada: ${classId}`)
        return false
      }

      // 2. Buscar estudantes com dados otimizados
      const studentsData = await OptimizedClassService.getOptimizedClassStudents(
        classId, 
        {}, 
        false // Não usar cache para ter dados frescos
      )

      if (studentsData.length === 0) {
        console.log(`[ClassRankingService] ⚠️ Nenhum estudante na turma ${classId}`)
        return false
      }

      // 3. Processar e rankear estudantes
      const rankedStudents = studentsData
        .filter(student => student.studentId) // Filtrar dados válidos
        .sort((a, b) => (b.totalNormalizedScore || 0) - (a.totalNormalizedScore || 0))
        .map((student, index): ClassRankingEntry => ({
          studentId: student.studentId,
          studentName: student.studentName || student.name || `Estudante ${student.studentId.slice(-4)}`,
          anonymousId: student.anonymousId || student.studentId.slice(-4).toUpperCase(),
          totalNormalizedScore: Math.min(100, Math.max(0, student.totalNormalizedScore || 0)),
          completedModules: student.completedModules || 0,
          lastActivity: student.lastActivity || new Date(),
          classRank: index + 1,
          isActive: true,
          email: student.email || ''
        }))

      // 4. Calcular metadados da turma
      const totalScore = rankedStudents.reduce((sum, s) => sum + s.totalNormalizedScore, 0)
      const averageScore = rankedStudents.length > 0 ? totalScore / rankedStudents.length : 0
      const completedStudents = rankedStudents.filter(s => s.totalNormalizedScore >= 70).length
      const completionRate = rankedStudents.length > 0 ? (completedStudents / rankedStudents.length) * 100 : 0

      // 5. Criar documento pré-agregado
      const rankingDocument: ClassRankingDocument = {
        classId,
        className: classInfo.name || `Turma ${classId}`,
        lastUpdated: new Date(),
        studentsCount: rankedStudents.length,
        rankings: rankedStudents,
        metadata: {
          averageScore: Math.round(averageScore * 10) / 10, // 1 casa decimal
          completionRate: Math.round(completionRate * 10) / 10, // 1 casa decimal
          activeStudents: rankedStudents.filter(s => s.isActive).length,
          lastFullRebuild: new Date(),
          version: this.CURRENT_VERSION
        }
      }

      // 6. Salvar documento pré-agregado
      await setDoc(doc(db, this.COLLECTION_NAME, classId), {
        ...rankingDocument,
        lastUpdated: serverTimestamp(),
        'metadata.lastFullRebuild': serverTimestamp()
      })

      // 7. Invalidar cache para próxima busca usar dados frescos
      optimizedCache.invalidateClassRanking(classId)

      console.log(`[ClassRankingService] ✅ Ranking gerado: ${rankedStudents.length} estudantes`)
      console.log(`[ClassRankingService] 📊 Média da turma: ${averageScore.toFixed(1)} | Taxa conclusão: ${completionRate.toFixed(1)}%`)

      return true

    } catch (error) {
      console.error(`[ClassRankingService] ❌ Erro ao gerar ranking para ${classId}:`, error)
      return false
    }
  }

  // ✅ FASE 2.3: Atualizar ranking específico de um estudante (otimizado)
  static async updateStudentInRanking(
    classId: string, 
    studentId: string, 
    newScoreData: {
      totalNormalizedScore: number
      completedModules: number
      lastActivity: Date
    }
  ): Promise<boolean> {
    try {
      console.log(`[ClassRankingService] 🎯 Atualizando estudante ${studentId} na turma ${classId}`)

      // 1. Buscar documento atual
      const rankingRef = doc(db, this.COLLECTION_NAME, classId)
      const rankingDoc = await getDoc(rankingRef)

      if (!rankingDoc.exists()) {
        console.log(`[ClassRankingService] ⚠️ Ranking não existe, gerando completo...`)
        return this.generateClassRanking(classId)
      }

      const rankingData = rankingDoc.data() as ClassRankingDocument
      let rankings = [...(rankingData.rankings || [])]

      // 2. Encontrar e atualizar estudante
      const studentIndex = rankings.findIndex(entry => entry.studentId === studentId)
      
      if (studentIndex === -1) {
        console.log(`[ClassRankingService] ⚠️ Estudante não encontrado no ranking, regenerando...`)
        return this.generateClassRanking(classId)
      }

      // 3. Atualizar dados do estudante
      rankings[studentIndex] = {
        ...rankings[studentIndex],
        totalNormalizedScore: newScoreData.totalNormalizedScore,
        completedModules: newScoreData.completedModules,
        lastActivity: newScoreData.lastActivity
      }

      // 4. Re-calcular rankings (ordenar novamente)
      rankings = rankings
        .sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
        .map((entry, index) => ({
          ...entry,
          classRank: index + 1
        }))

      // 5. Recalcular metadados
      const totalScore = rankings.reduce((sum, s) => sum + s.totalNormalizedScore, 0)
      const averageScore = rankings.length > 0 ? totalScore / rankings.length : 0
      const completedStudents = rankings.filter(s => s.totalNormalizedScore >= 70).length
      const completionRate = rankings.length > 0 ? (completedStudents / rankings.length) * 100 : 0

      // 6. Atualizar documento com batch para atomicidade
      const batch = writeBatch(db)
      
      batch.update(rankingRef, {
        rankings,
        lastUpdated: serverTimestamp(),
        studentsCount: rankings.length,
        'metadata.averageScore': Math.round(averageScore * 10) / 10,
        'metadata.completionRate': Math.round(completionRate * 10) / 10,
        'metadata.activeStudents': rankings.filter(s => s.isActive).length
      })

      await batch.commit()

      // 7. Invalidar cache
      optimizedCache.invalidateClassRanking(classId)
      optimizedCache.invalidateUser(studentId)

      console.log(`[ClassRankingService] ✅ Estudante atualizado, nova posição: #${rankings[rankings.findIndex(r => r.studentId === studentId)].classRank}`)
      return true

    } catch (error) {
      console.error(`[ClassRankingService] ❌ Erro ao atualizar estudante no ranking:`, error)
      return false
    }
  }

  // ✅ FASE 2.4: Regenerar todos os rankings (manutenção)
  static async regenerateAllRankings(): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    console.log(`[ClassRankingService] 🔄 Iniciando regeneração completa de rankings...`)
    
    const results = { success: 0, failed: 0, errors: [] as string[] }

    try {
      // 1. Buscar todas as turmas ativas
      const classesQuery = query(
        collection(db, 'classes'),
        where('status', '==', 'active')
      )
      
      const classesSnapshot = await getDocs(classesQuery)
      const totalClasses = classesSnapshot.size

      console.log(`[ClassRankingService] 📋 ${totalClasses} turmas ativas encontradas`)

      // 2. Processar turmas em lotes para não sobrecarregar
      const batchSize = 3
      const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      for (let i = 0; i < classes.length; i += batchSize) {
        const batch = classes.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (classData) => {
          try {
            const success = await this.generateClassRanking(classData.id)
            if (success) {
              results.success++
              console.log(`[ClassRankingService] ✅ Turma ${classData.id} regenerada`)
            } else {
              results.failed++
              results.errors.push(`Falha ao gerar ranking para turma ${classData.id}`)
            }
          } catch (error) {
            results.failed++
            results.errors.push(`Erro na turma ${classData.id}: ${error.message}`)
            console.error(`[ClassRankingService] ❌ Erro na turma ${classData.id}:`, error)
          }
        })

        await Promise.all(batchPromises)
        
        // Pequena pausa entre lotes
        if (i + batchSize < classes.length) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }

      console.log(`[ClassRankingService] 🎉 Regeneração completa: ${results.success} sucessos, ${results.failed} falhas`)
      return results

    } catch (error) {
      console.error(`[ClassRankingService] ❌ Erro na regeneração completa:`, error)
      results.errors.push(`Erro geral: ${error.message}`)
      return results
    }
  }

  // ✅ UTILITÁRIO: Estatísticas dos rankings
  static async getRankingStats(): Promise<{
    totalRankings: number
    averageStudentsPerClass: number
    oldestUpdate: Date | null
    newestUpdate: Date | null
    versionDistribution: Record<string, number>
  }> {
    try {
      const rankingsSnapshot = await getDocs(collection(db, this.COLLECTION_NAME))
      const rankings = rankingsSnapshot.docs.map(doc => doc.data() as ClassRankingDocument)

      if (rankings.length === 0) {
        return {
          totalRankings: 0,
          averageStudentsPerClass: 0,
          oldestUpdate: null,
          newestUpdate: null,
          versionDistribution: {}
        }
      }

      const totalStudents = rankings.reduce((sum, r) => sum + r.studentsCount, 0)
      const averageStudentsPerClass = Math.round(totalStudents / rankings.length)

      const updateDates = rankings
        .map(r => r.lastUpdated)
        .filter(date => date)
        .map(date => date instanceof Timestamp ? date.toDate() : new Date(date))
        .sort((a, b) => a.getTime() - b.getTime())

      const versionDistribution = rankings.reduce((acc, r) => {
        const version = r.metadata?.version || 'unknown'
        acc[version] = (acc[version] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalRankings: rankings.length,
        averageStudentsPerClass,
        oldestUpdate: updateDates.length > 0 ? updateDates[0] : null,
        newestUpdate: updateDates.length > 0 ? updateDates[updateDates.length - 1] : null,
        versionDistribution
      }

    } catch (error) {
      console.error(`[ClassRankingService] ❌ Erro ao obter estatísticas:`, error)
      throw error
    }
  }

  // 🎯 MÉTODO PARA DEBUG
  static async debugRankingGeneration(classId: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return

    console.group(`🔍 [ClassRankingService] Debug de geração - Turma ${classId}`)
    
    const startTime = performance.now()
    
    // Testar geração
    console.time('⏱️ Geração de ranking pré-agregado')
    const success = await this.generateClassRanking(classId)
    console.timeEnd('⏱️ Geração de ranking pré-agregado')
    
    // Testar busca
    console.time('⏱️ Busca de ranking pré-agregado')
    const ranking = await this.getPreAggregatedRanking(classId, false)
    console.timeEnd('⏱️ Busca de ranking pré-agregado')
    
    const endTime = performance.now()
    console.log(`🎯 Tempo total: ${(endTime - startTime).toFixed(2)}ms`)
    console.log(`✅ Geração: ${success ? 'Sucesso' : 'Falha'}`)
    console.log(`📊 Estudantes no ranking: ${ranking.length}`)
    
    if (ranking.length > 0) {
      console.table(ranking.slice(0, 5)) // Top 5
    }
    
    console.groupEnd()
  }
}

export default ClassRankingService