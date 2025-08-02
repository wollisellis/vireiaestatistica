// Banco de dados do Módulo 3: Medidas Antropométricas
// 6 pontos anatômicos para circunferências corporais

export interface AnatomicalPoint {
  id: string;
  name: string;
  description: string;
  position: {
    x: number; // Percentual da largura do SVG (0-100)
    y: number; // Percentual da altura do SVG (0-100)
  };
  tolerance: number; // Raio de tolerância em pixels
  correctLocation: string;
  commonErrors: string[];
  clinicalImportance: string;
  measurementTechnique: string;
}

// Pontos anatômicos para medição de circunferências
export const anatomicalPoints: AnatomicalPoint[] = [
  {
    id: 'waist',
    name: 'Cintura',
    description: 'Circunferência da cintura',
    position: { x: 50, y: 45 }, // Centro do tronco
    tolerance: 30,
    correctLocation: 'Ponto médio entre a última costela e a crista ilíaca, geralmente na altura do umbigo',
    commonErrors: [
      'Medir muito abaixo, na altura do quadril',
      'Medir muito acima, no tórax',
      'Não identificar corretamente a crista ilíaca'
    ],
    clinicalImportance: 'Principal indicador de gordura abdominal e risco cardiovascular. Valores >94cm em homens e >80cm em mulheres indicam risco aumentado.',
    measurementTechnique: 'Fita métrica paralela ao solo, no final da expiração normal, sem comprimir a pele.'
  },
  {
    id: 'hip',
    name: 'Quadril',
    description: 'Circunferência do quadril',
    position: { x: 50, y: 58 }, // Parte mais larga do quadril
    tolerance: 30,
    correctLocation: 'Maior proeminência dos glúteos, passando pela sínfise púbica',
    commonErrors: [
      'Medir muito alto, confundindo com a cintura',
      'Não encontrar o ponto de maior circunferência',
      'Inclinar a fita métrica'
    ],
    clinicalImportance: 'Usado para calcular a relação cintura/quadril (RCQ), importante indicador de distribuição de gordura corporal.',
    measurementTechnique: 'Paciente com pés juntos, fita no plano horizontal passando pela maior proeminência glútea.'
  },
  {
    id: 'arm',
    name: 'Braço',
    description: 'Circunferência do braço',
    position: { x: 30, y: 35 }, // Braço esquerdo, meio do bíceps
    tolerance: 25,
    correctLocation: 'Ponto médio entre o acrômio (ombro) e o olécrano (cotovelo), com o braço relaxado',
    commonErrors: [
      'Medir com o braço flexionado',
      'Não identificar corretamente o ponto médio',
      'Medir muito próximo ao ombro ou cotovelo'
    ],
    clinicalImportance: 'Avalia reserva de massa muscular e estado nutricional. Valores reduzidos podem indicar desnutrição.',
    measurementTechnique: 'Braço relaxado ao lado do corpo, fita perpendicular ao eixo do braço.'
  },
  {
    id: 'calf',
    name: 'Panturrilha',
    description: 'Circunferência da panturrilha',
    position: { x: 45, y: 82 }, // Meio da panturrilha
    tolerance: 25,
    correctLocation: 'Maior circunferência da panturrilha, geralmente no terço superior',
    commonErrors: [
      'Medir muito baixo, próximo ao tornozelo',
      'Não encontrar o ponto de maior volume',
      'Medir com o músculo contraído'
    ],
    clinicalImportance: 'Importante indicador de desnutrição em idosos. Valores <31cm sugerem redução de massa muscular.',
    measurementTechnique: 'Paciente sentado com perna pendente em 90°, ou em pé com peso distribuído igualmente.'
  },
  {
    id: 'shoulder',
    name: 'Ombro',
    description: 'Circunferência do ombro',
    position: { x: 50, y: 25 }, // Linha dos ombros
    tolerance: 30,
    correctLocation: 'Passando pelos deltoides, axilas e parte superior do tórax',
    commonErrors: [
      'Posicionar a fita muito alta (pescoço) ou muito baixa (tórax)',
      'Não manter a fita horizontal',
      'Apertar demais a fita nas axilas'
    ],
    clinicalImportance: 'Avalia desenvolvimento da musculatura superior e pode indicar alterações posturais.',
    measurementTechnique: 'Braços relaxados ao lado do corpo, fita passando pela maior circunferência dos deltoides.'
  },
  {
    id: 'wrist',
    name: 'Pulso',
    description: 'Circunferência do pulso',
    position: { x: 22, y: 52 }, // Pulso esquerdo
    tolerance: 20,
    correctLocation: 'Logo abaixo dos processos estiloides do rádio e ulna',
    commonErrors: [
      'Medir sobre os ossos proeminentes',
      'Medir muito acima, no antebraço',
      'Comprimir demais os tecidos'
    ],
    clinicalImportance: 'Indica a compleição física (estrutura óssea). Usado para estimar o peso ideal e avaliar a estrutura corporal.',
    measurementTechnique: 'Mão relaxada, fita no ponto mais estreito do pulso, sem comprimir.'
  }
];

