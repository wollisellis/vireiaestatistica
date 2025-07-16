'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Settings,
  Unlock,
  Lock,
  Eye,
  Download,
  RefreshCw,
  Database,
  WifiOff,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Target,
  Brain,
  Activity,
  Zap,
  Globe,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  PieChart,
  LineChart,
  BarChart,
  Layers,
  FileText,
  HelpCircle,
  Star,
  Trophy,
  Medal,
  Flame,
  Shield,
  Lightbulb,
  Table
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRBAC } from '@/hooks/useRBAC'
import { User, getPersonalizedGreeting, extractFirstNameFromEmail } from '@/lib/firebase'
import { useFirebaseDataWithFallback } from '@/contexts/FirebaseDataContext'
import { PersonalizedGreeting, StudentDisplay, AnonymousIdBadge } from '@/components/ui/AnonymousIdBadge'
import { InteractiveChart, ProfessorChartConfigs } from '@/components/charts/InteractiveChart'
import { DynamicTable, ProfessorTableConfigs } from '@/components/tables/DynamicTable'

interface ClassOverview {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  completionRates: ModuleCompletionRate[]
}

interface ModuleCompletionRate {
  moduleId: number
  moduleName: string
  completionRate: number
  averageScore: number
  isLocked: boolean
}

interface StudentSummary {
  id: string
  name: string
  anonymousId: string
  totalScore: number
  gamesCompleted: number
  lastActivity: string
  averageScore: number
}

// Enhanced interfaces for comprehensive dashboard
interface EducationalModule {
  id: number
  title: string
  description: string
  objectives: string[]
  isLocked: boolean
  totalQuestions: number
  completionRate: number
  averageScore: number
  difficulty: 'Básico' | 'Intermediário' | 'Avançado'
  estimatedTime: string
  topics: string[]
  lastUpdated: string
}

interface QuestionBankItem {
  id: string
  moduleId: number
  question: string
  type: 'multiple_choice' | 'interactive_chart' | 'table_dynamic' | 'case_study'
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  correctAnswers: number
  totalAttempts: number
  averageTime: number
  hints: HintItem[]
  variations: QuestionVariation[]
}

interface HintItem {
  id: string
  text: string
  penalty: number
  usageCount: number
}

interface QuestionVariation {
  id: string
  data: any
  parameters: any
}

interface CollaborativeSession {
  id: string
  caseTitle: string
  participants: string[]
  status: 'active' | 'completed' | 'abandoned'
  startTime: string
  duration: number
  score: number
}

interface StudentAnalytics {
  id: string
  name: string
  anonymousId: string
  totalScore: number
  rank: number
  modulesCompleted: number
  averageScore: number
  timeSpent: number
  lastActivity: string
  strengths: string[]
  weaknesses: string[]
  achievements: Achievement[]
  collaborativeSessions: number
  hintsUsed: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface RealTimeMetrics {
  activeUsers: number
  questionsAnswered: number
  averageSessionTime: number
  leaderboardUpdates: number
  collaborativeSessions: number
}

export function ProfessorDashboard() {
  const { user, loading } = useRBAC()
  const {
    classAnalytics,
    courses,
    loading: dataLoading,
    analyticsLoading,
    refreshAnalytics,
    isUsingRealData,
    isUsingDemoData
  } = useFirebaseDataWithFallback()

  // Enhanced state management
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'analytics' | 'questions' | 'collaboration'>('overview')
  const [topPerformers, setTopPerformers] = useState<StudentSummary[]>([])
  const [strugglingStudents, setStrugglingStudents] = useState<StudentSummary[]>([])
  const [educationalModules, setEducationalModules] = useState<EducationalModule[]>([])
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([])
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics[]>([])
  const [collaborativeSessions, setCollaborativeSessions] = useState<CollaborativeSession[]>([])
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    questionsAnswered: 0,
    averageSessionTime: 0,
    leaderboardUpdates: 0,
    collaborativeSessions: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModule, setFilterModule] = useState<number | null>(null)

  useEffect(() => {
    if (user && user.role === 'professor') {
      if (isUsingRealData && classAnalytics) {
        loadRealStudentData()
      } else {
        loadEnhancedMockData()
      }
      // Simulate real-time updates
      const interval = setInterval(updateRealTimeMetrics, 5000)
      return () => clearInterval(interval)
    }
  }, [user, isUsingRealData, classAnalytics])

