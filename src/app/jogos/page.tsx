'use client';

// Force dynamic rendering to avoid stale cache issues
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modules } from '@/data/modules';
import EnhancedModuleCard from '@/components/games/EnhancedModuleCard';
import CompletedModuleModal from '@/components/games/CompletedModuleModal';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { doc, onSnapshot } from 'firebase/firestore';
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
import FirebaseConnectionTest from '@/components/debug/FirebaseConnectionTest';
import { JogosPageSkeleton, JogosPageMinimalSkeleton } from '@/components/ui/JogosPageSkeleton';

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

// 🎯 CONVERTER MÓDULOS PARA FORMATO LIMPO (COM SAFE GUARDS)
const convertModulesToGames = (modules: any[] | null | undefined): ModuleData[] => {
  // 🛡️ SAFE GUARD: Verificar se modules é válido
  if (!modules || !Array.isArray(modules)) {
    console.warn('convertModulesToGames: modules is null/undefined or not an array, returning empty array');
    return [];
  }
  
  return modules.filter(module => {
    // 🛡️ SAFE GUARD: Verificar se module é válido
    return module && module.id && ENABLED_MODULES.includes(module.id);
  }).map(module => ({
    id: module.id,
    title: module.title || 'Módulo',
    description: module.description || 'Descrição do módulo',
    icon: '📊', // Default icon
    estimatedTime: module.estimatedTime || '10-20 min',
    isLocked: false,
    lockMessage: ''
  }));
};

// Modal foi movido para componente separado em /components/games/CompletedModuleModal.tsx

