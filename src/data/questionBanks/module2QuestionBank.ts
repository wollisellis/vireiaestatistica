// Banco de questões do Módulo 2: Métodos de Avaliação da Composição Corporal
// 7 métodos → 4 sorteados aleatoriamente = 30 pontos total

import { QuestionBank } from '@/types/randomizedQuiz';

export interface DragDropMethod {
  id: string;
  name: string;
  description: string;
  category: 'imaging' | 'electrical' | 'dilution'; // categorias para validação
  characteristics: string[];
  advantages: string[];
  limitations: string[];
  cost: 'low' | 'medium' | 'high' | 'very-high';
  radiation: boolean;
  accessibility: 'hospital' | 'clinic' | 'gym' | 'research';
}

// Banco completo de métodos de avaliação
export const bodyCompositionMethods: DragDropMethod[] = [
  {
    id: 'dexa',
    name: 'DEXA',
    description: 'Absorptiômetro de dupla energia de raios X; padrão‑ouro para estimar massa óssea, gordura e massa magra com dose muito baixa de radiação.',
    category: 'imaging',
    characteristics: [
      'Usa raios X de dupla energia',
      'Diferencia 3 compartimentos: osso, gordura e massa magra',
      'Exame rápido (10-20 minutos)',
      'Paciente fica deitado e imóvel'
    ],
    advantages: [
      'Padrão-ouro para composição corporal',
      'Baixa dose de radiação',
      'Alta precisão e reprodutibilidade',
      'Avalia densidade óssea simultaneamente'
    ],
    limitations: [
      'Custo elevado do equipamento',
      'Não diferencia gordura visceral de subcutânea',
      'Limitações em obesos mórbidos',
      'Requer operador treinado'
    ],
    cost: 'high',
    radiation: true,
    accessibility: 'hospital'
  },
  {
    id: 'ultrasound',
    name: 'Ultrassom',
    description: 'Imagem que usa ondas sonoras de alta frequência para diferenciar tecidos e medir espessura de gordura subcutânea, sem radiação ionizante.',
    category: 'imaging',
    characteristics: [
      'Ondas sonoras de alta frequência',
      'Visualização em tempo real',
      'Portátil e não invasivo',
      'Mede espessura de gordura subcutânea'
    ],
    advantages: [
      'Sem radiação ionizante',
      'Relativamente barato',
      'Equipamento portátil disponível',
      'Pode avaliar músculo e gordura'
    ],
    limitations: [
      'Operador-dependente',
      'Difícil em obesos',
      'Não avalia gordura visceral profunda',
      'Variabilidade entre equipamentos'
    ],
    cost: 'medium',
    radiation: false,
    accessibility: 'clinic'
  },
  {
    id: 'ct',
    name: 'Tomografia (CT)',
    description: 'Tomografia computadorizada em cortes transversais por raios X; quantifica gordura visceral e subcutânea com alta precisão, sendo o método mais estabelecido para gordura abdominal (exige radiação).',
    category: 'imaging',
    characteristics: [
      'Múltiplos cortes transversais',
      'Usa radiação ionizante',
      'Diferencia gordura visceral e subcutânea',
      'Alta resolução de imagem'
    ],
    advantages: [
      'Excelente para gordura visceral',
      'Alta precisão e detalhamento',
      'Método estabelecido e validado',
      'Quantificação precisa de áreas'
    ],
    limitations: [
      'Alta dose de radiação',
      'Custo muito elevado',
      'Não adequado para rotina',
      'Requer ambiente hospitalar'
    ],
    cost: 'very-high',
    radiation: true,
    accessibility: 'hospital'
  },
  {
    id: 'mri',
    name: 'Ressonância Magnética (MRI)',
    description: 'Usa campos magnéticos e contraste água‑gordura para avaliar gordura subcutânea, visceral e massa muscular com excelente resolução de tecidos moles e sem radiação ionizante.',
    category: 'imaging',
    characteristics: [
      'Campos magnéticos potentes',
      'Contraste água-gordura',
      'Múltiplos planos de imagem',
      'Sem radiação ionizante'
    ],
    advantages: [
      'Sem radiação ionizante',
      'Excelente contraste de tecidos',
      'Avalia múltiplos compartimentos',
      'Imagens tridimensionais'
    ],
    limitations: [
      'Custo extremamente alto',
      'Exame demorado (30-60 min)',
      'Claustrofobia em alguns pacientes',
      'Contraindicado com marcapasso'
    ],
    cost: 'very-high',
    radiation: false,
    accessibility: 'hospital'
  },
  {
    id: 'hydrodensitometry',
    name: 'Hidrodensitometria',
    description: 'Pesagem submersa: aplica o princípio de Arquimedes para calcular densidade corporal total e derivar percentual de gordura.',
    category: 'dilution',
    characteristics: [
      'Pesagem dentro e fora da água',
      'Princípio de Arquimedes',
      'Requer submersão completa',
      'Mede densidade corporal total'
    ],
    advantages: [
      'Método validado há décadas',
      'Boa precisão quando bem executado',
      'Custo relativamente baixo',
      'Não usa radiação'
    ],
    limitations: [
      'Desconfortável para muitos',
      'Requer cooperação total',
      'Não adequado para idosos/crianças',
      'Assume densidade constante de tecidos'
    ],
    cost: 'medium',
    radiation: false,
    accessibility: 'research'
  },
  {
    id: 'labeled-water',
    name: 'Água marcada (²H ou ³H)',
    description: 'Diluição de água duplamente marcada com deutério/trítio para medir água corporal total (e gasto energético) com alta exatidão em humanos.',
    category: 'dilution',
    characteristics: [
      'Ingestão de água marcada',
      'Coleta de urina/saliva',
      'Análise por espectrometria',
      'Mede água corporal total'
    ],
    advantages: [
      'Padrão-ouro para água corporal',
      'Não invasivo após ingestão',
      'Pode medir gasto energético',
      'Adequado para campo'
    ],
    limitations: [
      'Custo muito elevado do isótopo',
      'Análise laboratorial complexa',
      'Demora dias para resultado',
      'Assume hidratação constante'
    ],
    cost: 'very-high',
    radiation: false,
    accessibility: 'research'
  },
  {
    id: 'bioimpedance',
    name: 'Bioimpedância',
    description: 'Estima água corporal total, massa livre de gordura e percentual de gordura a partir da impedância elétrica (resistência + reatância) gerada por uma corrente suave.',
    category: 'electrical',
    characteristics: [
      'Corrente elétrica de baixa intensidade',
      'Mede resistência e reatância',
      'Rápido e não invasivo',
      'Equações preditivas'
    ],
    advantages: [
      'Baixo custo e portátil',
      'Rápido e prático',
      'Não invasivo e seguro',
      'Disponível em academias'
    ],
    limitations: [
      'Afetado por hidratação',
      'Equações população-específicas',
      'Menos preciso em extremos',
      'Variação entre equipamentos'
    ],
    cost: 'low',
    radiation: false,
    accessibility: 'gym'
  }
];

