import { Module } from '@/types/modules';

export const modules: Module[] = [
  {
    id: 'module-1',
    title: '1. Introdução à Avaliação Nutricional',
    description: 'Fundamentos da avaliação nutricional e sua importância na prática clínica',
    order: 1,
    isLocked: false,
    icon: '📊',
    estimatedTime: '10-15 minutos',
    maxPoints: 70,
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
    title: '2. Métodos de Avaliação Nutricional',
    description: 'Aprenda sobre os diferentes métodos de avaliação corporal através de atividades interativas',
    order: 2,
    isLocked: true,
    icon: '🔬',
    estimatedTime: '3-5 minutos',
    maxPoints: 30,
    content: [
      {
        id: 'content-2-1',
        type: 'text',
        title: 'Introdução aos Métodos de Avaliação',
        content: `
          A avaliação da composição corporal é fundamental para o diagnóstico nutricional completo. 
          Existem diversos métodos disponíveis, desde os mais simples e acessíveis até os considerados 
          padrão-ouro na área.

          **Objetivos deste módulo:**
          - Conhecer os principais métodos de avaliação corporal
          - Entender as características de cada método
          - Identificar vantagens e limitações
          - Saber quando aplicar cada método na prática clínica
        `,
        order: 1
      },
      {
        id: 'content-2-2',
        type: 'text',
        title: 'Categorias de Métodos',
        content: `
          **Métodos de Imagem (Padrão-Ouro):**
          - DEXA, Tomografia, Ressonância Magnética
          - Alta precisão, mas custo elevado
          
          **Métodos Duplamente Indiretos:**
          - Bioimpedância, Hidrodensitometria
          - Boa relação custo-benefício
          
          **Métodos de Diluição:**
          - Água marcada (deutério/trítio)
          - Precisão para água corporal total
        `,
        order: 2
      }
    ],
    exercises: [
      {
        id: 'exercise-2-1',
        type: 'drag-drop',
        title: 'Classificação de Métodos de Avaliação',
        description: 'Arraste cada método de avaliação para suas características correspondentes',
        points: 30,
        difficulty: 'medium',
        order: 1
      }
    ],
    realDataSources: [
      {
        name: 'Métodos de Avaliação Corporal',
        source: 'Literatura Científica',
        year: 2024,
        description: 'Características dos principais métodos de avaliação',
        dataPoints: [
          {
            label: 'Métodos disponíveis',
            value: 7,
            unit: 'tipos'
          },
          {
            label: 'Questões por tentativa',
            value: 4,
            unit: 'métodos'
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