'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

// Mock translation function
const t = (key: string) => {
  const translations: Record<string, string> = {
    'auth.validation.emailInvalid': 'Email inválido',
    'auth.validation.passwordMinLength': 'Senha deve ter pelo menos 6 caracteres',
    'auth.validation.fullNameMinLength': 'Nome deve ter pelo menos 2 caracteres',
    'auth.validation.passwordsDoNotMatch': 'Senhas não coincidem',
    'auth.validation.passwordsDontMatch': 'Senhas não coincidem',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.fullName': 'Nome Completo',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.signIn': 'Entrar',
    'auth.signUp': 'Cadastrar',
    'auth.enterEmail': 'Digite seu email',
    'auth.enterPassword': 'Digite sua senha',
    'auth.enterFullName': 'Digite seu nome completo',
    'auth.confirmYourPassword': 'Confirme sua senha',
    'auth.continueAsGuest': 'Continuar como Visitante',
    'auth.guestModeDescription': 'Acesso limitado para demonstração',
    'auth.alreadyHaveAccount': 'Já tem uma conta? Faça login',
    'auth.dontHaveAccount': 'Não tem uma conta? Cadastre-se'
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
  role: z.enum(['student', 'professor']),
  courseCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordsDontMatch'),
  path: ["confirmPassword"],
}).refine((data) => {
  // Course code is required for students
  if (data.role === 'student' && !data.courseCode) {
    return false
  }
  return true
}, {
  message: 'Código do curso é obrigatório para estudantes',
  path: ["courseCode"],
})

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor'>('student')
  const { signIn, signUp } = useFirebaseAuth()

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
        const { error } = await signUp(
          data.email,
          data.password,
          data.fullName,
          data.role || selectedRole,
          data.courseCode
        )
        if (error) throw new Error(error.message)

        // Redirect to dashboard after successful registration
        window.location.reload()
      } else {
        const { error } = await signIn(data.email, data.password)
        if (error) throw new Error(error.message)

        // Redirect to dashboard after successful login
        window.location.reload()
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Erro desconhecido')
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
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Usuário
                    </label>
                    <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'student' | 'professor')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Estudante</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" {...register('role')} value={selectedRole} />
                  </div>

                  {selectedRole === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código do Curso
                      </label>
                      <input
                        {...register('courseCode')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: NT600"
                      />
                      {errors.courseCode && (
                        <p className="text-red-500 text-sm mt-1">{String(errors.courseCode.message)}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Solicite o código do curso ao seu professor
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      {...register('confirmPassword')}
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirme sua senha"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{String(errors.confirmPassword.message)}</p>
                    )}
                  </div>
                </>
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
