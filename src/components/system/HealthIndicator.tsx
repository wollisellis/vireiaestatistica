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
  ChevronDown,
  Zap
} from 'lucide-react'
import { useSystemHealth } from '@/hooks/useSystemHealth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'

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

  // Versão com popover detalhado
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center space-x-2 h-auto px-3 py-1.5 hover:bg-gray-100 ${className}`}
        >
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
              <Bell className="h-3 w-3 text-red-600" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs flex items-center justify-center"
              >
                {alerts.length}
              </Badge>
            </motion.div>
          )}
          
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthMetrics.overallHealth)}
              <h3 className="font-semibold text-gray-900">
                Saúde do Sistema
              </h3>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={refresh}
                disabled={refreshing}
                title="Atualizar"
              >
                <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {/* Status Geral */}
          <div className={`p-3 rounded-lg mb-4 ${getHealthColor(healthMetrics.overallHealth)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {getStatusText(healthMetrics.overallHealth)}
                </p>
                <p className="text-sm opacity-80">
                  {summary?.activeClasses} turmas ativas
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {formatRelativeTime(healthMetrics.timestamp)}
              </Badge>
            </div>
          </div>
          
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {healthMetrics.classMetrics.activeClasses}
              </div>
              <div className="text-xs text-gray-600">Turmas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {healthMetrics.performanceMetrics.averageQueryTime}ms
              </div>
              <div className="text-xs text-gray-600">Resposta DB</div>
            </div>
          </div>
          
          {/* Issues Críticas */}
          {criticalIssues > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">
                  {criticalIssues} issue{criticalIssues > 1 ? 's' : ''} crítica{criticalIssues > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
          
          {/* Alertas Recentes */}
          {alerts.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Alertas ({alerts.length})
                </span>
                {onAlertClick && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs p-0 h-auto"
                    onClick={onAlertClick}
                  >
                    Ver todos
                  </Button>
                )}
              </div>
              
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2 rounded text-xs border-l-2 ${
                      alert.type === 'critical' || alert.type === 'error' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="font-medium mb-1 truncate">
                      {alert.title}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {formatRelativeTime(alert.createdAt)}
                    </div>
                  </div>
                ))}
                
                {alerts.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{alerts.length - 3} alertas adicionais
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Recovery Actions */}
          {healthMetrics.recoveryActions.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Recovery Automático
              </div>
              <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                <Zap className="h-3 w-3 inline mr-1" />
                {healthMetrics.recoveryActions.filter(a => a.status === 'completed').length} ações executadas
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Auto-atualização ativa
              </span>
              <span>
                {formatRelativeTime(healthMetrics.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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