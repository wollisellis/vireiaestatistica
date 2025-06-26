'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Lightbulb,
  Target,
  Clock,
  Users,
  BarChart3,
  Play,
  Brain,
  Coffee,
  Heart,
  Calculator,
  Eye,
  CheckCircle,
  ArrowRight,
  Zap,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InfoButton } from '@/components/ui/InfoButton'

interface DailyLifeAnalogy {
  title: string
  description: string
  icon: React.ReactNode
  connection: string
}

interface BrazilianExample {
  title: string
  context: string
  data: string
  interpretation: string
  source?: string
}

interface ConceptDefinition {
  term: string
  definition: string
  symbol?: string
  formula?: string
  whenToUse: string
  dailyLifeAnalogy: DailyLifeAnalogy
  brazilianExample: BrazilianExample
  commonMistakes?: string[]
  keyPoints?: string[]
}

interface EducationalSection {
  id: string
  title: string
  icon: React.ReactNode
  content: string
  concepts?: ConceptDefinition[]
  visualAid?: React.ReactNode
  interactiveDemo?: React.ReactNode
  estimatedTime: number
}

interface AdvancedEducationalContentProps {
  gameId: number
  gameTitle: string
  gameDescription: string
  sections: EducationalSection[]
  onStartGame: () => void
  totalEstimatedTime?: number
}

export function AdvancedEducationalContent({
  gameId,
  gameTitle,
  gameDescription,
  sections,
  onStartGame,
  totalEstimatedTime = 8
}: AdvancedEducationalContentProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([sections[0]?.id])
  const [currentSection, setCurrentSection] = useState(0)
  const [showConcepts, setShowConcepts] = useState<{[key: string]: boolean}>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const toggleConcept = (conceptTerm: string) => {
    setShowConcepts(prev => ({
      ...prev,
      [conceptTerm]: !prev[conceptTerm]
    }))
  }

  const formatTime = (minutes: number) => {
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">{gameTitle}</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{gameDescription}</p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Tempo estimado de leitura: {formatTime(totalEstimatedTime)}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onStartGame}
            className="flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Pular para o Jogo</span>
          </Button>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              index <= currentSection ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Educational Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="p-0">
                <div
                  className="cursor-pointer hover:bg-gray-50 transition-colors p-6"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {section.icon}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(section.estimatedTime)}</span>
                      </div>
                    </div>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-6">
                      {/* Main Content */}
                      <div className="prose prose-blue max-w-none">
                        <p className="text-gray-700 leading-relaxed">{section.content}</p>
                      </div>

                      {/* Visual Aid */}
                      {section.visualAid && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Visualização
                          </h4>
                          {section.visualAid}
                        </div>
                      )}

                      {/* Interactive Demo */}
                      {section.interactiveDemo && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                            <Play className="w-5 h-5 mr-2" />
                            Demonstração Interativa
                          </h4>
                          {section.interactiveDemo}
                        </div>
                      )}

                      {/* Concepts */}
                      {section.concepts && section.concepts.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <Brain className="w-5 h-5 mr-2" />
                            Conceitos desta seção:
                          </h4>
                          <div className="grid gap-4">
                            {section.concepts.map((concept, conceptIndex) => (
                              <ConceptCard
                                key={concept.term}
                                concept={concept}
                                isExpanded={showConcepts[concept.term]}
                                onToggle={() => toggleConcept(concept.term)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Start Game Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        <Button 
          onClick={onStartGame}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar Jogo
        </Button>
        <p className="text-sm text-gray-500 mt-2">
          Você pode voltar a este conteúdo a qualquer momento durante o jogo
        </p>
      </motion.div>
    </div>
  )
}

// Concept Card Component
interface ConceptCardProps {
  concept: ConceptDefinition
  isExpanded: boolean
  onToggle: () => void
}

function ConceptCard({ concept, isExpanded, onToggle }: ConceptCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="p-0">
        <div
          className="cursor-pointer hover:bg-gray-50 transition-colors p-6 pb-3"
          onClick={onToggle}
        >
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <InfoButton 
              content={concept.definition}
              title={concept.term}
            />
            <div>
              <h5 className="font-semibold text-gray-900">{concept.term}</h5>
              {concept.symbol && (
                <span className="text-sm text-gray-500 font-mono">{concept.symbol}</span>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Definition */}
              <div>
                <p className="text-gray-700">{concept.definition}</p>
                {concept.formula && (
                  <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-sm">
                    {concept.formula}
                  </div>
                )}
              </div>

              {/* When to Use */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h6 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Quando usar:
                </h6>
                <p className="text-blue-800 text-sm">{concept.whenToUse}</p>
              </div>

              {/* Daily Life Analogy */}
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h6 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  {concept.dailyLifeAnalogy.icon}
                  <span className="ml-2">{concept.dailyLifeAnalogy.title}</span>
                </h6>
                <p className="text-yellow-800 text-sm mb-2">{concept.dailyLifeAnalogy.description}</p>
                <p className="text-yellow-700 text-xs italic">
                  <strong>Conexão:</strong> {concept.dailyLifeAnalogy.connection}
                </p>
              </div>

              {/* Brazilian Example */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h6 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Exemplo Brasileiro - {concept.brazilianExample.title}
                </h6>
                <div className="space-y-2 text-sm">
                  <p className="text-green-800"><strong>Contexto:</strong> {concept.brazilianExample.context}</p>
                  <p className="text-green-800"><strong>Dados:</strong> {concept.brazilianExample.data}</p>
                  <p className="text-green-800"><strong>Interpretação:</strong> {concept.brazilianExample.interpretation}</p>
                  {concept.brazilianExample.source && (
                    <p className="text-green-600 text-xs italic">
                      <strong>Fonte:</strong> {concept.brazilianExample.source}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Points */}
              {concept.keyPoints && concept.keyPoints.length > 0 && (
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Pontos-chave:
                  </h6>
                  <ul className="space-y-1">
                    {concept.keyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <ArrowRight className="w-3 h-3 mr-2 mt-1 text-blue-500 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {concept.commonMistakes && concept.commonMistakes.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <h6 className="font-semibold text-red-900 mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Erros comuns:
                  </h6>
                  <ul className="space-y-1">
                    {concept.commonMistakes.map((mistake, index) => (
                      <li key={index} className="text-sm text-red-800 flex items-start">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
