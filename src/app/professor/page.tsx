'use client'

import React from 'react'
import { ModuleProgressProvider } from '@/contexts/ModuleProgressContext'
import EnhancedProfessorDashboard from '@/components/professor/EnhancedProfessorDashboard'
import ClassManagement from '@/components/professor/ClassManagement'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useProfessorAccess } from '@/hooks/useRoleRedirect'
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
  const { user, loading, hasAccess } = useProfessorAccess()
  const { signOut } = useFirebaseAuth()
  const [unlockedModules, setUnlockedModules] = useState<string[]>(['module-1'])
  const [moduleLoading, setModuleLoading] = useState(true)

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

  const handleNotificationClick = () => {
    console.log('Abrir notificações')
  }

  const handleSettingsClick = () => {
    console.log('Abrir configurações')
  }

  const handleHelpClick = () => {
    console.log('Abrir ajuda')
  }

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
    if (!db) return

    try {
      const isCurrentlyUnlocked = unlockedModules.includes(moduleId)
      
      let newUnlocked: string[]
      if (isCurrentlyUnlocked) {
        // Bloquear módulo (remover da lista)
        newUnlocked = unlockedModules.filter(id => id !== moduleId)
      } else {
        // Desbloquear módulo (adicionar à lista)
        newUnlocked = [...unlockedModules, moduleId]
      }

      await setDoc(doc(db, 'settings', 'modules'), {
        unlocked: newUnlocked,
        lastUpdated: new Date(),
        lastUpdatedBy: user?.uid || 'unknown'
      }, { merge: true })

      console.log(`Módulo ${moduleId} ${isCurrentlyUnlocked ? 'bloqueado' : 'desbloqueado'} com sucesso`)
    } catch (error) {
      console.error('Erro ao alterar acesso do módulo:', error)
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
      if (user && user.uid !== 'professor-guest-user') {
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
                    {user.displayName ? 
                      `Prof. ${user.displayName.split(' ')[0]}` : 
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
            <Tabs defaultValue="dashboard" className="w-full">
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
                  <EnhancedProfessorDashboard />
                </TabsContent>

                <TabsContent value="classes" className="space-y-6">
                  {/* Header da seção */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8 text-green-600" />
                        <div>
                          <h2 className="text-xl font-bold text-green-900">
                            Gerenciamento de Turmas
                          </h2>
                          <p className="text-green-700">
                            Crie turmas, adicione estudantes e gerencie matrículas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gerenciamento de turmas */}
                  <ClassManagement professorId={user.uid} />
                </TabsContent>

                <TabsContent value="modules" className="space-y-6">
                  {/* Header da seção */}
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">
                            Módulos do Sistema
                          </h2>
                          <p className="text-blue-700">
                            Visualize todos os módulos disponíveis na plataforma AvaliaNutri
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de módulos */}
                  {moduleLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Carregando módulos...</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {modules.map((module) => {
                        const isUnlocked = unlockedModules.includes(module.id)
                        return (
                          <Card key={module.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className={`
                                  p-3 rounded-lg flex-shrink-0
                                  ${!isUnlocked ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}
                                `}>
                                  {!isUnlocked ? 
                                    <Lock className="w-6 h-6" /> : 
                                    getModuleIcon(module.icon)
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                                      {module.title}
                                    </h3>
                                    {isUnlocked && (
                                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                    {module.description}
                                  </p>
                                  <div className="flex items-center justify-between text-xs mb-3">
                                    <div className="flex items-center space-x-1 text-gray-500">
                                      <Clock className="w-3 h-3" />
                                      <span>{module.estimatedTime} min</span>
                                    </div>
                                    <Badge 
                                      variant={!isUnlocked ? "secondary" : "default"}
                                      className="text-xs px-2 py-1"
                                    >
                                      {!isUnlocked ? 'Bloqueado' : 'Disponível'}
                                    </Badge>
                                  </div>
                                  <div className="mb-3 pb-3 border-b border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      <strong>Conteúdos:</strong> {module.content.length} tópicos
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      <strong>Exercícios:</strong> {module.exercises.length} atividades
                                    </div>
                                  </div>
                                  
                                  {/* Botão de controle de acesso */}
                                  <Button
                                    size="sm"
                                    variant={isUnlocked ? "destructive" : "default"}
                                    onClick={() => toggleModuleAccess(module.id)}
                                    className="w-full text-xs"
                                  >
                                    {isUnlocked ? (
                                      <>
                                        <Lock className="w-3 h-3 mr-1" />
                                        Bloquear Módulo
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Desbloquear Módulo
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}

                  {/* Estatísticas dos módulos */}
                  <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                        Estatísticas dos Módulos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {modules.length}
                          </div>
                          <div className="text-sm text-emerald-700">Total de Módulos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {unlockedModules.length}
                          </div>
                          <div className="text-sm text-emerald-700">Disponíveis</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {modules.reduce((total, m) => total + m.content.length, 0)}
                          </div>
                          <div className="text-sm text-emerald-700">Conteúdos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">
                            {modules.reduce((total, m) => total + m.exercises.length, 0)}
                          </div>
                          <div className="text-sm text-emerald-700">Exercícios</div>
                        </div>
                      </div>
                      
                      {/* Ações rápidas */}
                      <div className="mt-6 pt-4 border-t border-emerald-200">
                        <h4 className="text-md font-medium text-emerald-900 mb-3">Ações Rápidas</h4>
                        <div className="flex gap-3 flex-wrap">
                          <Button
                            size="sm"
                            onClick={() => {
                              modules.forEach(module => {
                                if (!unlockedModules.includes(module.id)) {
                                  toggleModuleAccess(module.id)
                                }
                              })
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Desbloquear Todos
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              modules.forEach(module => {
                                if (unlockedModules.includes(module.id) && module.id !== 'module-1') {
                                  toggleModuleAccess(module.id)
                                }
                              })
                            }}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Bloquear Todos (exceto Módulo 1)
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                  {/* Header da seção */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-8 h-8 text-purple-600" />
                        <div>
                          <h2 className="text-xl font-bold text-purple-900">
                            Analytics
                          </h2>
                          <p className="text-purple-700">
                            Análise detalhada de performance e engajamento dos estudantes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center py-8">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Analytics em Desenvolvimento
                    </h3>
                    <p className="text-gray-600">
                      Relatórios detalhados e visualizações avançadas estarão disponíveis em breve.
                    </p>
                  </div>
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
