'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Coffee, Heart, ShoppingCart, Users, TrendingUp, BarChart3, Target, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MatchingGame } from './interactive/MatchingGame'
import { PreGameEducation } from './PreGameEducation'
import { GameBase, GameState } from './GameBase'

// Game data for matching statistical concepts with real-world examples
const matchingScenarios = [
  // MUITO FÁCIL - Basic concepts
  {
    level: 'muito-facil',
    title: 'Conceitos Básicos do Dia a Dia',
    instruction: 'Conecte cada conceito estatístico com uma situação da vida real que você conhece',
    items: [
      {
        id: 'mean-concept',
        content: 'Média',
        type: 'concept' as const,
        matchId: 'mean',
        explanation: 'A média é quando você soma tudo e divide pelo número de itens. Como calcular quanto você gasta por dia.',
        dailyLifeAnalogy: 'Como calcular seu gasto médio por dia',
        icon: <BarChart3 className="w-4 h-4" />
      },
      {
        id: 'mean-example',
        content: 'Você gastou R$ 20, R$ 30 e R$ 40 em três dias. Sua média de gastos foi R$ 30 por dia.',
        type: 'example' as const,
        matchId: 'mean',
        explanation: 'Somamos 20+30+40=90, depois dividimos por 3 dias = 30 reais por dia',
        dailyLifeAnalogy: 'Igual quando você quer saber quanto gasta em média por mês',
        icon: <ShoppingCart className="w-4 h-4" />
      },
      {
        id: 'correlation-concept',
        content: 'Correlação',
        type: 'concept' as const,
        matchId: 'correlation',
        explanation: 'Correlação é quando duas coisas tendem a acontecer juntas. Como altura e peso - pessoas mais altas geralmente pesam mais.',
        dailyLifeAnalogy: 'Como quando você nota que duas coisas sempre andam juntas',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'correlation-example',
        content: 'Quanto mais você estuda, melhor sua nota tende a ser.',
        type: 'example' as const,
        matchId: 'correlation',
        explanation: 'Existe uma relação: mais estudo geralmente resulta em notas melhores',
        dailyLifeAnalogy: 'Como exercitar mais e ficar mais forte',
        icon: <Target className="w-4 h-4" />
      },
      {
        id: 'sample-concept',
        content: 'Amostra',
        type: 'concept' as const,
        matchId: 'sample',
        explanation: 'Uma amostra é um pedacinho de um grupo maior. Como provar uma colherada de sopa para saber se está salgada.',
        dailyLifeAnalogy: 'Como provar um pedacinho de comida antes de servir',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'sample-example',
        content: 'Pesquisar 100 pessoas para saber a opinião de toda a cidade.',
        type: 'example' as const,
        matchId: 'sample',
        explanation: 'Não precisamos perguntar para toda a cidade - 100 pessoas bem escolhidas podem representar toda a população',
        dailyLifeAnalogy: 'Como perguntar para alguns amigos antes de escolher um filme para o grupo',
        icon: <Heart className="w-4 h-4" />
      }
    ]
  },
  // FÁCIL - More concepts
  {
    level: 'facil',
    title: 'Identificando Testes Estatísticos',
    instruction: 'Conecte cada teste estatístico com a situação onde você o usaria',
    items: [
      {
        id: 'ttest-concept',
        content: 'Teste t',
        type: 'concept' as const,
        matchId: 'ttest',
        explanation: 'O teste t compara se dois grupos são realmente diferentes. Como comparar se homens e mulheres têm alturas diferentes.',
        dailyLifeAnalogy: 'Como comparar se duas marcas de café são realmente diferentes',
        icon: <Scale className="w-4 h-4" />
      },
      {
        id: 'ttest-example',
        content: 'Comparar se um novo suplemento realmente aumenta a força muscular versus placebo.',
        type: 'example' as const,
        matchId: 'ttest',
        explanation: 'Queremos saber se a diferença entre os grupos (suplemento vs placebo) é real ou apenas coincidência',
        dailyLifeAnalogy: 'Como testar se um novo shampoo realmente deixa o cabelo mais macio',
        icon: <Target className="w-4 h-4" />
      },
      {
        id: 'kappa-concept',
        content: 'Coeficiente Kappa',
        type: 'concept' as const,
        matchId: 'kappa',
        explanation: 'Kappa mede se duas pessoas concordam além do que seria por acaso. Como dois médicos diagnosticando a mesma doença.',
        dailyLifeAnalogy: 'Como medir se dois juízes de culinária sempre concordam nas notas',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'kappa-example',
        content: 'Dois nutricionistas avaliando se pacientes estão desnutridos - queremos saber se eles concordam.',
        type: 'example' as const,
        matchId: 'kappa',
        explanation: 'Medimos se os dois profissionais chegam às mesmas conclusões mais do que seria esperado por sorte',
        dailyLifeAnalogy: 'Como dois professores corrigindo a mesma prova e sempre dando notas parecidas',
        icon: <Heart className="w-4 h-4" />
      }
    ]
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Por que Conectar Conceitos com Exemplos?",
    content: `Aprender estatística fica muito mais fácil quando você conecta os conceitos com situações que já conhece do dia a dia.

É como aprender a dirigir - você não decora as regras, você entende QUANDO usar cada uma. Na estatística é igual: cada teste e conceito tem seu momento certo de usar.`,
    concepts: [
      {
        term: "Pensamento Estatístico",
        definition: "É ver padrões e relações no mundo ao seu redor",
        example: "Notar que sempre chove mais no verão, ou que pessoas que dormem bem têm mais energia"
      },
      {
        term: "Aplicação Prática",
        definition: "Usar a estatística para resolver problemas reais",
        example: "Descobrir se um novo exercício realmente funciona, ou qual dieta é mais eficaz"
      }
    ]
  },
  {
    title: "Como Funciona o Jogo de Conexões",
    content: `Este jogo vai ajudar você a reconhecer QUANDO usar cada conceito estatístico. É como um jogo da memória, mas em vez de figuras iguais, você conecta conceitos com suas aplicações.

Dica importante: Não se preocupe com nomes complicados. Foque em entender a IDEIA por trás de cada conceito.`,
    concepts: [
      {
        term: "Estratégia do Jogo",
        definition: "Pense sempre: 'Quando eu usaria isso na vida real?'",
        example: "Se você quer comparar duas coisas, provavelmente precisa de um teste de comparação"
      },
      {
        term: "Aprendizado Intuitivo",
        definition: "Confie no seu bom senso - a estatística faz sentido!",
        example: "Se algo parece lógico na vida real, provavelmente a estatística confirma isso"
      }
    ]
  }
]

interface Game33StatisticalConceptMatchingProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game33StatisticalConceptMatching({ onBack, onComplete }: Game33StatisticalConceptMatchingProps) {
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
    const levelScenarios = matchingScenarios.filter(s => s.level === gameState.currentLevel)
    return levelScenarios[gameState.currentQuestion] || matchingScenarios[0]
  }

  const currentScenario = getCurrentScenario()

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const handleMatchingComplete = (correct: boolean, score: number) => {
    const points = score
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      answers: [...prev.answers, {
        questionId: currentScenario.level,
        selectedAnswer: score,
        isCorrect: correct,
        points
      }]
    }))

    // Auto-advance or complete
    setTimeout(() => {
      const levelScenarios = matchingScenarios.filter(s => s.level === gameState.currentLevel)
      if (gameState.currentQuestion < levelScenarios.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }))
      } else {
        // Move to next level or complete
        const levels: Array<'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'> = ['muito-facil', 'facil', 'medio', 'dificil', 'muito-dificil']
        const currentLevelIndex = levels.indexOf(gameState.currentLevel)
        
        if (currentLevelIndex < levels.length - 1) {
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
    }, 2000)
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Conectando Conceitos Estatísticos"
      gameDescription="Aprenda a reconhecer quando usar cada conceito estatístico através de exemplos do dia a dia"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={4}
    />
  )

  return (
    <GameBase
      gameId={33}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={matchingScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Level Introduction */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              🎯 {currentScenario.title}
            </h3>
            <p className="text-gray-600">
              Nível: <span className="font-medium capitalize">{gameState.currentLevel.replace('-', ' ')}</span>
            </p>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dica para Este Nível:</h4>
              <p className="text-blue-800 text-sm">
                {gameState.currentLevel === 'muito-facil' && 
                  "Comece pensando em situações simples do seu dia a dia. Estatística está em tudo - desde escolher o melhor produto no supermercado até entender se um exercício funciona!"
                }
                {gameState.currentLevel === 'facil' && 
                  "Agora você vai conectar testes estatísticos específicos com suas aplicações. Pense: 'Que pergunta cada teste responde?'"
                }
                {gameState.currentLevel === 'medio' && 
                  "Foque em entender QUANDO usar cada análise. Cada situação de pesquisa tem seu teste ideal."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Matching Game */}
        <MatchingGame
          title={currentScenario.title}
          instruction={currentScenario.instruction}
          items={currentScenario.items}
          onComplete={handleMatchingComplete}
          showAnalogies={true}
        />

        {/* Progress Indicator */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progresso no nível atual:</span>
              <span>
                {gameState.currentQuestion + 1} de {matchingScenarios.filter(s => s.level === gameState.currentLevel).length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((gameState.currentQuestion + 1) / matchingScenarios.filter(s => s.level === gameState.currentLevel).length) * 100}%` 
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </GameBase>
  )
}
