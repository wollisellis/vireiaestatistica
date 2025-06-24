'use client'

import React, { useState } from 'react'
import { Navigation } from './Navigation'
import { useAuth } from '@/hooks/useSupabase'
import { HelpSystem } from '@/components/ui/HelpSystem'
import { BeginnerGlossary } from '@/components/ui/BeginnerGlossary'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { loading } = useAuth()
  const [showHelp, setShowHelp] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        onShowHelp={() => setShowHelp(true)}
        onShowGlossary={() => setShowGlossary(true)}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Help System */}
      <HelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Beginner Glossary */}
      <BeginnerGlossary
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />
    </div>
  )
}
