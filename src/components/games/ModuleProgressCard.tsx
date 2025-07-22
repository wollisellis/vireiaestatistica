'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  PlayCircle,
  ArrowRight,
  Zap,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useModuleProgress } from '@/hooks/useModuleProgress';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  exercises: any[];
  isLocked?: boolean;
  lockMessage?: string;
}

interface ModuleProgressCardProps {
  module: Module;
  userId: string | null;
  onClick: () => void;
}

export function ModuleProgressCard({ module, userId, onClick }: ModuleProgressCardProps) {
  const { progress, isLoading } = useModuleProgress(userId, module.id);
  
  // 🎯 Determinar estado baseado no progresso - LÓGICA SIMPLES
  const getModuleState = () => {
    if (isLoading) return { status: 'loading', badge: 'Carregando...', button: 'Carregando...' };
    if (progress === null || progress === 0) return { status: 'new', badge: 'Novo', button: 'Iniciar Módulo' };
    if (progress >= 70) return { status: 'completed', badge: 'Concluído', button: `Revisar • ${progress}%` };
    return { status: 'in_progress', badge: 'Em Progresso', button: `Continuar • ${progress}%` };
  };

  const moduleState = getModuleState();
  const stars = progress ? Math.min(5, Math.max(1, Math.floor(progress / 20))) : 0;

  // 🎯 Skeleton enquanto carrega
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="group"
      >
        <Card className="h-full border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer">
          <div className="p-6 space-y-4">
            {/* Header Skeleton */}
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
            
            {/* Progress Skeleton */}
            <div className="space-y-3">
              <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
            
            {/* Button Skeleton */}
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className={`
        h-full border-2 transition-all duration-300 cursor-pointer
        ${module.isLocked 
          ? 'border-gray-200 bg-gray-50' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
        }
      `}>
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            <div className={`
              w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg
              ${moduleState.status === 'completed'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                : moduleState.status === 'in_progress'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              }
            `}>
              {module.isLocked ? '🔒' : module.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-xl text-gray-900 leading-tight mb-2">
                {module.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                {module.estimatedTime}
              </p>
            </div>

            {/* Status Badge */}
            {!module.isLocked && (
              <div className="flex flex-col items-end space-y-1">
                <Badge 
                  variant={
                    moduleState.status === 'completed' ? 'success' :
                    moduleState.status === 'in_progress' ? 'warning' :
                    'default'
                  }
                  className="flex items-center space-x-1"
                >
                  {moduleState.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                  {moduleState.status === 'in_progress' && <TrendingUp className="w-3 h-3" />}
                  {moduleState.status === 'new' && <PlayCircle className="w-3 h-3" />}
                  <span>{moduleState.badge}</span>
                </Badge>
                
                {/* Progress Info */}
                {(progress || 0) > 0 && (
                  <div className="text-xs text-center">
                    <div className="font-medium text-gray-700">{progress}%</div>
                    {stars > 0 && (
                      <div className="text-yellow-500">
                        {'⭐'.repeat(stars)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!module.isLocked && (progress || 0) > 0 && (
            <div className="mb-4">
              <Progress 
                value={progress || 0} 
                className="h-3 bg-gray-200"
                indicatorClassName={
                  (progress || 0) >= 70 ? 'bg-green-500' :
                  (progress || 0) >= 40 ? 'bg-orange-500' :
                  'bg-blue-500'
                }
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Progresso</span>
                <span>{progress || 0}% completo</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="flex-1 mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {module.description}
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClick}
            disabled={module.isLocked}
            className={`
              w-full h-12 text-base font-semibold flex items-center justify-center space-x-2 
              transition-all shadow-lg hover:shadow-xl transform hover:scale-105
              ${module.isLocked
                ? 'bg-gray-400 cursor-not-allowed'
                : moduleState.status === 'completed' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                  : moduleState.status === 'in_progress'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }
            `}
          >
            {module.isLocked ? (
              <>🔒 {module.lockMessage || 'Bloqueado'}</>
            ) : moduleState.status === 'completed' ? (
              <>
                <Award className="w-5 h-5" />
                <span>{moduleState.button}</span>
              </>
            ) : moduleState.status === 'in_progress' ? (
              <>
                <TrendingUp className="w-5 h-5" />
                <span>{moduleState.button}</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>{moduleState.button}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default ModuleProgressCard;