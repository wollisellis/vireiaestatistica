'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

// 🎯 TIPOS FORTES - Eliminar any's
interface ModuleProgressData {
  percentage: number;
  score: number;
  totalScore: number;
  bestScore: number;
  completed: boolean;
  passed: boolean;
  lastAccessed: Date | null;
  attempts: number;
  source: 'quiz_attempts' | 'student_module_progress' | 'userProgress' | 'cache';
  rawData?: unknown;
}

interface ModuleState {
  status: 'loading' | 'new' | 'in_progress' | 'completed' | 'error';
  progress: number;
  score: number;
  passed: boolean;
  attempts: number;
  stars: number;
  badge: string;
  buttonText: string;
  lastActivity: Date | null;
  source: string;
}

interface UseModuleProgressReturn {
  state: ModuleState;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// 🎯 UTILITÁRIOS SEGUROS
const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MODULE-PROGRESS]', ...args);
  }
};

const safeScore = (rawScore: number): number => {
  // 🎯 FIX: Validação segura de score - evita 1000% e valores negativos
  if (rawScore <= 0) return 0;
  
  // Se parece estar em escala 0-10, converter para 0-100
  if (rawScore > 0 && rawScore <= 10) {
    return Math.min(100, Math.max(0, Math.round(rawScore * 10)));
  }
  
  // Já está em escala 0-100, apenas garantir range
  return Math.min(100, Math.max(0, Math.round(rawScore)));
};

const getStarsFromScore = (score: number): number => {
  if (score >= 90) return 5;
  if (score >= 75) return 4; // QS Stars - 75% = 4 estrelas
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  if (score >= 20) return 1;
  return 0;
};

const getModuleState = (progress: ModuleProgressData | null, isLoading: boolean, error: string | null): ModuleState => {
  if (error) {
    return {
      status: 'error',
      progress: 0,
      score: 0,
      passed: false,
      attempts: 0,
      stars: 0,
      badge: 'Erro',
      buttonText: 'Tentar Novamente',
      lastActivity: null,
      source: 'error'
    };
  }

  if (isLoading || !progress) {
    return {
      status: 'loading',
      progress: 0,
      score: 0,
      passed: false,
      attempts: 0,
      stars: 0,
      badge: 'Carregando...',
      buttonText: 'Carregando...',
      lastActivity: null,
      source: 'loading'
    };
  }

  const score = safeScore(progress.score || progress.percentage || progress.bestScore || 0);
  const passed = progress.passed || progress.completed || score >= 70;
  const stars = getStarsFromScore(score);
  
  if (score === 0) {
    return {
      status: 'new',
      progress: 0,
      score: 0,
      passed: false,
      attempts: progress.attempts,
      stars: 0,
      badge: 'Novo',
      buttonText: 'Iniciar Módulo',
      lastActivity: progress.lastAccessed,
      source: progress.source
    };
  }

  if (passed) {
    return {
      status: 'completed',
      progress: score,
      score: score,
      passed: true,
      attempts: progress.attempts,
      stars: stars,
      badge: 'Concluído',
      buttonText: `Revisar • ${score}%`,
      lastActivity: progress.lastAccessed,
      source: progress.source
    };
  }

  return {
    status: 'in_progress',
    progress: score,
    score: score,
    passed: false,
    attempts: progress.attempts,
    stars: stars,
    badge: 'Em Progresso',
    buttonText: `Continuar • ${score}%`,
    lastActivity: progress.lastAccessed,
    source: progress.source
  };
};

