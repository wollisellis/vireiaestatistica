'use client';

import { useState, useEffect } from 'react';
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

// 🎯 Hook baseado no feedback do usuário - implementação simples e robusta
export function useModuleProgress(userId: string | null, moduleId: string) {
  const [progress, setProgress] = useState<number | null>(null); // null = loading
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId || !moduleId) {
      setProgress(0); // Usuário não logado = sem progresso
      return;
    }

    let cancelled = false;
    const isDev = process.env.NODE_ENV === 'development';
    const cacheKey = `progress:${moduleId}:${userId}`;
    
    async function loadProgress() {
      try {
        // 1. Tentar localStorage primeiro (cache local)
        const cachedProgress = localStorage.getItem(cacheKey);
        if (cachedProgress && !cancelled) {
          const cached = Number(cachedProgress);
          setProgress(cached);
          if (isDev) console.log(`💾 [${moduleId}] Cache hit: ${cached}%`);
        }

        // 2. Buscar dados remotos
        const remoteProgress = await fetchRemoteProgress(userId, moduleId);
        
        if (!cancelled && typeof remoteProgress === 'number') {
          setProgress(remoteProgress);
          localStorage.setItem(cacheKey, String(remoteProgress));
          if (isDev) console.log(`🔄 [${moduleId}] Remote updated: ${remoteProgress}%`);
        }
        
      } catch (err) {
        if (!cancelled) {
          const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar progresso';
          setError(errorMsg);
          if (isDev) console.error(`❌ [${moduleId}] Erro:`, err);
          
          // Em caso de erro, manter valor do cache se existir
          if (progress === null) {
            setProgress(0);
          }
        }
      }
    }

    loadProgress();
    
    return () => {
      cancelled = true;
    };
  }, [userId, moduleId]);

  return { progress, error, isLoading: progress === null };
}

// 🎯 Função auxiliar para buscar progresso remoto
async function fetchRemoteProgress(userId: string, moduleId: string): Promise<number> {
  if (!db) throw new Error('Firebase não inicializado');
  
  // Estratégia 1: quiz_attempts (fonte primária)
  try {
    const attemptsQuery = query(
      collection(db, 'quiz_attempts'),
      where('studentId', '==', userId),
      where('moduleId', '==', moduleId),
      orderBy('startedAt', 'desc'),
      limit(1)
    );
    
    const attemptsSnapshot = await getDocs(attemptsQuery);
    
    if (!attemptsSnapshot.empty) {
      const attemptData = attemptsSnapshot.docs[0].data();
      const percentage = attemptData.percentage || attemptData.score || 0;
      return Math.max(0, Math.min(100, Math.round(percentage)));
    }
  } catch (error) {
    console.warn('Falha em quiz_attempts, tentando fallbacks...');
  }
  
  // Estratégia 2: student_module_progress
  try {
    const moduleProgressDoc = await getDoc(
      doc(db, 'student_module_progress', `${userId}_${moduleId}`)
    );
    
    if (moduleProgressDoc.exists()) {
      const data = moduleProgressDoc.data();
      const progress = data.progress || data.score || 0;
      return Math.max(0, Math.min(100, Math.round(progress)));
    }
  } catch (error) {
    console.warn('Falha em student_module_progress, tentando último fallback...');
  }
  
  // Estratégia 3: userProgress
  try {
    const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));
    
    if (userProgressDoc.exists()) {
      const userData = userProgressDoc.data();
      const moduleData = userData.modules?.[moduleId];
      
      if (moduleData) {
        const progress = moduleData.progress || moduleData.score || 0;
        return Math.max(0, Math.min(100, Math.round(progress)));
      }
    }
  } catch (error) {
    console.warn('Todos os fallbacks falharam');
  }
  
  // Se tudo falhar, retornar 0
  return 0;
}