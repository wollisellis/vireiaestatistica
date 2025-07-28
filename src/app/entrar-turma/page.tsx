'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { ProfessorClassService } from '@/services/professorClassService'
import { ClassInviteService } from '@/services/classInviteService'
import { AuthModal } from '@/components/auth/AuthModal'
import { 
  GraduationCap, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Calendar,
  BookOpen,
  User,
  Mail,
  School
} from 'lucide-react'
import { motion } from 'framer-motion'

function EntrarTurmaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, signInWithGoogle, signUp } = useFirebaseAuth()
  
  const [classCode, setClassCode] = useState(searchParams.get('codigo') || '')
  const [classInfo, setClassInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Form para registro
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    ra: ''
  })

  useEffect(() => {
    if (classCode) {
      checkClassExists()
    }
  }, [classCode])

  // Se o usuário já estiver logado, tentar entrar na turma automaticamente
  useEffect(() => {
    if (user && classInfo && !success) {
      joinClass()
    }
  }, [user, classInfo])

  const checkClassExists = async () => {
    if (!classCode) return
    
    try {
      setLoading(true)
      setError('')
      
      const validation = await ClassInviteService.validateInviteCode(classCode)
      
      if (validation.isValid && validation.classInfo) {
        setClassInfo(validation.classInfo)
        
        // Se não tem usuário logado, abrir modal de auth automaticamente
        if (!user) {
          setShowAuthModal(true)
        }
      } else {
        setError(validation.error || 'Código de turma inválido')
      }
    } catch (err) {
      console.error('Erro ao verificar código da turma:', err)
      setError('Erro ao verificar código da turma')
    } finally {
      setLoading(false)
    }
  }

  const joinClass = async () => {
    if (!user || !classInfo || !classCode) return
    
    try {
      setJoining(true)
      setError('')
      
      const result = await ClassInviteService.registerStudentWithCode(
        classCode,
        user.uid,
        user.displayName || user.email || 'Estudante',
        user.email || ''
      )
      
      if (result.success) {
        setSuccess(true)
        
        // Redirecionar para o dashboard dos jogos após 3 segundos
        setTimeout(() => {
          router.push('/jogos')
        }, 3000)
      } else {
        setError(result.error || 'Erro ao entrar na turma. Tente novamente.')
      }
    } catch (err) {
      console.error('Erro ao entrar na turma:', err)
      setError('Erro ao entrar na turma. Tente novamente.')
    } finally {
      setJoining(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      const { error } = await signInWithGoogle('student')
      if (error) throw error
    } catch (err) {
      setError('Erro ao fazer login com Google')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Após login bem-sucedido, tentar entrar na turma automaticamente
    if (classInfo) {
      joinClass()
    }
  }

  const handleCreateAccount = async () => {
    try {
      if (!studentForm.fullName || !studentForm.email) {
        setError('Preencha todos os campos obrigatórios')
        return
      }

      if (!studentForm.email.endsWith('@dac.unicamp.br')) {
        setError('Utilize seu email institucional @dac.unicamp.br')
        return
      }

      setLoading(true)
      const { error } = await signUp(
        studentForm.email,
        'tempPassword123', // Senha temporária - depois o usuário pode alterar
        studentForm.fullName,
        'student',
        'NT600'
      )
      
      if (error) throw error
    } catch (err) {
      setError('Erro ao criar conta. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  // Se já teve sucesso, mostrar confirmação
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-lg border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-6" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-green-900 mb-4">
                Parabéns! Você entrou na turma!
              </h1>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">{classInfo.name}</h3>
                <p className="text-green-700 text-sm">
                  Professor: {classInfo.professorName}
                </p>
              </div>
              
              <p className="text-gray-600 mb-6">
                Você será redirecionado para o dashboard dos jogos em alguns segundos...
              </p>
              
              <Button 
                onClick={() => router.push('/jogos')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Dashboard
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
        className="w-full max-w-2xl"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <div className="text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4" />
              <CardTitle className="text-2xl">Entrar na Turma</CardTitle>
              <p className="text-indigo-100 mt-2">
                Digite o código da turma ou faça login para entrar automaticamente
              </p>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {!classInfo ? (
              /* Formulário para inserir código */
              <div className="space-y-6">
                <div>
                  <Label htmlFor="classCode" className="text-base font-medium">
                    Código da Turma
                  </Label>
                  <Input
                    id="classCode"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Ex: NUTRI2025A"
                    className="mt-2 h-12 text-center text-lg font-mono tracking-wide"
                    maxLength={12}
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Solicite o código da turma ao seu professor
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <Button
                  onClick={checkClassExists}
                  disabled={!classCode || loading}
                  className="w-full h-12 text-base"
                >
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">ou</span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Já tem uma conta? Faça login e o código será aplicado automaticamente
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/')}
                    className="w-full h-12"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Fazer Login
                  </Button>
                </div>
              </div>
            ) : !user ? (
              /* Informações da turma e botão para fazer login */
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-xl font-bold text-blue-900">{classInfo.name}</h3>
                      <p className="text-blue-700">Professor: {classInfo.professorName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{classInfo.semester} {classInfo.year}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{classInfo.studentsCount || 0}/{classInfo.capacity || 50} estudantes</span>
                    </div>
                  </div>
                  
                  {classInfo.description && (
                    <p className="text-blue-600 text-sm mt-3">{classInfo.description}</p>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <h4 className="text-lg font-semibold">
                    Faça login para entrar na turma
                  </h4>
                  
                  <p className="text-gray-600">
                    Você precisa estar logado para se inscrever nesta turma.
                  </p>

                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full h-12"
                    size="lg"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Fazer Login e Entrar na Turma
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Usuário logado, processando entrada na turma */
              <div className="text-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Entrando na turma...
                </h3>
                <p className="text-gray-600">
                  Aguarde enquanto processamos sua matrícula na turma {classInfo.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        classInfo={classInfo}
        showCreateAccount={true}
      />
    </div>
  )
}

export default function EntrarTurmaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <EntrarTurmaContent />
    </Suspense>
  )
}