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
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Settings,
  GraduationCap,
  Shield,
  Activity,
  Bell,
  HelpCircle
} from 'lucide-react'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

export default function ProfessorDashboardPage() {
  const { user, loading, hasAccess } = useProfessorAccess()

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
                  <span className="font-medium">{user.displayName || 'Professor'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <NotificationCenter role="professor" />
                  <Button variant="ghost" size="sm" onClick={handleHelpClick}>
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
                    <Settings className="w-4 h-4" />
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
                  {/* Seção de módulos será renderizada pelo EnhancedProfessorDashboard */}
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">
                            Configuração de Módulos
                          </h2>
                          <p className="text-blue-700">
                            Configure módulos, defina pré-requisitos e controle acessibilidade
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma turma
                    </h3>
                    <p className="text-gray-600">
                      Vá para a aba "Turmas" e selecione uma turma para configurar seus módulos.
                    </p>
                  </div>
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
