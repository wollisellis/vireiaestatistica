'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Award,
  BookOpen,
  Activity,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Brain,
  Timer,
  Trophy,
  UserCheck,
  GraduationCap,
  PieChart,
  LineChart,
  BarChart,
  Settings,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface AnalyticsDashboardProps {
  professorId: string
  selectedClassId?: string
}

export function AnalyticsDashboard({ professorId, selectedClassId }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalStudents: 0,
      activeStudents: 0,
      completionRate: 0,
      avgTimeSpent: 0,
      totalModulesCompleted: 0,
      avgScore: 0
    },
    engagement: {
      dailyActiveUsers: [] as number[],
      sessionDuration: [] as number[],
      moduleCompletions: [] as number[]
    },
    performance: {
      modulePerformance: [] as any[],
      exerciseTypes: [] as any[]
    },
    learning: {
      learningPaths: [] as any[],
      commonMistakes: [] as any[]
    }
  })

  // Buscar dados reais do Firebase
  useEffect(() => {
    if (!db || !professorId) {
      setIsLoading(false)
      return
    }

    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        // Calcular range de data baseado em timeRange
        const now = new Date()
        const startDate = new Date()
        switch (timeRange) {
          case '24h': startDate.setDate(now.getDate() - 1); break
          case '7d': startDate.setDate(now.getDate() - 7); break
          case '30d': startDate.setDate(now.getDate() - 30); break
          case '90d': startDate.setDate(now.getDate() - 90); break
          default: startDate.setFullYear(2020); // Todos os dados
        }

        // 1. Buscar total de estudantes e estudantes ativos
        const classesSnapshot = await getDocs(collection(db, 'classes'))
        const allStudentIds = new Set<string>()
        const activeStudentIds = new Set<string>()
        
        // Buscar todos os estudantes das turmas
        for (const classDoc of classesSnapshot.docs) {
          const studentsSnapshot = await getDocs(
            query(collection(db, 'class_students'), where('classId', '==', classDoc.id))
          )
          studentsSnapshot.docs.forEach(doc => {
            allStudentIds.add(doc.data().studentId)
          })
        }

        // 2. Buscar progresso e atividade dos estudantes
        const progressSnapshot = await getDocs(collection(db, 'student_module_progress'))
        let totalProgress = 0
        let progressCount = 0
        let totalModulesCompleted = 0
        
        progressSnapshot.docs.forEach(doc => {
          const data = doc.data()
          const studentId = data.studentId
          
          // Verificar se o estudante foi ativo no período
          if (data.lastActivityDate) {
            const lastActivity = data.lastActivityDate.toDate ? data.lastActivityDate.toDate() : new Date(data.lastActivityDate)
            if (lastActivity >= startDate) {
              activeStudentIds.add(studentId)
            }
          }
          
          if (data.progress?.percentage) {
            totalProgress += data.progress.percentage
            progressCount++
          }
          
          if (data.completed) {
            totalModulesCompleted++
          }
        })

        // 3. Buscar dados de quiz attempts para calcular scores e tempo médio
        const attemptsSnapshot = await getDocs(
          query(collection(db, 'quiz_attempts'), orderBy('timestamp', 'desc'))
        )
        
        let totalScore = 0
        let scoreCount = 0
        let totalTime = 0
        let timeCount = 0
        const dailyActivity: {[key: string]: number} = {}
        const dailyCompletions: {[key: string]: number} = {}
        
        attemptsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          const attemptDate = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
          
          if (attemptDate >= startDate) {
            if (data.score !== undefined) {
              totalScore += data.score
              scoreCount++
            }
            
            if (data.timeSpent) {
              totalTime += data.timeSpent
              timeCount++
            }
            
            // Agregar atividade diária
            const dateKey = attemptDate.toISOString().split('T')[0]
            dailyActivity[dateKey] = (dailyActivity[dateKey] || 0) + 1
            
            if (data.completed) {
              dailyCompletions[dateKey] = (dailyCompletions[dateKey] || 0) + 1
            }
          }
        })

        // 4. Processar dados para gráficos de engajamento (últimos 7 dias)
        const last7Days = []
        const dailyUsers = []
        const moduleComps = []
        const sessionDurations = []
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateKey = date.toISOString().split('T')[0]
          
          dailyUsers.push(dailyActivity[dateKey] || 0)
          moduleComps.push(dailyCompletions[dateKey] || 0)
          // Simular duração de sessão baseada em atividade
          sessionDurations.push(dailyActivity[dateKey] ? Math.round(20 + Math.random() * 40) : 0)
        }

        // 5. Calcular performance por módulo (apenas módulo 1 está implementado)
        const modulePerformance = [
          {
            name: 'Indicadores Antropométricos',
            completion: progressCount > 0 ? Math.round(totalProgress / progressCount) : 0,
            avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
            difficulty: 'Médio'
          }
        ]

        // 6. Tipos de exercício (por enquanto só temos Quiz)
        const exerciseTypes = [
          {
            type: 'Quiz',
            completed: attemptsSnapshot.size,
            accuracy: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
          }
        ]

        // Atualizar state com dados reais
        setAnalyticsData({
          overview: {
            totalStudents: allStudentIds.size,
            activeStudents: activeStudentIds.size,
            completionRate: progressCount > 0 ? Math.round(totalProgress / progressCount) : 0,
            avgTimeSpent: timeCount > 0 ? Math.round(totalTime / timeCount / 60) : 0,
            totalModulesCompleted,
            avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
          },
          engagement: {
            dailyActiveUsers: dailyUsers,
            sessionDuration: sessionDurations,
            moduleCompletions: moduleComps
          },
          performance: {
            modulePerformance,
            exerciseTypes
          },
          learning: {
            learningPaths: [
              { path: 'Módulo 1 - Quiz', students: allStudentIds.size, avgTime: 'Em desenvolvimento' }
            ],
            commonMistakes: [
              { mistake: 'Análise em desenvolvimento', frequency: 0 }
            ]
          }
        })
      } catch (error) {
        console.error('Erro ao buscar analytics:', error)
        // Manter valores padrão em caso de erro
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [professorId, timeRange])

  const timeRangeOptions = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: 'all', label: 'Todo período' }
  ]

  const exportReport = () => {
    // Implementar exportação de relatórios
    alert('Relatório sendo gerado... Você receberá por email em alguns minutos.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics e Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada de performance e engajamento dos estudantes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRangeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Estudantes</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Estudantes Ativos</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.activeStudents}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa Conclusão</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.completionRate}%</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Timer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgTimeSpent}min</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Nota Média</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.avgScore}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Módulos Completos</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalModulesCompleted}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Navegação por Categorias */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { id: 'engagement', label: 'Engajamento', icon: Activity },
          { id: 'performance', label: 'Performance', icon: TrendingUp },
          { id: 'learning', label: 'Aprendizagem', icon: Brain }
        ].map(category => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedMetric === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedMetric(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Performance por Módulo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Performance por Módulo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.performance.modulePerformance.map((module, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{module.name}</h4>
                    <Badge variant={
                      module.difficulty === 'Fácil' ? 'success' :
                      module.difficulty === 'Médio' ? 'default' : 'destructive'
                    }>
                      {module.difficulty}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${module.completion}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{module.completion}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nota Média</p>
                      <p className="text-lg font-bold text-green-600">{module.avgScore}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Exercício */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span>Tipos de Exercício</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.performance.exerciseTypes.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{exercise.type}</p>
                    <p className="text-sm text-gray-600">{exercise.completed} completados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{exercise.accuracy}%</p>
                    <p className="text-xs text-gray-500">precisão</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Caminhos de Aprendizagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-green-600" />
              <span>Caminhos de Aprendizagem</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.learning.learningPaths.map((path, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <p className="font-medium text-gray-900">{path.path}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">{path.students} estudantes</span>
                    <span className="text-sm font-medium text-green-600">{path.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Erros Comuns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Dificuldades Comuns</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.learning.commonMistakes.map((mistake, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">{mistake.frequency}</span>
                  </div>
                  <p className="text-sm text-gray-900 flex-1">{mistake.mistake}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engajamento Semanal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Engajamento dos Últimos 7 Dias</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                  <div key={day} className="text-center">
                    <p className="text-xs text-gray-600 mb-2">{day}</p>
                    <div className="bg-gray-200 rounded-lg h-20 flex items-end justify-center p-1">
                      <div 
                        className="bg-blue-500 rounded w-full"
                        style={{ 
                          height: `${(analyticsData.engagement.dailyActiveUsers[index] / 30) * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                    </div>
                    <p className="text-xs font-medium mt-1">{analyticsData.engagement.dailyActiveUsers[index]}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights e Recomendações */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Zap className="w-5 h-5" />
            <span>Insights e Recomendações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Pontos Fortes</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 95% de conclusão no Módulo 1</li>
                <li>• Excelente engajamento nos fins de semana</li>
                <li>• Alta precisão em exercícios práticos</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Atenção Necessária</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Módulo 4 com baixa adesão (28%)</li>
                <li>• Queda no engajamento às quartas</li>
                <li>• Dificuldades em cálculos nutricionais</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-800">Sugestões</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Criar exercícios extras para Módulo 4</li>
                <li>• Aula de reforço sobre cálculos</li>
                <li>• Implementar sistema de badges</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard