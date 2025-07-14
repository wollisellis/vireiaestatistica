'use client'

import React, { useEffect, useState } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { AuthForm } from '@/components/auth/AuthForm'
import { useRBAC } from '@/hooks/useRBAC'

export default function LoginPage() {
  const { user, loading } = useFirebaseAuth()
  const { user: rbacUser, loading: rbacLoading } = useRBAC()

  // Check for authenticated users and redirect them
  useEffect(() => {
    if (!loading && !rbacLoading && (user || rbacUser)) {
      // Redirect professors to /professor dashboard
      if (rbacUser && rbacUser.role === 'professor') {
        if (typeof window !== 'undefined') {
          window.location.href = '/professor'
        }
      }
      // Redirect students to /jogos dashboard
      else if (rbacUser && rbacUser.role === 'student') {
        if (typeof window !== 'undefined') {
          window.location.href = '/jogos'
        }
      }
    }
  }, [user, rbacUser, loading, rbacLoading])

  if (loading || rbacLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando AvaliaNutri...</h2>
          <p className="text-gray-500 mt-2">Preparando sua experiência de aprendizagem</p>
        </div>
      </div>
    )
  }

  // Show redirecting message for authenticated users
  if (user || rbacUser) {
    const redirectMessage = rbacUser && rbacUser.role === 'professor'
      ? 'Redirecionando para Dashboard do Professor...'
      : 'Redirecionando para Jogos...'

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">{redirectMessage}</h2>
        </div>
      </div>
    )
  }

  // Show login form for unauthenticated users
  return <AuthForm />
}
