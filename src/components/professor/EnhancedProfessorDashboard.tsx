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
  Loader2,
  Trophy,
  Award,
  RefreshCw
} from 'lucide-react'
import { collection, getDocs, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import unifiedScoringService from '@/services/unifiedScoringService'

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
    avgSessionTime: 0,
    activeStudents: 0,
    avgScore: 0
  })
  const [topStudents, setTopStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Buscar dados reais do Firebase
  useEffect(() => {
    if (!db || !user) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        console.log('🔍 [Dashboard Professor] Buscando dados globais de estudantes...')
        
        // 🌍 NOVO: Buscar TODOS os estudantes do sistema (sem dependência de turmas)
        const allStudentsData = await unifiedScoringService.getAllStudentsRanking(100)
        
        console.log(`📊 [Dashboard Professor] Encontrados ${allStudentsData.length} estudantes no sistema`)
        
        // Filtrar apenas estudantes com pontuação > 0 para estatísticas
        const activeStudents = allStudentsData.filter(student => student.totalScore > 0)
        
        // Calcular estatísticas gerais
        const totalStudents = allStudentsData.length
        const activeStudentsCount = activeStudents.length
        
        // Calcular pontuação média (apenas estudantes ativos)
        const avgScore = activeStudentsCount > 0
          ? Math.round(activeStudents.reduce((sum, s) => sum + s.totalScore, 0) / activeStudentsCount)
          : 0
          
        // Calcular taxa de engajamento
        const engagementRate = totalStudents > 0
          ? Math.round((activeStudentsCount / totalStudents) * 100)
          : 0

        // 2. Buscar módulos ativos
        const settingsRef = collection(db, 'settings')
        const settingsSnapshot = await getDocs(settingsRef)
        let activeModules = 1 // Default: apenas módulo 1
        
        settingsSnapshot.docs.forEach(doc => {
          if (doc.id === 'modules' && doc.data().unlocked) {
            activeModules = doc.data().unlocked.length
          }
        })

        // 3. Calcular taxa de conclusão média dos estudantes ativos
        let totalCompletedModules = 0
        activeStudents.forEach(student => {
          // Assumir que módulo está completo se pontuação >= 70
          if (student.completedModules) {
            totalCompletedModules += student.completedModules
          }
        })
        
        const avgCompletionRate = activeStudentsCount > 0 && activeModules > 0
          ? Math.round((totalCompletedModules / (activeStudentsCount * activeModules)) * 100)
          : 0

        // 4. Calcular tempo médio de sessão (buscar dos quiz_attempts)
        const attemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'))
        let totalTime = 0
        let timeCount = 0
        
        attemptsSnapshot.docs.forEach(doc => {
          const data = doc.data()
          if (data.timeSpent && data.timeSpent > 0 && data.timeSpent < 3600) { // Ignorar tempos muito longos
            totalTime += data.timeSpent
            timeCount++
          }
        })
        
        const avgTime = timeCount > 0 ? Math.round(totalTime / timeCount / 60) : 0 // Converter para minutos

        // Pegar top 5 estudantes para exibir
        const top5Students = activeStudents.slice(0, 5)

        setStats({
          totalStudents: totalStudents,
          activeModules,
          completionRate: avgCompletionRate,
          avgSessionTime: avgTime,
          activeStudents: activeStudentsCount,
          avgScore: avgScore
        })
        
        setTopStudents(top5Students)
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        // Valores padrão em caso de erro
        setStats({
          totalStudents: 0,
          activeModules: 1,
          completionRate: 0,
          avgSessionTime: 0,
          activeStudents: 0,
          avgScore: 0
        })
        setTopStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Listener para mudanças em tempo real nos scores
    const unsubscribeScores = onSnapshot(
      collection(db, 'unified_scores'),
      () => fetchStats()
    )

    // Listener para mudanças nos módulos
    const unsubscribeModules = onSnapshot(
      collection(db, 'settings'),
      () => fetchStats()
    )

    return () => {
      unsubscribeScores()
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
              <>
                <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                <div className="text-sm text-gray-600">Total de Estudantes</div>
                <div className="text-xs text-gray-500 mt-1">no sistema</div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">{stats.activeStudents}</div>
                <div className="text-sm text-gray-600">Estudantes Ativos</div>
                <div className="text-xs text-gray-500 mt-1">{stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%` : '0%'} de engajamento</div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">{stats.avgScore}</div>
                <div className="text-sm text-gray-600">Pontuação Média</div>
                <div className="text-xs text-gray-500 mt-1">pontos por estudante</div>
              </>
            )}
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

      {/* Ranking Global de Estudantes */}
      {!loading && topStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span>Ranking Global de Estudantes</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topStudents.map((student, index) => (
                <div
                  key={student.studentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' : 
                        index === 2 ? 'bg-amber-600 text-white' : 
                        'bg-blue-100 text-blue-700'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.fullName || student.studentName || 'Estudante'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {student.anonymousId || student.studentId.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      {student.totalScore || 0} pts
                    </p>
                    {student.completedModules > 0 && (
                      <p className="text-xs text-gray-500">
                        {student.completedModules} módulo{student.completedModules > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {stats.totalStudents > 5 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Mostrando top 5 de {stats.totalStudents} estudantes
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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