'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HelpCircle, 
  X, 
  Search, 
  BookOpen, 
  Play, 
  Settings, 
  BarChart3,
  Users,
  Target,
  Lightbulb,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'

interface HelpTopic {
  id: string
  title: string
  icon: React.ReactNode
  content: string
  subtopics?: HelpSubtopic[]
}

interface HelpSubtopic {
  id: string
  title: string
  content: string
  steps?: string[]
}

const helpTopics: HelpTopic[] = [
  {
    id: 'getting-started',
    title: 'Primeiros Passos',
    icon: <Play className="w-5 h-5" />,
    content: 'Bem-vindo ao VireiEstatística! Esta plataforma foi criada para ensinar biostatística de forma interativa e divertida.',
    subtopics: [
      {
        id: 'navigation',
        title: 'Como Navegar',
        content: 'A plataforma é organizada em jogos que cobrem diferentes tópicos de estatística.',
        steps: [
          'Acesse a página de jogos através do menu principal',
          'Escolha um jogo baseado no seu nível de conhecimento',
          'Leia o conteúdo educacional antes de começar',
          'Complete os exercícios em ordem crescente de dificuldade',
          'Use os botões de informação (ℹ️) para esclarecimentos'
        ]
      },
      {
        id: 'difficulty-levels',
        title: 'Níveis de Dificuldade',
        content: 'Os jogos são organizados em 5 níveis progressivos de dificuldade.',
        steps: [
          'Muito Fácil: Conceitos básicos com explicações visuais',
          'Fácil: Aplicações básicas com orientação',
          'Médio: Aplicações padrão que requerem análise',
          'Difícil: Cenários complexos com múltiplas considerações',
          'Muito Difícil: Aplicações avançadas de nível de pesquisa'
        ]
      }
    ]
  },
  {
    id: 'game-types',
    title: 'Tipos de Jogos',
    icon: <BarChart3 className="w-5 h-5" />,
    content: 'A plataforma oferece diversos tipos de exercícios interativos para diferentes estilos de aprendizagem.',
    subtopics: [
      {
        id: 'multiple-choice',
        title: 'Questões de Múltipla Escolha',
        content: 'Exercícios tradicionais com feedback imediato e explicações detalhadas.'
      },
      {
        id: 'drag-drop',
        title: 'Arrastar e Soltar',
        content: 'Organize dados, classifique conceitos ou construa distribuições arrastando elementos.'
      },
      {
        id: 'visual-interpretation',
        title: 'Interpretação Visual',
        content: 'Clique em elementos de gráficos para identificar padrões e características estatísticas.'
      },
      {
        id: 'simulation',
        title: 'Simulações Interativas',
        content: 'Manipule parâmetros e observe como afetam distribuições e resultados estatísticos.'
      },
      {
        id: 'scenario-decision',
        title: 'Cenários de Decisão',
        content: 'Tome decisões estatísticas em cenários realistas de pesquisa passo a passo.'
      }
    ]
  },
  {
    id: 'educational-content',
    title: 'Conteúdo Educacional',
    icon: <BookOpen className="w-5 h-5" />,
    content: 'Cada jogo inclui material educacional abrangente para apoiar seu aprendizado.',
    subtopics: [
      {
        id: 'pre-game-education',
        title: 'Educação Pré-Jogo',
        content: 'Conteúdo estruturado que explica conceitos antes dos exercícios práticos.',
        steps: [
          'Leia as seções educacionais expandíveis',
          'Use o glossário de conceitos importantes',
          'Explore as definições com exemplos práticos',
          'Revise fórmulas e símbolos matemáticos',
          'Conecte teoria com aplicações reais'
        ]
      },
      {
        id: 'info-buttons',
        title: 'Botões de Informação',
        content: 'Clique nos ícones (ℹ️) para obter explicações contextuais durante os jogos.',
        steps: [
          'Procure por ícones de informação azuis',
          'Clique para ver definições detalhadas',
          'Explore símbolos matemáticos',
          'Veja exemplos práticos',
          'Conecte conceitos relacionados'
        ]
      }
    ]
  },
  {
    id: 'progress-tracking',
    title: 'Acompanhamento de Progresso',
    icon: <Target className="w-5 h-5" />,
    content: 'Monitore seu aprendizado e desempenho através do sistema de progresso.',
    subtopics: [
      {
        id: 'scores',
        title: 'Sistema de Pontuação',
        content: 'Cada jogo é pontuado de 0 a 100 baseado na precisão das respostas.'
      },
      {
        id: 'completion',
        title: 'Status de Conclusão',
        content: 'Veja quais jogos você completou e seu desempenho em cada um.'
      },
      {
        id: 'time-tracking',
        title: 'Tempo de Estudo',
        content: 'Acompanhe quanto tempo você dedica a cada tópico estatístico.'
      }
    ]
  },
  {
    id: 'accessibility',
    title: 'Acessibilidade',
    icon: <Users className="w-5 h-5" />,
    content: 'A plataforma foi projetada para ser acessível a estudantes com diferentes níveis de conhecimento.',
    subtopics: [
      {
        id: 'beginner-friendly',
        title: 'Para Iniciantes',
        content: 'Conteúdo projetado assumindo zero conhecimento prévio em estatística.',
        steps: [
          'Comece pelos jogos de nível "Muito Fácil"',
          'Use o glossário para iniciantes',
          'Leia todo o conteúdo educacional',
          'Não pule as explicações básicas',
          'Pratique com exemplos do dia a dia'
        ]
      },
      {
        id: 'language',
        title: 'Linguagem Simples',
        content: 'Explicações em português claro, evitando jargão técnico desnecessário.'
      },
      {
        id: 'visual-aids',
        title: 'Recursos Visuais',
        content: 'Gráficos, diagramas e animações para facilitar a compreensão.'
      }
    ]
  },
  {
    id: 'technical-support',
    title: 'Suporte Técnico',
    icon: <Settings className="w-5 h-5" />,
    content: 'Informações sobre requisitos técnicos e solução de problemas.',
    subtopics: [
      {
        id: 'browser-requirements',
        title: 'Requisitos do Navegador',
        content: 'A plataforma funciona melhor em navegadores modernos com JavaScript habilitado.'
      },
      {
        id: 'mobile-support',
        title: 'Suporte Mobile',
        content: 'Todos os jogos são responsivos e funcionam em dispositivos móveis.'
      },
      {
        id: 'troubleshooting',
        title: 'Solução de Problemas',
        content: 'Dicas para resolver problemas comuns de navegação e funcionalidade.',
        steps: [
          'Atualize a página se algo não carregar',
          'Verifique sua conexão com a internet',
          'Limpe o cache do navegador se necessário',
          'Use um navegador atualizado',
          'Desabilite bloqueadores de anúncios se houver problemas'
        ]
      }
    ]
  }
]

