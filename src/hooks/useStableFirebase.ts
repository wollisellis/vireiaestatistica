// Hook para Firebase estável com monitoramento de conexão integrado
// Previne loops infinitos, múltiplas conexões e falhas de WebSocket

import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { connectionMonitor, retryWithConnectionCheck } from '@/services/connectionMonitorService';

export interface StableFirebaseState {
  user: FirebaseUser | null;
  loading: boolean;
  connected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  error?: string;
}

/**
 * Hook principal para autenticação Firebase estável
 * - Gerencia uma única conexão WebSocket
 * - Monitora saúde da conexão  
 * - Implementa recovery automático
 * - Previne loops infinitos
 */
export function useStableFirebaseAuth(): StableFirebaseState {
  const [state, setState] = useState<StableFirebaseState>({
    user: null,
    loading: true,
    connected: false,
    connectionStatus: 'disconnected'
  });
  
  const authListenerRef = useRef<(() => void) | null>(null);
  const connectionListenerRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    // Evitar múltiplas inicializações
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;
    
    console.log('🔑 [StableFirebaseAuth] Inicializando...');
    
    const initializeAuth = async () => {
      try {
        if (!auth) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Firebase Auth não configurado',
            connectionStatus: 'error'
          }));
          return;
        }
        
        // 1. Configurar listener de autenticação (ÚNICO)
        authListenerRef.current = onAuthStateChanged(auth, 
          async (firebaseUser) => {
            console.log('🔄 [StableFirebaseAuth] Estado mudou:', firebaseUser ? 'autenticado' : 'desautenticado');
            
            setState(prev => ({
              ...prev,
              user: firebaseUser,
              loading: false
            }));
          },
          (error) => {
            console.error('❌ [StableFirebaseAuth] Erro de autenticação:', error);
            setState(prev => ({
              ...prev,
              loading: false,
              error: error.message,
              connectionStatus: 'error'
            }));
          }
        );
        
        // 2. Registrar listener no monitor de conexão
        connectionMonitor.registerListener(authListenerRef.current);
        
        // 3. Monitorar status de conexão
        connectionListenerRef.current = connectionMonitor.onStatusChange((status) => {
          setState(prev => ({
            ...prev,
            connected: status.firestore === 'connected' && status.auth === 'connected',
            connectionStatus: status.firestore === 'error' || status.auth === 'error' 
              ? 'error' 
              : status.firestore === 'connected' && status.auth === 'connected'
              ? 'connected'
              : 'connecting'
          }));
        });
        
        console.log('✅ [StableFirebaseAuth] Inicialização concluída');
        
      } catch (error) {
        console.error('❌ [StableFirebaseAuth] Erro na inicialização:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          connectionStatus: 'error'
        }));
      }
    };
    
    initializeAuth();
    
    // Cleanup function
    return () => {
      console.log('🧹 [StableFirebaseAuth] Cleanup iniciado');
      
      // Remover listeners
      if (authListenerRef.current) {
        try {
          authListenerRef.current();
          connectionMonitor.unregisterListener(authListenerRef.current);
        } catch (error) {
          console.error('❌ [StableFirebaseAuth] Erro no cleanup auth:', error);
        }
        authListenerRef.current = null;
      }
      
      if (connectionListenerRef.current) {
        try {
          connectionListenerRef.current();
        } catch (error) {
          console.error('❌ [StableFirebaseAuth] Erro no cleanup connection:', error);
        }
        connectionListenerRef.current = null;
      }
      
      isInitializedRef.current = false;
      console.log('✅ [StableFirebaseAuth] Cleanup concluído');
    };
  }, []); // Array vazio - executar apenas uma vez
  
  return state;
}

/**
 * Hook para operações Firestore com retry automático
 */
export function useStableFirestore() {
  const [isOperating, setIsOperating] = useState(false);
  
  const performOperation = async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Firestore operation'
  ): Promise<T> => {
    if (isOperating) {
      throw new Error('Operação já em andamento');
    }
    
    setIsOperating(true);
    
    try {
      console.log(`🔥 [StableFirestore] Iniciando: ${operationName}`);
      
      const result = await retryWithConnectionCheck(operation, 3, 1000);
      
      console.log(`✅ [StableFirestore] Sucesso: ${operationName}`);
      return result;
      
    } catch (error) {
      console.error(`❌ [StableFirestore] Falhou: ${operationName}`, error);
      throw error;
      
    } finally {
      setIsOperating(false);
    }
  };
  
  return {
    performOperation,
    isOperating
  };
}

/**
 * Hook para monitoramento de saúde das conexões
 */
export function useConnectionHealth() {
  const [health, setHealth] = useState({
    isHealthy: false,
    summary: '',
    lastCheck: new Date()
  });
  
  useEffect(() => {
    const updateHealth = () => {
      const status = connectionMonitor.getStatus();
      const metrics = connectionMonitor.getMetrics();
      const summary = connectionMonitor.getConnectionSummary();
      
      const isHealthy = status.firestore === 'connected' && 
                       status.auth === 'connected' &&
                       status.errorCount < 3;
      
      setHealth({
        isHealthy,
        summary,
        lastCheck: status.lastCheck
      });
    };
    
    // Atualizar imediatamente
    updateHealth();
    
    // Atualizar periodicamente
    const interval = setInterval(updateHealth, 10000); // 10 segundos
    
    // Listener para mudanças de status
    const unsubscribe = connectionMonitor.onStatusChange(updateHealth);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
  
  const forceHealthCheck = async () => {
    await connectionMonitor.forceReconnect();
  };
  
  return {
    ...health,
    forceHealthCheck
  };
}

/**
 * Hook para debug de conexões (desenvolvimento)
 */
export function useConnectionDebug() {
  const [debug, setDebug] = useState({
    status: connectionMonitor.getStatus(),
    metrics: connectionMonitor.getMetrics(),
    logs: [] as string[]
  });
  
  useEffect(() => {
    const updateDebug = () => {
      const status = connectionMonitor.getStatus();
      const metrics = connectionMonitor.getMetrics();
      const timestamp = new Date().toISOString();
      const logEntry = `${timestamp}: ${connectionMonitor.getConnectionSummary()}`;
      
      setDebug(prev => ({
        status,
        metrics,
        logs: [...prev.logs.slice(-19), logEntry] // Manter apenas últimas 20 entradas
      }));
    };
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(updateDebug, 5000);
    
    // Listener para mudanças
    const unsubscribe = connectionMonitor.onStatusChange(updateDebug);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);
  
  const clearLogs = () => {
    setDebug(prev => ({
      ...prev,
      logs: []
    }));
  };
  
  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      status: debug.status,
      metrics: debug.metrics,
      logs: debug.logs,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return {
    ...debug,
    clearLogs,
    exportDebugData
  };
}