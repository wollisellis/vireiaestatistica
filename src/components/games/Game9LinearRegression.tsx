'use client'

import React from 'react'
import { GameTemplate } from './GameTemplate'

const questions = [
  {
    id: 1,
    title: "Interpretação do R²",
    description: "Modelo de regressão predizendo VO₂ máximo a partir do peso corporal: VO₂ = 65,2 - 0,18×Peso. R² = 0,42, p < 0,001.",
    question: "Como interpretar R² = 0,42?",
    options: [
      "42% dos atletas têm VO₂ máximo adequado",
      "42% da variação no VO₂ máximo é explicada pelo peso corporal",
      "A correlação entre peso e VO₂ é 0,42",
      "O modelo tem 42% de precisão"
    ],
    correctAnswer: 1,
    explanation: "R² representa a proporção da variância da variável dependente (VO₂ máximo) que é explicada pela variável independente (peso corporal). R² = 0,42 significa que 42% da variação no VO₂ é explicada pelo peso."
  },
  {
    id: 2,
    title: "Interpretação do Coeficiente Angular",
    description: "Na equação VO₂ = 65,2 - 0,18×Peso, o coeficiente -0,18 indica:",
    question: "O que significa o coeficiente -0,18?",
    options: [
      "Para cada kg a mais de peso, o VO₂ diminui 0,18 ml/kg/min",
      "O peso explica 18% da variação no VO₂",
      "A correlação é negativa e fraca",
      "O modelo não é significativo"
    ],
    correctAnswer: 0,
    explanation: "O coeficiente angular (-0,18) indica a mudança na variável dependente para cada unidade de mudança na variável independente. Aqui, cada kg adicional de peso está associado a uma diminuição de 0,18 ml/kg/min no VO₂ máximo."
  },
  {
    id: 3,
    title: "Pressupostos da Regressão Linear",
    description: "Análise de resíduos mostra padrão em forma de funil (variância aumenta com valores preditos). Qual pressuposto foi violado?",
    question: "Que pressuposto da regressão foi violado?",
    options: [
      "Linearidade",
      "Independência dos resíduos",
      "Homocedasticidade (variância constante)",
      "Normalidade dos resíduos"
    ],
    correctAnswer: 2,
    explanation: "O padrão em funil nos resíduos indica heterocedasticidade - a variância dos resíduos não é constante. Isso viola o pressuposto de homocedasticidade da regressão linear."
  },
  {
    id: 4,
    title: "Predição vs Extrapolação",
    description: "Modelo baseado em atletas com peso entre 60-90kg. Um técnico quer predizer VO₂ para atleta de 110kg.",
    question: "Qual é o problema com esta predição?",
    options: [
      "Não há problema",
      "Extrapolação além do intervalo dos dados originais",
      "O peso é muito alto para ser real",
      "O modelo não é significativo"
    ],
    correctAnswer: 1,
    explanation: "Predizer para 110kg constitui extrapolação, pois está fora do intervalo dos dados originais (60-90kg). Extrapolações são arriscadas porque não sabemos se a relação linear se mantém fora do intervalo observado."
  }
]

interface Game9LinearRegressionProps {
  onBack: () => void
  onComplete: (score: number, timeElapsed: number) => void
}

export function Game9LinearRegression({ onBack, onComplete }: Game9LinearRegressionProps) {
  return (
    <GameTemplate
      gameId={9}
      questions={questions}
      onBack={onBack}
      onComplete={onComplete}
    />
  )
}
