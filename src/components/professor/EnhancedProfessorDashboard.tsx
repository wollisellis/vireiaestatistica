'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings,
  TrendingUp,
  Activity,
  Target,
  Download,
  Calendar,
  Loader2
} from 'lucide-react'
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface EnhancedProfessorDashboardProps {
  className?: string
  onNavigateToTab?: (tabValue: string) => void
}

export function EnhancedProfessorDashboard({ 
  className = '',
  onNavigateToTab
}: EnhancedProfessorDashboardProps) {
  const { user } = useFirebaseAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeModules: 0,
    completionRate: 0,
    avgSessionTime: 0
  })
  const [loading, setLoading] = useState(true)
  
  // Buscar dados reais do Firebase
  useEffect(() => {
    if (!db || !user) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        // ✅ CORREÇÃO: Buscar todas as turmas do sistema (acesso compartilhado para professores)
        const professorId = user?.uid || user?.id
        if (!professorId) {
          console.warn('Professor ID não disponível')
          return
        }

        // Todos os professores podem ver todas as turmas
        const classesQuery = query(
          collection(db, 'classes'),
          where('status', 'in', ['active', 'open', 'closed'])
        )
        const classesSnapshot = await getDocs(classesQuery)
        const allStudentIds = new Set<string>()
        let totalClasses = classesSnapshot.docs.length
        
        console.log(`📊 [EnhancedProfessorDashboard] Encontradas ${totalClasses} turmas do sistema (acesso compartilhado)`)
        
        for (const classDoc of classesSnapshot.docs) {
          const classId = classDoc.id
          console.log(`🔍 [EnhancedProfessorDashboard] Processando turma: ${classId}`)

          // ✅ CORREÇÃO: Buscar em ambas as coleções de estudantes
          const studentsQuery1 = query(
            collection(db, 'classStudents'),
            where('classId', '==', classId)
          )
          const studentsSnapshot1 = await getDocs(studentsQuery1)

          const studentsQuery2 = query(
            collection(db, 'class_students'),
            where('classId', '==', classId)
          )
          const studentsSnapshot2 = await getDocs(studentsQuery2)

          // Adicionar estudantes da primeira coleção
          studentsSnapshot1.docs.forEach(doc => {
            const studentId = doc.data().studentId
            if (studentId) {
              allStudentIds.add(studentId)
            }
          })

          // Adicionar estudantes da segunda coleção
          studentsSnapshot2.docs.forEach(doc => {
            const studentId = doc.data().studentId
            if (studentId) {
              allStudentIds.add(studentId)
            }
          })

          console.log(`📊 [EnhancedProfessorDashboard] Turma ${classId}: ${studentsSnapshot1.size + studentsSnapshot2.size} estudantes`)
        }

        // 2. Buscar módulos ativos
        const settingsRef = collection(db, 'settings')
        const settingsSnapshot = await getDocs(settingsRef)
        let activeModules = 1 // Default: apenas módulo 1
        
        settingsSnapshot.docs.forEach(doc => {
          if (doc.id === 'modules' && doc.data().unlocked) {
            activeModules = doc.data().unlocked.length
          }
        })

        // 3. Calcular taxa de conclusão média
        const progressSnapshot = await getDocs(collection(db, 'student_module_progress'))
        let totalProgress = 0
        let progressCount = 0
        
        progressSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.progress && data.progress.percentage) {
            totalProgress += data.progress.percentage
            progressCount++
          }
        })
        
        const avgCompletionRate = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0

        // 4. Calcular tempo médio de sessão
        const attemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'))
        let totalTime = 0
        let timeCount = 0
        
        attemptsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.timeSpent) {
            totalTime += data.timeSpent
            timeCount++
          }
        })
        
        const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount / 60) : 0 // Converter para minutos

        setStats({
          totalStudents: allStudentIds.size,
          activeModules,
          completionRate: avgCompletionRate,
          avgSessionTime: avgTime
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        // Valores padrão em caso de erro
        setStats({
          totalStudents: 0,
          activeModules: 1,
          completionRate: 0,
          avgSessionTime: 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Listener para mudanças em tempo real
    const unsubscribeModules = onSnapshot(
      collection(db, 'settings'),
      () => fetchStats()
    )

    return () => {
      unsubscribeModules()
    }
  }, [user])
  
  const handleNavigateToTab = (tabName: string) => {
    const tabMap: {[key: string]: string} = {
      'turmas': 'classes',
      'modulos': 'modules', 
      'analytics': 'analytics'
    }
    
    const targetTab = tabMap[tabName]
    if (targetTab && onNavigateToTab) {
      onNavigateToTab(targetTab)
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


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Visão geral simplificada para Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
            )}
            <div className="text-sm text-gray-600">Total de Estudantes</div>
            <div className="text-xs text-gray-500 mt-1">Em todas as turmas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats.activeModules}</div>
            )}
            <div className="text-sm text-gray-600">Módulos Ativos</div>
            <div className="text-xs text-gray-500 mt-1">Sistema AvaliaNutri</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
            ) : (
              <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            )}
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
            <div className="text-xs text-gray-500 mt-1">Média geral</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-600" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{stats.avgSessionTime || '-'}min</div>
            )}
            <div className="text-sm text-gray-600">Tempo Médio</div>
            <div className="text-xs text-gray-500 mt-1">Por sessão</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Gerenciamento de Turmas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Para gerenciar suas turmas, criar novas turmas e visualizar estudantes matriculados.
            </p>
            <Button className="w-full" onClick={() => handleNavigateToTab('turmas')}>
              <Users className="w-4 h-4 mr-2" />
              Acessar Turmas
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <span>Controle de Módulos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Gerencie quais módulos estão disponíveis para os estudantes.
            </p>
            <Button className="w-full" variant="outline" onClick={() => handleNavigateToTab('modulos')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Gerenciar Módulos
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Analytics Avançado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Visualize relatórios detalhados de performance e engajamento.
            </p>
            <Button className="w-full" variant="outline" onClick={() => handleNavigateToTab('analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Analytics
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-orange-600" />
              <span>Acesso Rápido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigateToTab('analytics')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatórios
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigateToTab('modulos')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Módulos
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigateToTab('turmas')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Ver Turmas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default EnhancedProfessorDashboard