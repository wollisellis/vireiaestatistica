'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface SamplingScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  context: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  dailyLifeAnalogy: string
}

const scenarios: SamplingScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: "População vs Amostra - Escola",
    description: "A diretora quer saber a opinião dos alunos sobre a merenda escolar",
    context: "A escola tem 1000 alunos. A diretora perguntou para 50 alunos escolhidos aleatoriamente o que acham da merenda.",
    question: "Neste exemplo, qual é a POPULAÇÃO e qual é a AMOSTRA?",
    options: [
      "População: 1000 alunos da escola / Amostra: 50 alunos entrevistados",
      "População: 50 alunos entrevistados / Amostra: 1000 alunos da escola",
      "População e amostra são a mesma coisa",
      "Não há diferença entre população e amostra neste caso"
    ],
    correctAnswer: 0,
    explanation: "A POPULAÇÃO são TODOS os 1000 alunos da escola (o grupo completo que queremos estudar). A AMOSTRA são os 50 alunos entrevistados (uma parte da população que realmente estudamos).",
    dailyLifeAnalogy: "É como provar uma colherada de sopa para saber se está salgada. A panela inteira é a população, a colherada é a amostra!"
  },
  {
    id: 2,
    level: 'facil',
    title: "Representatividade - Supermercado",
    description: "Um supermercado quer saber a satisfação dos clientes",
    context: "O supermercado entrevistou apenas clientes que compravam na segunda-feira de manhã, entre 8h e 10h.",
    question: "Esta amostra representa bem TODOS os clientes do supermercado?",
    options: [
      "Sim, porque entrevistaram muitas pessoas",
      "Não, porque só entrevistaram um tipo específico de cliente",
      "Sim, porque segunda-feira é um dia normal",
      "Não importa quando entrevistar"
    ],
    correctAnswer: 1,
    explanation: "Esta amostra NÃO é representativa! Clientes de segunda de manhã podem ser diferentes (aposentados, pessoas que trabalham em casa, etc.). Uma boa amostra deve incluir diferentes tipos de clientes.",
    dailyLifeAnalogy: "É como perguntar só para crianças qual o melhor filme do ano. A opinião das crianças não representa a opinião de TODOS!"
  },
  {
    id: 3,
    level: 'medio',
    title: "Viés de Seleção - Academia",
    description: "Uma academia quer saber se seus alunos estão satisfeitos",
    context: "A academia enviou um questionário por email e apenas 30% responderam. A maioria das respostas foi muito positiva.",
    question: "Por que estes resultados podem não representar a opinião real de todos os alunos?",
    options: [
      "30% é uma amostra grande o suficiente",
      "Quem responde voluntariamente pode ter opiniões diferentes de quem não responde",
      "Email é a melhor forma de coletar dados",
      "Resultados positivos sempre são confiáveis"
    ],
    correctAnswer: 1,
    explanation: "Existe VIÉS DE SELEÇÃO! Pessoas que respondem voluntariamente podem ser diferentes das que não respondem. Talvez quem está satisfeito tenha mais vontade de responder, ou quem está insatisfeito não queira perder tempo.",
    dailyLifeAnalogy: "É como perguntar 'quem quer pizza?' numa festa. Só quem gosta de pizza vai levantar a mão, mas isso não significa que TODOS gostam!"
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "População vs Amostra - Como uma Festa",
    content: (
      <div className="space-y-4">
        <p>🎉 <strong>Imagine uma festa com 100 pessoas:</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">👥 População</h4>
            <p className="text-blue-700 mb-2">TODAS as 100 pessoas na festa</p>
            <p className="text-sm text-blue-600">É o grupo COMPLETO que você quer estudar</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Amostra</h4>
            <p className="text-green-700 mb-2">10 pessoas que você escolheu para conversar</p>
            <p className="text-sm text-green-600">É uma PARTE da população que você realmente estuda</p>
          </div>
        </div>
        
        <p>🤔 <strong>Por que usar amostra?</strong> Porque é impossível ou muito caro estudar TODA a população. Imagine entrevistar todos os brasileiros!</p>
      </div>
    ),
    concepts: [
      {
        term: "População",
        definition: "Todos os indivíduos ou elementos que queremos estudar",
        example: "Todos os estudantes universitários do Brasil"
      },
      {
        term: "Amostra",
        definition: "Uma parte da população que realmente estudamos",
        example: "500 estudantes universitários escolhidos para uma pesquisa"
      }
    ]
  },
  {
    title: "Amostra Representativa - Como Escolher Bem",
    content: (
      <div className="space-y-4">
        <p>🎯 <strong>Uma boa amostra é como um mini-retrato da população:</strong></p>
        
        <p>✅ <strong>Amostra BOA (Representativa):</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Inclui diferentes tipos de pessoas</li>
          <li>É escolhida aleatoriamente</li>
          <li>Tem tamanho adequado</li>
        </ul>
        
        <p>❌ <strong>Amostra RUIM (Não representativa):</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Só inclui um tipo de pessoa</li>
          <li>É escolhida por conveniência</li>
          <li>Tem viés de seleção</li>
        </ul>
        
        <p>🏠 <strong>Exemplo do dia a dia:</strong> Para saber se um bolo está bom, você prova um pedacinho de diferentes partes, não só da beirada!</p>
      </div>
    ),
    concepts: [
      {
        term: "Representatividade",
        definition: "Quando a amostra reflete bem as características da população",
        example: "Uma pesquisa eleitoral que inclui pessoas de todas as idades e classes sociais"
      },
      {
        term: "Viés de Seleção",
        definition: "Quando a forma de escolher a amostra favorece certos tipos de pessoas",
        example: "Pesquisar só pessoas que têm telefone fixo (exclui jovens)"
      }
    ]
  }
]

interface Game12SamplingPopulationProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game12SamplingPopulation({ onBack, onComplete }: Game12SamplingPopulationProps) {
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

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const currentScenario = scenarios[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentScenario.correctAnswer
    const points = isCorrect ? 35 : 0

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
    if (gameState.currentQuestion < scenarios.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }))
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setGameState(prev => ({
        ...prev,
        isCompleted: true
      }))
    }
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Amostragem e População"
      gameDescription="Entenda a diferença entre população e amostra usando exemplos práticos do dia a dia"
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
      gameId={12}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={scenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Scenario Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
                <p className="text-sm text-gray-600">Nível: {currentScenario.level.replace('-', ' ')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{currentScenario.description}</p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800"><strong>Situação:</strong> {currentScenario.context}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Questão {gameState.currentQuestion + 1}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentScenario.question}</p>
            
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
                        ? index === currentScenario.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && index === currentScenario.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                    {showFeedback && selectedAnswer === index && (
                      index === currentScenario.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )
                    )}
                    {showFeedback && selectedAnswer !== index && index === currentScenario.correctAnswer && (
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
                  {gameState.currentQuestion < scenarios.length - 1 ? 'Próxima Questão' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">💡 Explicação</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{currentScenario.explanation}</p>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800"><strong>🏠 Analogia do dia a dia:</strong> {currentScenario.dailyLifeAnalogy}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
