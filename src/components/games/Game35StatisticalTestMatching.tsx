'use client'

import React, { useState } from 'react'
import { Target, Users, Calculator, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { GameBase, GameState } from './GameBase'
import { PreGameEducation } from './PreGameEducation'
import { MatchingGame } from './interactive/MatchingGame'

interface TestMatchingScenario {
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
  }>
}

const matchingScenarios: TestMatchingScenario[] = [
  {
    id: 1,
    level: 'muito-facil',
    title: 'Testes Básicos - Quando Usar Cada Um?',
    instruction: 'Conecte cada situação com o teste estatístico mais apropriado',
    items: [
      {
        id: 'ttest-concept',
        content: 'Teste t',
        type: 'concept',
        matchId: 'ttest',
        explanation: 'O teste t compara médias entre grupos. É como comparar se duas turmas têm notas diferentes.',
        dailyLifeAnalogy: 'Comparar a altura média de homens e mulheres',
        icon: <Calculator className="w-4 h-4" />
      },
      {
        id: 'ttest-example',
        content: 'Comparar o peso antes e depois de uma dieta em 30 pessoas',
        type: 'example',
        matchId: 'ttest',
        explanation: 'Teste t pareado - compara o mesmo grupo em dois momentos diferentes',
        dailyLifeAnalogy: 'Como comparar seu peso antes e depois das férias'
      },
      {
        id: 'chisquare-concept',
        content: 'Teste Qui-quadrado',
        type: 'concept',
        matchId: 'chisquare',
        explanation: 'Testa se duas características estão relacionadas. Como ver se sexo e preferência por esporte estão ligados.',
        dailyLifeAnalogy: 'Ver se homens e mulheres preferem esportes diferentes',
        icon: <Target className="w-4 h-4" />
      },
      {
        id: 'chisquare-example',
        content: 'Verificar se há relação entre sexo e preferência por tipo de exercício (aeróbico vs musculação)',
        type: 'example',
        matchId: 'chisquare',
        explanation: 'Qui-quadrado de independência - testa associação entre duas variáveis categóricas',
        dailyLifeAnalogy: 'Como ver se idade influencia na escolha do sabor de sorvete'
      },
      {
        id: 'correlation-concept',
        content: 'Correlação',
        type: 'concept',
        matchId: 'correlation',
        explanation: 'Mede se duas coisas aumentam ou diminuem juntas. Como altura e peso.',
        dailyLifeAnalogy: 'Ver se pessoas mais altas tendem a pesar mais',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'correlation-example',
        content: 'Analisar a relação entre horas de treino por semana e performance atlética',
        type: 'example',
        matchId: 'correlation',
        explanation: 'Correlação de Pearson ou Spearman - mede força da relação linear entre variáveis',
        dailyLifeAnalogy: 'Como ver se mais horas estudando = notas melhores'
      }
    ]
  },
  {
    id: 2,
    level: 'facil',
    title: 'Cohen\'s Kappa - Quando Dois Avaliadores Concordam?',
    instruction: 'Identifique situações onde o Kappa de Cohen é o teste apropriado',
    items: [
      {
        id: 'kappa-concept',
        content: 'Kappa de Cohen',
        type: 'concept',
        matchId: 'kappa',
        explanation: 'Mede o quanto dois avaliadores concordam, descontando a concordância por acaso.',
        dailyLifeAnalogy: 'Como dois professores corrigindo a mesma prova',
        icon: <Users className="w-4 h-4" />
      },
      {
        id: 'kappa-example1',
        content: 'Dois nutricionistas classificando pacientes como "desnutrido" ou "bem nutrido"',
        type: 'example',
        matchId: 'kappa',
        explanation: 'Kappa mede se os dois profissionais chegam às mesmas conclusões mais do que seria esperado por sorte',
        dailyLifeAnalogy: 'Como dois médicos diagnosticando a mesma doença'
      },
      {
        id: 'agreement-concept',
        content: 'Concordância Simples',
        type: 'concept',
        matchId: 'simple-agreement',
        explanation: 'Apenas conta quantas vezes os avaliadores concordaram, sem considerar o acaso.',
        dailyLifeAnalogy: 'Contar quantas vezes dois amigos escolhem o mesmo filme',
        icon: <CheckCircle className="w-4 h-4" />
      },
      {
        id: 'agreement-example',
        content: 'Calcular quantos % das vezes dois treinadores dão a mesma nota para um exercício',
        type: 'example',
        matchId: 'simple-agreement',
        explanation: 'Concordância percentual simples - não considera que algumas concordâncias podem ser por acaso',
        dailyLifeAnalogy: 'Como contar quantas vezes você e seu amigo escolhem a mesma pizza'
      }
    ]
  }
]