// Função para obter ponto por ID
export function getAnatomicalPointById(id: string): AnatomicalPoint | undefined {
  return anatomicalPoints.find(point => point.id === id);
}

// Função para calcular distância entre clique e ponto anatômico
export function calculateDistance(
  clickX: number, 
  clickY: number, 
  pointX: number, 
  pointY: number
): number {
  return Math.sqrt(Math.pow(clickX - pointX, 2) + Math.pow(clickY - pointY, 2));
}

// Função para verificar se o clique está dentro da tolerância
export function isClickWithinTolerance(
  clickX: number,
  clickY: number,
  point: AnatomicalPoint,
  svgWidth: number,
  svgHeight: number
): boolean {
  // Converter posições percentuais para pixels
  const pointPixelX = (point.position.x / 100) * svgWidth;
  const pointPixelY = (point.position.y / 100) * svgHeight;
  
  const distance = calculateDistance(clickX, clickY, pointPixelX, pointPixelY);
  return distance <= point.tolerance;
}

// Sistema de feedback educativo
export interface EducationalFeedback {
  pointId: string;
  attempts: number;
  correct: boolean;
  feedback: {
    title: string;
    message: string;
    tip?: string;
    correctLocation?: string;
  };
}

export function generateEducationalFeedback(
  point: AnatomicalPoint,
  attempts: number,
  correct: boolean
): EducationalFeedback {
  let feedback: EducationalFeedback['feedback'];

  if (correct) {
    if (attempts === 1) {
      feedback = {
        title: '✅ Excelente!',
        message: `Você identificou corretamente o ponto para medição da ${point.name.toLowerCase()}.`,
        tip: point.measurementTechnique
      };
    } else if (attempts === 2) {
      feedback = {
        title: '✅ Muito bem!',
        message: `Você encontrou o ponto correto na segunda tentativa.`,
        correctLocation: point.correctLocation,
        tip: `Lembre-se: ${point.clinicalImportance}`
      };
    } else {
      feedback = {
        title: '✅ Correto',
        message: `Você identificou o ponto após ${attempts} tentativas.`,
        correctLocation: point.correctLocation,
        tip: `Erros comuns a evitar: ${point.commonErrors[0]}`
      };
    }
  } else {
    feedback = {
      title: '❌ Localização Incorreta',
      message: `O ponto correto para ${point.name} é: ${point.correctLocation}`,
      tip: `Dica: ${point.commonErrors.join('; ')}`
    };
  }

  return {
    pointId: point.id,
    attempts,
    correct,
    feedback
  };
}

// Ordem recomendada para apresentação dos pontos
export const pointsOrder = ['waist', 'hip', 'arm', 'calf', 'shoulder', 'wrist'];

// Configurações do módulo
export const module3Config = {
  totalPoints: 50,
  pointsPerCorrectAnswer: {
    firstAttempt: 10,
    secondAttempt: 5,
    thirdAttempt: 0
  },
  maxAttempts: 3,
  showFeedbackAfterEachPoint: false, // Feedback apenas no final
  requireConfidenceAssessment: true
};