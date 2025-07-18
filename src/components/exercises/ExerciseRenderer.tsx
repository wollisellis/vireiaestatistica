
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

const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({
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

// Componente QuizExercise com sistema de feedback completo
const QuizExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = React.useState<{[key: string]: string}>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [correctAnswers, setCorrectAnswers] = React.useState(0);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = () => {
    if (!exercise.questions || isSubmitted) return;
    
    let correct = 0;
    const totalQuestions = exercise.questions.length;
    const pointsPerQuestion = exercise.points / totalQuestions;
    
    exercise.questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correct++;
      }
    });
    
    const finalScore = Math.round(correct * pointsPerQuestion);
    setCorrectAnswers(correct);
    setScore(finalScore);
    setIsSubmitted(true);
    setShowFeedback(true);
    
    // Chamar onComplete com a pontuação real
    onComplete(finalScore);
  };

  const getQuestionFeedback = (question: any) => {
    if (!showFeedback) return null;
    
    const selectedAnswer = selectedAnswers[question.id];
    const isCorrect = selectedAnswer === question.correctAnswer;
    
    return (
      <div className={`mt-3 p-3 rounded-lg ${
        isCorrect ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {isCorrect ? (
            <span className="text-green-600 font-semibold">✓ Correto!</span>
          ) : (
            <span className="text-red-600 font-semibold">✗ Incorreto</span>
          )}
        </div>
        {!isCorrect && (
          <p className="text-sm text-red-700 mb-2">
            <strong>Resposta esperada:</strong> {question.correctAnswer}
          </p>
        )}
        <p className="text-sm text-gray-700">
          <strong>Explicação:</strong> {question.explanation}
        </p>
      </div>
    );
  };

  const allQuestionsAnswered = exercise.questions?.every(q => selectedAnswers[q.id]) || false;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Quiz</h3>
      
      {exercise.questions?.map((question, index) => (
        <div key={question.id} className="mb-6 p-4 bg-gray-50 rounded">
          <p className="font-medium mb-3">
            <span className="text-blue-600 font-semibold">Questão {index + 1}:</span> {question.text}
          </p>
          
          {question.options?.map((option, optionIndex) => {
            const isSelected = selectedAnswers[question.id] === option;
            const isCorrect = option === question.correctAnswer;
            const showCorrectAnswer = showFeedback && isCorrect;
            const showIncorrectAnswer = showFeedback && isSelected && !isCorrect;
            
            return (
              <label 
                key={optionIndex} 
                className={`flex items-center mb-2 p-2 rounded cursor-pointer transition-colors ${
                  isSubmitted ? 'cursor-not-allowed' : 'hover:bg-gray-100'
                } ${
                  showCorrectAnswer ? 'bg-green-100 border border-green-300' :
                  showIncorrectAnswer ? 'bg-red-100 border border-red-300' :
                  isSelected ? 'bg-blue-100 border border-blue-300' : ''
                }`}
              >
                <input 
                  type="radio" 
                  name={`question-${question.id}`} 
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(question.id, option)}
                  disabled={isSubmitted}
                  className="mr-3"
                />
                <span className={`${
                  showCorrectAnswer ? 'text-green-800 font-semibold' :
                  showIncorrectAnswer ? 'text-red-800' : ''
                }`}>
                  {option}
                  {showCorrectAnswer && ' ✓'}
                  {showIncorrectAnswer && ' ✗'}
                </span>
              </label>
            );
          })}
          
          {question.realDataContext && (
            <p className="text-sm text-blue-600 mt-2">📊 {question.realDataContext}</p>
          )}
          
          {getQuestionFeedback(question)}
        </div>
      ))}
      
      {!isSubmitted ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={!allQuestionsAnswered}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              allQuestionsAnswered
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submeter Respostas
          </button>
          
          {!allQuestionsAnswered && (
            <p className="text-sm text-amber-600 text-center">
              ⚠️ Responda todas as questões para submeter
            </p>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-900 mb-3">📊 Resultado do Quiz</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Corretas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{exercise.questions?.length || 0}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Desempenho:</span>
              <span className="text-sm font-bold">
                {Math.round((correctAnswers / (exercise.questions?.length || 1)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(correctAnswers / (exercise.questions?.length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <p className="text-sm text-center text-gray-600 mt-3">
            Quiz concluído! Você pode revisar suas respostas acima.
          </p>
        </div>
      )}
    </div>
  );
};

const MatchingExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [matches, setMatches] = React.useState<{[key: string]: string}>({});
  const [feedback, setFeedback] = React.useState<string>('');
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Dados para correspondência baseados na avaliação nutricional
  const matchingData = {
    items: [
      { id: 'imc', label: 'IMC', correctCategory: 'antropometrico' },
      { id: 'hemoglobina', label: 'Hemoglobina', correctCategory: 'bioquimico' },
      { id: 'renda', label: 'Renda Familiar', correctCategory: 'socioeconomico' },
      { id: 'circunferencia', label: 'Circunferência Abdominal', correctCategory: 'antropometrico' },
      { id: 'glicemia', label: 'Glicemia', correctCategory: 'bioquimico' },
      { id: 'escolaridade', label: 'Escolaridade', correctCategory: 'socioeconomico' }
    ],
    categories: [
      { id: 'antropometrico', label: 'Indicador Antropométrico' },
      { id: 'bioquimico', label: 'Indicador Bioquímico' },
      { id: 'socioeconomico', label: 'Indicador Socioeconômico' }
    ]
  };

  const availableItems = matchingData.items.filter(item => !matches[item.id]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove from previous category if exists
      const newMatches = { ...matches };
      delete newMatches[draggedItem];
      
      // Add to new category
      newMatches[draggedItem] = categoryId;
      
      setMatches(newMatches);
      setDraggedItem(null);
      setFeedback('');
    }
  };

  const removeFromCategory = (itemId: string) => {
    const newMatches = { ...matches };
    delete newMatches[itemId];
    setMatches(newMatches);
    setFeedback('');
  };

  const handleCheck = () => {
    const totalItems = matchingData.items.length;
    const matchedItems = Object.keys(matches).length;
    
    if (matchedItems < totalItems) {
      setFeedback('⚠️ Faça todas as correspondências antes de verificar!');
      return;
    }
    
    let correctMatches = 0;
    matchingData.items.forEach(item => {
      if (matches[item.id] === item.correctCategory) {
        correctMatches++;
      }
    });
    
    const percentage = (correctMatches / totalItems) * 100;
    const score = Math.round((percentage / 100) * exercise.points);
    
    if (correctMatches === totalItems) {
      setFeedback('🎉 Excelente! Todas as correspondências estão corretas!');
      setIsCompleted(true);
      onComplete(score);
    } else {
      setFeedback(`✅ ${correctMatches}/${totalItems} correspondências corretas. Tente novamente!`);
    }
  };

  const resetExercise = () => {
    setMatches({});
    setFeedback('');
    setIsCompleted(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício de Correspondência</h3>
      <p className="text-gray-600 mb-4">Arraste os indicadores para as categorias corretas.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Área de itens disponíveis */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Indicadores</h4>
          <div className="space-y-2 min-h-32">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="bg-blue-100 p-2 rounded cursor-move hover:bg-blue-200 transition-colors select-none"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Área de categorias */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            {matchingData.categories.map(category => (
              <div
                key={category.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id)}
                className="border-2 border-dashed border-gray-300 p-2 rounded min-h-16 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <strong className="text-green-800">{category.label}</strong>
                <div className="mt-2 space-y-1">
                  {Object.entries(matches)
                    .filter(([itemId, categoryId]) => categoryId === category.id)
                    .map(([itemId]) => {
                      const item = matchingData.items.find(i => i.id === itemId);
                      return (
                        <div
                          key={itemId}
                          className="bg-green-200 p-1 rounded text-sm flex items-center justify-between"
                        >
                          <span>{item?.label}</span>
                          <button
                            onClick={() => removeFromCategory(itemId)}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Remover"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${
          feedback.includes('Excelente') ? 'bg-green-100 text-green-800' :
          feedback.includes('corretas') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}
      
      {/* Botões */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Verificar Respostas
        </button>
        
        {!isCompleted && (
          <button
            onClick={resetExercise}
            className="px-4 py-2 rounded font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};

const DragDropExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [droppedItems, setDroppedItems] = React.useState<{[key: string]: string[]}>({
    'individual': [],
    'populacional': []
  });
  const [feedback, setFeedback] = React.useState<string>('');
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Itens disponíveis para arrastar
  const dragItems = [
    { id: 'anamnese', label: 'Anamnese Clínica', category: 'individual' },
    { id: 'censo', label: 'Censo Demográfico', category: 'populacional' },
    { id: 'antropometria', label: 'Antropometria', category: 'individual' },
    { id: 'sisvan', label: 'Dados SISVAN', category: 'populacional' }
  ];

  // Itens ainda não colocados nas categorias
  const availableItems = dragItems.filter(item =>
    !droppedItems.individual.includes(item.id) &&
    !droppedItems.populacional.includes(item.id)
  );

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove from other category if present
      const newDroppedItems = {
        individual: droppedItems.individual.filter(id => id !== draggedItem),
        populacional: droppedItems.populacional.filter(id => id !== draggedItem)
      };
      
      // Add to new category
      newDroppedItems[category as keyof typeof newDroppedItems].push(draggedItem);
      
      setDroppedItems(newDroppedItems);
      setDraggedItem(null);
      setFeedback('');
    }
  };

  const handleCheck = () => {
    let correctAnswers = 0;
    const totalItems = dragItems.length;
    
    // Verificar se todos os itens foram colocados
    const totalPlaced = droppedItems.individual.length + droppedItems.populacional.length;
    
    if (totalPlaced < totalItems) {
      setFeedback('⚠️ Arraste todos os itens para as categorias antes de verificar!');
      return;
    }
    
    // Verificar respostas corretas
    dragItems.forEach(item => {
      if (droppedItems[item.category as keyof typeof droppedItems].includes(item.id)) {
        correctAnswers++;
      }
    });
    
    const percentage = (correctAnswers / totalItems) * 100;
    const score = Math.round((percentage / 100) * exercise.points);
    
    if (correctAnswers === totalItems) {
      setFeedback('🎉 Perfeito! Todas as classificações estão corretas!');
      setIsCompleted(true);
      onComplete(score);
    } else {
      setFeedback(`✅ ${correctAnswers}/${totalItems} corretas. Tente novamente!`);
    }
  };

  const resetExercise = () => {
    setDroppedItems({ individual: [], populacional: [] });
    setFeedback('');
    setIsCompleted(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício Arrastar e Soltar</h3>
      <p className="text-gray-600 mb-4">Arraste os componentes para as categorias corretas.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Área de itens disponíveis */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Componentes</h4>
          <div className="space-y-2 min-h-32">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="bg-green-100 p-2 rounded cursor-move hover:bg-green-200 transition-colors select-none"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Área de categorias */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            {/* Categoria Individual */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'individual')}
              className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <strong className="text-blue-800">Avaliação Individual</strong>
              <div className="mt-2 space-y-1">
                {droppedItems.individual.map(itemId => {
                  const item = dragItems.find(i => i.id === itemId);
                  return (
                    <div
                      key={itemId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemId)}
                      className="bg-blue-200 p-1 rounded text-sm cursor-move hover:bg-blue-300 transition-colors"
                    >
                      {item?.label}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Categoria Populacional */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'populacional')}
              className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <strong className="text-purple-800">Avaliação Populacional</strong>
              <div className="mt-2 space-y-1">
                {droppedItems.populacional.map(itemId => {
                  const item = dragItems.find(i => i.id === itemId);
                  return (
                    <div
                      key={itemId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemId)}
                      className="bg-purple-200 p-1 rounded text-sm cursor-move hover:bg-purple-300 transition-colors"
                    >
                      {item?.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${
          feedback.includes('Perfeito') ? 'bg-green-100 text-green-800' :
          feedback.includes('corretas') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}
      
      {/* Botões */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Verificar Classificação
        </button>
        
        {!isCompleted && (
          <button
            onClick={resetExercise}
            className="px-4 py-2 rounded font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            Reiniciar
          </button>
        )}
      </div>
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
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [matches, setMatches] = React.useState<{[key: string]: string}>({});
  const [feedback, setFeedback] = React.useState<string>('');
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Dados para correspondência baseados na avaliação nutricional
  const matchingData = {
    items: [
      { id: 'imc', label: 'IMC', correctCategory: 'antropometrico' },
      { id: 'hemoglobina', label: 'Hemoglobina', correctCategory: 'bioquimico' },
      { id: 'renda', label: 'Renda Familiar', correctCategory: 'socioeconomico' },
      { id: 'circunferencia', label: 'Circunferência Abdominal', correctCategory: 'antropometrico' },
      { id: 'glicemia', label: 'Glicemia', correctCategory: 'bioquimico' },
      { id: 'escolaridade', label: 'Escolaridade', correctCategory: 'socioeconomico' }
    ],
    categories: [
      { id: 'antropometrico', label: 'Indicador Antropométrico' },
      { id: 'bioquimico', label: 'Indicador Bioquímico' },
      { id: 'socioeconomico', label: 'Indicador Socioeconômico' }
    ]
  };

  const availableItems = matchingData.items.filter(item => !matches[item.id]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove from previous category if exists
      const newMatches = { ...matches };
      delete newMatches[draggedItem];
      
      // Add to new category
      newMatches[draggedItem] = categoryId;
      
      setMatches(newMatches);
      setDraggedItem(null);
      setFeedback('');
    }
  };

  const removeFromCategory = (itemId: string) => {
    const newMatches = { ...matches };
    delete newMatches[itemId];
    setMatches(newMatches);
    setFeedback('');
  };

  const handleCheck = () => {
    const totalItems = matchingData.items.length;
    const matchedItems = Object.keys(matches).length;
    
    if (matchedItems < totalItems) {
      setFeedback('⚠️ Faça todas as correspondências antes de verificar!');
      return;
    }
    
    let correctMatches = 0;
    matchingData.items.forEach(item => {
      if (matches[item.id] === item.correctCategory) {
        correctMatches++;
      }
    });
    
    const percentage = (correctMatches / totalItems) * 100;
    const score = Math.round((percentage / 100) * exercise.points);
    
    if (correctMatches === totalItems) {
      setFeedback('🎉 Excelente! Todas as correspondências estão corretas!');
      setIsCompleted(true);
      onComplete(score);
    } else {
      setFeedback(`✅ ${correctMatches}/${totalItems} correspondências corretas. Tente novamente!`);
    }
  };

  const resetExercise = () => {
    setMatches({});
    setFeedback('');
    setIsCompleted(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício de Correspondência</h3>
      <p className="text-gray-600 mb-4">Arraste os indicadores para as categorias corretas.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Área de itens disponíveis */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Indicadores</h4>
          <div className="space-y-2 min-h-32">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="bg-blue-100 p-2 rounded cursor-move hover:bg-blue-200 transition-colors select-none"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Área de categorias */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            {matchingData.categories.map(category => (
              <div
                key={category.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id)}
                className="border-2 border-dashed border-gray-300 p-2 rounded min-h-16 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <strong className="text-green-800">{category.label}</strong>
                <div className="mt-2 space-y-1">
                  {Object.entries(matches)
                    .filter(([itemId, categoryId]) => categoryId === category.id)
                    .map(([itemId]) => {
                      const item = matchingData.items.find(i => i.id === itemId);
                      return (
                        <div
                          key={itemId}
                          className="bg-green-200 p-1 rounded text-sm flex items-center justify-between"
                        >
                          <span>{item?.label}</span>
                          <button
                            onClick={() => removeFromCategory(itemId)}
                            className="text-red-600 hover:text-red-800 ml-2"
                            title="Remover"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${
          feedback.includes('Excelente') ? 'bg-green-100 text-green-800' :
          feedback.includes('corretas') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}
      
      {/* Botões */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Verificar Respostas
        </button>
        
        {!isCompleted && (
          <button
            onClick={resetExercise}
            className="px-4 py-2 rounded font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            Reiniciar
          </button>
        )}
      </div>
    </div>
  );
};

const DragDropExercise: React.FC<ExerciseRendererProps> = ({ exercise, onComplete }) => {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [droppedItems, setDroppedItems] = React.useState<{[key: string]: string[]}>({
    'individual': [],
    'populacional': []
  });
  const [feedback, setFeedback] = React.useState<string>('');
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Itens disponíveis para arrastar
  const dragItems = [
    { id: 'anamnese', label: 'Anamnese Clínica', category: 'individual' },
    { id: 'censo', label: 'Censo Demográfico', category: 'populacional' },
    { id: 'antropometria', label: 'Antropometria', category: 'individual' },
    { id: 'sisvan', label: 'Dados SISVAN', category: 'populacional' }
  ];

  // Itens ainda não colocados nas categorias
  const availableItems = dragItems.filter(item =>
    !droppedItems.individual.includes(item.id) &&
    !droppedItems.populacional.includes(item.id)
  );

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault();
    
    if (draggedItem) {
      // Remove from other category if present
      const newDroppedItems = {
        individual: droppedItems.individual.filter(id => id !== draggedItem),
        populacional: droppedItems.populacional.filter(id => id !== draggedItem)
      };
      
      // Add to new category
      newDroppedItems[category as keyof typeof newDroppedItems].push(draggedItem);
      
      setDroppedItems(newDroppedItems);
      setDraggedItem(null);
      setFeedback('');
    }
  };

  const handleCheck = () => {
    let correctAnswers = 0;
    const totalItems = dragItems.length;
    
    // Verificar se todos os itens foram colocados
    const totalPlaced = droppedItems.individual.length + droppedItems.populacional.length;
    
    if (totalPlaced < totalItems) {
      setFeedback('⚠️ Arraste todos os itens para as categorias antes de verificar!');
      return;
    }
    
    // Verificar respostas corretas
    dragItems.forEach(item => {
      if (droppedItems[item.category as keyof typeof droppedItems].includes(item.id)) {
        correctAnswers++;
      }
    });
    
    const percentage = (correctAnswers / totalItems) * 100;
    const score = Math.round((percentage / 100) * exercise.points);
    
    if (correctAnswers === totalItems) {
      setFeedback('🎉 Perfeito! Todas as classificações estão corretas!');
      setIsCompleted(true);
      onComplete(score);
    } else {
      setFeedback(`✅ ${correctAnswers}/${totalItems} corretas. Tente novamente!`);
    }
  };

  const resetExercise = () => {
    setDroppedItems({ individual: [], populacional: [] });
    setFeedback('');
    setIsCompleted(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Exercício Arrastar e Soltar</h3>
      <p className="text-gray-600 mb-4">Arraste os componentes para as categorias corretas.</p>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Área de itens disponíveis */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Componentes</h4>
          <div className="space-y-2 min-h-32">
            {availableItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                className="bg-green-100 p-2 rounded cursor-move hover:bg-green-200 transition-colors select-none"
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* Área de categorias */}
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">Categorias</h4>
          <div className="space-y-2">
            {/* Categoria Individual */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'individual')}
              className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <strong className="text-blue-800">Avaliação Individual</strong>
              <div className="mt-2 space-y-1">
                {droppedItems.individual.map(itemId => {
                  const item = dragItems.find(i => i.id === itemId);
                  return (
                    <div
                      key={itemId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemId)}
                      className="bg-blue-200 p-1 rounded text-sm cursor-move hover:bg-blue-300 transition-colors"
                    >
                      {item?.label}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Categoria Populacional */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'populacional')}
              className="border-2 border-dashed border-gray-300 p-2 rounded min-h-20 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <strong className="text-purple-800">Avaliação Populacional</strong>
              <div className="mt-2 space-y-1">
                {droppedItems.populacional.map(itemId => {
                  const item = dragItems.find(i => i.id === itemId);
                  return (
                    <div
                      key={itemId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, itemId)}
                      className="bg-purple-200 p-1 rounded text-sm cursor-move hover:bg-purple-300 transition-colors"
                    >
                      {item?.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-lg ${
          feedback.includes('Perfeito') ? 'bg-green-100 text-green-800' :
          feedback.includes('corretas') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}
      
      {/* Botões */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCheck}
          disabled={isCompleted}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Verificar Classificação
        </button>
        
        {!isCompleted && (
          <button
            onClick={resetExercise}
            className="px-4 py-2 rounded font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          >
            Reiniciar
          </button>
        )}
      </div>
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

export default ExerciseRenderer;