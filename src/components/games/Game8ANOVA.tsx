'use client'

import React from 'react'
import { GameTemplate } from './GameTemplate'

const questions = [
  {
    id: 1,
    title: "ANOVA de Uma Via",
    description: "Comparação do consumo proteico entre 4 grupos de atletas: corredores, nadadores, ciclistas e levantadores de peso. F = 12,34, p < 0,001.",
    question: "O que indica este resultado da ANOVA?",
    options: [
      "Todos os grupos têm médias iguais",
      "Pelo menos um grupo difere significativamente dos outros",
      "Apenas dois grupos diferem entre si",
      "Os dados não seguem distribuição normal"
    ],
    correctAnswer: 1,
    explanation: "Um F significativo (p < 0,001) indica que rejeitamos H₀ e concluímos que pelo menos uma média grupal difere das outras. Para saber quais grupos diferem, precisamos de testes post-hoc."
  },
  {
    id: 2,
    title: "Teste Post-hoc de Tukey",
    description: "Após ANOVA significativa, aplicou-se teste de Tukey. Resultado: levantadores de peso diferem significativamente de corredores e nadadores, mas não de ciclistas.",
    question: "Quantas comparações múltiplas foram realizadas entre 4 grupos?",
    options: [
      "4",
      "6", 
      "8",
      "12"
    ],
    correctAnswer: 1,
    explanation: "Com 4 grupos, o número de comparações par a par é C(4,2) = 4!/(2!(4-2)!) = 6 comparações: 1vs2, 1vs3, 1vs4, 2vs3, 2vs4, 3vs4."
  },
  {
    id: 3,
    title: "Pressupostos da ANOVA",
    description: "Antes de interpretar uma ANOVA, devemos verificar seus pressupostos. Qual teste verifica a homogeneidade das variâncias?",
    question: "Qual teste verifica homogeneidade das variâncias na ANOVA?",
    options: [
      "Teste de Shapiro-Wilk",
      "Teste de Levene",
      "Teste de Kolmogorov-Smirnov", 
      "Teste de Durbin-Watson"
    ],
    correctAnswer: 1,
    explanation: "O teste de Levene verifica a homogeneidade das variâncias (homocedasticidade). Shapiro-Wilk testa normalidade, Kolmogorov-Smirnov também testa normalidade, e Durbin-Watson testa autocorrelação."
  },
  {
    id: 4,
    title: "Interpretação do Eta-quadrado",
    description: "Uma ANOVA resultou em η² = 0,35. Como interpretar este tamanho de efeito?",
    question: "O que significa η² = 0,35?",
    options: [
      "Efeito pequeno (< 0,01)",
      "Efeito médio (0,01 - 0,06)",
      "Efeito grande (> 0,14)",
      "Resultado não significativo"
    ],
    correctAnswer: 2,
    explanation: "Eta-quadrado (η²) de 0,35 indica que 35% da variância na variável dependente é explicada pelo fator (grupo). Segundo Cohen: pequeno < 0,01, médio ≈ 0,06, grande > 0,14. Portanto, 0,35 é um efeito grande."
  }
]

interface Game8ANOVAProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game8ANOVA({ onBack, onComplete }: Game8ANOVAProps) {
  return (
    <GameTemplate
      gameId={8}
      questions={questions}
      onBack={onBack}
      onComplete={onComplete}
    />
  )
}
