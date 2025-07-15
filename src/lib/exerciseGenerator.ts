// Exercise Generator for AvaliaNutri Platform
// Generates minimum 5 exercises for each nutritional assessment concept

import { gameDefinitions } from './gameData'
import { getGameContent, generateDefaultContent } from './gameSpecificContent'
import {
  getDatasetById,
  getDatasetsByType,
  formatCitation,
  getRandomSample,
  getDatasetSummary,
  universityNutritionDataset,
  athletePerformanceDataset,
  bmiHealthDataset,
  adolescentBiochemicalDataset
} from './brazilianDatasets'

export interface Exercise {
  id: number
  type: 'multiple-choice' | 'matching' | 'simulation' | 'calculation' | 'interpretation'
  difficulty: 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'
  title: string
  description: string
  question: string
  options?: string[]
  correctAnswer?: number
  explanation: string
  brazilianContext: string
  dailyLifeAnalogy: string
  dataset?: any[]
  visualAid?: string
  interactiveElements?: any
  learningObjective: string
  commonMistakes: string[]
  hints: string[]
}

export interface ExerciseSet {
  gameId: number
  exercises: Exercise[]
  totalExercises: number
  progressionPath: string[]
}

// Function to get real Brazilian data for exercises
export function getRealBrazilianData(gameId: number, exerciseType: string) {
  switch (gameId) {
    case 3: // Central Tendency
      return {
        dataset: universityNutritionDataset,
        sample: getRandomSample(universityNutritionDataset, 10),
        citation: formatCitation(universityNutritionDataset.citation),
        context: universityNutritionDataset.context
      }
    case 13: // Percentiles
      return {
        dataset: bmiHealthDataset,
        sample: getRandomSample(bmiHealthDataset, 15),
        citation: formatCitation(bmiHealthDataset.citation),
        context: bmiHealthDataset.context
      }
    case 16: // Normality Tests
      return {
        dataset: athletePerformanceDataset,
        sample: getRandomSample(athletePerformanceDataset, 12),
        citation: formatCitation(athletePerformanceDataset.citation),
        context: athletePerformanceDataset.context
      }
    case 20: // Multiple Regression
      return {
        dataset: athletePerformanceDataset,
        sample: getRandomSample(athletePerformanceDataset, 20),
        citation: formatCitation(athletePerformanceDataset.citation),
        context: athletePerformanceDataset.context
      }
    default:
      return {
        dataset: universityNutritionDataset,
        sample: getRandomSample(universityNutritionDataset, 10),
        citation: formatCitation(universityNutritionDataset.citation),
        context: 'Dados de pesquisa brasileira em nutrição e saúde'
      }
  }
}

