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
  Info,
  Trophy,
  Loader2,
  MousePointer,
  Sparkles,
  BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { db } from '@/lib/firebase';
import { ModuleAccessGuard } from '@/components/guards/ModuleAccessGuard';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
} from 'firebase/firestore';
import { 
  anatomicalPoints,
  isClickWithinTolerance,
  generateEducationalFeedback,
  module3Config,
  pointsOrder,
  AnatomicalPoint
} from '@/data/questionBanks/module3AnthropometricData';
import HybridHumanBodyInteraction from '@/components/games/HybridHumanBodyInteraction';
import unifiedScoringService from '@/services/unifiedScoringService';

// Interfaces
interface ConfidenceAssessment {
  pointId: string;
  confidence: number; // 0-100
}

interface PointAttempt {
  pointId: string;
  attempts: number;
  correct: boolean;
  score: number;
}

interface FeedbackPoint {
  x: number;
  y: number;
  correct: boolean;
}

export default function Module3QuizPage() {
  const router = useRouter();
  const { user } = useFirebaseAuth();
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  // Estados do quiz
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showConfidenceAssessment, setShowConfidenceAssessment] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Estados do jogo
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [pointResults, setPointResults] = useState<PointAttempt[]>([]);
  const [confidenceAssessments, setConfidenceAssessments] = useState<ConfidenceAssessment[]>([]);
  const [feedbackPoint, setFeedbackPoint] = useState<FeedbackPoint | null>(null);
  
  // Estados de pontuação e tempo
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  
  // Constantes
  const MODULE_ID = 'module-3';
  const TOTAL_POINTS = 50;
  const currentPoint = anatomicalPoints[pointsOrder[currentPointIndex]];

  // Timer
  useEffect(() => {
    if (!hasStarted || isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTime?.getTime() || 0)) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, isComplete, startTime]);

  // Inicialização
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleStart = () => {
    if (showConfidenceAssessment) {
      setShowConfidenceAssessment(false);
    } else {
      setHasStarted(true);
      setStartTime(new Date());
    }
  };

  const handleConfidenceChange = (pointId: string, value: number[]) => {
    setConfidenceAssessments(prev => {
      const existing = prev.find(ca => ca.pointId === pointId);
      if (existing) {
        return prev.map(ca => ca.pointId === pointId ? { ...ca, confidence: value[0] } : ca);
      }
      return [...prev, { pointId, confidence: value[0] }];
    });
  };

  const handlePointClick = (x: number, y: number) => {
    if (!currentPoint || isComplete) return;

    const svgElement = svgContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const svgWidth = rect.width;
    const svgHeight = rect.height;

    // Atualizar tentativas
    const currentAttempts = (attempts[currentPoint.id] || 0) + 1;
    setAttempts(prev => ({ ...prev, [currentPoint.id]: currentAttempts }));

    // Verificar se acertou
    const isCorrect = isClickWithinTolerance(
      x, 
      y, 
      currentPoint, 
      svgWidth, 
      svgHeight
    );

    // Mostrar feedback visual
    setFeedbackPoint({ x, y, correct: isCorrect });
    setTimeout(() => setFeedbackPoint(null), 500);

    // Processar resultado
    if (isCorrect || currentAttempts >= module3Config.maxAttempts) {
      processPointResult(currentPoint, currentAttempts, isCorrect);
    }
  };

  const handleDragComplete = (pointId: string, targetZone: string) => {
    if (!currentPoint || isComplete) return;
    
    // Verificar se o ponto arrastado corresponde ao ponto atual do quiz
    if (pointId !== currentPoint.id) return;

    // Atualizar tentativas
    const currentAttempts = (attempts[currentPoint.id] || 0) + 1;
    setAttempts(prev => ({ ...prev, [currentPoint.id]: currentAttempts }));

    // Verificar se acertou (se o ponto foi arrastado para a zona correta)
    const isCorrect = pointId === targetZone;

    // Para drag-and-drop, mostrar feedback visual na zona de destino
    const zones = {
      waist: { x: 200, y: 340 },
      hip: { x: 200, y: 440 },
      arm: { x: 135, y: 280 },
      calf: { x: 180, y: 650 },
      shoulder: { x: 200, y: 175 },
      wrist: { x: 88, y: 420 }
    };
    
    const zone = zones[targetZone as keyof typeof zones];
    if (zone) {
      setFeedbackPoint({ x: zone.x, y: zone.y, correct: isCorrect });
      setTimeout(() => setFeedbackPoint(null), 500);
    }

    // Processar resultado
    if (isCorrect || currentAttempts >= module3Config.maxAttempts) {
      processPointResult(currentPoint, currentAttempts, isCorrect);
    }
  };

  const processPointResult = (point: AnatomicalPoint, attemptCount: number, correct: boolean) => {
    // Calcular pontuação
    let pointScore = 0;
    if (correct) {
      if (attemptCount === 1) {
        pointScore = module3Config.pointsPerCorrectAnswer.firstAttempt;
      } else if (attemptCount === 2) {
        pointScore = module3Config.pointsPerCorrectAnswer.secondAttempt;
      } else {
        pointScore = module3Config.pointsPerCorrectAnswer.thirdAttempt;
      }
    }

    // Salvar resultado
    const result: PointAttempt = {
      pointId: point.id,
      attempts: attemptCount,
      correct,
      score: pointScore
    };

    setPointResults(prev => [...prev, result]);
    setScore(prev => prev + pointScore);

    // Próximo ponto ou finalizar
    if (currentPointIndex < pointsOrder.length - 1) {
      setTimeout(() => {
        setCurrentPointIndex(prev => prev + 1);
      }, 1000);
    } else {
      // Todos os pontos foram testados
      setIsComplete(true);
      setShowResults(true);
      saveQuizAttempt();
    }
  };

  const saveQuizAttempt = async () => {
    const totalPossible = anatomicalPoints.length * module3Config.pointsPerCorrectAnswer.firstAttempt;
    const percentage = Math.round((score / totalPossible) * 100);
    const adjustedScore = Math.round((score / totalPossible) * TOTAL_POINTS);

    try {
      const attemptData = {
        studentId: user?.uid,
        studentName: user?.displayName || 'Estudante',
        moduleId: MODULE_ID,
        score: adjustedScore,
        percentage,
        passed: true, // Módulo sempre é considerado completo
        startedAt: startTime,
        completedAt: serverTimestamp(),
        timeSpent: timeElapsed,
        pointsAttempted: pointResults.length,
        correctPoints: pointResults.filter(r => r.correct).length,
        moduleTitle: 'Medidas Antropométricas',
        confidenceData: confidenceAssessments,
        detailedResults: pointResults
      };

      await addDoc(collection(db, 'quiz_attempts'), attemptData);
      
      // Atualizar pontuação unificada
      if (user?.uid) {
        await unifiedScoringService.updateStudentScore(
          user.uid,
          MODULE_ID,
          percentage,
          'anatomical-points'
        );
      }
    } catch (error) {
      console.error('Erro ao salvar tentativa:', error);
    }
  };

  const resetQuiz = () => {
    setHasStarted(false);
    setShowConfidenceAssessment(true);
    setIsComplete(false);
    setShowResults(false);
    setCurrentPointIndex(0);
    setAttempts({});
    setPointResults([]);
    setConfidenceAssessments([]);
    setScore(0);
    setTimeElapsed(0);
    setStartTime(null);
    setFeedbackPoint(null);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando módulo...</p>
        </div>
      </div>
    );
  }

  return (
    <ModuleAccessGuard moduleId="module-3">
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
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
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700">3</span>
                  </div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Medidas Antropométricas
                  </h1>
                </div>
              </div>

              {hasStarted && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
                  </div>
                  
                  <Badge className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{currentPointIndex + 1}/{anatomicalPoints.length}</span>
                  </Badge>
                  
                  {isComplete && (
                    <Badge 
                      variant="success"
                      className="flex items-center space-x-1"
                    >
                      <Trophy className="w-3 h-3" />
                      <span>{score} pts</span>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!hasStarted && showConfidenceAssessment ? (
            // Tela de autoavaliação de confiança
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Autoavaliação de Confiança
                    </h2>
                    <p className="text-gray-600">
                      Antes de começar, avalie sua confiança em identificar cada ponto anatômico
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {pointsOrder.map(pointId => {
                      const point = anatomicalPoints.find(p => p.id === pointId);
                      if (!point) return null;
                      
                      const confidence = confidenceAssessments.find(ca => ca.pointId === pointId)?.confidence || 50;
                      
                      return (
                        <div key={pointId} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="font-medium text-gray-700">
                              {point.name}
                            </label>
                            <span className="text-sm text-gray-500">{confidence}%</span>
                          </div>
                          <Slider
                            value={[confidence]}
                            onValueChange={(value) => handleConfidenceChange(pointId, value)}
                            max={100}
                            step={10}
                            className="w-full"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center pt-4">
                    <Button
                      size="lg"
                      onClick={handleStart}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Continuar para o Teste
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : !hasStarted ? (
            // Tela inicial
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Identificação de Pontos Anatômicos
                    </h2>
                    <p className="text-gray-600">
                      Teste seus conhecimentos identificando os pontos corretos para medição de circunferências
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
                          <li>• Clique no ponto anatômico solicitado</li>
                          <li>• Você tem até 3 tentativas por ponto</li>
                          <li>• Pontuação: 1ª tentativa (10 pts), 2ª (5 pts), 3ª (0 pts)</li>
                          <li>• Total de 6 pontos para identificar</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      size="lg"
                      onClick={handleStart}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MousePointer className="w-5 h-5 mr-2" />
                      Iniciar Teste
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
              className="max-w-4xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Teste Concluído!
                    </h2>
                    <p className="text-gray-600">
                      Veja seu desempenho e compare com sua autoavaliação inicial
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {score}/{anatomicalPoints.length * 10}
                        </div>
                        <div className="text-sm text-gray-600">Pontuação Total</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {pointResults.filter(r => r.correct).length}/{anatomicalPoints.length}
                        </div>
                        <div className="text-sm text-gray-600">Pontos Corretos</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tempo gasto:</span>
                        <span className="font-medium">{formatTime(timeElapsed)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparação Confiança vs Desempenho */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Confiança vs Desempenho</h3>
                    
                    <div className="space-y-3">
                      {pointResults.map(result => {
                        const point = anatomicalPoints.find(p => p.id === result.pointId);
                        const confidence = confidenceAssessments.find(ca => ca.pointId === result.pointId)?.confidence || 0;
                        const feedback = generateEducationalFeedback(point!, result.attempts, result.correct);
                        
                        return (
                          <div key={result.pointId} className="border rounded-lg p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{point?.name}</h4>
                                <div className="flex items-center space-x-4 mt-1 text-sm">
                                  <span className="text-gray-600">
                                    Confiança: <span className="font-medium">{confidence}%</span>
                                  </span>
                                  <span className="text-gray-600">
                                    Tentativas: <span className="font-medium">{result.attempts}</span>
                                  </span>
                                  <span className="text-gray-600">
                                    Pontos: <span className="font-medium">{result.score}</span>
                                  </span>
                                </div>
                              </div>
                              <div>
                                {result.correct ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            </div>
                            
                            {/* Feedback educativo */}
                            <div className={`mt-2 p-3 rounded ${
                              result.correct ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                              <p className="text-sm font-medium mb-1">{feedback.feedback.title}</p>
                              <p className="text-sm text-gray-700">{feedback.feedback.message}</p>
                              {feedback.feedback.tip && (
                                <p className="text-sm text-gray-600 mt-1 italic">{feedback.feedback.tip}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                    
                    <Button
                      onClick={resetQuiz}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Área do jogo
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Marque: {currentPoint?.name}
                    </h2>
                    <p className="text-gray-600">
                      Clique no ponto correto para medição da {currentPoint?.name.toLowerCase()}
                    </p>
                    <div className="mt-2">
                      <Badge variant="secondary">
                        Tentativa {attempts[currentPoint?.id || ''] || 0} de {module3Config.maxAttempts}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div ref={svgContainerRef} className="w-full">
                    <HybridHumanBodyInteraction
                      onPointClick={handlePointClick}
                      onDragComplete={handleDragComplete}
                      currentTargetPoint={currentPoint}
                      feedbackPoint={feedbackPoint || undefined}
                      showHints={false}
                      availablePoints={[currentPoint]}
                      completedPoints={pointResults.map(result => result.pointId)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ModuleAccessGuard>
  );
}