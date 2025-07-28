// Serviço de Cache Otimizado - bioestat-platform
// Cache granular por turma para máxima eficiência

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  classId?: string
  studentId?: string
}

interface CacheStats {
  hits: number
  misses: number
  invalidations: number
  size: number
}

export class OptimizedCacheService {
  private static instance: OptimizedCacheService
  private cache = new Map<string, CacheEntry<any>>()
  private stats: CacheStats = { hits: 0, misses: 0, invalidations: 0, size: 0 }
  
  // TTLs diferentes por tipo de dado
  private readonly ttls = {
    ranking: 3 * 60 * 1000,      // 3 minutos para rankings
    userProfile: 10 * 60 * 1000, // 10 minutos para perfis
    classInfo: 15 * 60 * 1000,   // 15 minutos para info das turmas
    score: 2 * 60 * 1000         // 2 minutos para pontuações
  }

  static getInstance(): OptimizedCacheService {
    if (!OptimizedCacheService.instance) {
      OptimizedCacheService.instance = new OptimizedCacheService()
    }
    return OptimizedCacheService.instance
  }

  // ✅ Cache granular por turma
  private getRankingKey(classId: string): string {
    return `ranking_${classId}`
  }

  private getUserKey(userId: string): string {
    return `user_${userId}`
  }

  private getScoreKey(studentId: string): string {
    return `score_${studentId}`
  }

  private getClassKey(classId: string): string {
    return `class_${classId}`
  }

  // ✅ Set com TTL específico
  set<T>(key: string, data: T, type: keyof typeof this.ttls = 'ranking', metadata?: { classId?: string, studentId?: string }): void {
    const ttl = this.ttls[type]
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      classId: metadata?.classId,
      studentId: metadata?.studentId
    })
    
    this.stats.size = this.cache.size
    
    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OptimizedCache] ✅ Cached ${key} (TTL: ${ttl/1000}s)`)
    }
  }

  // ✅ Get com validação de TTL
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      this.stats.size = this.cache.size
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[OptimizedCache] ⏰ Expired ${key}`)
      }
      return null
    }

    this.stats.hits++
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OptimizedCache] 🎯 Hit ${key}`)
    }
    
    return entry.data as T
  }

  // ✅ Invalidação granular por turma
  invalidateClassRanking(classId: string): void {
    const key = this.getRankingKey(classId)
    const deleted = this.cache.delete(key)
    
    if (deleted) {
      this.stats.invalidations++
      this.stats.size = this.cache.size
      
      console.log(`[OptimizedCache] 🗑️ Invalidated ranking for class ${classId}`)
    }
  }

  // ✅ Invalidação inteligente apenas para turmas do estudante
  async invalidateStudentRankings(studentId: string, enrolledClasses: string[]): Promise<void> {
    let invalidatedCount = 0
    
    for (const classId of enrolledClasses) {
      const key = this.getRankingKey(classId)
      if (this.cache.delete(key)) {
        invalidatedCount++
      }
    }
    
    if (invalidatedCount > 0) {
      this.stats.invalidations += invalidatedCount
      this.stats.size = this.cache.size
      
      console.log(`[OptimizedCache] 🎯 Invalidated ${invalidatedCount} rankings for student ${studentId}`)
    }
  }

  // ✅ Invalidar dados do usuário
  invalidateUser(userId: string): void {
    const userKey = this.getUserKey(userId)
    const scoreKey = this.getScoreKey(userId)
    
    let invalidatedCount = 0
    if (this.cache.delete(userKey)) invalidatedCount++
    if (this.cache.delete(scoreKey)) invalidatedCount++
    
    if (invalidatedCount > 0) {
      this.stats.invalidations += invalidatedCount
      this.stats.size = this.cache.size
      
      console.log(`[OptimizedCache] 👤 Invalidated ${invalidatedCount} entries for user ${userId}`)
    }
  }

  // ✅ Limpeza automática de entradas expiradas
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      this.stats.size = this.cache.size
      console.log(`[OptimizedCache] 🧹 Cleaned ${cleaned} expired entries`)
    }
    
    return cleaned
  }

  // ✅ Estatísticas do cache
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    }
  }

  // ✅ Métodos específicos para cada tipo de dado
  
  // Rankings
  setClassRanking(classId: string, ranking: any[]): void {
    this.set(this.getRankingKey(classId), ranking, 'ranking', { classId })
  }

  getClassRanking(classId: string): any[] | null {
    return this.get(this.getRankingKey(classId))
  }

  // Perfis de usuário
  setUserProfile(userId: string, profile: any): void {
    this.set(this.getUserKey(userId), profile, 'userProfile', { studentId: userId })
  }

  getUserProfile(userId: string): any | null {
    return this.get(this.getUserKey(userId))
  }

  // Pontuações
  setUserScore(studentId: string, score: any): void {
    this.set(this.getScoreKey(studentId), score, 'score', { studentId })
  }

  getUserScore(studentId: string): any | null {
    return this.get(this.getScoreKey(studentId))
  }

  // Informações das turmas
  setClassInfo(classId: string, classInfo: any): void {
    this.set(this.getClassKey(classId), classInfo, 'classInfo', { classId })
  }

  getClassInfo(classId: string): any | null {
    return this.get(this.getClassKey(classId))
  }

  // ✅ Limpar tudo (para logout ou reset)
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, invalidations: 0, size: 0 }
    
    console.log(`[OptimizedCache] 🗑️ Cleared all cache (${size} entries)`)
  }

  // ✅ Auto-cleanup a cada 5 minutos
  startAutoCleanup(): void {
    setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000) // 5 minutos
  }
}

// Instância singleton global
export const optimizedCache = OptimizedCacheService.getInstance()

// Iniciar auto-cleanup quando o serviço for importado
if (typeof window !== 'undefined') {
  optimizedCache.startAutoCleanup()
}