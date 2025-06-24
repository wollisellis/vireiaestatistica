'use client'

import React from 'react'
import { GameTemplate } from './GameTemplate'

const questions = [
  {
    id: 1,
    title: "Teste t para Uma Amostra",
    description: "Um nutricionista quer testar se o consumo médio de fibras de seus pacientes (n=25) difere da recomendação de 25g/dia. A média amostral foi 22,3g com DP=4,2g.",
    question: "Qual é a hipótese nula (H₀) apropriada para este teste?",
    options: [
      "H₀: μ ≠ 25g",
      "H₀: μ = 25g", 
      "H₀: μ < 25g",
      "H₀: μ > 25g"
    ],
    correctAnswer: 1,
    explanation: "A hipótese nula sempre expressa igualdade ou ausência de efeito. Neste caso, testamos se a média populacional é igual à recomendação (25g)."
  },
  {
    id: 2,
    title: "Teste t para Amostras Independentes",
    description: "Comparação do VO₂ máximo entre homens (n=15, média=52,4) e mulheres (n=18, média=46,8) atletas. Valor-p = 0,032.",
    question: "Com α = 0,05, qual é a conclusão apropriada?",
    options: [
      "Não há diferença significativa entre os grupos",
      "Há evidência de diferença significativa entre homens e mulheres",
      "Os dados são insuficientes para conclusão",
      "O teste foi aplicado incorretamente"
    ],
    correctAnswer: 1,
    explanation: "Como p = 0,032 < α = 0,05, rejeitamos H₀ e concluímos que há evidência estatística de diferença no VO₂ máximo entre homens e mulheres."
  },
  {
    id: 3,
    title: "Teste t Pareado",
    description: "Avaliação do peso corporal de 20 atletas antes e após programa nutricional. Diferença média = -2,1kg, DP das diferenças = 1,8kg, t = -5,22.",
    question: "O que indica o valor negativo da estatística t?",
    options: [
      "Erro no cálculo",
      "O peso médio diminuiu após a intervenção",
      "O teste não é válido",
      "A variabilidade é muito alta"
    ],
    correctAnswer: 1,
    explanation: "O sinal negativo indica que a diferença média (pós - pré) é negativa, ou seja, o peso médio diminuiu após o programa nutricional."
  },
  {
    id: 4,
    title: "Pressupostos do Teste t",
    description: "Antes de aplicar um teste t, devemos verificar os pressupostos. Qual NÃO é um pressuposto do teste t?",
    question: "Qual dos seguintes NÃO é um pressuposto do teste t?",
    options: [
      "Normalidade dos dados",
      "Independência das observações",
      "Homogeneidade das variâncias (para amostras independentes)",
      "Tamanho amostral maior que 100"
    ],
    correctAnswer: 3,
    explanation: "O teste t não requer n > 100. Na verdade, é útil para amostras pequenas (n < 30). Os outros são pressupostos importantes do teste t."
  }
]

interface Game6TTestsProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game6TTests({ onBack, onComplete }: Game6TTestsProps) {
  return (
    <GameTemplate
      gameId={6}
      questions={questions}
      onBack={onBack}
      onComplete={onComplete}
    />
  )
}
