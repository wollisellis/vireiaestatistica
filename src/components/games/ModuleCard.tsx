'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingUp, 
  Target, 
  PlayCircle,
  RotateCcw,
  Trophy,
  BookOpen,
  ArrowRight,
  Zap,
  Award
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'

// Função para calcular tempo decorrido - UNIFICADA
const getTimeAgo = (lastActivity: any) => {
  if (!lastActivity) return 'Nunca tentado';
  
  let activityDate: Date;
  
  try {
    if (lastActivity instanceof Date) {
      activityDate = lastActivity;
    } else if (lastActivity?.toDate && typeof lastActivity.toDate === 'function') {
      activityDate = lastActivity.toDate();
    } else if (typeof lastActivity === 'string') {
      activityDate = new Date(lastActivity);
    } else if (lastActivity?.seconds) {
      activityDate = new Date(lastActivity.seconds * 1000);
    } else {
      return 'Nunca tentado';
    }
    
    if (isNaN(activityDate.getTime())) return 'Nunca tentado';
    
    const now = new Date();
    const diff = now.getTime() - activityDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `Há ${days} dia${days === 1 ? '' : 's'}`;
    if (hours > 0) return `Há ${hours} hora${hours === 1 ? '' : 's'}`;
    if (minutes > 0) return `Há ${minutes} minuto${minutes === 1 ? '' : 's'}`;
    return 'Agora há pouco';
  } catch (error) {
    console.error('Erro ao processar data:', error);
    return 'Nunca tentado';
  }
};

