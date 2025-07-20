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
import CreateClassModal, { ClassFormData } from './CreateClassModal'
import { 
  ProfessorClassService, 
  ClassInfo, 
  StudentOverview 
} from '@/services/professorClassService'
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
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ImprovedClassManagementProps {
  professorId: string
  professorName?: string
  className?: string
}

export function ImprovedClassManagement({ professorId, professorName = 'Professor Dennys Esper', className = '' }: ImprovedClassManagementProps) {
  const router = useRouter()
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [students, setStudents] = useState<StudentOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Formulário de criação de turma
  const [classForm, setClassForm] = useState({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    description: '',
    capacity: 50
  })

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

  const loadClasses = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando turmas para professor:', professorId)
      
      // Tentar carregar do Firebase
      const classesData = await ProfessorClassService.getProfessorClasses(professorId)
      console.log('Turmas carregadas:', classesData)
      
      setClasses(classesData)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
      
      // Em caso de erro, criar dados mock para mostrar interface
      const mockClasses: ClassInfo[] = []
      setClasses(mockClasses)
    } finally {
      setIsLoading(false)
    }
  }

  const loadClassStudents = async () => {
    if (!selectedClass) return
    
    try {
      const studentsData = await ProfessorClassService.getClassStudents(selectedClass.id)
      setStudents(studentsData)
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error)
    }
  }

  const createClass = async (classData: ClassFormData) => {
    if (!professorId) {
      throw new Error('Professor ID não disponível')
    }

    try {
      await ProfessorClassService.createClass(
        professorId,
        professorName,
        classData.name,
        classData.semester,
        classData.year
      )
      
      setIsCreatingClass(false)
      await loadClasses()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      throw error // Re-throw para o modal tratar
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

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert('Código da turma copiado!')
  }

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
                <div className="flex justify-center lg:justify-end">
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

      {/* Modal de criação de turma */}
      <CreateClassModal
        isOpen={isCreatingClass}
        onClose={() => setIsCreatingClass(false)}
        onCreateClass={createClass}
        loading={isLoading}
      />

      {/* Lista de turmas */}
      {classes.length === 0 ? (
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
          {classes.map((cls, index) => (
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
              />
            </motion.div>
          ))}
        </div>
      )}

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
                    onClick={() => copyInviteLink(selectedClass.code)}
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
                    <EnhancedStudentRow student={student} />
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
}

function EnhancedClassCard({ 
  classInfo, 
  isSelected, 
  onSelect, 
  onCopyCode, 
  onCopyInviteLink,
  onViewDetails 
}: EnhancedClassCardProps) {
  const getStatusInfo = () => {
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
        isSelected 
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
                  status.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
                }`} />
                <span className={`text-xs font-medium truncate ${
                  status.color === 'green' ? 'text-green-700' :
                  status.color === 'blue' ? 'text-blue-700' :
                  status.color === 'yellow' ? 'text-yellow-700' : 'text-gray-700'
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
                onClick={onCopyInviteLink}
                className="flex-1 text-xs h-7 sm:h-8 px-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <Share className="w-3 h-3 mr-0.5 sm:mr-1" />
                Convite
              </Button>
            </div>
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

interface EnhancedStudentRowProps {
  student: StudentOverview
}

function EnhancedStudentRow({ student }: EnhancedStudentRowProps) {
  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            {/* Avatar com ranking */}
            <div className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm flex-shrink-0
              ${student.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              #{student.classRank}
            </div>
            
            {/* Info do estudante */}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{student.studentName}</div>
              <div className="text-xs sm:text-sm text-gray-600 flex items-center space-x-2 mt-1">
                <Mail className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            </div>
          </div>
          
          {/* Métricas */}
          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-6">
            <div className="text-center flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-indigo-600">{student.overallProgress}%</div>
              <div className="text-xs text-gray-600">Progresso</div>
            </div>
            
            <div className="text-center flex-shrink-0">
              <div className="text-base sm:text-lg font-bold text-green-600">{student.totalNormalizedScore}</div>
              <div className="text-xs text-gray-600">Pontuação</div>
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

export default ImprovedClassManagement