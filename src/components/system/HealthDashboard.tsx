'use client'

// Dashboard de Saúde do Sistema - Monitoramento em tempo real
// Exibe métricas, alertas e permite ações corretivas

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Zap,
  Bell,
  Settings,
  Shield,
  Database,
  Gauge
} from 'lucide-react'
import { SystemHealthService, SystemHealthMetrics, HealthAlert } from '@/services/systemHealthService'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface HealthDashboardProps {
  professorId: string
  compactMode?: boolean
}

export function HealthDashboard({ professorId, compactMode = false }: HealthDashboardProps) {
  const { user } = useAuth()
  
  // Estado das métricas
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null)
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // UI state
  const [showDetails, setShowDetails] = useState(!compactMode)
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    loadHealthData()
    
    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => {
      loadHealthData(true)
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [professorId])

  /**
   * Carrega dados de saúde e alertas
   */
  const loadHealthData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      
      // Executar verificação de saúde se for refresh manual
      let metrics: SystemHealthMetrics
      if (isRefresh) {
        metrics = await SystemHealthService.performHealthCheck()
      } else {
        const recentMetrics = await SystemHealthService.getRecentHealthMetrics(1)
        if (recentMetrics.length > 0) {
          metrics = recentMetrics[0]
        } else {
          // Primeira execução - fazer verificação completa
          metrics = await SystemHealthService.performHealthCheck()
        }
      }
      
      // Buscar alertas não lidos
      const userAlerts = await SystemHealthService.getAlertsForProfessor(professorId)
      
      setHealthMetrics(metrics)
      setAlerts(userAlerts)
      setLastUpdated(new Date())
      
    } catch (error) {
      console.error('Erro ao carregar dados de saúde:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  /**
   * Marcar alerta como lido
   */
  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await SystemHealthService.markAlertAsRead(alertId)
      setAlerts(prev => prev.filter(alert => alert.id !== alertId))
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
    }
  }

  /**
   * Executar verificação manual
   */
  const handleManualRefresh = () => {
    loadHealthData(true)
  }

  /**
   * Obter ícone baseado na saúde geral
   */
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Activity className="h-5 w-5 text-gray-600" />
    }
  }

  /**
   * Obter cor baseada na saúde
   */
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  /**
   * Formatar tempo relativo
   */
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'agora mesmo'
    if (diffMins < 60) return `${diffMins}min atrás`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  if (loading && !healthMetrics) {
    return (
      <Card className={compactMode ? 'p-4' : ''}>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Verificando saúde do sistema...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!healthMetrics) {
    return (
      <Card className={compactMode ? 'p-4' : ''}>
        <CardContent className="text-center p-6">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Dados de saúde não disponíveis</p>
          <Button onClick={handleManualRefresh} className="mt-2" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Verificar Agora
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Modo compacto - apenas status geral e alertas críticos
  if (compactMode) {
    const criticalAlerts = alerts.filter(alert => alert.type === 'critical' || alert.type === 'error')
    
    return (
      <Card className={`border-l-4 ${getHealthColor(healthMetrics.overallHealth)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getHealthIcon(healthMetrics.overallHealth)}
              <div>
                <h3 className="font-semibold capitalize">
                  Sistema {healthMetrics.overallHealth === 'healthy' ? 'Saudável' : 
                          healthMetrics.overallHealth === 'warning' ? 'com Alertas' :
                          healthMetrics.overallHealth === 'critical' ? 'Crítico' : 'com Erro'}
                </h3>
                <p className="text-sm text-gray-600">
                  {healthMetrics.classMetrics.activeClasses} turmas ativas
                  {criticalAlerts.length > 0 && ` • ${criticalAlerts.length} alertas`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-2">
              Última verificação: {formatRelativeTime(lastUpdated)}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Status Geral */}
      <Card className={`border-l-4 ${getHealthColor(healthMetrics.overallHealth)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getHealthIcon(healthMetrics.overallHealth)}
              <div>
                <CardTitle className="text-xl capitalize">
                  Sistema {healthMetrics.overallHealth === 'healthy' ? 'Saudável' : 
                          healthMetrics.overallHealth === 'warning' ? 'com Alertas' :
                          healthMetrics.overallHealth === 'critical' ? 'Crítico' : 'com Erro'}
                </CardTitle>
                <p className="text-gray-600">
                  Monitoramento em tempo real da plataforma educacional
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Verificando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas Críticos */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-red-600" />
              Alertas do Sistema ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                    alert.type === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.type === 'error' ? 'border-red-400 bg-red-50' :
                    alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  } ${expandedAlert === alert.id ? 'shadow-md' : 'hover:shadow-sm'}`}
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant={alert.type === 'critical' || alert.type === 'error' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatRelativeTime(alert.createdAt)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {alert.message}
                      </p>
                      
                      {expandedAlert === alert.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Categoria: {alert.category}
                            </span>
                            <div className="space-x-2">
                              {alert.actionUrl && (
                                <Button size="sm" variant="outline" className="text-xs">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Ver Detalhes
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAlertAsRead(alert.id)
                                }}
                                className="text-xs"
                              >
                                Marcar como Lido
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Turmas */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Turmas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.classMetrics.activeClasses}
                </p>
                <p className="text-xs text-gray-500">
                  de {healthMetrics.classMetrics.totalClasses} total
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            {healthMetrics.classMetrics.recentCreations > 0 && (
              <div className="flex items-center mt-3 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">
                  +{healthMetrics.classMetrics.recentCreations} hoje
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Usuários</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.userMetrics.totalUsers}
                </p>
                <p className="text-xs text-gray-500">
                  {healthMetrics.userMetrics.professorsCount} professores
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.performanceMetrics.averageQueryTime}ms
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {healthMetrics.performanceMetrics.dbConnectionHealth}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                healthMetrics.performanceMetrics.dbConnectionHealth === 'connected' ? 'bg-green-100' : 
                healthMetrics.performanceMetrics.dbConnectionHealth === 'slow' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <Zap className={`h-6 w-6 ${
                  healthMetrics.performanceMetrics.dbConnectionHealth === 'connected' ? 'text-green-600' : 
                  healthMetrics.performanceMetrics.dbConnectionHealth === 'slow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {healthMetrics.detectedIssues.length}
                </p>
                <p className="text-xs text-gray-500">
                  {healthMetrics.detectedIssues.filter(i => !i.resolvedAt).length} pendentes
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                healthMetrics.detectedIssues.length === 0 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Shield className={`h-6 w-6 ${
                  healthMetrics.detectedIssues.length === 0 ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues Detalhadas */}
      {healthMetrics.detectedIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Issues Detectadas ({healthMetrics.detectedIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthMetrics.detectedIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    issue.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                    issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant={issue.severity === 'critical' || issue.severity === 'high' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        {issue.resolvedAt && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            RESOLVIDA
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {issue.title}
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Afetados: {issue.affectedCount} • 
                          Detectado: {formatRelativeTime(issue.detectedAt)}
                          {issue.resolvedAt && ` • Resolvido: ${formatRelativeTime(issue.resolvedAt)}`}
                        </span>
                        {issue.autoFixable && !issue.resolvedAt && (
                          <Badge variant="outline" className="text-xs">
                            Correção Automática Disponível
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recovery Actions */}
      {healthMetrics.recoveryActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Ações de Recovery Executadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthMetrics.recoveryActions.map((action, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    action.status === 'completed' ? 'border-green-500 bg-green-50' :
                    action.status === 'failed' ? 'border-red-500 bg-red-50' :
                    action.status === 'running' ? 'border-blue-500 bg-blue-50' :
                    'border-gray-500 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge 
                          variant={action.status === 'completed' ? 'default' : 
                                  action.status === 'failed' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {action.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">
                          {action.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      {action.result && (
                        <p className="text-sm text-gray-700">
                          {action.result}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Executado: {formatRelativeTime(action.executedAt)}
                        {action.completedAt && ` • Concluído: ${formatRelativeTime(action.completedAt)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  Última verificação: {healthMetrics.timestamp.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>Sistema de Monitoramento Ativo</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {lastUpdated && (
                <span className="text-xs">
                  Atualizado: {formatRelativeTime(lastUpdated)}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDetails(!showDetails)}
              >
                <Gauge className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}