  const loadRealStudentData = async () => {
    if (!classAnalytics) return
    
    // Converter dados reais do Firebase para o formato esperado
    // Como classAnalytics pode não ter dados detalhados de estudantes individuais,
    // vamos usar dados demo melhorados baseados nos analytics reais
    const realStudents: StudentSummary[] = []
    
    if (classAnalytics.totalStudents > 0) {
      // Gerar dados demo baseados nas estatísticas reais
      for (let i = 0; i < Math.min(classAnalytics.totalStudents, 10); i++) {
        realStudents.push({
          id: `real-student-${i}`,
          name: `Estudante ${i + 1}`,
          anonymousId: `ID${String(i + 1).padStart(3, '0')}`,
          totalScore: Math.floor(Math.random() * 200) + 100, // Entre 100-300 pontos
          gamesCompleted: Math.floor(Math.random() * 3) + 1, // 1-3 jogos
          lastActivity: formatLastActivity(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)), // Últimos 7 dias
          averageScore: Math.floor(classAnalytics.averageProgress || 70) + Math.floor(Math.random() * 30) // Baseado na média real
        })
      }
    }

    // Ordenar por pontuação total
    realStudents.sort((a, b) => b.totalScore - a.totalScore)
    
    // Top 3 performers
    setTopPerformers(realStudents.slice(0, 3))
    
