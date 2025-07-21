'use client'

// Hook personalizado para monitoramento de saúde do sistema
// Facilita integração do sistema de health monitoring em qualquer componente

import { useState, useEffect, useCallback } from 'react'
import { SystemHealthService, SystemHealthMetrics, HealthAlert } from '@/services/systemHealthService'
import { useAuth } from '@/hooks/useHybridAuth'
import { parseFirebaseDate } from '@/utils/dateUtils'

interface UseSystemHealthOptions {
  autoRefresh?: boolean          // Auto-atualizar periodicamente
  refreshInterval?: number       // Intervalo em ms (padrão: 5 minutos)
  loadAlerts?: boolean          // Carregar alertas do usuário
  compactMode?: boolean         // Modo compacto (menos dados)
  onHealthChange?: (health: SystemHealthMetrics['overallHealth']) => void
  onAlert?: (alerts: HealthAlert[]) => void
}

export function useSystemHealth(options: UseSystemHealthOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutos
    loadAlerts = true,
    compactMode = false,
    onHealthChange,
    onAlert
  } = options
  
  const { user } = useAuth()
  
  // Estados principais
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null)
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Estados derivados
  const [isHealthy, setIsHealthy] = useState(true)
  const [hasAlerts, setHasAlerts] = useState(false)
  const [criticalIssues, setCriticalIssues] = useState(0)

  /**
   * Carrega dados de saúde
   */
  const loadHealthData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null)
      
      if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      let metrics: SystemHealthMetrics
      
      if (forceRefresh) {
        // Refresh forçado - executar verificação completa
        metrics = await SystemHealthService.performHealthCheck()
      } else {
        // Carregar dados recentes primeiro, verificar se necessário
        const recentMetrics = await SystemHealthService.getRecentHealthMetrics(1)
        
        if (recentMetrics.length > 0) {
          const latestMetrics = recentMetrics[0]
          const timestampDate = parseFirebaseDate(latestMetrics.timestamp)
          const isRecent = timestampDate ? 
            new Date().getTime() - timestampDate.getTime() < refreshInterval : 
            false
          
          if (isRecent && !compactMode) {
            metrics = latestMetrics
          } else {
            // Dados antigos ou modo compacto - executar verificação
            metrics = await SystemHealthService.performHealthCheck()
          }
        } else {
          // Primeira execução
          metrics = await SystemHealthService.performHealthCheck()
        }
      }
      
      setHealthMetrics(metrics)
      
      // Atualizar estados derivados
      const healthy = metrics.overallHealth === 'healthy'
      setIsHealthy(healthy)
      
      const criticalCount = metrics.detectedIssues.filter(
        issue => issue.severity === 'critical' && !issue.resolvedAt
      ).length
      setCriticalIssues(criticalCount)
      
      // Carregar alertas do usuário se necessário
      if (loadAlerts && user?.uid) {
        const userAlerts = await SystemHealthService.getAlertsForProfessor(user.uid)
        setAlerts(userAlerts)
        setHasAlerts(userAlerts.length > 0)
        
        // Callback para novos alertas
        if (onAlert) {
          onAlert(userAlerts)
        }
      }
      
      setLastUpdated(new Date())
      
      // Callback para mudança de saúde
      if (onHealthChange) {
        onHealthChange(metrics.overallHealth)
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao carregar dados de saúde:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user?.uid, loadAlerts, compactMode, refreshInterval, onHealthChange, onAlert])

  /**
   * Marcar alerta como lido
   */
  const markAlertAsRead = useCallback(async (alertId: string) => {
    try {
      await SystemHealthService.markAlertAsRead(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      setHasAlerts(alerts.length > 1) // Atualizar flag
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err)
    }
  }, [alerts.length])

  /**
   * Refresh manual
   */
  const refresh = useCallback(() => {
    loadHealthData(true)
  }, [loadHealthData])

  /**
   * Obter resumo rápido da saúde
   */
  const getHealthSummary = useCallback(() => {
    if (!healthMetrics) return null
    
    return {
      status: healthMetrics.overallHealth,
      statusText: healthMetrics.overallHealth === 'healthy' ? 'Saudável' : 
                  healthMetrics.overallHealth === 'warning' ? 'Com Alertas' :
                  healthMetrics.overallHealth === 'critical' ? 'Crítico' : 'Com Erro',
      activeClasses: healthMetrics.classMetrics.activeClasses,
      totalClasses: healthMetrics.classMetrics.totalClasses,
      issues: healthMetrics.detectedIssues.length,
      alerts: alerts.length,
      lastCheck: healthMetrics.timestamp
    }
  }, [healthMetrics, alerts.length])

  /**
   * Verificar se há issues críticas não resolvidas
   */
  const hasCriticalIssues = useCallback(() => {
    if (!healthMetrics) return false
    
    return healthMetrics.detectedIssues.some(
      issue => issue.severity === 'critical' && !issue.resolvedAt
    )
  }, [healthMetrics])

  /**
   * Obter issues por categoria
   */
  const getIssuesByCategory = useCallback(() => {
    if (!healthMetrics) return {}
    
    const categories: Record<string, number> = {}
    
    healthMetrics.detectedIssues.forEach(issue => {
      if (!issue.resolvedAt) {
        categories[issue.category] = (categories[issue.category] || 0) + 1
      }
    })
    
    return categories
  }, [healthMetrics])

  // Efeito inicial - carregar dados
  useEffect(() => {
    if (user?.uid) {
      loadHealthData()
    }
  }, [user?.uid, loadHealthData])

  // Efeito de auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user?.uid) return
    
    const interval = setInterval(() => {
      loadHealthData(true)
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [autoRefresh, user?.uid, refreshInterval, loadHealthData])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      setHealthMetrics(null)
      setAlerts([])
      setLoading(true)
      setError(null)
    }
  }, [])

  return {
    // Dados principais
    healthMetrics,
    alerts,
    
    // Estados de UI
    loading,
    refreshing,
    error,
    lastUpdated,
    
    // Estados derivados
    isHealthy,
    hasAlerts,
    criticalIssues,
    
    // Ações
    refresh,
    markAlertAsRead,
    
    // Utilitários
    getHealthSummary,
    hasCriticalIssues,
    getIssuesByCategory,
    
    // Helpers para formatação
    formatRelativeTime: (date: Date) => {
      const parsedDate = parseFirebaseDate(date)
      if (!parsedDate) return 'data inválida'
      
      const now = new Date()
      const diffMs = now.getTime() - parsedDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      
      if (diffMins < 1) return 'agora mesmo'
      if (diffMins < 60) return `${diffMins}min atrás`
      
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours}h atrás`
      
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d atrás`
    },
    
    getHealthColor: (health: string) => {
      switch (health) {
        case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
        case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        case 'critical': return 'text-red-600 bg-red-50 border-red-200'
        case 'error': return 'text-red-600 bg-red-50 border-red-200'
        default: return 'text-gray-600 bg-gray-50 border-gray-200'
      }
    }
  }
}