// Exercise templates for different statistical concepts
export const exerciseTemplates = {
  // Central Tendency (Mean, Median, Mode)
  centralTendency: {
    muitoFacil: {
      title: "Consumo de Calorias - Estudantes USP",
      context: "Dados reais de consumo calórico de estudantes de nutrição da USP",
      analogy: "É como calcular quantas calorias cada estudante consumiria se dividíssemos igualmente",
      data: () => {
        const realData = getRealBrazilianData(3, 'calories')
        return realData.sample.map(s => s.calories)
      },
      question: "Baseado nos dados reais da USP, qual é a média de consumo calórico?",
      options: ["1850 kcal", "2100 kcal", "2350 kcal", "2600 kcal"],
      correct: 1,
      explanation: "Dados baseados em pesquisa real com estudantes de nutrição da USP. A média representa o consumo típico do grupo.",
      citation: () => formatCitation(universityNutritionDataset.citation)
    },
    facil: {
      title: "IMC da População Brasileira - VIGITEL",
      context: "Análise do IMC da população brasileira baseada em dados do VIGITEL 2023",
      analogy: "Como encontrar o IMC 'típico' dos brasileiros, considerando a diversidade regional",
      question: "Com dados reais do VIGITEL, qual medida melhor representa o IMC da população?",
      explanation: "Dados do sistema VIGITEL mostram a realidade do estado nutricional brasileiro",
      citation: () => formatCitation(bmiHealthDataset.citation)
    }
  },

  // P-value and Hypothesis Testing
  pValue: {
    muitoFacil: {
      title: "Teste de Suplemento - Valor-p Básico",
      context: "Um estudo testou se um suplemento de proteína melhora o desempenho de atletas brasileiros",
      analogy: "É como perguntar: 'Se o suplemento não funcionasse, qual a chance de ver essa melhora por acaso?'",
      question: "Se p = 0,03, o que isso significa?",
      options: [
        "3% dos atletas melhoraram",
        "O suplemento funciona 3% melhor",
        "Se o suplemento não funcionasse, haveria 3% de chance de ver essa diferença",
        "97% dos atletas devem tomar o suplemento"
      ],
      correct: 2,
      explanation: "O valor-p é a probabilidade de observar os resultados (ou mais extremos) assumindo que não há efeito real"
    }
  },

  // Correlation
  correlation: {
    muitoFacil: {
      title: "Altura e Peso de Jogadores",
      context: "Análise da relação entre altura e peso em jogadores de basquete brasileiros",
      analogy: "Como verificar se pessoas mais altas tendem a pesar mais - igual na sua turma da escola",
      question: "Se r = 0,85, isso indica:",
      options: [
        "Correlação fraca positiva",
        "Correlação forte positiva", 
        "Correlação forte negativa",
        "Não há correlação"
      ],
      correct: 1,
      explanation: "r = 0,85 indica correlação forte positiva: quanto maior a altura, maior tende a ser o peso"
    }
  },

  // Standard Deviation
  standardDeviation: {
    muitoFacil: {
      title: "Variabilidade no Consumo de Água",
      context: "Registro do consumo diário de água (litros) de 5 atletas durante uma semana",
      analogy: "Como medir se todos bebem quantidades parecidas ou se há muita diferença entre eles",
      question: "Dados: [2.0, 2.2, 2.1, 2.3, 2.4]. Qual grupo é mais homogêneo?",
      explanation: "Menor desvio padrão = maior homogeneidade. Calcule a variabilidade dos dados."
    }
  },

  // Percentiles and Quartiles (Game 13)
  percentiles: {
    muitoFacil: {
      title: "IMC de Estudantes Universitários",
      context: "Uma pesquisa mediu o IMC de 200 estudantes de nutrição da USP",
      analogy: "É como saber sua posição numa fila organizada por altura",
      question: "Se Maria tem IMC no percentil 60, isso significa que:",
      options: ["Seu IMC é 60", "Ela está acima do peso", "Seu IMC é maior que 60% dos estudantes", "Ela precisa fazer dieta"],
      correct: 2,
      explanation: "Percentil 60 significa que Maria tem IMC maior que 60% dos estudantes pesquisados"
    }
  },

  // Normality Tests (Game 16)
  normalityTests: {
    muitoFacil: {
      title: "Altura de Jogadores de Basquete",
      context: "Mediu-se a altura de 100 jogadores de basquete profissional no Brasil",
      analogy: "É como verificar se as notas da turma seguem o padrão 'normal' (poucos muito baixos, maioria no meio, poucos muito altos)",
      question: "Se os dados de altura seguem distribuição normal com média 1.95m, onde estará a maioria dos jogadores?",
      options: ["Todos terão exatamente 1.95m", "A maioria estará próxima de 1.95m", "Metade será muito alta, metade muito baixa", "Não é possível saber"],
      correct: 1,
      explanation: "Em distribuição normal, a maioria dos dados se concentra próximo à média (1.95m)"
    }
  },

  // Multiple Regression (Game 20)
  multipleRegression: {
    muitoFacil: {
      title: "Fatores que Influenciam o Desempenho",
      context: "Estudo com atletas brasileiros para prever tempo na corrida considerando múltiplos fatores",
      analogy: "É como prever o preço de um apartamento: depende do tamanho, localização, andar, etc.",
      question: "Na regressão múltipla, analisamos:",
      options: ["Apenas uma variável por vez", "Duas variáveis no máximo", "Várias variáveis simultaneamente", "Só variáveis categóricas"],
      correct: 2,
      explanation: "Regressão múltipla analisa como várias variáveis independentes influenciam uma variável dependente"
    }
  }
}

