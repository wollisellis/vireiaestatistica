import { Hint } from '@/components/ui/HintSystem'

// Hints for Nutritional Game 1: Anthropometric Assessment
export const game1Hints: Hint[] = [
  {
    id: 'game1-intro',
    type: 'info',
    title: 'Bem-vindo à Avaliação Antropométrica',
    content: 'A avaliação antropométrica é fundamental para determinar o estado nutricional de crianças. Você irá trabalhar com medidas de peso, altura e idade.',
    level: 'beginner',
    trigger: 'onLoad',
    delay: 2,
    relatedConcepts: ['Antropometria', 'Estado Nutricional', 'Crescimento Infantil']
  },
  {
    id: 'game1-measurements',
    type: 'tip',
    title: 'Precisão nas Medidas',
    content: 'Sempre verifique se as medidas estão em unidades corretas: peso em kg, altura em cm, idade em meses. Pequenos erros podem alterar significativamente a interpretação.',
    level: 'beginner',
    trigger: 'onRequest',
    example: 'Uma criança de 24 meses com 12 kg e 85 cm está no percentil adequado, mas se você inserir 1,2 kg por engano, o resultado será completamente diferente.',
    relatedConcepts: ['Unidades de Medida', 'Precisão', 'Erro de Medição']
  },
  {
    id: 'game1-percentiles',
    type: 'concept',
    title: 'Entendendo Percentis',
    content: 'Percentis indicam a posição da criança em relação a outras da mesma idade e sexo. P50 é a mediana (50% estão abaixo, 50% acima).',
    level: 'intermediate',
    trigger: 'onRequest',
    example: 'Uma criança no P75 para peso significa que 75% das crianças da mesma idade pesam menos que ela.',
    relatedConcepts: ['Percentis', 'Curvas de Crescimento', 'Distribuição Normal']
  },
  {
    id: 'game1-interpretation',
    type: 'strategy',
    title: 'Interpretação Clínica',
    content: 'Não analise apenas um indicador. Compare peso/idade, altura/idade e peso/altura para uma avaliação completa do estado nutricional.',
    level: 'advanced',
    trigger: 'onRequest',
    example: 'Uma criança pode ter peso adequado para idade, mas baixa altura, indicando desnutrição crônica.',
    relatedConcepts: ['Desnutrição Aguda', 'Desnutrição Crônica', 'Avaliação Integral']
  },
  {
    id: 'game1-warning',
    type: 'warning',
    title: 'Pontos de Atenção',
    content: 'Valores abaixo do P3 ou acima do P97 requerem atenção especial e podem indicar problemas nutricionais ou de saúde.',
    level: 'intermediate',
    trigger: 'onError',
    relatedConcepts: ['Pontos de Corte', 'Risco Nutricional', 'Intervenção']
  }
]

// Hints for Nutritional Game 2: Clinical Assessment
export const game2Hints: Hint[] = [
  {
    id: 'game2-intro',
    type: 'info',
    title: 'Avaliação Clínica Nutricional',
    content: 'A avaliação clínica complementa os dados antropométricos, observando sinais físicos de deficiências nutricionais.',
    level: 'beginner',
    trigger: 'onLoad',
    delay: 2,
    relatedConcepts: ['Sinais Clínicos', 'Deficiências Nutricionais', 'Exame Físico']
  },
  {
    id: 'game2-signs',
    type: 'concept',
    title: 'Sinais de Deficiência',
    content: 'Cada nutriente tem sinais específicos de deficiência. Aprenda a associar os sinais clínicos com as deficiências correspondentes.',
    level: 'intermediate',
    trigger: 'onRequest',
    example: 'Cabelos quebradiços e despigmentados podem indicar deficiência proteica (kwashiorkor).',
    relatedConcepts: ['Kwashiorkor', 'Marasmo', 'Deficiências Específicas']
  },
  {
    id: 'game2-observation',
    type: 'tip',
    title: 'Técnica de Observação',
    content: 'Observe sistematicamente: cabelos, olhos, pele, unhas, mucosas. Cada região pode revelar informações nutricionais importantes.',
    level: 'beginner',
    trigger: 'onRequest',
    relatedConcepts: ['Exame Físico', 'Semiologia', 'Observação Clínica']
  },
  {
    id: 'game2-differential',
    type: 'strategy',
    title: 'Diagnóstico Diferencial',
    content: 'Alguns sinais podem ter múltiplas causas. Considere o contexto clínico e outros indicadores para um diagnóstico preciso.',
    level: 'advanced',
    trigger: 'onRequest',
    example: 'Palidez pode indicar anemia ferropriva, mas também outras causas não nutricionais.',
    relatedConcepts: ['Diagnóstico Diferencial', 'Anemia', 'Contexto Clínico']
  }
]

