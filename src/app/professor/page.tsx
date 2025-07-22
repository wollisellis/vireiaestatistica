'use client'

import React from 'react'
import { ModuleProgressProvider } from '@/contexts/ModuleProgressContext'
import EnhancedProfessorDashboard from '@/components/professor/EnhancedProfessorDashboard'
import ImprovedClassManagement from '@/components/professor/ImprovedClassManagement'
import AnalyticsDashboard from '@/components/professor/AnalyticsDashboard'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useFlexibleAccess } from '@/hooks/useRoleRedirect'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { modules } from '@/data/modules'
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings,
  GraduationCap,
  Shield,
  Activity,
  Bell,
  HelpCircle,
  LogOut,
  Clock,
  Target,
  Scale,
  Play,
  Lock,
  CheckCircle,
  Monitor
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { HealthIndicator } from '@/components/system/HealthIndicator'
import { HealthDashboard } from '@/components/system/HealthDashboard'

export default function ProfessorDashboardPage() {
  const { user, loading, hasAccess } = useFlexibleAccess()
  const { signOut } = useFirebaseAuth()
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1'])
  const [moduleLoading, setModuleLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Carregar módulos desbloqueados do Firebase - Otimizado
  useEffect(() => {
    if (!db) {
      setModuleLoading(false)
      return
    }

    const unsubscribe = onSnapshot(doc(db, 'settings', 'modules'), (doc) => {
      try {
        if (doc.exists()) {
          setUnlockedModules(doc.data().unlocked || ['module-1'])
        } else {
          // Criar documento padrão se não existir
          setDoc(doc.ref, { unlocked: ['module-1'], lastUpdated: new Date() }, { merge: true })
        }
      } catch (error) {
        console.error('Erro ao processar módulos:', error)
        setUnlockedModules(['module-1']) // Fallback seguro
      } finally {
        setModuleLoading(false)
      }
    }, (error) => {
      console.error('Erro ao buscar módulos desbloqueados:', error)
      setUnlockedModules(['module-1']) // Fallback em caso de erro
      setModuleLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleNotificationClick = () => {
    console.log('Abrir notificações')
  }

  const handleSettingsClick = () => {
    console.log('Abrir configurações')
  }

  const handleHelpClick = () => {
    console.log('Abrir ajuda')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-emerald-800">Carregando Dashboard...</h2>
          <p className="text-emerald-600 text-sm mt-2">Autenticando professor</p>
        </div>
      </div>
    )
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="p-8">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Restrito
              </h1>
              <p className="text-gray-600 mb-6">
                Esta é uma área restrita para professores. Faça login com suas credenciais de professor.
              </p>
              <div className="space-y-3">
                <Button className="w-full">
                  Fazer Login como Professor
                </Button>
                <Button variant="outline" className="w-full">
                  Solicitar Acesso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getModuleIcon = (moduleIcon: string) => {
    switch (moduleIcon) {
      case '📊': return <BarChart3 className="w-6 h-6" />
      case '🔬': return <Activity className="w-6 h-6" />
      case '📏': return <Scale className="w-6 h-6" />
      case '🎯': return <Target className="w-6 h-6" />
      default: return <BookOpen className="w-6 h-6" />
    }
  }

  const toggleModuleAccess = async (moduleId: string) => {
    if (!db) {
      console.error('Firebase não inicializado')
      alert('Erro: Firebase não está configurado')
      return
    }

    if (!user?.id) {
      console.error('Usuário não autenticado')
      alert('Erro: Usuário não autenticado')
      return
    }

    try {
      const isCurrentlyUnlocked = unlockedModules.includes(moduleId)
      const newUnlocked = isCurrentlyUnlocked 
        ? unlockedModules.filter(id => id !== moduleId)
        : [...unlockedModules, moduleId]

      const updateData = {
        unlocked: newUnlocked,
        lastUpdated: new Date(),
        lastUpdatedBy: user.id
      }

      await setDoc(doc(db, 'settings', 'modules'), updateData, { merge: true })
      
      console.log(`✅ Módulo ${moduleId} ${isCurrentlyUnlocked ? 'bloqueado' : 'desbloqueado'} com sucesso`)
      
      // Notificação visual de sucesso (opcional)
      // toast.success(`Módulo ${isCurrentlyUnlocked ? 'bloqueado' : 'desbloqueado'} com sucesso!`)
      
    } catch (error) {
      console.error(`❌ Erro ao alterar acesso do módulo ${moduleId}:`, error)
      alert(`Erro ao ${unlockedModules.includes(moduleId) ? 'bloquear' : 'desbloquear'} módulo. Tente novamente.`)
    }
  }

  const handleLogout = async () => {
    try {
      // Limpeza eficiente de autenticação
      const cookiesToClear = ['guest-mode', 'professor-guest-mode', 'auth-token', 'firebase-auth-token', 'user-role', 'user-session']
      const localStorageKeysToRemove = ['guest-mode', 'professor-guest-mode', 'firebase-auth-token', 'user-data', 'auth-state']

      // Limpar cookies
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })

      // Limpar localStorage
      localStorageKeysToRemove.forEach(key => localStorage.removeItem(key))
      sessionStorage.clear()

      // Sign out do Firebase (se não for usuário convidado)
      if (user && user.id !== 'professor-guest-user') {
        await signOut()
      }

      // Redirecionamento
      window.location.href = '/'
    } catch (error) {
      console.error('Erro no logout:', error)
      window.location.href = '/' // Sempre redirecionar em caso de erro
    }
  }

  return (
    <ModuleProgressProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-8 h-8 text-indigo-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AvaliaNutri</h1>
                    <p className="text-xs text-gray-600">Dashboard do Professor</p>
                  </div>
                </div>
                <Badge variant="info" className="hidden sm:inline-flex">
                  UNICAMP - NT600
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                  <span>Bem-vindo,</span>
                  <span className="font-medium">
                    {user.fullName ? 
                      `Prof. ${user.fullName.split(' ')[0]}` : 
                      'Professor'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <HealthIndicator 
                    showRefreshButton={true}
                    showDetailsPopover={true}
                    onHealthChange={(health) => {
                      console.log('Health status changed:', health)
                    }}
                  />
                  <NotificationCenter role="professor" />
                  <Button variant="ghost" size="sm" onClick={handleHelpClick}>
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                    title="Sair e voltar ao login"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-0 h-auto p-0">
                <TabsTrigger 
                  value="dashboard" 
                  className="border-b-2 border-transparent data-[state=active]:border-indigo-500 rounded-none px-4 py-4"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger 
                  value="classes" 
                  className="border-b-2 border-transparent data-[state=active]:border-indigo-500 rounded-none px-4 py-4"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Turmas
                </TabsTrigger>
                <TabsTrigger 
                  value="modules" 
                  className="border-b-2 border-transparent data-[state=active]:border-indigo-500 rounded-none px-4 py-4"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Módulos
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="border-b-2 border-transparent data-[state=active]:border-indigo-500 rounded-none px-4 py-4"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="system" 
                  className="border-b-2 border-transparent data-[state=active]:border-indigo-500 rounded-none px-4 py-4"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              {/* Main Content */}
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <TabsContent value="dashboard" className="space-y-6">
                  {/* Welcome Banner */}
                  <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">
                            Bem-vindo ao Dashboard do Professor!
                          </h2>
                          <p className="text-indigo-100">
                            Gerencie suas turmas, monitore o progresso dos estudantes e configure módulos.
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <GraduationCap className="w-16 h-16 text-indigo-200" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dashboard Principal */}
                  <EnhancedProfessorDashboard onNavigateToTab={setActiveTab} />
                </TabsContent>

                <TabsContent value="classes" className="space-y-6">
                  {/* Gerenciamento de turmas */}
                  <ImprovedClassManagement 
                    professorId={user?.id || 'demo'} 
                    professorName={user?.fullName || 'Prof. Dr. Dennys Esper'}
                  />
                </TabsContent>

                <TabsContent value="modules" className="space-y-6">
                  {/* Header da seção */}
                  <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-emerald-600" />
                        <div>
                          <h2 className="text-xl font-bold text-emerald-900">
                            Status Real dos Módulos
                          </h2>
                          <p className="text-emerald-700">
                            Veja exatamente o que está disponível para os estudantes em <strong>/jogos</strong>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card de Realidade vs Expectativa */}
                  <Card className="border-l-4 border-blue-500 bg-blue-50">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            📊 Situação Atual da Plataforma
                          </h3>
                          <div className="text-blue-800 text-sm space-y-2">
                            <p><strong>✅ IMPLEMENTADO E FUNCIONAL:</strong> Apenas 1 módulo (Módulo 1)</p>
                            <p><strong>🔒 ESTRUTURA PLANEJADA:</strong> Módulos 2, 3 e 4 existem apenas como plano/estrutura</p>
                            <p><strong>👨‍🎓 O que os estudantes veem:</strong> Página /jogos mostra apenas o Módulo 1 ativo</p>
                            <p><strong>👨‍🏫 O que professores veem:</strong> Estrutura completa com controles de acesso</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* MÓDULO FUNCIONAL - O que realmente existe */}
                  <div className="grid gap-6">
                    {/* Card do Módulo 1 - O ÚNICO FUNCIONAL */}
                    {(() => {
                      const module = modules.find(m => m.id === 'module-1')
                      if (!module) return null
                      
                      const isUnlocked = unlockedModules.includes(module.id)
                      return (
                        <Card key={module.id} className="border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50">
                          <CardContent className="p-8">
                            <div className="flex items-start space-x-6">
                              <div className="p-4 rounded-xl flex-shrink-0 shadow-md bg-emerald-100 text-emerald-600">
                                {getModuleIcon(module.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-3">
                                  <h3 className="text-2xl font-bold text-emerald-900 leading-tight">
                                    {module.title}
                                  </h3>
                                  <Badge variant="default" className="bg-emerald-600 text-white">
                                    ✅ FUNCIONAL
                                  </Badge>
                                  <Badge variant="outline" className="border-emerald-400 text-emerald-700">
                                    Disponível em /jogos
                                  </Badge>
                                </div>
                                <p className="text-emerald-800 text-lg mb-6 leading-relaxed font-medium">
                                  {module.description}
                                </p>
                                
                                {/* Status real de funcionamento */}
                                <div className="mb-6 p-4 bg-emerald-100 rounded-lg border border-emerald-300">
                                  <h4 className="font-semibold text-emerald-900 mb-2">🎯 Status Real de Funcionamento:</h4>
                                  <div className="space-y-2 text-emerald-800 text-sm">
                                    <p>✅ <strong>Quiz implementado:</strong> 14 questões → 7 sorteadas aleatoriamente</p>
                                    <p>✅ <strong>Sistema de pontuação:</strong> Integrado com unifiedScoringService</p>
                                    <p>✅ <strong>Progresso do estudante:</strong> Salvo no Firebase</p>
                                    <p>✅ <strong>Banco de questões:</strong> module1QuestionBank.ts com dados reais SISVAN</p>
                                    <p>✅ <strong>Rota ativa:</strong> /jogos/modulo-1/quiz</p>
                                  </div>
                                </div>
                                
                                {/* Estatísticas reais */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-lg border border-emerald-200">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">14</div>
                                    <div className="text-sm text-gray-600">Questões no Banco</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">7</div>
                                    <div className="text-sm text-gray-600">Por Quiz</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">{module.estimatedTime}</div>
                                    <div className="text-sm text-gray-600">Min. Estimados</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-600">100%</div>
                                    <div className="text-sm text-gray-600">Implementado</div>
                                  </div>
                                </div>
                                
                                {/* Controle de acesso simplificado */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-emerald-200">
                                  <div className="flex items-center space-x-3">
                                    <Badge 
                                      variant="default"
                                      className="bg-emerald-600 text-white px-3 py-1"
                                    >
                                      {isUnlocked ? '🟢 ATIVO para Estudantes' : '🔴 BLOQUEADO'}
                                    </Badge>
                                    <span className="text-sm text-emerald-700">
                                      {isUnlocked ? 'Visível na página /jogos' : 'Não aparece em /jogos'}
                                    </span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={isUnlocked ? "destructive" : "default"}
                                    onClick={() => toggleModuleAccess(module.id)}
                                    className={`min-w-[140px] ${!isUnlocked ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                  >
                                    {isUnlocked ? (
                                      <>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Desativar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Ativar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })()}

                    {/* Outros módulos - STATUS PLANEJADO */}
                    <Card className="border-2 border-gray-300 bg-gray-50">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="p-3 bg-gray-200 rounded-lg flex-shrink-0">
                            <Lock className="w-6 h-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-2">
                              📋 Módulos 2, 3 e 4 - Estrutura Planejada
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                              Existem apenas como estrutura de dados em <code>modules.ts</code> - não há implementação funcional.
                            </p>
                            
                            <div className="space-y-3">
                              {modules.filter(m => m.id !== 'module-1').map(module => (
                                <div key={module.id} className="p-3 bg-white rounded border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-medium text-gray-800">{module.title}</h4>
                                      <p className="text-sm text-gray-600">{module.description}</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                      🔒 APENAS ESTRUTURA
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-yellow-800 text-sm">
                                <strong>⚠️ Nota:</strong> Estes módulos não aparecem em <strong>/jogos</strong> pois são filtrados programaticamente. 
                                Para implementá-los, seria necessário criar os bancos de questões, rotas e componentes correspondentes.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                  </div>

                  {/* Resumo Final Realista */}
                  <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                        📊 Status Real da Plataforma bioestat-platform
                      </h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">1</div>
                          <div className="text-sm text-emerald-700">Módulo Funcional</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">14</div>
                          <div className="text-sm text-emerald-700">Questões Reais</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">100%</div>
                          <div className="text-sm text-emerald-700">Implementação</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">1</div>
                          <div className="text-sm text-emerald-700">Quiz Ativo</div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-emerald-200">
                        <h4 className="font-semibold text-gray-900 mb-3">🎯 O que funciona de verdade:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-emerald-700">✅ Implementado e Testado:</span>
                            <ul className="mt-1 text-gray-600 space-y-1">
                              <li>• Quiz randomizado funcional</li>
                              <li>• Sistema de pontuação integrado</li>
                              <li>• Dados reais do SISVAN/POF</li>
                              <li>• Progresso salvo no Firebase</li>
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-emerald-700">🔒 Ainda não implementado:</span>
                            <ul className="mt-1 text-gray-600 space-y-1">
                              <li>• Módulos 2, 3 e 4 (apenas estrutura)</li>
                              <li>• Conteúdo interativo avançado</li>
                              <li>• Exercícios drag-drop</li>
                              <li>• Casos clínicos complexos</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsDashboard professorId={user?.id || 'demo'} />
                </TabsContent>

                <TabsContent value="system" className="space-y-6">
                  {/* Header da seção */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <Monitor className="w-8 h-8 text-blue-600" />
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">
                            Monitoramento do Sistema
                          </h2>
                          <p className="text-blue-700">
                            Acompanhe a saúde e performance da plataforma em tempo real
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dashboard de Saúde */}
                  <HealthDashboard 
                    professorId={user?.id || 'demo'} 
                    compactMode={false}
                  />
                </TabsContent>
              </main>
            </Tabs>
          </div>
        </nav>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>
                AvaliaNutri - Dashboard do Professor
                <br />
                UNICAMP - Faculdade de Ciências da Saúde - Desenvolvido por Ellis Abhulime
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ModuleProgressProvider>
  )
}
