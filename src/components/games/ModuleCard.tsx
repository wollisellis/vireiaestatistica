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
import { parseFirebaseDate, getTimeAgo as safeGetTimeAgo } from '@/utils/dateUtils'

// Função para calcular tempo decorrido - UNIFICADA E SEGURA
const getTimeAgo = (lastActivity: any) => {
  return safeGetTimeAgo(lastActivity);
};

// Função para calcular rating por estrelas - PADRÃO INTERNACIONAL QS STARS EDUCACIONAL
const getStarRating = (score: number) => {
  // Nova escala baseada no padrão internacional QS Stars para educação
  // 75% agora dá 4 estrelas (antes eram 3) - muito mais justo!
  if (score >= 90) return { stars: 5, label: 'Excepcional', color: 'text-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
  if (score >= 75) return { stars: 4, label: 'Muito Bom', color: 'text-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' };
  if (score >= 60) return { stars: 3, label: 'Bom', color: 'text-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
  if (score >= 40) return { stars: 2, label: 'Regular', color: 'text-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
  if (score >= 20) return { stars: 1, label: 'Insuficiente', color: 'text-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' };
  return { stars: 0, label: 'Não Avaliado', color: 'text-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
};

// Componente de estrelas - versão simplificada
const StarRating = ({ rating }: { rating: any }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating.stars
              ? `${rating.color} fill-current`
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
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
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={`
        cursor-pointer transition-all duration-300 border h-full min-h-[480px] shadow-md relative overflow-hidden
        ${game.isLocked 
          ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60' 
          : game.moduleStatus === 'completed'
            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500' 
            : game.moduleStatus === 'attempted_failed'
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        }
        hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 group
      `}>
        <div className="p-10 h-full flex flex-col relative">
          {/* Selo de Status no canto superior-direito */}
          {!game.isLocked && (
            <div className="absolute -top-2 -right-2 z-10">
              {game.moduleStatus === 'completed' && (
                <div className="bg-green-600 dark:bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 text-sm font-medium">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>{game.bestScore}%</span>
                </div>
              )}
              {game.moduleStatus === 'attempted_failed' && (
                <div className="bg-orange-500 dark:bg-orange-400 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1.5 text-sm font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{game.bestScore}%</span>
                </div>
              )}
            </div>
          )}
          
          {/* Header simplificado */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-5">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-sm transform group-hover:scale-105 transition-all duration-300
                ${game.isLocked 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                  : game.moduleStatus === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-400 ring-2 ring-green-100 dark:ring-green-800'
                    : game.moduleStatus === 'attempted_failed'
                      ? 'bg-orange-50 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 ring-2 ring-orange-100 dark:ring-orange-800'
                      : 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-100 dark:ring-blue-800'
                }
              `}>
                {game.isLocked ? '🔒' : game.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-3">
                  {game.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-2 opacity-70" />
                  {game.estimatedTime}
                </p>
              </div>
            </div>

            {/* Loading indicator apenas quando necessário */}
            {!game.isLocked && game.moduleStatus === 'loading' && (
              <div className="flex items-center justify-center">
                <div className="animate-pulse flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Carregando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Content específico por estado - VERSÃO MELHORADA */}
          <div className="flex-1">
            {game.isLocked ? (
              <LockedModuleContent lockMessage={game.lockMessage} />
            ) : game.moduleStatus === 'loading' ? (
              <LoadingModuleContent />
            ) : game.moduleStatus === 'completed' ? (
              <CompletedModuleContent game={game} rating={rating} />
            ) : game.moduleStatus === 'attempted_failed' ? (
              <AttemptedModuleContent game={game} rating={rating} />
            ) : (
              <NewModuleContent game={game} />
            )}
          </div>

          {/* Action Button - Mais suave e elegante */}
          <div className="mt-auto pt-6">
            {game.isLocked ? (
              <Button disabled className="w-full h-12 text-base bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                🔒 Aguardando Liberação
              </Button>
            ) : game.moduleStatus === 'loading' ? (
              <Button disabled className="w-full h-12 text-base bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 animate-pulse">
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </Button>
            ) : (
              <Button 
                onClick={onClick}
                className={`
                  w-full h-12 text-base font-medium flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02] 
                  ${game.moduleStatus === 'completed' 
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-100' 
                    : game.moduleStatus === 'attempted_failed'
                      ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-100'
                      : 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-100'
                  }
                `}
              >
                {game.moduleStatus === 'completed' ? (
                  <>
                    <Award className="w-5 h-5" />
                    <span>Revisar Módulo</span>
                  </>
                ) : game.moduleStatus === 'attempted_failed' ? (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>Continuar Estudos</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    <span>Iniciar Módulo</span>
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

// Componente para módulo carregando - NOVO E REALISTA
const LoadingModuleContent = () => (
  <div className="space-y-5 animate-pulse">
    {/* Skeleton de progresso */}
    <div className="bg-white/80 rounded-lg p-4 space-y-3">
      <div className="flex justify-center">
        <div className="w-32 h-8 bg-gray-200 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="w-16 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="w-20 h-3 bg-gray-200 rounded mx-auto"></div>
        </div>
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="w-16 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="w-20 h-3 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    </div>

    {/* Mensagem de carregamento */}
    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-lg p-4 text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Clock className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-sm font-medium text-blue-800">Buscando seu progresso...</span>
      </div>
      <p className="text-xs text-blue-600">
        Aguarde enquanto carregamos seus dados de aprendizagem
      </p>
    </div>
  </div>
);

// Componente para módulo concluído
const CompletedModuleContent = ({ game, rating }: { game: any, rating: any }) => (
  <div className="space-y-5">
    {/* Rating de estrelas mais elegante */}
    <div className="flex justify-center">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
        <StarRating rating={rating} />
        <div className="text-center mt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{rating.label}</span>
        </div>
      </div>
    </div>

    {/* Estatísticas principais com melhor contraste */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">~15min</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tempo Gasto</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{rating.stars}/5</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avaliação</div>
      </div>
    </div>

    {/* Última atividade com melhor design */}
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg py-2 px-3">
      <Clock className="w-4 h-4 opacity-70" />
      <span>{getTimeAgo(game.progress?.lastAccessed)}</span>
    </div>

    {/* Conquistas com design mais sutil */}
    {game.bestScore >= 95 && (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
        <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
        <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">Pontuação Perfeita!</span>
      </div>
    )}
  </div>
);

// Componente para módulo tentado mas não concluído
const AttemptedModuleContent = ({ game, rating }: { game: any, rating: any }) => (
  <div className="space-y-5">
    {/* Rating atual com melhor design */}
    <div className="flex justify-center">
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
        <StarRating rating={rating} />
        <div className="text-center mt-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{rating.label}</span>
        </div>
      </div>
    </div>

    {/* Progresso visual mais suave */}
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progresso para Aprovação</span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{game.bestScore}/70%</span>
      </div>
      <Progress 
        value={(game.bestScore / 70) * 100} 
        className="h-2 bg-gray-200 dark:bg-gray-600" 
        indicatorClassName="bg-gradient-to-r from-orange-400 to-orange-500"
      />
      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Faltam <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.max(0, 70 - game.bestScore)}%</span> para aprovação
        </span>
      </div>
    </div>

    {/* Motivação mais sutil */}
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
      <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
      <p className="text-sm text-orange-800 dark:text-orange-300 font-medium">
        Continue tentando! Você está no caminho certo 💪
      </p>
    </div>

    {/* Última tentativa */}
    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg py-2 px-3">
      <Clock className="w-4 h-4 opacity-70" />
      <span>Última tentativa: {getTimeAgo(game.progress?.lastAccessed)}</span>
    </div>
  </div>
);

// Componente para módulo novo
const NewModuleContent = ({ game }: { game: any }) => (
  <div className="space-y-5">
    {/* Preview do conteúdo com melhor design */}
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
        O que você vai aprender:
      </h4>
      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        {game.learningObjectives?.slice(0, 3).map((objective: string, index: number) => (
          <li key={index} className="flex items-start space-x-3">
            <span className="text-blue-600 dark:text-blue-400 mt-1 font-bold">•</span>
            <span className="leading-relaxed">{objective}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* Info de tempo e dificuldade com melhor contraste */}
    <div className="grid grid-cols-2 gap-3">
      <div className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{game.estimatedTime}</span>
      </div>
      <div className="flex items-center justify-center space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
        <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{game.difficulty}</span>
      </div>
    </div>

    {/* Call to action mais suave */}
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">🚀</div>
      <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold">
        Comece agora e desbloqueie o próximo módulo!
      </p>
      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 opacity-80">
        Primeiro módulo do seu percurso de aprendizagem
      </p>
    </div>
  </div>
);