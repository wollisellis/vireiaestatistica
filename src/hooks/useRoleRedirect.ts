
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useRBAC } from '@/hooks/useRBAC'

interface RedirectConfig {
  requiredRole?: 'student' | 'professor'
  redirectTo?: string
  allowGuests?: boolean
  studentRedirect?: string
  professorRedirect?: string
}

export function useRoleRedirect(config: RedirectConfig = {}) {
  const router = useRouter()
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth()
  const { user: rbacUser, loading: rbacLoading } = useRBAC(firebaseUser?.uid)

  const {
    requiredRole,
    redirectTo,
    allowGuests = false,
    studentRedirect = '/jogos',
    professorRedirect = '/professor'
  } = config

  useEffect(() => {
    // Don't redirect while loading
    if (authLoading || rbacLoading) return

    // Get current path to avoid unnecessary redirects
    const currentPath = window.location.pathname


    // Handle authenticated users
    if (firebaseUser && rbacUser) {
      // Don't redirect if user is on the login page (they might want to switch roles)
      if (currentPath === '/') {
        return
      }

      // Check if user selected a different role during login
      const selectedRole = typeof window !== 'undefined' ? localStorage.getItem('selected-role') : null
      const effectiveRole = selectedRole as 'student' | 'professor' || rbacUser.role

      // If user has required role and is already on correct page, allow access
      if (requiredRole && effectiveRole === requiredRole) {
        return
      }

      // If no specific role required and no redirectTo specified, allow access
      if (!requiredRole && !redirectTo) {
        return
      }
      
      // If no specific role required but redirectTo is specified, redirect only if not already there
      if (!requiredRole && redirectTo && currentPath !== redirectTo) {
        router.push(redirectTo)
        return
      }

      // Only redirect if there's a specific role requirement and user doesn't meet it
      if (requiredRole && effectiveRole !== requiredRole) {
        if (effectiveRole === 'professor') {
          if (!currentPath.startsWith('/professor')) {
            router.push(professorRedirect)
          }
        } else {
          if (!currentPath.startsWith('/jogos')) {
            router.push(studentRedirect)
          }
        }
        return
      }
    }

    // No user authenticated and no guest mode
    if (!firebaseUser && !rbacUser) {
      // Only redirect to login if explicitly required and not already on login page
      if (requiredRole && !allowGuests && currentPath !== '/') {
        router.push('/')
      }
    }
  }, [
    firebaseUser,
    rbacUser,
    authLoading,
    rbacLoading,
    requiredRole,
    redirectTo,
    allowGuests,
    studentRedirect,
    professorRedirect,
    router
  ])

  return {
    user: rbacUser,
    loading: authLoading || rbacLoading,
    hasAccess: () => {
      // Check authenticated user access
      if (rbacUser) {
        if (!requiredRole) return true
        return rbacUser.role === requiredRole
      }

      return false
    }
  }
}

// Specialized hooks for common use cases
export function useStudentAccess() {
  return useRoleRedirect({
    requiredRole: 'student',
    allowGuests: false,
    studentRedirect: '/jogos',
    professorRedirect: '/professor'
  })
}

export function useProfessorAccess() {
  return useRoleRedirect({
    requiredRole: 'professor',
    allowGuests: false,
    studentRedirect: '/jogos',
    professorRedirect: '/professor'
  })
}

export function useAuthRedirect() {
  return useRoleRedirect({
    allowGuests: false,
    studentRedirect: '/jogos',
    professorRedirect: '/professor'
  })
}

// Hook flexível que permite navegação livre entre áreas para usuários autenticados
export function useFlexibleAccess() {
  return useRoleRedirect({
    // Sem requiredRole = permite qualquer usuário autenticado acessar
    allowGuests: false
  })
}