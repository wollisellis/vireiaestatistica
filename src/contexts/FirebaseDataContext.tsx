'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { isFirebaseConfigured } from '@/lib/firebase'
import {
  getClassAnalytics,
  getUserGameProgress,
  getProfessorCourses,
  ClassAnalytics,
  GameProgress,
  Course,
  FirebaseUser
} from '@/services/firebaseDataService'

// Context for real Firebase data
interface FirebaseDataContextType {
  // Professor data
  classAnalytics: ClassAnalytics | null
  courses: Course[]
  
  // Student data
  gameProgress: GameProgress[]
  
  // Loading states
  loading: boolean
  analyticsLoading: boolean
  progressLoading: boolean
  
  // Actions
  refreshAnalytics: () => Promise<void>
  refreshProgress: () => Promise<void>
  refreshCourses: () => Promise<void>
}

const FirebaseDataContext = createContext<FirebaseDataContextType | undefined>(undefined)

export function useFirebaseData() {
  const context = useContext(FirebaseDataContext)
  if (context === undefined) {
    throw new Error('useFirebaseData must be used within a FirebaseDataProvider')
  }
  return context
}

interface FirebaseDataProviderProps {
  children: React.ReactNode
}

export function FirebaseDataProvider({ children }: FirebaseDataProviderProps) {
  const { user } = useFirebaseAuth()
  
  // State
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [gameProgress, setGameProgress] = useState<GameProgress[]>([])
  
  // Loading states
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  // Check if we should use Firebase or fall back to demo data
  const useRealFirebase = isFirebaseConfigured() && user

  // Load professor analytics
  const refreshAnalytics = async () => {
    if (!useRealFirebase || !user || user.role !== 'professor') return
    
    setAnalyticsLoading(true)
    try {
      const analytics = await getClassAnalytics(user.uid)
      setClassAnalytics(analytics)
    } catch (error) {
      console.error('Error loading class analytics:', error)
      // Fall back to demo data on error
      setClassAnalytics(getDemoAnalytics())
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Load professor courses
  const refreshCourses = async () => {
    if (!useRealFirebase || !user || user.role !== 'professor') return
    
    try {
      const professorCourses = await getProfessorCourses(user.uid)
      setCourses(professorCourses)
    } catch (error) {
      console.error('Error loading courses:', error)
      setCourses([])
    }
  }

  // Load student progress
  const refreshProgress = async () => {
    if (!useRealFirebase || !user) return
    
    setProgressLoading(true)
    try {
      const progress = await getUserGameProgress(user.uid)
      setGameProgress(progress)
    } catch (error) {
      console.error('Error loading game progress:', error)
      setGameProgress([])
    } finally {
      setProgressLoading(false)
    }
  }

  // Initialize data on user change
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      
      if (useRealFirebase && user) {
        // Load real Firebase data
        if (user.role === 'professor') {
          await Promise.all([refreshAnalytics(), refreshCourses()])
        } else {
          await refreshProgress()
        }
      } else {
        // Use demo data when Firebase not configured or no user
        if (user?.role === 'professor') {
          setClassAnalytics(getDemoAnalytics())
          setCourses(getDemoCourses())
        } else {
          setGameProgress(getDemoProgress())
        }
      }
      
      setLoading(false)
    }

    initializeData()
  }, [user, useRealFirebase])

  const contextValue: FirebaseDataContextType = {
    classAnalytics,
    courses,
    gameProgress,
    loading,
    analyticsLoading,
    progressLoading,
    refreshAnalytics,
    refreshProgress,
    refreshCourses
  }

  return (
    <FirebaseDataContext.Provider value={contextValue}>
      {children}
    </FirebaseDataContext.Provider>
  )
}

// Demo data fallbacks (when Firebase not configured)
function getDemoAnalytics(): ClassAnalytics {
  return {
    totalStudents: 45,
    activeStudents: 38,
    averageProgress: 67,
    completionRates: [
      { 
        moduleId: 1, 
        moduleName: 'Indicadores Antropométricos', 
        completionRate: 89, 
        averageScore: 82, 
        isLocked: false 
      },
      { 
        moduleId: 2, 
        moduleName: 'Indicadores Clínicos e Bioquímicos', 
        completionRate: 67, 
        averageScore: 78, 
        isLocked: false 
      },
      { 
        moduleId: 3, 
        moduleName: 'Fatores Socioeconômicos', 
        completionRate: 45, 
        averageScore: 71, 
        isLocked: false 
      },
      { 
        moduleId: 4, 
        moduleName: 'Curvas de Crescimento', 
        completionRate: 23, 
        averageScore: 85, 
        isLocked: false 
      }
    ]
  }
}

function getDemoCourses(): Course[] {
  return [
    {
      id: 'demo-course-1',
      name: 'NT600 - Avaliação Nutricional',
      code: 'NT600-2024',
      professorId: 'demo-professor',
      students: ['student1', 'student2', 'student3'],
      modules: [1, 2, 3, 4],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
}

function getDemoProgress(): GameProgress[] {
  return [
    {
      id: 'demo-progress-1',
      userId: 'demo-user',
      gameId: 1,
      level: 1,
      score: 85,
      completed: true,
      attempts: 2,
      bestTime: 120,
      completedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'demo-progress-2',
      userId: 'demo-user',
      gameId: 2,
      level: 1,
      score: 92,
      completed: true,
      attempts: 1,
      bestTime: 95,
      completedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      createdAt: new Date(Date.now() - 43200000).toISOString()
    },
    {
      id: 'demo-progress-3',
      userId: 'demo-user',
      gameId: 3,
      level: 1,
      score: 78,
      completed: false,
      attempts: 1,
      bestTime: 0,
      completedAt: '',
      createdAt: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
    }
  ]
}

// Hook for easy access to Firebase data with automatic fallback
export function useFirebaseDataWithFallback() {
  const firebaseData = useFirebaseData()
  const { user } = useFirebaseAuth()
  
  // Return appropriate data based on configuration and user state
  return {
    ...firebaseData,
    isUsingRealData: isFirebaseConfigured() && !!user,
    isUsingDemoData: !isFirebaseConfigured() || !user
  }
}
