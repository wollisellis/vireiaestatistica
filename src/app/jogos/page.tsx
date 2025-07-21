'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modules } from '@/data/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  Target, 
  Lock, 
  Home, 
  ChevronRight, 
  Scale, 
  BarChart3, 
  Activity, 
  Play,
  TrendingUp,
  Award,
  Lightbulb,
  Heart,
  User,
  GraduationCap,
  LogOut,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
  Star,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { StudentProgressProvider } from '@/contexts/StudentProgressContext';
import { PersonalLearningDashboard } from '@/components/dashboard/PersonalLearningDashboard';
import { Footer } from '@/components/layout';
import { useFlexibleAccess } from '@/hooks/useRoleRedirect';
import { StudentClassInfo } from '@/components/student/StudentClassInfo';
import { ClassRankingPanel } from '@/components/ranking/ClassRankingPanel';
import unifiedScoringService from '@/services/unifiedScoringService';

interface ModuleProgress {
  [moduleId: string]: {
    completedContent: string[];
    completedExercises: string[];
    totalScore: number;
    lastAccessed: Date;
  };
}

// Mapear dificuldades
const getDifficultyLevel = (estimatedTime: number) => {
  if (estimatedTime <= 90) return 'Muito Fácil';
  if (estimatedTime <= 120) return 'Médio';
  if (estimatedTime <= 150) return 'Difícil';
  return 'Muito Difícil';
};

// Sistema de classificação por estrelas - MELHORADO
const getPerformanceRating = (score: number) => {
  // Normalizar score para escala 0-100
  const normalizedScore = Math.round(score);
  
  if (normalizedScore >= 90) return { stars: 5, label: 'Excelente', color: 'text-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' };
  if (normalizedScore >= 80) return { stars: 4, label: 'Muito Bom', color: 'text-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' };
  if (normalizedScore >= 70) return { stars: 3, label: 'Bom', color: 'text-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
  if (normalizedScore >= 60) return { stars: 2, label: 'Regular', color: 'text-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' };
  if (normalizedScore >= 50) return { stars: 1, label: 'Fraco', color: 'text-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' };
  return { stars: 0, label: 'Não Avaliado', color: 'text-gray-400', bgColor: 'bg-gray-50', textColor: 'text-gray-600' };
};

// Função para calcular tempo decorrido - CORRIGIDA
const getTimeAgo = (lastActivity: Date | undefined) => {
  if (!lastActivity) return 'Nunca tentado';
  
  // Se lastActivity é uma string, converter para Date
  const activityDate = typeof lastActivity === 'string' ? new Date(lastActivity) : lastActivity;
  
  // Verificar se a data é válida
  if (isNaN(activityDate.getTime())) return 'Nunca tentado';
  
  const now = new Date();
  const diff = now.getTime() - activityDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (days > 0) return `Há ${days} dia${days === 1 ? '' : 's'}`;
  if (hours > 0) return `Há ${hours} hora${hours === 1 ? '' : 's'}`;
  if (minutes > 0) return `Há ${minutes} minuto${minutes === 1 ? '' : 's'}`;
  return 'Agora há pouco';
};

// Componente de estrelas - MELHORADO
const StarRating = ({ rating, score }: { rating: { stars: number, label: string, color: string, bgColor: string, textColor: string }, score?: number }) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 transition-all duration-300 ${
              star <= rating.stars 
                ? `${rating.color} fill-current drop-shadow-sm` 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <div className="text-right">
        <div className={`text-sm font-semibold ${rating.textColor}`}>
          {rating.label}
        </div>
        {score !== undefined && (
          <div className="text-xs text-gray-500">
            {Math.round(score)}%
          </div>
        )}
      </div>
    </div>
  );
};

// Mapear cores baseadas no order
const getColorByOrder = (order: number) => {
  const colors = [
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-indigo-500'
  ];
  return colors[order - 1] || 'bg-gray-500';
};

