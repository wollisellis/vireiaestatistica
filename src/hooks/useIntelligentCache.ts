'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFirebaseAuth } from './useFirebaseAuth'

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
  dependencies: string[]
}

interface CacheConfig {
  ttl?: number // Time to live em milliseconds
  version?: string // Versão dos dados para invalidação
  dependencies?: string[] // Dependências que invalidam o cache
  forceRefresh?: boolean // Força atualização
}

class IntelligentCacheSystem {
  private cache = new Map<string, CacheEntry<any>>()
  private subscribers = new Map<string, Set<() => void>>()
  
  // Configurações padrão por tipo de dado
  private defaultConfigs = {
    userProgress: { ttl: 5 * 60 * 1000, version: '1.0' }, // 5 minutos
    moduleSettings: { ttl: 30 * 60 * 1000, version: '1.0' }, // 30 minutos
    rankings: { ttl: 2 * 60 * 1000, version: '1.0' }, // 2 minutos
    gameProgress: { ttl: 1 * 60 * 1000, version: '1.0' }, // 1 minuto
    unifiedScores: { ttl: 3 * 60 * 1000, version: '1.0' }, // 3 minutos
  }

  // Cache com TTL e versionamento
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const defaultConfig = this.getDefaultConfig(key)
    const finalConfig = { ...defaultConfig, ...config }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: finalConfig.version || '1.0',
      dependencies: finalConfig.dependencies || []
    }
    
    this.cache.set(key, entry)
    this.notifySubscribers(key)
    
    // Log para debug
    console.log(`[Cache] Set: ${key} (TTL: ${finalConfig.ttl}ms, Version: ${entry.version})`)
  }

  // Buscar no cache com validação
  get<T>(key: string, config?: CacheConfig): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const defaultConfig = this.getDefaultConfig(key)
    const finalConfig = { ...defaultConfig, ...config }

    // Verificar TTL
    const now = Date.now()
    const isExpired = (now - entry.timestamp) > (finalConfig.ttl || 0)
    
    // Verificar versão
    const isOutdated = finalConfig.version && entry.version !== finalConfig.version
    
    // Forçar refresh
    const forceRefresh = finalConfig.forceRefresh
    
    if (isExpired || isOutdated || forceRefresh) {
      console.log(`[Cache] Miss: ${key} (expired: ${isExpired}, outdated: ${isOutdated}, forced: ${forceRefresh})`)
      this.cache.delete(key)
      return null
    }

    console.log(`[Cache] Hit: ${key} (age: ${Math.round((now - entry.timestamp) / 1000)}s)`)
    return entry.data
  }

  // Invalidar cache por chave ou padrão
  invalidate(keyOrPattern: string): void {
    if (keyOrPattern.includes('*')) {
      // Invalidar por padrão
      const pattern = keyOrPattern.replace('*', '')
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
          this.notifySubscribers(key)
        }
      }
    } else {
      // Invalidar chave específica
      this.cache.delete(keyOrPattern)
      this.notifySubscribers(keyOrPattern)
    }
    
    console.log(`[Cache] Invalidated: ${keyOrPattern}`)
  }

  // Invalidar por dependências
  invalidateByDependency(dependency: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.dependencies.includes(dependency)) {
        this.cache.delete(key)
        this.notifySubscribers(key)
      }
    }
    
    console.log(`[Cache] Invalidated by dependency: ${dependency}`)
  }

  // Pre-aquecer cache
  async warmup(keys: string[], fetcher: (key: string) => Promise<any>): Promise<void> {
    console.log(`[Cache] Warming up ${keys.length} keys...`)
    
    const promises = keys.map(async (key) => {
      try {
        const data = await fetcher(key)
        this.set(key, data)
      } catch (error) {
        console.warn(`[Cache] Warmup failed for ${key}:`, error)
      }
    })
    
    await Promise.all(promises)
    console.log('[Cache] Warmup completed')
  }

  // Subscrever a mudanças no cache
  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)
    
    return () => {
      this.subscribers.get(key)?.delete(callback)
    }
  }

  private notifySubscribers(key: string): void {
    this.subscribers.get(key)?.forEach(callback => callback())
  }

  private getDefaultConfig(key: string): CacheConfig {
    for (const [type, config] of Object.entries(this.defaultConfigs)) {
      if (key.includes(type)) {
        return config
      }
    }
    return { ttl: 5 * 60 * 1000, version: '1.0' } // Default: 5 minutos
  }

  // Estatísticas do cache
  getStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000),
      version: entry.version,
      dependencies: entry.dependencies.length
    }))

    return {
      size: this.cache.size,
      subscribers: this.subscribers.size,
      entries
    }
  }

  // Limpar cache expirado
  cleanup(): void {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of this.cache.entries()) {
      const config = this.getDefaultConfig(key)
      const isExpired = (now - entry.timestamp) > (config.ttl || 0)
      
      if (isExpired) {
        this.cache.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired entries`)
    }
  }
}

// Instância singleton
const cacheSystem = new IntelligentCacheSystem()

// Hook para usar cache inteligente
export const useIntelligentCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  config?: CacheConfig
) => {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useFirebaseAuth()

  // Gerar chave única por usuário
  const cacheKey = user ? `${key}_${user.uid}` : key

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      // Tentar buscar no cache primeiro
      if (!forceRefresh) {
        const cached = cacheSystem.get<T>(cacheKey, config)
        if (cached) {
          setData(cached)
          setLoading(false)
          return cached
        }
      }

      // Buscar dados frescos
      console.log(`[useIntelligentCache] Fetching fresh data for ${cacheKey}`)
      const freshData = await fetcher()
      
      // Salvar no cache
      cacheSystem.set(cacheKey, freshData, config)
      setData(freshData)
      
      return freshData
    } catch (err) {
      const error = err as Error
      console.error(`[useIntelligentCache] Error fetching ${cacheKey}:`, error)
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [cacheKey, fetcher, config])

  // Invalidar cache
  const invalidate = useCallback(() => {
    cacheSystem.invalidate(cacheKey)
    setData(null)
  }, [cacheKey])

  // Atualizar dados
  const refresh = useCallback(() => {
    return fetchData(true)
  }, [fetchData])

  // Carregar dados na inicialização
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  // Subscrever a mudanças no cache
  useEffect(() => {
    return cacheSystem.subscribe(cacheKey, () => {
      const cached = cacheSystem.get<T>(cacheKey)
      if (cached) {
        setData(cached)
      }
    })
  }, [cacheKey])

  // Cleanup automático
  useEffect(() => {
    const interval = setInterval(() => {
      cacheSystem.cleanup()
    }, 60000) // A cada minuto

    return () => clearInterval(interval)
  }, [])

  return {
    data,
    loading,
    error,
    invalidate,
    refresh,
    cacheStats: cacheSystem.getStats()
  }
}

// Hook para pre-aquecer cache
export const useCacheWarmup = () => {
  const warmupUserData = useCallback(async (userId: string) => {
    const keys = [
      `userProgress_${userId}`,
      `unifiedScores_${userId}`,
      `gameProgress_${userId}`,
      `rankings_general`,
      `moduleSettings_general`
    ]

    await cacheSystem.warmup(keys, async (key) => {
      // Implementar fetcher específico para cada tipo
      // Por ora, apenas simular
      return Promise.resolve(null)
    })
  }, [])

  const invalidateUserData = useCallback((userId: string) => {
    cacheSystem.invalidate(`*_${userId}`)
    cacheSystem.invalidateByDependency(userId)
  }, [])

  return {
    warmupUserData,
    invalidateUserData,
    cacheStats: cacheSystem.getStats()
  }
}

export default cacheSystem