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
  const contentRef = useRef<HTMLDivElement>(null)
  const { user } = useRBAC()

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
        setIsBlurred(true)
        showProtectionWarning()
        setTimeout(() => setIsBlurred(false), 3000)
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
          showProtectionWarning()
          setIsBlurred(true)
          setTimeout(() => setIsBlurred(false), 2000)
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

  const showProtectionWarning = () => {
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 3000)
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
    WebkitTouchCallout: 'none' as const,
    pointerEvents: isBlurred ? 'none' as const : 'auto' as const
  } : {}

  return (
    <div 
      ref={contentRef}
      className={`relative ${isBlurred ? 'blur-lg' : ''} transition-all duration-300`}
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
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Conteúdo protegido!</span>
          </div>
        </div>
      )}

      {/* Blur overlay when protection is active */}
      {isBlurred && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md mx-4">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conteúdo Protegido
              </h3>
              <p className="text-gray-600 text-sm">
                Este conteúdo educacional é protegido contra cópia e captura de tela.
                O acesso será restaurado em alguns segundos.
              </p>
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
