'use client';

import React, { useState } from 'react';
import { Module } from '@/types/modules';
import { Lock, Clock, Trophy, ChevronRight, AlertCircle, RotateCcw, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

interface ModuleCardProps {
  module: Module;
  progress?: {
    completedContent: number;
    totalContent: number;
    completedExercises: number;
    totalExercises: number;
    score: number;
    maxScore?: number;
  };
  onUnlock?: (moduleId: string) => void;
  isProfessor?: boolean;
}

export function ModuleCard({ module, progress, onUnlock, isProfessor = false }: ModuleCardProps) {
  const router = useRouter();
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  
  const progressPercentage = progress 
    ? Math.round(((progress.completedContent + progress.completedExercises) / 
        (progress.totalContent + progress.totalExercises)) * 100)
    : 0;

  // Calcular pontuação total máxima do módulo
  const maxScore = progress?.maxScore || module.exercises.reduce((total, exercise) => total + exercise.points, 0);
  
  // Calcular porcentagem de pontuação obtida
  const scorePercentage = progress && maxScore > 0 
    ? Math.round((progress.score / maxScore) * 100)
    : 0;

  // Módulo é considerado completo se atingir 75% ou mais da pontuação
  const isCompleted = scorePercentage >= 75;
  
  // Status do módulo baseado na performance
  const getModuleStatus = () => {
    if (scorePercentage >= 75) return { label: 'Completo', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (scorePercentage >= 50) return { label: 'Em Progresso', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (scorePercentage > 0) return { label: 'Iniciado', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { label: 'Não Iniciado', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const moduleStatus = getModuleStatus();

  const handleClick = () => {
    if (!module.isLocked || isProfessor) {
      // Se o módulo já foi concluído, mostrar modal de confirmação
      if (isCompleted && !isProfessor) {
        setShowCompletedModal(true);
      } else {
        router.push(`/jogos/${module.id}`);
      }
    }
  };

  const handleConfirmRestart = () => {
    setShowCompletedModal(false);
    router.push(`/jogos/${module.id}`);
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnlock) {
      onUnlock(module.id);
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 ${
        module.isLocked && !isProfessor 
          ? 'opacity-75 cursor-not-allowed' 
          : 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
      } ${
        isCompleted ? 'ring-2 ring-green-400 shadow-green-100' : ''
      }`}
      onClick={handleClick}
    >
      {/* Indicador de módulo completo */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4" />
          Módulo Concluído com Sucesso!
        </div>
      )}
      
      {/* Header com ícone e título */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{module.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {module.title}
                </h3>
                {progress && (
                  <Badge 
                    variant={isCompleted ? 'default' : 'secondary'}
                    className={`${moduleStatus.bgColor} ${moduleStatus.color} text-xs`}
                  >
                    {moduleStatus.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center mt-1 space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{module.estimatedTime} min</span>
              </div>
            </div>
          </div>
          {module.isLocked && !isProfessor && (
            <Lock className="w-6 h-6 text-gray-400" />
          )}
        </div>

        {/* Descrição */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Badges de conteúdo */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            {module.content.length} conteúdos
          </Badge>
          <Badge variant="secondary">
            {module.exercises.length} exercícios
          </Badge>
          {module.realDataSources && (
            <Badge variant="default">
              Dados reais
            </Badge>
          )}
        </div>

        {/* Barra de progresso */}
        {progress && progressPercentage > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Pontuação Detalhada */}
        {progress && progress.score > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">
                  {progress.score}/{maxScore} pontos
                </span>
              </div>
              <span className={`text-sm font-medium ${moduleStatus.color}`}>
                {scorePercentage}%
              </span>
            </div>
            
            {/* Barra de pontuação */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  scorePercentage >= 75 ? 'bg-green-500' :
                  scorePercentage >= 50 ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            
            {/* Indicador de performance */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mínimo para conclusão: 75%</span>
              {scorePercentage >= 75 && (
                <span className="text-green-600 font-medium">✓ Concluído</span>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between">
          {module.isLocked && !isProfessor ? (
            <span className="text-sm text-gray-500">
              Complete o módulo anterior para desbloquear
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="group"
            >
              {progressPercentage > 0 ? 'Continuar' : 'Iniciar'}
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {isProfessor && module.isLocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnlock}
            >
              Desbloquear para turma
            </Button>
          )}
        </div>
      </div>

      {/* Indicador visual de módulo bloqueado */}
      {module.isLocked && !isProfessor && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-10 pointer-events-none" />
      )}
      
      {/* Modal de Confirmação de Módulo Já Concluído */}
      <Dialog open={showCompletedModal} onOpenChange={setShowCompletedModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <Trophy className="h-5 w-5 mr-2" />
              Módulo Já Concluído
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-semibold text-green-800">Parabéns!</p>
                <p className="text-sm text-green-600">
                  Você já concluiu este módulo com {scorePercentage}% de aproveitamento
                </p>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Deseja tentar novamente?</p>
                  <p className="text-amber-700 mt-1">
                    Sua maior nota sempre será mantida. Você tem {progress?.score}/{maxScore} pontos atualmente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCompletedModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmRestart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ModuleCard;