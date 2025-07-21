'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  X,
  RefreshCw
} from 'lucide-react';
import { useConnectionHealth, useConnectionDebug } from '@/hooks/useStableFirebase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface ConnectionStatusIndicatorProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatusIndicator({ 
  position = 'top-right',
  showDetails = false,
  className = ''
}: ConnectionStatusIndicatorProps) {
  const health = useConnectionHealth();
  const debug = useConnectionDebug();
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const getStatusIcon = () => {
    if (!health.isHealthy) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    switch (debug.status.firestore) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!health.isHealthy) return 'Desconectado';
    
    switch (debug.status.firestore) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro de Conexão';
      default: return 'Desconhecido';
    }
  };

  const getStatusColor = () => {
    if (!health.isHealthy) return 'bg-red-100 border-red-200';
    
    switch (debug.status.firestore) {
      case 'connected': return 'bg-green-100 border-green-200';
      case 'connecting': return 'bg-yellow-100 border-yellow-200';
      case 'error': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <>
      {/* Indicador Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed ${positionClasses[position]} z-50 ${className}`}
      >
        <div 
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 shadow-lg backdrop-blur-sm ${getStatusColor()} cursor-pointer hover:shadow-xl transition-all`}
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          title={`${getStatusText()} - Clique para detalhes`}
        >
          {getStatusIcon()}
          {showDetails && (
            <span className="text-sm font-medium text-gray-700">
              {getStatusText()}
            </span>
          )}
          <Info className="w-3 h-3 text-gray-500" />
        </div>
      </motion.div>

      {/* Painel de Debug */}
      <AnimatePresence>
        {showDebugPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
            onClick={() => setShowDebugPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Status das Conexões
                        </h3>
                        <p className="text-sm text-gray-600">
                          Monitoramento em tempo real do Firebase
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={health.forceHealthCheck}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Reconectar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDebugPanel(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Status Geral */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Firestore</h4>
                      <div className="flex items-center space-x-2">
                        {debug.status.firestore === 'connected' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : debug.status.firestore === 'connecting' ? (
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          debug.status.firestore === 'connected' ? 'text-green-700' :
                          debug.status.firestore === 'connecting' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {debug.status.firestore}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Authentication</h4>
                      <div className="flex items-center space-x-2">
                        {debug.status.auth === 'connected' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : debug.status.auth === 'connecting' ? (
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          debug.status.auth === 'connected' ? 'text-green-700' :
                          debug.status.auth === 'connecting' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {debug.status.auth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Métricas</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Listeners Ativos:</span>
                        <span className="ml-2 font-mono font-bold text-blue-600">
                          {debug.metrics.activeListeners}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Erros:</span>
                        <span className="ml-2 font-mono font-bold text-red-600">
                          {debug.status.errorCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tentativas Recovery:</span>
                        <span className="ml-2 font-mono font-bold text-yellow-600">
                          {debug.metrics.recoveryAttempts}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Uptime:</span>
                        <span className="ml-2 font-mono font-bold text-green-600">
                          {Math.round(debug.status.uptime / 1000)}s
                        </span>
                      </div>
                      {debug.status.latency && (
                        <div>
                          <span className="text-gray-600">Latência:</span>
                          <span className="ml-2 font-mono font-bold text-purple-600">
                            {debug.status.latency}ms
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Logs Recentes */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">Logs Recentes</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={debug.clearLogs}
                      >
                        Limpar
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg max-h-40 overflow-y-auto font-mono text-xs space-y-1">
                      {debug.logs.length > 0 ? (
                        debug.logs.slice(-10).map((log, index) => (
                          <div key={index} className="whitespace-nowrap">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">Nenhum log disponível</div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Última atualização: {health.lastCheck.toLocaleTimeString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={debug.exportDebugData}
                      >
                        Exportar Debug
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setShowDebugPanel(false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}