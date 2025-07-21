'use client'

// Indicador Compacto de Saúde do Sistema
// Para ser usado em navegação, headers ou qualquer lugar que precise de status rápido

import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Bell,
  Zap
} from 'lucide-react'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { motion, AnimatePresence } from 'framer-motion'
// Popover component removed - using simple tooltip approach instead

interface HealthIndicatorProps {
  className?: string
  showRefreshButton?: boolean
  showDetailsPopover?: boolean
  onHealthChange?: (health: string) => void
  onAlertClick?: () => void
}

export function HealthIndicator({ 
  className = '', 
  showRefreshButton = true,
  showDetailsPopover = true,
  onHealthChange,
  onAlertClick
}: HealthIndicatorProps) {
  const {
    healthMetrics,
    alerts,
    loading,
    refreshing,
    isHealthy,
    hasAlerts,
    criticalIssues,
    refresh,
    formatRelativeTime,
    getHealthColor,
    getHealthSummary
  } = useSystemHealth({
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000, // 2 minutos para indicador
    loadAlerts: true,
    compactMode: true,
    onHealthChange
  })

  /**
   * Obter ícone baseado na saúde
   */
  const getHealthIcon = (health: string, size = 4) => {
    const iconClass = `h-${size} w-${size}`
    
    switch (health) {
      case 'healthy':
        return <CheckCircle className={`${iconClass} text-green-600`} />
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600`} />
      case 'critical':
        return <XCircle className={`${iconClass} text-red-600`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-600`} />
      default:
        return <Activity className={`${iconClass} text-gray-600`} />
    }
  }

  /**
   * Obter texto de status
   */
  const getStatusText = (health: string) => {
    switch (health) {
      case 'healthy': return 'Saudável'
      case 'warning': return 'Alerta'
      case 'critical': return 'Crítico'
      case 'error': return 'Erro'
      default: return 'Desconhecido'
    }
  }

  if (loading && !healthMetrics) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Verificando...</span>
      </div>
    )
  }

  if (!healthMetrics) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Activity className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Indisponível</span>
      </div>
    )
  }

  const summary = getHealthSummary()
  
  if (!showDetailsPopover) {
    // Versão simples sem popover
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          {getHealthIcon(healthMetrics.overallHealth)}
          <span className="text-sm font-medium">
            Sistema {getStatusText(healthMetrics.overallHealth)}
          </span>
        </div>
        
        {hasAlerts && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
              onClick={onAlertClick}
            >
              <Bell className="h-3 w-3" />
            </Button>
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
            >
              {alerts.length}
            </Badge>
          </motion.div>
        )}
        
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={refresh}
            disabled={refreshing}
            title="Atualizar status"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    )
  }

  // Versão simplificada sem popover (para evitar dependências)
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {getHealthIcon(healthMetrics.overallHealth)}
        <span className="text-sm font-medium">
          Sistema
        </span>
        <Badge 
          variant="outline" 
          className={`text-xs ${getHealthColor(healthMetrics.overallHealth)}`}
        >
          {getStatusText(healthMetrics.overallHealth)}
        </Badge>
      </div>
      
      {hasAlerts && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
            onClick={onAlertClick}
            title={`${alerts.length} alertas do sistema`}
          >
            <Bell className="h-3 w-3" />
          </Button>
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs flex items-center justify-center"
          >
            {alerts.length}
          </Badge>
        </motion.div>
      )}
      
      {showRefreshButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={refresh}
          disabled={refreshing}
          title="Atualizar status do sistema"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  )
}

// Componente simplificado apenas com ícone de status
export function HealthStatusIcon({ 
  className = '',
  size = 4 
}: { 
  className?: string
  size?: number 
}) {
  const { healthMetrics, loading } = useSystemHealth({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000,
    loadAlerts: false,
    compactMode: true
  })

  if (loading && !healthMetrics) {
    return (
      <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-blue-600 ${className}`}></div>
    )
  }

  if (!healthMetrics) {
    return <Activity className={`h-${size} w-${size} text-gray-400 ${className}`} />
  }

  const iconClass = `h-${size} w-${size}`
  
  switch (healthMetrics.overallHealth) {
    case 'healthy':
      return <CheckCircle className={`${iconClass} text-green-600 ${className}`} />
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-yellow-600 ${className}`} />
    case 'critical':
      return <XCircle className={`${iconClass} text-red-600 ${className}`} />
    case 'error':
      return <XCircle className={`${iconClass} text-red-600 ${className}`} />
    default:
      return <Activity className={`${iconClass} text-gray-600 ${className}`} />
  }
}

// Componente de badge de saúde
export function HealthBadge({ className = '' }: { className?: string }) {
  const { healthMetrics, loading, hasAlerts, alerts } = useSystemHealth({
    autoRefresh: true,
    refreshInterval: 3 * 60 * 1000,
    loadAlerts: true,
    compactMode: true
  })

  if (loading && !healthMetrics) {
    return (
      <Badge variant="outline" className={`animate-pulse ${className}`}>
        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
        Verificando...
      </Badge>
    )
  }

  if (!healthMetrics) {
    return (
      <Badge variant="outline" className={`text-gray-500 ${className}`}>
        <Activity className="h-3 w-3 mr-1" />
        Indisponível
      </Badge>
    )
  }

  const getVariant = (health: string) => {
    switch (health) {
      case 'healthy': return 'default'
      case 'warning': return 'secondary'  
      case 'critical': return 'destructive'
      case 'error': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusText = (health: string) => {
    switch (health) {
      case 'healthy': return 'Saudável'
      case 'warning': return 'Alerta'
      case 'critical': return 'Crítico'  
      case 'error': return 'Erro'
      default: return 'Desconhecido'
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Badge variant={getVariant(healthMetrics.overallHealth)}>
        {healthMetrics.overallHealth === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
        {healthMetrics.overallHealth === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
        {(healthMetrics.overallHealth === 'critical' || healthMetrics.overallHealth === 'error') && 
          <XCircle className="h-3 w-3 mr-1" />}
        Sistema {getStatusText(healthMetrics.overallHealth)}
      </Badge>
      
      {hasAlerts && (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative"
          >
            <Badge variant="destructive" className="text-xs">
              <Bell className="h-2 w-2 mr-1" />
              {alerts.length}
            </Badge>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}