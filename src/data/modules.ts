import { Module } from '@/types/modules';

export const modules: Module[] = [
  {
    id: 'module-1',
    title: 'Introdução à Avaliação Nutricional',
    description: 'Fundamentos da avaliação nutricional e sua importância na prática clínica',
    order: 1,
    isLocked: false,
    icon: '📊',
    estimatedTime: 90,
    content: [
      {
        id: 'content-1-1',
        type: 'text',
        title: 'O que é Avaliação Nutricional?',
        content: `
          A avaliação nutricional é um processo sistemático de coleta e interpretação de informações 
          para identificar problemas relacionados à nutrição. Ela estabelece situações de risco para 
          a saúde e permite planejar ações de promoção à saúde e prevenção de doenças.
          
          **Componentes principais:**
          - Anamnese Clínica Nutricional
          - Antropometria e Composição Corporal
          - Inquéritos Alimentares
          - Sinais Clínicos
          - Exames Bioquímicos
        `,
        order: 1
      },
      {
        id: 'content-1-2',
        type: 'text',
        title: 'Avaliação Individual vs Populacional',
        content: `
          **Avaliação Individual:**
          - Foco no diagnóstico nutricional específico do paciente
          - Utiliza dados detalhados: anamnese completa, antropometria, exames laboratoriais
          - Permite intervenções personalizadas
          
          **Avaliação Populacional:**
          - Foco em grupos e comunidades
          - Utiliza indicadores epidemiológicos
          - Base para políticas públicas de saúde
          - Dados do SISVAN, POF, e pesquisas nacionais
        `,
        order: 2
      },
      {
        id: 'content-1-3',
        type: 'interactive',
        title: 'Importância do Diagnóstico Nutricional',
        content: 'interactive-importance-diagnosis',
        order: 3
      }
    ],
    exercises: [
      {
        id: 'exercise-1-1',
        type: 'quiz',
        title: 'Conceitos Fundamentais',
        description: 'Teste seus conhecimentos sobre os conceitos básicos da avaliação nutricional',
        points: 100,
        difficulty: 'easy',
        order: 1,
        questions: [
          {
            id: 'q-1-1-1',
            text: 'Qual dos seguintes NÃO é um componente da avaliação nutricional individual?',
            type: 'multiple-choice',
            options: [
              'Anamnese clínica',
              'Censo demográfico',
              'Antropometria',
              'Exames bioquímicos'
            ],
            correctAnswer: 'Censo demográfico',
            explanation: 'O censo demográfico é uma ferramenta de avaliação populacional, não individual.',
            hint: 'Pense em qual opção seria usada para avaliar grandes grupos populacionais.',
            hintPenalty: 10
          },
          {
            id: 'q-1-1-2',
            text: 'Segundo dados do SISVAN 2023, qual a prevalência de obesidade em adultos brasileiros?',
            type: 'multiple-choice',
            options: [
              '15,8%',
              '22,4%',
              '28,5%',
              '33,1%'
            ],
            correctAnswer: '28,5%',
            explanation: 'De acordo com o SISVAN, 28,5% dos adultos brasileiros apresentam obesidade, um aumento significativo nas últimas décadas.',
            realDataContext: 'Dados reais do Sistema de Vigilância Alimentar e Nutricional (SISVAN) 2023'
          }
        ]
      },
      {
        id: 'exercise-1-2',
        type: 'brazilian-data',
        title: 'Análise de Dados Brasileiros',
        description: 'Exercício interativo com dados reais do POF 2024, SISVAN e DataSUS',
        points: 200,
        difficulty: 'medium',
        order: 2
      },
      {
        id: 'exercise-1-3',
        type: 'drag-drop',
        title: 'Classificação de Componentes',
        description: 'Arraste cada componente para a categoria correta: Avaliação Individual ou Populacional',
        points: 150,
        difficulty: 'medium',
        order: 3
      },
      {
        id: 'exercise-1-4',
        type: 'case-study',
        title: 'Caso Clínico Introdutório',
        description: 'Identifique quais dados coletar em um caso de primeira consulta nutricional',
        points: 200,
        difficulty: 'medium',
        order: 4,
        caseData: {
          id: 'case-1-1',
          patientProfile: {
            age: 45,
            gender: 'F',
            occupation: 'Professora',
            location: 'São Paulo, SP',
            socioeconomicLevel: 'Classe C'
          },
          clinicalHistory: 'Paciente procura atendimento nutricional com queixa de cansaço e ganho de peso nos últimos 2 anos. Nega doenças prévias.',
          anthropometricData: {},
          tasks: [
            {
              id: 'task-1-1',
              question: 'Quais dados antropométricos você deve coletar nesta primeira consulta?',
              type: 'diagnosis',
              requiredFields: ['weight', 'height', 'waistCircumference'],
              points: 50
            }
          ]
        }
      }
    ],
    realDataSources: [
      {
        name: 'SISVAN 2023',
        source: 'SISVAN',
        year: 2023,
        description: 'Dados do Sistema de Vigilância Alimentar e Nutricional',
        dataPoints: [
          {
            label: 'Obesidade em adultos',
            value: 28.5,
            unit: '%'
          },
          {
            label: 'Desnutrição infantil',
            value: 3.1,
            unit: '%'
          }
        ]
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Métodos de Avaliação da Composição Corporal',
    description: 'Conheça os diferentes métodos de avaliação corporal, desde antropometria até padrões-ouro',
    order: 2,
    isLocked: true,
    icon: '🔬',
    estimatedTime: 120,
    content: [
      {
        id: 'content-2-1',
        type: 'text',
        title: 'Métodos Padrão-Ouro',
        content: `
          **DEXA (Absorciometria de Dupla Energia de Raios-X):**
          - Considerado padrão-ouro para composição corporal
          - Diferencia massa óssea, massa magra e massa gorda
          - Custo médio no Brasil: R$ 300-600 (particular)
          - Limitação: não separa gordura subcutânea de visceral
          
          **Tomografia Computadorizada:**
          - Excelente para avaliar gordura visceral
          - Alto custo e exposição à radiação
          - Uso limitado na prática clínica rotineira
          
          **Ressonância Magnética:**
          - Sem radiação ionizante
          - Altíssima precisão
          - Custo elevado: R$ 800-2000
        `,
        order: 1
      },
      {
        id: 'content-2-2',
        type: 'text',
        title: 'Métodos Acessíveis',
        content: `
          **Bioimpedância Elétrica:**
          - Método prático e rápido
          - Custo acessível: R$ 50-150
          - Influenciado por hidratação
          - Disponível em muitas clínicas e academias
          
          **Antropometria:**
          - Baixo custo e alta aplicabilidade
          - Requer treinamento adequado
          - Inclui: peso, altura, circunferências, dobras cutâneas
          - Base do atendimento no SUS
        `,
        order: 2
      },
      {
        id: 'content-2-3',
        type: 'image',
        title: 'Comparação Visual dos Métodos',
        content: 'Imagem comparativa dos diferentes métodos de avaliação',
        mediaUrl: '/images/body-composition-methods.png',
        order: 3
      }
    ],
    exercises: [
      {
        id: 'exercise-2-1',
        type: 'matching',
        title: 'Conecte Métodos e Características',
        description: 'Relacione cada método de avaliação com suas características principais',
        points: 120,
        difficulty: 'easy',
        order: 1
      },
      {
        id: 'exercise-2-2',
        type: 'calculation',
        title: 'Simulador de Custo-Benefício',
        description: 'Calcule o custo-benefício de diferentes métodos para diversos cenários clínicos',
        points: 180,
        difficulty: 'medium',
        order: 2
      },
      {
        id: 'exercise-2-3',
        type: 'quiz',
        title: 'Interpretação de Resultados',
        description: 'Analise resultados de diferentes métodos e interprete corretamente',
        points: 200,
        difficulty: 'hard',
        order: 3,
        questions: [
          {
            id: 'q-2-3-1',
            text: 'Um paciente realizou DEXA e apresentou 32% de gordura corporal. Considerando que é um homem de 35 anos, como você classificaria?',
            type: 'multiple-choice',
            options: [
              'Normal',
              'Sobrepeso',
              'Obesidade',
              'Obesidade grave'
            ],
            correctAnswer: 'Obesidade',
            explanation: 'Para homens adultos, gordura corporal acima de 25% já é considerada obesidade. 32% indica obesidade.',
            hint: 'Homens têm pontos de corte diferentes de mulheres para % de gordura.',
            hintPenalty: 15
          }
        ]
      },
      {
        id: 'exercise-2-4',
        type: 'brazilian-data',
        title: 'Análise de Custos e Acessibilidade',
        description: 'Analise dados reais de custos de exames e acessibilidade no Brasil',
        points: 180,
        difficulty: 'medium',
        order: 4
      }
    ],
    realDataSources: [
      {
        name: 'Custos de Exames - ANS 2024',
        source: 'DataSUS',
        year: 2024,
        description: 'Tabela de custos médios de exames no Brasil',
        dataPoints: [
          {
            label: 'DEXA - SUS',
            value: 'R$ 85,00',
            unit: 'valor tabelado'
          },
          {
            label: 'DEXA - Particular',
            value: 'R$ 450,00',
            unit: 'média nacional'
          },
          {
            label: 'Bioimpedância - Particular',
            value: 'R$ 80,00',
            unit: 'média nacional'
          }
        ]
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Medidas Corporais e Antropometria',
    description: 'Domine as técnicas de medidas antropométricas e sua interpretação clínica',
    order: 3,
    isLocked: true,
    icon: '📏',
    estimatedTime: 150,
    content: [
      {
        id: 'content-3-1',
        type: 'text',
        title: 'Peso e Altura: Técnicas Corretas',
        content: `
          **Aferição do Peso:**
          - Balança calibrada e em superfície plana
          - Paciente com roupas leves, sem sapatos
          - Posição ereta, peso distribuído igualmente
          - Realizar 2 medidas e calcular média se diferença > 100g
          
          **Aferição da Altura:**
          - Estadiômetro fixo ou portátil calibrado
          - Paciente descalço, calcanhares unidos
          - Cabeça no plano de Frankfurt
          - Inspiração profunda no momento da medida
          
          **Erros Comuns:**
          - Não remover adornos pesados
          - Postura incorreta
          - Equipamento descalibrado
          - Pressa na aferição
        `,
        order: 1
      },
      {
        id: 'content-3-2',
        type: 'text',
        title: 'Circunferências Corporais',
        content: `
          **Circunferência da Cintura:**
          - Ponto médio entre última costela e crista ilíaca
          - Fita métrica paralela ao solo
          - Final da expiração normal
          - Pontos de corte brasileiros (IDF):
            - Homens: > 90 cm (risco aumentado)
            - Mulheres: > 80 cm (risco aumentado)
          
          **Circunferência do Braço:**
          - Ponto médio entre acrômio e olécrano
          - Braço relaxado ao lado do corpo
          - Importante para avaliação de massa muscular
          
          **Circunferência do Pescoço:**
          - Abaixo da proeminência laríngea
          - Correlação com apneia do sono e risco cardiovascular
        `,
        order: 2
      },
      {
        id: 'content-3-3',
        type: 'interactive',
        title: 'Simulador 3D de Pontos Anatômicos',
        content: 'interactive-3d-anatomical-points',
        order: 3
      },
      {
        id: 'content-3-4',
        type: 'text',
        title: 'Dobras Cutâneas',
        content: `
          **Principais Dobras:**
          1. Tricipital: face posterior do braço
          2. Bicipital: face anterior do braço
          3. Subescapular: abaixo da escápula
          4. Suprailíaca: acima da crista ilíaca
          
          **Técnica Correta:**
          - Adipômetro calibrado (pressão 10g/mm²)
          - Pinçar a pele 1cm acima do ponto
          - Leitura após 2-3 segundos
          - 3 medidas por ponto (média)
          - Lado direito do corpo
          
          **Equações de Predição:**
          - Durnin & Womersley (4 dobras)
          - Jackson & Pollock (3 ou 7 dobras)
          - Específicas para população brasileira
        `,
        order: 4
      }
    ],
    exercises: [
      {
        id: 'exercise-3-1',
        type: 'interactive',
        title: 'Identificação de Pontos Anatômicos',
        description: 'Use o modelo 3D para identificar os pontos corretos de medição',
        points: 150,
        difficulty: 'medium',
        order: 1
      },
      {
        id: 'exercise-3-2',
        type: 'calculation',
        title: 'Cálculo e Classificação de IMC',
        description: 'Calcule o IMC usando dados reais da POF 2024 e classifique segundo critérios brasileiros',
        points: 100,
        difficulty: 'easy',
        order: 2
      },
      {
        id: 'exercise-3-3',
        type: 'quiz',
        title: 'Identificação de Erros Técnicos',
        description: 'Assista vídeos e identifique erros nas técnicas de medição',
        points: 180,
        difficulty: 'hard',
        order: 3,
        questions: [
          {
            id: 'q-3-3-1',
            text: 'Segundo a POF 2024, qual o IMC médio da população adulta brasileira?',
            type: 'multiple-choice',
            options: [
              '25,3 kg/m²',
              '26,8 kg/m²',
              '27,5 kg/m²',
              '28,2 kg/m²'
            ],
            correctAnswer: '27,5 kg/m²',
            explanation: 'A POF 2024 mostrou que o IMC médio dos adultos brasileiros é 27,5 kg/m², indicando sobrepeso populacional.',
            realDataContext: 'Dados da Pesquisa de Orçamentos Familiares (POF) 2024 - IBGE'
          }
        ]
      },
      {
        id: 'exercise-3-4',
        type: 'collaborative',
        title: 'Prática de Medidas Antropométricas',
        description: 'Trabalhe em dupla para praticar medições e identificar possíveis erros',
        points: 250,
        difficulty: 'medium',
        order: 4
      },
      {
        id: 'exercise-3-5',
        type: 'case-study',
        title: 'Caso Clínico com Dados POF 2024',
        description: 'Caso clínico baseado em dados reais da população brasileira',
        points: 300,
        difficulty: 'hard',
        order: 5
      }
    ],
    realDataSources: [
      {
        name: 'POF 2024 - Antropometria',
        source: 'IBGE',
        year: 2024,
        description: 'Dados antropométricos da população brasileira',
        dataPoints: [
          {
            label: 'IMC médio - Homens',
            value: 27.8,
            unit: 'kg/m²'
          },
          {
            label: 'IMC médio - Mulheres',
            value: 27.2,
            unit: 'kg/m²'
          },
          {
            label: 'Circunferência cintura média - Homens',
            value: 95.3,
            unit: 'cm'
          },
          {
            label: 'Circunferência cintura média - Mulheres',
            value: 88.7,
            unit: 'cm'
          }
        ]
      }
    ]
  },
  {
    id: 'module-4',
    title: 'Integração de Dados e Diagnóstico Nutricional',
    description: 'Integre todos os dados coletados para formular diagnósticos nutricionais precisos',
    order: 4,
    isLocked: true,
    icon: '🎯',
    estimatedTime: 180,
    content: [
      {
        id: 'content-4-1',
        type: 'text',
        title: 'Integração de Dados Antropométricos',
        content: `
          **Índices Compostos:**
          
          **IMC (Índice de Massa Corporal):**
          - Fórmula: Peso (kg) / Altura² (m)
          - Classificação OMS e pontos de corte brasileiros
          - Limitações: não diferencia massa magra de gorda
          
          **RCQ (Relação Cintura-Quadril):**
          - Fórmula: Circunferência Cintura / Circunferência Quadril
          - Indicador de distribuição de gordura
          - Risco cardiovascular quando:
            - Homens > 0,90
            - Mulheres > 0,85
          
          **% Gordura Corporal:**
          - Calculado por equações de dobras cutâneas
          - Bioimpedância ou DEXA quando disponível
          - Classificação específica por idade e sexo
        `,
        order: 1
      },
      {
        id: 'content-4-2',
        type: 'text',
        title: 'Interpretação Conjunta de Medidas',
        content: `
          **Análise Integrada:**
          
          1. **Avaliação do Estado Nutricional:**
             - Combinar IMC + Circunferência da Cintura
             - Adicionar % gordura quando disponível
             - Considerar massa muscular (circunferência do braço)
          
          2. **Identificação de Riscos:**
             - Risco cardiovascular (cintura + RCQ)
             - Sarcopenia (massa muscular + força)
             - Síndrome metabólica (múltiplos indicadores)
          
          3. **Contextualização Clínica:**
             - História clínica e alimentar
             - Exames laboratoriais
             - Fatores socioeconômicos
             - Dados populacionais de referência
        `,
        order: 2
      },
      {
        id: 'content-4-3',
        type: 'text',
        title: 'Casos Clínicos Reais',
        content: `
          **Exemplo de Caso Complexo (HC-UNICAMP):**
          
          Paciente H.S.C., 36 anos, feminino
          - Peso atual: 42 kg
          - Altura: 1,62 m
          - IMC: 16,0 kg/m² (Desnutrição grave)
          - Perda ponderal: 12 kg em 6 meses (22% do peso)
          - Contexto: conflitos familiares, restrição alimentar voluntária
          - Amenorreia há 3 meses
          
          **Diagnóstico Nutricional Integrado:**
          - Desnutrição grave (IMC < 16)
          - Perda ponderal significativa e rápida
          - Possível transtorno alimentar
          - Necessidade de abordagem multidisciplinar
        `,
        order: 3
      },
      {
        id: 'content-4-4',
        type: 'interactive',
        title: 'Calculadora de Diagnóstico Integrado',
        content: 'interactive-integrated-calculator',
        order: 4
      }
    ],
    exercises: [
      {
        id: 'exercise-4-1',
        type: 'collaborative',
        title: 'Caso Clínico Colaborativo',
        description: 'Trabalhe em dupla para resolver um caso clínico complexo do HC-UNICAMP',
        points: 300,
        difficulty: 'hard',
        order: 1,
        caseData: {
          id: 'case-4-1',
          patientProfile: {
            age: 55,
            gender: 'M',
            occupation: 'Aposentado',
            location: 'Campinas, SP',
            socioeconomicLevel: 'Classe D'
          },
          clinicalHistory: 'Paciente tabagista (40 maços/ano), com disfagia para sólidos há 5 meses. Perda de 6 kg no período.',
          anthropometricData: {
            weight: 54,
            height: 160
          },
          tasks: [
            {
              id: 'task-4-1',
              question: 'Calcule o IMC e classifique o estado nutricional atual',
              type: 'calculation',
              requiredFields: ['bmi', 'classification'],
              points: 100
            },
            {
              id: 'task-4-2',
              question: 'Qual o percentual de perda de peso e sua significância clínica?',
              type: 'interpretation',
              requiredFields: ['weightLossPercentage', 'clinicalSignificance'],
              points: 100
            },
            {
              id: 'task-4-3',
              question: 'Elabore o diagnóstico nutricional integrado e plano de intervenção',
              type: 'diagnosis',
              requiredFields: ['diagnosis', 'interventionPlan'],
              points: 100
            }
          ]
        }
      },
      {
        id: 'exercise-4-2',
        type: 'calculation',
        title: 'Calculadora Integrada',
        description: 'Use a calculadora para inserir dados e obter diagnóstico nutricional completo',
        points: 150,
        difficulty: 'medium',
        order: 2
      },
      {
        id: 'exercise-4-3',
        type: 'interactive',
        title: 'Árvore de Decisão Diagnóstica',
        description: 'Navegue pela árvore de decisão para chegar ao diagnóstico correto',
        points: 200,
        difficulty: 'medium',
        order: 3
      },
      {
        id: 'exercise-4-4',
        type: 'case-study',
        title: 'Geração de Laudo Nutricional',
        description: 'Pratique a elaboração de um laudo nutricional completo e profissional',
        points: 250,
        difficulty: 'hard',
        order: 4
      },
      {
        id: 'exercise-4-5',
        type: 'brazilian-data',
        title: 'Análise Integrada de Dados SISVAN-DataSUS',
        description: 'Integração de dados do SISVAN com DataSUS para diagnóstico populacional',
        points: 250,
        difficulty: 'medium',
        order: 5
      },
      {
        id: 'exercise-4-6',
        type: 'case-study',
        title: 'Diagnóstico Nutricional com Dados POF 2024',
        description: 'Caso clínico integrando dados antropométricos, bioquímicos e socioeconômicos',
        points: 400,
        difficulty: 'hard',
        order: 6
      }
    ],
    realDataSources: [
      {
        name: 'SISVAN - Diagnósticos Nutricionais',
        source: 'SISVAN',
        year: 2024,
        description: 'Distribuição de diagnósticos nutricionais no Brasil',
        dataPoints: [
          {
            label: 'Eutrofia',
            value: 43.2,
            unit: '%',
            ageGroup: 'Adultos'
          },
          {
            label: 'Sobrepeso',
            value: 28.3,
            unit: '%',
            ageGroup: 'Adultos'
          },
          {
            label: 'Obesidade',
            value: 24.1,
            unit: '%',
            ageGroup: 'Adultos'
          },
          {
            label: 'Desnutrição',
            value: 4.4,
            unit: '%',
            ageGroup: 'Adultos'
          }
        ]
      },
      {
        name: 'HC-UNICAMP - Casos Clínicos',
        source: 'DataSUS',
        year: 2023,
        description: 'Estatísticas de atendimentos nutricionais',
        dataPoints: [
          {
            label: 'Casos de desnutrição grave',
            value: 127,
            unit: 'casos/ano'
          },
          {
            label: 'Transtornos alimentares',
            value: 89,
            unit: 'casos/ano'
          },
          {
            label: 'Obesidade mórbida',
            value: 342,
            unit: 'casos/ano'
          }
        ]
      }
    ]
  }
];

// Função para obter módulo por ID
export function getModuleById(id: string): Module | undefined {
  return modules.find(module => module.id === id);
}

// Função para obter módulos desbloqueados
export function getUnlockedModules(): Module[] {
  return modules.filter(module => !module.isLocked);
}

// Função para calcular progresso total
export function calculateTotalProgress(completedModules: string[]): number {
  const totalModules = modules.length;
  const completed = completedModules.length;
  return Math.round((completed / totalModules) * 100);
}