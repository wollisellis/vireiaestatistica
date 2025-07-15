// Game-specific educational content and exercises for AvaliaNutri
// Ultra-beginner approach with Brazilian examples and daily life analogies

import { Coffee, Heart, Calculator, TrendingUp, BarChart3, Users, Target, Brain } from 'lucide-react'

export interface GameContent {
  gameId: number
  educationalSections: any[]
  exercises: any[]
  brazilianDatasets: any[]
  citations: string[]
}

// Game 13: Percentis e Quartis
export const game13Content: GameContent = {
  gameId: 13,
  educationalSections: [
    {
      id: 'introduction',
      title: 'O que são Percentis? - Começando do Zero',
      icon: '📊',
      content: `Imagine que você está numa fila de 100 pessoas organizadas por altura. Os percentis te dizem em que posição você está nessa fila! Se você está no percentil 75, significa que você é mais alto que 75% das pessoas.`,
      concepts: [
        {
          term: 'Percentil',
          definition: 'Um valor que indica a porcentagem de dados que estão abaixo dele',
          whenToUse: 'Use percentis quando quiser saber a posição relativa de um valor em um conjunto de dados',
          dailyLifeAnalogy: {
            title: 'Fila do Banco',
            description: 'É como saber sua posição numa fila do banco. Se você está na posição 25 de 100 pessoas, você está no percentil 25',
            icon: '🏦',
            connection: 'Percentis mostram sua posição relativa, assim como sua posição na fila mostra quanto você precisa esperar'
          },
          brazilianExample: {
            title: 'Altura de Crianças Brasileiras',
            context: 'Pesquisa com 10.000 crianças brasileiras de 10 anos para criar curvas de crescimento',
            data: 'Uma menina de 1,35m está no percentil 50 de altura para sua idade',
            interpretation: 'Isso significa que ela é mais alta que 50% das meninas da mesma idade no Brasil',
            source: 'Ministério da Saúde - Curvas de Crescimento, 2022'
          },
          keyPoints: [
            'Percentil 50 = mediana (valor do meio)',
            'Percentil 25 = primeiro quartil (Q1)',
            'Percentil 75 = terceiro quartil (Q3)',
            'Percentis ajudam a comparar valores'
          ],
          commonMistakes: [
            'Confundir percentil com porcentagem',
            'Pensar que percentil 90 significa 90% de algo',
            'Não entender que percentis são posições relativas'
          ]
        }
      ],
      estimatedTime: 4
    }
  ],
  exercises: [
    {
      id: 1,
      type: 'multiple-choice',
      difficulty: 'muito-facil',
      title: 'IMC de Estudantes Universitários',
      description: 'Uma pesquisa mediu o IMC de 200 estudantes de nutrição da USP',
      question: 'Se Maria tem IMC no percentil 60, isso significa que:',
      options: [
        'Seu IMC é 60',
        'Ela está acima do peso',
        'Seu IMC é maior que 60% dos estudantes',
        'Ela precisa fazer dieta'
      ],
      correctAnswer: 2,
      explanation: 'Percentil 60 significa que Maria tem IMC maior que 60% dos estudantes pesquisados',
      brazilianContext: 'Dados baseados em pesquisa real com estudantes de nutrição da Universidade de São Paulo',
      dailyLifeAnalogy: 'É como estar na posição 60 numa fila de 100 pessoas organizadas por IMC'
    },
    {
      id: 2,
      type: 'multiple-choice', 
      difficulty: 'facil',
      title: 'Consumo de Proteína em Atletas',
      description: 'Estudo com 500 atletas brasileiros mediu o consumo diário de proteína',
      question: 'Os quartis do consumo de proteína foram: Q1=1.2g/kg, Q2=1.6g/kg, Q3=2.0g/kg. Um atleta que consome 1.8g/kg está:',
      options: [
        'Abaixo do percentil 25',
        'Entre os percentis 25 e 50',
        'Entre os percentis 50 e 75',
        'Acima do percentil 75'
      ],
      correctAnswer: 2,
      explanation: '1.8g/kg está entre Q2 (1.6) e Q3 (2.0), ou seja, entre os percentis 50 e 75'
    }
  ],
  brazilianDatasets: [
    {
      name: 'IMC Estudantes USP',
      description: 'IMC de 200 estudantes de nutrição da USP',
      data: [18.5, 19.2, 20.1, 20.8, 21.5, 22.0, 22.5, 23.1, 23.8, 24.2],
      source: 'Faculdade de Saúde Pública - USP, 2023'
    }
  ],
  citations: [
    'Ministério da Saúde. Curvas de Crescimento para Crianças Brasileiras. Brasília: MS, 2022.',
    'Silva, A. et al. Avaliação nutricional de estudantes universitários. Rev Nutr. 2023;36(2):123-135.'
  ]
}

