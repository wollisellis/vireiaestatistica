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
  WifiOff
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRBAC } from '@/hooks/useRBAC'
import { User } from '@/lib/firebase'
import { useFirebaseDataWithFallback } from '@/contexts/FirebaseDataContext'

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

  const [topPerformers, setTopPerformers] = useState<StudentSummary[]>([])
  const [strugglingStudents, setStrugglingStudents] = useState<StudentSummary[]>([])

  useEffect(() => {
    if (user && user.role === 'professor') {
      loadMockStudentData() // Still using mock data for individual students
    }
  }, [user])

  const loadMockStudentData = async () => {
    // Mock student data - individual student details not yet implemented in Firebase
    const mockTopPerformers: StudentSummary[] = [
      { id: '1', name: 'Ana Silva', anonymousId: 'Aluno12345', totalScore: 385, gamesCompleted: 2, lastActivity: '2 horas atrás', averageScore: 96 },
      { id: '2', name: 'Carlos Santos', anonymousId: 'Aluno23456', totalScore: 372, gamesCompleted: 2, lastActivity: '1 dia atrás', averageScore: 93 },
      { id: '3', name: 'Maria Oliveira', anonymousId: 'Aluno34567', totalScore: 358, gamesCompleted: 2, lastActivity: '3 horas atrás', averageScore: 90 },
    ]

    const mockStrugglingStudents: StudentSummary[] = [
      { id: '4', name: 'João Costa', anonymousId: 'Aluno45678', totalScore: 145, gamesCompleted: 1, lastActivity: '5 dias atrás', averageScore: 58 },
      { id: '5', name: 'Lucia Ferreira', anonymousId: 'Aluno56789', totalScore: 132, gamesCompleted: 1, lastActivity: '3 dias atrás', averageScore: 52 },
    ]

    setTopPerformers(mockTopPerformers)
    setStrugglingStudents(mockStrugglingStudents)
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Painel do Professor
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  Bem-vindo, Prof. {user.fullName} • NT600 - Avaliação Nutricional
                </p>
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshAnalytics}
                disabled={analyticsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

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

        {/* Module Management */}
        {classAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Gerenciamento de Módulos
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(classAnalytics.completionRates || []).map((module) => (
                  <div key={module.moduleId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{module.moduleName}</h4>
                      <p className="text-sm text-gray-600">
                        Conclusão: {module.completionRate}% • Média: {module.averageScore}%
                      </p>
                    </div>
                    <Button
                      onClick={() => toggleModuleLock(module.moduleId)}
                      variant={module.isLocked ? "outline" : "default"}
                      size="sm"
                      className="ml-4"
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Melhores Desempenhos
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
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

        {/* Students Needing Attention */}
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Alunos que Precisam de Atenção
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strugglingStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">ID: {student.anonymousId}</p>
                    <p className="text-sm text-yellow-700">
                      Última atividade: {student.lastActivity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-600">{student.totalScore} pts</p>
                    <p className="text-sm text-gray-600">{student.averageScore}% média</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