interface HelpSystemProps {
  isOpen: boolean
  onClose: () => void
  searchQuery?: string
}

export function HelpSystem({ isOpen, onClose, searchQuery = '' }: HelpSystemProps) {
  const [search, setSearch] = useState(searchQuery)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [expandedSubtopics, setExpandedSubtopics] = useState<string[]>([])

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(search.toLowerCase()) ||
    topic.content.toLowerCase().includes(search.toLowerCase()) ||
    topic.subtopics?.some(sub => 
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      sub.content.toLowerCase().includes(search.toLowerCase())
    )
  )

  const toggleSubtopic = (subtopicId: string) => {
    setExpandedSubtopics(prev =>
      prev.includes(subtopicId)
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full">
            {/* Topics Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-2" />
                    Central de Ajuda
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar ajuda..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedTopic === topic.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">{topic.icon}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{topic.title}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {topic.content}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              {selectedTopic ? (
                <div className="p-6 overflow-y-auto">
                  {(() => {
                    const topic = helpTopics.find(t => t.id === selectedTopic)
                    if (!topic) return null

                    return (
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="text-blue-600">{topic.icon}</div>
                            <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
                          </div>
                          <p className="text-gray-700 text-lg">{topic.content}</p>
                        </div>

                        {topic.subtopics && topic.subtopics.length > 0 && (
                          <div className="space-y-4">
                            {topic.subtopics.map((subtopic) => (
                              <Card key={subtopic.id}>
                                <CardHeader>
                                  <button
                                    onClick={() => toggleSubtopic(subtopic.id)}
                                    className="flex items-center justify-between w-full text-left"
                                  >
                                    <h3 className="text-lg font-semibold">{subtopic.title}</h3>
                                    {expandedSubtopics.includes(subtopic.id) ? (
                                      <ChevronDown className="w-5 h-5" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5" />
                                    )}
                                  </button>
                                </CardHeader>
                                {expandedSubtopics.includes(subtopic.id) && (
                                  <CardContent>
                                    <p className="text-gray-700 mb-4">{subtopic.content}</p>
                                    {subtopic.steps && (
                                      <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Passos:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                                          {subtopic.steps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                          ))}
                                        </ol>
                                      </div>
                                    )}
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione um tópico para ver informações detalhadas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
