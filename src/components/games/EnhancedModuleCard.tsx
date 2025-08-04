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
  Activity,
  Trophy
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
  maxPoints?: number;
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
      scale: 1.04,
      y: -8,
      rotateY: 2,
      transition: { 
        duration: 0.3,
        type: "spring",
        bounce: 0.4
      }
    }
  }), []);

  const iconBgClass = useMemo(() => {
    if (module.isLocked) return 'bg-gray-400';
    
    // Se já foi completado, usar cores diferentes por módulo
    if (state.status === 'completed') {
      if (module.id === 'module-1') {
        return 'bg-gradient-to-br from-blue-500 to-blue-600';
      } else if (module.id === 'module-2') {
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      }
      return 'bg-gradient-to-br from-green-500 to-green-600'; // fallback
    }
    
    // Se está em progresso, mostrar laranja
    if (state.status === 'in_progress') {
      return 'bg-gradient-to-br from-orange-500 to-orange-600';
    }
    
    // Se tem erro, mostrar vermelho
    if (state.status === 'error') {
      return 'bg-gradient-to-br from-red-500 to-red-600';
    }
    
    // Caso contrário, usar cor baseada no módulo
    if (module.id === 'module-1') {
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    } else if (module.id === 'module-2') {
      return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
    }
    
    // Default
    return 'bg-gradient-to-br from-blue-500 to-blue-600';
  }, [module.isLocked, module.id, state.status]);



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
        h-full border-2 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.03] 
        transform-gpu hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden
        ${module.isLocked
          ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-500 dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800'
          : error
            ? 'border-red-300 hover:border-red-400 bg-gradient-to-br from-white to-red-50 dark:border-red-600 dark:bg-gradient-to-br dark:from-gray-700 dark:to-red-900/20'
            : state.status === 'completed'
              ? module.id === 'module-1'
                ? 'border-blue-600 hover:border-blue-700 bg-gradient-to-br from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:ring-4 hover:ring-blue-400/50 shadow-blue-400/50 text-white'
                : module.id === 'module-2'
                  ? 'border-purple-600 hover:border-purple-700 bg-gradient-to-br from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 hover:ring-4 hover:ring-purple-400/50 shadow-purple-400/50 text-white'
                  : 'border-green-600 hover:border-green-700 bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 hover:ring-4 hover:ring-green-400/50 shadow-green-400/50 text-white'
              : module.id === 'module-1'
                ? 'border-blue-300 hover:border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-500 hover:to-blue-600 hover:text-white dark:border-gray-500 dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 dark:hover:from-blue-700 dark:hover:to-blue-800 hover:ring-4 hover:ring-blue-300/50 dark:hover:ring-blue-500/20 transition-all duration-300 group'
                : module.id === 'module-2'
                  ? 'border-emerald-300 hover:border-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-500 hover:to-emerald-600 hover:text-white dark:border-gray-500 dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 dark:hover:from-emerald-700 dark:hover:to-emerald-800 hover:ring-4 hover:ring-emerald-300/50 dark:hover:ring-emerald-500/20 transition-all duration-300 group'
                  : 'border-blue-300 hover:border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-500 hover:to-blue-600 hover:text-white dark:border-gray-500 dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 dark:hover:from-blue-700 dark:hover:to-blue-800 hover:ring-4 hover:ring-blue-300/50 dark:hover:ring-blue-500/20 transition-all duration-300 group'
        }
        ${className}
      `} onClick={handleClick}>
        <div className="relative p-8 flex flex-col h-full">
          {/* 🎯 INDICADOR DE INTERATIVIDADE - CANTO SUPERIOR ESQUERDO */}
          {!module.isLocked && (
            <div className="absolute top-6 left-6">
              <div className={`w-3 h-3 rounded-full animate-pulse opacity-75 group-hover:scale-150 transition-transform duration-300 ${
                module.id === 'module-1' ? 'bg-blue-500' : 
                module.id === 'module-2' ? 'bg-emerald-500' : 
                'bg-blue-500'
              }`}></div>
            </div>
          )}
          {/* 🎯 SELO "CONCLUÍDO" NO CANTO SUPERIOR DIREITO */}
          {state.status === 'completed' && (
            <div className="absolute top-4 right-4">
              <Badge
                variant="success"
                className={`flex items-center space-x-1 text-xs px-2 py-1 shadow-md ${
                  module.id === 'module-1'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800'
                    : module.id === 'module-2'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800'
                }`}
              >
                <CheckCircle className="w-3 h-3 text-white" />
                <span className="font-semibold">Concluído</span>
              </Badge>
            </div>
          )}

          {/* 🎯 HEADER REDESENHADO */}
          <div className="flex items-start space-x-6 mb-6">
            {/* Ícone com progresso radial */}
            <div className="relative">
              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg text-white
                transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl
                ${iconBgClass}
                ${!module.isLocked && 'group-hover:shadow-blue-500/25'}
              `}>
                {module.isLocked ? '🔒' : module.icon}
              </div>

              {/* Indicador de interatividade - Anel pulsante para módulos disponíveis */}
              {!module.isLocked && state.status === 'new' && (
                <div className="absolute inset-0 rounded-2xl">
                  <div className={`w-16 h-16 rounded-2xl border-2 animate-pulse opacity-75 ${
                    module.id === 'module-1' ? 'border-blue-500' : 
                    module.id === 'module-2' ? 'border-emerald-500' : 
                    'border-blue-500'
                  }`}></div>
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl border animate-ping ${
                    module.id === 'module-1' ? 'border-blue-400' : 
                    module.id === 'module-2' ? 'border-emerald-400' : 
                    'border-blue-400'
                  }`}></div>
                </div>
              )}

              {/* Progresso radial ao redor do ícone */}
              {state.status === 'completed' && state.score > 0 && (
                <div className="absolute inset-0 rounded-2xl">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${(state.score / 100) * 175.93} 175.93`}
                      className="text-green-500 transition-all duration-500"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              {/* Título com quebra controlada */}
              <h3 className={`font-bold text-xl leading-tight max-w-[200px] transition-colors duration-300 ${
                state.status === 'completed' ? 'text-white' : 'text-gray-900 dark:text-gray-100 group-hover:text-white'
              }`}>
                {module.title}
              </h3>

              {/* Microcopy com tempo estimado e pontos */}
              <div className={`flex items-center space-x-4 text-sm transition-colors duration-300 ${
                state.status === 'completed' ? 'text-white/90' : 'text-gray-500 dark:text-gray-400 group-hover:text-white/90'
              }`}>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.estimatedTime}</span>
                </div>
                {module.maxPoints && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{module.maxPoints} pontos</span>
                  </div>
                )}

                {/* Última atividade como microcopy */}
                {state.status === 'completed' && state.lastActivity && (
                  <span className={`${
                    state.status === 'completed' ? 'text-white/80 font-medium' : 'text-gray-800 dark:text-gray-400'
                  }`}>
                    {(() => {
                      try {
                        const activityDate = state.lastActivity instanceof Date
                          ? state.lastActivity
                          : new Date(state.lastActivity);

                        if (isNaN(activityDate.getTime())) return '';

                        const minutesAgo = Math.floor((Date.now() - activityDate.getTime()) / (1000 * 60));
                        const hoursAgo = Math.floor(minutesAgo / 60);
                        const daysAgo = Math.floor(hoursAgo / 24);

                        if (daysAgo > 0) return `Há ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}`;
                        if (hoursAgo > 0) return `Há ${hoursAgo} hora${hoursAgo !== 1 ? 's' : ''}`;
                        if (minutesAgo > 0) return `Há ${minutesAgo} minuto${minutesAgo !== 1 ? 's' : ''}`;
                        return 'Agora mesmo';
                      } catch (error) {
                        return '';
                      }
                    })()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🎯 BADGE UNIFICADO DE PERFORMANCE */}
          {state.status === 'completed' && (
            <div className="mb-6">
              <div
                className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-help ${
                  module.id === 'module-1'
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                    : module.id === 'module-2'
                      ? 'bg-purple-500 text-white border-purple-600 shadow-md'
                      : 'bg-green-500 text-white border-green-600 shadow-md'
                }`}
                title={`Detalhes: ${state.score >= 90 ? 'Excelente' : state.score >= 70 ? 'Bom' : 'Precisa Melhorar'} • ${state.score}% • ${state.passed ? 'Aprovado' : 'Reprovado'} • ${state.stars} estrela${state.stars !== 1 ? 's' : ''}`}
              >
                <Award className="w-4 h-4 text-white" />
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="font-semibold text-sm">
                  {state.score >= 90 ? 'Excelente' : state.score >= 70 ? 'Bom' : 'Precisa Melhorar'} • {state.score}% • {module.maxPoints ? `${((state.score / 100) * module.maxPoints).toFixed(1)} pts • ` : ''}Aprovado
                </span>
                <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                  {Array.from({ length: state.stars }, (_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 🎯 DESCRIÇÃO DO MÓDULO */}
          <div className="flex-1 mb-6">
            <p className={`text-sm leading-relaxed transition-colors duration-300 ${
              state.status === 'completed' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300 group-hover:text-white/80'
            }`}>
              {module.description || "Aprenda os conceitos fundamentais da avaliação nutricional com dados brasileiros e exercícios práticos."}
            </p>
          </div>


          {/* 🎯 ESTADOS PARA OUTROS STATUS */}
          {state.status === 'in_progress' && state.score > 0 && (
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-orange-50 text-orange-800 px-3 py-2 rounded-lg border border-orange-200 dark:bg-orange-800/30 dark:text-orange-200 dark:border-orange-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold text-sm">Em Progresso • {state.score}%</span>
              </div>
            </div>
          )}

          {state.status === 'new' && (
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-2 rounded-lg border border-blue-200 dark:bg-blue-800/30 dark:text-blue-200 dark:border-blue-600">
                <PlayCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Pronto para Começar</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6">
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-800 px-3 py-2 rounded-lg border border-red-200 dark:bg-red-800/30 dark:text-red-200 dark:border-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold text-sm">Erro ao Carregar</span>
              </div>
            </div>
          )}

          {/* 🎯 DEBUG INFO (DEV ONLY) */}
          {showDebugInfo && process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-lg text-xs space-y-1">
              <div><strong>Status:</strong> {state.status}</div>
              <div><strong>Source:</strong> {state.source}</div>
              <div><strong>User ID:</strong> {userId?.slice(-6) || 'null'}</div>
              {error && <div className="text-red-600 dark:text-red-400"><strong>Error:</strong> {error}</div>}
              {(error || showDebugInfo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  className="p-1 h-6 w-6 mt-2"
                  title="Atualizar progresso"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}

          {/* 🎯 ACTION BUTTON REDESENHADO */}
          <Button
            onClick={handleClick}
            disabled={module.isLocked || (isLoading && state.status === 'loading')}
            className={`
              w-full h-14 text-base font-bold flex items-center justify-center space-x-2
              transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl
              hover:scale-105 hover:-translate-y-1 transform-gpu
              border-2 active:scale-95
              ${module.isLocked
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500'
                : error
                  ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-300 hover:from-red-100 hover:to-red-200 hover:border-red-400 dark:from-red-800/30 dark:to-red-700/30 dark:text-red-200 dark:border-red-600'
                  : state.status === 'completed'
                    ? module.id === 'module-1'
                      ? 'bg-gradient-to-r from-blue-200 to-indigo-300 text-blue-800 border-blue-400 hover:from-blue-300 hover:to-indigo-400 hover:border-blue-500 dark:from-blue-700/50 dark:to-indigo-600/50 dark:text-blue-100 dark:border-blue-500'
                      : module.id === 'module-2'
                        ? 'bg-gradient-to-r from-purple-200 to-violet-300 text-purple-800 border-purple-400 hover:from-purple-300 hover:to-violet-400 hover:border-purple-500 dark:from-purple-700/50 dark:to-violet-600/50 dark:text-purple-100 dark:border-purple-500'
                        : 'bg-gradient-to-r from-green-200 to-emerald-300 text-green-800 border-green-400 hover:from-green-300 hover:to-emerald-400 hover:border-green-500 dark:from-green-700/50 dark:to-emerald-600/50 dark:text-green-100 dark:border-green-500'
                    : state.status === 'in_progress'
                      ? 'bg-gradient-to-r from-orange-50 to-amber-100 text-orange-700 border-orange-300 hover:from-orange-100 hover:to-amber-200 hover:border-orange-400 dark:from-orange-800/30 dark:to-amber-700/30 dark:text-orange-200 dark:border-orange-600'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-700 border-blue-300 hover:from-blue-100 hover:to-indigo-200 hover:border-blue-400 dark:from-blue-800/30 dark:to-indigo-700/30 dark:text-blue-200 dark:border-blue-600 hover:ring-4 hover:ring-blue-200/50'
              }
            `}
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
                  <RefreshCw className="w-4 h-4" />
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
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
                  <Award className="w-4 h-4" />
                  <span>Ver Resultados</span>
                </motion.div>
              ) : state.status === 'in_progress' ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Continuar</span>
                </motion.div>
              ) : (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center space-x-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Começar Módulo</span>
                  <ArrowRight className="w-4 h-4" />
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