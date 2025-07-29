'use client'

import React from 'react'
import { ModuleProgressProvider } from '@/contexts/ModuleProgressContext'
import { useFlexibleAccess } from '@/hooks/useRoleRedirect'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Shield, GraduationCap, LogOut, Home } from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import Link from 'next/link'

interface DocenteLayoutProps {
  children: React.ReactNode
}

export default function DocenteLayout({ children }: DocenteLayoutProps) {
  const { user, loading, hasAccess, isProfessor } = useFlexibleAccess()
  const { signOut } = useFirebaseAuth()

  const handleLogout = async () => {
    try {
      // Limpeza eficiente de autenticação
      const cookiesToClear = ['guest-mode', 'professor-guest-mode', 'auth-token', 'firebase-auth-token', 'user-role', 'user-session']
      const localStorageKeysToRemove = ['guest-mode', 'professor-guest-mode', 'firebase-auth-token', 'user-data', 'auth-state']

      // Limpar cookies
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })

      // Limpar localStorage
      localStorageKeysToRemove.forEach(key => localStorage.removeItem(key))
      sessionStorage.clear()

      // Sign out do Firebase (se não for usuário convidado)
      if (user && user.id !== 'professor-guest-user') {
        await signOut()
      }

      // Redirecionamento
      window.location.href = '/'
    } catch (error) {
      console.error('Erro no logout:', error)
      window.location.href = '/' // Sempre redirecionar em caso de erro
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-emerald-800">Carregando Dashboard Docente...</h2>
          <p className="text-emerald-600 text-sm mt-2">Verificando permissões</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="p-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Restrito - Dashboard Docente
              </h1>
              <p className="text-gray-600 mb-6">
                Esta é uma área exclusiva para docentes. Faça login com suas credenciais de professor.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full">
                    Fazer Login como Professor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ModuleProgressProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header Simplificado */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo e Título */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">AvaliaNutri</h1>
                    <p className="text-xs text-gray-600 hidden sm:block">Dashboard Docente</p>
                  </div>
                </div>
                <Badge variant="info" className="hidden lg:inline-flex">
                  Visão Simplificada
                </Badge>
              </div>

              {/* Navigation e User Info */}
              <div className="flex items-center space-x-4">
                {/* Navigation Links */}

                {/* User Info */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Olá,</span>
                  <span className="font-medium">
                    {user.fullName ? 
                      `Prof. ${user.fullName.split(' ')[0]}` : 
                      'Docente'
                    }
                  </span>
                </div>
                
                {/* Logout */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  title="Sair e voltar ao login"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>
                AvaliaNutri - Dashboard Docente Simplificado
                <br />
                UNICAMP - Faculdade de Ciências da Saúde - Desenvolvido por Ellis Abhulime
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ModuleProgressProvider>
  )
}