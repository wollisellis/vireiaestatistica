'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  Star, 
  RefreshCw, 
  X,
  Award,
  TrendingUp,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CompletedModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  moduleTitle: string;
  score: number;
  bestScore?: number;
  timeSpent?: string;
  attempts?: number;
  lastCompleted?: Date;
}

// 🎯 FUNÇÃO PARA CLASSIFICAR PERFORMANCE
const getPerformanceLevel = (score: number) => {
  if (score >= 90) return { level: 'Excelente', color: 'text-green-600 bg-green-100', icon: Trophy };
  if (score >= 70) return { level: 'Bom', color: 'text-blue-600 bg-blue-100', icon: Award };
  return { level: 'Precisa Melhorar', color: 'text-orange-600 bg-orange-100', icon: TrendingUp };
};

const getStarsFromScore = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
};

export function CompletedModuleModal({
  isOpen,
  onClose,
  onRetry,
  moduleTitle,
  score,
  bestScore = score,
  timeSpent = '~15min',
  attempts = 1,
  lastCompleted
}: CompletedModuleModalProps) {
  const performance = getPerformanceLevel(score);
  const stars = getStarsFromScore(score);
  const PerformanceIcon = performance.icon;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", duration: 0.4, bounce: 0.25 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const handleRetry = () => {
    onClose();
    setTimeout(() => onRetry(), 300); // Delay para melhor UX
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden bg-white shadow-2xl">
            {/* 🎯 HEADER COM CLOSE BUTTON */}
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 h-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* 🏆 TÍTULO E ÍCONE */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Módulo Já Concluído!</h2>
                  <p className="text-sm text-gray-600">{moduleTitle}</p>
                </div>
              </div>

              {/* 🎯 PERFORMANCE BADGE */}
              <div className="text-center mb-4">
                <Badge className={`px-3 py-1.5 text-sm font-medium ${performance.color} border-0`}>
                  <PerformanceIcon className="w-4 h-4 mr-1.5" />
                  {performance.level} ({score}%)
                </Badge>
              </div>

              {/* ⭐ ESTRELAS */}
              {stars > 0 && (
                <div className="flex justify-center items-center space-x-1 mb-4">
                  {Array.from({ length: stars }, (_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">({stars}/5 estrelas)</span>
                </div>
              )}
            </div>

            {/* 📊 ESTATÍSTICAS */}
            <div className="px-6 pb-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Melhor Pontuação */}
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{bestScore}%</div>
                  <div className="text-xs text-gray-500">Melhor Nota</div>
                </div>

                {/* Tempo Gasto */}
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{timeSpent}</div>
                  <div className="text-xs text-gray-500">Tempo Gasto</div>
                </div>

                {/* Tentativas */}
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">{attempts}</div>
                  <div className="text-xs text-gray-500">Tentativa{attempts !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {/* 📅 ÚLTIMA ATIVIDADE */}
              {lastCompleted && (
                <div className="text-center mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Última vez:</span> {
                      (() => {
                        const daysAgo = Math.floor((Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
                        const hoursAgo = Math.floor((Date.now() - lastCompleted.getTime()) / (1000 * 60 * 60));
                        const minutesAgo = Math.floor((Date.now() - lastCompleted.getTime()) / (1000 * 60));
                        
                        if (daysAgo > 0) return `há ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}`;
                        if (hoursAgo > 0) return `há ${hoursAgo} hora${hoursAgo !== 1 ? 's' : ''}`;
                        if (minutesAgo > 0) return `há ${minutesAgo} minuto${minutesAgo !== 1 ? 's' : ''}`;
                        return 'agora mesmo';
                      })()
                    }
                  </p>
                </div>
              )}

              {/* 💬 MENSAGEM MOTIVACIONAL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 mb-2 font-medium">
                  Você já concluiu este módulo com nota {score}%.
                </p>
                <p className="text-sm text-blue-700 mb-2">
                  Você pode tentar novamente!
                </p>
                <p className="text-xs text-blue-600">
                  <strong>Sua maior nota será sempre mantida no sistema.</strong> Tente melhorar seu desempenho!
                </p>
              </div>
            </div>

            {/* 🔘 BOTÕES DE AÇÃO */}
            <div className="flex space-x-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRetry}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CompletedModuleModal;