// Educational content for pre-game learning
const educationalSections = [
  {
    title: "Como Escolher o Teste Certo? - Guia para Iniciantes",
    content: (
      <div className="space-y-4">
        <p>🤔 <strong>Escolher o teste estatístico certo é como escolher a ferramenta certa:</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔨 Para Comparar Grupos</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li><strong>Teste t:</strong> Comparar médias (ex: peso antes/depois)</li>
              <li><strong>ANOVA:</strong> Comparar 3+ grupos (ex: 3 dietas diferentes)</li>
              <li><strong>Qui-quadrado:</strong> Comparar categorias (ex: sexo vs esporte)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">📊 Para Medir Relações</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li><strong>Correlação:</strong> Se duas coisas variam juntas</li>
              <li><strong>Regressão:</strong> Prever uma coisa pela outra</li>
              <li><strong>Kappa:</strong> Se dois avaliadores concordam</li>
            </ul>
          </div>
        </div>
        
        <p>💡 <strong>Dica de ouro:</strong> Sempre pergunte "O que eu quero descobrir?" antes de escolher o teste!</p>
      </div>
    ),
    concepts: [
      {
        term: "Teste Estatístico",
        definition: "Ferramenta matemática para responder perguntas sobre dados",
        example: "Teste t para ver se uma dieta funciona"
      },
      {
        term: "Variável",
        definition: "Característica que pode mudar (idade, peso, sexo, etc.)",
        example: "Peso corporal, tipo de exercício preferido"
      }
    ]
  },
  {
    title: "Kappa de Cohen - Medindo Concordância",
    content: (
      <div className="space-y-4">
        <p>👥 <strong>Imagine dois professores corrigindo a mesma prova:</strong></p>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">🎯 O Problema</h4>
          <p className="text-yellow-700 text-sm mb-2">
            Se eles concordam 80% das vezes, isso é bom? Depende! Se a prova só tem "certo" ou "errado", 
            eles podem concordar 50% das vezes só por sorte.
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ A Solução: Kappa</h4>
          <p className="text-green-700 text-sm">
            O Kappa desconta a concordância que seria esperada por acaso. 
            Kappa = 0 significa "só concordam por sorte", Kappa = 1 significa "concordância perfeita".
          </p>
        </div>
        
        <p>🏠 <strong>Exemplos do dia a dia:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
          <li>Dois médicos diagnosticando a mesma doença</li>
          <li>Dois juízes avaliando uma apresentação</li>
          <li>Dois nutricionistas classificando dietas</li>
        </ul>
      </div>
    ),
    concepts: [
      {
        term: "Kappa de Cohen",
        definition: "Medida de concordância entre avaliadores que desconta o acaso",
        symbol: "κ (kappa)",
        example: "κ = 0.8 indica excelente concordância entre dois nutricionistas"
      },
      {
        term: "Concordância por Acaso",
        definition: "Quanto os avaliadores concordariam apenas por sorte",
        example: "Em diagnóstico sim/não, concordariam 50% por acaso"
      }
    ]
  }
]

interface Game35StatisticalTestMatchingProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game35StatisticalTestMatching({ onBack, onComplete }: Game35StatisticalTestMatchingProps) {
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

  const currentScenario = matchingScenarios[gameState.currentQuestion]

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
      if (gameState.currentQuestion < matchingScenarios.length - 1) {
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
      gameTitle="Seleção de Testes Estatísticos"
      gameDescription="Aprenda a escolher o teste estatístico correto para cada situação através de jogos de associação"
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
      gameId={35}
      onBack={onBack}
      onComplete={onComplete}
      gameState={gameState}
      onGameStateChange={setGameState}
      totalQuestions={matchingScenarios.length}
      educationComponent={educationComponent}
      showLevelIndicator={true}
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Cenário {gameState.currentQuestion + 1} de {matchingScenarios.length}
              </h3>
              <div className="text-sm text-gray-600">
                Nível: {currentScenario.level.replace('-', ' ')}
              </div>
            </div>
          </CardHeader>
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