// 🎯 COMPONENTE PRINCIPAL SIMPLIFICADO
export default function JogosPage() {
  // 🎯 ESTADOS MÍNIMOS NECESSÁRIOS
  const { user, loading, hasAccess, isProfessor } = useFlexibleAccess();
  const { signOut } = useFirebaseAuth();

  // 🎯 HELPER: Obter ID do usuário (compatível com RBACUser e FirebaseUser)
  const getUserId = () => {
    if (!user) return null;
    return (user as any).uid || (user as any).id || null;
  };
  
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1']);
  
  // 🎯 ESTADO UNIFICADO DE CARREGAMENTO
  const [dataLoadingState, setDataLoadingState] = useState({
    auth: false,        // Autenticação completa
    modules: false,     // Módulos carregados
    ranking: false,     // Ranking processado (sucesso ou erro handled)
    classInfo: false    // Informações da classe processadas (sucesso ou erro handled)
  });
  
  // 🎯 COMPUTED READY STATE
  const ready = dataLoadingState.auth && dataLoadingState.modules && 
                dataLoadingState.ranking && dataLoadingState.classInfo;
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedModuleForModal, setSelectedModuleForModal] = useState<{
    title: string;
    score: number;
    bestScore?: number;
    timeSpent?: string;
    attempts?: number;
    lastCompleted?: Date;
  } | null>(null);
  // 🎯 HYDRATION-SAFE RANKING COLLAPSED STATE
  const [rankingCollapsed, setRankingCollapsed] = useState(true); // Default fixo para evitar mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  
  // 🎯 REFS PARA DEBOUNCE
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  
  // 🎯 DADOS DOS MÓDULOS (COM VERIFICAÇÃO DE SEGURANÇA)
  const nutritionalGames = convertModulesToGames(modules || []);
  
  // 🎯 DEBOUNCED REFRESH FUNCTION
  const debouncedRefresh = useCallback(
    debounce(async () => {
      devLog('Refreshing rankings...');
      try {
        // 🛡️ SAFE GUARD: Verificar se o método existe antes de chamar
        if (unifiedScoringService && typeof unifiedScoringService.updateStudentRanking === 'function') {
          await unifiedScoringService.updateStudentRanking(getUserId() || '');
        } else {
          console.warn('updateStudentRanking method not available');
        }
      } catch (error) {
        console.error('Error refreshing rankings:', error);
        // Não resetar estado - preservar dados anteriores
      }
    }, 800),
    [getUserId()]
  );
  
  // 🎯 HYDRATION EFFECT - Carrega localStorage após hidratação
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('ranking-collapsed');
    if (saved) {
      setRankingCollapsed(JSON.parse(saved));
    }
  }, []);

  // 🎯 UNIFIED DATA LOADING EFFECT - Reduz re-renders
  useEffect(() => {
    const updateDataStates = async () => {
      const newState = { ...dataLoadingState };
      const userId = getUserId();

      // Auth state
      if (!loading) {
        newState.auth = true;
      }

      // Modules and class info state
      if (!userId) {
        newState.modules = true;
        newState.classInfo = true;
        newState.ranking = true;
      } else {
        // Set modules
        const defaultUnlocked = isProfessor ? ['module-1', 'module-2', 'module-3', 'module-4'] : ['module-1'];
        startTransition(() => {
          setUnlockedModules(defaultUnlocked);
        });
        devLog('Unlocked modules set to default:', defaultUnlocked);
        newState.modules = true;
        newState.classInfo = true;

        // Handle ranking update
        try {
          devLog('Updating unified scoring...');
          if (unifiedScoringService && typeof unifiedScoringService.updateStudentRanking === 'function') {
            await unifiedScoringService.updateStudentRanking(userId);
          } else {
            console.warn('updateStudentRanking method not available');
          }
          newState.ranking = true;
        } catch (error) {
          console.error('Error updating scoring:', error);
          newState.ranking = true; // Não bloquear UI
        }
      }

      // Single state update to prevent multiple re-renders
      setDataLoadingState(newState);
    };

    updateDataStates();
  }, [loading, getUserId(), isProfessor]);
  
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
  
  // 🎯 FUNÇÃO AUXILIAR PARA BUSCAR PROGRESSO DO MÓDULO
  const getModuleProgress = useCallback(async (userId: string, moduleId: string) => {
    if (!db) return null;
    
    try {
      // Buscar dados do quiz_attempts (fonte primária)
      const { getDocs, collection, query, where, orderBy, limit } = await import('firebase/firestore');
      const attemptsQuery = query(
        collection(db, 'quiz_attempts'),
        where('studentId', '==', userId),
        where('moduleId', '==', moduleId),
        orderBy('startedAt', 'desc'),
        limit(1)
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      if (!attemptsSnapshot.empty) {
        const attemptDoc = attemptsSnapshot.docs[0];
        const attemptData = attemptDoc.data();
        
        return {
          score: attemptData.percentage || 0,
          passed: attemptData.passed || false,
          completed: attemptData.passed || false,
          lastCompleted: attemptData.completedAt?.toDate?.() || attemptData.startedAt?.toDate?.() || new Date(),
          attempts: 1,
          timeSpent: '~15min' // Mock data por enquanto
        };
      }
    } catch (error) {
      console.error('Error fetching module progress:', error);
    }
    
    return null;
  }, []);

  // 🎯 HANDLERS OTIMIZADOS
  const handleModuleStart = useCallback(async (moduleId: string) => {
    try {
      // Se o usuário está logado, verificar se o módulo já foi concluído
      const userId = getUserId();
      if (userId) {
        const progress = await getModuleProgress(userId, moduleId);

        if (progress && progress.completed) {
          // Módulo já concluído - abrir modal
          const moduleData = modules.find(m => m.id === moduleId);
          setSelectedModuleForModal({
            title: moduleData?.title || 'Módulo',
            score: progress.score,
            bestScore: progress.score, // Por enquanto são iguais
            timeSpent: progress.timeSpent,
            attempts: progress.attempts,
            lastCompleted: progress.lastCompleted
          });
          setShowCompletedModal(true);
          return;
        }
      }

      // Módulo não concluído - navegar normalmente
      if (moduleId === 'module-1') {
        window.location.href = '/jogos/modulo-1/quiz';
      }
    } catch (error) {
      console.error('Error starting module:', error);
      // Navegar mesmo com erro
      if (moduleId === 'module-1') {
        window.location.href = '/jogos/modulo-1/quiz';
      }
    }
  }, [getUserId(), getModuleProgress]);
  
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
      
      const userId = getUserId();
      if (user && userId && !userId.includes('guest')) {
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
  
  // 🎯 LOADING STATE & READY CHECK - Usando skeleton UI
  if (loading || !ready || !isHydrated) {
    // Se ainda está carregando dados principais, mostrar skeleton completo
    if (loading || !isHydrated) {
      return <JogosPageSkeleton />;
    }
    // Se só está aguardando dados secundários, mostrar skeleton mínimo
    return <JogosPageMinimalSkeleton />;
  }
  
  // 🎯 ACCESS CHECK
  const userId = getUserId();
  if (!hasAccess && userId !== 'guest-user' && userId !== 'professor-guest-user') {
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
                <Link href="/dashboard-avancado" className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700">
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
                    {(() => {
                      // Extrair primeiro nome do aluno
                      const fullName = (user as any)?.displayName || (user as any)?.name || (user as any)?.fullName;
                      const firstName = fullName ? fullName.split(' ')[0] : null;
                      const userId = getUserId();
                      const isGuest = userId?.includes('guest');

                      if (isGuest) return 'Visitante';
                      if (firstName) return firstName;
                      return 'Aluno';
                    })()}
                    {(() => {
                      const userId = getUserId();
                      if (!userId || userId.includes('guest')) return null;

                      // Se o ID é curto (4 caracteres ou menos), mostrar completo
                      // Senão, mostrar os últimos 8 caracteres para melhor identificação
                      const displayId = userId.length <= 4 ? userId : userId.slice(-8);

                      return (
                        <span className="ml-2 text-xs text-gray-500 font-mono">
                          (ID:{displayId.toUpperCase()})
                        </span>
                      );
                    })()}
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
                        userId={getUserId() || null}
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

              {/* 🔧 DEBUG COMPONENT (ONLY IN DEVELOPMENT) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-12">
                  <FirebaseConnectionTest />
                </div>
              )}
            </div>

            {/* 🎯 SIDEBAR DIREITO */}
            <div className="xl:col-span-1 space-y-6">
              {/* 🎯 INFORMAÇÕES DA TURMA */}
              {user && <StudentClassInfo studentId={getUserId() || ''} />}
              
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

        {/* 🎯 MODAL DE CONCLUSÃO APRIMORADO */}
        <AnimatePresence>
          {showCompletedModal && selectedModuleForModal && (
            <CompletedModuleModal
              isOpen={showCompletedModal}
              onClose={() => setShowCompletedModal(false)}
              onRetry={handleRetryModule}
              moduleTitle={selectedModuleForModal.title}
              score={selectedModuleForModal.score}
              bestScore={selectedModuleForModal.bestScore}
              timeSpent={selectedModuleForModal.timeSpent}
              attempts={selectedModuleForModal.attempts}
              lastCompleted={selectedModuleForModal.lastCompleted}
            />
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </StudentProgressProvider>
  );
}