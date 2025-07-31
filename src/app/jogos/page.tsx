'use client';

// Force dynamic rendering to avoid stale cache issues
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useRef, startTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { modules } from '@/data/modules';
import EnhancedModuleCard from '@/components/games/EnhancedModuleCard';
import CompletedModuleModal from '@/components/games/CompletedModuleModal';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { doc, onSnapshot, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
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
  X,
  Minimize2,
  Maximize2,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Footer } from '@/components/layout';
import { useFlexibleAccess } from '@/hooks/useRoleRedirect';
import { StudentClassInfo } from '@/components/student/StudentClassInfo';
import { SimpleRankingPanel } from '@/components/ranking/SimpleRankingPanel';
import unifiedScoringService from '@/services/unifiedScoringService';
import { debounce, devLog } from '@/utils/debounce';
import ProfessorClassService from '@/services/professorClassService';
import FirebaseConnectionTest from '@/components/debug/FirebaseConnectionTest';
import { JogosPageSkeleton, JogosPageMinimalSkeleton } from '@/components/ui/JogosPageSkeleton';

// 🎯 TIPOS FORTES
interface ModuleData {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  maxPoints?: number;
  isLocked?: boolean;
  lockMessage?: string;
}

// 🎯 CONFIGURAÇÃO DOS MÓDULOS DISPONÍVEIS
const ENABLED_MODULES = ['module-1', 'module-2'] as const;
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
    maxPoints: module.maxPoints || 0,
    isLocked: false,
    lockMessage: ''
  }));
};

// Modal foi movido para componente separado em /components/games/CompletedModuleModal.tsx

