'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, X, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'
import { Button } from './Button'

interface GlossaryTerm {
  term: string
  simpleDefinition: string
  technicalDefinition: string
  everydayExample: string
  statisticalExample: string
  relatedTerms: string[]
  difficulty: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Média",
    simpleDefinition: "O valor que fica no meio quando você soma tudo e divide pelo número de itens",
    technicalDefinition: "Medida de tendência central calculada pela soma de todos os valores dividida pelo número de observações",
    everydayExample: "Se você gastou R$ 10, R$ 20 e R$ 30 em três dias, sua média de gastos foi R$ 20 por dia",
    statisticalExample: "Em um estudo com 100 atletas, se a soma das idades é 2500 anos, a idade média é 25 anos",
    relatedTerms: ["Mediana", "Moda", "Tendência Central"],
    difficulty: "muito-facil"
  },
  {
    term: "Valor-p",
    simpleDefinition: "Um número que nos ajuda a decidir se uma diferença que observamos é real ou pode ter acontecido por acaso",
    technicalDefinition: "Probabilidade de observar os dados obtidos (ou mais extremos) assumindo que a hipótese nula é verdadeira",
    everydayExample: "É como perguntar: 'Se eu jogar uma moeda 10 vezes e der cara 8 vezes, qual a chance disso acontecer se a moeda for honesta?'",
    statisticalExample: "p = 0,03 significa que há 3% de chance de observar esta diferença se realmente não houvesse efeito do tratamento",
    relatedTerms: ["Hipótese Nula", "Significância Estatística", "Teste de Hipóteses"],
    difficulty: "medio"
  },
  {
    term: "Correlação",
    simpleDefinition: "Mede se duas coisas tendem a aumentar ou diminuir juntas",
    technicalDefinition: "Medida estatística que indica a força e direção da relação linear entre duas variáveis",
    everydayExample: "Altura e peso geralmente têm correlação positiva: pessoas mais altas tendem a pesar mais",
    statisticalExample: "Correlação de 0,8 entre horas de treino e performance indica forte relação positiva",
    relatedTerms: ["Correlação de Pearson", "Correlação de Spearman", "Regressão"],
    difficulty: "facil"
  },
  {
    term: "Desvio Padrão",
    simpleDefinition: "Mede o quanto os números estão espalhados em relação à média",
    technicalDefinition: "Medida de dispersão que indica a variabilidade dos dados em relação à média",
    everydayExample: "Se todos os alunos tiraram notas entre 8 e 9, o desvio é pequeno. Se as notas variaram de 2 a 10, o desvio é grande",
    statisticalExample: "Peso de atletas com média 70kg e DP 5kg significa que a maioria pesa entre 65-75kg",
    relatedTerms: ["Variância", "Média", "Distribuição Normal"],
    difficulty: "facil"
  },
  {
    term: "Hipótese Nula",
    simpleDefinition: "A ideia de que 'não há diferença' ou 'não há efeito' - é o que tentamos testar",
    technicalDefinition: "Afirmação de que não existe diferença significativa entre grupos ou não há efeito do tratamento",
    everydayExample: "Como dizer 'este remédio não funciona melhor que um placebo' antes de testar",
    statisticalExample: "H₀: A suplementação com proteína não aumenta a massa muscular mais que o placebo",
    relatedTerms: ["Hipótese Alternativa", "Valor-p", "Teste de Hipóteses"],
    difficulty: "medio"
  }
]

interface BeginnerGlossaryProps {
  isOpen: boolean
  onClose: () => void
  searchTerm?: string
}

export function BeginnerGlossary({ isOpen, onClose, searchTerm = '' }: BeginnerGlossaryProps) {
  const [search, setSearch] = useState(searchTerm)
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)
  const [showTechnical, setShowTechnical] = useState(false)

  const filteredTerms = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(search.toLowerCase()) ||
    term.simpleDefinition.toLowerCase().includes(search.toLowerCase())
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'muito-facil': return 'bg-green-100 text-green-800'
      case 'facil': return 'bg-blue-100 text-blue-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'dificil': return 'bg-orange-100 text-orange-800'
      case 'muito-dificil': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'muito-facil': return 'Muito Fácil'
      case 'facil': return 'Fácil'
      case 'medio': return 'Médio'
      case 'dificil': return 'Difícil'
      case 'muito-dificil': return 'Muito Difícil'
      default: return 'Desconhecido'
    }
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
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full">
            {/* Terms List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Glossário para Iniciantes
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
                    placeholder="Buscar termo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {filteredTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTerm(term)}
                    className={`w-full p-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedTerm?.term === term.term ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{term.term}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(term.difficulty)}`}>
                        {getDifficultyLabel(term.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {term.simpleDefinition}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Term Details */}
            <div className="flex-1 flex flex-col">
              {selectedTerm ? (
                <div className="p-6 overflow-y-auto">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTerm.term}</h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedTerm.difficulty)}`}>
                      {getDifficultyLabel(selectedTerm.difficulty)}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* Simple Definition */}
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Explicação Simples
                      </h4>
                      <p className="text-green-700">{selectedTerm.simpleDefinition}</p>
                    </div>

                    {/* Everyday Example */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Exemplo do Dia a Dia</h4>
                      <p className="text-blue-700">{selectedTerm.everydayExample}</p>
                    </div>

                    {/* Statistical Example */}
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Exemplo Estatístico</h4>
                      <p className="text-purple-700">{selectedTerm.statisticalExample}</p>
                    </div>

                    {/* Technical Definition Toggle */}
                    <div>
                      <Button
                        variant="outline"
                        onClick={() => setShowTechnical(!showTechnical)}
                        className="mb-3"
                      >
                        {showTechnical ? 'Ocultar' : 'Ver'} Definição Técnica
                      </Button>
                      
                      {showTechnical && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-800 mb-2">Definição Técnica</h4>
                          <p className="text-gray-700">{selectedTerm.technicalDefinition}</p>
                        </div>
                      )}
                    </div>

                    {/* Related Terms */}
                    {selectedTerm.relatedTerms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Termos Relacionados</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedTerm.relatedTerms.map((relatedTerm, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                const term = glossaryTerms.find(t => t.term === relatedTerm)
                                if (term) setSelectedTerm(term)
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition-colors"
                            >
                              {relatedTerm}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Selecione um termo para ver a explicação</p>
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