// Converter módulos para formato de jogos
const convertModulesToGames = (modules: any[]) => {
  return modules.map(module => {
    // Dados específicos melhorados para Módulo 1
    if (module.id === 'module-1') {
      return {
        id: module.id,
        title: 'Introdução à Avaliação Nutricional',
        description: 'Fundamentos da avaliação nutricional antropométrica com dados reais brasileiros e metodologia ultra-iniciante.',
        difficulty: 'Iniciante',
        estimatedTime: '10-20 min',
        learningObjectives: [
          'Compreender os fundamentos da avaliação nutricional',
          'Diferenciar avaliação individual vs populacional',
          'Aplicar indicadores antropométricos básicos',
          'Interpretar dados da população brasileira'
        ],
        icon: <Scale className="w-6 h-6" />,
        color: 'bg-emerald-500',
        topics: [
          'Conceitos Fundamentais',
          'Indicadores Antropométricos',
          'Dados Populacionais Brasileiros',
          'Casos Clínicos Práticos',
          'Metodologia de Avaliação'
        ],
        features: [
          '7 questões aleatórias de um banco de 14',
          'Alternativas embaralhadas individualmente', 
          'Feedback detalhado com explicações',
          'Múltiplas tentativas permitidas'
        ],
        difficulty_details: {
          level: 'Iniciante',
          description: 'Abordagem zero-conhecimento com analogias do cotidiano',
          prerequisites: 'Nenhum conhecimento prévio necessário'
        }
      };
    }
    
    // Fallback para outros módulos
    return {
      id: module.id,
      title: module.title,
      description: module.description,
      difficulty: getDifficultyLevel(module.estimatedTime),
      estimatedTime: `${module.estimatedTime} min`,
      learningObjectives: module.content.slice(0, 4).map((content: any) => content.title),
      icon: module.icon === '📊' ? <BarChart3 className="w-6 h-6" /> :
            module.icon === '🔬' ? <Activity className="w-6 h-6" /> :
            module.icon === '📏' ? <Scale className="w-6 h-6" /> :
            module.icon === '🎯' ? <Target className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />,
      color: getColorByOrder(module.order),
      topics: module.exercises.slice(0, 4).map((exercise: any) => exercise.title)
    };
  });
};

