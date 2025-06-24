'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, ClipboardCheck } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'

interface DataQualityScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  dataExample: string[]
  problem: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  solution: string
}

const scenarios: DataQualityScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: "Dados Faltando - Lista de Compras",
    description: "Ana está organizando dados de uma pesquisa nutricional",
    dataExample: [
      "João, 25 anos, 70kg, altura: ???",
      "Maria, 30 anos, ???, altura: 1,65m", 
      "Pedro, ??? anos, 80kg, altura: 1,80m"
    ],
    problem: "Alguns dados estão faltando (marcados com ???)",
    question: "O que Ana deve fazer com esses dados incompletos?",
    options: [
      "Inventar os valores que faltam para completar",
      "Identificar quais dados faltam e decidir se pode usar os dados mesmo assim",
      "Apagar todos os dados porque não estão completos",
      "Ignorar o problema e usar os dados como estão"
    ],
    correctAnswer: 1,
    explanation: "Ana deve IDENTIFICAR os dados faltantes e decidir caso a caso. Às vezes podemos usar dados parciais (ex: se só a idade está faltando), outras vezes precisamos descartar ou buscar a informação.",
    solution: "Marcar claramente os dados faltantes e documentar o que foi feito com cada caso."
  },
  {
    id: 2,
    level: 'facil',
    title: "Valores Estranhos - Peso dos Atletas",
    description: "Um treinador coletou dados de peso dos atletas da equipe",
    dataExample: [
      "Atleta 1: 75kg",
      "Atleta 2: 82kg",
      "Atleta 3: 7kg",  // Erro óbvio
      "Atleta 4: 68kg",
      "Atleta 5: 780kg"  // Erro óbvio
    ],
    problem: "Alguns valores parecem impossíveis para atletas adultos",
    question: "Como identificar e corrigir esses erros?",
    options: [
      "Aceitar todos os valores porque foram coletados",
      "Verificar se há erros de digitação e confirmar valores suspeitos",
      "Calcular a média e substituir valores estranhos pela média",
      "Remover automaticamente valores muito altos ou baixos"
    ],
    correctAnswer: 1,
    explanation: "Devemos VERIFICAR valores suspeitos! 7kg e 780kg são claramente erros (provavelmente de digitação: 70kg e 78kg). Sempre confirme valores estranhos antes de corrigir ou remover.",
    solution: "Voltar à fonte original dos dados ou contactar quem coletou para confirmar os valores corretos."
  },
  {
    id: 3,
    level: 'medio',
    title: "Consistência dos Dados - IMC Impossível",
    description: "Uma nutricionista revisa dados de pacientes",
    dataExample: [
      "Paciente A: Altura 1,70m, Peso 65kg, IMC 35",  // IMC inconsistente
      "Paciente B: Altura 1,60m, Peso 55kg, IMC 21,5",  // Correto
      "Paciente C: Altura 1,80m, Peso 90kg, IMC 27,8"   // Correto
    ],
    problem: "O IMC do Paciente A não confere com altura e peso informados",
    question: "Qual é o problema e como resolver?",
    options: [
      "O IMC está errado - deveria ser 22,5 (65÷1,70²)",
      "A altura está errada - deveria ser 1,37m para dar IMC 35",
      "O peso está errado - deveria ser 101kg para dar IMC 35",
      "Todos os valores podem estar corretos"
    ],
    correctAnswer: 0,
    explanation: "O IMC está ERRADO! Calculando: 65 ÷ (1,70)² = 65 ÷ 2,89 = 22,5. O valor 35 foi provavelmente um erro de digitação ou cálculo. Sempre verifique a consistência entre dados relacionados.",
    solution: "Recalcular o IMC correto (22,5) e verificar se outros cálculos derivados estão corretos."
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Por que Controlar a Qualidade dos Dados?",
    content: (
      <div className="space-y-4">
        <p>🧹 <strong>Dados são como ingredientes de uma receita:</strong> Se os ingredientes estão estragados, o prato fica ruim!</p>
        
        <p>❌ <strong>Problemas comuns nos dados:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li><strong>Dados faltando:</strong> Como ter uma receita sem alguns ingredientes</li>
          <li><strong>Erros de digitação:</strong> Escrever 700kg em vez de 70kg</li>
          <li><strong>Valores impossíveis:</strong> Pessoa com 3 metros de altura</li>
          <li><strong>Inconsistências:</strong> IMC não confere com peso e altura</li>
        </ul>
        
        <p>✅ <strong>Por que é importante:</strong></p>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-800">
            <strong>Dados ruins = Conclusões erradas!</strong><br/>
            É melhor ter poucos dados bons do que muitos dados ruins.
          </p>
        </div>
      </div>
    ),
    concepts: [
      {
        term: "Controle de Qualidade",
        definition: "Processo de verificar e corrigir problemas nos dados antes de analisá-los",
        example: "Verificar se todas as idades estão entre 0 e 120 anos"
      },
      {
        term: "Dados Faltantes",
        definition: "Informações que deveriam estar presentes mas não foram coletadas",
        example: "Peso do paciente não foi medido"
      }
    ]
  },
  {
    title: "Como Fazer Controle de Qualidade - Passo a Passo",
    content: (
      <div className="space-y-4">
        <p>🔍 <strong>Processo de limpeza dos dados (como limpar a casa):</strong></p>
        
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">1. 👀 Olhar os Dados</h4>
            <p className="text-blue-700 text-sm">Examinar visualmente para encontrar coisas estranhas</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">2. 🔍 Procurar Problemas</h4>
            <p className="text-green-700 text-sm">Valores faltantes, muito altos, muito baixos, impossíveis</p>
          </div>
          
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800">3. ✅ Verificar Consistência</h4>
            <p className="text-yellow-700 text-sm">Conferir se dados relacionados fazem sentido juntos</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">4. 🔧 Corrigir ou Remover</h4>
            <p className="text-purple-700 text-sm">Decidir o que fazer com cada problema encontrado</p>
          </div>
        </div>
        
        <p>💡 <strong>Regra de ouro:</strong> Sempre documente o que você fez! Anote quais dados foram corrigidos ou removidos e por quê.</p>
      </div>
    ),
    concepts: [
      {
        term: "Outlier",
        definition: "Valor muito diferente dos outros, que pode ser erro ou caso especial",
        example: "Pessoa de 2,5m de altura numa pesquisa (provável erro)"
      },
      {
        term: "Consistência",
        definition: "Quando dados relacionados fazem sentido juntos",
        example: "IMC calculado confere com peso e altura informados"
      }
    ]
  }
]

interface Game31DataQualityControlProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game31DataQualityControl({ onBack, onComplete }: Game31DataQualityControlProps) {
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
      gameTitle="Controle de Qualidade de Dados"
      gameDescription="Aprenda a identificar e corrigir problemas nos dados antes de fazer análises"
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
      gameId={31}
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
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">{currentScenario.title}</h3>
                <p className="text-sm text-gray-600">Nível: {currentScenario.level.replace('-', ' ')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{currentScenario.description}</p>
              
              {/* Data Example */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">📊 Dados Coletados:</h4>
                <div className="space-y-1 font-mono text-sm">
                  {currentScenario.dataExample.map((data, index) => (
                    <div key={index} className="text-gray-700">{data}</div>
                  ))}
                </div>
              </div>
              
              {/* Problem */}
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800"><strong>Problema identificado:</strong> {currentScenario.problem}</p>
                </div>
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
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800"><strong>✅ Solução recomendada:</strong> {currentScenario.solution}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </GameBase>
  )
}