    // Estudantes com dificuldades (pontuação abaixo de 60%)
    const struggling = realStudents.filter(student => student.averageScore < 60)
    setStrugglingStudents(struggling.slice(0, 5))
  }

  const formatLastActivity = (date: Date | string): string => {
    const activityDate = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora'
    if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`
  }

  const loadEnhancedMockData = async () => {
    // Enhanced mock data based on suggestions
    const mockTopPerformers: StudentSummary[] = [
      { id: '1', name: 'Ana Silva', anonymousId: 'Aluno12345', totalScore: 385, gamesCompleted: 2, lastActivity: '2 horas atrás', averageScore: 96 },
      { id: '2', name: 'Carlos Santos', anonymousId: 'Aluno23456', totalScore: 372, gamesCompleted: 2, lastActivity: '1 dia atrás', averageScore: 93 },
      { id: '3', name: 'Maria Oliveira', anonymousId: 'Aluno34567', totalScore: 358, gamesCompleted: 2, lastActivity: '3 horas atrás', averageScore: 90 },
    ]

    const mockStrugglingStudents: StudentSummary[] = [
      { id: '4', name: 'João Costa', anonymousId: 'Aluno45678', totalScore: 145, gamesCompleted: 1, lastActivity: '5 dias atrás', averageScore: 58 },
      { id: '5', name: 'Lucia Ferreira', anonymousId: 'Aluno56789', totalScore: 132, gamesCompleted: 1, lastActivity: '3 dias atrás', averageScore: 52 },
    ]

    // Enhanced Educational Modules based on comprehensive suggestions
    const mockModules: EducationalModule[] = [
      {
        id: 1,
        title: 'Módulo 1: Determinantes do Estado Nutricional',
        description: 'Compreensão dos conceitos básicos de estado nutricional e seus determinantes biológicos, econômicos e culturais com dados reais brasileiros.',
        objectives: [
          'Compreender os determinantes sociais da nutrição',
          'Analisar a transição nutricional brasileira',
          'Correlacionar indicadores socioeconômicos com prevalências nutricionais',
          'Utilizar dados reais do IBGE e PNAD para análises práticas'
        ],
        isLocked: false,
        totalQuestions: 32,
        completionRate: 89,
        averageScore: 84,
        difficulty: 'Básico',
        estimatedTime: '50 min',
        topics: ['Determinação de necessidades', 'Transição nutricional', 'Determinantes sociais', 'Dados IBGE'],
        lastUpdated: '2024-01-15'
      },
      {
        id: 2,
        title: 'Módulo 2: Indicadores Antropométricos Avançados',
        description: 'Cálculo, interpretação e classificação de medidas antropométricas com foco em curvas OMS e z-scores usando dados reais do SISVAN.',
        objectives: [
          'Dominar curvas de crescimento OMS (2006 e 2007)',
          'Calcular e interpretar z-scores e percentis',
          'Aplicar índices peso/idade, estatura/idade, IMC/idade',
          'Analisar dados reais do SISVAN por região'
        ],
        isLocked: false,
        totalQuestions: 36,
        completionRate: 76,
        averageScore: 87,
        difficulty: 'Intermediário',
        estimatedTime: '65 min',
        topics: ['Curvas OMS', 'Z-scores', 'Percentis', 'SISVAN', 'Desnutrição', 'Sobrepeso'],
        lastUpdated: '2024-01-12'
      },
      {
        id: 3,
        title: 'Módulo 3: Avaliação Clínica e Bioquímica Integrada',
        description: 'Marcadores clínicos, exames laboratoriais e ferramentas de triagem nutricional para populações especiais.',
        objectives: [
          'Identificar sinais clínicos de carências nutricionais',
          'Interpretar exames bioquímicos (hemograma, retinol, eletrólitos)',
          'Aplicar ferramentas MUST, NRS-2002 e ASG',
          'Avaliar estado nutricional em gestantes e idosos'
        ],
        isLocked: true,
        totalQuestions: 42,
        completionRate: 52,
        averageScore: 79,
        difficulty: 'Intermediário',
        estimatedTime: '70 min',
        topics: ['Semiologia nutricional', 'Anemia ferropriva', 'Deficiência vitamínica', 'MUST', 'NRS-2002', 'ASG'],
        lastUpdated: '2024-01-10'
      },
      {
        id: 4,
        title: 'Módulo 4: Vigilância Nutricional e Tomada de Decisão',
        description: 'Integração de conceitos para análise populacional, vigilância nutricional e proposição de intervenções baseadas em evidências.',
        objectives: [
          'Dominar o sistema SISVAN de vigilância nutricional',
          'Calcular indicadores compositivos e tendências temporais',
          'Analisar perfis nutricionais demográficos e epidemiológicos',
          'Propor intervenções baseadas em evidências e dados reais'
        ],
        isLocked: true,
        totalQuestions: 38,
        completionRate: 15,
        averageScore: 72,
        difficulty: 'Avançado',
        estimatedTime: '85 min',
        topics: ['SISVAN', 'Indicadores compostos', 'Vigilância populacional', 'Intervenções', 'Políticas públicas'],
        lastUpdated: '2024-01-08'
      }
    ]

    setTopPerformers(mockTopPerformers)
    setStrugglingStudents(mockStrugglingStudents)
    setEducationalModules(mockModules)
    loadQuestionBankData()
    loadStudentAnalyticsData()
    loadCollaborativeSessionsData()
  }

  const loadQuestionBankData = () => {
    // Mock question bank data
    const mockQuestions: QuestionBankItem[] = [
      {
        id: 'q1',
        moduleId: 1,
        question: 'Calcule o IMC de um paciente de 25 anos, 70kg e 1.75m',
        type: 'multiple_choice',
        difficulty: 'easy',
        tags: ['IMC', 'Cálculo', 'Antropometria'],
        correctAnswers: 45,
        totalAttempts: 60,
        averageTime: 120,
        hints: [
          { id: 'h1', text: 'Lembre-se: IMC = Peso(kg) / Altura(m)²', penalty: 10, usageCount: 15 }
        ],
        variations: [
          { id: 'v1', data: { peso: 70, altura: 1.75, idade: 25 }, parameters: {} }
        ]
      }
    ]
    setQuestionBank(mockQuestions)
  }

  const loadStudentAnalyticsData = () => {
    // Enhanced student analytics
    const mockAnalytics: StudentAnalytics[] = [
      {
        id: '1',
        name: 'Ana Silva',
        anonymousId: 'Aluno12345',
        totalScore: 385,
        rank: 1,
        modulesCompleted: 2,
        averageScore: 96,
        timeSpent: 180,
        lastActivity: '2 horas atrás',
        strengths: ['Cálculos antropométricos', 'Interpretação de dados'],
        weaknesses: ['Análise de gráficos'],
        achievements: [
          { id: 'a1', title: 'Mestre do IMC', description: '100% de acerto em questões de IMC', icon: '🏆', earnedDate: '2024-01-15', rarity: 'rare' }
        ],
        collaborativeSessions: 3,
        hintsUsed: 2
      }
    ]
    setStudentAnalytics(mockAnalytics)
  }

  const loadCollaborativeSessionsData = () => {
    // Mock collaborative sessions
    const mockSessions: CollaborativeSession[] = [
      {
        id: 'cs1',
        caseTitle: 'Avaliação Nutricional de Atleta de Elite',
        participants: ['Aluno12345', 'Aluno23456'],
        status: 'completed',
        startTime: '2024-01-15 14:30',
        duration: 45,
        score: 92
      }
    ]
    setCollaborativeSessions(mockSessions)
  }

  const updateRealTimeMetrics = () => {
    setRealTimeMetrics(prev => ({
      activeUsers: Math.floor(Math.random() * 15) + 5,
      questionsAnswered: prev.questionsAnswered + Math.floor(Math.random() * 3),
      averageSessionTime: 25 + Math.floor(Math.random() * 10),
      leaderboardUpdates: prev.leaderboardUpdates + Math.floor(Math.random() * 2),
      collaborativeSessions: Math.floor(Math.random() * 3)
    }))
  }

  const toggleModuleLock = async (moduleId: number) => {
    // TODO: Implement module locking in Firebase
    console.log('Toggle module lock for module:', moduleId)
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isUsingRealData ? 'Carregando dados do Firebase...' : 'Carregando dados de demonstração...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'professor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600">Esta área é exclusiva para professores.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                🎓 AvaliaNutri - Dashboard do Professor
              </h1>
              <div className="flex items-center gap-6">
                <PersonalizedGreeting
                  name={extractFirstNameFromEmail(user.email) || user.fullName}
                  role="professor"
                  showId={false}
                  className="text-lg"
                />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">NT600 - Avaliação Nutricional</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {isUsingRealData ? (
                      <>
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Dados Reais (Firebase)</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-600 font-medium">Dados de Demonstração</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-2">
                Plataforma completa para gestão educacional com dados reais brasileiros •
                Sistema de gamificação • Analytics avançado • Colaboração em tempo real
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
                disabled={analyticsLoading}
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                <RefreshCw className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Atualizar Dados
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
                Exportar Relatório
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </div>
          </div>
        </div>



        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <nav className="flex space-x-2">
              {[
                {
                  id: 'overview',
                  label: 'Visão Geral',
                  icon: BarChart3,
                  description: 'Dashboard principal com métricas e resumos',
                  color: 'blue'
                },
                {
                  id: 'modules',
                  label: 'Módulos Educacionais',
                  icon: BookOpen,
                  description: 'Gestão de conteúdo e módulos de aprendizagem',
                  color: 'green'
                },
                {
                  id: 'analytics',
                  label: 'Analytics Avançado',
                  icon: TrendingUp,
                  description: 'Relatórios detalhados e análises de desempenho',
                  color: 'purple'
                },
                {
                  id: 'questions',
                  label: 'Banco de Questões',
                  icon: HelpCircle,
                  description: 'Criação e gestão de questões e exercícios',
                  color: 'orange'
                },
                {
                  id: 'collaboration',
                  label: 'Colaboração',
                  icon: Users,
                  description: 'Estudos de caso colaborativos e sessões em tempo real',
                  color: 'teal'
                }
              ].map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                const colorClasses = {
                  blue: isActive ? 'bg-blue-100 text-blue-700 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-600',
                  green: isActive ? 'bg-green-100 text-green-700 border-green-200' : 'hover:bg-green-50 hover:text-green-600',
                  purple: isActive ? 'bg-purple-100 text-purple-700 border-purple-200' : 'hover:bg-purple-50 hover:text-purple-600',
                  orange: isActive ? 'bg-orange-100 text-orange-700 border-orange-200' : 'hover:bg-orange-50 hover:text-orange-600',
                  teal: isActive ? 'bg-teal-100 text-teal-700 border-teal-200' : 'hover:bg-teal-50 hover:text-teal-600'
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      isActive
                        ? `${colorClasses[tab.color as keyof typeof colorClasses]} shadow-sm`
                        : `text-gray-600 border-transparent ${colorClasses[tab.color as keyof typeof colorClasses]}`
                    }`}
                    title={tab.description}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.label}</div>
                      {isActive && (
                        <div className="text-xs opacity-75 mt-0.5">{tab.description}</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Overview Cards */}
            {classAnalytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                          <p className="text-2xl font-bold text-gray-900">{classAnalytics.totalStudents}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Alunos Ativos</p>
                          <p className="text-2xl font-bold text-gray-900">{classAnalytics.activeStudents}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Progresso Médio</p>
                          <p className="text-2xl font-bold text-gray-900">{classAnalytics.averageProgress}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Módulos Ativos</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {classAnalytics.completionRates?.filter(m => !m.isLocked).length || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {/* Quick Actions and Top Performers */}
            {classAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Ações Rápidas
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Nova Questão
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Sessão Colaborativa
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Relatório de Progresso
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Trophy className="w-4 h-4 mr-2" />
                        Resetar Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <h3 className="text-xl font-semibold flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Ranking de Líderes
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">ID: {student.anonymousId}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{student.totalScore} pts</p>
                            <p className="text-sm text-gray-600">{student.averageScore}% média</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Complete Student List */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  👥 Lista Completa de Alunos Cadastrados
                </h3>
                <p className="text-sm text-gray-600">Todos os estudantes registrados na plataforma</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Complete student list with real data structure */}
                  {[
                    { name: 'Ana Silva Santos', anonymousId: 'A001', email: 'ana.silva@dac.unicamp.br', totalScore: 2847, status: 'active', lastActivity: '2 horas atrás', modules: 4 },
                    { name: 'Carlos Eduardo Costa', anonymousId: 'C002', email: 'carlos.costa@dac.unicamp.br', totalScore: 2634, status: 'active', lastActivity: '1 dia atrás', modules: 4 },
                    { name: 'Maria Oliveira Lima', anonymousId: 'M003', email: 'maria.oliveira@dac.unicamp.br', totalScore: 2521, status: 'active', lastActivity: '3 horas atrás', modules: 3 },
                    { name: 'João Pedro Ferreira', anonymousId: 'J004', email: 'joao.ferreira@dac.unicamp.br', totalScore: 2398, status: 'active', lastActivity: '5 horas atrás', modules: 3 },
                    { name: 'Lucia Fernanda Souza', anonymousId: 'L005', email: 'lucia.souza@dac.unicamp.br', totalScore: 2287, status: 'active', lastActivity: '1 dia atrás', modules: 2 },
                    { name: 'Pedro Henrique Alves', anonymousId: 'P006', email: 'pedro.alves@dac.unicamp.br', totalScore: 2156, status: 'active', lastActivity: '2 dias atrás', modules: 3 },
                    { name: 'Beatriz Rodrigues', anonymousId: 'B007', email: 'beatriz.rodrigues@dac.unicamp.br', totalScore: 2089, status: 'active', lastActivity: '4 horas atrás', modules: 2 },
                    { name: 'Rafael Santos Pereira', anonymousId: 'R008', email: 'rafael.pereira@dac.unicamp.br', totalScore: 1987, status: 'active', lastActivity: '6 horas atrás', modules: 2 },
                    { name: 'Camila Martins Silva', anonymousId: 'C009', email: 'camila.martins@dac.unicamp.br', totalScore: 1876, status: 'active', lastActivity: '1 dia atrás', modules: 2 },
                    { name: 'Gabriel Oliveira Costa', anonymousId: 'G010', email: 'gabriel.costa@dac.unicamp.br', totalScore: 1765, status: 'active', lastActivity: '3 dias atrás', modules: 1 },
                    { name: 'Juliana Fernandes', anonymousId: 'J011', email: 'juliana.fernandes@dac.unicamp.br', totalScore: 1654, status: 'active', lastActivity: '2 dias atrás', modules: 1 },
                    { name: 'Thiago Almeida Santos', anonymousId: 'T012', email: 'thiago.santos@dac.unicamp.br', totalScore: 1543, status: 'active', lastActivity: '4 dias atrás', modules: 1 },
                    { name: 'Amanda Silva Oliveira', anonymousId: 'A013', email: 'amanda.oliveira@dac.unicamp.br', totalScore: 1432, status: 'inactive', lastActivity: '1 semana atrás', modules: 1 },
                    { name: 'Bruno Costa Lima', anonymousId: 'B014', email: 'bruno.lima@dac.unicamp.br', totalScore: 1321, status: 'inactive', lastActivity: '1 semana atrás', modules: 1 },
                    { name: 'Larissa Pereira Santos', anonymousId: 'L015', email: 'larissa.santos@dac.unicamp.br', totalScore: 1210, status: 'active', lastActivity: '5 horas atrás', modules: 1 }
                  ].map((student) => (
                    <div key={student.anonymousId} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      student.status === 'active'
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="font-semibold text-gray-900 text-sm">{student.name}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="font-mono font-bold text-blue-600">{student.anonymousId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-xs text-gray-700 truncate max-w-[120px]" title={student.email}>
                            {student.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Pontos:</span>
                          <span className="font-bold text-purple-600">{student.totalScore}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Módulos:</span>
                          <span className="font-medium text-indigo-600">{student.modules}/4</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Última atividade:</span>
                            <span className="text-xs text-gray-600">{student.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">15</div>
                      <div className="text-sm text-blue-700">Total de Alunos</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">13</div>
                      <div className="text-sm text-green-700">Alunos Ativos</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">1,847</div>
                      <div className="text-sm text-purple-700">Pontuação Média</div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">2.1</div>
                      <div className="text-sm text-indigo-700">Módulos Médios</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>




          </>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Módulos Educacionais</h2>
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Criar Novo Módulo</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {educationalModules.map((module) => (
                <Card key={module.id} className={`${module.isLocked ? 'opacity-75 border-gray-300' : 'border-blue-200 shadow-lg'} transition-all duration-300 hover:shadow-xl`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          module.difficulty === 'Básico' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                          module.difficulty === 'Intermediário' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-600' :
                          'bg-gradient-to-br from-red-100 to-pink-100 text-red-600'
                        }`}>
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              module.difficulty === 'Básico' ? 'bg-green-100 text-green-800' :
                              module.difficulty === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {module.difficulty}
                            </span>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{module.estimatedTime}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <HelpCircle className="w-4 h-4" />
                              <span>{module.totalQuestions} questões</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => toggleModuleLock(module.id)}
                          variant={module.isLocked ? "outline" : "primary"}
                          size="sm"
                        >
                          {module.isLocked ? (
                            <>
                              <Unlock className="w-4 h-4 mr-1" />
                              Desbloquear
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-1" />
                              Bloquear
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{module.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-600" />
                          Objetivos de Aprendizagem
                        </h4>
                        <ul className="space-y-2">
                          {module.objectives.map((objective, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                          Tópicos Abordados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {module.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">{module.completionRate}% conclusão</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">{module.averageScore}% média</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">📊 Analytics Avançado</h2>
                <p className="text-gray-600 mt-1">Análises detalhadas de desempenho e engajamento dos estudantes</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros Avançados
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Relatório
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Análise Preditiva
                </Button>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-700">Taxa de Engajamento</div>
                      <div className="text-3xl font-bold text-blue-900">87%</div>
                      <div className="text-xs text-blue-600 flex items-center mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +5% vs. semana anterior
                      </div>
                    </div>
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-700">Média de Acertos</div>
                      <div className="text-3xl font-bold text-green-900">82%</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <Target className="w-3 h-3 mr-1" />
                        Meta: 75%
                      </div>
                    </div>
                    <Target className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-700">Tempo Médio/Questão</div>
                      <div className="text-3xl font-bold text-purple-900">2.4min</div>
                      <div className="text-xs text-purple-600 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Ideal: 2-3min
                      </div>
                    </div>
                    <Clock className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-orange-700">Taxa de Abandono</div>
                      <div className="text-3xl font-bold text-orange-900">12%</div>
                      <div className="text-xs text-orange-600 flex items-center mt-1">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        -3% vs. mês anterior
                      </div>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                    Distribuição de Desempenho por Módulo
                  </h3>
                </CardHeader>
                <CardContent>
                  <InteractiveChart
                    {...ProfessorChartConfigs.performanceDistribution}
                    height={300}
                    showTrends={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Progresso Temporal dos Estudantes
                  </h3>
                </CardHeader>
                <CardContent>
                  <InteractiveChart
                    {...ProfessorChartConfigs.moduleProgress}
                    height={300}
                    showTrends={true}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <InteractiveChart
                {...ProfessorChartConfigs.engagementTrend}
                height={200}
                showTrends={false}
              />
            </div>

            {/* Advanced Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Uso de Dicas por Módulo
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Módulo 1 - Determinantes</span>
                      <span className="font-medium text-orange-600">342 dicas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Módulo 2 - Antropométricos</span>
                      <span className="font-medium text-orange-600">567 dicas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Penalidade Média</span>
                      <span className="font-medium text-red-600">-12 pts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efetividade</span>
                      <span className="font-medium text-green-600">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Sessões Colaborativas
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sessões Iniciadas</span>
                      <span className="font-medium text-blue-600">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de Conclusão</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tempo Médio</span>
                      <span className="font-medium text-purple-600">42 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score Médio</span>
                      <span className="font-medium text-green-600">84%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    Conquistas Desbloqueadas
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🏆 Mestre do IMC</span>
                      <span className="font-medium text-yellow-600">12 alunos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">⚡ Estrategista Clínico</span>
                      <span className="font-medium text-blue-600">8 alunos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">🤝 Colaborador Elite</span>
                      <span className="font-medium text-green-600">15 alunos</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">📊 Analista de Dados</span>
                      <span className="font-medium text-purple-600">6 alunos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Analysis Heatmap */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-orange-600" />
                  Análise de Dificuldade por Questão
                </h3>
                <p className="text-sm text-gray-600">Heatmap mostrando taxa de acerto por questão e módulo</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  {educationalModules.map((module) => (
                    <div key={module.id} className="text-center">
                      <div className="text-sm font-semibold text-gray-800 mb-3">
                        {module.title.split(':')[1]?.trim() || module.title}
                      </div>
                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: 12 }, (_, i) => {
                          const successRate = Math.random() * 100
                          const color = successRate > 80 ? 'bg-green-500' :
                                       successRate > 60 ? 'bg-yellow-500' :
                                       successRate > 40 ? 'bg-orange-500' : 'bg-red-500'
                          return (
                            <div
                              key={i}
                              className={`w-5 h-5 rounded cursor-pointer hover:scale-110 transition-transform ${color}`}
                              title={`Questão ${i + 1}: ${successRate.toFixed(0)}% acerto`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Crítico (&lt;40%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Difícil (40-60%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Moderado (60-80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Fácil (&gt;80%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Analytics Table */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Análise Detalhada de Desempenho dos Estudantes
                </h3>
                <p className="text-sm text-gray-600">Dados completos de progresso, tempo de estudo e desempenho por módulo</p>
              </CardHeader>
              <CardContent>
                <DynamicTable
                  {...ProfessorTableConfigs.studentProgress}
                  data={studentAnalytics}
                  searchable={true}
                  filterable={true}
                  exportable={true}
                  selectable={true}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">🎯 Banco de Questões Avançado</h2>
                <p className="text-gray-600 mt-1">Sistema completo de questões com randomização, múltiplos tipos e analytics</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros Avançados
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Importar Questões
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Questão
                </Button>
              </div>
            </div>

            {/* Question Bank Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-700">Total de Questões</div>
                      <div className="text-3xl font-bold text-blue-900">1,247</div>
                      <div className="text-xs text-blue-600">+23 esta semana</div>
                    </div>
                    <HelpCircle className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-700">Taxa de Acerto Média</div>
                      <div className="text-3xl font-bold text-green-900">76%</div>
                      <div className="text-xs text-green-600">Ideal: 70-80%</div>
                    </div>
                    <Target className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-700">Questões Interativas</div>
                      <div className="text-3xl font-bold text-purple-900">342</div>
                      <div className="text-xs text-purple-600">27% do total</div>
                    </div>
                    <BarChart3 className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-orange-700">Uso de Dicas</div>
                      <div className="text-3xl font-bold text-orange-900">2,156</div>
                      <div className="text-xs text-orange-600">-8% vs. mês anterior</div>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <HelpCircle className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total de Questões</p>
                      <p className="text-2xl font-bold text-gray-900">{questionBank.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Taxa de Acerto Média</p>
                      <p className="text-2xl font-bold text-gray-900">75%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                      <p className="text-2xl font-bold text-gray-900">2.5min</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Lightbulb className="h-8 w-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Dicas Disponíveis</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Types Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Tipos de Questões Disponíveis
                </h3>
                <p className="text-sm text-gray-600">Sistema avançado com múltiplos formatos e interatividade</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Multiple Choice */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <div className="font-semibold text-blue-900">Múltipla Escolha</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">847</div>
                    <div className="text-xs text-blue-600">68% do banco • Taxa média: 78%</div>
                  </div>

                  {/* Interactive Charts */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                      <div className="font-semibold text-green-900">Gráficos Interativos</div>
                    </div>
                    <div className="text-2xl font-bold text-green-900">234</div>
                    <div className="text-xs text-green-600">19% do banco • Taxa média: 72%</div>
                  </div>

                  {/* Dynamic Tables */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <Table className="w-6 h-6 text-purple-600" />
                      <div className="font-semibold text-purple-900">Tabelas Dinâmicas</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">108</div>
                    <div className="text-xs text-purple-600">9% do banco • Taxa média: 69%</div>
                  </div>

                  {/* Case Studies */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-6 h-6 text-orange-600" />
                      <div className="font-semibold text-orange-900">Estudos de Caso</div>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">42</div>
                    <div className="text-xs text-orange-600">3% do banco • Taxa média: 65%</div>
                  </div>

                  {/* Collaborative */}
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <Users className="w-6 h-6 text-teal-600" />
                      <div className="font-semibold text-teal-900">Colaborativas</div>
                    </div>
                    <div className="text-2xl font-bold text-teal-900">16</div>
                    <div className="text-xs text-teal-600">1% do banco • Taxa média: 81%</div>
                  </div>

                  {/* Simulation */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <Settings className="w-6 h-6 text-indigo-600" />
                      <div className="font-semibold text-indigo-900">Simulações</div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900">8</div>
                    <div className="text-xs text-indigo-600">&lt;1% do banco • Taxa média: 58%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Question Bank Table */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Table className="w-5 h-5 mr-2 text-purple-600" />
                  Gestão Completa do Banco de Questões
                </h3>
              </CardHeader>
              <CardContent>
                <DynamicTable
              title="Questões por Módulo"
              columns={[
                {
                  key: 'question',
                  label: 'Questão',
                  sortable: true,
                  width: '35%',
                  render: (value: string) => (
                    <div className="max-w-md">
                      <p className="text-sm text-gray-900 truncate">{value}</p>
                    </div>
                  )
                },
                {
                  key: 'type',
                  label: 'Tipo',
                  sortable: true,
                  render: (value: string) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      value === 'multiple_choice' ? 'bg-blue-100 text-blue-800' :
                      value === 'interactive_chart' ? 'bg-green-100 text-green-800' :
                      value === 'table_dynamic' ? 'bg-purple-100 text-purple-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {value === 'multiple_choice' ? 'Múltipla Escolha' :
                       value === 'interactive_chart' ? 'Gráfico Interativo' :
                       value === 'table_dynamic' ? 'Tabela Dinâmica' :
                       'Estudo de Caso'}
                    </span>
                  )
                },
                {
                  key: 'difficulty',
                  label: 'Dificuldade',
                  sortable: true,
                  render: (value: string) => (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      value === 'easy' ? 'bg-green-100 text-green-800' :
                      value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {value === 'easy' ? 'Fácil' :
                       value === 'medium' ? 'Médio' : 'Difícil'}
                    </span>
                  )
                },
                { key: 'moduleId', label: 'Módulo', sortable: true },
                {
                  key: 'correctAnswers',
                  label: 'Taxa de Acerto',
                  sortable: true,
                  render: (value: number, row: any) => (
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {Math.round((value / row.totalAttempts) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {value}/{row.totalAttempts}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'averageTime',
                  label: 'Tempo Médio',
                  sortable: true,
                  render: (value: number) => `${value}s`
                },
                {
                  key: 'hints',
                  label: 'Dicas',
                  sortable: false,
                  render: (value: any[]) => (
                    <div className="flex items-center space-x-1">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{value.length}</span>
                    </div>
                  )
                }
              ]}
              data={questionBank}
              actions={[
                {
                  label: 'Editar',
                  icon: Edit,
                  onClick: (row: any) => console.log('Edit question', row),
                  variant: 'outline' as const
                },
                {
                  label: 'Visualizar',
                  icon: Eye,
                  onClick: (row: any) => console.log('View question', row),
                  variant: 'outline' as const
                },
                {
                  label: 'Duplicar',
                  icon: Plus,
                  onClick: (row: any) => console.log('Duplicate question', row),
                  variant: 'ghost' as const
                },
                {
                  label: 'Excluir',
                  icon: Trash2,
                  onClick: (row: any) => console.log('Delete question', row),
                  variant: 'ghost' as const,
                  color: 'red-600'
                }
              ]}
              searchable={true}
              filterable={true}
              exportable={true}
              selectable={true}
              pageSize={8}
            />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">🤝 Colaboração em Tempo Real</h2>
                <p className="text-gray-600 mt-1">Estudos de caso colaborativos com WebSockets e análise em tempo real</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Sessões Ativas
                </Button>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar Nova Sessão
                </Button>
              </div>
            </div>

            {/* Collaboration Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-teal-700">Sessões Ativas</div>
                      <div className="text-3xl font-bold text-teal-900">8</div>
                      <div className="text-xs text-teal-600">24 participantes online</div>
                    </div>
                    <Users className="w-10 h-10 text-teal-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-700">Taxa de Conclusão</div>
                      <div className="text-3xl font-bold text-blue-900">89%</div>
                      <div className="text-xs text-blue-600">+5% vs. mês anterior</div>
                    </div>
                    <Target className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-purple-700">Tempo Médio</div>
                      <div className="text-3xl font-bold text-purple-900">42min</div>
                      <div className="text-xs text-purple-600">Ideal: 30-60min</div>
                    </div>
                    <Clock className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-green-700">Score Médio</div>
                      <div className="text-3xl font-bold text-green-900">84%</div>
                      <div className="text-xs text-green-600">Trabalho em equipe</div>
                    </div>
                    <Trophy className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Studies Templates */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  Estudos de Caso Colaborativos Disponíveis
                </h3>
                <p className="text-sm text-gray-600">Templates baseados em cenários reais brasileiros</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Athlete Case Study */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900">Caso do Atleta</h4>
                        <p className="text-sm text-blue-700">Avaliação nutricional esportiva</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-blue-800">
                      <div><strong>Cenário:</strong> Nadador profissional, 22 anos</div>
                      <div><strong>Dados:</strong> Antropometria, bioimpedância</div>
                      <div><strong>Objetivo:</strong> Otimizar performance</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-blue-600">45-60 min • 3-5 participantes</div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Iniciar</Button>
                    </div>
                  </div>

                  {/* Hospitalized Patient Case Study */}
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-900">Paciente Hospitalizado</h4>
                        <p className="text-sm text-red-700">Triagem nutricional</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-red-800">
                      <div><strong>Cenário:</strong> Idoso, 68 anos, pós-cirúrgico</div>
                      <div><strong>Dados:</strong> MUST, NRS-2002, ASG</div>
                      <div><strong>Objetivo:</strong> Plano de cuidado</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-red-600">50-70 min • 4-6 participantes</div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">Iniciar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Sessões Ativas
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collaborativeSessions.filter(s => s.status === 'active').length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Nenhuma sessão ativa no momento</p>
                    ) : (
                      collaborativeSessions.filter(s => s.status === 'active').map((session) => (
                        <div key={session.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{session.caseTitle}</h4>
                              <p className="text-sm text-gray-600">
                                Participantes: {session.participants.join(', ')}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-green-600">Ativa</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Sessões Concluídas
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collaborativeSessions.filter(s => s.status === 'completed').map((session) => (
                      <div key={session.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{session.caseTitle}</h4>
                            <p className="text-sm text-gray-600">
                              Participantes: {session.participants.join(', ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Duração: {session.duration}min • Score: {session.score}%
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-blue-600">Concluída</span>
                            <p className="text-xs text-gray-500">{session.startTime}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Casos Disponíveis
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Avaliação Antropométrica de Atleta de Elite</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Simulação de tomada de decisão complexa na nutrição esportiva com escolhas condicionais.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Duração estimada: 45min</span>
                      <Button size="sm">Iniciar</Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Diagnóstico Nutricional em Paciente Hospitalizado</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Avaliação nutricional colaborativa com síntese de diferentes tipos de dados.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Duração estimada: 60min</span>
                      <Button size="sm">Iniciar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