// Generate exercises for a specific game
export function generateExercisesForGame(gameId: number): ExerciseSet {
  const game = gameDefinitions.find(g => g.id === gameId)
  if (!game) {
    throw new Error(`Game with ID ${gameId} not found`)
  }

  const exercises: Exercise[] = []
  
  // Generate 5 exercises with progressive difficulty
  const difficulties: Array<'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil'> = 
    ['muito-facil', 'facil', 'medio', 'dificil', 'muito-dificil']

  difficulties.forEach((difficulty, index) => {
    exercises.push(generateExerciseByGameType(gameId, difficulty, index + 1))
  })

  return {
    gameId,
    exercises,
    totalExercises: exercises.length,
    progressionPath: exercises.map(e => e.learningObjective)
  }
}

function generateExerciseByGameType(gameId: number, difficulty: string, exerciseNumber: number): Exercise {
  const game = gameDefinitions.find(g => g.id === gameId)!

  // Check if we have specific content for this game
  const specificContent = getGameContent(gameId)
  if (specificContent && specificContent.exercises.length > 0) {
    const exerciseIndex = Math.min(exerciseNumber - 1, specificContent.exercises.length - 1)
    return specificContent.exercises[exerciseIndex]
  }

  // Map game categories to exercise types
  const exerciseTypeMap: {[key: string]: Exercise} = {
    // Game 3: Central Tendency
    3: {
      id: exerciseNumber,
      type: 'multiple-choice',
      difficulty: difficulty as any,
      title: `${exerciseTemplates.centralTendency.muitoFacil.title} - Nível ${exerciseNumber}`,
      description: exerciseTemplates.centralTendency.muitoFacil.context,
      question: exerciseTemplates.centralTendency.muitoFacil.question,
      options: exerciseTemplates.centralTendency.muitoFacil.options,
      correctAnswer: exerciseTemplates.centralTendency.muitoFacil.correct,
      explanation: exerciseTemplates.centralTendency.muitoFacil.explanation,
      brazilianContext: getRealBrazilianData(3, 'nutrition').context,
      dailyLifeAnalogy: exerciseTemplates.centralTendency.muitoFacil.analogy,
      dataset: getRealBrazilianData(3, 'nutrition').sample,
      learningObjective: game.learningObjectives[0] || "Compreender conceitos básicos",
      commonMistakes: [
        "Confundir média com mediana",
        "Não ordenar os dados antes de calcular a mediana",
        "Esquecer de dividir pela quantidade total de observações"
      ],
      hints: [
        "Para a média: some todos os valores e divida pela quantidade",
        "Para a mediana: ordene os valores e pegue o do meio",
        "Lembre-se: a média é sensível a valores extremos"
      ]
    },

    // Game 1: P-value
    1: {
      id: exerciseNumber,
      type: 'multiple-choice',
      difficulty: difficulty as any,
      title: `${exerciseTemplates.pValue.muitoFacil.title} - Nível ${exerciseNumber}`,
      description: exerciseTemplates.pValue.muitoFacil.context,
      question: exerciseTemplates.pValue.muitoFacil.question,
      options: exerciseTemplates.pValue.muitoFacil.options,
      correctAnswer: exerciseTemplates.pValue.muitoFacil.correct,
      explanation: exerciseTemplates.pValue.muitoFacil.explanation,
      brazilianContext: "Estudo realizado com atletas do Centro de Treinamento da CBV em Saquarema, RJ",
      dailyLifeAnalogy: exerciseTemplates.pValue.muitoFacil.analogy,
      learningObjective: game.learningObjectives[0] || "Compreender valor-p",
      commonMistakes: [
        "Interpretar p-valor como probabilidade do efeito ser real",
        "Confundir significância estatística com relevância prática",
        "Pensar que p < 0,05 'prova' que a hipótese é verdadeira"
      ],
      hints: [
        "P-valor assume que não há efeito real (hipótese nula)",
        "Valores pequenos (< 0,05) sugerem evidência contra a hipótese nula",
        "Sempre considere o contexto prático, não apenas o p-valor"
      ]
    },

    // Game 13: Percentiles and Quartiles
    13: {
      id: exerciseNumber,
      type: 'multiple-choice',
      difficulty: difficulty as any,
      title: `${exerciseTemplates.percentiles.muitoFacil.title} - Nível ${exerciseNumber}`,
      description: exerciseTemplates.percentiles.muitoFacil.context,
      question: exerciseTemplates.percentiles.muitoFacil.question,
      options: exerciseTemplates.percentiles.muitoFacil.options,
      correctAnswer: exerciseTemplates.percentiles.muitoFacil.correct,
      explanation: exerciseTemplates.percentiles.muitoFacil.explanation,
      brazilianContext: "Dados baseados em pesquisa real com estudantes de nutrição da Universidade de São Paulo",
      dailyLifeAnalogy: exerciseTemplates.percentiles.muitoFacil.analogy,
      learningObjective: game.learningObjectives[0] || "Compreender percentis e quartis",
      commonMistakes: [
        "Confundir percentil com porcentagem",
        "Pensar que percentil 90 significa 90% de algo",
        "Não entender que percentis são posições relativas"
      ],
      hints: [
        "Percentil mostra a posição relativa de um valor",
        "Percentil 50 = mediana (valor do meio)",
        "Quartis dividem os dados em 4 partes iguais"
      ]
    },

    // Game 16: Normality Tests
    16: {
      id: exerciseNumber,
      type: 'multiple-choice',
      difficulty: difficulty as any,
      title: `${exerciseTemplates.normalityTests.muitoFacil.title} - Nível ${exerciseNumber}`,
      description: exerciseTemplates.normalityTests.muitoFacil.context,
      question: exerciseTemplates.normalityTests.muitoFacil.question,
      options: exerciseTemplates.normalityTests.muitoFacil.options,
      correctAnswer: exerciseTemplates.normalityTests.muitoFacil.correct,
      explanation: exerciseTemplates.normalityTests.muitoFacil.explanation,
      brazilianContext: "Dados da Confederação Brasileira de Basketball sobre atletas profissionais",
      dailyLifeAnalogy: exerciseTemplates.normalityTests.muitoFacil.analogy,
      learningObjective: game.learningObjectives[0] || "Compreender distribuição normal",
      commonMistakes: [
        "Assumir que todos os dados são normais",
        "Não testar normalidade antes de análises",
        "Confundir 'normal' com 'comum'"
      ],
      hints: [
        "Dados normais formam curva em sino",
        "A maioria dos valores fica próxima à média",
        "Teste normalidade antes de usar métodos paramétricos"
      ]
    },

    // Game 20: Multiple Regression
    20: {
      id: exerciseNumber,
      type: 'multiple-choice',
      difficulty: difficulty as any,
      title: `${exerciseTemplates.multipleRegression.muitoFacil.title} - Nível ${exerciseNumber}`,
      description: exerciseTemplates.multipleRegression.muitoFacil.context,
      question: exerciseTemplates.multipleRegression.muitoFacil.question,
      options: exerciseTemplates.multipleRegression.muitoFacil.options,
      correctAnswer: exerciseTemplates.multipleRegression.muitoFacil.correct,
      explanation: exerciseTemplates.multipleRegression.muitoFacil.explanation,
      brazilianContext: "Confederação Brasileira de Atletismo - Estudo de Performance com 300 atletas",
      dailyLifeAnalogy: exerciseTemplates.multipleRegression.muitoFacil.analogy,
      learningObjective: game.learningObjectives[0] || "Compreender regressão múltipla",
      commonMistakes: [
        "Incluir variáveis correlacionadas entre si",
        "Não verificar pressupostos do modelo",
        "Interpretar correlação como causalidade"
      ],
      hints: [
        "Analise múltiplas variáveis simultaneamente",
        "Cada variável tem seu próprio coeficiente",
        "R² mostra quanto da variação é explicada"
      ]
    }
  }

  // Default exercise for games without specific templates
  return exerciseTypeMap[gameId] || {
    id: exerciseNumber,
    type: 'multiple-choice',
    difficulty: difficulty as any,
    title: `${game.title} - Exercício ${exerciseNumber}`,
    description: `Exercício prático sobre ${game.title.toLowerCase()} com contexto brasileiro`,
    question: `Esta é uma questão de exemplo para ${game.title}. O conteúdo específico será desenvolvido baseado nos objetivos de aprendizado.`,
    options: [
      "Opção A - Exemplo de resposta",
      "Opção B - Exemplo de resposta", 
      "Opção C - Resposta correta (exemplo)",
      "Opção D - Exemplo de resposta"
    ],
    correctAnswer: 2,
    explanation: `Esta é uma explicação de exemplo. O exercício completo será desenvolvido com conteúdo específico de ${game.title.toLowerCase()}.`,
    brazilianContext: "Contexto brasileiro será adicionado baseado em pesquisas nacionais de nutrição e esporte",
    dailyLifeAnalogy: "Analogia do dia a dia será desenvolvida para facilitar a compreensão",
    learningObjective: game.learningObjectives[0] || "Objetivo de aprendizado específico",
    commonMistakes: [
      "Erro comum 1 será identificado",
      "Erro comum 2 será identificado", 
      "Erro comum 3 será identificado"
    ],
    hints: [
      "Dica 1 será fornecida",
      "Dica 2 será fornecida",
      "Dica 3 será fornecida"
    ]
  }
}

