'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Coffee, Heart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BeginnerSimulationGame } from './interactive/BeginnerSimulationGame'
import { PreGameEducation } from './PreGameEducation'
import { GameBase, GameState } from './GameBase'

// Simulation scenarios for different difficulty levels
const simulationScenarios = [
  // MUITO FÁCIL - Understanding averages
  {
    level: 'muito-facil',
    title: 'Simulação de Médias: Café e Energia',
    simpleTitle: '☕ Quanto Café Dá Mais Energia?',
    instruction: 'Explore como diferentes quantidades de café afetam os níveis de energia das pessoas',
    simpleInstruction: 'Vamos descobrir juntos como o café afeta a energia! Você vai mexer nos controles e ver o que acontece.',
    targetConcept: 'Média e Variabilidade',
    conceptExplanation: 'A média nos diz o valor típico, mas as pessoas são diferentes - algumas reagem mais ao café, outras menos. Isso é normal e esperado!',
    dailyLifeScenario: 'Imagine que você trabalha numa cafeteria e quer saber: "Quantas xícaras de café fazem as pessoas ficarem mais alertas?" Você vai testar com diferentes pessoas e ver os resultados.',
    parameters: [
      {
        id: 'cups',
        label: 'Número de Xícaras de Café',
        simpleLabel: '☕ Quantas Xícaras?',
        min: 0,
        max: 5,
        step: 1,
        defaultValue: 2,
        description: 'Quantidade de café consumida por pessoa',
        dailyLifeAnalogy: 'Como quando você decide quantas xícaras tomar de manhã',
        icon: <Coffee className="w-4 h-4" />
      },
      {
        id: 'people',
        label: 'Número de Pessoas',
        simpleLabel: '👥 Quantas Pessoas?',
        min: 5,
        max: 50,
        step: 5,
        defaultValue: 20,
        description: 'Tamanho da amostra para o estudo',
        dailyLifeAnalogy: 'Como decidir quantos amigos perguntar antes de escolher um restaurante',
        icon: <Users className="w-4 h-4" />
      }
    ],
    simulationFunction: (params: Record<string, number>) => {
      const { cups, people } = params
      const results = []
      
      for (let i = 0; i < people; i++) {
        // Base energy level (1-10)
        const baseEnergy = 3 + Math.random() * 2
        
        // Coffee effect (varies by person)
        const coffeeEffect = cups * (1.5 + Math.random() * 1) // 1.5-2.5 per cup
        
        // Some randomness (people are different!)
        const randomVariation = (Math.random() - 0.5) * 2
        
        const totalEnergy = Math.max(1, Math.min(10, baseEnergy + coffeeEffect + randomVariation))
        results.push(Math.round(totalEnergy * 10) / 10)
      }
      
      return results
    }
  },
  // FÁCIL - Understanding correlation
  {
    level: 'facil',
    title: 'Simulação de Correlação: Exercício e Batimentos',
    simpleTitle: '💓 Exercício e Batimentos do Coração',
    instruction: 'Explore a relação entre intensidade do exercício e frequência cardíaca',
    simpleInstruction: 'Vamos ver como o exercício afeta os batimentos do coração! Quanto mais intenso o exercício, mais rápido o coração bate.',
    targetConcept: 'Correlação Positiva',
    conceptExplanation: 'Correlação positiva significa que quando uma coisa aumenta, a outra também aumenta. Como exercício e batimentos cardíacos - eles "andam juntos".',
    dailyLifeScenario: 'Você é um personal trainer e quer mostrar para seus alunos como diferentes intensidades de exercício afetam o coração. Vamos simular isso!',
    parameters: [
      {
        id: 'intensity',
        label: 'Intensidade do Exercício (%)',
        simpleLabel: '🏃‍♂️ Intensidade do Exercício',
        min: 20,
        max: 90,
        step: 10,
        defaultValue: 50,
        unit: '%',
        description: 'Percentual da capacidade máxima de exercício',
        dailyLifeAnalogy: 'Como quando você escolhe entre caminhada leve ou corrida intensa',
        icon: <Heart className="w-4 h-4" />
      },
      {
        id: 'athletes',
        label: 'Número de Atletas',
        simpleLabel: '👥 Quantos Atletas?',
        min: 10,
        max: 40,
        step: 5,
        defaultValue: 20,
        description: 'Quantidade de pessoas no estudo',
        dailyLifeAnalogy: 'Como decidir quantas pessoas testar na academia',
        icon: <Users className="w-4 h-4" />
      }
    ],
    simulationFunction: (params: Record<string, number>) => {
      const { intensity, athletes } = params
      const results = []
      
      for (let i = 0; i < athletes; i++) {
        // Base heart rate (60-80 bpm)
        const baseHeartRate = 60 + Math.random() * 20
        
        // Exercise effect (intensity affects heart rate)
        const exerciseEffect = (intensity / 100) * (100 + Math.random() * 40) // 100-140 bpm increase
        
        // Individual variation (people are different)
        const individualVariation = (Math.random() - 0.5) * 20
        
        const totalHeartRate = Math.max(60, Math.min(200, baseHeartRate + exerciseEffect + individualVariation))
        results.push(Math.round(totalHeartRate))
      }
      
      return results
    }
  }
]

