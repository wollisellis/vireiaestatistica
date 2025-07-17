'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog'
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
  Share
} from 'lucide-react'

interface ClassManagementProps {
  professorId: string
  className?: string
}

export function ClassManagement({ professorId, className = '' }: ClassManagementProps) {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [students, setStudents] = useState<StudentOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Formulários
  const [classForm, setClassForm] = useState({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    description: ''
  })

  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    studentId: ''
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
        'Professor', // Nome será obtido do contexto
        classForm.name,
        classForm.semester,
        classForm.year
      )

      // Resetar formulário
      setClassForm({
        name: '',
        semester: '',
        year: new Date().getFullYear(),
        description: ''
      })
      
      setIsCreatingClass(false)
      await loadClasses()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      alert('Erro ao criar turma')
    }
  }

  const addStudent = async () => {
    if (!selectedClass) return
    
    try {
      if (!studentForm.name || !studentForm.email) {
        alert('Preencha todos os campos obrigatórios')
        return
      }

      await ProfessorClassService.addStudentToClass(
        selectedClass.id,
        studentForm.studentId || `student_${Date.now()}`,
        studentForm.name,
        studentForm.email
      )

      // Resetar formulário
      setStudentForm({
        name: '',
        email: '',
        studentId: ''
      })
      
      setIsAddingStudent(false)
      await loadClassStudents()
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error)
      alert('Erro ao adicionar estudante')
    }
  }

  const exportClassData = async (classId: string) => {
    try {
      const data = await ProfessorClassService.exportClassData(classId)
      const csv = convertToCSV(data)
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
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-600" />
                <span>Gerenciamento de Turmas</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Crie e gerencie suas turmas e estudantes
              </p>
            </div>
            
            <Dialog open={isCreatingClass} onOpenChange={setIsCreatingClass}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="className">Nome da Turma *</Label>
                    <Input
                      id="className"
                      value={classForm.name}
                      onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Nutrição - Turma A"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="semester">Semestre *</Label>
                      <Input
                        id="semester"
                        value={classForm.semester}
                        onChange={(e) => setClassForm(prev => ({ ...prev, semester: e.target.value }))}
                        placeholder="Ex: 1º Semestre"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={classForm.year}
                        onChange={(e) => setClassForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={classForm.description}
                      onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da turma..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-4">
                    <Button onClick={createClass} className="flex-1">
                      Criar Turma
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreatingClass(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <ClassCard
            key={cls.id}
            classInfo={cls}
            isSelected={selectedClass?.id === cls.id}
            onSelect={() => setSelectedClass(cls)}
            onExport={() => exportClassData(cls.id)}
            onCopyCode={() => copyClassCode(cls.code)}
          />
        ))}
        
        {classes.length === 0 && (
          <div className="col-span-full text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma turma criada
            </h3>
            <p className="text-gray-600">
              Crie sua primeira turma para começar a gerenciar estudantes.
            </p>
          </div>
        )}
      </div>

      {/* Gerenciamento de estudantes da turma selecionada */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Estudantes - {selectedClass.name}</span>
                </CardTitle>
                <div className="text-sm text-gray-600 mt-1">
                  Código: {selectedClass.code} • {students.length} estudante(s)
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Estudante
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Estudante</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="studentName">Nome Completo *</Label>
                        <Input
                          id="studentName"
                          value={studentForm.name}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome do estudante"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="studentEmail">Email *</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          value={studentForm.email}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="studentId">ID do Estudante (opcional)</Label>
                        <Input
                          id="studentId"
                          value={studentForm.studentId}
                          onChange={(e) => setStudentForm(prev => ({ ...prev, studentId: e.target.value }))}
                          placeholder="Será gerado automaticamente se vazio"
                        />
                      </div>
                      
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={addStudent} className="flex-1">
                          Adicionar
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsAddingStudent(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={loadClassStudents}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Busca de estudantes */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar estudante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Lista de estudantes */}
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <StudentRow
                  key={student.studentId}
                  student={student}
                  onRemove={() => {
                    // Implementar remoção
                    console.log('Remover estudante:', student.studentId)
                  }}
                />
              ))}
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>
                    {searchTerm ? 'Nenhum estudante encontrado' : 'Nenhum estudante cadastrado'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ClassCardProps {
  classInfo: ClassInfo
  isSelected: boolean
  onSelect: () => void
  onExport: () => void
  onCopyCode: () => void
}

function ClassCard({ classInfo, isSelected, onSelect, onExport, onCopyCode }: ClassCardProps) {
  const getStatusColor = () => {
    if (classInfo.activeStudents === 0) return 'gray'
    if (classInfo.avgProgress >= 75) return 'green'
    if (classInfo.avgProgress >= 50) return 'blue'
    return 'yellow'
  }

  const statusColor = getStatusColor()

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900">{classInfo.name}</h3>
            <div className="text-sm text-gray-600">
              {classInfo.semester} {classInfo.year}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {classInfo.code}
            </Badge>
            <Badge 
              variant={statusColor === 'green' ? 'success' : 
                     statusColor === 'blue' ? 'info' : 'secondary'}
              className="text-xs"
            >
              {classInfo.studentsCount} estudante(s)
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">Ativos:</span> {classInfo.activeStudents}
            </div>
            <div>
              <span className="font-medium">Progresso:</span> {classInfo.avgProgress}%
            </div>
          </div>
          
          <div className="flex space-x-1 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={onCopyCode}>
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StudentRowProps {
  student: StudentOverview
  onRemove: () => void
}

function StudentRow({ student, onRemove }: StudentRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          student.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {student.classRank}
        </div>
        
        <div>
          <div className="font-medium">{student.studentName}</div>
          <div className="text-sm text-gray-600">{student.email}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm font-medium">{student.overallProgress}%</div>
          <div className="text-xs text-gray-600">Progresso</div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium">{student.totalNormalizedScore}</div>
          <div className="text-xs text-gray-600">Pontuação</div>
        </div>
        
        <Badge 
          variant={student.isActive ? 'success' : 'secondary'}
          className="text-xs"
        >
          {student.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Estudante</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover {student.studentName} da turma?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default ClassManagement