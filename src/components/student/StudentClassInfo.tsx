'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  BookOpen,
  ChevronRight
} from 'lucide-react'
import ProfessorClassService, { ClassInfo } from '@/services/professorClassService'

interface StudentClassInfoProps {
  studentId: string
  className?: string
}

export const StudentClassInfo: React.FC<StudentClassInfoProps> = ({ 
  studentId, 
  className = '' 
}) => {
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Se não tem studentId, não é para carregar
    if (!studentId) {
      setLoading(false)
      return
    }
    
    loadStudentClasses()
  }, [studentId])

  const loadStudentClasses = async () => {
    // Controle de timeout para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏰ StudentClassInfo: Timeout após 10 segundos, finalizando loading')
      setLoading(false)
      setError('Timeout ao carregar informações da turma')
    }, 10000) // 10 segundos de timeout

    try {
      setLoading(true)
      setError(null)
      
      // Adicionar validação extra
      if (!studentId) {
        throw new Error('ID do estudante não fornecido')
      }

      console.log('📚 StudentClassInfo: Carregando turmas para estudante:', studentId)
      const studentClasses = await ProfessorClassService.getStudentClasses(studentId)
      
      // Limpar timeout se sucesso
      clearTimeout(timeoutId)
      
      console.log('✅ StudentClassInfo: Turmas carregadas:', studentClasses.length)
      setClasses(studentClasses)
    } catch (error) {
      // Limpar timeout se erro
      clearTimeout(timeoutId)
      
      console.error('❌ StudentClassInfo: Erro ao carregar turmas:', error)
      setError('Não foi possível carregar as informações da turma')
      setClasses([]) // Reset classes em caso de erro
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800">Carregando informações da turma...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="text-red-600">⚠️</div>
            <span className="text-red-800">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Não mostrar nada se não estiver em nenhuma turma ou não tem studentId
  if (!studentId || classes.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {classes.map((classInfo, index) => (
        <motion.div
          key={classInfo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-100 rounded-full">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900">
                      Você faz parte da turma
                    </h3>
                    <p className="text-2xl font-bold text-indigo-800 mt-1">
                      {classInfo.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-indigo-700">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Professor: {classInfo.professorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{classInfo.semester} - {classInfo.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className="bg-indigo-600 text-white mb-2">
                    {classInfo.studentsCount} aluno{classInfo.studentsCount !== 1 ? 's' : ''}
                  </Badge>
                  <div className="text-sm text-indigo-700">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Progresso da turma: {classInfo.avgProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações adicionais da turma */}
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-indigo-600">
                      {classInfo.studentsCount}
                    </div>
                    <div className="text-xs text-indigo-700">
                      Total de Alunos
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {classInfo.activeStudents}
                    </div>
                    <div className="text-xs text-indigo-700">
                      Alunos Ativos
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {classInfo.avgScore || 0}
                    </div>
                    <div className="text-xs text-indigo-700">
                      Pontuação Média
                    </div>
                  </div>
                </div>
              </div>

              {/* Código da turma */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Código da Turma
                    </p>
                    <p className="text-lg font-mono font-bold text-indigo-600">
                      {classInfo.code}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-600">
                      Compartilhe com outros colegas
                    </p>
                    <ChevronRight className="w-4 h-4 text-indigo-400 mt-1 ml-auto" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export default StudentClassInfo