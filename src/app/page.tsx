'use client'

import React, { useEffect, useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  const [isCleared, setIsCleared] = useState(false)

  // Clear any authentication state when accessing login page to ensure clean state
  useEffect(() => {
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
      }, 100)
    } else {
      setIsCleared(true)
    }
  }, [])

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
  return <AuthForm />
}
