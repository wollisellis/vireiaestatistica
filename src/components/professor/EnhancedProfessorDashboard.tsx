'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import ModuleManagementPanel from './ModuleManagementPanel'
import StudentProgressViewer from './StudentProgressViewer'
import { 
  ProfessorClassService, 
  ClassInfo, 
  ClassStatistics 
} from '@/services/professorClassService'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  Activity,
  Trophy,
  Clock,
  Target,
  Download,
  RefreshCw,
  Plus,
  AlertTriangle,
  CheckCircle,
  Star,
  Award,
  Zap,
  Calendar
} from 'lucide-react'

interface EnhancedProfessorDashboardProps {
  classId?: string
  className?: string
}

export function EnhancedProfessorDashboard({ 
  classId: propClassId, 
  className = '' 
}: EnhancedProfessorDashboardProps) {
  const { user } = useFirebaseAuth()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>(propClassId || '')
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Carregar turmas do professor
  useEffect(() => {
    if (user?.uid) {
      loadProfessorClasses()
    }
  }, [user])

  // Carregar dados da turma selecionada
  useEffect(() => {
    if (selectedClassId) {
      loadClassData()
    }
  }, [selectedClassId])

  const loadProfessorClasses = async () => {
    try {
      if (!user?.uid) return
      
      const classesData = await ProfessorClassService.getProfessorClasses(user.uid)
      setClasses(classesData)
      
      // Se não há turma selecionada e há turmas disponíveis, selecionar a primeira
      if (!selectedClassId && classesData.length > 0) {
        setSelectedClassId(classesData[0].id)
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
    }
  }

  const loadClassData = async () => {
    try {
      setIsLoading(true)
      
      const [classInfoData, statsData] = await Promise.all([
        ProfessorClassService.getClassInfo(selectedClassId),
        ProfessorClassService.getClassStatistics(selectedClassId)
      ])
      
      setClassInfo(classInfoData)
      setClassStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados da turma:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewClass = async () => {
    if (!user?.uid) return
    
    try {
      const className = prompt('Nome da nova turma:')
      if (!className) return
      
      const semester = prompt('Semestre (ex: 1º Semestre):')
      if (!semester) return
      
      const year = new Date().getFullYear()
      
      const newClassId = await ProfessorClassService.createClass(
        user.uid,
        user.displayName || 'Professor',
        className,
        semester,
        year
      )
      
      await loadProfessorClasses()
      setSelectedClassId(newClassId)
    } catch (error) {
      console.error('Erro ao criar turma:', error)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-lg font-medium text-gray-900 mb-2">
          Acesso Restrito
        </div>
        <p className="text-gray-600">
          Faça login como professor para acessar o dashboard.
        </p>
      </div>
    )
  }

  if (classes.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma Turma Encontrada
        </h3>
        <p className="text-gray-600 mb-4">
          Crie sua primeira turma para começar a gerenciar estudantes.
        </p>
        <Button onClick={createNewClass} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Primeira Turma
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Seleção de turma */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Gerenciamento de Turmas
              </h2>
              <p className="text-gray-600 text-sm">
                Selecione uma turma para visualizar estatísticas e gerenciar módulos
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Seletor de turma */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-white text-gray-900 rounded-md border border-gray-300"
              >
                <option value="">Selecionar turma...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.semester} {cls.year}
                  </option>
                ))}
              </select>
              
              <Button 
                onClick={createNewClass}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Turma
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da turma selecionada */}
      {classInfo && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>{classInfo.name}</span>
                </CardTitle>
                <div className="text-sm text-gray-600 mt-1">
                  Código: {classInfo.code} • {classInfo.semester} {classInfo.year}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={loadClassData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Estatísticas rápidas */}
      {classStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {classStats.totalStudents}
              </div>
              <div className="text-sm text-gray-600">Estudantes</div>
              <div className="text-xs text-green-600 mt-1">
                {classStats.activeStudents} ativos
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {classStats.averageProgress}%
              </div>
              <div className="text-sm text-gray-600">Progresso Médio</div>
              <div className="flex items-center justify-center text-xs mt-1">
                {classStats.trends?.engagementTrend === 'up' && (
                  <><TrendingUp className="w-3 h-3 text-green-500 mr-1" /> Crescendo</>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {classStats.averageScore.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Nota Média</div>
              <div className="text-xs text-gray-500 mt-1">
                {classStats.completionRate.toFixed(0)}% concluindo
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {classStats.trends?.averageStudyTime || 0}min
              </div>
              <div className="text-sm text-gray-600">Tempo Médio</div>
              <div className="text-xs text-gray-500 mt-1">
                por sessão
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas e notificações */}
      {classStats && (
        <div className="space-y-3">
          {/* Alerta para estudantes com dificuldades */}
          {classStats.performanceDistribution.struggling > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <div className="font-medium text-orange-800">
                      {classStats.performanceDistribution.struggling} estudante(s) precisam de atenção
                    </div>
                    <div className="text-sm text-orange-600">
                      Performance abaixo de 60%. Considere oferecer suporte adicional.
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('students')}>
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Parabéns por alta performance */}
          {classStats.performanceDistribution.excellent > classStats.totalStudents * 0.3 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">
                      Excelente performance da turma!
                    </div>
                    <div className="text-sm text-green-600">
                      {classStats.performanceDistribution.excellent} estudantes com performance excelente (90%+)
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Abas principais */}
      {selectedClassId && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Módulos</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Estudantes</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab classStats={classStats} classId={selectedClassId} />
          </TabsContent>

          <TabsContent value="modules">
            <ModuleManagementPanel classId={selectedClassId} />
          </TabsContent>

          <TabsContent value="students">
            <StudentProgressViewer classId={selectedClassId} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab classStats={classStats} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Componente da aba Overview
function OverviewTab({ classStats, classId }: { classStats: ClassStatistics | null, classId: string }) {
  if (!classStats) return null

  return (
    <div className="space-y-6">
      {/* Métricas de tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendências da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {classStats.trends?.weeklyProgress[classStats.trends.weeklyProgress.length - 1] || 0}%
              </div>
              <div className="text-sm text-gray-600">Progresso da Semana</div>
              <div className="flex items-center justify-center text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{((classStats.trends?.weeklyProgress[classStats.trends.weeklyProgress.length - 1] || 0) - 
                   (classStats.trends?.weeklyProgress[classStats.trends.weeklyProgress.length - 2] || 0)).toFixed(1)}% esta semana
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {classStats.activeStudents}
              </div>
              <div className="text-sm text-gray-600">Estudantes Ativos</div>
              <div className="text-xs text-gray-500 mt-1">
                de {classStats.totalStudents} total
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {classStats.trends?.averageStudyTime || 0}min
              </div>
              <div className="text-sm text-gray-600">Tempo Médio de Estudo</div>
              <div className="text-xs text-gray-500 mt-1">
                por sessão
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span>Top 5 Estudantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Dados dos top performers serão exibidos aqui</p>
          </div>
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              <span className="text-sm">Exportar Dados</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-sm">Adicionar Aluno</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="w-6 h-6 mb-2" />
              <span className="text-sm">Configurações</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Cronograma</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente da aba Analytics
function AnalyticsTab({ classStats }: { classStats: ClassStatistics | null }) {
  if (!classStats) return null

  return (
    <div className="space-y-6">
      {/* Gráfico de distribuição de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Performance Detalhada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(classStats.performanceDistribution).map(([level, count]) => {
              const total = classStats.totalStudents
              const percentage = total > 0 ? (count / total) * 100 : 0
              
              const levelConfig = {
                excellent: { label: 'Excelente (90%+)', color: 'bg-green-500' },
                good: { label: 'Bom (80-89%)', color: 'bg-blue-500' },
                average: { label: 'Médio (70-79%)', color: 'bg-yellow-500' },
                belowAverage: { label: 'Abaixo da Média (60-69%)', color: 'bg-orange-500' },
                struggling: { label: 'Precisa Ajuda (<60%)', color: 'bg-red-500' }
              }
              
              const config = levelConfig[level as keyof typeof levelConfig]
              
              return (
                <div key={level} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium">
                    {config.label}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className={`${config.color} h-6 rounded-full flex items-center justify-center text-white text-sm font-medium`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {count > 0 && `${count} (${percentage.toFixed(0)}%)`}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por módulo */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(classStats.moduleStats).map(([moduleId, stats]) => (
              <div key={moduleId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Módulo {moduleId.split('-')[1]}</h4>
                  <Badge variant={
                    stats.difficulty === 'Fácil' ? 'success' :
                    stats.difficulty === 'Médio' ? 'warning' : 'destructive'
                  }>
                    {stats.difficulty}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{stats.studentsStarted}</div>
                    <div className="text-gray-600">Iniciaram</div>
                  </div>
                  <div>
                    <div className="font-medium">{stats.studentsCompleted}</div>
                    <div className="text-gray-600">Concluíram</div>
                  </div>
                  <div>
                    <div className="font-medium">{stats.averageScore.toFixed(0)}%</div>
                    <div className="text-gray-600">Nota Média</div>
                  </div>
                  <div>
                    <div className="font-medium">{stats.completionRate.toFixed(0)}%</div>
                    <div className="text-gray-600">Taxa Conclusão</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EnhancedProfessorDashboard