// Hints for Nutritional Game 3: Socioeconomic Assessment
export const game3Hints: Hint[] = [
  {
    id: 'game3-intro',
    type: 'info',
    title: 'Fatores Socioeconômicos na Nutrição',
    content: 'O estado nutricional é influenciado por fatores sociais, econômicos e ambientais. Compreender esses determinantes é essencial.',
    level: 'beginner',
    trigger: 'onLoad',
    delay: 2,
    relatedConcepts: ['Determinantes Sociais', 'Segurança Alimentar', 'Pobreza']
  },
  {
    id: 'game3-access',
    type: 'concept',
    title: 'Acesso aos Alimentos',
    content: 'Avalie não apenas a disponibilidade, mas também o acesso físico, econômico e cultural aos alimentos nutritivos.',
    level: 'intermediate',
    trigger: 'onRequest',
    example: 'Uma família pode ter renda, mas viver em área sem acesso a alimentos frescos (deserto alimentar).',
    relatedConcepts: ['Deserto Alimentar', 'Acesso Econômico', 'Disponibilidade']
  },
  {
    id: 'game3-education',
    type: 'tip',
    title: 'Educação Materna',
    content: 'O nível educacional da mãe é um dos preditores mais fortes do estado nutricional infantil. Considere este fator na avaliação.',
    level: 'intermediate',
    trigger: 'onRequest',
    relatedConcepts: ['Educação Materna', 'Cuidados Infantis', 'Conhecimento Nutricional']
  },
  {
    id: 'game3-intervention',
    type: 'strategy',
    title: 'Intervenções Contextualizadas',
    content: 'Adapte as recomendações ao contexto socioeconômico da família. Soluções devem ser viáveis e culturalmente apropriadas.',
    level: 'advanced',
    trigger: 'onRequest',
    example: 'Recomendar alimentos caros para família de baixa renda não é efetivo. Busque alternativas locais e acessíveis.',
    relatedConcepts: ['Adequação Cultural', 'Viabilidade Econômica', 'Intervenção Nutricional']
  }
]

// Hints for Nutritional Game 4: Growth Curves
export const game4Hints: Hint[] = [
  {
    id: 'game4-intro',
    type: 'info',
    title: 'Curvas de Crescimento',
    content: 'As curvas de crescimento são ferramentas essenciais para monitorar o desenvolvimento infantil ao longo do tempo.',
    level: 'beginner',
    trigger: 'onLoad',
    delay: 2,
    relatedConcepts: ['Curvas de Crescimento', 'Monitoramento', 'Desenvolvimento Infantil']
  },
  {
    id: 'game4-plotting',
    type: 'tip',
    title: 'Plotagem Precisa',
    content: 'Localize primeiro a idade no eixo X, depois o valor da medida no eixo Y. O ponto de intersecção deve estar exato.',
    level: 'beginner',
    trigger: 'onRequest',
    example: 'Para uma criança de 18 meses com 10 kg: encontre 18 no eixo X, suba até 10 no eixo Y, marque o ponto.',
    relatedConcepts: ['Plotagem', 'Eixos Cartesianos', 'Precisão']
  },
  {
    id: 'game4-trends',
    type: 'concept',
    title: 'Tendências de Crescimento',
    content: 'Mais importante que um ponto isolado é a tendência ao longo do tempo. Observe se a criança mantém seu canal de crescimento.',
    level: 'intermediate',
    trigger: 'onRequest',
    example: 'Uma criança no P25 que sempre esteve neste percentil está crescendo adequadamente.',
    relatedConcepts: ['Canal de Crescimento', 'Tendência', 'Monitoramento Longitudinal']
  },
  {
    id: 'game4-velocity',
    type: 'strategy',
    title: 'Velocidade de Crescimento',
    content: 'Analise não apenas a posição, mas a velocidade de crescimento. Mudanças bruscas de canal podem indicar problemas.',
    level: 'advanced',
    trigger: 'onRequest',
    example: 'Uma criança que sai do P50 para P10 em poucos meses pode ter problema de saúde ou nutricional.',
    relatedConcepts: ['Velocidade de Crescimento', 'Mudança de Canal', 'Alerta Nutricional']
  },
  {
    id: 'game4-interactive',
    type: 'tip',
    title: 'Modo Interativo',
    content: 'Use o modo interativo para praticar plotagem. Clique no gráfico para marcar pontos e veja a interpretação automática.',
    level: 'beginner',
    trigger: 'onRequest',
    relatedConcepts: ['Prática Interativa', 'Plotagem Manual', 'Feedback Imediato']
  }
]

// Function to get hints for a specific game
export function getGameHints(gameId: number): Hint[] {
  switch (gameId) {
    case 1:
      return game1Hints
    case 2:
      return game2Hints
    case 3:
      return game3Hints
    case 4:
      return game4Hints
    default:
      return []
  }
}

// Function to get hints by trigger type
export function getHintsByTrigger(gameId: number, trigger: Hint['trigger']): Hint[] {
  const gameHints = getGameHints(gameId)
  return gameHints.filter(hint => hint.trigger === trigger)
}

// Function to get hints by level
export function getHintsByLevel(gameId: number, level: Hint['level']): Hint[] {
  const gameHints = getGameHints(gameId)
  return gameHints.filter(hint => hint.level === level)
}

// Function to get contextual hints based on user performance
export function getContextualHints(gameId: number, performance: {
  score: number
  attempts: number
  timeElapsed: number
  errors: string[]
}): Hint[] {
  const allHints = getGameHints(gameId)
  const contextualHints: Hint[] = []

  // Add beginner hints for low scores
  if (performance.score < 60) {
    contextualHints.push(...allHints.filter(h => h.level === 'beginner'))
  }

  // Add error-specific hints
  if (performance.errors.length > 0) {
    contextualHints.push(...allHints.filter(h => h.trigger === 'onError'))
  }

  // Add advanced hints for high performers
  if (performance.score > 80) {
    contextualHints.push(...allHints.filter(h => h.level === 'advanced'))
  }

  return contextualHints
}
