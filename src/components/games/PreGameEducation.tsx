'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, BookOpen, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { InfoButton } from '@/components/ui/InfoButton'

interface ConceptDefinition {
  term: string
  definition: string
  symbol?: string
  formula?: string
  example?: string
}

interface EducationalSection {
  title: string
  content: string | React.ReactNode
  concepts?: ConceptDefinition[]
  visualAid?: React.ReactNode
}

interface PreGameEducationProps {
  gameTitle: string
  gameDescription: string
  sections: EducationalSection[]
  onStartGame: () => void
  estimatedReadTime?: number
}

export function PreGameEducation({
  gameTitle,
  gameDescription,
  sections,
  onStartGame,
  estimatedReadTime = 5
}: PreGameEducationProps) {
  const [expandedSections, setExpandedSections] = useState<number[]>([0])
  const [showAllConcepts, setShowAllConcepts] = useState(false)

  const toggleSection = (index: number) => {
    setExpandedSections(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const allConcepts = sections.flatMap(section => section.concepts || [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{gameTitle}</h2>
                <p className="text-gray-600">{gameDescription}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Tempo estimado de leitura: {estimatedReadTime} minutos
              </div>
              <Button onClick={onStartGame} className="flex items-center space-x-2">
                <Play className="w-4 h-4" />
                <span>Pular para o Jogo</span>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Quick Concepts Reference */}
      {allConcepts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <button
                onClick={() => setShowAllConcepts(!showAllConcepts)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold">Conceitos Importantes</h3>
                {showAllConcepts ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </CardHeader>
            {showAllConcepts && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allConcepts.map((concept, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <InfoButton
                        title={concept.term}
                        content={concept.definition}
                        symbol={concept.symbol}
                        formula={concept.formula}
                        example={concept.example}
                        size="sm"
                      />
                      <span className="text-sm font-medium">{concept.term}</span>
                      {concept.symbol && (
                        <span className="text-sm text-blue-600 font-mono">
                          ({concept.symbol})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      {/* Educational Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <button
                  onClick={() => toggleSection(index)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {expandedSections.includes(index) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </CardHeader>
              {expandedSections.includes(index) && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Main Content */}
                    <div className="text-gray-700">
                      {typeof section.content === 'string' ? (
                        <div className="space-y-3">
                          {section.content.split('\n\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                      ) : (
                        section.content
                      )}
                    </div>

                    {/* Visual Aid */}
                    {section.visualAid && (
                      <div className="mt-4">
                        {section.visualAid}
                      </div>
                    )}

                    {/* Section Concepts */}
                    {section.concepts && section.concepts.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-3">
                          Conceitos desta seção:
                        </h4>
                        <div className="space-y-2">
                          {section.concepts.map((concept, cIndex) => (
                            <div key={cIndex} className="flex items-start space-x-2">
                              <InfoButton
                                title={concept.term}
                                content={concept.definition}
                                symbol={concept.symbol}
                                formula={concept.formula}
                                example={concept.example}
                                size="sm"
                              />
                              <div className="flex-1">
                                <span className="font-medium text-blue-900">
                                  {concept.term}
                                  {concept.symbol && (
                                    <span className="ml-1 font-mono">({concept.symbol})</span>
                                  )}
                                </span>
                                <p className="text-sm text-blue-800 mt-1">
                                  {concept.definition}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
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
          className="px-8 py-3 text-lg"
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
