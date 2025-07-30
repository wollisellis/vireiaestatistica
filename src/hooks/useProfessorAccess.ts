'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useProfessorAccess() {
  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = () => {
    // Verificar se o código já foi validado
    const validated = localStorage.getItem('professor-code-validated')
    const timestamp = localStorage.getItem('professor-code-timestamp')
    
    if (validated === 'true' && timestamp) {
      // Verificar se a validação não é muito antiga (30 dias)
      const validationDate = new Date(timestamp)
      const now = new Date()
      const daysDiff = (now.getTime() - validationDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (daysDiff <= 30) {
        setHasAccess(true)
      } else {
        // Limpar validação antiga
        localStorage.removeItem('professor-code-validated')
        localStorage.removeItem('professor-code-timestamp')
        setHasAccess(false)
      }
    } else {
      setHasAccess(false)
    }
    
    setIsChecking(false)
  }

  const validateCode = () => {
    setHasAccess(true)
  }

  const revokeAccess = () => {
    localStorage.removeItem('professor-code-validated')
    localStorage.removeItem('professor-code-timestamp')
    setHasAccess(false)
    router.push('/')
  }

  return {
    hasAccess,
    isChecking,
    validateCode,
    revokeAccess,
    checkAccess
  }
}