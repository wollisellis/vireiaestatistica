'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useStudentAccess } from '@/hooks/useRoleRedirect'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import {
  BookOpen,
  Target,
  Users,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  GraduationCap,
  Lightbulb,
  BarChart3,
  Heart,
  Scale,
  Activity,
  User,
  Home,
  Play,
  ChevronRight,
  Star,
  Zap,
  Lock
} from 'lucide-react'
import RankingSidebar from '@/components/ranking/RankingSidebar'
import MobileRanking from '@/components/ranking/MobileRanking'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StudentProgressDashboard } from '@/components/student-progress'
import { StudentProgressProvider } from '@/contexts/StudentProgressContext'
import { Footer } from '@/components/layout'
import Link from 'next/link'
import { useModuleAccess } from '@/hooks/useModuleAccess'

// Base game definitions for NT600 - Nutritional Status Assessment
const baseNutritionalGames = [
  {
    id: 1,
    title: 'Indicadores Antropométricos',
    description: 'Aprenda a avaliar o estado nutricional através de medidas corporais como peso, altura, IMC e circunferências',
    difficulty: 'Muito Fácil',
    estimatedTime: '15-20 min',
    learningObjectives: [
      'Compreender os principais indicadores antropométricos',
      'Calcular e interpretar IMC, relação cintura-quadril',
      'Avaliar adequação de peso e altura para idade',
      'Identificar sinais de desnutrição e obesidade'
    ],
    icon: <Scale className="w-6 h-6" />,
    color: 'bg-emerald-500',
    topics: ['IMC', 'Peso/Altura', 'Circunferências', 'Dobras Cutâneas']
  },
  {
    id: 2,
    title: 'Indicadores Clínicos e Bioquímicos',
    description: 'Domine a interpretação de exames laboratoriais e sinais clínicos para avaliação nutricional',
    difficulty: 'Médio',
    estimatedTime: '20-25 min',
    learningObjectives: [
      'Interpretar exames bioquímicos nutricionais',
      'Reconhecer sinais clínicos de deficiências',
      'Avaliar marcadores de inflamação e metabolismo',
      'Correlacionar achados clínicos com estado nutricional'
    ],
    icon: <Activity className="w-6 h-6" />,
    color: 'bg-teal-500',
    topics: ['Hemograma', 'Proteínas', 'Vitaminas', 'Minerais']
  },
  {
    id: 3,
    title: 'Fatores Demográficos e Socioeconômicos',
    description: 'Entenda como fatores sociais, econômicos e culturais influenciam o estado nutricional populacional',
    difficulty: 'Difícil',
    estimatedTime: '25-30 min',
    learningObjectives: [
      'Analisar determinantes sociais da nutrição',
      'Compreender desigualdades nutricionais',
      'Avaliar segurança alimentar e nutricional',
      'Interpretar dados populacionais de nutrição'
    ],
    icon: <Users className="w-6 h-6" />,
    color: 'bg-cyan-500',
    topics: ['Renda', 'Educação', 'Acesso a Alimentos', 'Cultura Alimentar']
  },
  {
    id: 4,
    title: 'Curvas de Crescimento Interativas',
    description: 'Domine a plotagem e interpretação de curvas de crescimento usando dados reais de crianças brasileiras',
    difficulty: 'Médio',
    estimatedTime: '20-25 min',
    learningObjectives: [
      'Identificar linhas de percentil em gráficos de crescimento',
      'Plotar medições de peso e altura corretamente',
      'Interpretar percentis e classificar estado nutricional',
      'Aplicar conhecimentos em casos reais brasileiros'
    ],
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'bg-indigo-500',
    topics: ['Percentis', 'Plotagem', 'Crescimento Infantil', 'Padrões Brasileiros']
  }
]

