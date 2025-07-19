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
      
      // Simular busca de turma pelo código
      // Na implementação real, isso consultaria o Firebase
      const mockClassInfo = {
        id: 'class-123',
        name: 'Avaliação Nutricional - Turma A',
        semester: '1º Semestre',
        year: 2025,
        professorName: 'Prof. Dr. Maria Silva',
        studentsCount: 23,
        capacity: 50,
        description: 'Disciplina focada nos métodos e técnicas para avaliação do estado nutricional.',
        isActive: true
      }
      
      if (classCode.length >= 6) {
        setClassInfo(mockClassInfo)
      } else {
        setError('Código de turma inválido')
      }
    } catch (err) {
      setError('Erro ao verificar código da turma')
    } finally {
      setLoading(false)
    }
  }

  const joinClass = async () => {
    if (!user || !classInfo) return
    
    try {
      setJoining(true)
      setError('')
      
      // Aqui seria feita a chamada real para adicionar o estudante à turma
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simular delay
      
      setSuccess(true)
      
      // Redirecionar para o dashboard dos jogos após 3 segundos
      setTimeout(() => {
        router.push('/jogos')
      }, 3000)
    } catch (err) {
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
              /* Informações da turma e opções de login */
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
                      <span className="text-sm">{classInfo.studentsCount}/{classInfo.capacity} estudantes</span>
                    </div>
                  </div>
                  
                  {classInfo.description && (
                    <p className="text-blue-600 text-sm mt-3">{classInfo.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-center">
                    Faça login ou crie uma conta para entrar na turma
                  </h4>

                  {/* Google Sign In */}
                  <Button
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar com Google (@dac.unicamp.br)
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou crie uma conta</span>
                    </div>
                  </div>

                  {/* Formulário de criação de conta */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        value={studentForm.fullName}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Institucional *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu.nome@dac.unicamp.br"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ra">RA (opcional)</Label>
                      <Input
                        id="ra"
                        value={studentForm.ra}
                        onChange={(e) => setStudentForm(prev => ({ ...prev, ra: e.target.value }))}
                        placeholder="Seu RA da UNICAMP"
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handleCreateAccount}
                      className="w-full h-12"
                      disabled={loading}
                    >
                      {loading ? 'Criando conta...' : 'Criar Conta e Entrar na Turma'}
                    </Button>
                  </div>
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