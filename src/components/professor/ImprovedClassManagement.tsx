'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import CountdownTimer from '@/components/ui/CountdownTimer'
import CreateClassModal, { ClassFormData } from './CreateClassModal'
import ClassInviteModal from './ClassInviteModal'
import { 
  ProfessorClassService, 
  ClassInfo, 
  StudentOverview 
} from '@/services/professorClassService'
import { EnhancedClassService } from '@/services/enhancedClassService'
import { ClassTrashService, DeletedClass } from '@/services/classTrashService'
import { EnhancedClass, EnhancedStudentOverview } from '@/types/classes'
import { safeToLocaleDateString } from '@/utils/dateUtils'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus,
  Download,
  Upload,
  Search,
  Mail,
  Calendar,
  BookOpen,
  Settings,
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Copy,
  Share,
  Link,
  QrCode,
  GraduationCap,
  Clock,
  Target,
  Star,
  TrendingUp,
  Eye,
  BarChart3,
  Activity,
  Award,
  Timer,
  User,
  RotateCcw,
  XCircle,
  Filter,
  List,
  Archive
} from 'lucide-react'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useResponsive } from '@/hooks/useResponsive'

interface ImprovedClassManagementProps {
  professorId: string
  professorName?: string
  className?: string
}

export function ImprovedClassManagement({ professorId, professorName = 'Prof. Dr. Dennys Esper', className = '' }: ImprovedClassManagementProps) {
  const router = useRouter()
  const { isMobile, isTablet } = useResponsive()
  const [classes, setClasses] = useState<EnhancedClass[]>([])
  const [selectedClass, setSelectedClass] = useState<EnhancedClass | null>(null)
  const [students, setStudents] = useState<EnhancedStudentOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteClass, setInviteClass] = useState<EnhancedClass | null>(null)
  
  // Estados para sistema de filtros
  const [viewFilter, setViewFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const [deletedClasses, setDeletedClasses] = useState<DeletedClass[]>([])
  const [loadingDeleted, setLoadingDeleted] = useState(false)
  
  // Estados para visualização de detalhes do estudante
  const [selectedStudent, setSelectedStudent] = useState<EnhancedStudentOverview | null>(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [studentModule1Data, setStudentModule1Data] = useState<any>(null)
  const [loadingStudentData, setLoadingStudentData] = useState(false)
  
  // 🎨 ESTADOS DE UX APRIMORADOS
  const [creationProgress, setCreationProgress] = useState<{
    step: 'idle' | 'validating' | 'saving' | 'generating-code' | 'setting-up' | 'completed' | 'error';
    message: string;
    progress: number;
  }>({
    step: 'idle',
    message: '',
    progress: 0
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    visible: boolean;
  }>({
    type: 'info',
    title: '',
    message: '',
    visible: false
  })
  const [autoRecoveryInfo, setAutoRecoveryInfo] = useState<{
    applied: boolean;
    count: number;
    visible: boolean;
  }>({
    applied: false,
    count: 0,
    visible: false
  })

  // Formulário de criação de turma
  const [classForm, setClassForm] = useState({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    description: '',
    capacity: 50
  })

  // 🎨 SISTEMA DE NOTIFICAÇÕES
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, duration = 5000) => {
    setNotification({ type, title, message, visible: true })
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }))
      }, duration)
    }
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }))
  }

  const showAutoRecoveryInfo = (count: number) => {
    setAutoRecoveryInfo({ applied: true, count, visible: true })
    setTimeout(() => {
      setAutoRecoveryInfo(prev => ({ ...prev, visible: false }))
    }, 8000)
  }

  // Carregar turmas do professor
  useEffect(() => {
    loadClasses()
  }, [professorId])

  // Carregar estudantes da turma selecionada
  useEffect(() => {
    if (selectedClass) {
      loadClassStudents()
    }
  }, [selectedClass])

  // Carregar turmas excluídas quando necessário
  useEffect(() => {
    if (viewFilter === 'deleted') {
      console.log('🔄 [ImprovedClassManagement] Tab "deleted" ativada, carregando turmas excluídas...')
      loadDeletedClasses()
    }
  }, [viewFilter])

  // 🎯 FUNÇÃO PARA RESTAURAR TURMA EXCLUÍDA
  const restoreClass = async (classId: string, className: string) => {
    try {
      console.log(`🔄 [ImprovedClassManagement] Iniciando restauração da turma "${className}" (${classId})`)
      showNotification('info', 'Restaurando Turma', 'Restaurando turma excluída...')
      
      await ClassTrashService.restoreClass(classId, professorId)
      console.log(`✅ [ImprovedClassManagement] Turma restaurada com sucesso no backend`)
      
      showNotification('success', 'Turma Restaurada', `${className} foi restaurada com sucesso!`)
      
      // Recarregar ambas as listas: turmas ativas e excluídas
      console.log(`🔄 [ImprovedClassManagement] Recarregando listas após restauração...`)
      await Promise.all([
        loadClasses(), // Recarregar turmas ativas
        loadDeletedClasses() // Recarregar turmas excluídas (para remover a restaurada)
      ])
      console.log(`✅ [ImprovedClassManagement] Listas recarregadas após restauração`)
      
    } catch (error) {
      console.error('❌ [ImprovedClassManagement] Erro ao restaurar turma:', error)
      showNotification('error', 'Erro na Restauração', 
        error instanceof Error ? error.message : 'Erro ao restaurar turma')
    }
  }

  // 🗑️ FUNÇÃO PARA CARREGAR TURMAS EXCLUÍDAS
  const loadDeletedClasses = async () => {
    try {
      setLoadingDeleted(true)
      console.log('🗑️ [ImprovedClassManagement] Carregando turmas excluídas...')
      console.log(`🔍 [ImprovedClassManagement] Professor ID usado na busca: "${professorId}"`)
      
      if (!professorId) {
        console.error('❌ [ImprovedClassManagement] Professor ID não disponível!')
        throw new Error('Professor ID não disponível')
      }
      
      const deletedClassesData = await ClassTrashService.getDeletedClasses(professorId)
      setDeletedClasses(deletedClassesData)
      
      console.log(`✅ [ImprovedClassManagement] ${deletedClassesData.length} turmas excluídas carregadas`)
      
      // Log detalhado dos dados retornados
      if (deletedClassesData.length > 0) {
        console.log('📋 [ImprovedClassManagement] Detalhes das turmas excluídas encontradas:')
        deletedClassesData.forEach((cls, index) => {
          console.log(`   ${index + 1}. ID: ${cls.id}, Nome: ${cls.originalData.name}, Excluída em: ${cls.deletedAt.toDate().toLocaleDateString('pt-BR')}`)
        })
      } else {
        console.log('🤔 [ImprovedClassManagement] Nenhuma turma excluída encontrada. Possíveis causas:')
        console.log('   - Nenhuma turma foi excluída ainda')
        console.log('   - Professor ID não corresponde ao usado na exclusão')
        console.log('   - Turmas foram excluídas por método que não usa ClassTrashService')
        console.log('   - Problema de permissão no Firestore')
      }
    } catch (error) {
      console.error('❌ [ImprovedClassManagement] Erro ao carregar turmas excluídas:', error)
      showNotification('error', 'Erro ao Carregar', 'Não foi possível carregar as turmas excluídas')
    } finally {
      setLoadingDeleted(false)
    }
  }

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 [ImprovedClassManagement] Carregando turmas com sistema inteligente...')
      
      // Limpar cache do Firestore para garantir dados frescos
      if (typeof window !== 'undefined') {
        try {
          await db.clearPersistence?.()
        } catch (error) {
          // Ignore cache clear errors
          console.log('Cache clear skipped (normal behavior)')
        }
      }
      
      // Monitorar console para detectar auto-recovery
      const originalConsoleLog = console.log
      let recoveryDetected = false
      let recoveredCount = 0
      
      console.log = (...args) => {
        const message = args.join(' ')
        if (message.includes('turmas corrigidas automaticamente')) {
          recoveryDetected = true
          const match = message.match(/(\d+) turmas corrigidas/)
          if (match) {
            recoveredCount = parseInt(match[1])
          }
        }
        originalConsoleLog(...args)
      }
      
      // Carregar todas as turmas com sistema unificado fidedigno
      const classesData = await EnhancedClassService.getProfessorClasses(professorId)
      
      // Restaurar console.log
      console.log = originalConsoleLog
      
      console.log(`✅ [ImprovedClassManagement] ${classesData.length} turmas carregadas`)
      
      // DEBUG: Log turmas carregadas com status
      classesData.forEach(cls => {
        console.log(`📋 Turma "${cls.name}": status="${cls.status}", id="${cls.id}"`)
      })
      
      setClasses(classesData)
      
      // Mostrar notificação de recovery se aplicável
      if (recoveryDetected && recoveredCount > 0) {
        showAutoRecoveryInfo(recoveredCount)
        showNotification(
          'success',
          '🔧 Sistema Auto-Corrigido!',
          `${recoveredCount} turma(s) foram automaticamente corrigidas e já estão disponíveis.`,
          6000
        )
      } else if (classesData.length > 0) {
        showNotification('info', '✅ Turmas Carregadas', `${classesData.length} turma(s) disponíveis`, 3000)
      }
      
    } catch (error) {
      console.error('❌ [ImprovedClassManagement] Erro ao carregar turmas:', error)
      
      showNotification(
        'error',
        '❌ Erro ao Carregar Turmas',
        'Não foi possível carregar as turmas. Tente recarregar a página.',
        8000
      )
      
      // Fallback para array vazio
      setClasses([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadClassStudents = async () => {
    if (!selectedClass) return
    
    try {
      console.log(`[ImprovedClassManagement] 🔄 Carregando estudantes com sistema unificado para turma: ${selectedClass.id}`)
      const studentsData = await EnhancedClassService.getEnhancedClassStudents(selectedClass.id)
      console.log(`[ImprovedClassManagement] ✅ ${studentsData.length} estudantes carregados com dados fidedignos`)
      setStudents(studentsData)
    } catch (error) {
      console.error('[ImprovedClassManagement] ❌ Erro ao carregar estudantes:', error)
    }
  }

  const createClass = async (classData: ClassFormData) => {
    if (!professorId) {
      showNotification('error', 'Erro de Autenticação', 'Professor ID não disponível')
      throw new Error('Professor ID não disponível')
    }

    try {
      console.log('🚀 [ImprovedClassManagement] Iniciando criação de turma com UX melhorada')
      
      // 🎯 PASSO 1: Validação
      setCreationProgress({
        step: 'validating',
        message: 'Validando dados da turma...',
        progress: 10
      })
      
      await new Promise(resolve => setTimeout(resolve, 500)) // Simular validação
      
      // 🎯 PASSO 2: Salvando
      setCreationProgress({
        step: 'saving',
        message: 'Criando turma no sistema...',
        progress: 30
      })
      
      const classId = await ProfessorClassService.createClass(
        professorId,
        professorName,
        classData.name,
        classData.semester,
        classData.year
      )
      
      // 🎯 PASSO 3: Configurando
      setCreationProgress({
        step: 'setting-up',
        message: 'Configurando módulos e sistema...',
        progress: 70
      })
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 🎯 PASSO 4: Finalizando
      setCreationProgress({
        step: 'completed',
        message: 'Turma criada com sucesso!',
        progress: 100
      })
      
      // Fechar modal de criação
      setIsCreatingClass(false)
      
      // Reset progress depois de um tempo
      setTimeout(() => {
        setCreationProgress({
          step: 'idle',
          message: '',
          progress: 0
        })
      }, 2000)
      
      // Recarregar turmas com feedback
      console.log('🔄 [ImprovedClassManagement] Recarregando turmas após criação...')
      await loadClasses()
      
      // Buscar informações da turma para modal de convites
      console.log('🔍 [ImprovedClassManagement] Buscando informações da turma criada:', classId)
      const newClassInfo = await ProfessorClassService.getClassInfo(classId)
      
      if (newClassInfo) {
        console.log('✅ [ImprovedClassManagement] Turma encontrada, abrindo modal de convites')
        setInviteClass(newClassInfo)
        setShowInviteModal(true)
        
        showNotification(
          'success', 
          '🎉 Turma Criada!', 
          `${newClassInfo.name} foi criada com sucesso. Compartilhe o código de convite com os estudantes.`,
          5000
        )
      } else {
        console.warn('⚠️ [ImprovedClassManagement] Turma criada mas não foi possível obter informações')
        showNotification(
          'warning',
          '⚠️ Turma Criada',
          'A turma foi criada, mas houve um problema ao obter as informações. Recarregue a página.',
          6000
        )
      }
      
    } catch (error) {
      console.error('❌ [ImprovedClassManagement] Erro na criação da turma:', error)
      
      // Reset states
      setIsCreatingClass(false)
      setCreationProgress({
        step: 'error',
        message: 'Erro na criação da turma',
        progress: 0
      })
      
      // Reset progress após erro
      setTimeout(() => {
        setCreationProgress({
          step: 'idle',
          message: '',
          progress: 0
        })
      }, 3000)
      
      // Mostrar notificação de erro
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      showNotification(
        'error',
        '❌ Erro ao Criar Turma',
        errorMessage,
        8000
      )
      
      throw error // Re-throw para o modal tratar se necessário
    }
  }

  const generateInviteLink = (classCode: string) => {
    const baseUrl = window.location.origin
    return `${baseUrl}/entrar-turma?codigo=${classCode}`
  }

  const copyInviteLink = (classCode: string) => {
    const link = generateInviteLink(classCode)
    navigator.clipboard.writeText(link)
    alert('Link de convite copiado! Compartilhe com os estudantes.')
  }

  // Função para carregar dados do módulo 1 do estudante
  const loadStudentModule1Data = async (student: StudentOverview) => {
    if (!db) {
      console.error('Firebase não disponível')
      return
    }

    setLoadingStudentData(true)
    try {
      // 1. Buscar progresso do módulo 1
      const progressQuery = query(
        collection(db, 'student_module_progress'),
        where('studentId', '==', student.id),
        where('moduleId', '==', 'module-1')
      )
      const progressSnapshot = await getDocs(progressQuery)
      
      let moduleProgress = null
      if (!progressSnapshot.empty) {
        moduleProgress = progressSnapshot.docs[0].data()
      }

      // 2. Buscar tentativas de quiz do módulo 1
      const attemptsQuery = query(
        collection(db, 'quiz_attempts'),
        where('studentId', '==', student.id),
        where('moduleId', '==', 'module-1'),
        orderBy('timestamp', 'desc'),
        limit(10)
      )
      const attemptsSnapshot = await getDocs(attemptsQuery)
      
      const quizAttempts = attemptsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 3. Calcular estatísticas
      let totalAttempts = quizAttempts.length
      let bestScore = 0
      let lastActivityDate = null
      let isCompleted = false

      if (quizAttempts.length > 0) {
        bestScore = Math.max(...quizAttempts.map(attempt => attempt.score || 0))
        lastActivityDate = quizAttempts[0].timestamp
        isCompleted = quizAttempts.some(attempt => attempt.completed)
      }

      // 4. Combinar dados do progresso se disponível
      if (moduleProgress) {
        isCompleted = moduleProgress.completed || isCompleted
        if (moduleProgress.lastActivityDate) {
          lastActivityDate = moduleProgress.lastActivityDate
        }
      }

      setStudentModule1Data({
        student,
        moduleProgress,
        quizAttempts,
        stats: {
          totalAttempts,
          bestScore,
          lastActivityDate,
          isCompleted,
          progressPercentage: moduleProgress?.progress?.percentage || 0
        }
      })
      
      setSelectedStudent(student)
      setShowStudentDetails(true)
    } catch (error) {
      console.error('Erro ao carregar dados do estudante:', error)
      showNotification('error', 'Erro', 'Não foi possível carregar os dados do estudante')
    } finally {
      setLoadingStudentData(false)
    }
  }

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Código da turma copiado!')
  }

  const showClassInvites = (classInfo: ClassInfo) => {
    setInviteClass(classInfo)
    setShowInviteModal(true)
  }

  const closeInviteModal = () => {
    setShowInviteModal(false)
    setInviteClass(null)
  }

  // 🎯 FILTROS DE TURMAS
  const getFilteredClasses = () => {
    switch (viewFilter) {
      case 'active':
        return classes.filter(cls => cls.status !== 'deleted')
      case 'deleted':
        return [] // Turmas excluídas são gerenciadas separadamente em deletedClasses
      case 'all':
      default:
        return classes.filter(cls => cls.status !== 'deleted') // Por padrão, não mostrar excluídas
    }
  }

  const filteredClasses = getFilteredClasses()

  // Contadores para os tabs
  const activeClassesCount = classes.filter(cls => cls.status !== 'deleted').length
  const deletedClassesCount = deletedClasses.length

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 overflow-hidden">
          <CardContent className="p-4 sm:p-6 lg:p-8 relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white opacity-10 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
                    <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Gerenciamento de Turmas</h1>
                      <p className="text-indigo-100 text-sm sm:text-base lg:text-lg mt-1">
                        Crie turmas, convide estudantes e acompanhe o progresso
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{classes.length}</div>
                      <div className="text-indigo-200 text-xs sm:text-sm">Turmas Ativas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        {classes.reduce((total, cls) => total + cls.studentsCount, 0)}
                      </div>
                      <div className="text-indigo-200 text-xs sm:text-sm">Total de Estudantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
                        {classes.length > 0 ? Math.round(classes.reduce((total, cls) => total + cls.avgProgress, 0) / classes.length) : 0}%
                      </div>
                      <div className="text-indigo-200 text-xs sm:text-sm">Progresso Médio</div>
                    </div>
                  </div>
                </div>

                {/* Botão Nova Turma */}
                <div className="flex justify-center lg:justify-end space-x-3">
                  <Button 
                    onClick={loadClasses}
                    disabled={isLoading}
                    variant="outline"
                    size="lg" 
                    className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-indigo-600 shadow-lg h-12 px-4"
                  >
                    <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Carregando...' : 'Atualizar'}
                  </Button>
                  <Button 
                    onClick={() => setIsCreatingClass(true)}
                    size="lg" 
                    className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg h-12 px-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Turma
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 🎨 SISTEMA DE NOTIFICAÇÕES */}
      {notification.visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed z-50 ${
            isMobile 
              ? 'top-2 left-4 right-4 max-w-none' 
              : 'top-4 right-4 max-w-sm'
          }`}
        >
          <Card className={`border-l-4 shadow-xl ${
            notification.type === 'success' ? 'border-l-green-500 bg-green-50' :
            notification.type === 'error' ? 'border-l-red-500 bg-red-50' :
            notification.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
            'border-l-blue-500 bg-blue-50'
          }`}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <h4 className={`font-semibold text-sm ${
                    notification.type === 'success' ? 'text-green-800' :
                    notification.type === 'error' ? 'text-red-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {notification.title}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    notification.type === 'success' ? 'text-green-700' :
                    notification.type === 'error' ? 'text-red-700' :
                    notification.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={hideNotification}
                  className="flex-shrink-0 h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 🔧 INFORMAÇÃO DE AUTO-RECOVERY */}
      {autoRecoveryInfo.visible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="mb-4"
        >
          <Card className="border-l-4 border-l-blue-500 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 text-sm">
                    🔧 Sistema Auto-Corrigido
                  </h4>
                  <p className="text-blue-700 text-xs">
                    {autoRecoveryInfo.count} turma(s) com status incorreto foram automaticamente corrigidas.
                    As turmas já estão disponíveis na lista abaixo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 📊 PROGRESS INDICATOR PARA CRIAÇÃO */}
      {creationProgress.step !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  creationProgress.step === 'completed' ? 'bg-green-100' :
                  creationProgress.step === 'error' ? 'bg-red-100' :
                  'bg-indigo-100'
                }`}>
                  {creationProgress.step === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : creationProgress.step === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm ${
                      creationProgress.step === 'completed' ? 'text-green-800' :
                      creationProgress.step === 'error' ? 'text-red-800' :
                      'text-indigo-800'
                    }`}>
                      {creationProgress.step === 'completed' ? '✅ Concluído!' :
                       creationProgress.step === 'error' ? '❌ Erro' :
                       '🔄 Criando Turma...'}
                    </h4>
                    <span className="text-xs font-medium text-gray-600">
                      {creationProgress.progress}%
                    </span>
                  </div>
                  <p className={`text-xs mb-2 ${
                    creationProgress.step === 'completed' ? 'text-green-700' :
                    creationProgress.step === 'error' ? 'text-red-700' :
                    'text-indigo-700'
                  }`}>
                    {creationProgress.message}
                  </p>
                  {creationProgress.step !== 'error' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          creationProgress.step === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${creationProgress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal de criação de turma */}
      <CreateClassModal
        isOpen={isCreatingClass}
        onClose={() => setIsCreatingClass(false)}
        onCreateClass={createClass}
        loading={isLoading}
      />

      {/* Sistema de Filtros com Tabs */}
      <Tabs value={viewFilter} onValueChange={(value) => setViewFilter(value as 'all' | 'active' | 'deleted')} className="w-full">
        <TabsList className={`grid w-full mb-4 sm:mb-6 ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3'}`}>
          <TabsTrigger value="all" className="flex items-center justify-center gap-2 py-2 sm:py-3">
            <List className="w-4 h-4" />
            <span className="text-sm sm:text-base">Todas as Turmas</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {classes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center justify-center gap-2 py-2 sm:py-3">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm sm:text-base">Somente Ativas</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeClassesCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="deleted" className="flex items-center justify-center gap-2 py-2 sm:py-3">
            <Archive className="w-4 h-4" />
            <span className="text-sm sm:text-base">Turmas Excluídas</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {deletedClassesCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content - Todas as Turmas */}
        <TabsContent value="all">
          {filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-12">
                  <GraduationCap className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Nenhuma turma criada ainda
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Crie sua primeira turma para começar a gerenciar estudantes. 
                    O sistema permite convites automáticos e acompanhamento em tempo real.
                  </p>
                  <Button 
                    onClick={() => setIsCreatingClass(true)}
                    size="lg"
                    className="h-12 px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeira Turma
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EnhancedClassCard
                    classInfo={cls}
                    isSelected={selectedClass?.id === cls.id}
                    onSelect={() => setSelectedClass(cls)}
                    onCopyCode={() => copyClassCode(cls.code)}
                    onCopyInviteLink={() => copyInviteLink(cls.code)}
                    onViewDetails={() => router.push(`/professor/turma/${cls.id}`)}
                    onShowInvites={() => showClassInvites(cls)}
                    onRestore={() => restoreClass(cls.id, cls.name)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Content - Somente Ativas */}
        <TabsContent value="active">
          {filteredClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-12">
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Nenhuma turma ativa
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Todas as suas turmas podem ter sido arquivadas ou excluídas. 
                    Crie uma nova turma para começar.
                  </p>
                  <Button 
                    onClick={() => setIsCreatingClass(true)}
                    size="lg"
                    className="h-12 px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nova Turma
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredClasses.map((cls, index) => (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <EnhancedClassCard
                    classInfo={cls}
                    isSelected={selectedClass?.id === cls.id}
                    onSelect={() => setSelectedClass(cls)}
                    onCopyCode={() => copyClassCode(cls.code)}
                    onCopyInviteLink={() => copyInviteLink(cls.code)}
                    onViewDetails={() => router.push(`/professor/turma/${cls.id}`)}
                    onShowInvites={() => showClassInvites(cls)}
                    onRestore={() => restoreClass(cls.id, cls.name)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab Content - Turmas Excluídas */}
        <TabsContent value="deleted">
          {loadingDeleted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <Card className="h-48">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : deletedClasses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-12">
                  <Archive className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Nenhuma turma excluída
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    Quando você excluir uma turma, ela ficará aqui por 30 dias 
                    antes de ser removida permanentemente.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Durante esse período, você pode restaurar a turma a qualquer momento.
                  </p>

                  {/* Debug Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                    <h4 className="font-semibold text-blue-900 mb-2 text-sm">🔍 Informações de Debug:</h4>
                    <div className="space-y-1 text-xs text-blue-800">
                      <p><strong>Professor ID:</strong> <code>{professorId}</code></p>
                      <p><strong>Collection:</strong> <code>deleted_classes</code></p>
                      <p><strong>Query:</strong> <code>deletedBy == "{professorId}"</code></p>
                      <p><strong>Status de carregamento:</strong> {loadingDeleted ? 'Carregando...' : 'Concluído'}</p>
                    </div>
                  </div>

                  {/* Botão para forçar recarregamento */}
                  <Button 
                    onClick={loadDeletedClasses}
                    disabled={loadingDeleted}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingDeleted ? 'animate-spin' : ''}`} />
                    {loadingDeleted ? 'Recarregando...' : 'Forçar Recarregamento'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {deletedClasses.map((deletedClass, index) => (
                <motion.div
                  key={deletedClass.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <DeletedClassCard
                    deletedClass={deletedClass}
                    onRestore={() => restoreClass(deletedClass.id, deletedClass.originalData.name)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detalhes da turma selecionada */}
      {selectedClass && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 text-lg sm:text-xl">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">{selectedClass.name}</span>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 self-start sm:self-auto">
                      {students.length} estudante(s)
                    </Badge>
                  </CardTitle>
                  <div className="text-xs sm:text-sm text-gray-600 mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{selectedClass.semester} {selectedClass.year}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Código: <span className="font-mono">{selectedClass.code}</span></span>
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showClassInvites(selectedClass)}
                    className="border-green-200 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Compartilhar Convite</span>
                    <span className="sm:hidden">Compartilhar</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadClassStudents} className="text-xs sm:text-sm h-8 sm:h-9">
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Atualizar
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => router.push(`/professor/turma/${selectedClass.id}`)}
                    className="text-xs sm:text-sm h-8 sm:h-9 bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Ver Detalhes Completos
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              {/* Busca de estudantes */}
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar estudante por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
              </div>
              
              {/* Lista de estudantes */}
              <div className="space-y-3">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <EnhancedStudentRow 
                      student={student} 
                      totalModules={selectedClass.totalModules} 
                      onStudentClick={loadStudentModule1Data} 
                    />
                  </motion.div>
                ))}
                
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h4 className="text-lg font-medium mb-2">
                      {searchTerm ? 'Nenhum estudante encontrado' : 'Nenhum estudante matriculado'}
                    </h4>
                    {!searchTerm && (
                      <div className="space-y-3">
                        <p className="text-gray-500">
                          Compartilhe o código da turma ou link de convite para que os estudantes se matriculem.
                        </p>
                        <div className="flex justify-center space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => copyClassCode(selectedClass.code)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Código
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => copyInviteLink(selectedClass.code)}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Link className="w-4 h-4 mr-2" />
                            Copiar Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* MODAL DE DETALHES DO ESTUDANTE */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className={`${isMobile ? 'w-[calc(100%-2rem)] mx-auto' : 'sm:max-w-[600px]'} max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                <span className="text-base sm:text-lg">Detalhes do Estudante</span>
              </div>
              <span className="text-sm text-gray-500">Módulo 1</span>
            </DialogTitle>
          </DialogHeader>
          
          {loadingStudentData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados do estudante...</p>
              </div>
            </div>
          ) : studentModule1Data ? (
            <div className="space-y-6">
              {/* Informações básicas */}
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                        {studentModule1Data.student.studentName}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm truncate">{studentModule1Data.student.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas do Módulo 1 */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                      <div className="text-base sm:text-lg font-bold text-blue-600">
                        {studentModule1Data.stats.progressPercentage}%
                      </div>
                      <div className="text-xs text-gray-600">Progresso</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center">
                      <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-1 sm:mb-2" />
                      <div className="text-base sm:text-lg font-bold text-yellow-600">
                        {studentModule1Data.stats.bestScore}
                      </div>
                      <div className="text-xs text-gray-600">Melhor Nota</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center">
                      <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                      <div className="text-base sm:text-lg font-bold text-green-600">
                        {studentModule1Data.stats.totalAttempts}
                      </div>
                      <div className="text-xs text-gray-600">Tentativas</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-2 sm:p-3">
                    <div className="text-center">
                      {studentModule1Data.stats.isCompleted ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                      ) : (
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                      )}
                      <div className={`text-sm sm:text-lg font-bold ${studentModule1Data.stats.isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                        {studentModule1Data.stats.isCompleted ? 'Completo' : 'Em Andamento'}
                      </div>
                      <div className="text-xs text-gray-600">Status</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Última atividade */}
              {studentModule1Data.stats.lastActivityDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Timer className="w-4 h-4" />
                      <span>Última Atividade</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      {safeToLocaleDateString(studentModule1Data.stats.lastActivityDate, 'pt-BR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de tentativas */}
              {studentModule1Data.quizAttempts?.length > 0 && (
                <Card>
                  <CardHeader className="p-3 sm:p-4">
                    <CardTitle className="text-sm flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Histórico de Tentativas</span>
                      </div>
                      <span className="text-xs text-gray-500">(Últimas {Math.min(5, studentModule1Data.quizAttempts.length)})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-2">
                      {studentModule1Data.quizAttempts.slice(0, 5).map((attempt: any, index: number) => (
                        <div key={attempt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-gray-50 rounded gap-2">
                          <div className="flex items-center justify-between sm:justify-start sm:space-x-3">
                            <Badge variant={attempt.completed ? 'default' : 'secondary'} className="text-xs">
                              Tentativa {index + 1}
                            </Badge>
                            <span className="text-xs sm:text-sm text-gray-600">
                              {new Date(attempt.timestamp.seconds * 1000).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <span className="font-medium text-sm">Nota: {attempt.score || 0}</span>
                            {attempt.completed && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum dado encontrado para este estudante no Módulo 1.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de convites */}
      {showInviteModal && inviteClass && (
        <ClassInviteModal
          isOpen={showInviteModal}
          onClose={closeInviteModal}
          classInfo={inviteClass}
        />
      )}
    </div>
  )
}

interface EnhancedClassCardProps {
  classInfo: ClassInfo
  isSelected: boolean
  onSelect: () => void
  onCopyCode: () => void
  onCopyInviteLink: () => void
  onViewDetails?: () => void
  onShowInvites?: () => void
  onRestore?: () => void
}

function EnhancedClassCard({ 
  classInfo, 
  isSelected, 
  onSelect, 
  onCopyCode, 
  onCopyInviteLink,
  onViewDetails,
  onShowInvites,
  onRestore 
}: EnhancedClassCardProps) {
  const getStatusInfo = () => {
    // Verificar se a turma está excluída
    if (classInfo.status === 'deleted') {
      return { color: 'red', label: 'Turma Excluída', icon: Trash2 }
    }
    if (classInfo.studentsCount === 0) {
      return { color: 'gray', label: 'Aguardando Matrículas', icon: Clock }
    }
    if (classInfo.avgProgress >= 75) {
      return { color: 'green', label: 'Excelente Progresso', icon: Star }
    }
    if (classInfo.avgProgress >= 50) {
      return { color: 'blue', label: 'Bom Progresso', icon: TrendingUp }
    }
    return { color: 'yellow', label: 'Início do Curso', icon: Target }
  }

  const status = getStatusInfo()
  const StatusIcon = status.icon

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
        classInfo.status === 'deleted' 
          ? 'opacity-75 bg-gray-50 border-red-200 hover:shadow-md' 
          : isSelected 
            ? 'ring-2 ring-indigo-500 border-indigo-200 shadow-lg' 
            : 'hover:shadow-md border-gray-200'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-1">{classInfo.name}</h3>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center space-x-1 sm:space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{classInfo.semester} {classInfo.year}</span>
            </div>
          </div>
          
          {/* Status e Badges */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                <StatusIcon className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
                  status.color === 'green' ? 'text-green-600' :
                  status.color === 'blue' ? 'text-blue-600' :
                  status.color === 'yellow' ? 'text-yellow-600' :
                  status.color === 'red' ? 'text-red-600' : 'text-gray-600'
                }`} />
                <span className={`text-xs font-medium truncate ${
                  status.color === 'green' ? 'text-green-700' :
                  status.color === 'blue' ? 'text-blue-700' :
                  status.color === 'yellow' ? 'text-yellow-700' :
                  status.color === 'red' ? 'text-red-700' : 'text-gray-700'
                }`}>
                  {status.label}
                </span>
              </div>
              
              <Badge variant="outline" className="text-xs font-mono px-2 py-0.5">
                {classInfo.code}
              </Badge>
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 py-2 sm:py-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-base sm:text-lg lg:text-xl font-bold text-indigo-600">{classInfo.studentsCount}</div>
              <div className="text-xs text-gray-600">Estudantes</div>
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg lg:text-xl font-bold text-green-600">{classInfo.avgProgress}%</div>
              <div className="text-xs text-gray-600">Progresso</div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex flex-col space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Se a turma está excluída, mostrar botão de restauração */}
            {classInfo.status === 'deleted' ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRestore}
                className="w-full text-xs h-7 sm:h-8 px-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="w-3 h-3 mr-0.5 sm:mr-1" />
                Restaurar Turma
              </Button>
            ) : (
              <div className="flex space-x-1.5 sm:space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCopyCode}
                  className="flex-1 text-xs h-7 sm:h-8 px-2"
                >
                  <Copy className="w-3 h-3 mr-0.5 sm:mr-1" />
                  Código
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onShowInvites || (() => onCopyInviteLink())}
                  className="flex-1 text-xs h-7 sm:h-8 px-2 border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Share className="w-3 h-3 mr-0.5 sm:mr-1" />
                  Convite
                </Button>
              </div>
            )}
            {onViewDetails && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onViewDetails}
                className="w-full text-xs h-7 sm:h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Eye className="w-3 h-3 mr-0.5 sm:mr-1" />
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EnhancedStudentRow({ student, totalModules, onStudentClick }: {
  student: EnhancedStudentOverview
  totalModules: number
  onStudentClick?: (student: EnhancedStudentOverview) => void
}) {
  return (
    <Card 
      className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500 cursor-pointer hover:bg-gray-50"
      onClick={() => onStudentClick?.(student)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm flex-shrink-0
              ${student.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              #{student.classRank}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student.studentName}</div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center space-x-2 mt-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-6">
            <div className="text-center flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-indigo-600">
                {student.completedModules} / {totalModules}
              </div>
              <div className="text-xs text-gray-600">Módulos Concluídos</div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-green-600">{student.totalNormalizedScore}</div>
              <div className="text-xs text-gray-600">Pontuação Total</div>
            </div>
            <Badge 
              variant={student.isActive ? 'default' : 'secondary'}
              className={`px-2 sm:px-3 py-1 text-xs flex-shrink-0 ${
                student.isActive 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {student.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

{/* Componente para turmas excluídas */}
interface DeletedClassCardProps {
  deletedClass: DeletedClass
  onRestore: () => void
}

function DeletedClassCard({ deletedClass, onRestore }: DeletedClassCardProps) {
  const { originalData, deletedAt, deletedByName, expiresAt, reason, canRestore, daysRemaining } = deletedClass
  
  const getUrgencyLevel = () => {
    if (daysRemaining <= 0) return 'critical'
    if (daysRemaining <= 3) return 'critical'
    if (daysRemaining <= 7) return 'warning'
    return 'safe'
  }

  const urgencyLevel = getUrgencyLevel()

  return (
    <Card className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
      urgencyLevel === 'critical' ? 'border-red-300 bg-red-50' :
      urgencyLevel === 'warning' ? 'border-yellow-300 bg-yellow-50' :
      'border-gray-300 bg-gray-50'
    }`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header da turma excluída */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                {originalData.name}
              </h3>
              <div className="text-xs text-gray-600 flex items-center space-x-2 mt-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>{originalData.semester} {originalData.year}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Código: <span className="font-mono">{originalData.code}</span>
              </div>
            </div>
            
            {/* Badge de status excluído */}
            <Badge variant="destructive" className="flex items-center gap-1 text-xs px-2 py-1">
              <Trash2 className="w-3 h-3" />
              Excluída
            </Badge>
          </div>

          {/* Contagem regressiva */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Tempo para exclusão permanente:</span>
            </div>
            <CountdownTimer
              expiresAt={expiresAt.toDate()}
              variant="detailed"
              showIcon={true}
              className="w-full"
            />
          </div>

          {/* Informações de exclusão */}
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <span>Excluída por:</span>
              <span className="font-medium">{deletedByName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data de exclusão:</span>
              <span>{deletedAt.toDate().toLocaleDateString('pt-BR')}</span>
            </div>
            {reason && (
              <div className="pt-1">
                <span className="block text-gray-500">Motivo:</span>
                <span className="text-gray-700 italic">"{reason}"</span>
              </div>
            )}
          </div>

          {/* Estatísticas da turma (preservadas) */}
          <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{originalData.studentsCount || 0}</div>
              <div className="text-xs text-gray-500">Estudantes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{originalData.avgProgress || 0}%</div>
              <div className="text-xs text-gray-500">Progresso</div>
            </div>
          </div>

          {/* Ações */}
          <div className="pt-3 border-t border-gray-200">
            {canRestore ? (
              <Button
                onClick={onRestore}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white h-9"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar Turma
              </Button>
            ) : (
              <div className="text-center">
                <Button
                  disabled
                  size="sm"
                  variant="outline"
                  className="w-full border-red-300 text-red-600 h-9 cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Prazo Expirado
                </Button>
                <p className="text-xs text-red-600 mt-2">
                  Esta turma não pode mais ser restaurada
                </p>
              </div>
            )}
          </div>

          {/* Indicador de urgência */}
          {urgencyLevel === 'critical' && daysRemaining > 0 && (
            <div className="absolute top-2 right-2">
              <div className="animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ImprovedClassManagement