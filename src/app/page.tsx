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
  const [isReady, setIsReady] = useState(false)
  const [showFirebaseWarning, setShowFirebaseWarning] = useState(false)
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth()
  const { user: rbacUser } = useRBAC(firebaseUser?.uid)

  // Otimização: Verificar autenticação apenas uma vez
  useEffect(() => {
    if (firebaseLoading) return // Aguardar carregamento do Firebase

    // Verificação simplificada de autenticação
    const hasExistingSession = firebaseUser || rbacUser || document.cookie.includes('auth-token=')
    
    if (!hasExistingSession && typeof window !== 'undefined') {
      // Limpeza rápida apenas quando necessário
      const cookiesToClear = ['auth-token', 'firebase-auth-token', 'user-role', 'user-session']
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Limpeza básica do localStorage
      ['firebase-auth-token', 'user-data', 'auth-state'].forEach(key => {
        localStorage.removeItem(key)
      })
    }

    // Verificação do Firebase configurado apenas se necessário
    if (!isFirebaseConfigured()) {
      setShowFirebaseWarning(true)
    }

    setIsReady(true)
  }, [firebaseUser, rbacUser, firebaseLoading])

  // Loading otimizado
  if (!isReady || firebaseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-emerald-800">Carregando AvaliaNutri...</h2>
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
