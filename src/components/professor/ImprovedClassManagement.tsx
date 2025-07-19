'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
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
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ImprovedClassManagementProps {
  professorId: string
  className?: string
}

export function ImprovedClassManagement({ professorId, className = '' }: ImprovedClassManagementProps) {
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
      const classesData = await ProfessorClassService.getProfessorClasses(professorId)
      setClasses(classesData)
    } catch (error) {
      console.error('Erro ao carregar turmas:', error)
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

  const createClass = async () => {
    try {
      if (!classForm.name || !classForm.semester) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      await ProfessorClassService.createClass(
        professorId,
        'Professor',
        classForm.name,
        classForm.semester,
        classForm.year
      )

      // Resetar formulário
      setClassForm({
        name: '',
        semester: '',
        year: new Date().getFullYear(),
        description: '',
        capacity: 50
      })
      
      setIsCreatingClass(false)
      await loadClasses()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      alert('Erro ao criar turma')
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
          <CardContent className="p-8 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <GraduationCap className="w-10 h-10 text-white" />
                    <div>
                      <h1 className="text-3xl font-bold">Gerenciamento de Turmas</h1>
                      <p className="text-indigo-100 text-lg">
                        Crie turmas, convide estudantes e acompanhe o progresso
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{classes.length}</div>
                      <div className="text-indigo-200 text-sm">Turmas Ativas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {classes.reduce((total, cls) => total + cls.studentsCount, 0)}
                      </div>
                      <div className="text-indigo-200 text-sm">Total de Estudantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {classes.length > 0 ? Math.round(classes.reduce((total, cls) => total + cls.avgProgress, 0) / classes.length) : 0}%
                      </div>
                      <div className="text-indigo-200 text-sm">Progresso Médio</div>
                    </div>
                  </div>
                </div>

                {/* Botão Nova Turma */}
                <Dialog open={isCreatingClass} onOpenChange={setIsCreatingClass}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Nova Turma
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl flex items-center space-x-2">
                        <GraduationCap className="w-6 h-6 text-indigo-600" />
                        <span>Criar Nova Turma</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="className" className="text-base font-medium">Nome da Turma *</Label>
                          <Input
                            id="className"
                            value={classForm.name}
                            onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Avaliação Nutricional - Turma A"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="semester" className="text-base font-medium">Semestre *</Label>
                          <Input
                            id="semester"
                            value={classForm.semester}
                            onChange={(e) => setClassForm(prev => ({ ...prev, semester: e.target.value }))}
                            placeholder="Ex: 1º Semestre"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="year" className="text-base font-medium">Ano</Label>
                          <Input
                            id="year"
                            type="number"
                            value={classForm.year}
                            onChange={(e) => setClassForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            className="mt-2 h-12"
                          />
                        </div>

                        <div>
                          <Label htmlFor="capacity" className="text-base font-medium">Capacidade Máxima</Label>
                          <Input
                            id="capacity"
                            type="number"
                            value={classForm.capacity}
                            onChange={(e) => setClassForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                            placeholder="50"
                            className="mt-2 h-12"
                          />
                        </div>
                        
                        <div className="md:col-span-1">
                          <Label htmlFor="description" className="text-base font-medium">Descrição (opcional)</Label>
                          <Textarea
                            id="description"
                            value={classForm.description}
                            onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Descrição da turma, horários, objetivos..."
                            rows={3}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Como funciona o sistema de convites:</span>
                        </div>
                        <ul className="text-sm text-blue-800 space-y-1 ml-7">
                          <li>• Um código único será gerado para sua turma</li>
                          <li>• Você pode compartilhar o link de convite ou código</li>
                          <li>• Estudantes se cadastram automaticamente na turma</li>
                          <li>• Você acompanha matrículas em tempo real</li>
                        </ul>
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button onClick={createClass} className="flex-1 h-12 text-base">
                          <Plus className="w-5 h-5 mr-2" />
                          Criar Turma
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreatingClass(false)}
                          className="flex-1 h-12 text-base"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <span>{selectedClass.name}</span>
                    <Badge className="bg-indigo-100 text-indigo-800">
                      {students.length} estudante(s)
                    </Badge>
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-2 flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedClass.semester} {selectedClass.year}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Código: {selectedClass.code}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(selectedClass.code)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Compartilhar Convite
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadClassStudents}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Busca de estudantes */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar estudante por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
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
}

function EnhancedClassCard({ 
  classInfo, 
  isSelected, 
  onSelect, 
  onCopyCode, 
  onCopyInviteLink 
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
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{classInfo.name}</h3>
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{classInfo.semester} {classInfo.year}</span>
            </div>
          </div>
          
          {/* Status e Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`w-4 h-4 ${
                status.color === 'green' ? 'text-green-600' :
                status.color === 'blue' ? 'text-blue-600' :
                status.color === 'yellow' ? 'text-yellow-600' : 'text-gray-600'
              }`} />
              <span className={`text-xs font-medium ${
                status.color === 'green' ? 'text-green-700' :
                status.color === 'blue' ? 'text-blue-700' :
                status.color === 'yellow' ? 'text-yellow-700' : 'text-gray-700'
              }`}>
                {status.label}
              </span>
            </div>
            
            <Badge variant="outline" className="text-xs font-mono">
              {classInfo.code}
            </Badge>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-indigo-600">{classInfo.studentsCount}</div>
              <div className="text-xs text-gray-600">Estudantes</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{classInfo.avgProgress}%</div>
              <div className="text-xs text-gray-600">Progresso</div>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex space-x-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopyCode}
              className="flex-1 text-xs"
            >
              <Copy className="w-3 h-3 mr-1" />
              Código
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopyInviteLink}
              className="flex-1 text-xs border-green-200 text-green-700 hover:bg-green-50"
            >
              <Share className="w-3 h-3 mr-1" />
              Convite
            </Button>
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
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar com ranking */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm
              ${student.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-600'}
            `}>
              #{student.classRank}
            </div>
            
            {/* Info do estudante */}
            <div>
              <div className="font-semibold text-gray-900 text-base">{student.studentName}</div>
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <Mail className="w-3 h-3" />
                <span>{student.email}</span>
              </div>
            </div>
          </div>
          
          {/* Métricas */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{student.overallProgress}%</div>
              <div className="text-xs text-gray-600">Progresso</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{student.totalNormalizedScore}</div>
              <div className="text-xs text-gray-600">Pontuação</div>
            </div>
            
            <Badge 
              variant={student.isActive ? 'default' : 'secondary'}
              className={`px-3 py-1 ${
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