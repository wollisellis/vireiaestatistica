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

    // Check for guest modes
    const isStudentGuest = typeof window !== 'undefined' && 
      document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))
    const isProfessorGuest = typeof window !== 'undefined' && 
      document.cookie.split(';').some(cookie => cookie.trim().startsWith('professor-guest-mode=true'))

    // Handle guest users
    if (isStudentGuest || isProfessorGuest) {
      if (!allowGuests) {
        // Redirect guests to login if not allowed
        router.push('/')
        return
      }

      // Check if guest has required role
      if (requiredRole) {
        if (requiredRole === 'student' && !isStudentGuest) {
          router.push(studentRedirect)
          return
        }
        if (requiredRole === 'professor' && !isProfessorGuest) {
          router.push(professorRedirect)
          return
        }
      }

      return // Allow guests to continue
    }

    // Handle authenticated users
    if (firebaseUser && rbacUser) {
      // If user has required role, allow access
      if (requiredRole && rbacUser.role === requiredRole) {
        return
      }

      // If no specific role required and no redirectTo specified, allow access
      if (!requiredRole && !redirectTo) {
        return
      }
      
      // If no specific role required but redirectTo is specified, redirect
      if (!requiredRole && redirectTo) {
        router.push(redirectTo)
        return
      }

      // User doesn't have required role, redirect to appropriate page
      if (rbacUser.role === 'professor') {
        router.push(professorRedirect)
      } else {
        router.push(studentRedirect)
      }
      return
    }

    // No user authenticated and no guest mode
    if (!firebaseUser && !rbacUser) {
      // Only redirect to login if explicitly required
      if (requiredRole && !allowGuests) {
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