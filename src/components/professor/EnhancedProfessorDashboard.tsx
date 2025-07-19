'use client'

import React, { useState } from 'react'
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
  Calendar
} from 'lucide-react'

interface EnhancedProfessorDashboardProps {
  className?: string
  onNavigateToTab?: (tabValue: string) => void
}

export function EnhancedProfessorDashboard({ 
  className = '',
  onNavigateToTab
}: EnhancedProfessorDashboardProps) {
  const { user } = useFirebaseAuth()
  
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
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-sm text-gray-600">Total de Estudantes</div>
            <div className="text-xs text-gray-500 mt-1">Em todas as turmas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-gray-600">Módulos Ativos</div>
            <div className="text-xs text-gray-500 mt-1">Sistema AvaliaNutri</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <div className="text-sm text-gray-600">Taxa de Conclusão</div>
            <div className="text-xs text-gray-500 mt-1">Média geral</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">45min</div>
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