'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Brain, Lightbulb, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface ConceptScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  scenario: string
  question: string
  options: Array<{
    text: string
    isCorrect: boolean
    explanation: string
    conceptType: string
    whenToUse: string
    dailyLifeExample: string
  }>
  hint: string
  conceptsInvolved: string[]
}

const conceptScenarios: ConceptScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: 'Identificando o Tipo de Análise - Café da Manhã',
    scenario: 'Uma nutricionista quer saber se existe relação entre o tipo de café da manhã (completo, simples, ou pula) e o nível de energia durante o dia (baixo, médio, alto).',
    question: 'Qual análise estatística é mais apropriada para esta situação?',
    options: [
      {
        text: 'Teste Qui-quadrado',
        isCorrect: true,
        explanation: 'Correto! Qui-quadrado testa associação entre duas variáveis categóricas (tipo de café da manhã vs nível de energia).',
        conceptType: 'Teste de Associação',
        whenToUse: 'Quando você tem duas variáveis categóricas e quer saber se estão relacionadas',
        dailyLifeExample: 'Ver se sexo está relacionado com preferência por esporte'
      },
      {
        text: 'Teste t',
        isCorrect: false,
        explanation: 'Não é adequado. Teste t compara médias de grupos, mas aqui temos categorias, não números.',
        conceptType: 'Comparação de Médias',
        whenToUse: 'Para comparar médias entre grupos',
        dailyLifeExample: 'Comparar altura média de homens e mulheres'
      },
      {
        text: 'Correlação',
        isCorrect: false,
        explanation: 'Não é adequado. Correlação mede relação entre variáveis numéricas, não categóricas.',
        conceptType: 'Relação Linear',
        whenToUse: 'Para medir relação entre duas variáveis numéricas',
        dailyLifeExample: 'Relação entre altura e peso'
      },
      {
        text: 'Regressão Linear',
        isCorrect: false,
        explanation: 'Não é adequado. Regressão prediz valores numéricos, mas aqui temos categorias.',
        conceptType: 'Predição',
        whenToUse: 'Para prever uma variável numérica baseada em outras',
        dailyLifeExample: 'Prever peso baseado na altura'
      }
    ],
    hint: 'Pense: que tipo de dados você tem? Números ou categorias?',
    conceptsInvolved: ['Variáveis Categóricas', 'Teste de Associação', 'Qui-quadrado']
  },
  {
    id: 2,
    level: 'facil',
    title: 'Escolhendo Entre Correlação e Regressão',
    scenario: 'Um treinador coletou dados de 100 atletas: horas de treino por semana e tempo na corrida de 5km. Ele quer entender a relação entre essas variáveis.',
    question: 'Se o objetivo é PREVER o tempo de corrida baseado nas horas de treino, qual análise usar?',
    options: [
      {
        text: 'Regressão Linear',
        isCorrect: true,
        explanation: 'Correto! Regressão permite PREVER uma variável (tempo) baseada em outra (horas de treino).',
        conceptType: 'Análise Preditiva',
        whenToUse: 'Quando você quer prever ou estimar uma variável baseada em outra',
        dailyLifeExample: 'Prever nota final baseada em horas de estudo'
      },
      {
        text: 'Correlação',
        isCorrect: false,
        explanation: 'Correlação apenas mede a FORÇA da relação, mas não permite fazer predições específicas.',
        conceptType: 'Medida de Associação',
        whenToUse: 'Para saber se duas variáveis estão relacionadas e quão forte é essa relação',
        dailyLifeExample: 'Ver se altura e peso estão relacionados'
      },
      {
        text: 'Teste t',
        isCorrect: false,
        explanation: 'Teste t compara médias entre grupos, não analisa relação entre variáveis contínuas.',
        conceptType: 'Comparação de Grupos',
        whenToUse: 'Para comparar médias entre dois grupos',
        dailyLifeExample: 'Comparar peso antes e depois de dieta'
      },
      {
        text: 'ANOVA',
        isCorrect: false,
        explanation: 'ANOVA compara médias entre múltiplos grupos, não analisa relação entre variáveis contínuas.',
        conceptType: 'Comparação Múltipla',
        whenToUse: 'Para comparar médias entre 3 ou mais grupos',
        dailyLifeExample: 'Comparar eficácia de 4 dietas diferentes'
      }
    ],
    hint: 'A palavra-chave é "PREVER". Que análise permite fazer predições?',
    conceptsInvolved: ['Regressão Linear', 'Correlação', 'Predição', 'Variáveis Contínuas']
  },
  {
    id: 3,
    level: 'medio',
    title: 'Diferenciando Tipos de Teste t',
    scenario: 'Uma pesquisadora tem três situações diferentes: (A) Comparar peso de homens vs mulheres, (B) Comparar peso antes vs depois de dieta no mesmo grupo, (C) Comparar altura de atletas vs não-atletas.',
    question: 'Qual situação requer um teste t PAREADO?',
    options: [
      {
        text: 'Situação B - Peso antes vs depois no mesmo grupo',
        isCorrect: true,
        explanation: 'Correto! Teste t pareado é usado quando comparamos o MESMO grupo em dois momentos diferentes.',
        conceptType: 'Teste t Pareado',
        whenToUse: 'Quando você mede a mesma pessoa/objeto duas vezes (antes/depois, pré/pós)',
        dailyLifeExample: 'Comparar sua nota antes e depois de estudar'
      },
      {
        text: 'Situação A - Peso de homens vs mulheres',
        isCorrect: false,
        explanation: 'Esta é teste t independente - compara dois grupos DIFERENTES (homens vs mulheres).',
        conceptType: 'Teste t Independente',
        whenToUse: 'Para comparar dois grupos diferentes e independentes',
        dailyLifeExample: 'Comparar altura de brasileiros vs argentinos'
      },
      {
        text: 'Situação C - Altura de atletas vs não-atletas',
        isCorrect: false,
        explanation: 'Esta é teste t independente - compara dois grupos DIFERENTES (atletas vs não-atletas).',
        conceptType: 'Teste t Independente',
        whenToUse: 'Para comparar dois grupos diferentes e independentes',
        dailyLifeExample: 'Comparar salário de homens vs mulheres'
      },
      {
        text: 'Todas as situações requerem teste t pareado',
        isCorrect: false,
        explanation: 'Não. Apenas situações com o MESMO grupo medido duas vezes requerem teste pareado.',
        conceptType: 'Conceito Incorreto',
        whenToUse: 'Esta opção está incorreta',
        dailyLifeExample: 'Esta opção não se aplica'
      }
    ],
    hint: 'Teste t pareado = MESMO grupo medido DUAS vezes. Teste t independente = DOIS grupos DIFERENTES.',
    conceptsInvolved: ['Teste t Pareado', 'Teste t Independente', 'Medidas Repetidas']
  },
  {
    id: 4,
    level: 'dificil',
    title: 'Reconhecendo Limitações dos Testes',
    scenario: 'Um estudo encontrou correlação significativa (r=0.8, p<0.001) entre consumo de sorvete e afogamentos em praias. O pesquisador concluiu que "comer sorvete causa afogamentos".',
    question: 'Qual é o principal problema com esta conclusão?',
    options: [
      {
        text: 'Correlação não implica causalidade - pode haver uma terceira variável',
        isCorrect: true,
        explanation: 'Correto! Provavelmente a temperatura é a terceira variável: dias quentes → mais sorvete E mais pessoas na praia.',
        conceptType: 'Limitação da Correlação',
        whenToUse: 'Sempre lembrar que correlação ≠ causalidade',
        dailyLifeExample: 'Venda de guarda-chuvas correlaciona com acidentes, mas não os causa (chuva é a causa comum)'
      },
      {
        text: 'A correlação não é forte o suficiente (r=0.8)',
        isCorrect: false,
        explanation: 'r=0.8 é uma correlação MUITO forte. O problema não é a força da correlação.',
        conceptType: 'Força da Correlação',
        whenToUse: 'r=0.8 indica correlação forte',
        dailyLifeExample: 'r=0.8 seria como altura e peso - muito relacionados'
      },
      {
        text: 'O valor-p não é significativo (p<0.001)',
        isCorrect: false,
        explanation: 'p<0.001 é MUITO significativo. O problema não é a significância estatística.',
        conceptType: 'Significância Estatística',
        whenToUse: 'p<0.001 indica alta significância',
        dailyLifeExample: 'p<0.001 significa menos de 0.1% de chance de ser coincidência'
      },
      {
        text: 'A amostra é muito pequena para conclusões',
        isCorrect: false,
        explanation: 'O problema não é mencionado como sendo de tamanho amostral, mas sim de interpretação causal.',
        conceptType: 'Tamanho Amostral',
        whenToUse: 'Quando a amostra é insuficiente para detectar efeitos',
        dailyLifeExample: 'Pesquisar com 5 pessoas sobre preferência nacional'
      }
    ],
    hint: 'Pense em que outras coisas podem estar relacionadas tanto com sorvete quanto com afogamentos...',
    conceptsInvolved: ['Correlação vs Causalidade', 'Terceira Variável', 'Interpretação de Resultados']
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Reconhecimento de Conceitos - Como um Detetive Estatístico",
    content: (
      <div className="space-y-4">
        <p>🕵️ <strong>Ser um bom estatístico é como ser um detetive:</strong> você precisa identificar pistas e escolher a ferramenta certa!</p>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🔍 Perguntas-chave para identificar o teste:</h4>
          <ul className="text-blue-700 space-y-1">
            <li><strong>1. Que tipo de dados tenho?</strong> Números ou categorias?</li>
            <li><strong>2. O que quero descobrir?</strong> Comparar, relacionar, ou prever?</li>
            <li><strong>3. Quantos grupos tenho?</strong> Um, dois, ou mais?</li>
            <li><strong>4. São os mesmos indivíduos?</strong> Medidos uma ou várias vezes?</li>
          </ul>
        </div>
        
        <p>🎯 <strong>Estratégia:</strong> Sempre comece identificando o TIPO de pergunta que você quer responder!</p>
      </div>
    ),
    concepts: [
      {
        term: "Reconhecimento de Padrões",
        definition: "Habilidade de identificar qual análise usar baseada nas características dos dados",
        example: "Ver que dados categóricos precisam de qui-quadrado"
      },
      {
        term: "Tipo de Pergunta",
        definition: "O objetivo da análise: comparar, relacionar, prever, ou descrever",
        example: "Comparar = teste t, Relacionar = correlação, Prever = regressão"
      }
    ]
  },
  {
    title: "Mapa Mental dos Testes Estatísticos",
    content: (
      <div className="space-y-4">
        <p>🗺️ <strong>Pense nos testes como ferramentas em uma caixa de ferramentas:</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🔨 Para COMPARAR</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li><strong>Teste t:</strong> 2 grupos, dados numéricos</li>
              <li><strong>ANOVA:</strong> 3+ grupos, dados numéricos</li>
              <li><strong>Qui-quadrado:</strong> Grupos, dados categóricos</li>
            </ul>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">📏 Para RELACIONAR</h4>
            <ul className="text-purple-700 text-sm space-y-1">
              <li><strong>Correlação:</strong> Força da relação</li>
              <li><strong>Regressão:</strong> Predizer valores</li>
              <li><strong>Kappa:</strong> Concordância entre avaliadores</li>
            </ul>
          </div>
        </div>
        
        <p>💡 <strong>Dica de ouro:</strong> Se você não sabe qual usar, comece perguntando "O que eu quero descobrir?"</p>
      </div>
    ),
    concepts: [
      {
        term: "Árvore de Decisão",
        definition: "Processo lógico para escolher o teste correto baseado nas características dos dados",
        example: "Dados numéricos + 2 grupos + mesmo indivíduo = teste t pareado"
      },
      {
        term: "Limitações dos Testes",
        definition: "O que cada teste pode e não pode concluir",
        example: "Correlação não prova causalidade"
      }
    ]
  }
]