// Função para calcular rating por estrelas
const getStarRating = (score: number) => {
  if (score >= 95) return { stars: 5, label: 'Perfeito', color: 'text-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
  if (score >= 85) return { stars: 4, label: 'Excelente', color: 'text-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' };
  if (score >= 70) return { stars: 3, label: 'Bom', color: 'text-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
  if (score >= 60) return { stars: 2, label: 'Regular', color: 'text-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
  if (score >= 50) return { stars: 1, label: 'Fraco', color: 'text-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' };
  return { stars: 0, label: 'Não Tentado', color: 'text-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
};

// Componente de estrelas
const StarRating = ({ rating, score }: { rating: any, score?: number }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${rating.bgColor}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating.stars
                ? `${rating.color} fill-current`
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${rating.textColor}`}>
        {rating.label} {score && `(${score}%)`}
      </span>
    </div>
  );
};

interface ModuleCardProps {
  game: any
  onClick: () => void
  isProfessor: boolean
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ game, onClick, isProfessor }) => {
  const rating = getStarRating(game.bestScore);
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={`
        cursor-pointer transition-all duration-300 border-2 h-full
        ${game.isLocked 
          ? 'bg-gray-50 border-gray-200 opacity-60' 
          : game.moduleStatus === 'completed'
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300' 
            : game.moduleStatus === 'attempted_failed'
              ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:border-orange-300'
              : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:border-blue-300'
        }
        hover:shadow-xl group
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header com Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                ${game.isLocked 
                  ? 'bg-gray-200 text-gray-400' 
                  : game.moduleStatus === 'completed'
                    ? 'bg-green-500 text-white'
                    : game.moduleStatus === 'attempted_failed'
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-500 text-white'
                }
              `}>
                {game.isLocked ? '🔒' : game.icon}
              </div>
              
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-600">{game.estimatedTime}</p>
              </div>
            </div>

            {/* Status Badge */}
            {!game.isLocked && (
              <div className="flex flex-col items-end space-y-2">
                {game.moduleStatus === 'completed' && (
                  <Badge variant="success" className="flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Concluído</span>
                  </Badge>
                )}
                {game.moduleStatus === 'attempted_failed' && (
                  <Badge variant="warning" className="flex items-center space-x-1">
                    <RotateCcw className="w-3 h-3" />
                    <span>Tentar Novamente</span>
                  </Badge>
                )}
                {game.moduleStatus === 'never_attempted' && (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <PlayCircle className="w-3 h-3" />
                    <span>Novo</span>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Content específico por estado */}
          <div className="flex-1">
            {game.isLocked ? (
              <LockedModuleContent lockMessage={game.lockMessage} />
            ) : game.moduleStatus === 'completed' ? (
              <CompletedModuleContent game={game} rating={rating} />
            ) : game.moduleStatus === 'attempted_failed' ? (
              <AttemptedModuleContent game={game} rating={rating} />
            ) : (
              <NewModuleContent game={game} />
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6">
            {game.isLocked ? (
              <Button disabled className="w-full">
                🔒 Aguardando Liberação
              </Button>
            ) : (
              <Button 
                onClick={onClick}
                className={`
                  w-full flex items-center justify-center space-x-2 transition-all
                  ${game.moduleStatus === 'completed' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : game.moduleStatus === 'attempted_failed'
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }
                `}
              >
                {game.moduleStatus === 'completed' ? (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Revisar Módulo</span>
                  </>
                ) : game.moduleStatus === 'attempted_failed' ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Melhorar Pontuação</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Iniciar Módulo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Componente para módulo bloqueado
const LockedModuleContent = ({ lockMessage }: { lockMessage?: string }) => (
  <div className="text-center py-8">
    <div className="text-6xl mb-4">🔒</div>
    <p className="text-gray-600 text-sm">
      {lockMessage || 'Módulo bloqueado'}
    </p>
  </div>
);

// Componente para módulo concluído
const CompletedModuleContent = ({ game, rating }: { game: any, rating: any }) => (
  <div className="space-y-4">
    {/* Rating de estrelas */}
    <div className="flex justify-center">
      <StarRating rating={rating} score={game.bestScore} />
    </div>

    {/* Estatísticas principais */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/70 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-green-600">{game.bestScore}%</div>
        <div className="text-xs text-gray-600">Melhor Pontuação</div>
      </div>
      <div className="bg-white/70 rounded-lg p-3 text-center">
        <div className="text-2xl font-bold text-blue-600">~15min</div>
        <div className="text-xs text-gray-600">Tempo Gasto</div>
      </div>
    </div>

    {/* Última atividade */}
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>{getTimeAgo(game.progress?.lastAccessed)}</span>
    </div>

    {/* Conquistas */}
    {game.bestScore >= 95 && (
      <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-2 text-center">
        <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
        <span className="text-xs text-yellow-800 font-medium">Pontuação Perfeita!</span>
      </div>
    )}
  </div>
);

// Componente para módulo tentado mas não concluído
const AttemptedModuleContent = ({ game, rating }: { game: any, rating: any }) => (
  <div className="space-y-4">
    {/* Rating atual */}
    <div className="flex justify-center">
      <StarRating rating={rating} score={game.bestScore} />
    </div>

    {/* Progresso visual */}
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Progresso para Aprovação</span>
        <span className="text-orange-600 font-medium">{game.bestScore}/70%</span>
      </div>
      <Progress value={(game.bestScore / 70) * 100} className="h-2" />
    </div>

    {/* Motivação */}
    <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 text-center">
      <TrendingUp className="w-5 h-5 text-orange-600 mx-auto mb-1" />
      <p className="text-xs text-orange-800">
        Faltam {Math.max(0, 70 - game.bestScore)}% para a aprovação
      </p>
    </div>

    {/* Última tentativa */}
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>Última tentativa: {getTimeAgo(game.progress?.lastAccessed)}</span>
    </div>
  </div>
);

// Componente para módulo novo
const NewModuleContent = ({ game }: { game: any }) => (
  <div className="space-y-4">
    {/* Preview do conteúdo */}
    <div className="bg-white/70 rounded-lg p-4">
      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
        <BookOpen className="w-4 h-4 mr-2" />
        O que você vai aprender:
      </h4>
      <ul className="text-sm text-gray-600 space-y-1">
        {game.learningObjectives?.slice(0, 3).map((objective: string, index: number) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Info de tempo */}
    <div className="flex items-center justify-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <Clock className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">{game.estimatedTime}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Target className="w-4 h-4 text-gray-500" />
        <span className="text-gray-600">{game.difficulty}</span>
      </div>
    </div>

    {/* Call to action */}
    <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 text-center">
      <div className="text-2xl mb-2">🚀</div>
      <p className="text-sm text-blue-800 font-medium">
        Comece agora e desbloqueie o próximo módulo!
      </p>
    </div>
  </div>
);