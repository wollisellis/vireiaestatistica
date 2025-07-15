import React, { useEffect, useState } from 'react'
import { useFirebaseProfile } from './useFirebaseAuth'
import { hasPermission, User } from '@/lib/firebase'

export interface RBACHookReturn {
  user: User | null
  loading: boolean
  hasPermission: (resource: string, action: string) => boolean
  isAuthorized: (requiredRole?: 'professor' | 'student') => boolean
  canAccessModule: (moduleId: number) => boolean
}

export function useRBAC(userId?: string): RBACHookReturn {
  const { profile: user, loading } = useFirebaseProfile(userId || '')
  const [moduleAccess, setModuleAccess] = useState<Record<number, boolean>>({})
  const [isStudentGuest, setIsStudentGuest] = useState(false)
  const [isProfessorGuest, setIsProfessorGuest] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('🔍 RBAC Debug:', {
      userId: userId || 'not provided',
      user: user ? { id: user.id, email: user.email, role: user.role } : 'null',
      loading,
      isStudentGuest,
      isProfessorGuest
    })
  }, [userId, user, loading, isStudentGuest, isProfessorGuest])

  useEffect(() => {
    // Check for guest modes
    if (typeof window !== 'undefined') {
      const studentGuestCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('guest-mode='))
      const professorGuestCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('professor-guest-mode='))

      setIsStudentGuest(studentGuestCookie?.split('=')[1] === 'true')
      setIsProfessorGuest(professorGuestCookie?.split('=')[1] === 'true')
    }
  }, [])

  useEffect(() => {
    if (user && user.role === 'student') {
      // Load module access permissions for students
      loadModuleAccess(user.id)
    } else if (user && user.role === 'professor') {
      // Professors have access to all modules
      setModuleAccess({
        1: true, // Anthropometric Assessment
        2: true, // Clinical Assessment
        3: true, // Socioeconomic Assessment
        4: true, // Growth Curves
      })
    } else if (isStudentGuest || isProfessorGuest) {
      // Grant access to all modules for guest users
      setModuleAccess({
        1: true, // Anthropometric Assessment
        2: true, // Clinical Assessment
        3: true, // Socioeconomic Assessment
        4: true, // Growth Curves
      })
    }
  }, [user, isStudentGuest, isProfessorGuest])

  const loadModuleAccess = async (userId: string) => {
    // Try to get module settings from professor context
    try {
      // This will work if the component is wrapped in ProfessorDemoProvider
      const { useProfessorDemo } = await import('@/contexts/ProfessorDemoContext')
      const { moduleSettings } = useProfessorDemo()

      const access: Record<number, boolean> = {}
      moduleSettings.forEach(setting => {
        access[setting.moduleId] = !setting.isLocked
      })

      setModuleAccess(access)
    } catch {
      // Fallback to default settings if not in professor context
      const defaultAccess = {
        1: true,  // Anthropometric Assessment - always unlocked
        2: false, // Clinical Assessment - locked by default
        3: false, // Socioeconomic Assessment - locked by default
        4: true,  // Growth Curves - unlocked by default
      }
      setModuleAccess(defaultAccess)
    }
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user && !isStudentGuest && !isProfessorGuest) return false

    if (isStudentGuest) {
      // Student guest users have limited permissions - can read modules and play games
      return resource === 'modules' && action === 'read_unlocked'
    }

    if (isProfessorGuest) {
      // Professor guest users have full professor permissions
      return hasPermission({ role: 'professor' } as any, resource, action)
    }

    return hasPermission(user!, resource, action)
  }

  const isAuthorized = (requiredRole?: 'professor' | 'student'): boolean => {
    if (!user && !isStudentGuest && !isProfessorGuest) return false

    if (isStudentGuest) {
      // Student guest users are treated as students for authorization purposes
      return !requiredRole || requiredRole === 'student'
    }

    if (isProfessorGuest) {
      // Professor guest users are treated as professors for authorization purposes
      return !requiredRole || requiredRole === 'professor'
    }

    if (!requiredRole) return true
    return user!.role === requiredRole
  }

  const canAccessModule = (moduleId: number): boolean => {
    if (!user && !isStudentGuest && !isProfessorGuest) return false

    if (isStudentGuest || isProfessorGuest) {
      // Guest users can access all modules
      return moduleAccess[moduleId] || false
    }

    if (user!.role === 'professor') return true
    return moduleAccess[moduleId] || false
  }

  // Create a mock guest user for display purposes
  const effectiveUser = (isStudentGuest || isProfessorGuest) && !user ? {
    id: isProfessorGuest ? 'professor-guest-user' : 'guest-user',
    email: isProfessorGuest ? 'professor.visitante@avalianutri.com' : 'visitante@avalianutri.com',
    fullName: isProfessorGuest ? 'Professor Visitante' : 'Usuário Visitante',
    role: (isProfessorGuest ? 'professor' : 'student') as const,
    anonymousId: isProfessorGuest ? 'ProfVisitante001' : 'Visitante001',
    institutionId: 'demo',
    totalScore: 0,
    levelReached: 1,
    gamesCompleted: 0,
    collaborationHistory: [],
    preferredPartners: [],
    achievements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } : user

  return {
    user: effectiveUser,
    loading: loading && !isStudentGuest && !isProfessorGuest,
    hasPermission: checkPermission,
    isAuthorized,
    canAccessModule
  }
}

// Higher-Order Component for route protection
export function withRBAC<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole?: 'professor' | 'student'
) {
  return function ProtectedComponent(props: T) {
    const { user, loading, isAuthorized } = useRBAC()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Você precisa estar logado para acessar esta página.
            </p>
          </div>
        </div>
      )
    }

    if (requiredRole && !isAuthorized(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Permission checking utilities
export const PermissionGate: React.FC<{
  resource: string
  action: string
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ resource, action, children, fallback = null }) => {
  const { hasPermission } = useRBAC()
  
  if (hasPermission(resource, action)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Role-based component rendering
export const RoleGate: React.FC<{
  allowedRoles: ('professor' | 'student')[]
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useRBAC()
  
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>
  }
  
  return <>{fallback}</>
}

// Hook for checking specific permissions
export function usePermission(resource: string, action: string): boolean {
  const { hasPermission } = useRBAC()
  return hasPermission(resource, action)
}

// Hook for checking user role
export function useRole(): 'professor' | 'student' | null {
  const { user } = useRBAC()
  return user?.role || null
}
