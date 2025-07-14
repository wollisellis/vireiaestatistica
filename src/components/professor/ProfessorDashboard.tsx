'use client'

import React, { useState } from 'react'
import { useProfessorDemo } from '@/contexts/ProfessorDemoContext'

export function ProfessorDashboard() {
  const {
    students,
    analytics,
    moduleSettings,
    toggleModuleLock,
    exportStudentData,
    resetClassProgress
  } = useProfessorDemo()

  const [activeTab, setActiveTab] = useState('students')

  // Loading state while data is being initialized
  if (!analytics || !students || students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de demonstração...</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard do Professor</h1>
              <p className="text-gray-600 mt-2">
                Modo Demonstração - Acesso completo às funcionalidades administrativas
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportStudentData}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                📊 Exportar Dados
              </button>
              <button
                onClick={resetClassProgress}
                className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg"
              >
                🔄 Resetar Progresso
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Total de Estudantes</h3>
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-2xl font-bold">{analytics?.totalStudents || 0}</div>
            <p className="text-xs text-gray-500">Ativos na plataforma</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Pontuação Média</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="text-2xl font-bold">{analytics?.averageScore || 0}</div>
            <p className="text-xs text-gray-500">Pontos por módulo</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Taxa de Conclusão</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round((analytics?.completionRate || 0) * 100)}%
            </div>
            <p className="text-xs text-gray-500">Módulos concluídos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Conquistas Totais</h3>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-2xl font-bold">
              {students?.reduce((sum, s) => sum + (s.achievements?.length || 0), 0) || 0}
            </div>
            <p className="text-xs text-gray-500">Desbloqueadas pelos estudantes</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'students', label: '👥 Estudantes' },
              { key: 'modules', label: '📚 Módulos' },
              { key: 'analytics', label: '📊 Análises' },
              { key: 'leaderboard', label: '🏆 Ranking' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">👥 Lista de Estudantes</h2>
              <p className="text-gray-600">Progresso individual e desempenho dos estudantes</p>
            </div>
            <div className="space-y-4">
              {students?.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {student.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name || 'Usuário'}</p>
                      <p className="text-sm text-gray-500">{student.anonymousId || 'ID'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{student.totalScore || 0} pts</p>
                      <p className="text-sm text-gray-500">
                        {student.completedModules?.length || 0}/4 módulos
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      {student.achievements?.map((achievement, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          🏆 {achievement}
                        </span>
                      )) || []}
                    </div>
                    <div className="text-xs text-gray-500">
                      🕒 {student.lastActivity ? formatDate(student.lastActivity) : 'N/A'}
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">📚 Gerenciamento de Módulos</h2>
              <p className="text-gray-600">Controle de acesso e configurações dos módulos educacionais</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics?.modulePerformance?.map((module) => {
                const isLocked = moduleSettings?.find(m => m.moduleId === module.moduleId)?.isLocked
                return (
                  <div key={module.moduleId} className="border-2 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{module.moduleName || 'Módulo'}</h3>
                      <button
                        className={`px-4 py-2 rounded-lg text-white ${
                          isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                        onClick={() => toggleModuleLock(module.moduleId)}
                      >
                        {isLocked ? '🔒 Bloqueado' : '🔓 Liberado'}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pontuação Média:</span>
                        <span className="font-medium">{module.averageScore || 0} pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Taxa de Conclusão:</span>
                        <span className="font-medium">
                          {Math.round((module.completionRate || 0) * 100)}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Erros Comuns:</p>
                        <div className="space-y-1">
                          {module.commonMistakes?.map((mistake, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mr-1 mb-1">
                              {mistake}
                            </span>
                          )) || []}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }) || []}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">🏆 Top Performers</h2>
                <p className="text-gray-600">Estudantes com melhor desempenho</p>
              </div>
              <div className="space-y-3">
                {analytics?.topPerformers?.map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-yellow-600">#{idx + 1}</span>
                      </div>
                      <span className="font-medium">{student.name || 'Usuário'}</span>
                    </div>
                    <span className="font-bold text-green-600">{student.totalScore || 0} pts</span>
                  </div>
                )) || []}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">⚠️ Estudantes em Dificuldade</h2>
                <p className="text-gray-600">Requerem atenção especial</p>
              </div>
              <div className="space-y-3">
                {analytics?.strugglingStudents?.map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">!</span>
                      </div>
                      <span className="font-medium">{student.name || 'Usuário'}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-red-600">{student.totalScore || 0} pts</span>
                      <p className="text-xs text-gray-500">
                        {student.completedModules?.length || 0}/4 módulos
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">🏆 Ranking da Turma</h2>
              <p className="text-gray-600">
                Classificação completa com nomes reais (visão do professor)
              </p>
            </div>
            <div className="space-y-2">
              {students
                ?.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                .map((student, idx) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 1 ? 'bg-gray-100 text-gray-600' :
                        idx === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.name || 'Usuário'}</p>
                        <p className="text-sm text-gray-500">{student.anonymousId || 'ID'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold">{student.totalScore || 0} pts</p>
                        <p className="text-sm text-gray-500">
                          {student.completedModules?.length || 0}/4 módulos
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {student.achievements?.slice(0, 3).map((achievement, achIdx) => (
                          <span key={achIdx} className="text-yellow-500">🏆</span>
                        )) || []}
                      </div>
                    </div>
                  </div>
                )) || []}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
