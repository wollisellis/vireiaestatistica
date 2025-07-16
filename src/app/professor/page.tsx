'use client'

import React from 'react'
import { useProfessorAccess } from '@/hooks/useRoleRedirect'
import { ProfessorDashboard } from '@/components/dashboard/ProfessorDashboard'
import { Layout } from '@/components/layout/Layout'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'
import { FirebaseDataProvider } from '@/contexts/FirebaseDataContext'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Lock } from 'lucide-react'

export default function ProfessorDashboardPage() {
  const { user, loading, hasAccess } = useProfessorAccess(true)

  if (loading) {
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

  // Show access denied if user doesn't have professor access
  if (!hasAccess()) {
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