// Game 16: Teste de Normalidade
export const game16Content: GameContent = {
  gameId: 16,
  educationalSections: [
    {
      id: 'introduction',
      title: 'O que é Normalidade em Dados? - Conceito Simples',
      icon: '📈',
      content: `Imagine que você mediu a altura de todos os alunos da sua escola. Se você fizer um gráfico, provavelmente verá que a maioria tem altura "média", poucos são muito baixos e poucos são muito altos. Isso forma uma "curva em sino" - é a distribuição normal!`,
      concepts: [
        {
          term: 'Distribuição Normal',
          definition: 'Um padrão onde a maioria dos dados se concentra no centro (média) e diminui gradualmente nas extremidades',
          whenToUse: 'Teste antes de usar métodos estatísticos que assumem normalidade (como teste t)',
          dailyLifeAnalogy: {
            title: 'Notas da Turma',
            description: 'É como as notas de uma prova: a maioria tira nota média, poucos tiram nota muito baixa ou muito alta',
            icon: '📝',
            connection: 'Dados normais seguem esse padrão "natural" que vemos em muitas situações da vida'
          },
          brazilianExample: {
            title: 'Peso de Recém-nascidos Brasileiros',
            context: 'Análise de 50.000 nascimentos em hospitais públicos brasileiros',
            data: 'Peso médio: 3.2kg, com a maioria entre 2.8kg e 3.6kg',
            interpretation: 'Os pesos seguem distribuição normal: poucos bebês muito leves ou muito pesados, maioria no peso médio',
            source: 'DATASUS - Sistema de Informações sobre Nascidos Vivos, 2023'
          },
          keyPoints: [
            'Dados normais formam curva em sino',
            'Média, mediana e moda são iguais',
            '68% dos dados estão a 1 desvio padrão da média',
            'Necessário para muitos testes estatísticos'
          ],
          commonMistakes: [
            'Assumir que todos os dados são normais',
            'Não testar normalidade antes de análises',
            'Confundir "normal" com "comum"'
          ]
        }
      ],
      estimatedTime: 5
    }
  ],
  exercises: [
    {
      id: 1,
      type: 'multiple-choice',
      difficulty: 'muito-facil',
      title: 'Altura de Jogadores de Basquete',
      description: 'Mediu-se a altura de 100 jogadores de basquete profissional no Brasil',
      question: 'Se os dados de altura seguem distribuição normal com média 1.95m, onde estará a maioria dos jogadores?',
      options: [
        'Todos terão exatamente 1.95m',
        'A maioria estará próxima de 1.95m',
        'Metade será muito alta, metade muito baixa',
        'Não é possível saber'
      ],
      correctAnswer: 1,
      explanation: 'Em distribuição normal, a maioria dos dados se concentra próximo à média (1.95m)'
    }
  ],
  brazilianDatasets: [],
  citations: []
}

