'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  Home, 
  Mail,
  Clock,
  Info
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  showDetails?: boolean
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  timestamp: Date
}

// Função para gerar ID único do erro
function generateErrorId(): string {
  return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

// Função para log estruturado de erros
function logError(error: Error, errorInfo: ErrorInfo, errorId: string): void {
  const errorData = {
    errorId,
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userId: typeof window !== 'undefined' ? localStorage.getItem('user-id') : null,
  }

  // Log detalhado no console
  console.group(`🚨 Error Boundary Triggered - ${errorId}`)
  console.error('Error:', error)
  console.error('Error Info:', errorInfo)
  console.error('Full Error Data:', errorData)
  console.groupEnd()

  // Em produção, enviar para serviço de monitoramento
  if (process.env.NODE_ENV === 'production') {
    // Aqui você pode integrar com Sentry, LogRocket, etc.
    // Ex: Sentry.captureException(error, { extra: errorData })
  }
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null

  constructor(props: Props) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: new Date()
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Atualizar state para mostrar a UI de erro
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      timestamp: new Date()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || generateErrorId()
    
    // Log do erro
    logError(error, errorInfo, errorId)
    
    // Atualizar state com informações completas
    this.setState({
      error,
      errorInfo,
      errorId
    })

    // Callback personalizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    // Reset automático baseado em mudanças de props
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }

    // Reset baseado em keys específicas
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (resetKey, idx) => prevProps.resetKeys![idx] !== resetKey
      )
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary()
      }
    }
  }

  resetErrorBoundary = () => {
    // Limpar timeout anterior se existir
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      timestamp: new Date()
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReportError = () => {
    const { error, errorId, timestamp } = this.state
    const subject = `Bug Report - ${errorId}`
    const body = `
Erro ID: ${errorId}
Timestamp: ${timestamp.toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}

Erro: ${error?.name || 'Unknown'}
Mensagem: ${error?.message || 'Sem mensagem'}

Stack Trace:
${error?.stack || 'Não disponível'}

Descrição adicional:
[Descreva o que você estava fazendo quando o erro ocorreu]
    `.trim()

    const mailtoLink = `mailto:suporte@avalianutri.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink)
  }

  render() {
    const { hasError, error, errorInfo, errorId, timestamp } = this.state
    const { children, fallback, showDetails = false } = this.props

    if (hasError) {
      // Usar fallback customizado se fornecido
      if (fallback) {
        return fallback
      }

      // UI padrão de erro
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-red-200 shadow-lg">
            <CardContent className="p-8">
              {/* Header do erro */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Algo deu errado
                </h1>
                <p className="text-gray-600 mb-4">
                  Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada automaticamente.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Badge variant="outline" className="font-mono">
                    {errorId}
                  </Badge>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timestamp.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>

              {/* Ações principais */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button onClick={this.resetErrorBoundary} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Recarregar Página
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Ir para Início
                </Button>
              </div>

              {/* Ações secundárias */}
              <div className="text-center mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={this.handleReportError}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reportar Este Erro
                </Button>
              </div>

              {/* Detalhes técnicos (modo debug) */}
              {showDetails && error && (
                <details className="bg-gray-100 rounded-lg p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    Detalhes Técnicos
                  </summary>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Erro:</h4>
                      <p className="text-red-600 font-mono bg-red-50 p-2 rounded border">
                        {error.name}: {error.message}
                      </p>
                    </div>

                    {error.stack && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Stack Trace:</h4>
                        <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto text-gray-700">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo && errorInfo.componentStack && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">Component Stack:</h4>
                        <pre className="text-xs bg-blue-50 p-2 rounded border overflow-x-auto text-blue-700">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Informações do Sistema:</h4>
                      <div className="text-xs bg-gray-50 p-2 rounded border space-y-1">
                        <p><strong>URL:</strong> {window.location.href}</p>
                        <p><strong>User Agent:</strong> {navigator.userAgent}</p>
                        <p><strong>Timestamp:</strong> {timestamp.toISOString()}</p>
                      </div>
                    </div>
                  </div>
                </details>
              )}

              {/* Informações de contato */}
              <div className="text-center text-sm text-gray-500 mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Precisa de Ajuda?</span>
                </div>
                <p className="text-blue-700">
                  Se o problema persistir, entre em contato com nossa equipe de suporte em{' '}
                  <a href="mailto:suporte@avalianutri.com" className="underline hover:text-blue-800">
                    suporte@avalianutri.com
                  </a>
                  {' '}e mencione o código do erro: <strong>{errorId}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Hook para uso funcional do Error Boundary
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: ErrorInfo) => {
    const errorId = generateErrorId()
    if (errorInfo) {
      logError(error, errorInfo, errorId)
    } else {
      console.error(`🚨 Error caught by useErrorHandler - ${errorId}:`, error)
    }
  }, [])
}

export default ErrorBoundary