'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { 
  Users, 
  BarChart3, 
  TrendingUp,
  Activity,
  Trophy,
  Award,
  RefreshCw,
  GraduationCap,
  Loader2,
  Crown,
  Medal,
  ChevronDown,
  ChevronUp,
  Star,
  BookOpen,
  Lock,
  Play,
  Settings
} from 'lucide-react'
import { RegistrationControl } from './RegistrationControl'
import { collection, getDocs, onSnapshot, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import unifiedScoringService from '@/services/unifiedScoringService'
import { modules } from '@/data/modules'

interface SimplifiedProfessorDashboardProps {
  className?: string
  onNavigateToTab?: (tabValue: string) => void
}

export function SimplifiedProfessorDashboard({ 
  className = '',
  onNavigateToTab
}: SimplifiedProfessorDashboardProps) {
  const { user } = useFirebaseAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    avgScore: 0,
    totalCompletedModules: 0,
    totalTime: 0
  })
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRanking, setExpandedRanking] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1'])
  const [moduleLoading, setModuleLoading] = useState(true)
  
  // Buscar dados globais de todos os estudantes
  const fetchGlobalStats = async () => {
    try {
      console.log('🌍 [Dashboard Simplificado] Buscando dados globais...')
      setRefreshing(true)
      
      // Buscar TODOS os estudantes do sistema
      const allStudentsData = await unifiedScoringService.getAllStudentsRanking(1000)
      
      console.log(`📊 [Dashboard Simplificado] Total de estudantes: ${allStudentsData.length}`)
      
      // Filtrar estudantes ativos (com pontuação > 0)
      const activeStudents = allStudentsData.filter(student => student.totalScore > 0)
      
      // Calcular estatísticas
      let totalScore = 0
      let totalCompletedModules = 0
      
      activeStudents.forEach(student => {
        totalScore += student.totalScore || 0
        totalCompletedModules += student.completedModules || 0
      })
      
      const avgScore = activeStudents.length > 0
        ? Math.round(totalScore / activeStudents.length)
        : 0
        
      // Calcular tempo total de estudo
      const attemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'))
      let totalTime = 0
      
      attemptsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.timeSpent && data.timeSpent > 0 && data.timeSpent < 7200) {
          totalTime += data.timeSpent
        }
      })
      
      // Converter para horas
      const totalHours = Math.round(totalTime / 3600)
      
      setStats({
        totalStudents: allStudentsData.length,
        activeStudents: activeStudents.length,
        avgScore: avgScore,
        totalCompletedModules: totalCompletedModules,
        totalTime: totalHours
      })
      
      // Salvar todos os estudantes para o ranking
      setAllStudents(allStudentsData)
      
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas globais:', error)
      // Valores padrão em caso de erro
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        avgScore: 0,
        totalCompletedModules: 0,
        totalTime: 0
      })
      setAllStudents([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Carregar módulos desbloqueados do Firebase
  const loadModules = () => {
    if (!db) {
      setModuleLoading(false)
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'modules'), 
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data()
            const unlockedList = data?.unlocked || ['module-1']
            setUnlockedModules(Array.isArray(unlockedList) ? unlockedList : ['module-1'])
            console.log('🏫 SimplifiedProfessorDashboard recebeu atualização:', {
              documento: 'settings/modules',
              modulosDesbloqueados: unlockedList,
              timestamp: new Date().toISOString()
            })
          } else {
            // Criar documento padrão se não existir
            setDoc(docSnapshot.ref, { 
              unlocked: ['module-1'], 
              lastUpdated: new Date(),
              createdBy: user?.id || 'system'
            }, { merge: true }).catch(error => {
              console.error('Erro ao criar documento padrão:', error)
            })
            setUnlockedModules(['module-1'])
          }
        } catch (error) {
          console.error('Erro ao processar dados dos módulos:', error)
          setUnlockedModules(['module-1'])
        } finally {
          setModuleLoading(false)
        }
      },
      (error) => {
        console.error('Erro do Firestore ao buscar módulos:', error)
        setUnlockedModules(['module-1'])
        setModuleLoading(false)
      }
    )

    return unsubscribe
  }

  // Alternar acesso de módulo
  const toggleModuleAccess = async (moduleId: string) => {
    console.log('🔄 Iniciando alternância de acesso para módulo:', moduleId)
    console.log('📊 Estado atual:', { 
      dbExists: !!db, 
      userExists: !!user, 
      userId: user?.id || user?.uid, 
      userEmail: user?.email 
    })
    
    // Verificação melhorada de autenticação
    if (!db) {
      console.error('❌ Firebase database não disponível')
      alert('Erro: Sistema de banco de dados não disponível')
      return
    }
    
    if (!user) {
      console.error('❌ Usuário não autenticado')
      alert('Erro: Você precisa estar logado como professor')
      return
    }
    
    const userId = user.id || user.uid
    if (!userId) {
      console.error('❌ ID do usuário não encontrado')
      alert('Erro: ID do usuário não identificado')
      return
    }

    try {
      const isCurrentlyUnlocked = unlockedModules.includes(moduleId)
      const newUnlocked = isCurrentlyUnlocked 
        ? unlockedModules.filter(id => id !== moduleId)
        : [...new Set([...unlockedModules, moduleId])]

      // Garantir que sempre há pelo menos um módulo desbloqueado
      if (newUnlocked.length === 0) {
        console.warn('⚠️ Tentativa de bloquear todos os módulos')
        alert('Erro: Pelo menos um módulo deve permanecer ativo')
        return
      }

      const updateData = {
        unlocked: newUnlocked,
        lastUpdated: new Date(),
        lastUpdatedBy: userId,
        lastUpdateType: isCurrentlyUnlocked ? 'bloquear' : 'desbloquear',
        moduleId: moduleId,
        userEmail: user.email || 'n/a'
      }
      
      console.log('📦 Dados para atualização:', updateData)

      await setDoc(doc(db, 'settings', 'modules'), updateData, { merge: true })
      
      console.log(`✅ Módulo ${moduleId} ${isCurrentlyUnlocked ? 'bloqueado' : 'desbloqueado'} com sucesso`)
      
    } catch (error) {
      console.error(`❌ Erro detalhado ao alterar módulo ${moduleId}:`, error)
      
      // Tratamento melhor de erros
      let errorMessage = 'Erro desconhecido ao alterar módulo'
      
      if (error?.code === 'permission-denied') {
        errorMessage = 'Sem permissão para alterar módulos. Verifique se você está logado como professor.'
      } else if (error?.code === 'unauthenticated') {
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error?.message) {
        errorMessage = `Erro técnico: ${error.message}`
      }
      
      alert(errorMessage)
    }
  }

  const getModuleIcon = (moduleIcon: string) => {
    switch (moduleIcon) {
      case '📊': return <BarChart3 className="w-6 h-6" />
      case '🔬': return <Activity className="w-6 h-6" />
      case '📏': return <Settings className="w-6 h-6" />
      case '🎯': return <Trophy className="w-6 h-6" />
      default: return <BookOpen className="w-6 h-6" />
    }
  }

  useEffect(() => {
    if (!db || !user) {
      setLoading(false)
      setModuleLoading(false)
      return
    }

    fetchGlobalStats()
    
    // Carregar módulos
    const unsubscribeModules = loadModules()

    // Listener para mudanças em tempo real no ranking
    const unsubscribeScores = onSnapshot(
      collection(db, 'unified_scores'),
      () => {
        if (!refreshing) {
          fetchGlobalStats()
        }
      }
    )

    return () => {
      unsubscribeScores()
      if (unsubscribeModules) {
        unsubscribeModules()
      }
    }
  }, [user])
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{position}</span>
    }
  }
  
  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
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
      {/* Header com título e botão de atualizar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GraduationCap className="w-8 h-8 text-indigo-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Docente</h2>
            <p className="text-gray-600">Visão das suas turmas e estudantes</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fetchGlobalStats()}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <Badge variant="secondary" className="text-xs">Total</Badge>
            </div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                <p className="text-sm text-gray-600">nas suas turmas</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-green-600" />
              <Badge variant="secondary" className="text-xs">Ativos</Badge>
            </div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.activeStudents}</div>
                <p className="text-sm text-gray-600">
                  {stats.totalStudents > 0 
                    ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% de engajamento`
                    : '0% de engajamento'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <Badge variant="secondary" className="text-xs">Progresso</Badge>
            </div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalCompletedModules > 0 && stats.activeStudents > 0
                    ? `${Math.round((stats.totalCompletedModules / stats.activeStudents) * 100)}%`
                    : '0%'
                  }
                </div>
                <p className="text-sm text-gray-600">dos módulos concluídos</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <Badge variant="secondary" className="text-xs">Média</Badge>
            </div>
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}</div>
                <p className="text-sm text-gray-600">pontos por estudante</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Controle de Cadastros */}
      <RegistrationControl className="mt-6" />

      {/* Ranking Completo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <span>Ranking Completo</span>
              <Badge variant="default" className="ml-2">
                {allStudents.length} estudantes
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedRanking(!expandedRanking)}
            >
              {expandedRanking ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expandedRanking ? 'Recolher' : 'Expandir'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-gray-500 mt-2">Carregando ranking...</p>
              </div>
            ) : allStudents.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">Nenhum estudante encontrado no sistema</p>
                <p className="text-gray-500 text-sm mt-1">
                  Os estudantes aparecerão aqui quando completarem atividades
                </p>
              </div>
            ) : (
              <>
                {allStudents
                  .slice(0, expandedRanking ? undefined : 10)
                  .map((student, index) => (
                    <div
                      key={student.studentId}
                      className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold
                          ${getPositionStyle(index + 1)}
                        `}>
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.fullName || student.studentName || 'Estudante'}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>ID: {student.anonymousId || student.studentId.slice(-4)}</span>
                            {student.email && (
                              <>
                                <span>•</span>
                                <span>{student.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 justify-end">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-xl text-gray-900">
                            {student.totalScore || 0}
                          </span>
                          <span className="text-gray-500 text-sm">pts</span>
                        </div>
                        {student.completedModules > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {student.completedModules} módulo{student.completedModules !== 1 ? 's' : ''} concluído{student.completedModules !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                
                {!expandedRanking && allStudents.length > 10 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedRanking(true)}
                    >
                      Ver todos os {allStudents.length} estudantes
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controle de Módulos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            <span>Controle de Módulos</span>
            <Badge variant="info" className="ml-2">
              Global
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ative ou desative módulos para todos os alunos do sistema
          </p>
        </CardHeader>
        <CardContent>
          {moduleLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Carregando módulos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((module) => {
                const isUnlocked = unlockedModules.includes(module.id)
                return (
                  <div
                    key={module.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200
                      ${isUnlocked 
                        ? 'border-green-300 bg-green-50 hover:border-green-400' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center text-white
                          ${isUnlocked ? 'bg-green-500' : 'bg-gray-400'}
                        `}>
                          {getModuleIcon(module.icon)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {module.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {module.estimatedTime}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={isUnlocked ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {isUnlocked ? (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Bloqueado
                          </>
                        )}
                      </Badge>
                      
                      <Button
                        size="sm"
                        variant={isUnlocked ? "destructive" : "default"}
                        onClick={() => toggleModuleAccess(module.id)}
                        title={
                          isUnlocked
                            ? "Bloquear módulo para todos os alunos"
                            : "Desbloquear módulo para todos os alunos"
                        }
                      >
                        {isUnlocked ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Bloquear
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Informações adicionais */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">
                        {module.description?.slice(0, 80)}...
                      </p>
                      {module.maxPoints && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="w-3 h-3 mr-1" />
                          {module.maxPoints} pontos máximos
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Estatísticas dos módulos */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Status do Sistema</span>
              </div>
              <Badge variant="info" className="bg-blue-100 text-blue-800">
                {unlockedModules.length}/{modules.length} módulos ativos
              </Badge>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Módulos ativos são visíveis para todos os alunos em <strong>/jogos</strong>. 
              Alterações são aplicadas imediatamente no sistema.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Todos os Estudantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taxa de Conclusão</span>
                <span className="font-semibold">
                  {stats.activeStudents > 0 && stats.totalCompletedModules > 0
                    ? `${Math.round((stats.totalCompletedModules / stats.activeStudents) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="text-xs text-gray-500">
                dos estudantes concluíram todos os módulos
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tempo Total de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{stats.totalTime}h</span>
                <span className="text-gray-600">acumulado por todos os estudantes</span>
              </div>
              <div className="text-xs text-gray-500">
                Média: {stats.activeStudents > 0 ? `${Math.round((stats.totalTime * 60) / stats.activeStudents)} min/estudante` : '0 min/estudante'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SimplifiedProfessorDashboard