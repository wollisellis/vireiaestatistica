'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
// Temporarily disabled for AvaliaNutri platform
// import { useAuth } from '@/hooks/useSupabase'
// import { t } from '@/lib/translations'

// Mock translation function
const t = (key: string) => {
  const translations: Record<string, string> = {
    'auth.validation.emailInvalid': 'Email inválido',
    'auth.validation.passwordMinLength': 'Senha deve ter pelo menos 6 caracteres',
    'auth.validation.fullNameMinLength': 'Nome deve ter pelo menos 2 caracteres',
    'auth.validation.passwordsDoNotMatch': 'Senhas não coincidem',
    'auth.validation.passwordsDontMatch': 'Senhas não coincidem'
  }
  return translations[key] || key
}

const signInSchema = z.object({
  email: z.string().email(t('auth.validation.emailInvalid')),
  password: z.string().min(6, t('auth.validation.passwordMinLength')),
})

const signUpSchema = signInSchema.extend({
  fullName: z.string().min(2, t('auth.validation.fullNameMinLength')),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordsDontMatch'),
  path: ["confirmPassword"],
})

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [, setIsGuest] = useState(false)

  // Mock auth functions for AvaliaNutri platform
  const signIn = async (email: string, password: string) => {
    console.log('Mock sign in:', email, password)
    return { error: null, success: true }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Mock sign up:', email, password, fullName)
    return { error: null, success: true }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await signUp(data.email, data.password, data.fullName)
        if (error) throw error
      } else {
        const { error } = await signIn(data.email, data.password)
        if (error) throw error
      }
    } catch (err: unknown) {
      setError((err as Error).message || t('auth.errors.unknownError'))
    } finally {
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    setIsGuest(true)
    // This will trigger the parent component to show the dashboard with mock data
    // We'll handle this in the main page component
    localStorage.setItem('guest-mode', 'true')
    window.location.reload()
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    reset()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? t('auth.startYourJourney')
                  : t('auth.signInToContinue')
                }
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.fullName')}
                  </label>
                  <input
                    {...register('fullName')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('auth.enterFullName')}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.fullName.message)}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('auth.enterEmail')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.password')}
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('auth.enterPassword')}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>
                )}
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('auth.confirmYourPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.confirmPassword.message)}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                {isSignUp ? t('auth.signUp') : t('auth.signIn')}
              </Button>
            </form>

            {/* Guest Access Option */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleGuestAccess}
              >
                {t('auth.continueAsGuest')}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-2">
                {t('auth.guestModeDescription')}
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isSignUp
                  ? t('auth.alreadyHaveAccount')
                  : t('auth.dontHaveAccount')
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
