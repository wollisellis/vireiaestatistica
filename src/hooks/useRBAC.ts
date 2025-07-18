'use client'

import { useState, useEffect } from 'react'
import { useFirebaseAuth, useFirebaseProfile } from '@/hooks/useFirebaseAuth'
import { User } from '@/lib/firebase'

interface RBACUser extends User {
  // Additional RBAC-specific properties if needed
}

interface UseRBACReturn {
  user: RBACUser | null
  loading: boolean
  hasRole: (role: 'student' | 'professor') => boolean
  hasPermission: (permission: string) => boolean
  isAuthenticated: boolean
  isProfessor: boolean
  isStudent: boolean
}

export function useRBAC(userId?: string): UseRBACReturn {
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth()
  const { profile, loading: profileLoading } = useFirebaseProfile(userId || firebaseUser?.uid || '')
  const [user, setUser] = useState<RBACUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(authLoading || profileLoading)
  }, [authLoading, profileLoading])

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (firebaseUser && profile) {
        // Combine Firebase user with profile data
        const rbacUser: RBACUser = {
          ...profile,
          // Ensure we have the Firebase UID
          id: firebaseUser.uid,
          email: firebaseUser.email || profile.email,
          fullName: firebaseUser.displayName || profile.fullName,
        }
        setUser(rbacUser)
      } else {
        // Check for guest modes
        const isStudentGuest = typeof window !== 'undefined' && 
          document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))
        const isProfessorGuest = typeof window !== 'undefined' && 
          document.cookie.split(';').some(cookie => cookie.trim().startsWith('professor-guest-mode=true'))

        if (isStudentGuest) {
          const guestUser: RBACUser = {
            id: 'guest-user',
            email: 'guest@example.com',
            fullName: 'Usuário Visitante',
            role: 'student',
            anonymousId: 'GUEST001',
            institutionId: 'unicamp',
            totalScore: 0,
            levelReached: 1,
            gamesCompleted: 0,
            collaborationHistory: [],
            preferredPartners: [],
            achievements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setUser(guestUser)
        } else if (isProfessorGuest) {
          const professorGuestUser: RBACUser = {
            id: 'professor-guest-user',
            email: 'professor@example.com',
            fullName: 'Professor Visitante',
            role: 'professor',
            institutionId: 'unicamp',
            totalScore: 0,
            levelReached: 1,
            gamesCompleted: 0,
            collaborationHistory: [],
            preferredPartners: [],
            achievements: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setUser(professorGuestUser)
        } else {
          setUser(null)
        }
      }
    }
  }, [firebaseUser, profile, authLoading, profileLoading])

  const hasRole = (role: 'student' | 'professor'): boolean => {
    return user?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Define permissions based on roles
    const permissions: Record<string, string[]> = {
      student: [
        'view_games',
        'play_games',
        'view_progress',
        'collaborate',
        'view_leaderboard',
        'view_modules'
      ],
      professor: [
        'view_games',
        'play_games',
        'view_progress',
        'collaborate',
        'view_leaderboard',
        'view_modules',
        'view_dashboard',
        'manage_students',
        'manage_modules',
        'manage_questions',
        'view_analytics',
        'export_data',
        'manage_collaborations'
      ]
    }

    const userPermissions = permissions[user.role] || []
    return userPermissions.includes(permission)
  }

  const isAuthenticated = user !== null
  const isProfessor = hasRole('professor')
  const isStudent = hasRole('student')

  return {
    user,
    loading,
    hasRole,
    hasPermission,
    isAuthenticated,
    isProfessor,
    isStudent
  }
}

// Alternative hook that uses the current authenticated user
export function useCurrentUserRBAC(): UseRBACReturn {
  const { user: firebaseUser } = useFirebaseAuth()
  return useRBAC(firebaseUser?.uid)
}

// Hook specifically for professor access control
export function useProfessorAccess() {
  const { user, loading, hasRole, hasPermission } = useRBAC()
  
  return {
    user,
    loading,
    hasAccess: hasRole('professor'),
    canViewDashboard: hasPermission('view_dashboard'),
    canManageStudents: hasPermission('manage_students'),
    canManageModules: hasPermission('manage_modules'),
    canViewAnalytics: hasPermission('view_analytics'),
    canExportData: hasPermission('export_data'),
    canManageQuestions: hasPermission('manage_questions'),
    canManageCollaborations: hasPermission('manage_collaborations')
  }
}

// Hook specifically for student access control
export function useStudentAccess() {
  const { user, loading, hasRole, hasPermission } = useRBAC()
  
  return {
    user,
    loading,
    hasAccess: hasRole('student'),
    canViewGames: hasPermission('view_games'),
    canPlayGames: hasPermission('play_games'),
    canViewProgress: hasPermission('view_progress'),
    canCollaborate: hasPermission('collaborate'),
    canViewLeaderboard: hasPermission('view_leaderboard'),
    canViewModules: hasPermission('view_modules')
  }
}