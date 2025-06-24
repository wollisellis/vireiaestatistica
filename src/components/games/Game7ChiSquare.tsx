'use client'

import React from 'react'
import { GameTemplate } from './GameTemplate'

const questions = [
  {
    id: 1,
    title: "Teste Qui-quadrado de Independência",
    description: "Estudo sobre associação entre tipo de esporte (individual vs coletivo) e lesões (sim vs não) em 200 atletas. χ² = 8,45, p = 0,004.",
    question: "Com α = 0,05, qual é a conclusão?",
    options: [
      "Não há associação entre tipo de esporte e lesões",
      "Há evidência de associação significativa entre tipo de esporte e lesões",
      "Os dados são insuficientes",
      "O teste foi aplicado incorretamente"
    ],
    correctAnswer: 1,
    explanation: "Como p = 0,004 < α = 0,05, rejeitamos H₀ e concluímos que há evidência de associação entre tipo de esporte e ocorrência de lesões."
  },
  {
    id: 2,
    title: "Frequências Esperadas",
    description: "Em um teste qui-quadrado, uma das células da tabela de contingência tem frequência esperada de 3,2. Isso é problemático?",
    question: "Qual é o problema com frequência esperada de 3,2?",
    options: [
      "Não há problema",
      "Frequência esperada deve ser ≥ 5 para validade do teste",
      "Frequência esperada deve ser um número inteiro",
      "Frequência esperada deve ser ≥ 10"
    ],
    correctAnswer: 1,
    explanation: "O teste qui-quadrado requer que todas as frequências esperadas sejam ≥ 5. Frequências menores podem invalidar o teste, sendo necessário agrupar categorias ou usar testes alternativos."
  },
  {
    id: 3,
    title: "Graus de Liberdade",
    description: "Tabela de contingência 3×4 (3 linhas, 4 colunas) para testar associação entre categoria de IMC e nível de atividade física.",
    question: "Quantos graus de liberdade tem este teste?",
    options: [
      "12",
      "7",
      "6",
      "11"
    ],
    correctAnswer: 2,
    explanation: "Graus de liberdade = (linhas - 1) × (colunas - 1) = (3 - 1) × (4 - 1) = 2 × 3 = 6."
  },
  {
    id: 4,
    title: "Interpretação dos Resíduos",
    description: "Análise dos resíduos padronizados mostra valor de +3,2 para 'atletas de elite com lesão grave'.",
    question: "O que indica este resíduo padronizado de +3,2?",
    options: [
      "Frequência observada menor que esperada",
      "Frequência observada muito maior que esperada",
      "Erro no cálculo",
      "Associação fraca"
    ],
    correctAnswer: 1,
    explanation: "Resíduo padronizado positivo e alto (+3,2) indica que a frequência observada é muito maior que a esperada. Valores > |2| são considerados contribuições importantes para o qui-quadrado."
  }
]

interface Game7ChiSquareProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game7ChiSquare({ onBack, onComplete }: Game7ChiSquareProps) {
  return (
    <GameTemplate
      gameId={7}
      questions={questions}
      onBack={onBack}
      onComplete={onComplete}
    />
  )
}