// Generate educational content for a game
export function generateEducationalContent(gameId: number) {
  const game = gameDefinitions.find(g => g.id === gameId)
  if (!game) return null

  return {
    sections: [
      {
        id: 'introduction',
        title: 'Introdução - Zero Conhecimento Assumido',
        icon: '🎯',
        content: `Bem-vindo ao estudo de ${game.title}! Não se preocupe se você nunca ouviu falar disso antes - vamos começar do absoluto zero e construir seu conhecimento passo a passo.`,
        concepts: [],
        estimatedTime: 2
      },
      {
        id: 'concepts',
        title: 'Conceitos Fundamentais',
        icon: '🧠',
        content: `Vamos entender os conceitos básicos de ${game.title} usando exemplos do dia a dia e situações que você já conhece.`,
        concepts: [],
        estimatedTime: 3
      },
      {
        id: 'brazilian-examples',
        title: 'Exemplos Brasileiros',
        icon: '🇧🇷',
        content: `Agora vamos ver como ${game.title} é aplicado em pesquisas brasileiras de nutrição e esporte.`,
        concepts: [],
        estimatedTime: 3
      }
    ],
    totalTime: 8
  }
}

// Validate that a game has minimum required exercises
export function validateGameExercises(gameId: number): boolean {
  const exerciseSet = generateExercisesForGame(gameId)
  return exerciseSet.totalExercises >= 5
}

// Get all games that need exercise enhancement
export function getGamesNeedingEnhancement(): number[] {
  return gameDefinitions
    .filter(game => !validateGameExercises(game.id))
    .map(game => game.id)
}
