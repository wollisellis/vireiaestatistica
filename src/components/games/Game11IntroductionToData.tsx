'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Database } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface DataScenario {
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

const scenarios: DataScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: "O que são Dados? - Café da Manhã",
    description: "Maria quer saber mais sobre os hábitos alimentares de seus amigos",
    context: "Maria perguntou para 5 amigos o que eles tomaram no café da manhã: João (café), Ana (suco), Pedro (leite), Carla (chá), Lucas (café)",
    question: "O que Maria coletou quando perguntou sobre o café da manhã dos amigos?",
    options: [
      "Dados - informações sobre os hábitos dos amigos",
      "Estatísticas - cálculos matemáticos complexos", 
      "Gráficos - desenhos coloridos",
      "Números - apenas valores numéricos"
    ],
    correctAnswer: 0,
    explanation: "Maria coletou DADOS! Dados são simplesmente informações que coletamos sobre alguma coisa. Neste caso, ela coletou informações sobre o que cada amigo bebe no café da manhã.",
    dailyLifeAnalogy: "É como quando você anota numa lista o que precisa comprar no supermercado - cada item da lista é um dado!"
  },
  {
    id: 2,
    level: 'facil',
    title: "Tipos de Variáveis - Academia",
    description: "Um personal trainer registra informações sobre seus alunos",
    context: "O personal anotou: João (25 anos, 1,80m, iniciante), Ana (30 anos, 1,65m, avançada), Pedro (22 anos, 1,75m, intermediário)",
    question: "Quais são os DOIS tipos de informações que o personal coletou?",
    options: [
      "Apenas números (quantitativas)",
      "Apenas palavras (qualitativas)",
      "Números (idade, altura) e categorias (nível de treino)",
      "Apenas informações sobre exercícios"
    ],
    correctAnswer: 2,
    explanation: "O personal coletou dois tipos de dados: QUANTITATIVOS (números como idade e altura) e QUALITATIVOS (categorias como iniciante, intermediário, avançado).",
    dailyLifeAnalogy: "É como quando você descreve um filme: você fala da duração (número) e do gênero (categoria como comédia, drama, ação)!"
  },
  {
    id: 3,
    level: 'medio',
    title: "Escalas de Medição - Restaurante",
    description: "Um restaurante coleta feedback dos clientes",
    context: "O restaurante pergunta: 1) Quantas vezes você vem aqui por mês? 2) Qual sua avaliação: Ruim, Regular, Bom, Excelente? 3) Qual seu prato favorito?",
    question: "Qual pergunta permite fazer mais cálculos matemáticos (como média)?",
    options: [
      "Quantas vezes vem por mês (números que podem ser somados)",
      "Avaliação Ruim/Regular/Bom/Excelente (ordem, mas sem números)",
      "Prato favorito (apenas categorias diferentes)",
      "Todas permitem os mesmos cálculos"
    ],
    correctAnswer: 0,
    explanation: "A pergunta sobre frequência mensal permite mais cálculos porque são números reais. Você pode calcular a média de visitas, somar o total, etc. As outras são categorias que têm limitações matemáticas.",
    dailyLifeAnalogy: "É como comparar: contar quantos reais você tem (pode somar, calcular média) vs. dizer se você está feliz/triste (não dá para somar felicidade!)."
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "O que são Dados? (Para Iniciantes Absolutos)",
    content: (
      <div className="space-y-4">
        <p>☕ <strong>Imagine esta situação:</strong> Você quer saber qual café seus amigos preferem. Você pergunta para cada um e anota as respostas. Essas respostas são DADOS!</p>
        
        <p>📝 <strong>Dados são simplesmente:</strong> Informações que coletamos sobre alguma coisa que queremos estudar.</p>
        
        <p>🏠 <strong>Exemplos do dia a dia:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Anotar quanto você gasta por dia</li>
          <li>Contar quantas horas você dorme</li>
          <li>Perguntar a cor favorita dos amigos</li>
          <li>Medir sua altura e peso</li>
        </ul>
        
        <p>🎯 <strong>A ideia principal:</strong> Dados são as "matérias-primas" da estatística. Sem dados, não há estatística!</p>
      </div>
    ),
    concepts: [
      {
        term: "Dados",
        definition: "Informações coletadas sobre algo que queremos estudar",
        example: "Anotar a idade de cada pessoa numa festa"
      },
      {
        term: "Variável",
        definition: "Uma característica que pode mudar de pessoa para pessoa",
        example: "Altura (varia de pessoa para pessoa)"
      }
    ]
  },
  {
    title: "Tipos de Dados - Como uma Receita de Bolo",
    content: (
      <div className="space-y-4">
        <p>🧁 <strong>Pense numa receita de bolo:</strong> Você tem ingredientes de dois tipos diferentes:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Dados Quantitativos (Números)</h4>
            <p className="text-blue-700 mb-2">São números que você pode somar, calcular média, etc.</p>
            <p className="text-sm text-blue-600"><strong>Exemplo:</strong> 2 xícaras de farinha, 3 ovos, 200g de açúcar</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🏷️ Dados Qualitativos (Categorias)</h4>
            <p className="text-green-700 mb-2">São categorias, tipos, nomes - não dá para somar.</p>
            <p className="text-sm text-green-600"><strong>Exemplo:</strong> Sabor (chocolate, baunilha), Tamanho (pequeno, grande)</p>
          </div>
        </div>
      </div>
    ),
    concepts: [
      {
        term: "Quantitativo",
        definition: "Dados numéricos que podem ser medidos e calculados",
        example: "Idade, peso, altura, número de filhos"
      },
      {
        term: "Qualitativo",
        definition: "Dados categóricos que descrevem qualidades ou características",
        example: "Cor dos olhos, estado civil, marca favorita"
      }
    ]
  }
]

interface Game11IntroductionToDataProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game11IntroductionToData({ onBack, onComplete }: Game11IntroductionToDataProps) {
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
      gameTitle="Introdução aos Dados"
      gameDescription="Aprenda os conceitos mais básicos sobre dados e variáveis usando exemplos do dia a dia"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={5}
    />
  )

  if (gameState.showEducation) {
    return educationComponent
  }

  return (
    <GameBase
      gameId={11}
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
              <Database className="w-6 h-6 text-blue-600" />
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
