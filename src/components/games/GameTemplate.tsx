'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  XCircle,
  Brain,
  Coffee,
  Heart,
  Calculator,
  Eye,
  ArrowRight,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { gameDefinitions } from '@/lib/gameData'
import { generateExercisesForGame, generateEducationalContent } from '@/lib/exerciseGenerator'
import { AdvancedEducationalContent } from './AdvancedEducationalContent'

interface QuestionData {
  id: number
  title: string
  description: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface GameTemplateProps {
  gameId: number
  questions?: QuestionData[]
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function GameTemplate({ gameId, questions = [], onBack, onComplete }: GameTemplateProps) {
  const gameDefinition = gameDefinitions.find(g => g.id === gameId)

  // Generate comprehensive exercises using the exercise generator
  const exerciseSet = generateExercisesForGame(gameId)
  const educationalContent = generateEducationalContent(gameId)

  // Convert exercises to question format
  const generatedQuestions: QuestionData[] = exerciseSet.exercises.map(exercise => ({
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    question: exercise.question,
    options: exercise.options || [],
    correctAnswer: exercise.correctAnswer || 0,
    explanation: exercise.explanation
  }))

  const gameQuestions = questions.length > 0 ? questions : generatedQuestions

  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    currentLevel: 'facil',
    score: 0,
    answers: [],
    timeElapsed: 0,
    isCompleted: false,
    feedback: [],
    showEducation: true // Start with education content
  })

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  // Handle starting the game (skip education)
  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const currentQuestion = gameQuestions[gameState.currentQuestion]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const points = isCorrect ? Math.floor(100 / gameQuestions.length) : 0

    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, { questionId: currentQuestion.id, selectedAnswer, isCorrect, points }]
    }))

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    if (gameState.currentQuestion < gameQuestions.length - 1) {
      setGameState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setGameState(prev => ({ ...prev, isCompleted: true }))
    }
  }

  // Show educational content first
  if (gameState.showEducation && educationalContent) {
    const educationalSections = [
      {
        id: 'introduction',
        title: 'Introdução - Zero Conhecimento Assumido',
        icon: <Brain className="w-6 h-6 text-blue-600" />,
        content: `Bem-vindo ao estudo de ${gameDefinition?.title}! Não se preocupe se você nunca ouviu falar disso antes - vamos começar do absoluto zero e construir seu conhecimento passo a passo usando exemplos do dia a dia.`,
        concepts: [
          {
            term: gameDefinition?.title || 'Conceito Estatístico',
            definition: gameDefinition?.description || 'Conceito fundamental de bioestatística',
            whenToUse: `Use ${gameDefinition?.title} quando precisar ${gameDefinition?.description?.toLowerCase()}`,
            dailyLifeAnalogy: {
              title: 'Analogia do Café da Manhã',
              description: 'É como escolher o que comer no café da manhã - você precisa de informações para tomar a melhor decisão',
              icon: <Coffee className="w-4 h-4" />,
              connection: `Assim como você analisa opções no café da manhã, ${gameDefinition?.title} ajuda a analisar dados para tomar decisões`
            },
            brazilianExample: {
              title: 'Pesquisa Nutricional Brasileira',
              context: 'Estudo realizado com atletas brasileiros em centros de treinamento nacionais',
              data: 'Dados coletados de 200 atletas de diferentes modalidades esportivas',
              interpretation: `Os resultados mostram como ${gameDefinition?.title} é aplicado na prática da nutrição esportiva`,
              source: 'Revista Brasileira de Medicina do Esporte, 2023'
            },
            keyPoints: gameDefinition?.learningObjectives || ['Conceito fundamental', 'Aplicação prática', 'Interpretação de resultados'],
            commonMistakes: [
              'Não compreender o conceito básico',
              'Confundir com outros métodos estatísticos',
              'Não considerar o contexto prático'
            ]
          }
        ],
        estimatedTime: 3
      },
      {
        id: 'practice',
        title: 'Exemplos Práticos',
        icon: <Heart className="w-6 h-6 text-red-600" />,
        content: `Agora vamos ver ${gameDefinition?.title} em ação com exemplos reais da nutrição e esporte brasileiros.`,
        concepts: [],
        estimatedTime: 3
      },
      {
        id: 'application',
        title: 'Como Aplicar',
        icon: <Calculator className="w-6 h-6 text-green-600" />,
        content: `Vamos aprender passo a passo como usar ${gameDefinition?.title} em situações reais.`,
        concepts: [],
        estimatedTime: 2
      }
    ]

    return (
      <AdvancedEducationalContent
        gameId={gameId}
        gameTitle={gameDefinition?.title || `Jogo ${gameId}`}
        gameDescription={gameDefinition?.description || 'Jogo de bioestatística interativo'}
        sections={educationalSections}
        onStartGame={handleStartGame}
        totalEstimatedTime={8}
      />
    )
  }

  return (
    <GameBase
      gameId={gameId}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={gameQuestions.length}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">{currentQuestion.title}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentQuestion.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Questão {gameState.currentQuestion + 1}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{currentQuestion.question}</p>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === index
                      ? showFeedback
                        ? index === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : showFeedback && index === currentQuestion.correctAnswer
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
                      index === currentQuestion.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                      )
                    )}
                    {showFeedback && selectedAnswer !== index && index === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <div></div>
              {!showFeedback ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                  Confirmar Resposta
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {gameState.currentQuestion < questions.length - 1 ? 'Próxima Questão' : 'Finalizar Jogo'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">Explicação</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{currentQuestion.explanation}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