interface Game37ConceptRecognitionProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game37ConceptRecognition({ onBack, onComplete }: Game37ConceptRecognitionProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    currentLevel: 'muito-facil',
    score: 0,
    answers: [],
    timeElapsed: 0,
    isCompleted: false,
    feedback: [],
    showEducation: true
  })
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const currentScenario = conceptScenarios[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const selectedOption = currentScenario.options[selectedAnswer]
    const isCorrect = selectedOption.isCorrect
    const points = isCorrect ? 40 : 0

    const newAnswers = [...gameState.answers, {
      questionId: currentScenario.id,
      selectedAnswer,
      isCorrect,
      points
    }]

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: newAnswers
    }))

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    if (gameState.currentQuestion < conceptScenarios.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
      setSelectedAnswer(null)
      setShowFeedback(false)
      setShowHint(false)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Reconhecimento de Conceitos Estatísticos"
      gameDescription="Desenvolva a habilidade de identificar e diferenciar métodos estatísticos através de cenários práticos"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={6}
    />
  )

  if (gameState.showEducation) {
    return educationComponent
  }

  return (
    <GameBase
      gameId={37}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={conceptScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
                <p className="text-sm text-gray-600">Nível: {currentScenario.level.replace('-', ' ')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800"><strong>Cenário:</strong> {currentScenario.scenario}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700"><strong>Conceitos envolvidos:</strong> {currentScenario.conceptsInvolved.join(', ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Questão {gameState.currentQuestion + 1}</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Dica</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentScenario.question}</p>
            
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"
              >
                <p className="text-yellow-800"><strong>💡 Dica:</strong> {currentScenario.hint}</p>
              </motion.div>
            )}
            
            <div className="space-y-3">
              {currentScenario.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showFeedback
                        ? option.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && option.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option.text}</span>
                    {showFeedback && selectedAnswer === index && (
                      option.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )
                    )}
                    {showFeedback && selectedAnswer !== index && option.isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <div></div>
              {!showFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  Confirmar Resposta
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {gameState.currentQuestion < conceptScenarios.length - 1 ? 'Próxima Questão' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {currentScenario.options.map((option, index) => (
              <Card key={index} className={`${
                option.isCorrect ? 'border-green-200' : 
                selectedAnswer === index ? 'border-red-200' : 'border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {option.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : selectedAnswer === index ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                    <h4 className="font-semibold">{option.text}</h4>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-700">{option.explanation}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h5 className="font-semibold text-blue-800 text-sm">Tipo de Conceito</h5>
                        <p className="text-blue-700 text-sm">{option.conceptType}</p>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h5 className="font-semibold text-green-800 text-sm">Quando Usar</h5>
                        <p className="text-green-700 text-sm">{option.whenToUse}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h5 className="font-semibold text-yellow-800 text-sm">🏠 Exemplo do Dia a Dia</h5>
                      <p className="text-yellow-700 text-sm">{option.dailyLifeExample}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
