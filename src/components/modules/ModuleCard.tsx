'use client';

import React from 'react';
import { Module } from '@/types/modules';
import { Lock, Clock, Trophy, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ModuleCardProps {
  module: Module;
  progress?: {
    completedContent: number;
    totalContent: number;
    completedExercises: number;
    totalExercises: number;
    score: number;
  };
  onUnlock?: (moduleId: string) => void;
  isProfessor?: boolean;
}

export function ModuleCard({ module, progress, onUnlock, isProfessor = false }: ModuleCardProps) {
  const router = useRouter();
  
  const progressPercentage = progress 
    ? Math.round(((progress.completedContent + progress.completedExercises) / 
        (progress.totalContent + progress.totalExercises)) * 100)
    : 0;

  const handleClick = () => {
    if (!module.isLocked || isProfessor) {
      router.push(`/modules/${module.id}`);
    }
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
      }`}
      onClick={handleClick}
    >
      {/* Header com ícone e título */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{module.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {module.title}
              </h3>
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

        {/* Pontuação */}
        {progress && progress.score > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">{progress.score} pontos</span>
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
    </Card>
  );
}