'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import FirebaseConfigWarning from '@/components/FirebaseConfigWarning'
import { isFirebaseConfigured } from '@/lib/firebase'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useRBAC } from '@/hooks/useRBAC'

export default function LoginPage() {
  const router = useRouter()
  const [isCleared, setIsCleared] = useState(false)
  const [showFirebaseWarning, setShowFirebaseWarning] = useState(false)
  const { user: firebaseUser } = useFirebaseAuth()
  const { user: rbacUser } = useRBAC(firebaseUser?.uid)

  // Don't auto-redirect - let user choose where to go
  // The AuthForm will handle redirections based on user choice

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

  // Show navigation options if user is already authenticated
  if (firebaseUser && rbacUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AvaliaNutri</h1>
            <p className="text-gray-600 mb-6">Você já está conectado!</p>
            <p className="text-sm text-gray-500 mb-8">
              Olá, {firebaseUser.displayName || firebaseUser.email}
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  // Navegação usando Next.js router para melhor performance
                  router.push('/professor')
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Acessar como Professor
              </button>
              
              <button
                onClick={() => {
                  // Navegação usando Next.js router para melhor performance
                  router.push('/jogos')
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Acessar como Estudante
              </button>
              
              <button
                onClick={async () => {
                  // Clear authentication and reload
                  if (typeof window !== 'undefined') {
                    const cookiesToClear = ['guest-mode', 'professor-guest-mode', 'auth-token', 'firebase-auth-token', 'user-role', 'user-session'];
                    cookiesToClear.forEach(cookieName => {
                      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                    });
                    localStorage.clear();
                    sessionStorage.clear();
                  }
                  window.location.reload();
                }}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Fazer Login com Outra Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show login form for unauthenticated users
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