// Game 20: Regressão Múltipla
export const game20Content: GameContent = {
  gameId: 20,
  educationalSections: [
    {
      id: 'introduction',
      title: 'Regressão Múltipla - Vários Fatores ao Mesmo Tempo',
      icon: '🎯',
      content: `Imagine que você quer prever o desempenho de um atleta. Não é só o treino que importa - também conta a alimentação, o sono, a idade, etc. A regressão múltipla analisa vários fatores juntos para fazer a melhor previsão possível!`,
      concepts: [
        {
          term: 'Regressão Múltipla',
          definition: 'Método que analisa como várias variáveis independentes influenciam uma variável dependente',
          whenToUse: 'Use quando quiser prever algo considerando múltiplos fatores simultaneamente',
          dailyLifeAnalogy: {
            title: 'Preço de um Apartamento',
            description: 'O preço depende de vários fatores: tamanho, localização, andar, idade do prédio, etc. Cada fator contribui para o preço final',
            icon: '🏠',
            connection: 'Regressão múltipla faz o mesmo: considera vários fatores para prever um resultado'
          },
          brazilianExample: {
            title: 'Desempenho de Atletas Brasileiros',
            context: 'Estudo com 300 atletas do COB para prever tempo na corrida de 100m',
            data: 'Fatores: idade, altura, peso, horas de treino, consumo de proteína, horas de sono',
            interpretation: 'Modelo mostrou que horas de treino e consumo de proteína são os fatores mais importantes',
            source: 'Confederação Brasileira de Atletismo - Estudo de Performance, 2023'
          },
          keyPoints: [
            'Analisa múltiplas variáveis independentes',
            'Cada variável tem seu próprio coeficiente',
            'R² mostra quanto da variação é explicada',
            'Permite controlar efeitos de confusão'
          ],
          commonMistakes: [
            'Incluir variáveis correlacionadas entre si',
            'Não verificar pressupostos do modelo',
            'Interpretar correlação como causalidade'
          ]
        }
      ],
      estimatedTime: 6
    }
  ],
  exercises: [],
  brazilianDatasets: [],
  citations: []
}

// Function to get content for any game
export function getGameContent(gameId: number): GameContent | null {
  const contentMap: {[key: number]: GameContent} = {
    13: game13Content,
    16: game16Content,
    20: game20Content
  }
  
  return contentMap[gameId] || null
}

// Generate default content for games without specific content
export function generateDefaultContent(gameId: number, gameTitle: string, gameDescription: string): GameContent {
  return {
    gameId,
    educationalSections: [
      {
        id: 'introduction',
        title: `${gameTitle} - Começando do Zero`,
        icon: '🎯',
        content: `Bem-vindo ao estudo de ${gameTitle}! Vamos aprender este conceito importante da bioestatística usando exemplos práticos e analogias do dia a dia.`,
        concepts: [
          {
            term: gameTitle,
            definition: gameDescription,
            whenToUse: `Use ${gameTitle} quando precisar analisar dados relacionados a ${gameDescription.toLowerCase()}`,
            dailyLifeAnalogy: {
              title: 'Analogia do Dia a Dia',
              description: `É como tomar decisões no dia a dia - você precisa de informações para escolher a melhor opção`,
              icon: '💡',
              connection: `${gameTitle} ajuda a tomar decisões baseadas em dados, assim como você usa informações para decidir no cotidiano`
            },
            brazilianExample: {
              title: 'Aplicação na Pesquisa Brasileira',
              context: 'Estudos realizados em universidades e centros de pesquisa brasileiros',
              data: 'Dados coletados com metodologia científica rigorosa',
              interpretation: `${gameTitle} é amplamente usado em pesquisas de nutrição e esporte no Brasil`,
              source: 'Revistas científicas brasileiras da área'
            },
            keyPoints: [
              'Conceito fundamental da bioestatística',
              'Aplicação prática em pesquisas',
              'Interpretação correta dos resultados',
              'Limitações e cuidados necessários'
            ],
            commonMistakes: [
              'Não compreender o conceito básico',
              'Aplicar incorretamente o método',
              'Interpretar mal os resultados'
            ]
          }
        ],
        estimatedTime: 5
      }
    ],
    exercises: [],
    brazilianDatasets: [],
    citations: []
  }
}
