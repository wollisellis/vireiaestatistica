'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Gamepad2,
  Trophy,
  User,
  BookOpen,
  BarChart3,
  LogOut,
  HelpCircle,
  Book
} from 'lucide-react'
import { useAuth } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/Button'
import { t } from '@/lib/translations'

const navigationItems = [
  { href: '/', label: t('navigation.home'), icon: Home },
  { href: '/games', label: t('navigation.games'), icon: Gamepad2 },
  { href: '/progress', label: t('navigation.progress'), icon: BarChart3 },
  { href: '/leaderboard', label: t('navigation.leaderboard'), icon: Trophy },
  { href: '/learn', label: t('navigation.learn'), icon: BookOpen },
  { href: '/profile', label: t('navigation.profile'), icon: User },
]

interface NavigationProps {
  onShowHelp?: () => void
  onShowGlossary?: () => void
}

export function Navigation({ onShowHelp, onShowGlossary }: NavigationProps = {}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-gray-900">{t('academic.platformName')}</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                )
              })}

              {/* Help and Glossary Buttons */}
              {onShowGlossary && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowGlossary}
                  className="flex items-center space-x-1"
                  title="Glossário para Iniciantes"
                >
                  <Book className="w-4 h-4" />
                  <span>Glossário</span>
                </Button>
              )}

              {onShowHelp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowHelp}
                  className="flex items-center space-x-1"
                  title="Central de Ajuda"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ajuda</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('auth.signOut')}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
