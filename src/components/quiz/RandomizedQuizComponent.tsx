'use client';

// Componente principal do quiz aleatório estilo Khan Academy
// Interface intuitiva com feedback detalhado e experiência gamificada

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  Trophy,
  Target,
  BookOpen,
  AlertCircle,
  Lightbulb,
  Home,
  LogOut
} from 'lucide-react';
import { RandomizedQuiz, QuizAttempt, ProgressReport } from '@/types/randomizedQuiz';
import { RandomizedQuizService } from '@/services/randomizedQuizService';
import { QuizScoringService } from '@/services/quizScoringService';
import { useAuth } from '@/contexts/AuthContext';

// Componente Progress inline para evitar problemas de import
const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <div 
      className="bg-blue-600 h-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }}
    />
  </div>
);

interface RandomizedQuizComponentProps {
  moduleId: string;
  onComplete?: (attempt: QuizAttempt) => void;
}

export const RandomizedQuizComponent: React.FC<RandomizedQuizComponentProps> = ({ 
  moduleId, 
  onComplete 
}) => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Estado do quiz
  const [quiz, setQuiz] = useState<RandomizedQuiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  // Estado da submissão
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState<QuizAttempt | null>(null);
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null);
  
  // Estado da UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState<QuizAttempt | null>(null);
  const [bestAttempt, setBestAttempt] = useState<QuizAttempt | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer para contabilizar tempo
  useEffect(() => {
    if (!startTime || isSubmitted) return;

    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isSubmitted]);

  // Carregar quiz ao montar componente
  useEffect(() => {
    if (user?.uid) {
      loadQuizForStudent();
    }
  }, [moduleId, user]);

  /**
   * Carrega ou gera quiz para o estudante
   */
  const loadQuizForStudent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.uid) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se pode fazer tentativa
      const canAttempt = await RandomizedQuizService.canAttemptQuiz(user.uid, moduleId);
      
      if (!canAttempt.canAttempt) {
        throw new Error(canAttempt.reason || 'Não é possível fazer nova tentativa');
      }

      // Armazenar tentativa anterior e melhor tentativa se existirem
      if (canAttempt.lastAttempt) {
        setPreviousAttempt(canAttempt.lastAttempt);
      }
      if (canAttempt.bestAttempt) {
        setBestAttempt(canAttempt.bestAttempt);
      }

      // Gerar novo quiz
      const newQuiz = await RandomizedQuizService.generateQuizForStudent(user.uid, moduleId);
      setQuiz(newQuiz);
      setStartTime(new Date());

    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleciona resposta para questão atual
   */
  const handleAnswerSelect = useCallback((answer: string) => {
    if (!quiz || isSubmitted) return;
    
    const questionId = quiz.selectedQuestions[currentQuestion].originalId;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, [quiz, currentQuestion, isSubmitted]);

  /**
   * Navega para questão anterior
   */
  const handlePreviousQuestion = useCallback(() => {
    setCurrentQuestion(prev => Math.max(0, prev - 1));
  }, []);

  /**
   * Navega para próxima questão
   */
  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    setCurrentQuestion(prev => Math.min(quiz.selectedQuestions.length - 1, prev + 1));
  }, [quiz]);

  /**
   * Submete quiz completo
   */
  const handleSubmitQuiz = async () => {
    if (!quiz || !user?.uid) return;

    try {
      setSubmitting(true);

      // Verificar se todas as questões foram respondidas
      const totalQuestions = quiz.selectedQuestions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      if (answeredQuestions < totalQuestions) {
        const confirmSubmit = window.confirm(
          `Você respondeu ${answeredQuestions} de ${totalQuestions} questões. Deseja submeter mesmo assim?`
        );
        if (!confirmSubmit) {
          setSubmitting(false);
          return;
        }
      }

      // Submeter tentativa
      const attempt = await RandomizedQuizService.submitQuizAttempt(
        quiz.id,
        user.uid,
        answers,
        timeSpent
      );

      // Gerar relatório de progresso
      const report = QuizScoringService.generateProgressReport(attempt);

      setResults(attempt);
      setProgressReport(report);
      setIsSubmitted(true);

      // Callback para componente pai
      onComplete?.(attempt);

    } catch (error) {
      console.error('Erro ao submeter quiz:', error);
      setError(error instanceof Error ? error.message : 'Erro ao submeter quiz');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Inicia nova tentativa
   */
  const handleRetryQuiz = () => {
    // Resetar estado
    setQuiz(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeSpent(0);
    setStartTime(null);
    setIsSubmitted(false);
    setResults(null);
    setProgressReport(null);
    setShowExplanations(false);
    
    // Carregar novo quiz
    loadQuizForStudent();
  };

  /**
   * Sair do quiz e voltar para página de jogos
   */
  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  /**
   * Confirmar saída do quiz
   */
  const confirmExitQuiz = () => {
    setShowExitConfirm(false);
    router.push('/jogos');
  };

  /**
   * Cancelar saída do quiz
   */
  const cancelExitQuiz = () => {
    setShowExitConfirm(false);
  };

  /**
   * Formata tempo em MM:SS
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  /**
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando seu quiz personalizado...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de erro
   */
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao Carregar Quiz</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={loadQuizForStudent}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => router.push('/jogos')}>
              Voltar aos Jogos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /**
   * Renderiza resultados do quiz
   */
  if (isSubmitted && results && progressReport) {
    // 🚀 CORREÇÃO: Disparar evento para atualizar ranking automaticamente
    useEffect(() => {
      if (results && user?.uid) {
        console.log('📊 Disparando evento moduleCompleted para atualizar ranking');
        const event = new CustomEvent('moduleCompleted', {
          detail: {
            userId: user.uid,
            moduleId,
            score: results.score,
            percentage: results.percentage,
            passed: results.passed
          }
        });
        window.dispatchEvent(event);
      }
    }, [results, user?.uid, moduleId]);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header dos Resultados */}
        <Card>
          <CardContent className="p-8 text-center">
            <div className={`text-6xl mb-4 ${results.passed ? 'text-green-500' : 'text-orange-500'}`}>
              {results.passed ? '🎉' : '📚'}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {results.passed ? 'Parabéns!' : 'Continue tentando!'}
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Você acertou {progressReport.summary.correct} de {progressReport.summary.total} questões
            </p>
            
            {/* Métricas principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.percentage}%</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{results.score}</div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-gray-600">Tempo</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">#{progressReport.summary.attemptNumber}</div>
                <div className="text-sm text-gray-600">Tentativa</div>
              </div>
            </div>

            {/* Badge de aprovação */}
            <Badge 
              variant={results.passed ? "default" : "secondary"}
              className={`text-lg px-4 py-2 ${
                results.passed ? 'bg-green-500' : 'bg-orange-500'
              }`}
            >
              {results.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  🎉 Parabéns! Módulo Concluído
                </>
              ) : (
                <>
                  <Target className="h-5 w-5 mr-2" />
                  Continue Tentando! (necessário ≥70%)
                </>
              )}
            </Badge>
          </CardContent>
        </Card>

        {/* Recomendações */}
        {progressReport.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {progressReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Análise por Categoria */}
        {progressReport.categoryAnalysis.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-500" />
                Análise por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressReport.categoryAnalysis.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">
                          {category.category.replace(/-/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {category.correct}/{category.total}
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                    <Badge 
                      variant={category.percentage >= 70 ? "default" : "secondary"}
                      className="ml-3"
                    >
                      {category.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revisão das Questões */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                Revisão das Questões
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExplanations(!showExplanations)}
              >
                {showExplanations ? 'Ocultar' : 'Mostrar'} Explicações
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.feedback && results.feedback.length > 0 ? results.feedback.map((feedback, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    feedback.isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {feedback.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className="font-medium">Questão {index + 1}</span>
                      {feedback.category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {feedback.category.replace(/-/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {!feedback.isCorrect && (
                    <div className="text-sm space-y-1">
                      <p><strong>Sua resposta:</strong> {feedback.studentAnswer}</p>
                      <p><strong>Resposta correta:</strong> {feedback.correctAnswer}</p>
                    </div>
                  )}
                  
                  {showExplanations && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Explicação:</strong> {feedback.explanation}
                      </p>
                      {feedback.customFeedback && (
                        <p className="text-sm text-gray-600">
                          {feedback.customFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum feedback disponível</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-center space-x-4">
          {!results.passed && (
            <Button onClick={handleRetryQuiz} className="px-8">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => router.push('/jogos')}
            className="px-8"
          >
            Voltar aos Jogos
          </Button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza interface principal do quiz
   */
  if (!quiz) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Quiz não disponível</p>
      </div>
    );
  }

  const currentQuestionData = quiz.selectedQuestions[currentQuestion];
  const selectedAnswer = answers[currentQuestionData.originalId];
  const totalQuestions = quiz.selectedQuestions.length;
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Modal de Confirmação de Saída */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sair do Quiz
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tem certeza que deseja sair?
                </p>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-6">
              <p className="text-sm text-orange-800">
                ⚠️ Seu progresso atual será perdido, mas você pode retomar o quiz a qualquer momento.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelExitQuiz}
                className="px-4 py-2"
              >
                Continuar Quiz
              </Button>
              <Button
                onClick={confirmExitQuiz}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair Mesmo Assim
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Progresso Anterior */}
      {(bestAttempt || previousAttempt) && (
        <Card className={`border-l-4 ${(bestAttempt?.passed || previousAttempt?.passed) ? 'border-l-green-500 bg-green-50' : 'border-l-orange-500 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {(bestAttempt?.passed || previousAttempt?.passed) ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <Target className="h-6 w-6 text-orange-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {(bestAttempt?.passed || previousAttempt?.passed) ? '🎉 Parabéns! Módulo Concluído' : 'Tentativa Anterior'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(bestAttempt?.passed || previousAttempt?.passed)
                      ? `Excelente trabalho! Você dominou este módulo. Que tal tentar superar sua pontuação atual?`
                      : previousAttempt 
                        ? `Última tentativa: ${previousAttempt.percentage}% - Continue tentando!`
                        : 'Continue tentando!'
                    }
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {bestAttempt ? bestAttempt.percentage : (previousAttempt?.percentage || 0)}%
                </div>
                <div className="text-sm text-gray-600">Melhor nota</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header do Quiz */}
      <Card>
        <CardHeader className="relative">
          {/* Botão Sair - Posição Superior Direita */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitQuiz}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sair do quiz"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Conteúdo Principal do Header */}
          <div className="pr-12">
            <CardTitle className="text-2xl mb-2">
              Quiz: Introdução à Avaliação Nutricional
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Responda 7 questões sorteadas aleatoriamente. Você precisa de 70% de acertos para concluir o módulo.
            </p>

            {/* Métricas do Quiz */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="font-mono text-lg font-semibold">{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Target className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    <span className="font-semibold">{answeredQuestions}</span>/{totalQuestions} respondidas
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Questão {currentQuestion + 1} de {totalQuestions}</span>
                <span className="font-medium">{Math.round(progressPercentage)}% concluído</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questão Atual */}
      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 leading-relaxed">
              {currentQuestionData.text}
            </h3>
            
            {/* Badge de dificuldade e categoria */}
            <div className="flex space-x-2 mb-6">
              <Badge 
                variant="outline"
                className={
                  currentQuestionData.difficulty === 'easy' ? 'border-green-500 text-green-700' :
                  currentQuestionData.difficulty === 'medium' ? 'border-yellow-500 text-yellow-700' :
                  'border-red-500 text-red-700'
                }
              >
                {currentQuestionData.difficulty === 'easy' ? 'Fácil' :
                 currentQuestionData.difficulty === 'medium' ? 'Médio' : 'Difícil'}
              </Badge>
              {currentQuestionData.category && (
                <Badge variant="outline">
                  {currentQuestionData.category.replace(/-/g, ' ')}
                </Badge>
              )}
            </div>
          </div>

          {/* Opções de Resposta */}
          <div className="space-y-3 mb-8">
            {currentQuestionData.shuffledOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-medium mr-4 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Controles de Navegação */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex space-x-2">
              {/* Indicadores de questão */}
              {quiz.selectedQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[quiz.selectedQuestions[index].originalId]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === totalQuestions - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Trophy className="h-4 w-4 mr-2" />
                    Finalizar Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Próxima
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Respostas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo das Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {quiz.selectedQuestions.map((question, index) => {
              const isAnswered = answers[question.originalId];
              return (
                <div
                  key={index}
                  className={`p-2 rounded text-center text-sm font-medium ${
                    isAnswered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Q{index + 1}
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {answeredQuestions} de {totalQuestions} questões respondidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};