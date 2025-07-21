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
  Maximize2
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
      bestScore = progress.score || progress.totalScore || 0;
      
      // Verificar se passou (considerando diferentes formatos de score)
      // Assumindo que >70% = passou
      hasPassed = bestScore >= 70 || progress.completed || false;
      
      if (hasPassed) {
        moduleStatus = 'completed'; // concluído com sucesso
      } else {
        moduleStatus = 'attempted_failed'; // tentado mas não passou
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


            {/* Student Progress Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <PersonalLearningDashboard compact={true} />
            </motion.div>

            {/* Games Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Módulo Educacional Disponível</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Módulo fundamental focado nos indicadores antropométricos e medidas corporais,
                  base essencial para a avaliação nutricional.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="max-w-md w-full">
                {nutritionalGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group"
                  >
                    <Card className={`h-full transition-all duration-500 border-2 transform hover:scale-[1.02] ${
                      game.isLocked
                        ? 'opacity-75 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : game.moduleStatus === 'completed'
                        ? 'hover:shadow-2xl border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-green-100'
                        : game.moduleStatus === 'attempted_failed'
                        ? 'hover:shadow-2xl border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-orange-100'
                        : 'hover:shadow-2xl hover:border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-blue-100'
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg transition-all duration-300 ${
                            game.isLocked ? 'bg-gray-400' : game.color
                          } text-white relative group-hover:scale-110`}>
                            {game.isLocked && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1"
                              >
                                <Lock className="w-3 h-3 bg-gray-600 rounded-full p-0.5" />
                              </motion.div>
                            )}
                            {game.isCompleted && !game.isLocked && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="absolute -top-1 -right-1"
                              >
                                <CheckCircle className="w-4 h-4 bg-green-600 text-white rounded-full" />
                              </motion.div>
                            )}
                            {game.icon}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-500">Módulo {game.id.split('-')[1]}</span>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {game.estimatedTime}
                            </div>
                            {!game.isLocked && !game.isCompleted && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Award className="w-4 h-4 mr-1 text-yellow-500" />
                                <span className="font-medium">0-100 pts disponíveis</span>
                              </div>
                            )}
                            {game.isCompleted && (
                              <div className="flex items-center text-xs text-green-600 mt-1 font-medium">
                                <Trophy className="w-3 h-3 mr-1" />
                                {game.bestScore || 0} pts
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start justify-between mb-2">
                          <h3 className={`text-xl font-bold ${
                            game.isLocked ? 'text-gray-500' : 'text-gray-900'
                          }`}>{game.title}</h3>
                          
                          {/* Indicador de Status */}
                          {!game.isLocked && game.moduleStatus === 'completed' && (
                            <div className="flex items-center px-2 py-1 bg-green-100 border border-green-200 rounded-full">
                              <Trophy className="w-3 h-3 text-green-600 mr-1" />
                              <span className="text-xs text-green-700 font-medium">Concluído</span>
                            </div>
                          )}
                          {!game.isLocked && game.moduleStatus === 'attempted_failed' && (
                            <div className="flex items-center px-2 py-1 bg-orange-100 border border-orange-200 rounded-full">
                              <Target className="w-3 h-3 text-orange-600 mr-1" />
                              <span className="text-xs text-orange-700 font-medium">Em Progresso</span>
                            </div>
                          )}
                        </div>
                        
                        <p className={`text-sm leading-relaxed ${
                          game.isLocked ? 'text-gray-500' : 'text-gray-600'
                        }`}>{game.description}</p>

                        {game.isLocked && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center text-yellow-800 text-sm">
                              <Lock className="w-4 h-4 mr-2" />
                              {game.lockMessage}
                            </div>
                          </div>
                        )}

                        {/* Badge de Conquista Disponível */}
                        {!game.isLocked && !game.isCompleted && (
                          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                            <div className="flex items-center text-purple-800 text-sm">
                              <Trophy className="w-4 h-4 mr-2 text-purple-600" />
                              <span className="font-medium">🏅 Conquista disponível: "Fundamentos Dominados"</span>
                            </div>
                          </div>
                        )}

                        {/* Meta de Aprovação */}
                        {!game.isLocked && (
                          <div className="mt-3 p-2 bg-blue-50 rounded-md text-center">
                            <p className="text-xs text-blue-700 font-medium">
                              <Target className="w-3 h-3 inline mr-1" />
                              Meta: 70% para aprovação
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {game.difficulty}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Target className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>7 questões</span>
                          </div>
                        </div>

                        {/* Barra de Progresso Visual */}
                        {!game.isLocked && (
                          <motion.div 
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="mt-4"
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <span>Progresso</span>
                              <span>
                                {game.moduleStatus === 'completed' ? '100%' :
                                 game.moduleStatus === 'attempted_failed' ? '50%' : '0%'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: game.moduleStatus === 'completed' ? '100%' :
                                         game.moduleStatus === 'attempted_failed' ? '50%' : '0%'
                                }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                className={`h-2 rounded-full transition-colors duration-500 ${
                                  game.moduleStatus === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                  game.moduleStatus === 'attempted_failed' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                                  'bg-blue-500'
                                }`}
                              />
                            </div>
                          </motion.div>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-blue-500" />
                              Objetivos de Aprendizado
                            </h4>
                            <ul className="space-y-1">
                              {game.learningObjectives.slice(0, 4).map((objective, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {objective}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Tópicos Abordados</h4>
                            <div className="flex flex-wrap gap-2">
                              {game.topics.map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>


                          {game.isLocked ? (
                            <Button
                              disabled
                              className="w-full mt-4 bg-gray-300 text-gray-500 cursor-not-allowed transition-all duration-300"
                              size="lg"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Módulo Bloqueado
                            </Button>
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <Button
                                onClick={() => handleStartQuiz(game)}
                                className={`w-full mt-4 transition-all duration-300 transform ${
                                  game.moduleStatus === 'completed'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-200' 
                                    : game.moduleStatus === 'attempted_failed'
                                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-200'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200'
                                }`}
                                size="lg"
                              >
                                {game.moduleStatus === 'completed' ? (
                                  <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Responder Novamente
                                  </>
                                ) : game.moduleStatus === 'attempted_failed' ? (
                                  <>
                                    <Target className="w-4 h-4 mr-2" />
                                    Tentar Novamente
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Iniciar Quiz
                                  </>
                                )}
                              </Button>
                            </motion.div>
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
