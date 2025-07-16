'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRBAC } from '@/hooks/useRBAC'

interface ContentProtectionProps {
  children: React.ReactNode
  enableProtection?: boolean
  watermarkText?: string
  blurOnPrintScreen?: boolean
  disableRightClick?: boolean
  disableTextSelection?: boolean
  disableDevTools?: boolean
}

export function ContentProtection({
  children,
  enableProtection = true,
  watermarkText,
  blurOnPrintScreen = true,
  disableRightClick = true,
  disableTextSelection = true,
  disableDevTools = true
}: ContentProtectionProps) {
  const [isBlurred, setIsBlurred] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const [suspiciousActivity, setSuspiciousActivity] = useState(false)
  const [blurReason, setBlurReason] = useState<'printscreen' | 'focus_lost' | 'devtools' | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { user } = useRBAC()
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const printScreenTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!enableProtection) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common copy/paste shortcuts
      if (e.ctrlKey && ['c', 'v', 'a', 's', 'u', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        showProtectionWarning()
        return false
      }

      // Disable F12 (DevTools)
      if (disableDevTools && e.key === 'F12') {
        e.preventDefault()
        showProtectionWarning()
        return false
      }

      // Handle PrintScreen
      if (blurOnPrintScreen && e.key === 'PrintScreen') {
        e.preventDefault()
        setBlurReason('printscreen')
        setIsBlurred(true)
        setShowWarning(true)
        setSuspiciousActivity(true)

        // Log específico para PrintScreen
        console.log('🚨 TENTATIVA DE PRINTSCREEN DETECTADA!', {
          timestamp: new Date().toISOString(),
          key: e.key,
          userAgent: navigator.userAgent
        })

        // Remove blur após 3 segundos para PrintScreen
        if (printScreenTimeoutRef.current) {
          clearTimeout(printScreenTimeoutRef.current)
        }
        printScreenTimeoutRef.current = setTimeout(() => {
          setIsBlurred(false)
          setShowWarning(false)
          setBlurReason(null)
          setSuspiciousActivity(false)
        }, 3000)

        return false
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault()
        showProtectionWarning()
        return false
      }
    }

    const handleSelectStart = (e: Event) => {
      if (disableTextSelection) {
        e.preventDefault()
        return false
      }
    }

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)

    // Disable DevTools detection (basic)
    if (disableDevTools) {
      const detectDevTools = () => {
        const threshold = 160
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {

          // Só aplica se não há outro motivo ativo
          if (!blurReason || blurReason === 'devtools') {
            setBlurReason('devtools')
            setIsBlurred(true)
            setShowWarning(true)
            setSuspiciousActivity(true)

            console.log('🚨 DEVTOOLS DETECTADO!', {
              timestamp: new Date().toISOString(),
              windowSize: { outer: { width: window.outerWidth, height: window.outerHeight }, inner: { width: window.innerWidth, height: window.innerHeight } }
            })

            setTimeout(() => {
              if (blurReason === 'devtools') {
                setIsBlurred(false)
                setShowWarning(false)
                setBlurReason(null)
                setSuspiciousActivity(false)
              }
            }, 2000)
          }
        }
      }

      const interval = setInterval(detectDevTools, 1000)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('selectstart', handleSelectStart)
        document.removeEventListener('dragstart', handleDragStart)
        clearInterval(interval)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [enableProtection, blurOnPrintScreen, disableRightClick, disableTextSelection, disableDevTools])

  // Detecta perda de foco da janela/aba (proteção contra captura)
  useEffect(() => {
    if (!enableProtection) return

    const handleWindowFocus = () => {
      setIsWindowFocused(true)

      // Remove ofuscação quando volta o foco, mas só se foi causada por perda de foco
      if (blurReason === 'focus_lost') {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current)
          blurTimeoutRef.current = null
        }

        // Restaura imediatamente quando volta o foco
        setIsBlurred(false)
        setShowWarning(false)
        setBlurReason(null)
        setSuspiciousActivity(false)
      }
    }

    const handleWindowBlur = () => {
      setIsWindowFocused(false)

      // Só aplica ofuscação por perda de foco se não há outro motivo ativo
      if (!blurReason || blurReason === 'focus_lost') {
        setBlurReason('focus_lost')
        setSuspiciousActivity(true)
        setIsBlurred(true)
        setShowWarning(true)

        // Log da atividade suspeita
        console.log('🚨 PERDA DE FOCO DETECTADA - Possível tentativa de captura', {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWindowBlur()
      } else {
        handleWindowFocus()
      }
    }

    // Eventos de foco da janela
    window.addEventListener('focus', handleWindowFocus)
    window.addEventListener('blur', handleWindowBlur)

    // Evento de mudança de visibilidade da aba
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleWindowFocus)
      window.removeEventListener('blur', handleWindowBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      if (printScreenTimeoutRef.current) {
        clearTimeout(printScreenTimeoutRef.current)
      }
    }
  }, [enableProtection])

  const showProtectionWarning = () => {
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 3000)
  }

  const handleRestoreContent = () => {
    console.log('🔄 Botão clicado - Restaurando conteúdo...')

    setIsBlurred(false)
    setShowWarning(false)
    setBlurReason(null)
    setSuspiciousActivity(false)

    // Limpa todos os timeouts
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    if (printScreenTimeoutRef.current) {
      clearTimeout(printScreenTimeoutRef.current)
      printScreenTimeoutRef.current = null
    }

    console.log('✅ Conteúdo restaurado com sucesso!')
  }

  const getWatermarkText = () => {
    if (watermarkText) return watermarkText
    if (user?.email) return `${user.email} - ${new Date().toLocaleDateString()}`
    return `AvaliaNutri - ${new Date().toLocaleDateString()}`
  }

  const protectionStyles = enableProtection ? {
    userSelect: disableTextSelection ? 'none' as const : 'auto' as const,
    WebkitUserSelect: disableTextSelection ? 'none' as const : 'auto' as const,
    MozUserSelect: disableTextSelection ? 'none' as const : 'auto' as const,
    msUserSelect: disableTextSelection ? 'none' as const : 'auto' as const,
    WebkitUserDrag: 'none' as const,
    WebkitTouchCallout: 'none' as const
    // Removido pointerEvents para permitir cliques no overlay
  } : {}

  return (
    <div
      ref={contentRef}
      className={`relative ${isBlurred ? 'blur-sm opacity-50' : ''} transition-all duration-500`}
      style={protectionStyles}
    >
      {/* Watermark */}
      {enableProtection && (
        <div 
          className="fixed inset-0 pointer-events-none z-10 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'>
                <text x='50%' y='50%' font-family='Arial' font-size='16' fill='%23000000' text-anchor='middle' transform='rotate(-45 150 150)'>
                  ${getWatermarkText()}
                </text>
              </svg>
            `)}")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '300px 300px'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>

      {/* Protection Warning */}
      {showWarning && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 border border-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-medium">
                {blurReason === 'printscreen' && '🛡️ Captura Bloqueada'}
                {blurReason === 'focus_lost' && '👁️ Foco Perdido'}
                {blurReason === 'devtools' && '🔧 DevTools Detectado'}
                {!blurReason && '🛡️ Conteúdo Protegido'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Blur overlay when protection is active */}
      {isBlurred && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full mx-4 border border-gray-200"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 text-blue-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>

                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  🛡️ Conteúdo Protegido
                </h3>

                <p className="text-gray-700 text-base mb-6">
                  Identificamos que você saiu da página. O conteúdo foi temporariamente ofuscado para proteção.
                </p>
              </div>

              <button
                onClick={handleRestoreContent}
                onMouseDown={handleRestoreContent}
                onTouchStart={handleRestoreContent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                style={{ pointerEvents: 'auto', zIndex: 9999 }}
                type="button"
              >
                Clique aqui para voltar
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>AvaliaNutri - Sistema de Proteção</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook para usar proteção de conteúdo
export function useContentProtection() {
  const [protectionEnabled, setProtectionEnabled] = useState(true)

  const toggleProtection = () => {
    setProtectionEnabled(!protectionEnabled)
  }

  const enableProtection = () => {
    setProtectionEnabled(true)
  }

  const disableProtection = () => {
    setProtectionEnabled(false)
  }

  return {
    protectionEnabled,
    toggleProtection,
    enableProtection,
    disableProtection
  }
}
