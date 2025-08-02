'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Loader2,
  Volume2,
  VolumeX,
  Timer,
  Zap,
  Sparkles,
  Camera,
  Waves,
  FlaskConical
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { db } from '@/lib/firebase';
// ModuleAccessGuard removido - verificação já feita na página anterior
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
  icon: React.ComponentType<any>;
}

interface DragItem extends DragDropMethod {
  isPlaced?: boolean;
}

// Sons de feedback (usando Web Audio API)
const playSound = (type: 'correct' | 'incorrect' | 'drop') => {
  if (typeof window === 'undefined') return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Configurações para cada tipo de som
  if (type === 'correct') {
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  } else if (type === 'incorrect') {
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2); // A2
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  } else {
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  }
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

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
  const [originalMethods, setOriginalMethods] = useState<DragItem[]>([]); // ✅ Para feedback completo
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<DragItem | null>(null); // Para mobile
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  
  // Estados de configuração
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState(180); // 3 minutos
  
  // Estados de pontuação e tempo
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [detailedFeedback, setDetailedFeedback] = useState<Record<string, {
    isCorrect: boolean;
    correctCategory: string;
    wrongCategory?: string;
    explanation: string;
    tip: string;
  }>>({});
  
  // ✅ Estados do sistema de confirmação
  const [isReadyToConfirm, setIsReadyToConfirm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  
  // Constantes
  const MODULE_ID = 'module-2';
  const TOTAL_POINTS = 30;
  const PASSING_SCORE = 70;
  
  // Ícones para categorias
  const categoryIcons = {
    imaging: Camera,
    electrical: Zap,
    dilution: Waves
  };

  // Helper para gerar feedback educativo
  const generateEducationalFeedback = (
    method: DragDropMethod, 
    wrongCategory: string, 
    correctCategory: string
  ) => {
    const categoryNames = {
      imaging: 'Métodos de Imagem',
      electrical: 'Métodos Elétricos',
      dilution: 'Métodos de Diluição'
    };

    const categoryExplanations = {
      imaging: 'utilizam radiação ou ondas para criar imagens do corpo',
      electrical: 'medem a resistência elétrica do corpo',
      dilution: 'calculam a composição corporal através da diluição de substâncias'
    };

    let explanation = `${method.name} pertence aos ${categoryNames[correctCategory]} porque ${categoryExplanations[correctCategory]}.`;
    
    // Adicionar explicação específica do método
    if (method.characteristics && method.characteristics.length > 0) {
      explanation += ` Este método ${method.characteristics[0].toLowerCase()}.`;
    }

    // Gerar dica baseada nas características do método
    let tip = '';
    if (correctCategory === 'imaging') {
      tip = '💡 Dica: Métodos de imagem sempre envolvem algum tipo de visualização interna do corpo.';
    } else if (correctCategory === 'electrical') {
      tip = '💡 Dica: Métodos elétricos aproveitam o fato de que diferentes tecidos conduzem eletricidade de forma diferente.';
    } else if (correctCategory === 'dilution') {
      tip = '💡 Dica: Métodos de diluição calculam volumes corporais através da distribuição de substâncias no organismo.';
    }

    return {
      explanation,
      tip
    };
  };

  // Cores aprimoradas para categorias
  const categoryColors = {
    imaging: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-400',
      hover: 'hover:border-blue-500 hover:shadow-blue-200',
      active: 'border-blue-600 shadow-lg shadow-blue-300',
      text: 'text-blue-700'
    },
    electrical: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-100',
      border: 'border-yellow-400',
      hover: 'hover:border-yellow-500 hover:shadow-yellow-200',
      active: 'border-yellow-600 shadow-lg shadow-yellow-300',
      text: 'text-yellow-700'
    },
    dilution: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-100',
      border: 'border-green-400',
      hover: 'hover:border-green-500 hover:shadow-green-200',
      active: 'border-green-600 shadow-lg shadow-green-300',
      text: 'text-green-700'
    }
  };

  // Inicializar quiz
  useEffect(() => {
    initializeQuiz();
  }, []);

  // Timer
  useEffect(() => {
    if (!hasStarted || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000);
      setTimeElapsed(elapsed);
      
      if (timerEnabled) {
        const remaining = Math.max(0, timeLimit - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          // Tempo esgotado
          handleTimeUp();
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isComplete, startTime, timerEnabled, timeLimit]);

  const initializeQuiz = async (forceNewQuiz = false) => {
    try {
      // ✅ CORREÇÃO: Sempre carregar novo quiz - removido bloqueio de tentativas anteriores
      // Agora o módulo sempre permite novas tentativas sem precisar de F5

      // Configurar métodos aleatórios
      const randomMethods = getRandomMethods(4);
      setAvailableMethods(randomMethods);
      setOriginalMethods([...randomMethods]); // ✅ Salvar cópia dos métodos originais
      
      // Configurar zonas de drop com ícones
      const zones: DropZone[] = [
        {
          ...methodCategories.imaging,
          items: [],
          acceptedMethods: methodCategories.imaging.acceptedMethods,
          icon: Camera
        },
        {
          ...methodCategories.electrical,
          items: [],
          acceptedMethods: methodCategories.electrical.acceptedMethods,
          icon: Zap
        },
        {
          ...methodCategories.dilution,
          items: [],
          acceptedMethods: methodCategories.dilution.acceptedMethods,
          icon: Waves
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

  const handleDragEnter = (zoneId: string) => {
    setHoveredZone(zoneId);
  };

  const handleDragLeave = () => {
    setHoveredZone(null);
  };

  const handleDrop = (e: React.DragEvent, targetZone: DropZone) => {
    e.preventDefault();
    setHoveredZone(null);
    
    if (!draggedItem) return;

    // Som de drop
    if (soundEnabled) playSound('drop');

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

    // Som de drop
    if (soundEnabled) playSound('drop');

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
    // ✅ CORREÇÃO: Não finalizar automaticamente, mostrar confirmação
    setTimeout(() => {
      setAvailableMethods(prev => {
        const methodsPlaced = 4 - prev.length;
        setIsReadyToConfirm(prev.length === 0); // Pronto quando todos os 4 foram colocados
        return prev;
      });
    }, 100);
  };

  const handleTimeUp = () => {
    // Tempo esgotado - calcular pontuação com o que foi feito
    calculateScore();
  };

  // ✅ Funções do sistema de confirmação
  const handleConfirmAnswers = () => {
    calculateScore();
  };

  const handleReviewAnswers = () => {
    setShowConfirmation(true);
  };

  const handleContinueEditing = () => {
    setShowConfirmation(false);
  };

  const calculateScore = async () => {
    let correctCount = 0;
    const newFeedback: Record<string, 'correct' | 'incorrect'> = {};
    const newDetailedFeedback: Record<string, any> = {};

    // ✅ CORREÇÃO: Usar métodos originais para ter todos os 4 métodos no feedback
    const methodsMap: Record<string, DragDropMethod> = {};
    originalMethods.forEach(method => {
      methodsMap[method.id] = method;
    });

    dropZones.forEach(zone => {
      zone.items.forEach(item => {
        const isCorrect = zone.acceptedMethods.includes(item.id);
        newFeedback[item.id] = isCorrect ? 'correct' : 'incorrect';
        
        // Gerar feedback detalhado
        const method = methodsMap[item.id] || item;
        const correctCategory = method.category;
        
        if (isCorrect) {
          correctCount++;
          if (soundEnabled) playSound('correct');
          
          newDetailedFeedback[item.id] = {
            isCorrect: true,
            correctCategory: zone.id,
            wrongCategory: undefined,
            explanation: `✅ Correto! ${method.name} realmente pertence aos ${zone.title}.`,
            tip: '👏 Excelente! Você demonstrou compreender este método.'
          };
        } else {
          if (soundEnabled) playSound('incorrect');
          
          const feedbackData = generateEducationalFeedback(method, zone.id, correctCategory);
          newDetailedFeedback[item.id] = {
            isCorrect: false,
            correctCategory: correctCategory,
            wrongCategory: zone.id,
            explanation: feedbackData.explanation,
            tip: feedbackData.tip
          };
        }
      });
    });

    // ✅ CORREÇÃO: Processar métodos não colocados como incorretos
    originalMethods.forEach(method => {
      if (!newFeedback[method.id]) {
        // Método não foi colocado em nenhuma zona
        newFeedback[method.id] = 'incorrect';
        newDetailedFeedback[method.id] = {
          isCorrect: false,
          correctCategory: method.category,
          wrongCategory: 'not_placed',
          explanation: `❌ ${method.name} não foi classificado. Pertence aos ${method.category === 'imaging' ? 'Métodos de Imagem' : method.category === 'electrical' ? 'Métodos Elétricos' : 'Métodos de Diluição'}.`,
          tip: '💡 Dica: Leia com atenção as características de cada método para classificá-lo corretamente.'
        };
      }
    });

    const totalItems = 4; // Sempre 4 métodos por quiz
    const calculatedScore = Math.round((correctCount / totalItems) * 100);
    
    setScore(calculatedScore);
    setFeedback(newFeedback);
    setDetailedFeedback(newDetailedFeedback);
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
        moduleTitle: 'Métodos de Avaliação Nutricional',
        timerEnabled: timerEnabled,
        soundEnabled: soundEnabled
      };

      await addDoc(collection(db, 'quiz_attempts'), attemptData);
      
      // Atualizar pontuação unificada
      if (user?.uid) {
        await unifiedScoringService.updateStudentScore(
          user.uid,
          MODULE_ID,
          percentage, // ✅ CORREÇÃO: Enviar porcentagem direta (0-100) ao invés de pontos convertidos
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
    setDetailedFeedback({});
    setTimeElapsed(0);
    setTimeRemaining(timeLimit);
    setStartTime(null);
    setSelectedItem(null);
    setHoveredZone(null);
    // ✅ Reset estados de confirmação
    setIsReadyToConfirm(false);
    setShowConfirmation(false);
    // Forçar novo quiz ao tentar novamente
    initializeQuiz(true);
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
                  Métodos de Avaliação Nutricional
                </h1>
              </div>
            </div>

            {hasStarted && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
                  {timerEnabled && (
                    <Badge 
                      variant={timeRemaining < 30 ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      <Timer className="w-3 h-3 mr-1" />
                      {formatTime(timeRemaining)}
                    </Badge>
                  )}
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
          // Tela inicial com configurações
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Módulo 2: Métodos de Avaliação Nutricional
                  </h2>
                  <p className="text-gray-600">
                    Teste seus conhecimentos sobre os diferentes métodos de avaliação nutricional
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
                        <li>• Pontuação total: 30 pontos</li>
                        <li>• Qualquer pontuação conclui o módulo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Configurações do jogo */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Configurações do Jogo</h3>
                  

                  {/* Som */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                      <span className="font-medium">Sons de Feedback</span>
                    </div>
                    <Switch
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer className="w-5 h-5" />
                      <span className="font-medium">Modo com Tempo Limitado (3 min)</span>
                    </div>
                    <Switch
                      checked={timerEnabled}
                      onCheckedChange={setTimerEnabled}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
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
                      : 'Continue praticando para melhorar sua pontuação!'}
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

                {/* Detalhamento das respostas com feedback educativo */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Suas Respostas e Feedback</h3>
                  
                  {/* Mostrar respostas corretas primeiro */}
                  {Object.entries(detailedFeedback).filter(([_, fb]) => fb.isCorrect).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-green-700">✅ Respostas Corretas</h4>
                      {Object.entries(detailedFeedback)
                        .filter(([_, fb]) => fb.isCorrect)
                        .map(([methodId, fb]) => {
                          const method = availableMethods.find(m => m.id === methodId);
                          return (
                            <div key={methodId} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-800">{fb.explanation}</p>
                            </div>
                          );
                        })}
                    </div>
                  )}
                  
                  {/* Mostrar respostas incorretas com feedback detalhado */}
                  {Object.entries(detailedFeedback).filter(([_, fb]) => !fb.isCorrect).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-red-700">❌ Respostas que Precisam de Atenção</h4>
                      {Object.entries(detailedFeedback)
                        .filter(([_, fb]) => !fb.isCorrect)
                        .map(([methodId, fb]) => {
                          const method = availableMethods.find(m => m.id === methodId);
                          const categoryNames = {
                            imaging: 'Métodos de Imagem',
                            electrical: 'Métodos Elétricos',
                            dilution: 'Métodos de Diluição'
                          };
                          
                          return (
                            <div key={methodId} className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                              <div className="flex items-start space-x-2">
                                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-2">
                                  <p className="text-sm font-medium text-red-800">
                                    {method?.name || 'Método'} foi colocado incorretamente em {categoryNames[fb.wrongCategory as keyof typeof categoryNames]}
                                  </p>
                                  <p className="text-sm text-gray-700">{fb.explanation}</p>
                                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                    <p className="text-sm text-yellow-800">{fb.tip}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
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
            {/* Layout melhorado com separação clara */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lado esquerdo - Itens disponíveis */}
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <FlaskConical className="w-5 h-5 text-purple-600" />
                      <span>Métodos para Classificar</span>
                    </h3>
                    {/* ✅ Contador de progresso */}
                    <Badge variant={isReadyToConfirm ? 'success' : 'secondary'} className="text-sm">
                      {4 - availableMethods.length}/4 classificados
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedItem ? 'Clique em uma categoria à direita' : 'Arraste ou clique em um item'}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {availableMethods.map(method => (
                        <motion.div
                          key={method.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e as any, method)}
                          onClick={() => handleItemClick(method)}
                          className={`
                            p-4 bg-white border-2 rounded-lg cursor-pointer transition-all
                            ${selectedItem?.id === method.id 
                              ? 'border-purple-500 shadow-lg ring-2 ring-purple-200 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {method.name}
                            </h4>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {availableMethods.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <p>Todos os itens foram classificados!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lado direito - Zonas de categorias */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Categorias de Avaliação</span>
                </h3>
                
                {dropZones.map(zone => {
                  const colors = categoryColors[zone.id as keyof typeof categoryColors];
                  const Icon = zone.icon;
                  
                  return (
                    <motion.div
                      key={zone.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      onDragOver={handleDragOver}
                      onDragEnter={() => handleDragEnter(zone.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, zone)}
                      onClick={() => handleZoneClick(zone)}
                      className={`
                        min-h-[150px] p-4 border-2 rounded-xl transition-all duration-300
                        ${colors.bg} ${colors.border} ${colors.hover}
                        ${hoveredZone === zone.id ? colors.active : ''}
                        ${draggedItem || selectedItem ? 'cursor-pointer' : ''}
                      `}
                    >
                      <div className="mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 bg-white rounded-lg ${colors.text}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className={`font-semibold text-lg ${colors.text}`}>
                              {zone.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-0.5">{zone.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <AnimatePresence>
                          {zone.items.map(item => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={`
                                p-3 bg-white rounded-lg border cursor-pointer transition-all
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
                                <span className="text-sm font-medium">
                                  {item.name}
                                </span>
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
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ✅ Sistema de confirmação obrigatório */}
            {!showConfirmation && isReadyToConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Todos os métodos foram classificados!
                    </h3>
                    <p className="text-green-700 mb-4">
                      Revise suas escolhas e confirme quando estiver pronto.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleReviewAnswers}
                        variant="outline"
                        className="border-green-500 text-green-700 hover:bg-green-100"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Revisar Respostas
                      </Button>
                      <Button
                        onClick={handleConfirmAnswers}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar e Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ✅ Modo de revisão */}
            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <Info className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Modo de Revisão
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Você pode ainda mover os métodos para ajustar suas respostas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={handleContinueEditing}
                        variant="outline"
                        className="border-blue-500 text-blue-700 hover:bg-blue-100"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Continuar Editando
                      </Button>
                      <Button
                        onClick={handleConfirmAnswers}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Respostas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}