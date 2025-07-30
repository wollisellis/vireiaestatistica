'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Info,
  Trophy,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { 
  getRandomMethods, 
  methodCategories,
  DragDropMethod 
} from '@/data/questionBanks/module2QuestionBank';
import unifiedScoringService from '@/services/unifiedScoringService';

// Interfaces
interface DropZone {
  id: string;
  title: string;
  description: string;
  color: string;
  items: DragDropMethod[];
  acceptedMethods: string[];
}

interface DragItem extends DragDropMethod {
  isPlaced?: boolean;
}

export default function Module2QuizPage() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  
  // Estados do quiz
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Estados do drag-and-drop
  const [availableMethods, setAvailableMethods] = useState<DragItem[]>([]);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<DragItem | null>(null); // Para mobile
  
  // Estados de pontuação e tempo
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
  
  // Constantes
  const MODULE_ID = 'module-2';
  const TOTAL_POINTS = 30;
  const PASSING_SCORE = 70;

  // Inicializar quiz
  useEffect(() => {
    initializeQuiz();
  }, []);

  // Timer
  useEffect(() => {
    if (!hasStarted || isComplete) return;
    
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isComplete, startTime]);

  const initializeQuiz = async () => {
    try {
      // Verificar se já existe tentativa anterior
      if (user?.uid) {
        const attemptsQuery = query(
          collection(db, 'quiz_attempts'),
          where('studentId', '==', user.uid),
          where('moduleId', '==', MODULE_ID),
          where('passed', '==', true),
          orderBy('completedAt', 'desc'),
          limit(1)
        );
        
        const snapshot = await getDocs(attemptsQuery);
        if (!snapshot.empty) {
          // Já completou o módulo
          setIsComplete(true);
          setShowResults(true);
          const data = snapshot.docs[0].data();
          setScore(data.percentage || 0);
        }
      }

      // Configurar métodos aleatórios
      const randomMethods = getRandomMethods(4);
      setAvailableMethods(randomMethods);
      
      // Configurar zonas de drop
      const zones: DropZone[] = [
        {
          ...methodCategories.imaging,
          items: [],
          acceptedMethods: methodCategories.imaging.acceptedMethods
        },
        {
          ...methodCategories.electrical,
          items: [],
          acceptedMethods: methodCategories.electrical.acceptedMethods
        },
        {
          ...methodCategories.dilution,
          items: [],
          acceptedMethods: methodCategories.dilution.acceptedMethods
        }
      ];
      setDropZones(zones);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao inicializar quiz:', error);
      setIsLoading(false);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    setStartTime(new Date());
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetZone: DropZone) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    // Remover item da lista de disponíveis
    setAvailableMethods(prev => prev.filter(item => item.id !== draggedItem.id));
    
    // Adicionar item à zona alvo
    setDropZones(prev => prev.map(zone => 
      zone.id === targetZone.id 
        ? { ...zone, items: [...zone.items, draggedItem] }
        : zone
    ));

    setDraggedItem(null);
    
    // Verificar se todos os itens foram colocados
    checkIfComplete();
  };

  // Handlers para mobile/touch
  const handleItemClick = (item: DragItem) => {
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const handleZoneClick = (zone: DropZone) => {
    if (!selectedItem) return;

    // Remover item da lista de disponíveis
    setAvailableMethods(prev => prev.filter(item => item.id !== selectedItem.id));
    
    // Adicionar item à zona
    setDropZones(prev => prev.map(z => 
      z.id === zone.id 
        ? { ...z, items: [...z.items, selectedItem] }
        : z
    ));

    setSelectedItem(null);
    checkIfComplete();
  };

  const handleItemReturn = (item: DragItem, fromZone: DropZone) => {
    // Remover item da zona
    setDropZones(prev => prev.map(zone => 
      zone.id === fromZone.id 
        ? { ...zone, items: zone.items.filter(i => i.id !== item.id) }
        : zone
    ));
    
    // Retornar item à lista
    setAvailableMethods(prev => [...prev, item]);
    setSelectedItem(null);
  };

  const checkIfComplete = () => {
    // Pequeno delay para garantir que o estado foi atualizado
    setTimeout(() => {
      setAvailableMethods(prev => {
        if (prev.length === 0) {
          calculateScore();
        }
        return prev;
      });
    }, 100);
  };

  const calculateScore = async () => {
    let correctCount = 0;
    const newFeedback: Record<string, 'correct' | 'incorrect'> = {};

    dropZones.forEach(zone => {
      zone.items.forEach(item => {
        const isCorrect = zone.acceptedMethods.includes(item.id);
        newFeedback[item.id] = isCorrect ? 'correct' : 'incorrect';
        if (isCorrect) correctCount++;
      });
    });

    const totalItems = 4; // Sempre 4 métodos por quiz
    const calculatedScore = Math.round((correctCount / totalItems) * 100);
    
    setScore(calculatedScore);
    setFeedback(newFeedback);
    setIsComplete(true);
    setShowResults(true);
    
    // Salvar resultado
    if (user?.uid) {
      await saveQuizAttempt(calculatedScore);
    }
  };

  const saveQuizAttempt = async (percentage: number) => {
    try {
      const attemptData = {
        studentId: user?.uid,
        studentName: user?.displayName || 'Estudante',
        moduleId: MODULE_ID,
        score: Math.round((percentage / 100) * TOTAL_POINTS),
        percentage,
        passed: percentage >= PASSING_SCORE,
        startedAt: startTime,
        completedAt: serverTimestamp(),
        timeSpent: timeElapsed,
        questionsAnswered: 4,
        correctAnswers: Math.round((percentage / 100) * 4),
        moduleTitle: 'Métodos de Avaliação da Composição Corporal'
      };

      await addDoc(collection(db, 'quiz_attempts'), attemptData);
      
      // Atualizar pontuação unificada
      if (user?.uid) {
        await unifiedScoringService.updateStudentScore(
          user.uid,
          MODULE_ID,
          Math.round((percentage / 100) * TOTAL_POINTS),
          'quiz'
        );
      }
    } catch (error) {
      console.error('Erro ao salvar tentativa:', error);
    }
  };

  const resetQuiz = () => {
    setHasStarted(false);
    setIsComplete(false);
    setShowResults(false);
    setScore(0);
    setFeedback({});
    setTimeElapsed(0);
    setStartTime(null);
    setSelectedItem(null);
    initializeQuiz();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando módulo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/jogos')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700">2</span>
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Métodos de Avaliação Corporal
                </h1>
              </div>
            </div>

            {hasStarted && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
                </div>
                
                {isComplete && (
                  <Badge 
                    variant={score >= PASSING_SCORE ? 'success' : 'secondary'}
                    className="flex items-center space-x-1"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>{score}%</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasStarted ? (
          // Tela inicial
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Módulo 2: Métodos de Avaliação
                  </h2>
                  <p className="text-gray-600">
                    Teste seus conhecimentos sobre os diferentes métodos de avaliação da composição corporal
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Instruções</h3>
                      <ul className="space-y-1 text-sm text-blue-800">
                        <li>• Arraste cada método para sua categoria correta</li>
                        <li>• São 4 métodos aleatórios de um banco de 7</li>
                        <li>• Categorias: Imagem, Bioimpedância ou Diluição</li>
                        <li>• Pontuação total: 30 pontos</li>
                        <li>• Aprovação: 70% ou mais</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Iniciar Atividade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : showResults ? (
          // Tela de resultados
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    score >= PASSING_SCORE ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {score >= PASSING_SCORE ? (
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {score >= PASSING_SCORE ? 'Parabéns!' : 'Tente Novamente'}
                  </h2>
                  <p className="text-gray-600">
                    {score >= PASSING_SCORE 
                      ? 'Você completou o módulo com sucesso!'
                      : 'Você precisa de 70% ou mais para passar'}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{score}%</div>
                      <div className="text-sm text-gray-600">Pontuação</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {Math.round((score / 100) * TOTAL_POINTS)}
                      </div>
                      <div className="text-sm text-gray-600">Pontos Ganhos</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tempo gasto:</span>
                      <span className="font-medium">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Acertos:</span>
                      <span className="font-medium text-green-600">
                        {Object.values(feedback).filter(f => f === 'correct').length} de 4
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/jogos')}
                    className="flex-1"
                  >
                    Voltar aos Módulos
                  </Button>
                  
                  {score < PASSING_SCORE && (
                    <Button
                      onClick={resetQuiz}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Área do quiz drag-and-drop
          <div className="space-y-6">
            {/* Métodos disponíveis */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">
                  Métodos para Classificar
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedItem ? 'Clique em uma categoria abaixo' : 'Arraste ou clique em um método'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {availableMethods.map(method => (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, method)}
                        onClick={() => handleItemClick(method)}
                        className={`
                          p-4 bg-white border-2 rounded-lg cursor-pointer transition-all
                          ${selectedItem?.id === method.id 
                            ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' 
                            : 'border-gray-200 hover:border-purple-300'
                          }
                        `}
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {method.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {method.description}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* Zonas de categorias */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {dropZones.map(zone => (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone)}
                  onClick={() => handleZoneClick(zone)}
                  className={`
                    min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-all
                    ${zone.color}
                    ${draggedItem || selectedItem ? 'border-opacity-100 scale-[1.02]' : 'border-opacity-50'}
                    ${selectedItem ? 'cursor-pointer' : ''}
                  `}
                >
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-900">{zone.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{zone.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <AnimatePresence>
                      {zone.items.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`
                            p-3 bg-white rounded-lg border cursor-pointer
                            ${feedback[item.id] === 'correct' 
                              ? 'border-green-500 bg-green-50' 
                              : feedback[item.id] === 'incorrect'
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                            }
                          `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemReturn(item, zone);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{item.name}</span>
                            {feedback[item.id] && (
                              <div className="ml-2">
                                {feedback[item.id] === 'correct' ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}