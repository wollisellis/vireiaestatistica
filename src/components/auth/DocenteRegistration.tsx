'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { ArrowLeft, User, Shield, CheckCircle } from 'lucide-react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Validation schemas for each step
const step1Schema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ["confirmPassword"],
})

const step2Schema = z.object({
  verificationCode: z.string().min(1, 'Código de verificação é obrigatório'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

interface DocenteRegistrationProps {
  onSuccess?: () => void
  onBack?: () => void
}

export function DocenteRegistration({ onSuccess, onBack }: DocenteRegistrationProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const { signUp } = useFirebaseAuth()

  // Form for Step 1
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  })

  // Form for Step 2
  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  const handleStep1Submit = (data: Step1Data) => {
    setError('')
    setStep1Data(data)
    setCurrentStep(2)
    step2Form.reset()
  }

  const handleStep2Submit = async (data: Step2Data) => {
    setLoading(true)
    setError('')

    try {
      // Verify the special code
      const DOCENTE_CODE = 'D0c3nt3'
      
      if (data.verificationCode !== DOCENTE_CODE) {
        setVerificationAttempts(prev => prev + 1)
        
        if (verificationAttempts >= 2) {
          throw new Error('Código incorreto. Muitas tentativas. Entre em contato com a administração.')
        } else {
          throw new Error(`Código incorreto. Tentativas restantes: ${2 - verificationAttempts}`)
        }
      }

      // If code is correct and we have step1 data, create the professor account
      if (!step1Data) {
        throw new Error('Dados da etapa anterior perdidos. Reinicie o processo.')
      }

      console.log('✅ Código verificado. Criando conta de professor...')

      // Create professor account with special verification flag
      const { data: signUpData, error: signUpError } = await signUp(
        step1Data.email,
        step1Data.password,
        step1Data.fullName,
        'professor'
      )

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (!signUpData?.user) {
        throw new Error('Erro ao criar conta: dados do usuário não encontrados')
      }

      // Add verification flag to the user document
      if (db) {
        try {
          const userDocRef = doc(db, 'users', signUpData.user.uid)
          await setDoc(userDocRef, {
            verifiedWithCode: true,
            verificationDate: serverTimestamp(),
            verificationMethod: 'docente_registration_v1.0'
          }, { merge: true })
          
          console.log('✅ Flag de verificação adicionada ao usuário')
        } catch (firestoreError) {
          console.error('⚠️ Erro ao adicionar flag de verificação:', firestoreError)
          // Don't fail the entire registration for this
        }
      }

      console.log('✅ Conta de professor criada com sucesso!')

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to professor dashboard
        window.location.href = '/docente'
      }

    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Erro desconhecido'
      console.error('❌ Erro no registro de docente:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const goBackToStep1 = () => {
    setCurrentStep(1)
    setError('')
    setVerificationAttempts(0)
  }

  const goBackToLogin = () => {
    if (onBack) {
      onBack()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <div className="text-center">
              <button
                onClick={currentStep === 1 ? goBackToLogin : goBackToStep1}
                className="mb-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {currentStep === 1 ? 'Voltar ao login' : 'Voltar'}
              </button>

              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Cadastro de Docente
              </h1>
              <p className="text-gray-600 mt-2">
                {currentStep === 1 
                  ? 'Informe seus dados básicos'
                  : 'Verificação de código especial'
                }
              </p>

              {/* Progress indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <input
                      {...step1Form.register('fullName')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite seu nome completo"
                    />
                    {step1Form.formState.errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      {...step1Form.register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="seu.email@unicamp.br"
                    />
                    {step1Form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.email.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Use qualquer email válido. Preferencialmente institucional.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha
                    </label>
                    <input
                      {...step1Form.register('password')}
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                    {step1Form.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Senha
                    </label>
                    <input
                      {...step1Form.register('confirmPassword')}
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirme sua senha"
                    />
                    {step1Form.formState.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {step1Form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                  >
                    Continuar para Verificação
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 2: Code Verification */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verificação de Código
                  </h3>
                  <p className="text-sm text-gray-600">
                    Para garantir que apenas docentes autorizados tenham acesso, 
                    digite o código especial fornecido pela coordenação.
                  </p>
                </div>

                <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código de Verificação
                    </label>
                    <input
                      {...step2Form.register('verificationCode')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                      placeholder="Digite o código"
                      maxLength={20}
                    />
                    {step2Form.formState.errors.verificationCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {step2Form.formState.errors.verificationCode.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Entre em contato com a coordenação se não possui o código
                    </p>
                  </div>

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
                    Verificar e Criar Conta
                  </Button>
                </form>

                {/* Show summary of step 1 data */}
                {step1Data && (
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dados informados:</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Nome:</strong> {step1Data.fullName}</p>
                      <p><strong>Email:</strong> {step1Data.email}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Info card about the verification process */}
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Processo de Verificação
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Este processo garante que apenas docentes autorizados tenham acesso 
                  às ferramentas administrativas da plataforma AvaliaNutri.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}