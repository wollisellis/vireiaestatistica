'use client'

import React, { useEffect, useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import FirebaseConfigWarning from '@/components/FirebaseConfigWarning'
import { isFirebaseConfigured } from '@/lib/firebase'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useRBAC } from '@/hooks/useRBAC'

export default function LoginPage() {
  const [isCleared, setIsCleared] = useState(false)
  const [showFirebaseWarning, setShowFirebaseWarning] = useState(false)
  const { user: firebaseUser } = useFirebaseAuth()
  const { user: rbacUser } = useRBAC(firebaseUser?.uid)

  // Check if user is authenticated and redirect appropriately
  useEffect(() => {
    if (firebaseUser && rbacUser) {
      console.log('🔄 User authenticated, redirecting...', {
        firebaseUser: firebaseUser.email,
        rbacUser: rbacUser.role
      })

      // Redirect based on role
      if (rbacUser.role === 'professor') {
        window.location.href = '/professor'
      } else {
        window.location.href = '/jogos'
      }
      return
    }
  }, [firebaseUser, rbacUser])

  // Clear any authentication state when accessing login page to ensure clean state
  useEffect(() => {
    // Only clear if user is not authenticated
    if (firebaseUser || rbacUser) {
      setIsCleared(true)
      return
    }
    if (typeof window !== 'undefined') {
      // Clear all authentication-related cookies
      const cookiesToClear = [
        'guest-mode',
        'professor-guest-mode',
        'auth-token',
        'firebase-auth-token',
        'user-role',
        'user-session'
      ]

      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      })

      // Clear any localStorage items that might interfere
      const localStorageKeysToRemove = [
        'guest-mode',
        'professor-guest-mode',
        'firebase-auth-token',
        'user-data',
        'auth-state'
      ]

      localStorageKeysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })

      // Clear sessionStorage as well
      sessionStorage.clear()

      console.log('Login page: All authentication state cleared')

      // Force a small delay to ensure all state is cleared before rendering
      setTimeout(() => {
        setIsCleared(true)
        // Check Firebase configuration after clearing state
        if (!isFirebaseConfigured()) {
          setShowFirebaseWarning(true)
        }
      }, 100)
    } else {
      setIsCleared(true)
    }
  }, [firebaseUser, rbacUser])

  // Show loading while clearing state
  if (!isCleared) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Preparando AvaliaNutri...</h2>
          <p className="text-gray-500 mt-2">Carregando página de login</p>
        </div>
      </div>
    )
  }

  // Always show the login form - no automatic redirections
  return (
    <>
      <AuthForm />
      {showFirebaseWarning && (
        <FirebaseConfigWarning
          onDismiss={() => setShowFirebaseWarning(false)}
        />
      )}
    </>
  )
}
