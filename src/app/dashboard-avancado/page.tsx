'use client'

import React from 'react'
import { ModuleProgressProvider } from '@/contexts/ModuleProgressContext'
import OverallProgressDashboard from '@/components/progress/OverallProgressDashboard'
import ProgressNotificationSystem from '@/components/notifications/ProgressNotificationSystem'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Users,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react'

export default function DashboardAvancadoPage() {
  const handleModuleClick = (moduleId: string) => {
    console.log('Navegando para módulo:', moduleId)
    // Aqui você implementaria a navegação para a página do módulo
  }

  const handleSettingsClick = () => {
    console.log('Abrindo configurações')
    // Implementar abertura de configurações
  }

  const handleHelpClick = () => {
    console.log('Abrindo ajuda')
    // Implementar abertura da ajuda
  }

  return (
    <ModuleProgressProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sistema de Notificações */}
        <ProgressNotificationSystem />

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">AvaliaNutri</h1>
                    <p className="text-xs text-gray-600">Dashboard Avançado do Estudante</p>
                  </div>
                </div>
                <Badge variant="info" className="hidden sm:inline-flex">
                  UNICAMP - NT600
                </Badge>
              </div>

              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={handleHelpClick}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Ajuda
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSettingsClick}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <a 
                href="#" 
                className="border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600"
              >
                <BarChart3 className="w-4 h-4 mr-2 inline" />
                Progresso
              </a>
              <a 
                href="#" 
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Trophy className="w-4 h-4 mr-2 inline" />
                Ranking
              </a>
              <a 
                href="#" 
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Turma
              </a>
              <a 
                href="#" 
                className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                <TrendingUp className="w-4 h-4 mr-2 inline" />
                Análise
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo ao seu Dashboard!
                  </h2>
                  <p className="text-blue-100">
                    Acompanhe seu progresso na disciplina de Avaliação Nutricional e monitore suas conquistas em tempo real.
                  </p>
                </div>
                <div className="hidden md:block">
                  <BookOpen className="w-16 h-16 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Principal */}
          <OverallProgressDashboard 
            onModuleClick={handleModuleClick}
            className="space-y-8"
          />

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => handleModuleClick('module-1')}
                >
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span>Continuar Estudando</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => console.log('Ver ranking')}
                >
                  <Trophy className="w-6 h-6 mb-2" />
                  <span>Ver Ranking</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="p-4 h-auto flex-col"
                  onClick={() => console.log('Revisar exercícios')}
                >
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span>Revisar Exercícios</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>
              AvaliaNutri - Plataforma de Avaliação Nutricional
              <br />
              Desenvolvido para UNICAMP - Faculdade de Ciências da Saúde
            </p>
          </div>
        </main>
      </div>
    </ModuleProgressProvider>
  )
}