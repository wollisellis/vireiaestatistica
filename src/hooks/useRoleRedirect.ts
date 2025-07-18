
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

    // Check for guest modes
    const isStudentGuest = typeof window !== 'undefined' && 
      document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))
    const isProfessorGuest = typeof window !== 'undefined' && 
      document.cookie.split(';').some(cookie => cookie.trim().startsWith('professor-guest-mode=true'))

    // Handle guest users
    if (isStudentGuest || isProfessorGuest) {
      if (!allowGuests) {
        // Only redirect if not already on login page
        if (currentPath !== '/') {
          router.push('/')
        }
        return
      }

      // Check if guest has required role
      if (requiredRole) {
        if (requiredRole === 'student' && !isStudentGuest) {
          // Only redirect if not already on student page
          if (!currentPath.startsWith('/jogos')) {
            router.push(studentRedirect)
          }
          return
        }
        if (requiredRole === 'professor' && !isProfessorGuest) {
          // Only redirect if not already on professor page
          if (!currentPath.startsWith('/professor')) {
            router.push(professorRedirect)
          }
          return
        }
      }

      return // Allow guests to continue
    }

    // Handle authenticated users
    if (firebaseUser && rbacUser) {
      // If user has required role and is already on correct page, allow access
      if (requiredRole && rbacUser.role === requiredRole) {
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

      // User doesn't have required role, redirect to appropriate page only if not already there
      if (rbacUser.role === 'professor') {
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
      // Check for guest access
      const isStudentGuest = typeof window !== 'undefined' && 
        document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))
      const isProfessorGuest = typeof window !== 'undefined' && 
        document.cookie.split(';').some(cookie => cookie.trim().startsWith('professor-guest-mode=true'))

      if (allowGuests && (isStudentGuest || isProfessorGuest)) {
        if (!requiredRole) return true
        if (requiredRole === 'student' && isStudentGuest) return true
        if (requiredRole === 'professor' && isProfessorGuest) return true
      }

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
export function useStudentAccess(allowGuests: boolean = true) {
  return useRoleRedirect({
    requiredRole: 'student',
    allowGuests,
    studentRedirect: '/jogos',
    professorRedirect: '/professor'
  })
}

export function useProfessorAccess(allowGuests: boolean = true) {
  return useRoleRedirect({
    requiredRole: 'professor',
    allowGuests,
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