// 🎯 HOOK PRINCIPAL REFATORADO
export function useModuleProgress(userId: string | null, moduleId: string): UseModuleProgressReturn {
  const [progressData, setProgressData] = useState<ModuleProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🎯 DEBOUNCE - Evitar múltiplas chamadas
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();
  const cacheRef = useRef<Map<string, { data: ModuleProgressData; timestamp: number }>>(new Map());
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  const getCacheKey = useCallback((uid: string, modId: string) => `${uid}:${modId}`, []);
  const getLocalStorageKey = useCallback((uid: string, modId: string) => `module-progress:${modId}:${uid}`, []);

  // 🎯 FUNÇÃO DE BUSCA OTIMIZADA
  const fetchProgress = useCallback(async (): Promise<ModuleProgressData | null> => {
    if (!userId || !moduleId || !db) {
      return null;
    }

    const cacheKey = getCacheKey(userId, moduleId);
    const localStorageKey = getLocalStorageKey(userId, moduleId);

    try {
      // 1. Verificar cache em memória
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        devLog('Cache hit (memory):', cached.data);
        return cached.data;
      }

      // 2. Verificar localStorage
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(localStorageKey);
          if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_DURATION) {
              devLog('Cache hit (localStorage):', parsed.data);
              cacheRef.current.set(cacheKey, { data: parsed.data, timestamp: parsed.timestamp });
              return parsed.data;
            }
          }
        } catch (e) {
          devLog('localStorage parse error:', e);
        }
      }

      // 3. Buscar dados remotos com fallbacks
      const remoteData = await fetchRemoteProgress(userId, moduleId);
      
      if (remoteData) {
        // Atualizar caches
        const cacheEntry = { data: remoteData, timestamp: Date.now() };
        cacheRef.current.set(cacheKey, cacheEntry);
        
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(localStorageKey, JSON.stringify(cacheEntry));
          } catch (e) {
            devLog('localStorage save error:', e);
          }
        }
        
        devLog('Remote data fetched:', remoteData);
        return remoteData;
      }

      return null;
    } catch (err) {
      console.error('[MODULE-PROGRESS] Fetch error:', err);
      throw err;
    }
  }, [userId, moduleId, getCacheKey, getLocalStorageKey]);

  // 🎯 REFRESH COM DEBOUNCE
  const refresh = useCallback(async (): Promise<void> => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    refreshTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchProgress();
        setProgressData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar progresso';
        setError(errorMessage);
        devLog('Refresh error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce
  }, [fetchProgress]);

  // 🎯 EFEITO PRINCIPAL LIMPO
  useEffect(() => {
    if (!userId || !moduleId) {
      setProgressData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    refresh();

    // Cleanup
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [userId, moduleId, refresh]);

  // 🎯 RETORNAR ESTADO CALCULADO
  const state = getModuleState(progressData, isLoading, error);
  
  return {
    state,
    isLoading,
    error,
    refresh
  };
}

// 🎯 BUSCA REMOTA COM FALLBACKS ROBUSTOS
async function fetchRemoteProgress(userId: string, moduleId: string): Promise<ModuleProgressData | null> {
  if (!db) {
    throw new Error('Firebase não inicializado');
  }

  // Estratégia 1: quiz_attempts (fonte primária)
  try {
    devLog(`Tentando quiz_attempts para ${moduleId}`);
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
        percentage: attemptData.percentage || 0,
        score: attemptData.percentage || attemptData.score || 0,
        totalScore: attemptData.percentage || attemptData.score || 0,
        bestScore: attemptData.percentage || attemptData.score || 0,
        completed: attemptData.passed || false,
        passed: attemptData.passed || false,
        lastAccessed: attemptData.completedAt?.toDate?.() || attemptData.startedAt?.toDate?.() || null,
        attempts: 1,
        source: 'quiz_attempts',
        rawData: attemptData
      };
    }
  } catch (error) {
    devLog('quiz_attempts falhou:', error);
  }
  
  // Estratégia 2: student_module_progress
  try {
    devLog(`Tentando student_module_progress para ${moduleId}`);
    const moduleProgressDoc = await getDoc(
      doc(db, 'student_module_progress', `${userId}_${moduleId}`)
    );
    
    if (moduleProgressDoc.exists()) {
      const data = moduleProgressDoc.data();
      return {
        percentage: data.progress || data.score || 0,
        score: data.progress || data.score || 0,
        totalScore: data.progress || data.score || 0,
        bestScore: data.progress || data.score || 0,
        completed: data.isCompleted || false,
        passed: data.isCompleted || false,
        lastAccessed: data.updatedAt?.toDate?.() || data.lastAttempt?.toDate?.() || null,
        attempts: data.attempts || 1,
        source: 'student_module_progress',
        rawData: data
      };
    }
  } catch (error) {
    devLog('student_module_progress falhou:', error);
  }
  
  // Estratégia 3: userProgress (fallback final)
  try {
    devLog(`Tentando userProgress para ${moduleId}`);
    const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));
    
    if (userProgressDoc.exists()) {
      const userData = userProgressDoc.data();
      const moduleData = userData.modules?.[moduleId];
      
      if (moduleData) {
        return {
          percentage: moduleData.progress || moduleData.score || 0,
          score: moduleData.progress || moduleData.score || 0,
          totalScore: moduleData.progress || moduleData.score || 0,
          bestScore: moduleData.progress || moduleData.score || 0,
          completed: moduleData.completed || false,
          passed: moduleData.completed || false,
          lastAccessed: moduleData.lastAccessed?.toDate?.() || null,
          attempts: moduleData.attempts || 1,
          source: 'userProgress',
          rawData: moduleData
        };
      }
    }
  } catch (error) {
    devLog('userProgress falhou:', error);
  }
  
  // Se tudo falhar, retornar null
  devLog(`Nenhum progresso encontrado para ${moduleId}`);
  return null;
}

export default useModuleProgress;