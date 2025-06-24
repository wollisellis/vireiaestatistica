'use client'

import React from 'react'
import { GameTemplate } from './GameTemplate'

const questions = [
  {
    id: 1,
    title: "Interpretação do Intervalo de Confiança",
    description: "Estudo sobre consumo de cálcio em adolescentes: média = 850mg, IC 95% = [780, 920]mg.",
    question: "Como interpretar este intervalo de confiança?",
    options: [
      "95% dos adolescentes consomem entre 780-920mg de cálcio",
      "Há 95% de probabilidade de que a média populacional esteja entre 780-920mg",
      "Se repetirmos o estudo 100 vezes, 95 intervalos conterão a média populacional",
      "A margem de erro é de 5%"
    ],
    correctAnswer: 2,
    explanation: "A interpretação correta do IC 95% é frequentista: se repetirmos o procedimento de amostragem e cálculo do IC muitas vezes, 95% dos intervalos calculados conterão o verdadeiro parâmetro populacional."
  },
  {
    id: 2,
    title: "Fatores que Afetam a Largura do IC",
    description: "Pesquisador quer diminuir a largura do intervalo de confiança para uma estimativa mais precisa.",
    question: "Qual estratégia NÃO diminui a largura do IC?",
    options: [
      "Aumentar o tamanho da amostra",
      "Diminuir o nível de confiança (de 95% para 90%)",
      "Usar técnicas que reduzam a variabilidade",
      "Aumentar o nível de confiança (de 95% para 99%)"
    ],
    correctAnswer: 3,
    explanation: "Aumentar o nível de confiança (95% → 99%) AUMENTA a largura do IC, não diminui. Para IC mais estreito: ↑ tamanho amostral, ↓ nível de confiança, ↓ variabilidade."
  },
  {
    id: 3,
    title: "IC para Diferença de Médias",
    description: "Comparação de força entre homens e mulheres: diferença média = 15kg, IC 95% = [8, 22]kg.",
    question: "O que podemos concluir sobre a diferença?",
    options: [
      "Não há diferença significativa (IC inclui zero)",
      "Há diferença significativa (IC não inclui zero)",
      "Os dados são insuficientes",
      "O IC está mal calculado"
    ],
    correctAnswer: 1,
    explanation: "Como o IC 95% [8, 22] não inclui zero, podemos concluir que há diferença estatisticamente significativa entre homens e mulheres (p < 0,05). Se incluísse zero, não haveria significância."
  },
  {
    id: 4,
    title: "IC vs Teste de Hipóteses",
    description: "Estudo sobre efeito de suplemento: diferença média = 3,2kg, IC 95% = [-0,5, 6,9]kg.",
    question: "Qual seria o resultado de um teste t bilateral com α = 0,05?",
    options: [
      "p < 0,05 (significativo)",
      "p > 0,05 (não significativo)",
      "Impossível determinar",
      "p = 0,05 (exatamente)"
    ],
    correctAnswer: 1,
    explanation: "Como o IC 95% [-0,5, 6,9] inclui zero, um teste t bilateral com α = 0,05 resultaria em p > 0,05 (não significativo). Há correspondência entre IC e testes de hipóteses."
  }
]

interface Game10ConfidenceIntervalsProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game10ConfidenceIntervals({ onBack, onComplete }: Game10ConfidenceIntervalsProps) {
  return (
    <GameTemplate
      gameId={10}
      questions={questions}
      onBack={onBack}
      onComplete={onComplete}
    />
  )
}