// 🎯 COMPONENTE PRINCIPAL SIMPLIFICADO
function JogosPageContent() {
  // 🎯 ESTADOS MÍNIMOS NECESSÁRIOS
  const router = useRouter();
  const { user, loading, hasAccess, isProfessor } = useFlexibleAccess();

  // 🔧 DEBUG: Logs detalhados do usuário na página jogos
  useEffect(() => {
    console.log(`🔧 [JogosPage] Estado do usuário:`, {
      user: user,
      userType: typeof user,
      userId: user?.id || user?.uid,
      userEmail: user?.email,
      userRole: user?.role,
      loading: loading,
      hasAccess: hasAccess,
      isProfessor: isProfessor
    });
  }, [user, loading, hasAccess, isProfessor]);
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
    moduleId?: string;
    title: string;
    score: number;
    bestScore?: number;
    timeSpent?: string;
    attempts?: number;
    lastCompleted?: Date;
  } | null>(null);
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
        const userId = getUserId();
        if (!userId) {
          console.warn('No user ID available for ranking refresh');
          return;
        }

        // 🛡️ SAFE GUARD: Verificar se o método existe antes de chamar
        if (unifiedScoringService && typeof unifiedScoringService.updateStudentRanking === 'function') {
          await unifiedScoringService.updateStudentRanking(userId);
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
  }, []);

  // 🎯 FUNÇÃO PARA BUSCAR CONFIGURAÇÕES GLOBAIS DE MÓDULOS
  const fetchGlobalModuleSettings = () => {
    if (!db) {
      console.warn('Firebase database not available, using default modules');
      setUnlockedModules(['module-1']);
      return;
    }

    try {
      devLog('Carregando configurações globais de módulos...');
      
      // Listener em tempo real para configurações globais
      const unsubscribe = onSnapshot(
        doc(db, 'settings', 'modules'), 
        (docSnapshot) => {
          try {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              const globalUnlocked = data?.unlocked || ['module-1'];
              
              // Filtrar apenas módulos que realmente existem no sistema
              const validModules = globalUnlocked.filter((moduleId: string) => 
                modules.some(m => m.id === moduleId)
              );
              
              // Garantir que pelo menos module-1 esteja sempre disponível
              if (!validModules.includes('module-1')) {
                validModules.push('module-1');
              }
              
              setUnlockedModules(validModules);
              devLog('🎯 Módulos globalmente desbloqueados:', validModules);
              console.log('📱 Sincronização: página de jogos recebeu atualização de módulos:', {
                documento: 'settings/modules',
                modulosDesbloqueados: validModules,
                timestamp: new Date().toISOString()
              });
            } else {
              // Se não existe documento, usar padrão
              devLog('Documento de configurações não existe, usando padrão');
              setUnlockedModules(['module-1']);
            }
          } catch (error) {
            console.error('Erro ao processar configurações globais:', error);
            setUnlockedModules(['module-1']);
          }
        },
        (error) => {
          console.error('Erro do Firestore ao buscar configurações globais:', error);
          setUnlockedModules(['module-1']);
        }
      );

      // Retornar função de cleanup
      return unsubscribe;
    } catch (error) {
      console.error('Erro ao configurar listener de módulos globais:', error);
      setUnlockedModules(['module-1']);
      return undefined;
    }
  };

  // 🎯 VERIFICAÇÃO DE LOGIN E ONBOARDING
  useEffect(() => {
    // Se não está carregando e não há usuário autenticado, mostrar modal
    if (!loading) {
      const userId = getUserId();
      const isGuestUser = userId === 'guest-user' || userId === 'professor-guest-user';

      // Se não há usuário ou é um guest não autorizado, redirecionar para login
      if (!user && !isGuestUser) {
        console.log('🔐 Usuário não logado detectado, redirecionando para login');
        router.push('/');
        return;
      }

      // 🎯 ONBOARDING: Verificar se estudante precisa inserir código da turma
      if (user && user.role === 'student' && userId && !isGuestUser) {
        checkStudentOnboarding(userId);
      }
    }
  }, [loading, user]);

  // 🎯 FUNÇÃO PARA VERIFICAR ONBOARDING DO ESTUDANTE
  const checkStudentOnboarding = async (studentId: string) => {
    try {
      console.log('🎓 Verificando onboarding do estudante:', studentId);

      // Verificar se estudante já está matriculado em alguma turma
      const studentClasses = await ProfessorClassService.getStudentClasses(studentId);

      if (studentClasses.length === 0) {
        console.log('📚 Estudante não matriculado em nenhuma turma, redirecionando para onboarding');
        router.push('/entrar-turma');
        return;
      }

      console.log(`✅ Estudante já matriculado em ${studentClasses.length} turma(s)`);
    } catch (error) {
      console.error('❌ Erro ao verificar onboarding:', error);
      // Em caso de erro, não redirecionar para não quebrar a experiência
    }
  };

  // 🎯 UNIFIED DATA LOADING EFFECT - Reduz re-renders
  useEffect(() => {
    let unsubscribeModules: (() => void) | undefined = undefined;

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
        // Buscar configurações globais para todos os usuários (professores e alunos)
        unsubscribeModules = fetchGlobalModuleSettings();
        
        devLog('Configurações globais carregadas para:', isProfessor ? 'Professor' : 'Aluno');
        
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

    // Cleanup function
    return () => {
      if (unsubscribeModules) {
        unsubscribeModules();
      }
    };
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
    if (!db) {
      console.warn('Database not available for module progress');
      return null;
    }

    try {
      // Buscar dados do quiz_attempts (fonte primária)
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
            moduleId: moduleId,
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

      // Módulo não concluído - navegar normalmente com Next.js router
      if (moduleId === 'module-1') {
        router.push('/jogos/modulo-1/quiz');
      } else if (moduleId === 'module-2') {
        router.push('/jogos/modulo-2/quiz');
      }
    } catch (error) {
      console.error('Error starting module:', error);
      // Navegar mesmo com erro usando Next.js router
      if (moduleId === 'module-1') {
        router.push('/jogos/modulo-1/quiz');
      } else if (moduleId === 'module-2') {
        router.push('/jogos/modulo-2/quiz');
      }
    }
  }, [router, getUserId(), getModuleProgress]);
  
  const handleRetryModule = useCallback(() => {
    setShowCompletedModal(false);
    if (selectedModuleForModal?.moduleId === 'module-1') {
      router.push('/jogos/modulo-1/quiz');
    } else if (selectedModuleForModal?.moduleId === 'module-2') {
      router.push('/jogos/modulo-2/quiz');
    }
  }, [router, selectedModuleForModal]);
  
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
  

  
  // 🎯 LOADING STATE & READY CHECK - Usando skeleton UI
  if (loading || !ready || !isHydrated) {
    // Se ainda está carregando dados principais, mostrar skeleton completo
    if (loading || !isHydrated) {
      return <JogosPageSkeleton />;
    }
    // Se só está aguardando dados secundários, mostrar skeleton mínimo
    return <JogosPageMinimalSkeleton />;
  }
  
  // 🎯 ACCESS CHECK - Apenas usuários autenticados
  const userId = getUserId();
  const isGuestUser = userId === 'guest-user' || userId === 'professor-guest-user';
  
  // Verificação adicional para acesso negado (apenas se chegou até aqui)
  if (!hasAccess) {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* 🎯 HEADER RESPONSIVO */}
        <div className="bg-white border-b border-emerald-200 shadow-sm">
          <div className="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              {/* Navigation - Esconde texto em mobile */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link href="/dashboard-avancado" className="flex items-center space-x-1 sm:space-x-2 text-emerald-600 hover:text-emerald-700">
                  <Home className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">Dashboard</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:block" />
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">Módulos</span>
                </div>
              </div>
              
              {/* User info - Compacto em mobile */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-1 sm:space-x-3 text-sm sm:text-base text-gray-700">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 hidden sm:block" />
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-semibold text-sm sm:text-lg">
                      {(() => {
                        // Extrair apenas o primeiro nome do aluno
                        const fullName = (user as any)?.displayName || (user as any)?.name || (user as any)?.fullName;
                        const firstName = fullName ? fullName.split(' ')[0] : null;
                        const userId = getUserId();
                        const isGuest = userId?.includes('guest');

                        if (isGuest) return 'Visitante';
                        if (firstName) return firstName;
                        return 'Aluno';
                      })()}
                    </span>
                    {(() => {
                      const userId = getUserId();
                      if (!userId || userId.includes('guest')) return null;

                      // Sempre mostrar Anonymous ID (será gerado automaticamente se não existir)
                      const anonymousId = (user as any)?.anonymousId;
                      if (anonymousId && /^\d{4}$/.test(anonymousId)) {
                        return (
                          <span className="text-xs sm:text-sm text-emerald-700 font-mono font-bold bg-emerald-100 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-emerald-200 shadow-sm">
                            ID: {anonymousId}
                          </span>
                        );
                      }

                      // Mostrar loading enquanto anonymousId está sendo gerado
                      return (
                        <span className="text-xs sm:text-sm text-blue-700 font-mono font-bold bg-blue-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-blue-200">
                          <span className="animate-pulse">Gerando ID...</span>
                        </span>
                      );
                    })()}
                  </div>
                  {isProfessor && (
                    <span className="hidden sm:inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                      <span className="hidden sm:inline">Professor</span>
                      <span className="sm:hidden">Prof</span>
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-red-600 p-1 sm:p-2"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 MAIN CONTENT - RESPONSIVO */}
        <div className="max-w-8xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
            
            {/* 🎯 MÓDULOS - COL PRINCIPAL RESPONSIVA */}
            <div className="lg:col-span-2 2xl:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8">
              <div>
                <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Módulos de Avaliação Nutricional</h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-0.5 sm:mt-1 hidden sm:block">Aprenda os fundamentos da avaliação nutricional com dados brasileiros</p>
                  </div>
                </div>

                {/* 🎯 GRID DE MÓDULOS RESPONSIVO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
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

              {/* 🔧 DEBUG COMPONENT (ONLY IN DEVELOPMENT) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-12">
                  <FirebaseConnectionTest />
                </div>
              )}
            </div>

            {/* 🎯 SIDEBAR RESPONSIVA - Esconde em mobile, mostra em tablet+ */}
            <div className="hidden lg:block lg:col-span-1 space-y-4 lg:space-y-6">
              {/* 🎯 INFORMAÇÕES DA TURMA */}
              {user && <StudentClassInfo studentId={getUserId() || ''} />}
              
              {/* 🎯 RANKING GERAL */}
              <SimpleRankingPanel
                currentUserId={getUserId() || undefined}
                limit={8}
                className="w-full"
              />
            </div>
          </div>

          {/* 🎯 SIDEBAR MOBILE - Visível apenas em dispositivos móveis */}
          <div className="lg:hidden mt-6 sm:mt-8 space-y-4">
            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Informações Adicionais</h2>
              
              {/* Informações da Turma - Versão Mobile */}
              {user && (
                <div className="mb-4">
                  <StudentClassInfo studentId={getUserId() || ''} />
                </div>
              )}
              
              {/* Ranking - Versão Mobile Compacta */}
              <div>
                <SimpleRankingPanel
                  currentUserId={getUserId() || undefined}
                  limit={5}
                  compact={true}
                  className="w-full"
                />
              </div>
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
  );
}

// 🛡️ ERROR BOUNDARY WRAPPER
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 JogosPage Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro na Aplicação</h2>
            <p className="text-gray-600 mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 🎯 EXPORT PRINCIPAL COM ERROR BOUNDARY
export default function JogosPage() {
  return (
    <ErrorBoundary>
      <JogosPageContent />
    </ErrorBoundary>
  );
}