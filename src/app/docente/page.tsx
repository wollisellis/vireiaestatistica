'use client'

import React, { useState, useEffect, useCallback, useMemo, memo, startTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { 
  Users, 
  Trophy, 
  Target, 
  Activity, 
  BookOpen,
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Star,
  Award,
  Eye,
  User,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EnhancedStudentOverview } from '@/types/classes'
import { enhancedClassService } from '@/services/enhancedClassService'
import unifiedScoringService from '@/services/unifiedScoringService'
import { useResponsive } from '@/hooks/useResponsive'
import { ResponsiveTable } from '@/components/ui/ResponsiveTable'

// 🎯 TIPOS E INTERFACES
interface StudentWithRanking extends EnhancedStudentOverview {
  rank: number
  displayId: string
  statusColor: 'green' | 'yellow' | 'red' | 'gray'
  progressPercentage: number
}

interface AggregatedStats {
  totalStudents: number
  activeStudents: number
  avgProgress: number
  avgScore: number
  topPerformers: StudentWithRanking[]
  completionRate: number
  totalTimeSpent: number
}

interface DocenteFilters {
  search: string
  status: 'all' | 'active' | 'inactive' | 'completed'
  progress: 'all' | 'high' | 'medium' | 'low' | 'none'
  sortBy: 'rank' | 'score' | 'progress' | 'lastActivity' | 'name'
  sortOrder: 'asc' | 'desc'
}

// 🚀 COMPONENTES MEMOIZADOS PARA PERFORMANCE
const StatsCard = memo(({ title, value, subtitle, gradient, icon }: {
  title: string
  value: string | number
  subtitle: string
  gradient: string
  icon: React.ReactNode
}) => (
  <Card className={`${gradient} text-white`}>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium opacity-90 flex items-center">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs opacity-75">{subtitle}</p>
    </CardContent>
  </Card>
))

const StudentRankCard = memo(({ student, index }: {
  student: StudentWithRanking
  index: number
}) => (
  <motion.div
    key={student.studentId}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <div className="flex items-center space-x-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        index === 0 ? 'bg-yellow-500 text-white' :
        index === 1 ? 'bg-gray-400 text-white' :
        index === 2 ? 'bg-orange-500 text-white' :
        'bg-gray-300 text-gray-700'
      }`}>
        {index + 1}
      </div>
      <div>
        <div className="font-medium">{student.studentName}</div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Hash className="w-3 h-3" />
          <span className="font-mono">{student.displayId}</span>
          <span>•</span>
          <span>{student.completedModules}/4 módulos</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-bold text-lg">{(student.totalScore || 0).toFixed(1)}</div>
      <div className="text-sm text-gray-600">{student.progressPercentage}% progresso</div>
    </div>
  </motion.div>
))

StatsCard.displayName = 'StatsCard'
StudentRankCard.displayName = 'StudentRankCard'

// 🚀 ERROR BOUNDARY CUSTOMIZADO PARA BETTER ERROR HANDLING
class DashboardErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Dashboard Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="p-6 text-center">
          <CardContent>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro no Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Ocorreu um erro inesperado. Tente atualizar a página.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// 🎯 CACHE INTELIGENTE OTIMIZADO
const cacheManager = {
  data: new Map<string, { value: any, timestamp: number }>(),
  TTL: 5 * 60 * 1000, // 5 minutos
  maxSize: 100, // Limite máximo de entradas
  
  get<T>(key: string): T | null {
    const cached = this.data.get(key)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.value
    }
    this.data.delete(key)
    return null
  },
  
  set<T>(key: string, value: T): void {
    // 🚀 PERFORMANCE: Limpar cache antigo se atingir limite
    if (this.data.size >= this.maxSize) {
      const oldestKey = this.data.keys().next().value
      if (oldestKey) {
        this.data.delete(oldestKey)
      }
    }
    
    this.data.set(key, { value, timestamp: Date.now() })
  },
  
  clear(): void {
    this.data.clear()
  },
  
  // 🚀 NOVO: Método para limpeza automática de cache expirado
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.data.entries()) {
      if (now - item.timestamp >= this.TTL) {
        this.data.delete(key)
      }
    }
  }
}

// 🚀 PERFORMANCE MONITOR para identificar gargalos
const performanceMonitor = {
  timers: new Map<string, number>(),
  
  start(label: string): void {
    if (process.env.NODE_ENV === 'development') {
      this.timers.set(label, Date.now())
      console.time(`🚀 ${label}`)
    }
  },
  
  end(label: string): number {
    if (process.env.NODE_ENV === 'development') {
      const startTime = this.timers.get(label)
      if (startTime) {
        const duration = Date.now() - startTime
        console.timeEnd(`🚀 ${label}`)
        if (duration > 1000) {
          console.warn(`⚠️ Performance Warning: '${label}' took ${duration}ms`)
        }
        this.timers.delete(label)
        return duration
      }
    }
    return 0
  },
  
  measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  }
}

export default function DocenteDashboard() {
  const { user } = useFirebaseAuth()
  const { isMobile, isTablet } = useResponsive()

  // 🎯 ESTADOS PRINCIPAIS
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [students, setStudents] = useState<StudentWithRanking[]>([])
  const [stats, setStats] = useState<AggregatedStats | null>(null)
  const [filters, setFilters] = useState<DocenteFilters>({
    search: '',
    status: 'all',
    progress: 'all',
    sortBy: 'rank',
    sortOrder: 'asc'
  })

  // 🎯 ESTADOS DA UI
  const [activeTab, setActiveTab] = useState('overview')
  const [rankingExpanded, setRankingExpanded] = useState(false)
  const [showAllRanking, setShowAllRanking] = useState(false)
  
  // 🚀 ESTADOS DE ERROR HANDLING
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const MAX_RETRY_ATTEMPTS = 3

  // 🎯 FUNÇÃO PRINCIPAL PARA BUSCAR DADOS COM ERROR HANDLING ROBUSTO
  const fetchAllStudents = useCallback(async (useCache = true, attempt = 1): Promise<StudentWithRanking[]> => {
    const cacheKey = 'all-students-data'
    
    if (useCache) {
      const cached = cacheManager.get<StudentWithRanking[]>(cacheKey)
      if (cached) {
        console.log('📦 Usando dados do cache')
        setError(null) // Limpar erros anteriores se cache funcionar
        return cached
      }
    }

    console.log(`🔄 Buscando dados atualizados do Firebase... (Tentativa ${attempt}/${MAX_RETRY_ATTEMPTS})`)
    
    try {
      // Validar Firebase
      if (!db) {
        throw new Error('Conexão com Firebase não disponível')
      }

      // Buscar todas as turmas ativas com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais de 30 segundos')), 30000)
      )
      
      const fetchPromise = getDocs(
        query(
          collection(db, 'classes'),
          where('status', 'in', ['active', 'open', 'closed'])
        )
      )
      
      const classesSnapshot = await Promise.race([fetchPromise, timeoutPromise]) as any

      const allStudents: StudentWithRanking[] = []
      const processedStudentIds = new Set<string>()
      const errors: string[] = []

      // Processar cada turma com error handling individual
      for (const classDoc of classesSnapshot.docs) {
        const classId = classDoc.id
        console.log(`📚 Processando turma: ${classId}`)

        try {
          // Buscar estudantes usando enhancedClassService
          const classStudents = await enhancedClassService.getEnhancedClassStudents(classId)
          
          classStudents.forEach(student => {
            try {
              // Evitar duplicatas
              if (!processedStudentIds.has(student.studentId)) {
                processedStudentIds.add(student.studentId)
                
                // Processar e enriquecer dados do estudante
                const enrichedStudent: StudentWithRanking = {
                  ...student,
                  rank: 0, // Será calculado depois
                  displayId: student.anonymousId || student.studentId.slice(-4).toUpperCase(),
                  statusColor: getStatusColor(student),
                  progressPercentage: Math.round(student.overallProgress || 0),
                  // Garantir campos obrigatórios com fallbacks
                  studentName: student.studentName || student.name || 'Estudante Anônimo',
                  totalScore: student.totalNormalizedScore || student.totalScore || 0,
                  completedModules: student.completedModules || 0,
                  lastActivity: student.lastActivity || new Date(),
                  overallProgress: student.overallProgress || 0,
                  totalTimeSpent: student.totalTimeSpent || 0,
                  currentStreak: student.currentStreak || 0
                }
                
                allStudents.push(enrichedStudent)
              }
            } catch (studentError) {
              console.warn(`⚠️ Erro ao processar estudante ${student.studentId}:`, studentError)
              errors.push(`Estudante ${student.studentId}: ${studentError}`)
            }
          })
          
        } catch (classError) {
          console.warn(`⚠️ Erro ao buscar estudantes da turma ${classId}:`, classError)
          errors.push(`Turma ${classId}: ${classError}`)
        }
      }

      // Verificar se conseguimos dados suficientes
      if (allStudents.length === 0 && errors.length > 0) {
        throw new Error(`Nenhum estudante encontrado. Erros: ${errors.slice(0, 3).join('; ')}`)
      }

      // Ordenar por pontuação e calcular rankings
      const sortedStudents = allStudents
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }))

      console.log(`✅ Total de estudantes processados: ${sortedStudents.length}`)
      
      // Cache dos resultados somente se tudo ocorreu bem
      if (sortedStudents.length > 0) {
        cacheManager.set(cacheKey, sortedStudents)
        setError(null) // Limpar erros anteriores
        setRetryCount(0) // Reset contador de retry
      }
      
      return sortedStudents

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error(`❌ Erro ao buscar estudantes (tentativa ${attempt}):`, error)
      
      // Retry logic para casos específicos
      if (attempt < MAX_RETRY_ATTEMPTS && shouldRetry(error)) {
        console.log(`🔄 Tentando novamente em 2 segundos...`)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)) // Backoff exponencial
        return fetchAllStudents(false, attempt + 1)
      }
      
      setError(`Erro ao carregar dados: ${errorMessage}`)
      setRetryCount(attempt)
      return []
    }
  }, [])
  
  // 🎯 FUNÇÃO HELPER PARA DETERMINAR SE DEVE TENTAR NOVAMENTE
  const shouldRetry = useCallback((error: any): boolean => {
    if (!error) return false
    
    const errorMessage = error.message?.toLowerCase() || ''
    
    // Retry para erros temporários
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'unavailable',
      'internal',
      'server error'
    ]
    
    return retryableErrors.some(keyword => errorMessage.includes(keyword))
  }, [])

  // 🎯 FUNÇÃO PARA CALCULAR ESTATÍSTICAS
  const calculateStats = useCallback((students: StudentWithRanking[]): AggregatedStats => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        avgProgress: 0,
        avgScore: 0,
        topPerformers: [],
        completionRate: 0,
        totalTimeSpent: 0
      }
    }

    const totalStudents = students.length
    const activeStudents = students.filter(s => 
      s.status === 'active' && 
      (Date.now() - new Date(s.lastActivity).getTime()) < 7 * 24 * 60 * 60 * 1000
    ).length

    const totalProgress = students.reduce((sum, s) => sum + (s.overallProgress || 0), 0)
    const totalScore = students.reduce((sum, s) => sum + (s.totalScore || 0), 0)
    const totalTime = students.reduce((sum, s) => sum + (s.totalTimeSpent || 0), 0)
    
    const completedStudents = students.filter(s => (s.overallProgress || 0) >= 100).length
    
    return {
      totalStudents,
      activeStudents,
      avgProgress: totalStudents > 0 ? totalProgress / totalStudents : 0,
      avgScore: totalStudents > 0 ? totalScore / totalStudents : 0,
      topPerformers: students.slice(0, 5),
      completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
      totalTimeSpent: totalTime
    }
  }, [])

  // 🎯 FUNÇÃO PARA DETERMINAR COR DO STATUS MEMOIZADA
  const getStatusColor = useCallback((student: any): 'green' | 'yellow' | 'red' | 'gray' => {
    if (student.status !== 'active') return 'gray'
    
    const daysSinceActivity = (Date.now() - new Date(student.lastActivity).getTime()) / (24 * 60 * 60 * 1000)
    const progress = student.overallProgress || 0
    
    if (daysSinceActivity <= 1 && progress > 50) return 'green'
    if (daysSinceActivity <= 3 && progress > 25) return 'yellow'
    return 'red'
  }, [])

  // 🎯 CARREGAMENTO INICIAL OTIMIZADO COM PERFORMANCE MONITORING
  useEffect(() => {
    let cancelled = false
    
    const loadData = async () => {
      if (cancelled) return
      
      performanceMonitor.start('Initial Data Load')
      setLoading(true)
      
      try {
        const studentsData = await performanceMonitor.measure('Fetch Students', () => 
          fetchAllStudents()
        )
        
        if (!cancelled) {
          const calculatedStats = performanceMonitor.measure('Calculate Stats', () => 
            calculateStats(studentsData)
          )
          
          // Batch state updates para evitar re-renders múltiplos
          startTransition(() => {
            setStudents(studentsData)
            setStats(calculatedStats)
            setError(null) // Limpar erros se o carregamento foi bem-sucedido
          })
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados'
          console.error('❌ Erro ao carregar dados:', error)
          setError(errorMessage)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          performanceMonitor.end('Initial Data Load')
        }
      }
    }

    loadData()
    
    // Cleanup function para cancelar requests em andamento
    return () => {
      cancelled = true
    }
  }, []) // Removidas as dependências para evitar re-renders desnecessários

  // 🎯 LIMPEZA PERIÓDICA DO CACHE
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cacheManager.cleanExpired()
    }, 60 * 1000) // Limpeza a cada minuto

    return () => clearInterval(cleanupInterval)
  }, [])

  // 🎯 FUNÇÃO DE REFRESH OTIMIZADA COM PERFORMANCE MONITORING
  const handleRefresh = useCallback(async () => {
    performanceMonitor.start('Data Refresh')
    setRefreshing(true)
    cacheManager.clear()
    
    try {
      const studentsData = await performanceMonitor.measure('Refresh Fetch', () => 
        fetchAllStudents(false)
      )
      
      const calculatedStats = performanceMonitor.measure('Refresh Stats', () => 
        calculateStats(studentsData)
      )
      
      // Batch updates para melhor performance
      startTransition(() => {
        setStudents(studentsData)
        setStats(calculatedStats)
        setError(null) // Limpar erros se o refresh foi bem-sucedido
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar dados'
      console.error('❌ Erro ao atualizar dados:', error)
      setError(errorMessage)
    } finally {
      setRefreshing(false)
      performanceMonitor.end('Data Refresh')
    }
  }, [fetchAllStudents, calculateStats])
  
  // 🎯 FUNÇÃO DE RETRY MANUAL
  const handleRetryLoad = useCallback(async () => {
    setIsRetrying(true)
    setError(null)
    cacheManager.clear()
    
    try {
      const studentsData = await fetchAllStudents(false)
      const calculatedStats = calculateStats(studentsData)
      
      startTransition(() => {
        setStudents(studentsData)
        setStats(calculatedStats)
        setRetryCount(0)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao tentar novamente'
      setError(errorMessage)
    } finally {
      setIsRetrying(false)
    }
  }, [fetchAllStudents, calculateStats])

  // 🎯 DEBOUNCED SEARCH para otimizar performance
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300) // 300ms de debounce
    
    return () => clearTimeout(timer)
  }, [filters.search])

  // 🎯 ESTUDANTES FILTRADOS OTIMIZADOS
  const filteredStudents = useMemo(() => {
    let filtered = [...students]

    // Filtro por busca com debounce
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.displayId.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por status otimizado
    if (filters.status !== 'all') {
      filtered = filtered.filter(student => {
        switch (filters.status) {
          case 'active': return student.status === 'active'
          case 'inactive': return student.status === 'inactive'
          case 'completed': return (student.overallProgress || 0) >= 100
          default: return true
        }
      })
    }

    // Filtro por progresso otimizado
    if (filters.progress !== 'all') {
      filtered = filtered.filter(student => {
        const progress = student.overallProgress || 0
        switch (filters.progress) {
          case 'high': return progress >= 75
          case 'medium': return progress >= 25 && progress < 75
          case 'low': return progress > 0 && progress < 25
          case 'none': return progress === 0
          default: return true
        }
      })
    }

    // Ordenação otimizada
    filtered.sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (filters.sortBy) {
        case 'rank':
          aVal = a.rank
          bVal = b.rank
          break
        case 'score':
          aVal = a.totalScore || 0
          bVal = b.totalScore || 0
          break
        case 'progress':
          aVal = a.overallProgress || 0
          bVal = b.overallProgress || 0
          break
        case 'lastActivity':
          aVal = new Date(a.lastActivity).getTime()
          bVal = new Date(b.lastActivity).getTime()
          break
        case 'name':
          aVal = a.studentName.toLowerCase()
          bVal = b.studentName.toLowerCase()
          break
        default:
          return 0
      }

      if (filters.sortOrder === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })

    return filtered
  }, [students, debouncedSearch, filters.status, filters.progress, filters.sortBy, filters.sortOrder])

  // 🎯 CONFIGURAÇÃO DAS COLUNAS DA TABELA MEMOIZADA
  const studentColumns = useMemo(() => [
    {
      key: 'rank',
      label: 'Rank',
      render: (student: StudentWithRanking) => (
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            student.rank === 1 ? 'bg-yellow-500 text-white' :
            student.rank === 2 ? 'bg-gray-400 text-white' :
            student.rank === 3 ? 'bg-orange-500 text-white' :
            'bg-gray-200 text-gray-700'
          }`}>
            {student.rank}
          </div>
          {student.rank <= 3 && <Trophy className="w-4 h-4 text-yellow-500" />}
        </div>
      )
    },
    {
      key: 'student',
      label: 'Estudante',
      render: (student: StudentWithRanking) => (
        <div className="space-y-1">
          <div className="font-medium">{student.studentName}</div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Hash className="w-3 h-3" />
            <span className="font-mono">{student.displayId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'progress',
      label: 'Progresso',
      render: (student: StudentWithRanking) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{student.progressPercentage}%</span>
            <Badge variant={student.progressPercentage >= 100 ? 'default' : 'secondary'}>
              {student.completedModules}/4 módulos
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                student.progressPercentage >= 100 ? 'bg-green-500' :
                student.progressPercentage >= 75 ? 'bg-blue-500' :
                student.progressPercentage >= 50 ? 'bg-yellow-500' :
                student.progressPercentage > 0 ? 'bg-orange-500' : 'bg-gray-300'
              }`}
              style={{ width: `${Math.min(student.progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'score',
      label: 'Pontuação',
      render: (student: StudentWithRanking) => (
        <div className="text-center">
          <div className="text-lg font-bold text-indigo-600">{(student.totalScore || 0).toFixed(1)}</div>
          <div className="text-xs text-gray-500">pontos</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (student: StudentWithRanking) => (
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            student.statusColor === 'green' ? 'bg-green-500' :
            student.statusColor === 'yellow' ? 'bg-yellow-500' :
            student.statusColor === 'red' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          <span className="text-sm capitalize">{student.status}</span>
        </div>
      )
    },
    {
      key: 'lastActivity',
      label: 'Última Atividade',
      render: (student: StudentWithRanking) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(student.lastActivity).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      )
    }
  ], [])

  // 🎯 ERROR STATE COM RETRY
  if (error && !loading && students.length === 0) {
    return (
      <div className="space-y-6">
        {/* Error Card */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao Carregar Dashboard
            </h3>
            <p className="text-red-700 mb-4">
              {error}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                onClick={handleRetryLoad}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </>
                )}
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Recarregar Página
              </Button>
            </div>
            
            {retryCount > 0 && (
              <div className="mt-4 text-sm text-red-600">
                Tentativas realizadas: {retryCount}/{MAX_RETRY_ATTEMPTS}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Fallback data ou instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-700">
              <BookOpen className="w-5 h-5 mr-2" />
              O que você pode fazer:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Verificar sua conexão com a internet
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Aguardar alguns minutos e tentar novamente
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Entrar em contato com o suporte se o problema persistir
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 🎯 LOADING STATE
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <Card>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
      {/* 🎯 HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Docente</h1>
          <p className="text-gray-600 mt-1">Visão unificada de todos os estudantes da plataforma</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {stats?.totalStudients || 0} estudantes
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* 🎯 STATS CARDS OTIMIZADOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total de Estudantes"
          value={stats?.totalStudents || 0}
          subtitle="em toda a plataforma"
          gradient="bg-gradient-to-r from-blue-500 to-blue-600"
          icon={<Users className="w-4 h-4 mr-2" />}
        />
        
        <StatsCard
          title="Estudantes Ativos"
          value={stats?.activeStudents || 0}
          subtitle={`${stats?.totalStudents ? Math.round(((stats.activeStudents || 0) / stats.totalStudents) * 100) : 0}% de engajamento`}
          gradient="bg-gradient-to-r from-green-500 to-green-600"
          icon={<Activity className="w-4 h-4 mr-2" />}
        />
        
        <StatsCard
          title="Progresso Médio"
          value={`${Math.round(stats?.avgProgress || 0)}%`}
          subtitle="dos módulos concluídos"
          gradient="bg-gradient-to-r from-purple-500 to-purple-600"
          icon={<Target className="w-4 h-4 mr-2" />}
        />
        
        <StatsCard
          title="Pontuação Média"
          value={(stats?.avgScore || 0).toFixed(1)}
          subtitle="pontos por estudante"
          gradient="bg-gradient-to-r from-orange-500 to-orange-600"
          icon={<Trophy className="w-4 h-4 mr-2" />}
        />
      </div>

      {/* 🎯 TABS PRINCIPAIS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="ranking">
            <Trophy className="w-4 h-4 mr-2" />
            Ranking Completo
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="w-4 h-4 mr-2" />
            Todos os Estudantes
          </TabsTrigger>
        </TabsList>

        {/* 🎯 TAB: VISÃO GERAL OTIMIZADA */}
        <TabsContent value="overview" className="space-y-6">
          <DashboardErrorBoundary>
          {/* Top 5 Performers */}
          {stats?.topPerformers && stats.topPerformers.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-xl">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Top 5 Performantes
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('ranking')}
                  >
                    Ver Ranking Completo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topPerformers.map((student, index) => (
                    <StudentRankCard
                      key={student.studentId}
                      student={student}
                      index={index}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estatísticas Adicionais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-500" />
                  Taxa de Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(stats?.completionRate || 0)}%
                </div>
                <p className="text-gray-600 text-sm">
                  dos estudantes concluíram todos os módulos
                </p>
                <div className="mt-4 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(stats?.completionRate || 0)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-green-500" />
                  Tempo Total de Estudo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round((stats?.totalTimeSpent || 0) / 60)}h
                </div>
                <p className="text-gray-600 text-sm">
                  acumulado por todos os estudantes
                </p>
                <div className="mt-4 text-xs text-gray-500">
                  Média: {Math.round((stats?.totalTimeSpent || 0) / (stats?.totalStudents || 1))} min/estudante
                </div>
              </CardContent>
            </Card>
          </div>
          </DashboardErrorBoundary>
        </TabsContent>

        {/* 🎯 TAB: RANKING COMPLETO OTIMIZADO */}
        <TabsContent value="ranking" className="space-y-6">
          <DashboardErrorBoundary>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Ranking Completo de Estudantes
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">
                Classificação por pontuação total • {filteredStudents.length} estudantes
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        student.rank === 1 ? 'bg-yellow-500 text-white' :
                        student.rank === 2 ? 'bg-gray-400 text-white' :
                        student.rank === 3 ? 'bg-orange-500 text-white' :
                        student.rank <= 10 ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {student.rank}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{student.studentName}</div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{student.displayId}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{student.completedModules}/4 módulos</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${
                            student.statusColor === 'green' ? 'text-green-600' :
                            student.statusColor === 'yellow' ? 'text-yellow-600' :
                            student.statusColor === 'red' ? 'text-red-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              student.statusColor === 'green' ? 'bg-green-500' :
                              student.statusColor === 'yellow' ? 'bg-yellow-500' :
                              student.statusColor === 'red' ? 'bg-red-500' : 'bg-gray-400'
                            }`} />
                            <span className="capitalize">{student.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-indigo-600">
                          {(student.totalScore || 0).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">pontos</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {student.progressPercentage}%
                        </div>
                        <div className="text-xs text-gray-500">progresso</div>
                      </div>
                      
                      {student.rank <= 3 && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </DashboardErrorBoundary>
        </TabsContent>

        {/* 🎯 TAB: TODOS OS ESTUDANTES OTIMIZADA */}
        <TabsContent value="students" className="space-y-6">
          <DashboardErrorBoundary>
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Filter className="w-5 h-5 mr-2" />
                Filtros e Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Busca */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, email ou ID..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status */}
                <Select value={filters.status} onValueChange={(value: any) => setFilters({...filters, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                  </SelectContent>
                </Select>

                {/* Progresso */}
                <Select value={filters.progress} onValueChange={(value: any) => setFilters({...filters, progress: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Progresso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="high">Alto (75%+)</SelectItem>
                    <SelectItem value="medium">Médio (25-75%)</SelectItem>
                    <SelectItem value="low">Baixo (1-25%)</SelectItem>
                    <SelectItem value="none">Nenhum (0%)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <Select value={`${filters.sortBy}-${filters.sortOrder}`} 
                        onValueChange={(value) => {
                          const [sortBy, sortOrder] = value.split('-')
                          setFilters({...filters, sortBy: sortBy as any, sortOrder: sortOrder as any})
                        }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rank-asc">Rank (crescente)</SelectItem>
                    <SelectItem value="score-desc">Pontuação (decrescente)</SelectItem>
                    <SelectItem value="progress-desc">Progresso (decrescente)</SelectItem>
                    <SelectItem value="lastActivity-desc">Atividade (recente)</SelectItem>
                    <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Resultados */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {filteredStudents.length} de {students.length} estudantes
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2" />
                Lista Completa de Estudantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveTable
                data={filteredStudents}
                columns={studentColumns}
                keyExtractor={(student) => student.studentId}
                emptyMessage="Nenhum estudante encontrado"
                loading={loading}
                mobileVisibleColumns={3}
                tabletVisibleColumns={4}
              />
            </CardContent>
          </Card>
          </DashboardErrorBoundary>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardErrorBoundary>
  )
}