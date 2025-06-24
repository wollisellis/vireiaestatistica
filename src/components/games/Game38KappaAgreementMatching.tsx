'use client'

import React, { useState } from 'react'
import { Users, Target, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'
import { MatchingGame } from './interactive/MatchingGame'

interface KappaScenario {
  id: number
  level: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  instruction: string
  items: Array<{
    id: string
    content: string
    type: 'concept' | 'example'
    matchId: string
    explanation: string
    dailyLifeAnalogy?: string
    icon?: React.ReactNode
    kappaValue?: number
  }>
}

const kappaScenarios: KappaScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: 'Identificando Situações para Kappa de Cohen',
    instruction: 'Conecte cada situação com o tipo de análise de concordância apropriado',
    items: [
      {
        id: 'kappa-concept',
        content: 'Kappa de Cohen (κ)',
        type: 'concept',
        matchId: 'kappa-situation',
        explanation: 'Mede concordância entre dois avaliadores descontando a concordância esperada por acaso',
        dailyLifeAnalogy: 'Como dois professores corrigindo a mesma prova',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'kappa-example',
        content: 'Dois nutricionistas classificando 100 pacientes como "desnutrido", "normal" ou "sobrepeso"',
        type: 'example',
        matchId: 'kappa-situation',
        explanation: 'Situação perfeita para Kappa: dois avaliadores, categorias mutuamente exclusivas, mesmo conjunto de casos',
        dailyLifeAnalogy: 'Como dois médicos diagnosticando o mesmo paciente'
      },
      {
        id: 'simple-agreement-concept',
        content: 'Concordância Percentual Simples',
        type: 'concept',
        matchId: 'simple-agreement',
        explanation: 'Apenas conta a porcentagem de vezes que os avaliadores concordaram, sem considerar o acaso',
        dailyLifeAnalogy: 'Contar quantas vezes dois amigos escolhem o mesmo filme',
        icon: <CheckCircle2 className="w-4 h-4" />
      },
      {
        id: 'simple-agreement-example',
        content: 'Calcular que dois treinadores deram a mesma nota em 85% dos exercícios avaliados',
        type: 'example',
        matchId: 'simple-agreement',
        explanation: 'Concordância simples - útil para descrição básica, mas não considera que algumas concordâncias podem ser por sorte',
        dailyLifeAnalogy: 'Como contar quantas vezes você e seu irmão escolhem a mesma pizza'
      },
      {
        id: 'correlation-concept',
        content: 'Correlação',
        type: 'concept',
        matchId: 'correlation-situation',
        explanation: 'Mede se duas variáveis numéricas variam juntas de forma linear',
        dailyLifeAnalogy: 'Ver se altura e peso aumentam juntos',
        icon: <Target className="w-4 h-4" />
      },
      {
        id: 'correlation-example',
        content: 'Analisar se as notas dadas por dois juízes (escala 0-10) estão relacionadas',
        type: 'example',
        matchId: 'correlation-situation',
        explanation: 'Quando os dados são numéricos (notas 0-10), correlação pode medir se os juízes tendem a dar notas similares',
        dailyLifeAnalogy: 'Ver se dois professores tendem a dar notas parecidas'
      }
    ]
  },
  {
    id: 2,
    level: 'medio',
    title: 'Interpretando Valores de Kappa',
    instruction: 'Conecte cada valor de Kappa com sua interpretação correta',
    items: [
      {
        id: 'kappa-perfect',
        content: 'κ = 1.0',
        type: 'concept',
        matchId: 'perfect-agreement',
        explanation: 'Concordância perfeita - os avaliadores sempre concordam',
        dailyLifeAnalogy: 'Como dois relógios que sempre mostram a mesma hora',
        kappaValue: 1.0
      },
      {
        id: 'perfect-interpretation',
        content: 'Concordância Perfeita - Avaliadores sempre concordam',
        type: 'example',
        matchId: 'perfect-agreement',
        explanation: 'Situação ideal mas rara na prática - indica que os avaliadores são completamente consistentes',
        dailyLifeAnalogy: 'Como duas balanças que sempre dão o mesmo peso'
      },
      {
        id: 'kappa-excellent',
        content: 'κ = 0.85',
        type: 'concept',
        matchId: 'excellent-agreement',
        explanation: 'Concordância excelente - muito boa para uso clínico ou de pesquisa',
        dailyLifeAnalogy: 'Como dois termômetros que quase sempre dão a mesma temperatura',
        kappaValue: 0.85
      },
      {
        id: 'excellent-interpretation',
        content: 'Concordância Excelente - Muito confiável para decisões importantes',
        type: 'example',
        matchId: 'excellent-agreement',
        explanation: 'Nível de concordância considerado muito bom para aplicações práticas',
        dailyLifeAnalogy: 'Como dois especialistas que quase sempre chegam à mesma conclusão'
      },
      {
        id: 'kappa-moderate',
        content: 'κ = 0.45',
        type: 'concept',
        matchId: 'moderate-agreement',
        explanation: 'Concordância moderada - aceitável mas pode precisar de melhorias',
        dailyLifeAnalogy: 'Como dois amigos que concordam sobre filmes na metade das vezes',
        kappaValue: 0.45
      },
      {
        id: 'moderate-interpretation',
        content: 'Concordância Moderada - Aceitável mas pode ser melhorada',
        type: 'example',
        matchId: 'moderate-agreement',
        explanation: 'Indica que há concordância além do acaso, mas ainda há espaço para melhoria',
        dailyLifeAnalogy: 'Como dois professores que às vezes discordam na correção'
      },
      {
        id: 'kappa-poor',
        content: 'κ = 0.15',
        type: 'concept',
        matchId: 'poor-agreement',
        explanation: 'Concordância fraca - pouco melhor que o acaso',
        dailyLifeAnalogy: 'Como dois adivinhadores que acertam pouco mais que por sorte',
        kappaValue: 0.15
      },
      {
        id: 'poor-interpretation',
        content: 'Concordância Fraca - Não confiável para decisões importantes',
        type: 'example',
        matchId: 'poor-agreement',
        explanation: 'Indica que os avaliadores concordam pouco além do que seria esperado por acaso',
        dailyLifeAnalogy: 'Como jogar cara ou coroa - pouco melhor que o acaso'
      }
    ]
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Kappa de Cohen - Medindo Concordância Real",
    content: `👥 **Imagine dois médicos diagnosticando os mesmos pacientes:**

🤔 **O Problema da Concordância por Acaso**
Se eles concordam 80% das vezes, isso é bom? Depende! Se o diagnóstico é só "sim" ou "não", eles concordariam 50% das vezes só por sorte (como jogar moeda).

**Kappa responde:** "Quanto eles concordam ALÉM do que seria esperado por acaso?"

📊 **Fórmula Simples**
Kappa = (Concordância Observada - Concordância por Acaso) / (1 - Concordância por Acaso)

🎯 **Interpretação**
• κ = 0: Só concordam por acaso
• κ = 0.5: Concordância moderada
• κ = 1: Concordância perfeita`,
    concepts: [
      {
        term: "Kappa de Cohen (κ)",
        definition: "Medida de concordância entre avaliadores que corrige para concordância esperada por acaso",
        symbol: "κ (letra grega kappa)",
        example: "κ = 0.8 entre dois radiologistas = excelente concordância"
      },
      {
        term: "Concordância por Acaso",
        definition: "Quanto os avaliadores concordariam apenas por sorte, baseado na frequência de cada categoria",
        example: "Em diagnóstico sim/não balanceado = 50% por acaso"
      }
    ]
  },
  {
    title: "Interpretando Valores de Kappa - Guia Prático",
    content: `📏 **Escala de interpretação do Kappa (Landis & Koch, 1977):**

**κ < 0.20 - Concordância Fraca**
Pouco melhor que o acaso. Não confiável para decisões importantes.

**κ = 0.21-0.40 - Concordância Razoável**
Melhor que o acaso, mas ainda limitada. Precisa de melhorias.

**κ = 0.41-0.60 - Concordância Moderada**
Aceitável para muitas aplicações. Pode ser melhorada.

**κ = 0.61-0.80 - Concordância Substancial**
Boa concordância. Confiável para a maioria dos propósitos.

**κ = 0.81-1.00 - Concordância Quase Perfeita**
Excelente concordância. Ideal para decisões críticas.

💡 **Dica prática:** Para decisões médicas importantes, geralmente se busca κ > 0.60`,
    concepts: [
      {
        term: "Escala de Landis & Koch",
        definition: "Sistema padrão para interpretar valores de Kappa em pesquisa",
        example: "κ = 0.75 = concordância substancial"
      },
      {
        term: "Significância Clínica",
        definition: "Nível de concordância necessário para aplicações práticas específicas",
        example: "Diagnóstico de câncer pode exigir κ > 0.80"
      }
    ]
  }
]

