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
  CheckCircle
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export default function ProfessorDashboardPage() {
  const { user, loading, hasAccess } = useFlexibleAccess()
  const { signOut } = useFirebaseAuth()
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1'])
  const [moduleLoading, setModuleLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Carregar módulos desbloqueados do Firebase
  useEffect(() => {
    if (!db) {
      setModuleLoading(false)
      return
    }

    const unsubscribe = onSnapshot(doc(db, 'settings', 'modules'), (doc) => {
      if (doc.exists()) {
        setUnlockedModules(doc.data().unlocked || ['module-1'])
      }
      setModuleLoading(false)
    }, (error) => {
      console.error('Erro ao buscar módulos desbloqueados:', error)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !hasAccess()) {
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
      return
    }

    try {
      console.log(`Tentando alterar acesso do módulo: ${moduleId}`)
      console.log('Estado atual dos módulos desbloqueados:', unlockedModules)
      
      const isCurrentlyUnlocked = unlockedModules.includes(moduleId)
      console.log(`Módulo ${moduleId} atualmente ${isCurrentlyUnlocked ? 'desbloqueado' : 'bloqueado'}`)
      
      let newUnlocked: string[]
      if (isCurrentlyUnlocked) {
        // Bloquear módulo (remover da lista)
        newUnlocked = unlockedModules.filter(id => id !== moduleId)
        console.log(`Bloqueando módulo ${moduleId}. Nova lista:`, newUnlocked)
      } else {
        // Desbloquear módulo (adicionar à lista)
        newUnlocked = [...unlockedModules, moduleId]
        console.log(`Desbloqueando módulo ${moduleId}. Nova lista:`, newUnlocked)
      }

      const updateData = {
        unlocked: newUnlocked,
        lastUpdated: new Date(),
        lastUpdatedBy: user?.id || 'unknown'
      }
      
      console.log('Dados que serão salvos no Firebase:', updateData)

      await setDoc(doc(db, 'settings', 'modules'), updateData, { merge: true })

      console.log(`✅ Módulo ${moduleId} ${isCurrentlyUnlocked ? 'bloqueado' : 'desbloqueado'} com sucesso`)
    } catch (error) {
      console.error(`❌ Erro ao alterar acesso do módulo ${moduleId}:`, error)
      alert(`Erro ao ${unlockedModules.includes(moduleId) ? 'bloquear' : 'desbloquear'} módulo. Verifique o console para mais detalhes.`)
    }
  }

  const handleLogout = async () => {
    try {
      // Clear all authentication state
      if (typeof window !== 'undefined') {
        // Clear cookies
        const cookiesToClear = [
          'guest-mode',
          'professor-guest-mode',
          'auth-token',
          'firebase-auth-token',
          'user-role',
          'user-session'
        ];

        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        });

        // Clear localStorage and sessionStorage
        const localStorageKeysToRemove = [
          'guest-mode',
          'professor-guest-mode',
          'firebase-auth-token',
          'user-data',
          'auth-state'
        ];

        localStorageKeysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });

        sessionStorage.clear();
      }

      // Sign out from Firebase if user is authenticated
      if (user && user.id !== 'professor-guest-user') {
        await signOut();
      }

      // Redirect to login page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login page
      window.location.href = '/';
    }
  };

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
                            Módulos Implementados
                          </h2>
                          <p className="text-emerald-700">
                            Gerencie o módulo disponível na plataforma bioestat-platform
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de módulos - Apenas Módulo 1 */}
                  {moduleLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando módulo...</p>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {/* Card principal do Módulo 1 */}
                      {(() => {
                        const module = modules.find(m => m.id === 'module-1')
                        if (!module) return null
                        
                        const isUnlocked = unlockedModules.includes(module.id)
                        return (
                          <Card key={module.id} className="hover:shadow-lg transition-shadow border-2 border-emerald-200">
                            <CardContent className="p-8">
                              <div className="flex items-start space-x-6">
                                <div className={`
                                  p-4 rounded-xl flex-shrink-0 shadow-md
                                  ${!isUnlocked ? 'bg-gray-100 text-gray-400' : 'bg-emerald-100 text-emerald-600'}
                                `}>
                                  {!isUnlocked ? 
                                    <Lock className="w-8 h-8" /> : 
                                    getModuleIcon(module.icon)
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                      {module.title}
                                    </h3>
                                    {isUnlocked && (
                                      <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-gray-700 text-base mb-4 leading-relaxed">
                                    {module.description}
                                  </p>
                                  
                                  {/* Estatísticas detalhadas */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-600">
                                        {module.estimatedTime}
                                      </div>
                                      <div className="text-sm text-gray-600">Minutos</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-600">
                                        {module.content.length}
                                      </div>
                                      <div className="text-sm text-gray-600">Conteúdos</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-600">
                                        {module.exercises.length}
                                      </div>
                                      <div className="text-sm text-gray-600">Exercícios</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-600">
                                        {module.exercises.reduce((total, ex) => total + ex.points, 0)}
                                      </div>
                                      <div className="text-sm text-gray-600">Pontos</div>
                                    </div>
                                  </div>
                                  
                                  {/* Detalhes dos exercícios */}
                                  <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Exercícios do Módulo:</h4>
                                    <div className="space-y-2">
                                      {module.exercises.map((exercise, index) => (
                                        <div key={exercise.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                          <div className="flex items-center space-x-3">
                                            <Badge variant="outline" className="text-xs">
                                              {exercise.difficulty === 'easy' ? 'Fácil' : exercise.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                                            </Badge>
                                            <span className="font-medium text-gray-900">{exercise.title}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">{exercise.points} pts</span>
                                            <Play className="w-4 h-4 text-emerald-600" />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {/* Status e controle de acesso */}
                                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Badge 
                                        variant={!isUnlocked ? "secondary" : "default"}
                                        className={`px-3 py-1 ${isUnlocked ? 'bg-emerald-600 text-white' : ''}`}
                                      >
                                        {!isUnlocked ? 'Bloqueado' : 'Disponível para Estudantes'}
                                      </Badge>
                                      {isUnlocked && (
                                        <span className="text-sm text-emerald-700">✓ Módulo ativo na plataforma</span>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={isUnlocked ? "destructive" : "primary"}
                                      onClick={() => toggleModuleAccess(module.id)}
                                      className="min-w-[140px]"
                                    >
                                      {isUnlocked ? (
                                        <>
                                          <Lock className="w-4 h-4 mr-2" />
                                          Bloquear Módulo
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Ativar Módulo
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
                      
                      {/* Informações sobre desenvolvimento */}
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                              <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-900 mb-2">
                                Módulos em Desenvolvimento
                              </h3>
                              <p className="text-blue-700 text-sm mb-3">
                                Módulos 2, 3 e 4 estão sendo desenvolvidos e estarão disponíveis em breve:
                              </p>
                              <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                                <li><strong>Módulo 2:</strong> Métodos de Avaliação da Composição Corporal</li>
                                <li><strong>Módulo 3:</strong> Avaliação Bioquímica e Clínica</li>
                                <li><strong>Módulo 4:</strong> Interpretação Integrada e Diagnóstico</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Estatísticas do módulo implementado */}
                  <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                        Resumo do Módulo Implementado
                      </h3>
                      {(() => {
                        const module1 = modules.find(m => m.id === 'module-1')
                        if (!module1) return null
                        
                        return (
                          <>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">1</div>
                                <div className="text-sm text-emerald-700">Módulo Ativo</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {module1.content.length}
                                </div>
                                <div className="text-sm text-emerald-700">Conteúdos</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {module1.exercises.length}
                                </div>
                                <div className="text-sm text-emerald-700">Exercícios</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {module1.exercises.reduce((total, ex) => total + ex.points, 0)}
                                </div>
                                <div className="text-sm text-emerald-700">Pontos Totais</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                  {module1.estimatedTime}
                                </div>
                                <div className="text-sm text-emerald-700">Min. de Estudo</div>
                              </div>
                            </div>
                            
                            {/* Detalhes sobre conteúdo */}
                            <div className="bg-white p-4 rounded-lg border border-emerald-200 mb-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Conteúdo Educacional:</h4>
                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-emerald-700">Tópicos Teóricos:</span>
                                  <ul className="mt-1 text-gray-600 space-y-1">
                                    <li>• Fundamentos da avaliação nutricional</li>
                                    <li>• Componentes principais da avaliação</li>
                                    <li>• Avaliação individual vs populacional</li>
                                  </ul>
                                </div>
                                <div>
                                  <span className="font-medium text-emerald-700">Exercícios Práticos:</span>
                                  <ul className="mt-1 text-gray-600 space-y-1">
                                    <li>• Quiz com conceitos fundamentais</li>
                                    <li>• Análise de dados brasileiros (POF/SISVAN)</li>
                                    <li>• Classificação de componentes</li>
                                    <li>• Caso clínico introdutório</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            {/* Controle de acesso */}
                            <div className="pt-4 border-t border-emerald-200">
                              <h4 className="text-md font-medium text-emerald-900 mb-3">Controle de Acesso</h4>
                              <div className="flex gap-3 flex-wrap">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    if (!db) return
                                    try {
                                      await setDoc(doc(db, 'settings', 'modules'), {
                                        unlocked: ['module-1'],
                                        lastUpdated: new Date(),
                                        lastUpdatedBy: user?.id || 'unknown'
                                      }, { merge: true })
                                      console.log('Módulo 1 ativado para estudantes')
                                    } catch (error) {
                                      console.error('Erro ao ativar módulo:', error)
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  disabled={unlockedModules.includes('module-1')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {unlockedModules.includes('module-1') ? 'Módulo Ativo' : 'Ativar Módulo'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    if (!db) return
                                    try {
                                      await setDoc(doc(db, 'settings', 'modules'), {
                                        unlocked: [],
                                        lastUpdated: new Date(),
                                        lastUpdatedBy: user?.id || 'unknown'
                                      }, { merge: true })
                                      console.log('Módulo 1 bloqueado temporariamente')
                                    } catch (error) {
                                      console.error('Erro ao bloquear módulo:', error)
                                    }
                                  }}
                                  className="border-red-200 text-red-700 hover:bg-red-50"
                                  disabled={!unlockedModules.includes('module-1')}
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  {!unlockedModules.includes('module-1') ? 'Módulo Bloqueado' : 'Bloquear Temporariamente'}
                                </Button>
                              </div>
                              <p className="text-xs text-gray-600 mt-2">
                                {unlockedModules.includes('module-1') ? 
                                  '✓ Estudantes podem acessar este módulo e realizar os exercícios' :
                                  '⚠️ Módulo não disponível para estudantes'
                                }
                              </p>
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  <AnalyticsDashboard professorId={user?.id || 'demo'} />
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
