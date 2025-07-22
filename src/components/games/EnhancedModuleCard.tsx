'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  PlayCircle,
  ArrowRight,
  Zap,
  Award,
  Star,
  RefreshCw,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useModuleProgress } from '@/hooks/useModuleProgress.enhanced';

// 🎯 TIPOS FORTES
interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  exercises?: unknown[];
  content?: unknown[];
  isLocked?: boolean;
  lockMessage?: string;
}

interface EnhancedModuleCardProps {
  module: Module;
  userId: string | null;
  onStart: (moduleId: string) => void;
  onRetry?: (moduleId: string) => void;
  className?: string;
  showDebugInfo?: boolean;
}

// 🎯 COMPONENTE OTIMIZADO COM MEMO
const EnhancedModuleCard = memo<EnhancedModuleCardProps>(({ 
  module, 
  userId, 
  onStart, 
  onRetry,
  className = '',
  showDebugInfo = false
}) => {
  const { state, isLoading, error, refresh } = useModuleProgress(userId, module.id);
  
  // 🎯 CALLBACKS MEMOIZADOS - Evitar re-renders desnecessários
  const handleClick = useCallback(() => {
    if (module.isLocked || isLoading) return;
    
    if (error && onRetry) {
      onRetry(module.id);
    } else {
      onStart(module.id);
    }
  }, [module.id, module.isLocked, isLoading, error, onStart, onRetry]);

  const handleRefresh = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    refresh();
  }, [refresh]);

  // 🎯 VALORES COMPUTADOS MEMOIZADOS
  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        duration: 0.5,
        bounce: 0.3
      }
    },
    hover: { 
      scale: 1.02,
      y: -5,
      transition: { duration: 0.2 }
    }
  }), []);

  const iconBgClass = useMemo(() => {
    if (module.isLocked) return 'bg-gray-400';
    
    switch (state.status) {
      case 'completed':
        return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'in_progress':
        return 'bg-gradient-to-br from-orange-500 to-orange-600';
      case 'error':
        return 'bg-gradient-to-br from-red-500 to-red-600';
      default:
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
  }, [module.isLocked, state.status]);

  const buttonClass = useMemo(() => {
    const base = "w-full h-12 text-base font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105";
    
    if (module.isLocked) {
      return `${base} bg-gray-400 cursor-not-allowed`;
    }
    
    if (error) {
      return `${base} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`;
    }
    
    switch (state.status) {
      case 'completed':
        return `${base} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800`;
      case 'in_progress':
        return `${base} bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800`;
      case 'loading':
        return `${base} bg-gray-400 cursor-wait animate-pulse`;
      default:
        return `${base} bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`;
    }
  }, [module.isLocked, error, state.status]);

  // 🎯 RENDER COM CARREGAMENTO MAIS SUTIL
  // Não mostrar skeleton completo, apenas indicador de carregamento no badge

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="group"
    >
      <Card className={`
        h-full border-2 transition-all duration-300 cursor-pointer
        ${module.isLocked 
          ? 'border-gray-200 bg-gray-50' 
          : error
            ? 'border-red-200 hover:border-red-300 hover:shadow-lg'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
        }
        ${className}
      `} onClick={handleClick}>
        <div className="p-6 flex flex-col h-full">
          {/* 🎯 HEADER MELHORADO */}
          <div className="flex items-start space-x-4 mb-4">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg text-white
              ${iconBgClass}
            `}>
              {module.isLocked ? '🔒' : module.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">
                {module.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                10-15 minutos
              </p>
            </div>

            {/* 🎯 STATUS BADGE APRIMORADO */}
            <div className="flex flex-col items-end space-y-2">
              {error ? (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Erro</span>
                </Badge>
              ) : (
                <>
                  {/* Badge de Status */}
                  <Badge 
                    variant={
                      state.status === 'completed' ? 'success' :
                      state.status === 'in_progress' ? 'warning' :
                      state.status === 'loading' ? 'secondary' :
                      'default'
                    }
                    className="flex items-center space-x-1"
                  >
                    {state.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    {state.status === 'in_progress' && <TrendingUp className="w-3 h-3" />}
                    {state.status === 'loading' && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {state.status === 'new' && <PlayCircle className="w-3 h-3" />}
                    <span>{state.badge}</span>
                  </Badge>
                  
                  {/* 🎯 NOTA E INFORMAÇÕES DINÂMICAS */}
                  {state.status === 'completed' && (
                    <div className="text-right space-y-2">
                      {/* Performance Level */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-green-800">
                            {state.score >= 90 ? 'Excelente' : state.score >= 70 ? 'Bom' : 'Precisa Melhorar'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Award className="w-3 h-3 text-green-600" />
                            <span className="text-sm font-bold text-green-600">{state.score}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-yellow-500">
                            {Array.from({ length: state.stars }, (_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-current" />
                            ))}
                          </div>
                          {state.passed && (
                            <span className="text-xs text-green-600 font-medium">✅ Aprovado</span>
                          )}
                        </div>
                      </div>

                      {/* Métricas Detalhadas */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-1.5 bg-blue-50 rounded border border-blue-200">
                          <div className="font-medium text-blue-800">{state.score}%</div>
                          <div className="text-blue-600">Melhor Nota</div>
                        </div>
                        <div className="text-center p-1.5 bg-purple-50 rounded border border-purple-200">
                          <div className="font-medium text-purple-800">~15min</div>
                          <div className="text-purple-600">Tempo Gasto</div>
                        </div>
                      </div>

                      {/* Última Atividade */}
                      {state.lastActivity && (
                        <div className="text-center text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                          {(() => {
                            const minutesAgo = Math.floor((Date.now() - state.lastActivity.getTime()) / (1000 * 60));
                            const hoursAgo = Math.floor(minutesAgo / 60);
                            const daysAgo = Math.floor(hoursAgo / 24);
                            
                            if (daysAgo > 0) return `Há ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}`;
                            if (hoursAgo > 0) return `Há ${hoursAgo} hora${hoursAgo !== 1 ? 's' : ''}`;
                            if (minutesAgo > 0) return `Há ${minutesAgo} minuto${minutesAgo !== 1 ? 's' : ''}`;
                            return 'Agora mesmo';
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {state.status === 'in_progress' && state.score > 0 && (
                    <div className="text-right space-y-1">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-orange-800">Em Progresso</span>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3 h-3 text-orange-600" />
                            <span className="text-sm font-bold text-orange-600">{state.score}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {state.status === 'new' && (
                    <div className="text-right">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <span className="text-xs font-medium text-blue-800">10-15 min</span>
                        <div className="text-xs text-blue-600">Não iniciado</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* 🎯 REFRESH BUTTON PARA DEBUGS/ERROS */}
              {(error || showDebugInfo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="p-1 h-6 w-6"
                  title="Atualizar progresso"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* 🎯 PROGRESS BAR MELHORADA */}
          {!module.isLocked && state.score > 0 && !error && (
            <div className="mb-4">
              <Progress 
                value={state.progress} 
                className="h-3 bg-gray-200"
                indicatorClassName={
                  state.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  state.status === 'in_progress' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                  'bg-gradient-to-r from-blue-500 to-blue-600'
                }
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className="font-medium">Progresso do Módulo</span>
                <span className="font-medium">{state.progress}% concluído • {state.attempts} tentativa{state.attempts !== 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* 🎯 DESCRIPTION */}
          <div className="flex-1 mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {module.description}
            </p>
            
            {/* Informação adicional para módulos não iniciados */}
            {state.status === 'new' && !module.isLocked && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Pronto para começar!</p>
                    <p>Complete este módulo para ganhar pontos e subir no ranking da turma.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🎯 DEBUG INFO (DEV ONLY) */}
          {showDebugInfo && process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs space-y-1">
              <div><strong>Status:</strong> {state.status}</div>
              <div><strong>Source:</strong> {state.source}</div>
              <div><strong>User ID:</strong> {userId?.slice(-6) || 'null'}</div>
              {error && <div className="text-red-600"><strong>Error:</strong> {error}</div>}
            </div>
          )}

          {/* 🎯 ACTION BUTTON OTIMIZADO */}
          <Button 
            onClick={handleClick}
            disabled={module.isLocked || (isLoading && state.status === 'loading')}
            className={buttonClass}
          >
            <AnimatePresence mode="wait">
              {module.isLocked ? (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <span>🔒 {module.lockMessage || 'Bloqueado'}</span>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Tentar Novamente</span>
                </motion.div>
              ) : state.status === 'loading' ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Carregando...</span>
                </motion.div>
              ) : state.status === 'completed' ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <Award className="w-5 h-5" />
                  <span>{state.buttonText}</span>
                </motion.div>
              ) : state.status === 'in_progress' ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>{state.buttonText}</span>
                </motion.div>
              ) : (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>{state.buttonText}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
});

EnhancedModuleCard.displayName = 'EnhancedModuleCard';

export default EnhancedModuleCard;