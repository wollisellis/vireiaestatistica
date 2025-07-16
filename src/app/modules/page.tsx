'use client';

import React, { useEffect, useState } from 'react';
import { modules } from '@/data/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { useRoleRedirect } from '@/hooks/useRoleRedirect';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { collection, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Module } from '@/types/modules';
import { BookOpen, Trophy, Clock, Target, Lock, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ModuleProgress {
  [moduleId: string]: {
    completedContent: string[];
    completedExercises: string[];
    totalScore: number;
    lastAccessed: Date;
  };
}

export default function ModulesPage() {
  // Use role-based redirection allowing both students and professors
  const { user, loading: authLoading } = useRoleRedirect({
    allowGuests: true,
    studentRedirect: '/jogos',
    professorRedirect: '/professor'
  });
  
  // Firebase auth for logout functionality
  const { user: firebaseUser, signOut } = useFirebaseAuth();
  
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({});
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1']);
  const [loading, setLoading] = useState(true);

  const isProfessor = user?.role === 'professor';

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
      setLoading(false);
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
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar módulos desbloqueados:', error);
      setLoading(false);
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
        totalExercises += module.exercises.length;
        completedExercises += progress.completedExercises.length;
        
        if (progress.completedContent.length === module.content.length &&
            progress.completedExercises.length === module.exercises.length) {
          completedModules++;
        }
      } else {
        totalExercises += module.exercises.length;
      }
    });

    return {
      totalScore,
      completedModules,
      totalModules: modules.length,
      exerciseProgress: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0
    };
  };

  const stats = calculateOverallStats();

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando Módulos...</h2>
          <p className="text-gray-500 mt-2">Preparando conteúdo educacional</p>
        </div>
      </div>
    );
  }

  // At this point, useRoleRedirect has already handled authentication and redirections
  // If we reach here, the user has valid access (student, professor, or guest)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Início</span>
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            <span className="text-gray-900 font-medium">Módulos</span>
          </div>
          
          {/* User Welcome */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 inline-block">
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
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Módulos de Avaliação Nutricional
          </h1>
          <p className="text-gray-600">
            Aprenda os fundamentos e técnicas avançadas de avaliação nutricional com dados reais brasileiros
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Módulos Completos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedModules}/{stats.totalModules}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pontuação Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalScore}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exercícios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.exerciseProgress}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {modules.reduce((acc, m) => acc + m.estimatedTime, 0)} min
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Explore Também os Jogos Educacionais!
                </h3>
                <p className="text-gray-600">
                  Pratique seus conhecimentos com jogos interativos baseados no conteúdo dos módulos
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/jogos">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ver Jogos
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => {
            const progress = moduleProgress[module.id];
            const isUnlocked = unlockedModules.includes(module.id) || isProfessor;
            
            return (
              <ModuleCard
                key={module.id}
                module={{
                  ...module,
                  isLocked: !isUnlocked
                }}
                progress={progress ? {
                  completedContent: progress.completedContent.length,
                  totalContent: module.content.length,
                  completedExercises: progress.completedExercises.length,
                  totalExercises: module.exercises.length,
                  score: progress.totalScore
                } : undefined}
                onUnlock={handleUnlockModule}
                isProfessor={isProfessor}
              />
            );
          })}
        </div>

        {/* Informações adicionais */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Sobre os Módulos
          </h2>
          <p className="text-blue-800">
            Cada módulo foi desenvolvido com base no conteúdo das aulas da disciplina de Avaliação Nutricional 
            da UNICAMP e integra dados reais de fontes brasileiras como POF 2024, SISVAN, DataSUS e IBGE. 
            Complete os exercícios para ganhar pontos e desbloquear novos conteúdos!
          </p>
        </div>
      </div>
    </div>
  );
}