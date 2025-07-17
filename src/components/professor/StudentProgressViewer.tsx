'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { 
  ProfessorClassService, 
  StudentOverview,
  ClassStatistics 
} from '@/services/professorClassService'
import { modules } from '@/data/modules'
import { 
  Users, 
  Trophy, 
  Target,
  Clock,
  Star,
  TrendingUp,
  Activity,
  BookOpen,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  Award,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap
} from 'lucide-react'

interface StudentProgressViewerProps {
  classId: string
  className?: string
}

export function StudentProgressViewer({ classId, className = '' }: StudentProgressViewerProps) {
  const [students, setStudents] = useState<StudentOverview[]>([])
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentOverview | null>(null)
  const [sortBy, setSortBy] = useState<'rank' | 'progress' | 'score' | 'activity'>('rank')

  // Carregar dados dos estudantes
  useEffect(() => {
    loadStudentData()
  }, [classId])

  const loadStudentData = async () => {
    try {
      setIsLoading(true)
      const [studentsData, statsData] = await Promise.all([
        ProfessorClassService.getClassStudents(classId),
        ProfessorClassService.getClassStatistics(classId)
      ])
      
      setStudents(studentsData)
      setClassStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados dos estudantes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar e ordenar estudantes
  const filteredAndSortedStudents = React.useMemo(() => {
    let filtered = students.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    switch (sortBy) {
      case 'rank':
        return filtered.sort((a, b) => a.classRank - b.classRank)
      case 'progress':
        return filtered.sort((a, b) => b.overallProgress - a.overallProgress)
      case 'score':
        return filtered.sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
      case 'activity':
        return filtered.sort((a, b) => {
          const aTime = a.lastActivity?.getTime() || 0
          const bTime = b.lastActivity?.getTime() || 0
          return bTime - aTime
        })
      default:
        return filtered
    }
  }, [students, searchTerm, sortBy])

  // Exportar dados
  const handleExportData = async () => {
    try {
      const exportData = await ProfessorClassService.exportClassData(classId)
      const csv = convertToCSV(exportData)
      downloadCSV(csv, `turma_${classId}_dados.csv`)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(','))
    return [headers, ...rows].join('\n')
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas gerais */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Progresso dos Estudantes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {classStats?.totalStudents || 0}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {classStats?.activeStudents || 0}
              </div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {classStats?.averageProgress || 0}%
              </div>
              <div className="text-sm text-gray-600">Progresso Médio</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {classStats?.averageScore.toFixed(0) || 0}
              </div>
              <div className="text-sm text-gray-600">Nota Média</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {classStats?.completionRate.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Conclusão</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Performance */}
      {classStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Distribuição de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">
                  {classStats.performanceDistribution.excellent}
                </div>
                <div className="text-xs text-green-600">Excelente (90%+)</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Star className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">
                  {classStats.performanceDistribution.good}
                </div>
                <div className="text-xs text-blue-600">Bom (80-89%)</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Target className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">
                  {classStats.performanceDistribution.average}
                </div>
                <div className="text-xs text-yellow-600">Médio (70-79%)</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-700">
                  {classStats.performanceDistribution.belowAverage}
                </div>
                <div className="text-xs text-orange-600">Abaixo (60-69%)</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Activity className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-red-700">
                  {classStats.performanceDistribution.struggling}
                </div>
                <div className="text-xs text-red-600">Precisa Ajuda (<60%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles de busca e filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="rank">Ordenar por Ranking</option>
              <option value="progress">Ordenar por Progresso</option>
              <option value="score">Ordenar por Pontuação</option>
              <option value="activity">Ordenar por Atividade</option>
            </select>
            
            <Button variant="outline" onClick={loadStudentData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudantes */}
      <div className="space-y-3">
        {filteredAndSortedStudents.map((student) => (
          <StudentCard
            key={student.studentId}
            student={student}
            onViewDetails={() => setSelectedStudent(student)}
          />
        ))}
        
        {filteredAndSortedStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum estudante encontrado
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente buscar com outros termos' : 'Nenhum estudante matriculado ainda'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de detalhes do estudante */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalhes do Progresso - {selectedStudent?.studentName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <StudentDetailView student={selectedStudent} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StudentCardProps {
  student: StudentOverview
  onViewDetails: () => void
}

function StudentCard({ student, onViewDetails }: StudentCardProps) {
  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'green'
    if (score >= 80) return 'blue'
    if (score >= 70) return 'yellow'
    if (score >= 60) return 'orange'
    return 'red'
  }

  const getActivityStatus = (lastActivity: any) => {
    if (!lastActivity) return { text: 'Nunca', color: 'gray' }
    
    const now = new Date()
    const diffHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 24) return { text: 'Hoje', color: 'green' }
    if (diffHours < 168) return { text: 'Esta semana', color: 'blue' }
    if (diffHours < 720) return { text: 'Este mês', color: 'yellow' }
    return { text: 'Inativo', color: 'red' }
  }

  const performanceColor = getPerformanceColor(student.averageScore)
  const activityStatus = getActivityStatus(student.lastActivity)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Ranking */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              student.classRank <= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {student.classRank <= 3 && <Trophy className="w-4 h-4" />}
              {student.classRank > 3 && student.classRank}
            </div>

            {/* Informações do estudante */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                <Badge 
                  variant={student.isActive ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {student.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                {student.email && (
                  <div className="mb-1">{student.email}</div>
                )}
                <div className="flex items-center space-x-4">
                  <span>Progresso: {student.overallProgress}%</span>
                  <span>Módulos: {student.completedModules}/{modules.length}</span>
                  <span>Última atividade: {activityStatus.text}</span>
                </div>
              </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-lg font-bold text-${performanceColor}-600`}>
                  {student.totalNormalizedScore}
                </div>
                <div className="text-xs text-gray-600">Pontuação</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {student.averageScore.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-600">Média</div>
              </div>
              
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {student.perfectExercises}
                </div>
                <div className="text-xs text-gray-600">Perfeitos</div>
              </div>
            </div>
          </div>

          {/* Barra de progresso e botão */}
          <div className="ml-4 w-32">
            <Progress 
              value={student.overallProgress} 
              className="h-2 mb-2"
              indicatorClassName={
                student.overallProgress >= 75 ? 'bg-green-500' :
                student.overallProgress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
              }
            />
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="w-4 h-4 mr-1" />
              Detalhes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StudentDetailView({ student }: { student: StudentOverview }) {
  return (
    <div className="space-y-6">
      {/* Informações gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{student.overallProgress}%</div>
          <div className="text-xs text-gray-600">Progresso Geral</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{student.totalNormalizedScore}</div>
          <div className="text-xs text-gray-600">Pontuação Total</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Award className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <div className="text-lg font-bold">#{student.classRank}</div>
          <div className="text-xs text-gray-600">Ranking da Turma</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Zap className="w-6 h-6 text-orange-600 mx-auto mb-1" />
          <div className="text-lg font-bold">{student.currentStreak}</div>
          <div className="text-xs text-gray-600">Sequência (dias)</div>
        </div>
      </div>

      {/* Progresso por módulo */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Progresso por Módulo</h4>
        <div className="space-y-3">
          {modules.map((module, index) => {
            const moduleStatus = student.moduleStatus[module.id]
            
            if (!moduleStatus) return null

            return (
              <div key={module.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      moduleStatus.isCompleted ? 'bg-green-100 text-green-800' :
                      moduleStatus.exercisesCompleted > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h5 className="font-medium">{module.title}</h5>
                      <div className="text-sm text-gray-600">
                        {moduleStatus.exercisesCompleted}/{moduleStatus.totalExercises} exercícios
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {moduleStatus.normalizedScore}%
                    </div>
                    <Badge 
                      variant={moduleStatus.isCompleted ? 'success' : 
                              moduleStatus.exercisesCompleted > 0 ? 'info' : 'secondary'}
                    >
                      {moduleStatus.isCompleted ? 'Concluído' :
                       moduleStatus.exercisesCompleted > 0 ? 'Em Progresso' : 'Não Iniciado'}
                    </Badge>
                  </div>
                </div>
                
                <Progress 
                  value={(moduleStatus.exercisesCompleted / moduleStatus.totalExercises) * 100}
                  className="h-2"
                />
                
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Tempo: {Math.round(moduleStatus.timeSpent / 60)}min</span>
                  <span>
                    {((moduleStatus.exercisesCompleted / moduleStatus.totalExercises) * 100).toFixed(0)}% concluído
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StudentProgressViewer