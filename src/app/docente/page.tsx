'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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

// 🎯 CACHE INTELIGENTE
const cacheManager = {
  data: new Map<string, { value: any, timestamp: number }>(),
  TTL: 5 * 60 * 1000, // 5 minutos
  
  get<T>(key: string): T | null {
    const cached = this.data.get(key)
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.value
    }
    this.data.delete(key)
    return null
  },
  
  set<T>(key: string, value: T): void {
    this.data.set(key, { value, timestamp: Date.now() })
  },
  
  clear(): void {
    this.data.clear()
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

  // 🎯 FUNÇÃO PRINCIPAL PARA BUSCAR DADOS
  const fetchAllStudents = useCallback(async (useCache = true): Promise<StudentWithRanking[]> => {
    const cacheKey = 'all-students-data'
    
    if (useCache) {
      const cached = cacheManager.get<StudentWithRanking[]>(cacheKey)
      if (cached) {
        console.log('📦 Usando dados do cache')
        return cached
      }
    }

    console.log('🔄 Buscando dados atualizados do Firebase...')
    
    try {
      if (!db) throw new Error('Firebase não disponível')

      // Buscar todas as turmas ativas
      const classesSnapshot = await getDocs(
        query(
          collection(db, 'classes'),
          where('status', 'in', ['active', 'open', 'closed'])
        )
      )

      const allStudents: StudentWithRanking[] = []
      const processedStudentIds = new Set<string>()

      // Processar cada turma
      for (const classDoc of classesSnapshot.docs) {
        const classId = classDoc.id
        console.log(`📚 Processando turma: ${classId}`)

        try {
          // Buscar estudantes usando enhancedClassService
          const classStudents = await enhancedClassService.getEnhancedClassStudents(classId)
          
          classStudents.forEach(student => {
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
                // Garantir campos obrigatórios
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
          })
          
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar estudantes da turma ${classId}:`, error)
        }
      }

      // Ordenar por pontuação e calcular rankings
      const sortedStudents = allStudents
        .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
        .map((student, index) => ({
          ...student,
          rank: index + 1
        }))

      console.log(`✅ Total de estudantes processados: ${sortedStudents.length}`)
      
      // Cache dos resultados
      cacheManager.set(cacheKey, sortedStudents)
      
      return sortedStudents

    } catch (error) {
      console.error('❌ Erro ao buscar estudantes:', error)
      return []
    }
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

  // 🎯 FUNÇÃO PARA DETERMINAR COR DO STATUS
  const getStatusColor = (student: any): 'green' | 'yellow' | 'red' | 'gray' => {
    if (student.status !== 'active') return 'gray'
    
    const daysSinceActivity = (Date.now() - new Date(student.lastActivity).getTime()) / (24 * 60 * 60 * 1000)
    const progress = student.overallProgress || 0
    
    if (daysSinceActivity <= 1 && progress > 50) return 'green'
    if (daysSinceActivity <= 3 && progress > 25) return 'yellow'
    return 'red'
  }

  // 🎯 CARREGAMENTO INICIAL
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const studentsData = await fetchAllStudents()
        setStudents(studentsData)
        setStats(calculateStats(studentsData))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [fetchAllStudents, calculateStats])

  // 🎯 FUNÇÃO DE REFRESH
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    cacheManager.clear()
    try {
      const studentsData = await fetchAllStudents(false)
      setStudents(studentsData)
      setStats(calculateStats(studentsData))
    } catch (error) {
      console.error('Erro ao atualizar dados:', error)
    } finally {
      setRefreshing(false)
    }
  }, [fetchAllStudents, calculateStats])

  // 🎯 ESTUDANTES FILTRADOS
  const filteredStudents = useMemo(() => {
    let filtered = [...students]

    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(student => 
        student.studentName.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.displayId.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por status
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

    // Filtro por progresso
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

    // Ordenação
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
  }, [students, filters])

  // 🎯 CONFIGURAÇÃO DAS COLUNAS DA TABELA
  const studentColumns = [
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
  ]

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

      {/* 🎯 STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total de Estudantes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
            <p className="text-xs opacity-75">em toda a plataforma</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Estudantes Ativos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats?.activeStudents || 0}</div>
            <p className="text-xs opacity-75">
              {stats?.totalStudents ? Math.round(((stats.activeStudents || 0) / stats.totalStudents) * 100) : 0}% de engajamento
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{Math.round(stats?.avgProgress || 0)}%</div>
            <p className="text-xs opacity-75">dos módulos concluídos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pontuação Média</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{(stats?.avgScore || 0).toFixed(1)}</div>
            <p className="text-xs opacity-75">pontos por estudante</p>
          </CardContent>
        </Card>
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

        {/* 🎯 TAB: VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6">
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
        </TabsContent>

        {/* 🎯 TAB: RANKING COMPLETO */}
        <TabsContent value="ranking" className="space-y-6">
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
        </TabsContent>

        {/* 🎯 TAB: TODOS OS ESTUDANTES */}
        <TabsContent value="students" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}