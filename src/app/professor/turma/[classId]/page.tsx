'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProfessorAccess } from '@/hooks/useRoleRedirect'
import ProfessorClassService, { ClassInfo, StudentOverview } from '@/services/professorClassService'
import UserService from '@/services/userService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Settings,
  BarChart,
  Copy,
  Search,
  Download,
  Edit,
  Trash2,
  ChevronRight,
  GraduationCap,
  Trophy,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, hasAccess } = useProfessorAccess()
  const classId = params.classId as string

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [students, setStudents] = useState<StudentOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentOverview | null>(null)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (!authLoading && user && classId && hasAccess() && !dataLoaded) {
      setDataLoaded(true)
      loadClassData()
    }
  }, [user, classId, authLoading, dataLoaded])

  const loadClassData = async () => {
    try {
      setLoading(true)
      
      // Verificar se é uma turma demo
      if (classId.startsWith('class_demo_')) {
        console.log('Turma demo detectada:', classId)
        // Para turmas demo, criar dados mockados
        setClassInfo({
          id: classId,
          name: 'Avaliação Nutricional',
          code: 'JK1P32TE',
          semester: '1º Semestre',
          year: 2025,
          professorId: user?.uid || '',
          professorName: user?.fullName || 'Professor',
          studentsCount: 0,
          activeStudents: 0,
          totalModules: modules.length,
          avgProgress: 0,
          avgScore: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        setStudents([])
        return
      }
      
      const [info, studentsList] = await Promise.all([
        ProfessorClassService.getClassInfo(classId),
        ProfessorClassService.getClassStudents(classId)
      ])

      if (info) {
        setClassInfo(info)
        setStudents(studentsList || [])
      } else {
        console.error('Turma não encontrada:', classId)
        router.push('/professor')
      }
    } catch (error) {
      console.error('Erro ao carregar dados da turma:', error)
      // Tentar criar dados básicos para evitar erro completo
      setClassInfo({
        id: classId,
        name: 'Turma',
        code: 'CODIGO',
        semester: '1º Semestre',
        year: 2025,
        professorId: user?.uid || '',
        professorName: user?.fullName || 'Professor',
        studentsCount: 0,
        activeStudents: 0,
        totalModules: modules.length,
        avgProgress: 0,
        avgScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    if (classInfo?.code) {
      navigator.clipboard.writeText(classInfo.code)
    }
  }

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${studentName} da turma?`)) return

    try {
      await ProfessorClassService.removeStudentFromClass(classId, studentId)
      loadClassData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao remover aluno:', error)
    }
  }

  const handleAddStudent = async () => {
    if (!newStudentEmail) {
      return
    }

    try {
      // Buscar usuário por email
      const user = await UserService.getUserByEmail(newStudentEmail)
      
      if (!user) {
        console.error('Usuário não encontrado. Verifique o email.')
        return
      }
      
      if (user.role !== 'student') {
        console.error('Este email pertence a um professor, não a um aluno.')
        return
      }
      
      // Verificar se o aluno já está na turma
      if (students.some(s => s.studentId === user.uid)) {
        console.error('Este aluno já está matriculado na turma.')
        return
      }
      
      // Adicionar aluno à turma
      await ProfessorClassService.addStudentToClass(
        classId,
        user.uid,
        user.displayName || user.email,
        user.email
      )
      
      setNewStudentEmail('')
      setShowAddStudent(false)
      loadClassData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error)
    }
  }

  const exportData = async () => {
    try {
      const data = await ProfessorClassService.exportClassData(classId)
      // Implementar download do CSV
    } catch (error) {
      console.error('Erro ao exportar dados')
    }
  }

  const filteredStudents = students.filter(student => 
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Adicionar timeout para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.error('Timeout de autenticação - redirecionando para login')
        router.push('/')
      }
    }, 5000) // 5 segundos de timeout

    return () => clearTimeout(timeout)
  }, [authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando turma...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/professor')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{classInfo?.name}</h1>
                <p className="text-sm text-gray-500">{classInfo?.semester} - {classInfo?.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/professor/turma/${classId}/configuracoes`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/professor/turma/${classId}/relatorios`)}
              >
                <BarChart className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Código de Convite */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Código de Convite</h3>
                <p className="text-sm text-indigo-100 mt-1">
                  Compartilhe este código com seus alunos para que eles possam se matricular
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
                  <span className="text-2xl font-mono font-bold">{classInfo?.code}</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={copyInviteCode}
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Alunos</p>
                  <p className="text-2xl font-bold">{classInfo?.studentsCount || 0}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Alunos Ativos</p>
                  <p className="text-2xl font-bold">{classInfo?.activeStudents || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Progresso Médio</p>
                  <p className="text-2xl font-bold">{classInfo?.avgProgress || 0}%</p>
                </div>
                <BarChart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pontuação Média</p>
                  <p className="text-2xl font-bold">{classInfo?.avgScore || 0}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Alunos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alunos da Turma</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowAddStudent(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Adicionar Aluno
                </Button>
                <Button
                  variant="outline"
                  onClick={exportData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno matriculado ainda'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{student.studentName}</h4>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Progresso</p>
                          <p className="font-semibold">{student.overallProgress}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Pontuação</p>
                          <p className="font-semibold">{student.totalNormalizedScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Ranking</p>
                          <Badge variant="secondary">#{student.classRank}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveStudent(student.studentId, student.studentName)
                          }}
                        >
                          <UserMinus className="w-4 h-4 text-red-500" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Adicionar Aluno */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Aluno à Turma</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o email do aluno cadastrado na plataforma
            </p>
            <Input
              placeholder="email@unicamp.br"
              type="email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
              className="mb-4"
              autoFocus
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Importante:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>O aluno precisa estar cadastrado na plataforma</li>
                    <li>Use o mesmo email que o aluno usou no cadastro</li>
                    <li>Você também pode compartilhar o código <span className="font-mono font-bold">{classInfo?.code}</span> para matrícula automática</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowAddStudent(false)
                setNewStudentEmail('')
              }}>
                Cancelar
              </Button>
              <Button onClick={handleAddStudent}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}