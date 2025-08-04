'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
// Removido import de Select - todos são estudantes por padrão
import { User, Gamepad2, ArrowLeft, Brain, TrendingUp, Users, BarChart3, BookOpen, Target } from 'lucide-react'

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
  courseCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('auth.validation.passwordsDontMatch'),
  path: ["confirmPassword"],
}).refine((data) => {
  // Todos devem usar email institucional @dac.unicamp.br ou @unicamp.br
  if (!data.email.endsWith('@dac.unicamp.br') && !data.email.endsWith('@unicamp.br')) {
    return false
  }
  return true
}, {
  message: 'Use seu email institucional @dac.unicamp.br ou @unicamp.br',
  path: ["email"],
})

export function AuthForm() {
  const [showLoginOptions, setShowLoginOptions] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Removido selectedRole - todos são estudantes por padrão
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
          'student', // Sempre registrar como estudante
          data.courseCode
        )
        if (error) throw new Error(error.message)

        // Verificar se há URL de retorno
        const returnUrl = sessionStorage.getItem('returnUrl') || '/jogos'
        sessionStorage.removeItem('returnUrl')
        window.location.href = returnUrl
      } else {
        const { error } = await signIn(data.email, data.password)
        if (error) throw new Error(error.message)

        // Verificar se há URL de retorno
        const returnUrl = sessionStorage.getItem('returnUrl') || '/jogos'
        sessionStorage.removeItem('returnUrl')
        window.location.replace(returnUrl)
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
      } else if (errorMessage.includes('Novos cadastros estão temporariamente fechados')) {
        setError('⚠️ Cadastros fechados - A turma não está aceitando novos alunos no momento. Entre em contato com seu professor.')
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

  const handleStartLogin = () => {
    // Hide login options and show login form
    setShowLoginOptions(false)
    setIsSignUp(false) // Start with login form
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
      console.log('🚀 Iniciando Google Sign In para estudante')
      const { data, error } = await signInWithGoogle('student')

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

      // Verificar se há URL de retorno
      const returnUrl = sessionStorage.getItem('returnUrl') || '/jogos'
      sessionStorage.removeItem('returnUrl')
      console.log('🔄 Redirecionando para:', returnUrl)
      window.location.href = returnUrl
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
          className="w-full max-w-2xl"
        >
          <Card className="w-full">
            <CardHeader className="pb-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    AvaliaNutri
                  </h1>
                </motion.div>
                <p className="text-lg text-gray-700 font-medium">
                  Plataforma Educacional de Avaliação Nutricional
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Transforme seu aprendizado em nutrição com gamificação e dados reais
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Aprendizado Gamificado</h3>
                    <p className="text-xs text-gray-600 mt-1">Módulos interativos com pontuação e ranking</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-green-50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <BarChart3 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Dados Brasileiros</h3>
                    <p className="text-xs text-gray-600 mt-1">IBGE, SISVAN e Ministério da Saúde</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Progresso em Tempo Real</h3>
                    <p className="text-xs text-gray-600 mt-1">Acompanhe seu desempenho instantaneamente</p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Target className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Casos Práticos</h3>
                    <p className="text-xs text-gray-600 mt-1">Simulações baseadas em situações reais</p>
                  </div>
                </motion.div>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleStartLogin}
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Gamepad2 className="w-6 h-6" />
                  <span className="font-semibold text-lg">Acessar a Plataforma</span>
                </div>
              </Button>
              
              {/* Institution Notice */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-gray-700 font-medium">Acesso Exclusivo UNICAMP</p>
                    <p className="text-gray-600 text-xs mt-1">
                      Use seu email institucional @dac.unicamp.br ou @unicamp.br para acessar a plataforma
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center space-x-8 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">65+</p>
                  <p className="text-xs text-gray-600">Estudantes Ativos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">87%</p>
                  <p className="text-xs text-gray-600">Taxa de Aprovação</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">12min</p>
                  <p className="text-xs text-gray-600">Por Módulo</p>
                </div>
              </div>
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
                {isSignUp ? 'Criar Conta' : 'Entrar'}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? 'Crie sua conta usando email institucional'
                  : 'Entre com sua conta existente'
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
                  placeholder={isSignUp ? "exemplo@dac.unicamp.br" : t('auth.enterEmail')}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>
                )}
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-1">
                    Use seu email institucional: @dac.unicamp.br ou @unicamp.br
                  </p>
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
                      Código do Curso (Opcional)
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
                <div className={`rounded-lg p-3 ${
                  error.includes('Cadastros fechados') 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    error.includes('Cadastros fechados')
                      ? 'text-yellow-800'
                      : 'text-red-600'
                  }`}>{error}</p>
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

                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚠️ Use seu email institucional @dac.unicamp.br ou @unicamp.br
                </p>
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

            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
