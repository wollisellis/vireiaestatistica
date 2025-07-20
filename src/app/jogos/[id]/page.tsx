'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Trophy, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { Module } from '@/types/modules';
import { getModuleById } from '@/data/modules';
import { ExerciseRenderer } from '@/components/exercises/ExerciseRenderer';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { useStudentProgress } from '@/contexts/StudentProgressContext';
import { StudentProgressProvider } from '@/contexts/StudentProgressContext';

function JogoPageContent() {
  const params = useParams();
  const moduleId = params.id as string;
  const [module, setModule] = useState<Module | null>(null);
  const [currentTab, setCurrentTab] = useState<'content' | 'exercises'>('content');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  const { updateModuleScore } = useStudentProgress();

  // Redirecionamento baseado no papel - permite acesso de convidados
  useRoleRedirect({ allowGuests: true });

  useEffect(() => {
    if (moduleId) {
      const moduleData = getModuleById(moduleId);
      setModule(moduleData || null);
    }
  }, [moduleId]);

  const handleExerciseComplete = (exerciseId: string, score: number) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId]);
      setTotalScore(totalScore + score);
    }
    setSelectedExercise(null);
  };

  // Atualiza a pontuação do módulo quando todos os exercícios são concluídos
  useEffect(() => {
    if (module && completedExercises.length === module.exercises.length && module.exercises.length > 0) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000); // em segundos
      const maxScore = module.exercises.reduce((sum, exercise) => sum + exercise.points, 0);
      const difficulty = module.exercises.some(ex => ex.difficulty === 'hard') ? 'hard' : 
                       module.exercises.some(ex => ex.difficulty === 'medium') ? 'medium' : 'easy';
      
      // Atualizar pontuação do módulo de forma assíncrona
      const updateScore = async () => {
        try {
          await updateModuleScore(
            module.id,
            totalScore,
            maxScore,
            timeElapsed,
            completedExercises.length,
            module.exercises.length,
            difficulty
          );
        } catch (error) {
          console.error('Erro ao atualizar pontuação do módulo:', error);
        }
      };
      
      updateScore();
    }
  }, [completedExercises, totalScore, module, startTime, updateModuleScore]);

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Jogo não encontrado</h1>
          <Link href="/jogos" className="text-blue-600 hover:text-blue-800">
            Voltar para Jogos
          </Link>
        </div>
      </div>
    );
  }

  const selectedExerciseData = selectedExercise 
    ? module.exercises.find(ex => ex.id === selectedExercise)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/jogos" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Jogos
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-3">{module.icon}</span>
                  {module.title}
                </h1>
                <p className="text-gray-600 mt-2">{module.description}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-gray-600 mb-2">
                  <Clock className="w-4 h-4 mr-1" />
                  {module.estimatedTime} min
                </div>
                <div className="flex items-center text-blue-600">
                  <Trophy className="w-4 h-4 mr-1" />
                  {totalScore} pontos
                </div>
              </div>
            </div>
            
            {/* Progresso */}
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {module.content.length} conteúdos
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {module.exercises.length} exercícios
              </span>
              <span className="text-green-600">
                {completedExercises.length}/{module.exercises.length} exercícios completos
              </span>
            </div>
            
            {/* Badges de dados reais */}
            {module.realDataSources && module.realDataSources.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {module.realDataSources.map((source, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    📊 {source.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setCurrentTab('content')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'content'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Conteúdo
            </button>
            <button
              onClick={() => setCurrentTab('exercises')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                currentTab === 'exercises'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              Exercícios
            </button>
          </nav>
        </div>

        {/* Content Area */}
        {currentTab === 'content' && (
          <div className="space-y-6">
            {module.content.map((content, index) => (
              <div key={content.id} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {content.title}
                </h2>
                
                {content.type === 'text' && (
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed space-y-4">
                      {content.content.split('\n\n').map((paragraph, index) => (
                        <div key={index} className="text-base leading-7">
                          {paragraph.split('**').map((text, textIndex) => {
                            if (textIndex % 2 === 1) {
                              return <strong key={textIndex}>{text}</strong>;
                            }
                            return text;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {content.type === 'video' && (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">🎥 Vídeo: {content.title}</p>
                  </div>
                )}
                
                {content.type === 'image' && (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">🖼️ Imagem: {content.title}</p>
                  </div>
                )}
                
                {content.type === 'interactive' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800">🎮 Conteúdo Interativo: {content.title}</p>
                    <p className="text-blue-600 text-sm mt-2">
                      Conteúdo interativo disponível - implementação específica: {content.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Botão Começar Exercícios no final */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <button
                  onClick={() => setCurrentTab('exercises')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <span>🎯</span>
                  Começar Exercícios
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'exercises' && !selectedExercise && (
          <div className="space-y-4">
            {module.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedExercise(exercise.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {exercise.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{exercise.description}</p>
                    
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {exercise.points} pontos
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exercise.difficulty === 'easy' ? 'Fácil' : 
                         exercise.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                      </span>
                      
                      {exercise.type === 'brazilian-data' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          📊 Dados Brasileiros
                        </span>
                      )}
                      
                      {exercise.type === 'case-study' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          🔍 Caso Clínico
                        </span>
                      )}
                      
                      {exercise.type === 'collaborative' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          👥 Colaborativo
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    {completedExercises.includes(exercise.id) ? (
                      <div className="flex items-center text-green-600">
                        <Trophy className="w-5 h-5 mr-1" />
                        Completo
                      </div>
                    ) : (
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Iniciar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exercise Renderer */}
        {selectedExercise && selectedExerciseData && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setSelectedExercise(null)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Exercícios
              </button>
            </div>
            
            <ExerciseRenderer
              exercise={selectedExerciseData}
              onComplete={(score) => handleExerciseComplete(selectedExercise, score)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function JogoPage() {
  return (
    <StudentProgressProvider>
      <JogoPageContent />
    </StudentProgressProvider>
  );
}
