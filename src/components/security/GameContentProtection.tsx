'use client'

import React, { useEffect, useState } from 'react'
import { ContentProtection } from './ContentProtection'
import { useRBAC } from '@/hooks/useRBAC'

interface GameContentProtectionProps {
  children: React.ReactNode
  gameId: number
  gameTitle: string
  enableScreenshotProtection?: boolean
  enableCopyProtection?: boolean
  enableDevToolsProtection?: boolean
  customWatermark?: string
}

export function GameContentProtection({
  children,
  gameId,
  gameTitle,
  enableScreenshotProtection = true,
  enableCopyProtection = true,
  enableDevToolsProtection = true,
  customWatermark
}: GameContentProtectionProps) {
  const { user } = useRBAC()
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9))
  const [accessTime] = useState(() => new Date())

  // Log access for security monitoring
  useEffect(() => {
    const logAccess = () => {
      const accessLog = {
        userId: user?.id || 'anonymous',
        userEmail: user?.email || 'anonymous',
        gameId,
        gameTitle,
        sessionId,
        accessTime: accessTime.toISOString(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }

      // Store in localStorage for now (in production, send to server)
      const existingLogs = JSON.parse(localStorage.getItem('game-access-logs') || '[]')
      existingLogs.push(accessLog)
      
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100)
      }
      
      localStorage.setItem('game-access-logs', JSON.stringify(existingLogs))
    }

    logAccess()
  }, [gameId, gameTitle, sessionId, accessTime, user])

  // Generate dynamic watermark
  const getGameWatermark = () => {
    if (customWatermark) return customWatermark
    
    const userInfo = user?.anonymousId || user?.email?.split('@')[0] || 'Usuário'
    const date = new Date().toLocaleDateString('pt-BR')
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    
    return `${gameTitle} - ${userInfo} - ${date} ${time}`
  }

  // Enhanced protection for educational content
  const protectionConfig = {
    enableProtection: true,
    watermarkText: getGameWatermark(),
    blurOnPrintScreen: enableScreenshotProtection,
    disableRightClick: enableCopyProtection,
    disableTextSelection: enableCopyProtection,
    disableDevTools: enableDevToolsProtection
  }

  return (
    <ContentProtection {...protectionConfig}>
      <div className="game-content-wrapper">
        {/* Session info for tracking */}
        <div className="hidden" data-session-id={sessionId} data-game-id={gameId} />
        
        {/* Protected game content */}
        <div className="relative">
          {children}
          
          {/* Invisible overlay to prevent some screenshot tools */}
          {enableScreenshotProtection && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-0"
              style={{
                background: 'linear-gradient(45deg, transparent 49%, rgba(255,255,255,0.01) 50%, transparent 51%)',
                backgroundSize: '2px 2px'
              }}
            />
          )}
        </div>

        {/* Educational content notice */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Conteúdo Educacional Protegido</p>
              <p className="text-xs mt-1">
                Este material é destinado exclusivamente para fins educacionais. 
                A reprodução, distribuição ou uso comercial é proibido.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ContentProtection>
  )
}

// Component for displaying protection status to professors
export function ProtectionStatus({ gameId }: { gameId: number }) {
  const [accessLogs, setAccessLogs] = useState<any[]>([])

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('game-access-logs') || '[]')
    const gameLogs = logs.filter((log: any) => log.gameId === gameId)
    setAccessLogs(gameLogs.slice(-10)) // Last 10 accesses
  }, [gameId])

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Status de Proteção</h4>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-100 p-3 rounded">
          <div className="text-green-800 text-sm font-medium">Proteções Ativas</div>
          <div className="text-green-600 text-xs mt-1">
            ✓ Anti-screenshot<br/>
            ✓ Anti-cópia<br/>
            ✓ Marca d'água<br/>
            ✓ Log de acesso
          </div>
        </div>
        
        <div className="bg-blue-100 p-3 rounded">
          <div className="text-blue-800 text-sm font-medium">Acessos Recentes</div>
          <div className="text-blue-600 text-xs mt-1">
            {accessLogs.length} acessos registrados
          </div>
        </div>
      </div>

      {accessLogs.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Últimos Acessos:</h5>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {accessLogs.map((log, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded">
                <div className="flex justify-between">
                  <span>{log.userEmail}</span>
                  <span>{new Date(log.accessTime).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for professors to manage protection settings
export function useGameProtectionSettings() {
  const [settings, setSettings] = useState({
    screenshotProtection: true,
    copyProtection: true,
    devToolsProtection: true,
    watermarkEnabled: true
  })

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('game-protection-settings', JSON.stringify(newSettings))
  }

  useEffect(() => {
    const saved = localStorage.getItem('game-protection-settings')
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading protection settings:', error)
      }
    }
  }, [])

  return {
    settings,
    updateSetting,
    toggleScreenshotProtection: () => updateSetting('screenshotProtection', !settings.screenshotProtection),
    toggleCopyProtection: () => updateSetting('copyProtection', !settings.copyProtection),
    toggleDevToolsProtection: () => updateSetting('devToolsProtection', !settings.devToolsProtection),
    toggleWatermark: () => updateSetting('watermarkEnabled', !settings.watermarkEnabled)
  }
}