// Configuração do banco de questões drag-and-drop
export const module2QuestionBank: QuestionBank = {
  id: 'bank-module-2',
  moduleId: 'module-2',
  title: 'Métodos de Avaliação da Composição Corporal',
  totalQuestions: 7, // Total de métodos disponíveis
  questionsPerQuiz: 4, // Quantos métodos aparecem por vez
  totalPoints: 30, // Pontuação total do módulo
  passingScore: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Para drag-and-drop, as "questões" são os métodos que serão sorteados
  questions: bodyCompositionMethods.map(method => ({
    id: method.id,
    text: method.name,
    options: [], // Não usado em drag-drop
    correctAnswer: method.category, // Categoria correta para validação
    explanation: method.description,
    feedback: `${method.name} é um método de ${
      method.category === 'imaging' ? 'imagem' : 
      method.category === 'electrical' ? 'impedância elétrica' : 
      'diluição'
    } usado para avaliação da composição corporal.`,
    difficulty: method.cost === 'low' ? 'easy' : method.cost === 'medium' ? 'medium' : 'hard',
    category: 'metodos-avaliacao',
    timeToAnswer: 90, // Mais tempo para drag-drop
    methodData: method // Dados completos do método para o componente
  }))
};

// Função helper para obter métodos aleatórios
export function getRandomMethods(count: number = 4): DragDropMethod[] {
  const shuffled = [...bodyCompositionMethods].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Categorias para as zonas de drop
export const methodCategories = {
  imaging: {
    id: 'imaging',
    title: 'Métodos de Imagem',
    description: 'Técnicas que produzem imagens do corpo',
    color: 'bg-blue-100 border-blue-300',
    acceptedMethods: ['dexa', 'ultrasound', 'ct', 'mri']
  },
  electrical: {
    id: 'electrical',
    title: 'Bioimpedância Elétrica',
    description: 'Usa propriedades elétricas do corpo',
    color: 'bg-yellow-100 border-yellow-300',
    acceptedMethods: ['bioimpedance']
  },
  dilution: {
    id: 'dilution',
    title: 'Métodos de Diluição',
    description: 'Baseados em princípios físicos ou químicos',
    color: 'bg-green-100 border-green-300',
    acceptedMethods: ['hydrodensitometry', 'labeled-water']
  }
};