export default function JogosNT600Page() {
  const [selectedGame, setSelectedGame] = useState<number | null>(null)
  
  // Use the role-based access hook - this handles all authentication and redirections
  const { user, loading, hasAccess } = useStudentAccess()
  
  // Firebase auth for logout functionality
  const { signOut } = useFirebaseAuth()
  
  // Module access for game locking
  const { moduleSettings, isModuleLocked, loading: moduleLoading } = useModuleAccess()

  // Function to handle logout and redirect to login page
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
        ]

        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
        })

        // Clear localStorage and sessionStorage
        const localStorageKeysToRemove = [
          'guest-mode',
          'professor-guest-mode',
          'firebase-auth-token',
          'user-data',
          'auth-state'
        ]

        localStorageKeysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })

        sessionStorage.clear()
      }

      // Sign out from Firebase if user is authenticated
      if (user && user.id !== 'guest-user' && user.id !== 'professor-guest-user') {
        await signOut()
      }

      // Redirect to login page
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, redirect to login page
      window.location.href = '/'
    }
  }

  // Combine base games with module settings
  const nutritionalGames = baseNutritionalGames.map(game => {
    const locked = isModuleLocked(game.id)
    return {
      ...game,
      isLocked: locked,
      lockMessage: locked ? 'Aguardando liberação do docente' : undefined
    }
  })

  // Show loading state while checking authentication
  if (loading || moduleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando AvaliaNutri...</h2>
          <p className="text-gray-500 mt-2">Preparando seus jogos educacionais</p>
        </div>
      </div>
    )
  }

  // At this point, useStudentAccess has already handled all authentication and redirections
  // If we reach here, the user has valid student access

  return (
    <StudentProgressProvider>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    title="Sair e voltar ao login"
                  >
                    <Home className="w-5 h-5" />
                    <span>Início</span>
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">NT600 - Jogos Educacionais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/modules">
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Módulos
                    </Button>
                  </Link>
                  <Link href="/games">
                    <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      AvaliaNutri
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* User Welcome */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                  <p className="text-blue-800">
                    👋 Olá, <span className="font-semibold">{user.fullName}</span>!
                    {user.anonymousId && (
                      <span className="ml-2 text-blue-600">
                        (ID: {user.anonymousId})
                      </span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Course Introduction */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
                  <Scale className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AvaliaNutri
                  </h1>
                  <p className="text-xl text-emerald-600 mt-2 font-medium">Jogos Educacionais para Avaliação Nutricional</p>
                  <p className="text-sm text-gray-600 mt-1">NT600 - Proposta Inovadora 2025</p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Uma abordagem revolucionária para o ensino de avaliação nutricional através de jogos educacionais
                  interativos, baseados em dados reais da população brasileira e metodologia ultra-iniciante.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Target className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Objetivo</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Capacitar estudantes para avaliar o estado nutricional populacional através de
                        indicadores antropométricos, clínicos, bioquímicos e socioeconômicos.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Lightbulb className="w-6 h-6 text-green-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Inovação</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Gamificação educacional com dados reais brasileiros, analogias do cotidiano
                        e abordagem zero-conhecimento para máxima acessibilidade.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Award className="w-6 h-6 text-purple-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Impacto</h3>
                      </div>
                      <p className="text-gray-700 text-sm">
                        Formação de profissionais mais preparados para enfrentar os desafios
                        nutricionais da população brasileira contemporânea.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>

            {/* Student Progress Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <StudentProgressDashboard compact={true} />
            </motion.div>

            {/* Games Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Jogos Educacionais Interativos</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Quatro jogos especializados que cobrem todos os aspectos da avaliação nutricional,
                  desde indicadores antropométricos até fatores socioeconômicos.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {nutritionalGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group"
                  >
                    <Card className={`h-full transition-all duration-300 border-2 ${
                      game.isLocked
                        ? 'opacity-75 bg-gray-50 border-gray-200'
                        : 'hover:shadow-xl hover:border-blue-200'
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-lg ${
                            game.isLocked ? 'bg-gray-400' : game.color
                          } text-white relative`}>
                            {game.isLocked && (
                              <Lock className="w-3 h-3 absolute -top-1 -right-1 bg-gray-600 rounded-full p-0.5" />
                            )}
                            {game.icon}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-500">Jogo {game.id}</span>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {game.estimatedTime}
                            </div>
                          </div>
                        </div>

                        <h3 className={`text-xl font-bold mb-2 ${
                          game.isLocked ? 'text-gray-500' : 'text-gray-900'
                        }`}>{game.title}</h3>
                        <p className={`text-sm leading-relaxed ${
                          game.isLocked ? 'text-gray-500' : 'text-gray-600'
                        }`}>{game.description}</p>

                        {game.isLocked && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex items-center text-yellow-800 text-sm">
                              <Lock className="w-4 h-4 mr-2" />
                              {game.lockMessage}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            game.difficulty === 'Muito Fácil' ? 'bg-green-100 text-green-800' :
                            game.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {game.difficulty}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>5 exercícios</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <Target className="w-4 h-4 mr-2 text-blue-500" />
                              Objetivos de Aprendizado
                            </h4>
                            <ul className="space-y-1">
                              {game.learningObjectives.slice(0, 2).map((objective, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {objective}
                                </li>
                              ))}
                              {game.learningObjectives.length > 2 && (
                                <li className="text-sm text-gray-500 italic">
                                  +{game.learningObjectives.length - 2} objetivos adicionais
                                </li>
                              )}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Tópicos Abordados</h4>
                            <div className="flex flex-wrap gap-2">
                              {game.topics.map((topic, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>

                          {game.isLocked ? (
                            <Button
                              disabled
                              className="w-full mt-4 bg-gray-300 text-gray-500 cursor-not-allowed"
                              size="lg"
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Módulo Bloqueado
                            </Button>
                          ) : (
                            <Link href={`/jogos/${game.id}`}>
                              <Button
                                className="w-full mt-4 group-hover:bg-blue-600 transition-colors"
                                size="lg"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Iniciar Jogo
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Learning Connection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-16 mb-12"
            >
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-emerald-600 mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Como os Jogos Reforçam seu Aprendizado</h2>
                      <p className="text-gray-600">Conexão direta entre teoria e prática em avaliação nutricional</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <Scale className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Teoria → Prática</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Cada conceito teórico da disciplina é aplicado em <strong>casos reais brasileiros</strong>,
                        permitindo que você pratique imediatamente o que aprendeu em aula.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <BarChart3 className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Dados Autênticos</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Trabalhe com <strong>datasets reais</strong> do IBGE, Ministério da Saúde e pesquisas
                        peer-reviewed, preparando você para a realidade profissional.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-emerald-100">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="w-6 h-6 text-emerald-600 mr-3" />
                        <h3 className="font-semibold text-gray-900">Progresso Mensurável</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Acompanhe seu <strong>desenvolvimento</strong> através de pontuações e feedback
                        imediato, identificando áreas que precisam de mais estudo.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-100 p-5 rounded-lg border-l-4 border-emerald-500">
                    <h3 className="text-lg font-semibold text-emerald-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 text-emerald-700 mr-2" />
                      Metodologia Pedagógica Integrada
                    </h3>
                    <p className="text-emerald-800 leading-relaxed">
                      Os jogos não substituem as aulas teóricas - eles <strong>complementam e reforçam</strong>
                      o aprendizado. Cada exercício foi cuidadosamente alinhado com os objetivos da disciplina,
                      utilizando a <strong>abordagem ultra-iniciante</strong> que assume zero conhecimento prévio
                      e constrói o entendimento passo a passo com exemplos do cotidiano brasileiro.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Innovation Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Diferenciais da Proposta</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Uma abordagem pedagógica revolucionária que combina rigor acadêmico com inovação tecnológica
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Dados Reais</h3>
                      <p className="text-sm text-gray-600">
                        Baseado em pesquisas peer-reviewed de instituições brasileiras
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ultra-Iniciante</h3>
                      <p className="text-sm text-gray-600">
                        Assume zero conhecimento prévio com analogias do cotidiano
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contexto Brasileiro</h3>
                      <p className="text-sm text-gray-600">
                        Exemplos culturalmente relevantes da realidade nacional
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Progressivo</h3>
                      <p className="text-sm text-gray-600">
                        Dificuldade crescente com feedback imediato e explicações
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <Footer />
        </div>

        {/* Desktop Ranking Sidebar */}
        <div className="hidden lg:block">
          <RankingSidebar />
        </div>

        {/* Mobile Ranking */}
        <div className="lg:hidden">
          <MobileRanking />
        </div>
      </div>
    </StudentProgressProvider>
  )
}
