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

    // Handle guest users - simple redirect
    if (isStudentGuest) {
      if (requiredRole === 'professor') {
        router.push('/professor')
        return
      }
      // Allow student guests to continue
      return
    }

    if (isProfessorGuest) {
      if (requiredRole === 'student') {
        router.push('/jogos')
        return
      }
      // Allow professor guests to continue
      return
    }

    // Handle authenticated users - simple redirect
    if (firebaseUser && rbacUser) {
      // If user has required role, allow access
      if (requiredRole && rbacUser.role === requiredRole) {
        return
      }

      // Simple redirect based on role
      if (rbacUser.role === 'professor') {
        router.push('/professor')
      } else {
        router.push('/jogos')
      }
      return
    }

    // No user authenticated and no guest mode - redirect to login
    if (!firebaseUser && !rbacUser && requiredRole) {
      router.push('/')
    }
  }, [
    firebaseUser,
    rbacUser,
    authLoading,
    rbacLoading,
    requiredRole,
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

// Simplified specialized hooks
export function useStudentAccess(allowGuests: boolean = true) {
  return useRoleRedirect({
    requiredRole: 'student',
    allowGuests
  })
}

export function useProfessorAccess(allowGuests: boolean = true) {
  return useRoleRedirect({
    requiredRole: 'professor',
    allowGuests
  })
}

export function useAuthRedirect() {
  return useRoleRedirect({
    allowGuests: false
  })
}