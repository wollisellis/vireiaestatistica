// Serviço de Pontuações Denormalizadas - bioestat-platform
// Fase 3: Ultra-performance com dados denormalizados em unified_scores

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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

// 📊 Interface expandida com dados denormalizados
export interface DenormalizedUnifiedScore {
  // Dados originais
  studentId: string
  userId: string
  totalScore: number
  normalizedScore: number
  moduleScores: Record<string, number>
  gameScores: Record<string, number>
  achievements: string[] | any
  lastActivity: Date
  streak: number
  level: number
  completionRate?: number
  
  // ✅ DADOS DENORMALIZADOS - Usuário
  userName: string
  userEmail: string
  userAnonymousId: string
  userRole: string
  userCreatedAt: Date
  userLastActivity: Date
  
  // ✅ DADOS DENORMALIZADOS - Turmas (array das turmas ativas)
  enrolledClasses: Array<{
    classId: string
    className: string
    classRank: number
    enrolledAt: Date
    status: 'active' | 'inactive'
    professorId: string
    professorName: string
  }>
  
  // ✅ METADADOS DENORMALIZADOS
  denormalized: {
    version: string
    lastSync: Date
    dataIntegrity: boolean
    syncErrors: string[]
  }
}

export class DenormalizedScoreService {
  private static readonly COLLECTION_NAME = 'unified_scores'
  private static readonly DENORM_VERSION = '3.0'

  // ✅ ULTRA-QUERY: Buscar ranking completo com uma única query
  static async getUltraFastRanking(
    classId: string,
    limitResults: number = 50
  ): Promise<DenormalizedUnifiedScore[]> {
    
    console.log(`⚡ [DenormalizedScore] Ultra-fast ranking para turma: ${classId}`)
    
    try {
      // QUERY ÚNICA: Buscar apenas estudantes da turma específica
      const rankingQuery = query(
        collection(db, this.COLLECTION_NAME),
        where('enrolledClasses', 'array-contains', { classId }),
        orderBy('normalizedScore', 'desc'),
        limit(limitResults)
      )
      
      const startTime = performance.now()
      const querySnapshot = await getDocs(rankingQuery)
      const endTime = performance.now()
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data() as DenormalizedUnifiedScore
        
        // Calcular rank baseado na ordem da query
        const classRank = querySnapshot.docs.findIndex(d => d.id === doc.id) + 1
        
        return {
          ...data,
          // Atualizar rank específico da turma
          enrolledClasses: data.enrolledClasses?.map(enrollment => 
            enrollment.classId === classId 
              ? { ...enrollment, classRank }
              : enrollment
          ) || []
        }
      })
      
