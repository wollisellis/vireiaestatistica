'use client'

import { useAuth } from '@/hooks/useSupabase'
import { AuthForm } from '@/components/auth/AuthForm'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()

  // Check for guest mode
  const isGuestMode = typeof window !== 'undefined' && localStorage.getItem('guest-mode') === 'true'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user && !isGuestMode) {
    return <AuthForm />
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
