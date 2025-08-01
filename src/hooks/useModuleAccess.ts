'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from './useFirebaseAuth'
import ProfessorClassService from '@/services/professorClassService'
import { toast } from 'react-hot-toast'

interface ModuleAccessResult {
  hasAccess: boolean
  isLoading: boolean
  isRedirecting: boolean
  error: string | null
}

/**
 * Hook para verificar acesso a um módulo específico
 * Redireciona para /jogos se o módulo estiver bloqueado
 */
export function useModuleAccess(moduleId: string): ModuleAccessResult {
  const router = useRouter()
  const { user, loading: authLoading } = useFirebaseAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Aguardar autenticação
    if (authLoading) {
      return
    }

    // Se não está autenticado, redirecionar para login
    if (!user) {
      console.log('🚫 [useModuleAccess] Usuário não autenticado - redirecionando para login')
      setIsRedirecting(true)
      router.push('/')
      return
    }

    // Verificar acesso ao módulo
    checkModuleAccess()
  }, [user, authLoading, moduleId])

  const checkModuleAccess = async () => {
    if (!user?.id || !moduleId) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log(`🔍 [useModuleAccess] Verificando acesso ao módulo ${moduleId}`)
      
      const hasAccess = await ProfessorClassService.isModuleAvailableForStudent(
        user.id,
        moduleId
      )

      setHasAccess(hasAccess)

      if (!hasAccess) {
        console.log(`🔒 [useModuleAccess] Acesso negado ao módulo ${moduleId}`)
        
        // Mostrar mensagem ao usuário
        toast.error(
          '🔒 Módulo bloqueado - Este módulo ainda não está disponível para você.',
          {
            duration: 4000,
            icon: '🚫',
          }
        )

        // Redirecionar após um pequeno delay para mostrar a mensagem
        setIsRedirecting(true)
        setTimeout(() => {
          router.push('/jogos')
        }, 1500)
      } else {
        console.log(`✅ [useModuleAccess] Acesso permitido ao módulo ${moduleId}`)
      }
    } catch (error) {
      console.error('❌ [useModuleAccess] Erro ao verificar acesso:', error)
      setError('Erro ao verificar permissões')
      
      // Em caso de erro, ser restritivo e redirecionar
      toast.error('Erro ao verificar permissões. Redirecionando...')
      setIsRedirecting(true)
      setTimeout(() => {
        router.push('/jogos')
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    hasAccess,
    isLoading: isLoading || authLoading,
    isRedirecting,
    error
  }
}

// Manter o hook antigo para compatibilidade (pode ser removido futuramente)
interface ModuleSettings {
  moduleId: string
  isLocked: boolean
  unlockDate?: string
}

interface ModuleAccessHook {
  moduleSettings: ModuleSettings[]
  isModuleLocked: (moduleId: string) => boolean
  canAccessModule: (moduleId: string) => boolean
  loading: boolean
}

export function useModuleAccessLegacy(): ModuleAccessHook {
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = () => {
      // Try to get module settings from localStorage first (for persistence)
      const savedSettings = localStorage.getItem('nt600-module-settings')

      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setModuleSettings(parsed)
          setLoading(false)
          return
        } catch (error) {
          console.error('Error parsing saved module settings:', error)
        }
      }

      // Fallback to default settings
      setDefaultSettings()
      setLoading(false)
    }

    loadSettings()

    // Listen for storage changes to sync settings across components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nt600-module-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue)
          setModuleSettings(newSettings)
        } catch (error) {
          console.error('Error parsing storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const setDefaultSettings = () => {
    const defaultSettings: ModuleSettings[] = [
      { moduleId: 'module-1', isLocked: false }, // Anthropometric Assessment - always unlocked
      { moduleId: 'module-2', isLocked: true },  // Clinical Assessment - locked by default
      { moduleId: 'module-3', isLocked: true },  // Socioeconomic Assessment - locked by default
      { moduleId: 'module-4', isLocked: false }  // Growth Curves - unlocked by default
    ]
    setModuleSettings(defaultSettings)
    localStorage.setItem('nt600-module-settings', JSON.stringify(defaultSettings))
  }

  const isModuleLocked = (moduleId: string): boolean => {
    const setting = moduleSettings.find(m => m.moduleId === moduleId)
    return setting?.isLocked || false
  }

  const canAccessModule = (moduleId: string): boolean => {
    return !isModuleLocked(moduleId)
  }

  return {
    moduleSettings,
    isModuleLocked,
    canAccessModule,
    loading
  }
}

// Hook to update module settings (for professors)
export function useModuleManagement() {
  const toggleModuleLock = (moduleId: string) => {
    const savedSettings = localStorage.getItem('nt600-module-settings')
    if (savedSettings) {
      try {
        const settings: ModuleSettings[] = JSON.parse(savedSettings)
        const updatedSettings = settings.map(setting =>
          setting.moduleId === moduleId
            ? { ...setting, isLocked: !setting.isLocked }
            : setting
        )
        localStorage.setItem('nt600-module-settings', JSON.stringify(updatedSettings))
        
        // Trigger a storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'nt600-module-settings',
          newValue: JSON.stringify(updatedSettings)
        }))
      } catch (error) {
        console.error('Error updating module settings:', error)
      }
    }
  }

  const unlockModule = (moduleId: string) => {
    const savedSettings = localStorage.getItem('nt600-module-settings')
    if (savedSettings) {
      try {
        const settings: ModuleSettings[] = JSON.parse(savedSettings)
        const updatedSettings = settings.map(setting =>
          setting.moduleId === moduleId
            ? { ...setting, isLocked: false, unlockDate: new Date().toISOString() }
            : setting
        )
        localStorage.setItem('nt600-module-settings', JSON.stringify(updatedSettings))
        
        // Trigger a storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'nt600-module-settings',
          newValue: JSON.stringify(updatedSettings)
        }))
      } catch (error) {
        console.error('Error unlocking module:', error)
      }
    }
  }

  const lockModule = (moduleId: string) => {
    const savedSettings = localStorage.getItem('nt600-module-settings')
    if (savedSettings) {
      try {
        const settings: ModuleSettings[] = JSON.parse(savedSettings)
        const updatedSettings = settings.map(setting =>
          setting.moduleId === moduleId
            ? { ...setting, isLocked: true, unlockDate: undefined }
            : setting
        )
        localStorage.setItem('nt600-module-settings', JSON.stringify(updatedSettings))
        
        // Trigger a storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'nt600-module-settings',
          newValue: JSON.stringify(updatedSettings)
        }))
      } catch (error) {
        console.error('Error locking module:', error)
      }
    }
  }

  return {
    toggleModuleLock,
    unlockModule,
    lockModule
  }
}
