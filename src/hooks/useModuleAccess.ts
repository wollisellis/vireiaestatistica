import { useState, useEffect } from 'react'

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

export function useModuleAccess(): ModuleAccessHook {
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