// Educational content
const educationalSections = [
  {
    title: "O que são Simulações?",
    content: `Uma simulação é como um "laboratório virtual" onde você pode testar ideias sem precisar fazer experimentos reais.

É como um videogame da ciência! Você muda as configurações e vê o que acontece. Na vida real, isso nos ajuda a entender como as coisas funcionam antes de fazer experimentos caros ou demorados.`,
    concepts: [
      {
        term: "Simulação",
        definition: "Um modelo que imita a vida real para testarmos ideias",
        example: "Como um simulador de voo que ensina pilotos sem usar um avião real"
      },
      {
        term: "Parâmetros",
        definition: "Os 'botões' que você pode mexer para mudar o resultado",
        example: "Como o volume do rádio - você mexe no botão e o som muda"
      }
    ]
  },
  {
    title: "Por que Simulações são Úteis?",
    content: `Simulações nos ajudam a:
• Entender como as coisas se relacionam
• Prever o que pode acontecer
• Testar ideias de forma segura
• Aprender fazendo (não só lendo)

É como quando você testa uma receita nova - você vai ajustando os ingredientes até ficar do jeito que você quer!`,
    concepts: [
      {
        term: "Aprendizado Ativo",
        definition: "Aprender fazendo, não só lendo ou ouvindo",
        example: "Como aprender a andar de bicicleta - você precisa praticar, não só ler sobre"
      },
      {
        term: "Experimentação Segura",
        definition: "Testar ideias sem riscos ou custos altos",
        example: "Como testar uma nova receita com pequenas quantidades primeiro"
      }
    ]
  }
]

interface Game34BeginnerSimulationProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game34BeginnerSimulation({ onBack, onComplete }: Game34BeginnerSimulationProps) {
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

  const getCurrentScenario = () => {
    const levelScenarios = simulationScenarios.filter(s => s.level === gameState.currentLevel)
    return levelScenarios[gameState.currentQuestion] || simulationScenarios[0]
  }

  const currentScenario = getCurrentScenario()

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const handleSimulationComplete = (understanding: boolean) => {
    const points = understanding ? 100 : 70
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, {
        questionId: currentScenario.level,
        selectedAnswer: understanding ? 1 : 0,
        isCorrect: understanding,
        points
      }]
    }))

    // Auto-advance or complete
    setTimeout(() => {
      const levelScenarios = simulationScenarios.filter(s => s.level === gameState.currentLevel)
      if (gameState.currentQuestion < levelScenarios.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }))
      } else {
        // Move to next level or complete
        const levels: Array<'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'> = ['muito-facil', 'facil', 'medio', 'dificil', 'muito-dificil']
        const currentLevelIndex = levels.indexOf(gameState.currentLevel)
        
        if (currentLevelIndex < levels.length - 1 && simulationScenarios.some(s => s.level === levels[currentLevelIndex + 1])) {
          setGameState(prev => ({
            ...prev,
            currentLevel: levels[currentLevelIndex + 1],
            currentQuestion: 0
          }))
        } else {
          setGameState(prev => ({
            ...prev,
            isCompleted: true
          }))
        }
      }
    }, 3000)
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Simulações Interativas para Iniciantes"
      gameDescription="Aprenda conceitos estatísticos brincando com simulações do mundo real"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={5}
    />
  )

  return (
    <GameBase
      gameId={34}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={simulationScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Current Scenario */}
        <BeginnerSimulationGame
          title={currentScenario.title}
          simpleTitle={currentScenario.simpleTitle}
          instruction={currentScenario.instruction}
          simpleInstruction={currentScenario.simpleInstruction}
          parameters={currentScenario.parameters}
          simulationFunction={currentScenario.simulationFunction}
          targetConcept={currentScenario.targetConcept}
          conceptExplanation={currentScenario.conceptExplanation}
          dailyLifeScenario={currentScenario.dailyLifeScenario}
          onComplete={handleSimulationComplete}
        />

        {/* Progress Indicator */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progresso no nível atual:</span>
              <span>
                {gameState.currentQuestion + 1} de {simulationScenarios.filter(s => s.level === gameState.currentLevel).length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((gameState.currentQuestion + 1) / simulationScenarios.filter(s => s.level === gameState.currentLevel).length) * 100}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </GameBase>
  )
}
