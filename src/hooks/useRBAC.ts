import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (user && user.role === 'student') {
      // Load module access permissions for students
      loadModuleAccess(user.id)
    }
  }, [user])

  const loadModuleAccess = async (studentId: string) => {
    // This will be implemented when we add course management
    // For now, default access pattern
    const defaultAccess = {
      1: true,  // Anthropometric indicators - always unlocked
      2: false, // Clinical indicators - locked by default
      3: false, // Socioeconomic factors - locked by default
      4: true,  // Growth curves - unlocked for demo
    }
    setModuleAccess(defaultAccess)
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    return hasPermission(user.role, resource as any, action)
  }

  const isAuthorized = (requiredRole?: 'professor' | 'student'): boolean => {
    if (!user) return false
    if (!requiredRole) return true
    return user.role === requiredRole
  }

  const canAccessModule = (moduleId: number): boolean => {
    if (!user) return false
    if (user.role === 'professor') return true // Professors can access all modules
    return moduleAccess[moduleId] || false
  }

  return {
    user,
    loading,
    hasPermission: checkPermission,
    isAuthorized,
    canAccessModule,
  }
}

// Higher-order component for route protection
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

    if (!isAuthorized(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Acesso Restrito
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Perfil atual: {user.role === 'professor' ? 'Professor' : 'Estudante'}
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Hook for checking module access in components
export function useModuleAccess(moduleId: number) {
  const { user, canAccessModule } = useRBAC()
  
  return {
    canAccess: canAccessModule(moduleId),
    isLocked: !canAccessModule(moduleId),
    userRole: user?.role,
    lockMessage: user?.role === 'student' 
      ? 'Aguardando liberação do docente' 
      : 'Módulo bloqueado para estudantes'
  }
}
