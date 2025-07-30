'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SimplifiedProfessorDashboard from '@/components/professor/SimplifiedProfessorDashboard'
import { ProfessorCodeModal } from '@/components/auth/ProfessorCodeModal'
import { useProfessorAccess } from '@/hooks/useProfessorAccess'
import { Loader2 } from 'lucide-react'

export default function DocentePage() {
  const router = useRouter()
  const { hasAccess, isChecking, validateCode } = useProfessorAccess()
  const [showCodeModal, setShowCodeModal] = useState(false)

  useEffect(() => {
    // Quando terminar de verificar, mostrar modal se não tem acesso
    if (!isChecking && !hasAccess) {
      setShowCodeModal(true)
    }
  }, [isChecking, hasAccess])

  const handleCodeSuccess = () => {
    validateCode()
    setShowCodeModal(false)
  }

  const handleCodeCancel = () => {
    setShowCodeModal(false)
    router.push('/')
  }

  // Mostrar loading enquanto verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Verificando acesso...</span>
        </div>
      </div>
    )
  }

  // Se tem acesso, mostrar dashboard
  if (hasAccess) {
    return <SimplifiedProfessorDashboard />
  }

  // Caso contrário, mostrar modal (e tela vazia por trás)
  return (
    <>
      <div className="min-h-screen bg-gray-50" />
      <ProfessorCodeModal
        isOpen={showCodeModal}
        onSuccess={handleCodeSuccess}
        onCancel={handleCodeCancel}
      />
    </>
  )
}