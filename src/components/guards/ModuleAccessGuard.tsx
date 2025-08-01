'use client'

import React from 'react'
import { useModuleAccess } from '@/hooks/useModuleAccess'
import { Loader2, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

interface ModuleAccessGuardProps {
  moduleId: string
  children: React.ReactNode
  loadingMessage?: string
  blockedMessage?: string
}

export function ModuleAccessGuard({
  moduleId,
  children,
  loadingMessage = 'Verificando permissões...',
  blockedMessage = 'Este módulo está bloqueado'
}: ModuleAccessGuardProps) {
  const { hasAccess, isLoading, isRedirecting, error } = useModuleAccess(moduleId)

  // Mostrar loading enquanto verifica permissões
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-gray-700">{loadingMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mostrar mensagem de bloqueio enquanto redireciona
  if (!hasAccess || isRedirecting || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Módulo Bloqueado
            </h2>
            <p className="text-gray-700 mb-4">
              {error || blockedMessage}
            </p>
            <p className="text-sm text-gray-500">
              Você será redirecionado em instantes...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se tem acesso, renderizar o conteúdo
  return <>{children}</>
}

export default ModuleAccessGuard