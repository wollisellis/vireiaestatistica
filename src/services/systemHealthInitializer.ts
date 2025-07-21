// Inicializador do Sistema de Monitoramento de Saúde
// Auto-executa verificações e configura monitoramento contínuo

import { SystemHealthService } from './systemHealthService'

export class SystemHealthInitializer {
  private static instance: SystemHealthInitializer | null = null
  private healthInterval: NodeJS.Timeout | null = null
  private isInitialized = false
  
  private constructor() {}
  
  /**
   * Singleton instance
   */
  static getInstance(): SystemHealthInitializer {
    if (!SystemHealthInitializer.instance) {
      SystemHealthInitializer.instance = new SystemHealthInitializer()
    }
    return SystemHealthInitializer.instance
  }
  
  /**
   * Inicializa o sistema de monitoramento
   */
  async initialize(options: {
    autoStart?: boolean
    checkInterval?: number // em minutos
    runInitialCheck?: boolean
  } = {}): Promise<void> {
    const {
      autoStart = true,
      checkInterval = 15, // 15 minutos por padrão
      runInitialCheck = true
    } = options
    
    if (this.isInitialized) {
      console.log('🏥 [SystemHealthInitializer] Sistema já inicializado')
      return
    }
    
    try {
      console.log('🚀 [SystemHealthInitializer] Inicializando sistema de monitoramento...')
      
      // Executar verificação inicial se solicitado
      if (runInitialCheck) {
        console.log('🔍 [SystemHealthInitializer] Executando verificação inicial...')
        await SystemHealthService.performHealthCheck()
      }
      
      // Configurar monitoramento contínuo se solicitado
      if (autoStart) {
        this.startContinuousMonitoring(checkInterval)
      }
      
      this.isInitialized = true
      console.log(`✅ [SystemHealthInitializer] Sistema inicializado com sucesso (verificações a cada ${checkInterval}min)`)
      
    } catch (error) {
      console.error('❌ [SystemHealthInitializer] Erro na inicialização:', error)
      throw error
    }
  }
  
  /**
   * Inicia monitoramento contínuo
   */
  startContinuousMonitoring(intervalMinutes: number = 15): void {
    // Limpar intervalo existente se houver
    if (this.healthInterval) {
      clearInterval(this.healthInterval)
    }
    
    const intervalMs = intervalMinutes * 60 * 1000
    
    this.healthInterval = setInterval(async () => {
      try {
        console.log('🔄 [SystemHealthInitializer] Executando verificação periódica...')
        await SystemHealthService.performHealthCheck()
      } catch (error) {
        console.error('❌ [SystemHealthInitializer] Erro na verificação periódica:', error)
      }
    }, intervalMs)
    
    console.log(`⏰ [SystemHealthInitializer] Monitoramento contínuo ativo (${intervalMinutes}min)`)
  }
  
  /**
   * Para o monitoramento contínuo
   */
  stopContinuousMonitoring(): void {
    if (this.healthInterval) {
      clearInterval(this.healthInterval)
      this.healthInterval = null
      console.log('⏸️ [SystemHealthInitializer] Monitoramento contínuo parado')
    }
  }
  
  /**
   * Executa verificação manual
   */
  async runManualCheck(): Promise<void> {
    try {
      console.log('🔧 [SystemHealthInitializer] Executando verificação manual...')
      const metrics = await SystemHealthService.performHealthCheck()
      console.log(`✅ [SystemHealthInitializer] Verificação manual concluída - Status: ${metrics.overallHealth}`)
      return metrics
    } catch (error) {
      console.error('❌ [SystemHealthInitializer] Erro na verificação manual:', error)
      throw error
    }
  }
  
  /**
   * Reconfigura o intervalo de monitoramento
   */
  reconfigureMonitoring(newIntervalMinutes: number): void {
    if (this.healthInterval) {
      this.stopContinuousMonitoring()
      this.startContinuousMonitoring(newIntervalMinutes)
      console.log(`🔄 [SystemHealthInitializer] Intervalo reconfigurado para ${newIntervalMinutes}min`)
    }
  }
  
  /**
   * Status do inicializador
   */
  getStatus(): {
    isInitialized: boolean
    isMonitoring: boolean
    hasInterval: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isMonitoring: this.healthInterval !== null,
      hasInterval: this.healthInterval !== null
    }
  }
  
  /**
   * Cleanup completo
   */
  destroy(): void {
    this.stopContinuousMonitoring()
    this.isInitialized = false
    SystemHealthInitializer.instance = null
    console.log('🧹 [SystemHealthInitializer] Sistema de monitoramento destruído')
  }
}

// Função de conveniência para inicialização rápida
export const initializeSystemHealth = async (options?: {
  autoStart?: boolean
  checkInterval?: number
  runInitialCheck?: boolean
}): Promise<SystemHealthInitializer> => {
  const initializer = SystemHealthInitializer.getInstance()
  await initializer.initialize(options)
  return initializer
}

// Auto-inicialização quando o módulo é carregado (apenas no cliente)
if (typeof window !== 'undefined') {
  // Executar inicialização após um pequeno delay para permitir que a aplicação carregue
  setTimeout(() => {
    initializeSystemHealth({
      autoStart: true,
      checkInterval: 10, // 10 minutos para desenvolvimento
      runInitialCheck: true
    }).catch(error => {
      console.error('❌ Erro na auto-inicialização do sistema de monitoramento:', error)
    })
  }, 5000) // 5 segundos de delay
}

export default SystemHealthInitializer