      console.log(`⚡ [DenormalizedScore] ${results.length} estudantes em ${(endTime - startTime).toFixed(2)}ms`)
      return results
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro na ultra-query:`, error)
      throw error
    }
  }

  // ✅ SINCRONIZAÇÃO: Denormalizar dados de um estudante
  static async denormalizeStudentData(studentId: string): Promise<boolean> {
    try {
      console.log(`🔄 [DenormalizedScore] Denormalizando dados do estudante: ${studentId}`)
      
      // 1. Buscar dados atuais do unified_scores
      const scoreDoc = await getDoc(doc(db, this.COLLECTION_NAME, studentId))
      if (!scoreDoc.exists()) {
        console.warn(`⚠️ [DenormalizedScore] Score não encontrado para ${studentId}`)
        return false
      }
      
      const currentScore = scoreDoc.data()
      
      // 2. Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId))
      if (!userDoc.exists()) {
        console.error(`❌ [DenormalizedScore] Usuário não encontrado: ${studentId}`)
        return false
      }
      
      const userData = userDoc.data()
      
      // 3. Buscar dados das turmas matriculadas
      const enrollmentsQuery = query(
        collection(db, 'classStudents'),
        where('studentId', '==', studentId),
        where('status', '==', 'active')
      )
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
      const enrollmentPromises = enrollmentsSnapshot.docs.map(async (enrollDoc) => {
        const enrollment = enrollDoc.data()
        
        // Buscar dados da turma
        const classDoc = await getDoc(doc(db, 'classes', enrollment.classId))
        if (!classDoc.exists()) return null
        
        const classData = classDoc.data()
        
        // Buscar dados do professor
        const professorDoc = await getDoc(doc(db, 'users', classData.professorId))
        const professorData = professorDoc.exists() ? professorDoc.data() : {}
        
        return {
          classId: enrollment.classId,
          className: classData.name || `Turma ${enrollment.classId}`,
          classRank: 0, // Será calculado posteriormente
          enrolledAt: enrollment.enrolledAt?.toDate?.() || new Date(),
          status: enrollment.status as 'active' | 'inactive',
          professorId: classData.professorId,
          professorName: professorData.displayName || professorData.name || 'Professor'
        }
      })
      
      const enrolledClassesData = (await Promise.all(enrollmentPromises)).filter(Boolean)
      
      // 4. Montar objeto denormalizado
      const denormalizedScore: DenormalizedUnifiedScore = {
        // Dados originais (preservar)
        ...currentScore,
        studentId,
        userId: studentId,
        
        // Dados denormalizados do usuário
        userName: userData.displayName || userData.name || userData.fullName || 'Estudante',
        userEmail: userData.email || '',
        userAnonymousId: userData.anonymousId || studentId.slice(-4).toUpperCase(),
        userRole: userData.role || 'student',
        userCreatedAt: userData.createdAt?.toDate?.() || new Date(),
        userLastActivity: userData.lastActivity?.toDate?.() || new Date(),
        
        // Dados denormalizados das turmas
        enrolledClasses: enrolledClassesData,
        
        // Metadados de denormalização
        denormalized: {
          version: this.DENORM_VERSION,
          lastSync: new Date(),
          dataIntegrity: true,
          syncErrors: []
        }
      }
      
      // 5. Atualizar documento
      await setDoc(doc(db, this.COLLECTION_NAME, studentId), {
        ...denormalizedScore,
        lastActivity: serverTimestamp(),
        'denormalized.lastSync': serverTimestamp()
      })
      
      // 6. Invalidar cache
      optimizedCache.invalidateUser(studentId)
      
      console.log(`✅ [DenormalizedScore] Dados denormalizados para ${studentId}`)
      return true
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro na denormalização:`, error)
      
      // Tentar salvar erro no documento
      try {
        await updateDoc(doc(db, this.COLLECTION_NAME, studentId), {
          'denormalized.dataIntegrity': false,
          'denormalized.syncErrors': [error.message],
          'denormalized.lastSync': serverTimestamp()
        })
      } catch (updateError) {
        console.error(`❌ [DenormalizedScore] Erro ao salvar erro de sync:`, updateError)
      }
      
      return false
    }
  }

  // ✅ MIGRAÇÃO: Denormalizar todos os estudantes existentes
  static async denormalizeAllStudents(): Promise<{
    total: number
    successful: number
    failed: number
    errors: string[]
  }> {
    console.log(`🔄 [DenormalizedScore] Iniciando denormalização completa...`)
    
    const results = { total: 0, successful: 0, failed: 0, errors: [] as string[] }
    
    try {
      // Buscar todos os documentos de unified_scores
      const scoresSnapshot = await getDocs(collection(db, this.COLLECTION_NAME))
      results.total = scoresSnapshot.size
      
      console.log(`📋 [DenormalizedScore] ${results.total} estudantes para denormalizar`)
      
      // Processar em lotes para não sobrecarregar
      const batchSize = 5
      const studentIds = scoresSnapshot.docs.map(doc => doc.id)
      
      for (let i = 0; i < studentIds.length; i += batchSize) {
        const batch = studentIds.slice(i, i + batchSize)
        
        console.log(`🔄 [DenormalizedScore] Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(studentIds.length/batchSize)}`)
        
        const batchPromises = batch.map(async (studentId) => {
          try {
            const success = await this.denormalizeStudentData(studentId)
            if (success) {
              results.successful++
            } else {
              results.failed++
              results.errors.push(`Falha na denormalização de ${studentId}`)
            }
          } catch (error) {
            results.failed++
            results.errors.push(`Erro em ${studentId}: ${error.message}`)
          }
        })
        
        await Promise.all(batchPromises)
        
        // Pausa entre lotes
        if (i + batchSize < studentIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      console.log(`🎉 [DenormalizedScore] Migração concluída: ${results.successful}/${results.total} sucessos`)
      return results
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro na migração completa:`, error)
      results.errors.push(`Erro geral: ${error.message}`)
      return results
    }
  }

  // ✅ QUERY OTIMIZADA: Buscar estudante específico (sem joins)
  static async getStudentDenormalizedData(studentId: string): Promise<DenormalizedUnifiedScore | null> {
    try {
      // Verificar cache primeiro
      const cached = optimizedCache.getUserScore(studentId)
      if (cached && cached.denormalized?.version === this.DENORM_VERSION) {
        console.log(`🎯 [DenormalizedScore] Cache hit para ${studentId}`)
        return cached as DenormalizedUnifiedScore
      }
      
      const scoreDoc = await getDoc(doc(db, this.COLLECTION_NAME, studentId))
      
      if (!scoreDoc.exists()) {
        console.warn(`⚠️ [DenormalizedScore] Dados não encontrados para ${studentId}`)
        return null
      }
      
      const data = scoreDoc.data() as DenormalizedUnifiedScore
      
      // Verificar se dados estão denormalizados
      if (!data.denormalized || data.denormalized.version !== this.DENORM_VERSION) {
        console.log(`🔄 [DenormalizedScore] Dados desatualizados, re-denormalizando...`)
        await this.denormalizeStudentData(studentId)
        return this.getStudentDenormalizedData(studentId) // Recursão para buscar dados atualizados
      }
      
      // Cachear dados denormalizados
      optimizedCache.setUserScore(studentId, data)
      
      return data
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro ao buscar dados denormalizados:`, error)
      return null
    }
  }

  // ✅ MANUTENÇÃO: Validar integridade dos dados denormalizados
  static async validateDataIntegrity(studentId: string): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    try {
      console.log(`🔍 [DenormalizedScore] Validando integridade para ${studentId}`)
      
      const issues: string[] = []
      const recommendations: string[] = []
      
      // Buscar dados denormalizados
      const denormData = await this.getStudentDenormalizedData(studentId)
      if (!denormData) {
        return {
          isValid: false,
          issues: ['Dados denormalizados não encontrados'],
          recommendations: ['Execute denormalizeStudentData()']
        }
      }
      
      // Validação 1: Verificar se dados do usuário estão sincronizados
      const userDoc = await getDoc(doc(db, 'users', studentId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        if (denormData.userName !== (userData.displayName || userData.name)) {
          issues.push('Nome do usuário desatualizado')
          recommendations.push('Re-sincronizar dados do usuário')
        }
        
        if (denormData.userEmail !== userData.email) {
          issues.push('Email do usuário desatualizado')
          recommendations.push('Re-sincronizar dados do usuário')
        }
      }
      
      // Validação 2: Verificar turmas matriculadas
      const enrollmentsQuery = query(
        collection(db, 'classStudents'),
        where('studentId', '==', studentId),
        where('status', '==', 'active')
      )
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
      const currentEnrollments = enrollmentsSnapshot.docs.map(doc => doc.data().classId)
      const denormEnrollments = denormData.enrolledClasses?.map(c => c.classId) || []
      
      const missingEnrollments = currentEnrollments.filter(id => !denormEnrollments.includes(id))
      const extraEnrollments = denormEnrollments.filter(id => !currentEnrollments.includes(id))
      
      if (missingEnrollments.length > 0) {
        issues.push(`Turmas não denormalizadas: ${missingEnrollments.join(', ')}`)
        recommendations.push('Re-denormalizar dados das turmas')
      }
      
      if (extraEnrollments.length > 0) {
        issues.push(`Turmas antigas nos dados: ${extraEnrollments.join(', ')}`)
        recommendations.push('Remover turmas inativas dos dados denormalizados')
      }
      
      // Validação 3: Verificar versão
      if (denormData.denormalized?.version !== this.DENORM_VERSION) {
        issues.push(`Versão desatualizada: ${denormData.denormalized?.version} vs ${this.DENORM_VERSION}`)
        recommendations.push('Atualizar para versão mais recente')
      }
      
      const isValid = issues.length === 0
      
      if (isValid) {
        console.log(`✅ [DenormalizedScore] Dados íntegros para ${studentId}`)
      } else {
        console.warn(`⚠️ [DenormalizedScore] ${issues.length} problemas encontrados:`, issues)
      }
      
      return { isValid, issues, recommendations }
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro na validação:`, error)
      return {
        isValid: false,
        issues: [`Erro na validação: ${error.message}`],
        recommendations: ['Verificar logs e re-executar validação']
      }
    }
  }

  // ✅ ESTATÍSTICAS: Performance da denormalização
  static async getDenormalizationStats(): Promise<{
    totalDocuments: number
    denormalizedDocuments: number
    currentVersion: number
    outdatedVersion: number
    averageAge: number
    integrityIssues: number
  }> {
    try {
      console.log(`📊 [DenormalizedScore] Calculando estatísticas...`)
      
      const scoresSnapshot = await getDocs(collection(db, this.COLLECTION_NAME))
      const docs = scoresSnapshot.docs.map(doc => doc.data() as DenormalizedUnifiedScore)
      
      const totalDocuments = docs.length
      const denormalizedDocuments = docs.filter(d => d.denormalized).length
      const currentVersion = docs.filter(d => d.denormalized?.version === this.DENORM_VERSION).length
      const outdatedVersion = denormalizedDocuments - currentVersion
      const integrityIssues = docs.filter(d => d.denormalized?.dataIntegrity === false).length
      
      // Calcular idade média
      const now = Date.now()
      const ages = docs
        .filter(d => d.denormalized?.lastSync)
        .map(d => {
          const syncDate = d.denormalized.lastSync instanceof Timestamp 
            ? d.denormalized.lastSync.toDate() 
            : new Date(d.denormalized.lastSync)
          return now - syncDate.getTime()
        })
      
      const averageAge = ages.length > 0 
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length / (1000 * 60 * 60)) // em horas
        : 0
      
      const stats = {
        totalDocuments,
        denormalizedDocuments,
        currentVersion,
        outdatedVersion,
        averageAge,
        integrityIssues
      }
      
      console.table(stats)
      return stats
      
    } catch (error) {
      console.error(`❌ [DenormalizedScore] Erro ao calcular estatísticas:`, error)
      throw error
    }
  }

  // 🎯 MÉTODO DE DEBUG
  static async debugDenormalization(studentId: string): Promise<void> {
    if (process.env.NODE_ENV !== 'development') return

    console.group(`🔍 [DenormalizedScore] Debug para estudante ${studentId}`)
    
    try {
      // 1. Dados atuais
      console.log(`1️⃣ Buscando dados atuais...`)
      const currentData = await this.getStudentDenormalizedData(studentId)
      console.log('Dados denormalizados:', currentData ? 'Encontrados' : 'Não encontrados')
      
      // 2. Validação de integridade
      console.log(`\n2️⃣ Validando integridade...`)
      const validation = await this.validateDataIntegrity(studentId)
      console.log(`Integridade: ${validation.isValid ? '✅ OK' : '❌ Problemas'}`)
      if (!validation.isValid) {
        console.warn('Problemas:', validation.issues)
        console.info('Recomendações:', validation.recommendations)
      }
      
      // 3. Teste de performance
      console.log(`\n3️⃣ Teste de performance...`)
      const startTime = performance.now()
      await this.getStudentDenormalizedData(studentId)
      const endTime = performance.now()
      console.log(`Tempo de busca: ${(endTime - startTime).toFixed(2)}ms`)
      
      // 4. Re-denormalização se necessário
      if (!validation.isValid) {
        console.log(`\n4️⃣ Re-denormalizando dados...`)
        const redenormResult = await this.denormalizeStudentData(studentId)
        console.log(`Re-denormalização: ${redenormResult ? '✅ Sucesso' : '❌ Falha'}`)
      }
      
    } catch (error) {
      console.error('Erro no debug:', error)
    }
    
    console.groupEnd()
  }
}

export default DenormalizedScoreService