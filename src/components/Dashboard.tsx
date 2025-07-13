'use client'

import React from 'react'
import { useRBAC } from '@/hooks/useRBAC'
import { ProfessorDashboard } from '@/components/dashboard/ProfessorDashboard'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'

export function Dashboard() {
  const { user, loading } = useRBAC()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acesso Negado
          </h2>
          <p className="text-gray-600">
            Você precisa estar logado para acessar o dashboard.
          </p>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  if (user.role === 'professor') {
    return <ProfessorDashboard />
  }

  return <StudentDashboard />
}
