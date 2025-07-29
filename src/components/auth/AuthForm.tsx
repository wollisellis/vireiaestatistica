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
import { User, Gamepad2, ArrowLeft } from 'lucide-react'

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
  // Students must use @dac.unicamp.br email
  if (data.role === 'student' && !data.email.endsWith('@dac.unicamp.br')) {
    return false
  }
  return true
}, {
  message: 'Estudantes devem usar email institucional @dac.unicamp.br',
  path: ["email"],
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
  const [showLoginOptions, setShowLoginOptions] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'student' | 'professor'>('student')
  const { signIn, signInWithGoogle, signUp } = useFirebaseAuth()

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

        // Simple redirect based on role
        if (data.role === 'professor' || selectedRole === 'professor') {
          window.location.href = '/professor'
        } else {
          window.location.href = '/jogos'
        }
      } else {
        const { error } = await signIn(data.email, data.password)
        if (error) throw new Error(error.message)

        // Store selected role in localStorage to ensure proper redirect
        localStorage.setItem('selected-role', selectedRole)
        
        // Force a hard redirect to ensure role is properly applied
        if (selectedRole === 'professor') {
          window.location.replace('/professor')
        } else {
          window.location.replace('/jogos')
        }
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Erro desconhecido'

      // Provide more helpful error messages for common Firebase issues
      if (errorMessage.includes('offline') || errorMessage.includes('client is offline')) {
        setError('Erro de conexão com o banco de dados. Verifique se o Firebase está configurado corretamente ou use o modo demo.')
      } else if (errorMessage.includes('network-request-failed')) {
        setError('Erro de rede. Verifique sua conexão com a internet.')
      } else if (errorMessage.includes('auth/invalid-email')) {
        setError('Email inválido. Verifique o formato do email.')
      } else if (errorMessage.includes('auth/user-not-found')) {
        setError('Usuário não encontrado. Verifique o email ou crie uma nova conta.')
      } else if (errorMessage.includes('auth/wrong-password')) {
        setError('Senha incorreta. Tente novamente.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }


  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
    reset()
  }

  const handleRoleSelection = (role: 'student' | 'professor') => {
    console.log('🎯 Role selecionado:', role)
    setSelectedRole(role)
    
    // Store role in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected-role', role)
    }
    
    // Hide login options and show login form
    setShowLoginOptions(false)
    setIsSignUp(false) // Start with login form
    
    console.log('✅ Transicionando para formulário de login')
  }

  const backToOptions = () => {
    setShowLoginOptions(true)
    setIsSignUp(false)
    setError('')
    reset()
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      console.log('🚀 Iniciando Google Sign In para:', selectedRole)
      const { data, error } = await signInWithGoogle(selectedRole)

      if (error) {
        console.log('❌ Erro no Google Sign In:', error.message)
        throw new Error(error.message)
      }



      // Redirect based on role and whether it's a new user
      if (data?.isNewUser) {
        console.log('✅ Novo usuário Google criado:', data.profile)
      } else {
        console.log('✅ Usuário Google existente:', data.profile)
      }

      // Simple redirect based on role
      console.log('🔄 Redirecionando para dashboard...')
      if (selectedRole === 'professor') {
        window.location.href = '/professor'
      } else {
        window.location.href = '/jogos'
      }
    } catch (err: unknown) {
      console.log('❌ Erro final:', err)
      setError((err as Error).message || 'Erro ao fazer login com Google')
    } finally {
      setLoading(false)
    }
  }

  // Show role selection screen first
  if (showLoginOptions) {
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  AvaliaNutri
                </h1>
                <p className="text-gray-600">
                  Plataforma Educacional de Avaliação Nutricional
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Escolha como deseja acessar a plataforma
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Professor Login Option */}
              <Button
                onClick={() => handleRoleSelection('professor')}
                className="w-full h-16 text-left bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold text-base leading-tight">Entrar como Docente</div>
                    <div className="text-sm text-blue-100 leading-tight mt-0.5">
                      Acesso ao dashboard administrativo
                    </div>
                  </div>
                </div>
              </Button>

              {/* Direct Professor Access - Development */}
              <Button
                onClick={() => {
                  console.log('🚀 Acesso direto como professor...')
                  localStorage.setItem('selected-role', 'professor')
                  localStorage.setItem('dev-professor-access', 'true')
                  window.location.href = '/professor'
                }}
                className="w-full h-12 text-left bg-amber-600 hover:bg-amber-700 text-white"
                size="sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-medium text-sm leading-tight">Acesso Direto - Docente (Dev)</div>
                    <div className="text-xs text-amber-100 leading-tight mt-0.5">
                      Pular login para desenvolvimento
                    </div>
                  </div>
                </div>
              </Button>

              {/* Student Login Option */}
              <Button
                onClick={() => handleRoleSelection('student')}
                className="w-full h-16 text-left bg-emerald-600 hover:bg-emerald-700 text-white"
                size="lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="font-semibold text-base leading-tight">Entrar como Estudante</div>
                    <div className="text-sm text-emerald-100 leading-tight mt-0.5">
                      Acesso aos jogos educacionais
                    </div>
                  </div>
                </div>
              </Button>

            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
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
              <button
                onClick={backToOptions}
                className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar às opções
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isSignUp ? 'Criar Conta' : 'Entrar'} - {selectedRole === 'professor' ? 'Docente' : 'Estudante'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? `Crie sua conta de ${selectedRole === 'professor' ? 'docente' : 'estudante'}`
                  : `Entre com sua conta de ${selectedRole === 'professor' ? 'docente' : 'estudante'}`
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
                    placeholder={isSignUp ? "exemplo@dac.unicamp.br" : t('auth.enterFullName')}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.fullName.message)}</p>
                  )}
                  {isSignUp && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estudantes devem usar email institucional @dac.unicamp.br
                    </p>
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
                        <SelectItem value="professor">Docente</SelectItem>
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

            {/* Google Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isSignUp ? 'Criar conta' : 'Entrar'} com Google
                </Button>

                {selectedRole === 'student' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    ⚠️ Estudantes devem usar email @dac.unicamp.br
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {isSignUp
                  ? t('auth.alreadyHaveAccount')
                  : t('auth.dontHaveAccount')
                }
              </button>

              {selectedRole === 'professor' && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-500 mb-2">Precisa se cadastrar como docente?</p>
                  <a
                    href="/professor/registro"
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Cadastre-se como Docente
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
