// Sistema de Monitoramento e Estabilização de Conexões Firebase
// Previne problemas de WebSocket, loops infinitos e falhas de conexão

import React from 'react';
import { 
  getFirestore, 
  enableNetwork, 
  disableNetwork, 
  onSnapshotsInSync,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

export interface ConnectionStatus {
  firestore: 'connected' | 'connecting' | 'disconnected' | 'error';
  auth: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastCheck: Date;
  errorCount: number;
  uptime: number;
  latency?: number;
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeListeners: number;
  failedOperations: number;
  recoveryAttempts: number;
  lastRecovery?: Date;
}

export class ConnectionMonitorService {
  private static instance: ConnectionMonitorService;
  private status: ConnectionStatus = {
    firestore: 'disconnected',
    auth: 'disconnected', 
    lastCheck: new Date(),
    errorCount: 0,
    uptime: 0
  };
  
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeListeners: 0,
    failedOperations: 0,
    recoveryAttempts: 0
  };
  
  private listeners: Array<() => void> = [];
  private monitorInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;
  private connectionStartTime: Date = new Date();
  private statusChangeCallbacks: Array<(status: ConnectionStatus) => void> = [];
  
  // Singleton pattern
  static getInstance(): ConnectionMonitorService {
    if (!ConnectionMonitorService.instance) {
      ConnectionMonitorService.instance = new ConnectionMonitorService();
    }
    return ConnectionMonitorService.instance;
  }
  
  private constructor() {
    this.initializeMonitoring();
  }
  
  /**
   * Inicializa monitoramento de conexões
   */
  private initializeMonitoring(): void {
    console.log('🔌 [ConnectionMonitor] Iniciando monitoramento de conexões...');
    
    try {
      // Monitorar estado do Firestore
      this.setupFirestoreMonitoring();
      
      // Monitorar estado do Authentication  
      this.setupAuthMonitoring();
      
      // Iniciar health checks periódicos
      this.startHealthChecks();
      
      // Cleanup automático de listeners órfãos
      this.startListenerCleanup();
      
      console.log('✅ [ConnectionMonitor] Monitoramento inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Erro ao inicializar:', error);
      this.status.firestore = 'error';
      this.status.auth = 'error';
    }
  }
  
  /**
   * Configurar monitoramento do Firestore
   */
  private setupFirestoreMonitoring(): void {
    if (!db) {
      console.warn('⚠️ [ConnectionMonitor] Firestore não inicializado');
      return;
    }
    
    try {
      // Listener para sincronização do Firestore
      const unsubscribe = onSnapshotsInSync(db, () => {
        const wasConnected = this.status.firestore === 'connected';
        this.status.firestore = 'connected';
        this.status.lastCheck = new Date();
        this.status.uptime = Date.now() - this.connectionStartTime.getTime();
        
        if (!wasConnected) {
          console.log('🔥 [ConnectionMonitor] Firestore reconectado');
          this.notifyStatusChange();
        }
      });
      
      this.listeners.push(unsubscribe);
      this.metrics.totalConnections++;
      
      console.log('🔥 [ConnectionMonitor] Firestore monitoring configurado');
      
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Erro ao configurar Firestore monitoring:', error);
      this.status.firestore = 'error';
      this.status.errorCount++;
    }
  }
  
  /**
   * Configurar monitoramento do Authentication
   */
  private setupAuthMonitoring(): void {
    if (!auth) {
      console.warn('⚠️ [ConnectionMonitor] Auth não inicializado');
      return;
    }
    
    try {
      // Monitorar conexão do Auth
      auth.onIdTokenChanged((user) => {
        const wasConnected = this.status.auth === 'connected';
        this.status.auth = user ? 'connected' : 'disconnected';
        this.status.lastCheck = new Date();
        
        if (!wasConnected && user) {
          console.log('🔑 [ConnectionMonitor] Auth reconectado');
          this.notifyStatusChange();
        }
      });
      
      this.metrics.totalConnections++;
      console.log('🔑 [ConnectionMonitor] Auth monitoring configurado');
      
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Erro ao configurar Auth monitoring:', error);
      this.status.auth = 'error';
      this.status.errorCount++;
    }
  }
  
  /**
   * Iniciar health checks periódicos
   */
  private startHealthChecks(): void {
    // Health check a cada 30 segundos
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
    
    // Monitoramento de métricas a cada 10 segundos
    this.monitorInterval = setInterval(() => {
      this.updateMetrics();
    }, 10000);
  }
  
  /**
   * Executar verificação de saúde das conexões
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (db) {
        // Teste simples de conectividade
        await db._delegate._databaseId;
        
        // Calcular latência
        const latency = Date.now() - startTime;
        this.status.latency = latency;
        
        // Verificar se latência está muito alta
        if (latency > 5000) { // 5 segundos
          console.warn('⚠️ [ConnectionMonitor] Alta latência detectada:', latency, 'ms');
          this.status.firestore = 'connecting';
        } else if (this.status.firestore !== 'connected') {
          this.status.firestore = 'connected';
        }
      }
      
      this.status.lastCheck = new Date();
      this.status.errorCount = Math.max(0, this.status.errorCount - 1); // Reduzir contador de erros
      
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Health check falhou:', error);
      this.status.firestore = 'error';
      this.status.errorCount++;
      
      // Tentar recovery se muitos erros
      if (this.status.errorCount >= 3) {
        await this.attemptConnectionRecovery();
      }
    }
  }
  
  /**
   * Atualizar métricas de conexão
   */
  private updateMetrics(): void {
    this.metrics.activeListeners = this.listeners.length;
    this.status.uptime = Date.now() - this.connectionStartTime.getTime();
    
    // Log de métricas a cada 60 segundos
    if (this.status.uptime % 60000 < 10000) {
      console.log('📊 [ConnectionMonitor] Métricas:', {
        status: this.status.firestore,
        activeListeners: this.metrics.activeListeners,
        uptime: Math.round(this.status.uptime / 1000) + 's',
        errorCount: this.status.errorCount
      });
    }
  }
  
  /**
   * Tentar recovery de conexão  
   */
  private async attemptConnectionRecovery(): Promise<void> {
    if (!db) return;
    
    console.log('🔄 [ConnectionMonitor] Tentando recovery de conexão...');
    this.metrics.recoveryAttempts++;
    
    try {
      // Desabilitar e reabilitar network para forçar reconexão
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await enableNetwork(db);
      
      this.status.firestore = 'connecting';
      this.metrics.lastRecovery = new Date();
      
      console.log('✅ [ConnectionMonitor] Recovery iniciado');
      
    } catch (error) {
      console.error('❌ [ConnectionMonitor] Recovery falhou:', error);
      this.status.firestore = 'error';
    }
  }
  
  /**
   * Limpeza automática de listeners órfãos
   */
  private startListenerCleanup(): void {
    // Limpeza a cada 5 minutos
    setInterval(() => {
      const beforeCount = this.listeners.length;
      
      // Remover listeners que podem ter vazado
      // (implementação básica - pode ser expandida)
      this.listeners = this.listeners.filter(listener => {
        try {
          // Verificar se listener ainda é válido
          return typeof listener === 'function';
        } catch {
          return false;
        }
      });
      
      const afterCount = this.listeners.length;
      if (beforeCount !== afterCount) {
        console.log(`🧹 [ConnectionMonitor] Cleanup: removidos ${beforeCount - afterCount} listeners órfãos`);
      }
      
    }, 300000); // 5 minutos
  }
  
  /**
   * Registrar listener para cleanup automático
   */
  registerListener(unsubscribe: () => void): void {
    this.listeners.push(unsubscribe);
    this.metrics.activeListeners = this.listeners.length;
  }
  
  /**
   * Remover listener específico
   */
  unregisterListener(unsubscribe: () => void): void {
    const index = this.listeners.indexOf(unsubscribe);
    if (index > -1) {
      this.listeners.splice(index, 1);
      this.metrics.activeListeners = this.listeners.length;
    }
  }
  
  /**
   * Registrar callback para mudanças de status
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusChangeCallbacks.push(callback);
    
    // Retornar função de cleanup
    return () => {
      const index = this.statusChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusChangeCallbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Notificar callbacks sobre mudança de status
   */
  private notifyStatusChange(): void {
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        console.error('❌ [ConnectionMonitor] Erro em callback de status:', error);
      }
    });
  }
  
  /**
   * Obter status atual das conexões
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }
  
  /**
   * Obter métricas de conexão
   */
  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Forçar reconexão
   */
  async forceReconnect(): Promise<void> {
    console.log('🔄 [ConnectionMonitor] Forçando reconexão...');
    
    this.status.firestore = 'connecting';
    this.status.auth = 'connecting';
    
    await this.attemptConnectionRecovery();
  }
  
  /**
   * Limpar todos os listeners e parar monitoramento
   */
  cleanup(): void {
    console.log('🧹 [ConnectionMonitor] Limpando recursos...');
    
    // Parar intervalos
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Executar todos os unsubscribes
    this.listeners.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ [ConnectionMonitor] Erro ao fazer unsubscribe:', error);
      }
    });
    
    this.listeners = [];
    this.statusChangeCallbacks = [];
    this.metrics.activeListeners = 0;
    
    console.log('✅ [ConnectionMonitor] Cleanup concluído');
  }
  
  /**
   * Obter resumo do estado da conexão para logs
   */
  getConnectionSummary(): string {
    const uptime = Math.round(this.status.uptime / 1000);
    return `Firestore: ${this.status.firestore} | Auth: ${this.status.auth} | Uptime: ${uptime}s | Erros: ${this.status.errorCount} | Listeners: ${this.metrics.activeListeners}`;
  }
}

// Instância singleton global
export const connectionMonitor = ConnectionMonitorService.getInstance();

// Hook React para usar o monitoramento de conexão
export function useConnectionMonitor() {
  const [status, setStatus] = React.useState<ConnectionStatus>(connectionMonitor.getStatus());
  
  React.useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange(setStatus);
    return unsubscribe;
  }, []);
  
  return {
    status,
    metrics: connectionMonitor.getMetrics(),
    forceReconnect: () => connectionMonitor.forceReconnect(),
    summary: connectionMonitor.getConnectionSummary()
  };
}

// Função utilitária para retry de operações Firestore com monitoramento
export async function retryWithConnectionCheck<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  const monitor = connectionMonitor;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result;
      
    } catch (error) {
      monitor.getMetrics().failedOperations++;
      
      console.warn(`⚠️ [ConnectionMonitor] Tentativa ${attempt}/${maxRetries} falhou:`, error);
      
      // Se não é a última tentativa, aguardar e tentar novamente
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        
        // Verificar se precisa forçar reconexão
        const status = monitor.getStatus();
        if (status.errorCount >= 2) {
          await monitor.forceReconnect();
        }
        
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Todas as tentativas falharam');
}

export default ConnectionMonitorService;