'use client'

import React, { useEffect, useState } from 'react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { ProfessorDashboard } from '@/components/dashboard/ProfessorDashboard'
import { useRBAC } from '@/hooks/useRBAC'
import { Layout } from '@/components/layout/Layout'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'
import { FirebaseDataProvider } from '@/contexts/FirebaseDataContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Lock } from 'lucide-react'

export default function ProfessorDashboardPage() {
  const { user, loading } = useFirebaseAuth()
  const { user: rbacUser, loading: rbacLoading } = useRBAC(user?.uid)
  const [isProfessorGuest, setIsProfessorGuest] = useState(false)

  useEffect(() => {
    // Check for professor guest mode via cookie
    if (typeof window !== 'undefined') {
      const professorGuestCookie = document.cookie.split(';').find(cookie =>
        cookie.trim().startsWith('professor-guest-mode=')
      )
      if (professorGuestCookie?.split('=')[1] === 'true') {
        setIsProfessorGuest(true)
      }
    }
  }, [])

  if (loading || rbacLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando Dashboard do Professor...</h2>
          <p className="text-gray-500 mt-2">Preparando sua experiência de ensino</p>
        </div>
      </div>
    )
  }

  // Check if user has professor access (authenticated professor or professor guest)
  // Also allow access if user is authenticated but profile is still loading
  const hasAccess = (rbacUser && rbacUser.role === 'professor') ||
                   isProfessorGuest ||
                   (user && !rbacLoading && !rbacUser) // Authenticated but profile not loaded yet

  // Check for student guest mode
  const isStudentGuest = typeof window !== 'undefined' &&
    document.cookie.split(';').some(cookie => cookie.trim().startsWith('guest-mode=true'))

  // Redirect students (including student guests) to /jogos
  if ((rbacUser && rbacUser.role === 'student' && rbacUser.id !== 'professor-guest-user') || isStudentGuest) {
    if (typeof window !== 'undefined') {
      window.location.href = '/jogos'
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Redirecionando para Jogos...</h2>
        </div>
      </div>
    )
  }

  // Show access denied if user doesn't have professor access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acesso Restrito
          </h2>
          <p className="text-gray-600 mb-6">
            Esta área é exclusiva para professores. Você precisa estar logado com uma conta de professor para acessar o dashboard.
          </p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Voltar ao Login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show professor dashboard
  return (
    <FirebaseDataProvider>
      <StudentProgressProvider>
        <Layout>
          <ProfessorDashboard />
        </Layout>
      </StudentProgressProvider>
    </FirebaseDataProvider>
  )
}