export default function JogosPage() {
  // Use flexible access - allows both students and professors to access
  const { user, loading, hasAccess } = useFlexibleAccess();
  
  // Firebase auth for logout functionality
  const { user: firebaseUser, signOut } = useFirebaseAuth();
  
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1']);
  const [moduleLoading, setModuleLoading] = useState(true);
  const [rankingCollapsed, setRankingCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ranking-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // 🚀 CORREÇÃO: Estado para modal de confirmação de módulo já concluído
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const isProfessor = user?.role === 'professor';

  // Função para toggle do ranking com localStorage
  const toggleRanking = () => {
    const newState = !rankingCollapsed;
    setRankingCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ranking-collapsed', JSON.stringify(newState));
    }
  };

  // 🚀 CORREÇÃO: Estado para módulos concluídos usando sistema unificado
  const [completedModulesUnified, setCompletedModulesUnified] = useState<string[]>([]);

  // Buscar módulos concluídos do sistema unificado
  useEffect(() => {
    const fetchCompletedModules = async () => {
      if (user?.id && user.id !== 'guest-user' && user.id !== 'professor-guest-user') {
        try {
          const completed = await unifiedScoringService.getCompletedModules(user.id);
          if (Array.isArray(completed)) {
            setCompletedModulesUnified(completed);
            console.log('📊 Módulos concluídos (sistema unificado):', completed);
          } else {
            console.warn('⚠️ Módulos concluídos não é um array:', completed);
            setCompletedModulesUnified([]);
          }
        } catch (error) {
          console.error('Erro ao buscar módulos concluídos:', error);
          // Fallback para o sistema legacy com verificação de segurança
          if (Array.isArray(modules) && moduleProgress) {
            const legacyCompleted = modules.filter(module => {
              const progress = moduleProgress[module.id];
              if (!progress) return false;
              const score = progress.score || progress.totalScore || 0;
              return score >= 70;
            });
            setCompletedModulesUnified(legacyCompleted?.map(m => m.id) || []);
          } else {
            setCompletedModulesUnified([]);
          }
        }
      }
    };

    fetchCompletedModules();
  }, [user?.id, moduleProgress]);

  // Calcular módulos concluídos (LEGACY - mantido para compatibilidade)
  const getCompletedModules = () => {
    if (!Array.isArray(modules) || !Array.isArray(completedModulesUnified)) {
      return [];
    }
    return modules.filter(module => completedModulesUnified.includes(module.id));
  };

  const completedModules = getCompletedModules();

  // Function to handle logout and redirect to login page
  const handleLogout = async () => {
    try {
      // Clear all authentication state
      if (typeof window !== 'undefined') {
        // Clear cookies
        const cookiesToClear = [
          'guest-mode',
          'professor-guest-mode',
          'auth-token',
          'firebase-auth-token',
          'user-role',
          'user-session'
        ];

        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        });

        // Clear localStorage and sessionStorage
        const localStorageKeysToRemove = [
          'guest-mode',
          'professor-guest-mode',
          'firebase-auth-token',
          'user-data',
          'auth-state'
        ];

        localStorageKeysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        sessionStorage.clear();
      }

      // Sign out from Firebase if user is authenticated
      if (user && user.id !== 'guest-user' && user.id !== 'professor-guest-user') {
        await signOut();
      }

      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login page
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (!firebaseUser || !db) {
      setModuleLoading(false);
      return;
    }

    // Buscar progresso do usuário
    const fetchProgress = async () => {
      try {
        const progressDoc = await getDoc(doc(db!, 'userProgress', firebaseUser.uid));
        if (progressDoc.exists()) {
          setModuleProgress(progressDoc.data().modules || {});
        }
      } catch (error) {
        console.error('Erro ao buscar progresso:', error);
      }
    };

    // Buscar módulos desbloqueados
    const unsubscribe = onSnapshot(doc(db!, 'settings', 'modules'), (doc) => {
      if (doc.exists()) {
        setUnlockedModules(doc.data().unlocked || ['module-1']);
      }
      setModuleLoading(false);
    }, (error) => {
      console.error('Erro ao buscar módulos desbloqueados:', error);
      setModuleLoading(false);
    });

    fetchProgress();
    return () => unsubscribe();
  }, [firebaseUser]);

  const handleUnlockModule = async (moduleId: string) => {
    if (!isProfessor || !db) return;

    try {
      const newUnlocked = [...unlockedModules, moduleId];
      await setDoc(doc(db!, 'settings', 'modules'), {
        unlocked: newUnlocked,
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Erro ao desbloquear módulo:', error);
    }
  };

  const calculateOverallStats = () => {
    let totalScore = 0;
    let completedModules = 0;
    let totalExercises = 0;
    let completedExercises = 0;

    modules.forEach(module => {
      const progress = moduleProgress[module.id];
      if (progress) {
        totalScore += progress.totalScore;
        totalExercises += module.exercises?.length || 0;
        completedExercises += progress.completedExercises?.length || 0;
        
        const completedContentLength = progress.completedContent?.length || 0;
        const moduleContentLength = module.content?.length || 0;
        const completedExercisesLength = progress.completedExercises?.length || 0;
        const moduleExercisesLength = module.exercises?.length || 0;
        
        if (completedContentLength === moduleContentLength &&
            completedExercisesLength === moduleExercisesLength) {
          completedModules++;
        }
      } else {
        totalExercises += module.exercises?.length || 0;
      }
    });

    return {
      totalScore,
      completedModules,
      totalModules: modules.length,
      exerciseProgress: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
    };
  };

  // Converter módulos para jogos - APENAS MÓDULO 1 com verificação de segurança
  const baseNutritionalGames = convertModulesToGames(
    Array.isArray(modules) ? modules.filter(module => module.id === 'module-1') : []
  );

  // Combine base games with module settings and progress com verificação de segurança
  const nutritionalGames = (Array.isArray(baseNutritionalGames) ? baseNutritionalGames : []).map(game => {
    const moduleId = game.id;
    const locked = !unlockedModules.includes(moduleId) && !isProfessor;
    const progress = moduleProgress[moduleId];
    
    // Determinar o estado do módulo baseado no progresso
    let moduleStatus = 'never_attempted'; // nunca tentado
    let hasPassed = false;
    let hasAttempted = false;
    let bestScore = 0;
    
    if (progress) {
      hasAttempted = true;
      
      // 🚀 CORREÇÃO: Normalizar score para escala 0-100
      let rawScore = progress.score || progress.totalScore || 0;
      
      // Se o score for muito baixo (< 20), assumir que está em escala 0-10 e multiplicar por 10
      if (rawScore > 0 && rawScore <= 10) {
        bestScore = Math.round(rawScore * 10); // 8.75 * 10 = 87.5
      } else {
        bestScore = Math.round(rawScore); // Já está em escala 0-100
      }
      
      // 🚀 CORREÇÃO: Verificar aprovação apenas com base no score normalizado
      // progress.completed pode estar incorreto, então usar apenas o score
      hasPassed = bestScore >= 70;
      
      if (hasPassed) {
        moduleStatus = 'completed'; // concluído com sucesso
      } else if (bestScore > 0) {
        moduleStatus = 'attempted_failed'; // tentado mas não passou
      } else {
        moduleStatus = 'never_attempted'; // score 0 = nunca tentou de verdade
        hasAttempted = false;
      }
    }
    
    return {
      ...game,
      isLocked: locked,
      lockMessage: locked ? 'Aguardando liberação do docente' : undefined,
      progress: progress,
      isCompleted: hasPassed,
      bestScore: bestScore,
      moduleStatus: moduleStatus,
      hasAttempted: hasAttempted,
      hasPassed: hasPassed
    };
  });

  const stats = calculateOverallStats();

  // 🚀 CORREÇÃO: Função para lidar com o início do quiz com verificação de módulo concluído
  const handleStartQuiz = (game: any) => {
    if (game.moduleStatus === 'completed') {
      setSelectedGame(game);
      setShowCompletedModal(true);
    } else {
      // Redirecionar diretamente para o quiz
      window.location.href = `/jogos/modulo-1/quiz`;
    }
  };

  // 🚀 CORREÇÃO: Função para confirmar início do quiz mesmo com módulo concluído
  const confirmStartQuiz = () => {
    setShowCompletedModal(false);
    window.location.href = `/jogos/modulo-1/quiz`;
  };

  // Show loading state while checking authentication
  if (loading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando AvaliaNutri...</h2>
          <p className="text-gray-500 mt-2">Preparando seus jogos educacionais</p>
        </div>
      </div>
    );
  }

  // At this point, useFlexibleAccess has already handled authentication
  // Both students and professors can access this area

  return (
    <StudentProgressProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Main Content */}
        <div className="w-full">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Sair e voltar ao login"
                  >
                    <Home className="w-5 h-5" />
                    <span>Início</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">NT600 - Jogos Educacionais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/games">
                    <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      AvaliaNutri
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    title="Sair e voltar ao login"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-2 py-8">
            {/* Layout Principal */}
            <div className="relative">
              
              {/* Conteúdo Principal */}
              <div className="space-y-8">
            {/* User Welcome */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                  <p className="text-blue-800">
                    👋 Olá, <span className="font-semibold">{user.fullName}</span>!
                    {user.role === 'professor' && (
                      <span className="ml-2 text-blue-600 font-medium">(Professor)</span>
                    )}
                    {user.anonymousId && (
                      <span className="ml-2 text-blue-600">
                        (ID: {user.anonymousId})
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Student Class Information */}
            {user && user.role === 'student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-8"
              >
                <StudentClassInfo 
                  studentId={user.id} 
                />
              </motion.div>
            )}

            {/* Course Introduction */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AvaliaNutri
                  </h1>
                  <p className="text-xl text-emerald-600 mt-2 font-medium">Jogos Educacionais para Avaliação Nutricional</p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Uma abordagem revolucionária para o ensino de avaliação nutricional através de jogos educacionais
                  interativos, baseados em dados reais da população brasileira e metodologia ultra-iniciante.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Target className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Objetivo</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Capacitar estudantes para avaliar o estado nutricional populacional através de
                        indicadores antropométricos, clínicos, bioquímicos e socioeconômicos.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Lightbulb className="w-6 h-6 text-green-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Inovação</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Gamificação educacional com dados reais brasileiros, analogias do cotidiano
                        e abordagem zero-conhecimento para máxima acessibilidade.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Award className="w-6 h-6 text-purple-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Impacto</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Formação de profissionais mais preparados para enfrentar os desafios
                        nutricionais da população brasileira contemporânea.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>


            {/* Student Progress Dashboard - Temporariamente Removido */}
            {/* <PersonalLearningDashboard compact={true} /> */}

            {/* Games Section - HEADER MELHORADO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Módulo Educacional</h2>
                </div>
                <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  🎯 <strong>Fundamentos da Avaliação Nutricional</strong> - Base essencial com indicadores antropométricos, 
                  medidas corporais e dados reais da população brasileira para formação sólida na área.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="max-w-2xl w-full">
                {nutritionalGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group mb-6"
                  >
                    {/* Card Limpo e Focado - LAYOUT MELHORADO */}
                    <Card className={`transition-all duration-300 border-2 hover:shadow-xl hover:scale-[1.02] ${
                      game.isLocked
                        ? 'opacity-75 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : game.moduleStatus === 'completed'
                        ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                        : game.moduleStatus === 'attempted_failed'
                        ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50'
                        : 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50'
                    }`}>
                      <CardHeader className="pb-4">
                        {/* Header Principal - LAYOUT OTIMIZADO */}
                        <div className="space-y-4">
                          {/* Linha 1: Ícone e Informações Básicas */}
                          <div className="flex items-center space-x-4">
                            <div className={`p-4 rounded-xl ${game.isLocked ? 'bg-gray-400' : game.color} text-white shadow-lg`}>
                              {game.isLocked && <Lock className="w-7 h-7" />}
                              {!game.isLocked && <div className="scale-110">{game.icon}</div>}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">Módulo {game.id.split('-')[1]}</h3>
                                {game.moduleStatus === 'completed' && (
                                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-xs font-medium text-green-700">Concluído</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{game.estimatedTime}</span>
                                </div>
                                {!game.isLocked && (
                                  <div className="flex items-center space-x-1">
                                    <Target className="w-4 h-4" />
                                    <span>7 questões</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Linha 2: Status Final (apenas se realmente tentou e tem score > 0) */}
                          {!game.isLocked && game.hasAttempted && game.bestScore > 0 && (
                            <div className={`border border-gray-200 rounded-lg p-4 ${
                              game.bestScore >= 70 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                                : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className={`text-sm font-medium mb-1 ${
                                    game.bestScore >= 70 ? 'text-green-700' : 'text-orange-700'
                                  }`}>Status Final</div>
                                  <div className={`text-2xl font-bold ${
                                    game.bestScore >= 70 ? 'text-green-900' : 'text-orange-900'
                                  }`}>
                                    {game.bestScore}%
                                  </div>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                  <div>{getTimeAgo(game.progress?.lastAccessed)}</div>
                                  <div>~15 min gasto</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Título do Módulo */}
                          <h4 className="text-xl font-bold text-gray-900 leading-tight">{game.title}</h4>
                        </div>
                        
                        {/* Status e Avaliação por Estrelas - MELHORADO */}
                        {!game.isLocked && (
                          <div className="mb-6">
                            {game.moduleStatus === 'completed' && (
                              <div className="space-y-3">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-sm font-semibold text-green-800">Módulo Concluído</span>
                                    </div>
                                  </div>
                                  <StarRating 
                                    rating={getPerformanceRating(game.bestScore || 0)} 
                                    score={game.bestScore || 0}
                                  />
                                </div>
                              </div>
                            )}
                            {game.moduleStatus === 'attempted_failed' && (
                              <div className="space-y-3">
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-5 h-5 text-orange-600" />
                                      <span className="text-sm font-semibold text-orange-800">Em Progresso</span>
                                    </div>
                                  </div>
                                  <StarRating 
                                    rating={getPerformanceRating(game.bestScore || 0)}
                                    score={game.bestScore || 0}
                                  />
                                  <div className="text-xs text-orange-600 mt-2">
                                    Necessário ≥70% para aprovação
                                  </div>
                                </div>
                              </div>
                            )}
                            {game.moduleStatus === 'never_attempted' && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-center">
                                  <div className="flex items-center justify-center text-blue-700 text-sm mb-2">
                                    <Trophy className="w-5 h-5 mr-2" />
                                    <span className="font-medium">🏅 Conquista disponível: "Fundamentos Dominados"</span>
                                  </div>
                                  <div className="text-xs text-blue-600">
                                    Meta: ≥70% para aprovação • Até 5⭐ disponíveis
                                  </div>
                                  <div className="mt-2">
                                    <StarRating 
                                      rating={getPerformanceRating(0)}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Descrição - MELHORADA */}
                        <p className="text-base text-gray-700 leading-relaxed mb-6">
                          {game.description}
                        </p>

                        {/* Bloqueado */}
                        {game.isLocked && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                            <div className="flex items-center text-yellow-800 text-sm">
                              <Lock className="w-4 h-4 mr-2" />
                              {game.lockMessage}
                            </div>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Objetivos - LAYOUT APRIMORADO */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Target className="w-4 h-4 mr-2 text-blue-600" />
                            Objetivos de Aprendizado
                          </h4>
                          <div className="grid gap-2">
                            {game.learningObjectives.slice(0, 4).map((objective, idx) => (
                              <div key={idx} className="flex items-start space-x-3 p-2 bg-blue-50 rounded-md">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-sm text-gray-700 leading-relaxed">{objective}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tópicos - DESIGN MODERNO */}
                        <div className="mb-8">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                            Tópicos Abordados
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {game.topics.map((topic, idx) => (
                              <div key={idx} className="px-3 py-2 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg text-center font-medium">
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botão de Ação - DESIGN APRIMORADO */}
                        <div className="pt-2">
                          {game.isLocked ? (
                            <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-4 text-lg font-semibold rounded-xl">
                              <Lock className="w-5 h-5 mr-2" />
                              Módulo Bloqueado
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleStartQuiz(game)}
                              className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                                game.moduleStatus === 'completed'
                                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-200'
                                  : game.moduleStatus === 'attempted_failed'
                                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-orange-200'
                                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200'
                              } shadow-lg`}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                {game.moduleStatus === 'completed' ? (
                                  <>
                                    <Trophy className="w-5 h-5" />
                                    <span>Tentar Superar Desempenho</span>
                                  </>
                                ) : game.moduleStatus === 'attempted_failed' ? (
                                  <>
                                    <Target className="w-5 h-5" />
                                    <span>Continuar Tentativas</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-5 h-5" />
                                    <span>Começar Aventura</span>
                                  </>
                                )}
                              </div>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                </div>
              </div>
            </motion.div>

            {/* Learning Connection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 mb-12"
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-emerald-600 mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Como os Jogos Reforçam seu Aprendizado</h2>
                      <p className="text-gray-600">Conexão direta entre teoria e prática em avaliação nutricional</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <Scale className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Teoria → Prática</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Cada conceito teórico da disciplina é aplicado em <strong>casos reais brasileiros</strong>,
                        permitindo que você pratique imediatamente o que aprendeu em aula.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <BarChart3 className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Dados Autênticos</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Trabalhe com <strong>datasets reais</strong> do IBGE, Ministério da Saúde e pesquisas
                        peer-reviewed, preparando você para a realidade profissional.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Progresso Mensurável</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Acompanhe seu <strong>desenvolvimento</strong> através de pontuações e feedback
                        imediato, identificando áreas que precisam de mais estudo.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-100 p-5 rounded-lg border-l-4 border-emerald-500">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 text-emerald-700 mr-2" />
                      Metodologia Pedagógica Integrada
                    </h3>
                    <p className="text-emerald-800 leading-relaxed">
                      Os jogos não substituem as aulas teóricas - eles <strong>complementam e reforçam</strong>
                      o aprendizado. Cada exercício foi cuidadosamente alinhado com os objetivos da disciplina,
                      utilizando a <strong>abordagem ultra-iniciante</strong> que assume zero conhecimento prévio
                      e constrói o entendimento passo a passo com exemplos do cotidiano brasileiro.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Innovation Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Diferenciais da Proposta</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Uma abordagem pedagógica revolucionária que combina rigor acadêmico com inovação tecnológica
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Dados Reais</h3>
                      <p className="text-sm text-gray-600">
                        Baseado em pesquisas peer-reviewed de instituições brasileiras
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ultra-Iniciante</h3>
                      <p className="text-sm text-gray-600">
                        Assume zero conhecimento prévio com analogias do cotidiano
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contexto Brasileiro</h3>
                      <p className="text-sm text-gray-600">
                        Exemplos culturalmente relevantes da realidade nacional
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Progressivo</h3>
                      <p className="text-sm text-gray-600">
                        Dificuldade crescente com feedback imediato e explicações
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-16"
            >
            </motion.div>
            </div>
            
            {/* Ranking Fixo */}
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`fixed top-24 right-4 z-40 transition-all duration-300 ${
                  rankingCollapsed ? 'w-12' : 'w-80'
                }`}
                style={{ maxHeight: 'calc(100vh - 120px)' }}
              >
                {rankingCollapsed ? (
                  // Botão minimizado
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-lg shadow-lg border-2 border-blue-200 p-3 cursor-pointer hover:shadow-xl transition-all"
                    onClick={toggleRanking}
                    title="Expandir ranking da turma"
                  >
                    <div className="flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                  </motion.div>
                ) : (
                  // Painel expandido
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-lg shadow-lg border-2 border-blue-200 overflow-hidden"
                    style={{ maxHeight: 'calc(100vh - 120px)' }}
                  >
                    {/* Header do Ranking com controles */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900 text-sm">
                            Ranking da Turma
                          </h3>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={toggleRanking}
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Minimizar ranking"
                          >
                            <Minimize2 className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo do Ranking */}
                    <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <ClassRankingPanel 
                        className="border-0 shadow-none"
                        compact={true}
                        showStats={true}
                        moduleId="module-1"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>

        {/* 🚀 CORREÇÃO: Modal de confirmação para módulo já concluído */}
        <AnimatePresence>
          {showCompletedModal && selectedGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCompletedModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Módulo Já Concluído!
                  </h3>
                  <p className="text-gray-600">
                    Você já concluiu este módulo com nota <span className="font-semibold text-green-600">{selectedGame.bestScore}%</span>.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Target className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Você pode tentar novamente!</p>
                      <p>Sua maior nota será sempre mantida no sistema. Tente melhorar seu desempenho!</p>
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
                    onClick={confirmStartQuiz}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </StudentProgressProvider>
  );
}
