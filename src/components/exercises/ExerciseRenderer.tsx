'use client';

import React from 'react';
import { Exercise } from '@/types/modules';
import BrazilianDataExercise from './BrazilianDataExercise';
import BrazilianCaseStudy from './BrazilianCaseStudy';

interface ExerciseRendererProps {
  exercise: Exercise;
  onComplete: (score: number) => void;
  onProgress?: (progress: number) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
  exercise,
  onComplete,
  onProgress
}) => {
  const renderExercise = () => {
    switch (exercise.type) {
      case 'brazilian-data':
        return (
          <BrazilianDataExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'case-study':
        return (
          <BrazilianCaseStudy
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'quiz':
        return (
          <QuizExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'matching':
        return (
          <MatchingExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'drag-drop':
        return (
          <DragDropExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'calculation':
        return (
          <CalculationExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'collaborative':
        return (
          <CollaborativeExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      case 'interactive':
        return (
          <InteractiveExercise
            exercise={exercise}
            onComplete={onComplete}
            onProgress={onProgress}
          />
        );

      default:
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="font-bold">Tipo de exercício não implementado</p>
            <p>Tipo: {exercise.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="exercise-container">
      <div className="exercise-header mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{exercise.title}</h2>
        <p className="text-gray-600 mb-4">{exercise.description}</p>
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
        </div>
      </div>
      
      <div className="exercise-content">
        {renderExercise()}
      </div>
    </div>
  );
};

// Componentes placeholder para outros tipos de exercício
const QuizExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Quiz</h3>
      {exercise.questions?.map((question, index) => (
        <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded">
          <p className="font-medium mb-3">{question.text}</p>
          {question.options?.map((option, optionIndex) => (
            <label key={optionIndex} className="flex items-center mb-2">
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={option}
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {question.realDataContext && (
            <p className="text-sm text-blue-600 mt-2">📊 {question.realDataContext}</p>
          )}
        </div>
      ))}
      <button
        onClick={() => onComplete(exercise.points)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submeter Respostas
      </button>
    </div>
  );
};

const MatchingExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício de Correspondência</h3>
      <p className="text-gray-600 mb-4">Arraste os itens para fazer as correspondências corretas.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Itens</h4>
          <div className="space-y-2">
            <div className="bg-blue-100 p-2 rounded cursor-move">Item 1</div>
            <div className="bg-blue-100 p-2 rounded cursor-move">Item 2</div>
            <div className="bg-blue-100 p-2 rounded cursor-move">Item 3</div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 p-2 rounded min-h-12">Categoria A</div>
            <div className="border-2 border-dashed border-gray-300 p-2 rounded min-h-12">Categoria B</div>
            <div className="border-2 border-dashed border-gray-300 p-2 rounded min-h-12">Categoria C</div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onComplete(exercise.points)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Verificar Respostas
      </button>
    </div>
  );
};

const DragDropExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício Arrastar e Soltar</h3>
      <p className="text-gray-600 mb-4">Arraste os componentes para as categorias corretas.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Componentes</h4>
          <div className="space-y-2">
            <div className="bg-green-100 p-2 rounded cursor-move">Anamnese Clínica</div>
            <div className="bg-green-100 p-2 rounded cursor-move">Censo Demográfico</div>
            <div className="bg-green-100 p-2 rounded cursor-move">Antropometria</div>
            <div className="bg-green-100 p-2 rounded cursor-move">Dados SISVAN</div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20">
              <strong>Avaliação Individual</strong>
            </div>
            <div className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20">
              <strong>Avaliação Populacional</strong>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onComplete(exercise.points)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Verificar Classificação
      </button>
    </div>
  );
};

const CalculationExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício de Cálculo</h3>
      <p className="text-gray-600 mb-4">Realize os cálculos solicitados.</p>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peso (kg):
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 70"
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altura (m):
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 1.70"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IMC Calculado:
          </label>
          <input
            type="number"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Resultado do cálculo"
          />
        </div>
      </div>
      
      <button
        onClick={() => onComplete(exercise.points)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Verificar Cálculo
      </button>
    </div>
  );
};

const CollaborativeExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício Colaborativo</h3>
      <p className="text-gray-600 mb-4">Trabalhe em dupla para resolver este exercício.</p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-yellow-800 mb-2">Como funciona:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Insira o ID do seu colega de estudo</li>
          <li>2. Discutam o caso em pessoa</li>
          <li>3. Submetam a resposta juntos</li>
          <li>4. Ambos recebem a mesma pontuação</li>
        </ol>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID do Colega:
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: estudante123"
          />
        </div>
        
        {exercise.caseData && (
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Caso Clínico:</h4>
            <p className="text-sm text-gray-700 mb-2">
              <strong>Paciente:</strong> {exercise.caseData.patientProfile.gender === 'M' ? 'Masculino' : 'Feminino'}, {exercise.caseData.patientProfile.age} anos
            </p>
            <p className="text-sm text-gray-700 mb-2">
              <strong>História:</strong> {exercise.caseData.clinicalHistory}
            </p>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onComplete(exercise.points)}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Iniciar Colaboração
      </button>
    </div>
  );
};

const InteractiveExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício Interativo</h3>
      <p className="text-gray-600 mb-4">Interaja com o conteúdo para completar o exercício.</p>
      
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg mb-4">
        <h4 className="font-medium mb-2">Simulação Interativa</h4>
        <p className="text-sm text-gray-700 mb-4">
          Esta simulação permite explorar diferentes cenários e ver os resultados em tempo real.
        </p>
        <div className="bg-white p-4 rounded shadow-inner">
          <p className="text-center text-gray-500">
            🎮 Área de Simulação Interativa
          </p>
        </div>
      </div>
      
      <button
        onClick={() => onComplete(exercise.points)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Completar Exercício
      </button>
    </div>
  );
};