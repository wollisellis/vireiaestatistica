'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modules } from '@/data/modules';
import EnhancedModuleCard from '@/components/games/EnhancedModuleCard';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { collection, doc, onSnapshot, startTransition } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BookOpen, 
  Trophy, 
  Home, 
  ChevronRight, 
  TrendingUp,
  Award,
  User,
  GraduationCap,
  LogOut,
  ChevronUp,
  ChevronDown,
  X,
  Minimize2,
  Maximize2,
  Star
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
import { debounce, devLog } from '@/utils/debounce';

// 🎯 TIPOS FORTES
interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  isLocked?: boolean;
  lockMessage?: string;
}

// 🎯 CONFIGURAÇÃO DOS MÓDULOS DISPONÍVEIS
const ENABLED_MODULES = ['module-1'] as const;
type EnabledModuleId = typeof ENABLED_MODULES[number];

// 🎯 CONVERTER MÓDULOS PARA FORMATO LIMPO
const convertModulesToGames = (modules: any[]): ModuleData[] => {
  return modules.filter(module => ENABLED_MODULES.includes(module.id)).map(module => ({
    id: module.id,
    title: module.title || 'Módulo',
    description: module.description || 'Descrição do módulo',
    icon: '📊', // Default icon
    estimatedTime: module.estimatedTime || '10-20 min',
    isLocked: false,
    lockMessage: ''
  }));
};

// 🎯 MODAL DE CONCLUSÃO SIMPLES
const CompletedModuleModal = ({ 
  isOpen, 
  onClose, 
  onRetry,
  moduleTitle,
  score 
}: {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  moduleTitle: string;
  score: number;
}) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-xl font-bold text-gray-900">
            Módulo já concluído!
          </h3>
          <p className="text-gray-600">
            Você já completou <strong>{moduleTitle}</strong> com {score}%.
            Deseja tentar novamente para melhorar sua pontuação?
          </p>
          <div className="flex space-x-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onRetry}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// 🎯 COMPONENTE PRINCIPAL SIMPLIFICADO