interface Game38KappaAgreementMatchingProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game38KappaAgreementMatching({ onBack, onComplete }: Game38KappaAgreementMatchingProps) {
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

  const handleStartGame = () => {
    setGameState(prev => ({ ...prev, showEducation: false }))
  }

  const currentScenario = kappaScenarios[gameState.currentQuestion]

  const handleMatchingComplete = (correct: boolean, score: number) => {
    const newAnswers = [...gameState.answers, {
      questionId: currentScenario.id,
      selectedAnswer: correct ? 1 : 0,
      isCorrect: correct,
      points: score
    }]

    setGameState(prev => ({
      ...prev,
      score: prev.score + score,
      answers: newAnswers
    }))

    // Move to next scenario or complete game
    setTimeout(() => {
      if (gameState.currentQuestion < kappaScenarios.length - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          isCompleted: true
        }))
      }
    }, 2000)
  }

  const educationComponent = (
    <PreGameEducation
      gameTitle="Kappa de Cohen e Medidas de Concordância"
      gameDescription="Domine o conceito de concordância entre avaliadores através de jogos de associação práticos"
      sections={educationalSections}
      onStartGame={handleStartGame}
      estimatedReadTime={8}
    />
  )

  if (gameState.showEducation) {
    return educationComponent
  }

  return (
    <GameBase
      gameId={38}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={kappaScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Cenário {gameState.currentQuestion + 1} de {kappaScenarios.length}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Nível: {currentScenario.level.replace('-', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Pontuação</div>
                <div className="text-lg font-bold text-blue-600">{gameState.score}</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Kappa Reference Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-blue-800">📊 Referência Rápida - Interpretação do Kappa</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="text-center p-2 bg-red-100 rounded">
                <div className="font-bold text-red-800">&lt; 0.20</div>
                <div className="text-red-600">Fraca</div>
              </div>
              <div className="text-center p-2 bg-orange-100 rounded">
                <div className="font-bold text-orange-800">0.21-0.40</div>
                <div className="text-orange-600">Razoável</div>
              </div>
              <div className="text-center p-2 bg-yellow-100 rounded">
                <div className="font-bold text-yellow-800">0.41-0.60</div>
                <div className="text-yellow-600">Moderada</div>
              </div>
              <div className="text-center p-2 bg-blue-100 rounded">
                <div className="font-bold text-blue-800">0.61-0.80</div>
                <div className="text-blue-600">Substancial</div>
              </div>
              <div className="text-center p-2 bg-green-100 rounded">
                <div className="font-bold text-green-800">0.81-1.00</div>
                <div className="text-green-600">Quase Perfeita</div>
              </div>
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
      </div>
    </GameBase>
  )
}
