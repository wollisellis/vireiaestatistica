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

  useEffect(() => {
    if (user && user.role === 'student') {
      // Load module access permissions for students
      loadModuleAccess(user.id)
    }
  }, [user])

  const loadModuleAccess = async (userId: string) => {
    // Mock implementation - in real app, this would check enrollment status
    const mockAccess = {
      1: true, // Anthropometric Assessment
      2: true, // Clinical Assessment
      3: true, // Socioeconomic Assessment
      4: true, // Growth Curves
    }
    setModuleAccess(mockAccess)
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    return hasPermission(user, resource, action)
  }

  const isAuthorized = (requiredRole?: 'professor' | 'student'): boolean => {
    if (!user) return false
    if (!requiredRole) return true
    return user.role === requiredRole
  }

  const canAccessModule = (moduleId: number): boolean => {
    if (!user) return false
    if (user.role === 'professor') return true
    return moduleAccess[moduleId] || false
  }

  return {
    user,
    loading,
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