export default function JogosPage() {
  // 🎯 ESTADOS MÍNIMOS NECESSÁRIOS
  const { user, loading, hasAccess, isProfessor } = useFlexibleAccess();
  const { signOut } = useFirebaseAuth();
  
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1']);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<{title: string, score: number} | null>(null);
  const [rankingCollapsed, setRankingCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ranking-collapsed');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });
  
  // 🎯 REFS PARA DEBOUNCE
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 🎯 DADOS DOS MÓDULOS
  const nutritionalGames = convertModulesToGames(modules);
  
  // 🎯 DEBOUNCED REFRESH FUNCTION
  const debouncedRefresh = useCallback(
    debounce(async () => {
      devLog('Refreshing rankings...');
      try {
        await unifiedScoringService.updateStudentRanking(user?.uid || '');
      } catch (error) {
        console.error('Error refreshing rankings:', error);
      }
    }, 800),
    [user?.uid]
  );
  
  // 🎯 UNIFIED SCORING UPDATE
  useEffect(() => {
    const updateScoring = async () => {
      if (!user?.uid) return;
      
      try {
        devLog('Updating unified scoring...');
        await unifiedScoringService.updateStudentRanking(user.uid);
      } catch (error) {
        console.error('Error updating scoring:', error);
      }
    };
    
    updateScoring();
  }, [user?.uid]);
  
  // 🎯 UNLOCKED MODULES LISTENER
  useEffect(() => {
    if (!user?.uid || !db) return;
    
    const unsubscribe = onSnapshot(
      doc(db, 'userAccess', user.uid),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const unlocked = data.unlockedModules || ['module-1'];
          startTransition(() => {
            setUnlockedModules(unlocked);
          });
          devLog('Unlocked modules updated:', unlocked);
        }
      },
      (error) => {
        console.error('Error listening to unlocked modules:', error);
      }
    );
    
    return unsubscribe;
  }, [user?.uid]);
  
  // 🎯 MODULE COMPLETED EVENT LISTENER
  useEffect(() => {
    const handleModuleCompleted = debounce((event: CustomEvent) => {
      devLog('Module completed event:', event.detail);
      debouncedRefresh();
    }, 1000);
    
    const handleVisibilityChange = debounce(() => {
      if (document.visibilityState === 'visible') {
        devLog('Page became visible, refreshing...');
        debouncedRefresh();
      }
    }, 500);
    
    window.addEventListener('moduleCompleted', handleModuleCompleted as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('moduleCompleted', handleModuleCompleted as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [debouncedRefresh]);
  
  // 🎯 HANDLERS OTIMIZADOS
  const handleModuleStart = useCallback(async (moduleId: string) => {
    try {
      // Navigate to module
      if (moduleId === 'module-1') {
        window.location.href = '/jogos/modulo-1/quiz';
      }
    } catch (error) {
      console.error('Error starting module:', error);
      // Navigate anyway
      if (moduleId === 'module-1') {
        window.location.href = '/jogos/modulo-1/quiz';
      }
    }
  }, []);
  
  const handleRetryModule = useCallback(() => {
    setShowCompletedModal(false);
    window.location.href = '/jogos/modulo-1/quiz';
  }, []);
  
  const handleLogout = useCallback(async () => {
    try {
      // Clear storage
      if (typeof window !== 'undefined') {
        const cookiesToClear = [
          'guest-mode', 'professor-guest-mode', 'auth-token',
          'firebase-auth-token', 'user-role', 'user-session'
        ];
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
        
        ['guest-mode', 'professor-guest-mode', 'firebase-auth-token', 'user-data', 'auth-state']
          .forEach(key => localStorage.removeItem(key));
        
        sessionStorage.clear();
      }
      
      if (user && !user.id.includes('guest')) {
        await signOut();
      }
      
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  }, [user, signOut]);
  
  const toggleRanking = useCallback(() => {
    const newState = !rankingCollapsed;
    startTransition(() => {
      setRankingCollapsed(newState);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('ranking-collapsed', JSON.stringify(newState));
    }
  }, [rankingCollapsed]);
  
  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando AvaliaNutri...</h2>
          <p className="text-gray-500 mt-2">Preparando seus módulos...</p>
        </div>
      </div>
    );
  }
  
  // 🎯 ACCESS CHECK
  if (!hasAccess && user?.id !== 'guest-user' && user?.id !== 'professor-guest-user') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
            Fazer Login Novamente
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <StudentProgressProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* 🎯 HEADER SIMPLIFICADO */}
        <div className="bg-white border-b border-emerald-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-gray-900">Módulos Educacionais</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    {user?.displayName || user?.name || (user?.id?.includes('guest') ? 'Visitante' : 'Usuário')}
                  </span>
                  {isProfessor && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Professor
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* 🎯 MÓDULOS - COL PRINCIPAL */}
            <div className="xl:col-span-3 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Módulos de Avaliação Nutricional</h1>
                    <p className="text-gray-600 mt-1">Aprenda os fundamentos da avaliação nutricional com dados brasileiros</p>
                  </div>
                </div>

                {/* 🎯 GRID DE MÓDULOS SIMPLIFICADO */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <AnimatePresence>
                    {nutritionalGames.map((module) => (
                      <EnhancedModuleCard
                        key={module.id}
                        module={{
                          ...module,
                          isLocked: !unlockedModules.includes(module.id) && !isProfessor
                        }}
                        userId={user?.uid || null}
                        onStart={handleModuleStart}
                        onRetry={handleModuleStart}
                        showDebugInfo={process.env.NODE_ENV === 'development'}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* 🎯 DASHBOARD PESSOAL */}
              <div className="mt-12">
                <PersonalLearningDashboard />
              </div>
            </div>

            {/* 🎯 SIDEBAR DIREITO */}
            <div className="xl:col-span-1 space-y-6">
              {/* 🎯 INFORMAÇÕES DA TURMA */}
              <StudentClassInfo />
              
              {/* 🎯 RANKING COLAPSÍVEL */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-semibold text-gray-900">Ranking da Turma</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleRanking}
                      className="p-1 h-auto"
                    >
                      {rankingCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {!rankingCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <ClassRankingPanel />
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </div>

        {/* 🎯 MODAL DE CONCLUSÃO */}
        <AnimatePresence>
          {showCompletedModal && selectedModuleForModal && (
            <CompletedModuleModal
              isOpen={showCompletedModal}
              onClose={() => setShowCompletedModal(false)}
              onRetry={handleRetryModule}
              moduleTitle={selectedModuleForModal.title}
              score={selectedModuleForModal.score}
            />
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </StudentProgressProvider>
  );
}