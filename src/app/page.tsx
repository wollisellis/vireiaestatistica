'use client'

import React, { useEffect, useState } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { AuthForm } from '@/components/auth/AuthForm'
import { Dashboard } from '@/components/Dashboard'
import { Layout } from '@/components/layout/Layout'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'

export default function HomePage() {
  const { user, loading } = useFirebaseAuth()
  const [isGuestMode, setIsGuestMode] = useState(false)

  useEffect(() => {
    // Check for guest mode
    const guestMode = localStorage.getItem('guest-mode')
    if (guestMode === 'true') {
      setIsGuestMode(true)
    }
  }, [])

  if (loading) {
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

  // Show authentication form if user is not logged in and not in guest mode
  if (!user && !isGuestMode) {
    return <AuthForm />
  }

  // Show main application
  return (
    <StudentProgressProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </StudentProgressProvider>
  )
}
