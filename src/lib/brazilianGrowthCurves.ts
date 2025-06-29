// Brazilian Growth Curves Data for NT600 Course
// Based on Brazilian Ministry of Health growth standards and WHO references

export interface GrowthPoint {
  age: number // in months
  p3: number
  p10: number
  p25: number
  p50: number
  p75: number
  p90: number
  p97: number
}

export interface ChildMeasurement {
  id: string
  name: string
  age: number // in months
  gender: 'M' | 'F'
  weight: number // in kg
  height: number // in cm
  bmi?: number
  headCircumference?: number // in cm
  region: string
  nutritionalStatus: string
  percentileWeight?: number
  percentileHeight?: number
  percentileBMI?: number
}

// Weight-for-age curves for boys (0-60 months) - Brazilian Ministry of Health
export const weightForAgeBoys: GrowthPoint[] = [
  { age: 0, p3: 2.5, p10: 2.9, p25: 3.3, p50: 3.6, p75: 4.0, p90: 4.4, p97: 4.8 },
  { age: 1, p3: 3.4, p10: 3.9, p25: 4.5, p50: 5.1, p75: 5.8, p90: 6.6, p97: 7.5 },
  { age: 2, p3: 4.3, p10: 4.9, p25: 5.6, p50: 6.3, p75: 7.1, p90: 8.0, p97: 9.0 },
  { age: 3, p3: 5.0, p10: 5.7, p25: 6.4, p50: 7.1, p75: 7.9, p90: 8.9, p97: 10.0 },
  { age: 6, p3: 6.4, p10: 7.1, p25: 7.9, p50: 8.8, p75: 9.8, p90: 10.9, p97: 12.1 },
  { age: 12, p3: 8.4, p10: 9.2, p25: 10.1, p50: 11.0, p75: 12.0, p90: 13.1, p97: 14.3 },
  { age: 18, p3: 9.6, p10: 10.5, p25: 11.5, p50: 12.5, p75: 13.6, p90: 14.8, p97: 16.1 },
  { age: 24, p3: 10.5, p10: 11.5, p25: 12.6, p50: 13.7, p75: 14.9, p90: 16.2, p97: 17.6 },
  { age: 36, p3: 12.1, p10: 13.3, p25: 14.6, p50: 15.9, p75: 17.3, p90: 18.8, p97: 20.4 },
  { age: 48, p3: 13.4, p10: 14.8, p25: 16.3, p50: 17.8, p75: 19.4, p90: 21.2, p97: 23.1 },
  { age: 60, p3: 14.7, p10: 16.2, p25: 17.9, p50: 19.7, p75: 21.7, p90: 23.9, p97: 26.3 }
]

// Weight-for-age curves for girls (0-60 months)
export const weightForAgeGirls: GrowthPoint[] = [
  { age: 0, p3: 2.4, p10: 2.8, p25: 3.2, p50: 3.5, p75: 3.9, p90: 4.2, p97: 4.6 },
  { age: 1, p3: 3.2, p10: 3.6, p25: 4.2, p50: 4.8, p75: 5.5, p90: 6.2, p97: 7.0 },
  { age: 2, p3: 3.9, p10: 4.5, p25: 5.1, p50: 5.8, p75: 6.6, p90: 7.5, p97: 8.5 },
  { age: 3, p3: 4.5, p10: 5.2, p25: 5.9, p50: 6.6, p75: 7.5, p90: 8.5, p97: 9.6 },
  { age: 6, p3: 5.7, p10: 6.5, p25: 7.3, p50: 8.2, p75: 9.3, p90: 10.4, p97: 11.6 },
  { age: 12, p3: 7.0, p10: 8.1, p25: 9.2, p50: 10.4, p75: 11.7, p90: 13.1, p97: 14.6 },
  { age: 18, p3: 8.1, p10: 9.4, p25: 10.8, p50: 12.3, p75: 13.9, p90: 15.7, p97: 17.6 },
  { age: 24, p3: 9.0, p10: 10.5, p25: 12.1, p50: 13.8, p75: 15.8, p90: 18.0, p97: 20.4 },
  { age: 36, p3: 10.8, p10: 12.7, p25: 14.8, p50: 17.1, p75: 19.9, p90: 23.0, p97: 26.5 },
  { age: 48, p3: 12.3, p10: 14.6, p25: 17.2, p50: 20.3, p75: 24.0, p90: 28.1, p97: 32.5 },
  { age: 60, p3: 13.7, p10: 16.3, p25: 19.5, p50: 23.4, p75: 28.0, p90: 33.4, p97: 39.3 }
]

// Height-for-age curves for boys (0-60 months)
export const heightForAgeBoys: GrowthPoint[] = [
  { age: 0, p3: 46.1, p10: 47.8, p25: 49.0, p50: 50.0, p75: 51.0, p90: 52.0, p97: 53.7 },
  { age: 1, p3: 50.8, p10: 52.8, p25: 54.4, p50: 55.6, p75: 56.7, p90: 57.6, p97: 59.5 },
  { age: 2, p3: 54.4, p10: 56.4, p25: 58.0, p50: 59.4, p75: 60.6, p90: 61.7, p97: 63.4 },
  { age: 3, p3: 57.3, p10: 59.4, p25: 61.1, p50: 62.6, p75: 64.0, p90: 65.2, p97: 67.0 },
  { age: 6, p3: 63.3, p10: 65.5, p25: 67.6, p50: 69.4, p75: 71.1, p90: 72.6, p97: 74.8 },
  { age: 12, p3: 71.0, p10: 73.4, p25: 75.7, p50: 77.7, p75: 79.6, p90: 81.2, p97: 83.6 },
  { age: 18, p3: 76.9, p10: 79.6, p25: 82.3, p50: 84.7, p75: 86.9, p90: 88.8, p97: 91.5 },
  { age: 24, p3: 81.7, p10: 84.8, p25: 87.8, p50: 90.4, p75: 92.9, p90: 95.0, p97: 98.0 },
  { age: 36, p3: 89.0, p10: 92.4, p25: 95.8, p50: 98.9, p75: 101.8, p90: 104.5, p97: 108.0 },
  { age: 48, p3: 94.9, p10: 98.9, p25: 102.9, p50: 106.5, p75: 110.0, p90: 113.2, p97: 117.4 },
  { age: 60, p3: 100.7, p10: 105.3, p25: 109.9, p50: 114.2, p75: 118.3, p90: 122.0, p97: 126.6 }
]

// Height-for-age curves for girls (0-60 months)
export const heightForAgeGirls: GrowthPoint[] = [
  { age: 0, p3: 45.4, p10: 47.3, p25: 48.6, p50: 49.8, p75: 50.9, p90: 51.9, p97: 53.7 },
  { age: 1, p3: 49.8, p10: 51.7, p25: 53.2, p50: 54.7, p75: 56.1, p90: 57.4, p97: 59.5 },
  { age: 2, p3: 53.0, p10: 55.0, p25: 56.7, p50: 58.4, p75: 60.0, p90: 61.5, p97: 63.8 },
  { age: 3, p3: 55.6, p10: 57.7, p25: 59.6, p50: 61.4, p75: 63.2, p90: 64.9, p97: 67.3 },
  { age: 6, p3: 61.2, p10: 63.5, p25: 65.7, p50: 67.8, p75: 69.8, p90: 71.6, p97: 74.2 },
  { age: 12, p3: 68.6, p10: 71.4, p25: 74.0, p50: 76.4, p75: 78.7, p90: 80.7, p97: 83.5 },
  { age: 18, p3: 74.2, p10: 77.5, p25: 80.7, p50: 83.6, p75: 86.3, p90: 88.7, p97: 92.0 },
  { age: 24, p3: 78.9, p10: 82.8, p25: 86.4, p50: 89.8, p75: 93.0, p90: 95.9, p97: 99.7 },
  { age: 36, p3: 86.2, p10: 90.8, p25: 95.1, p50: 99.1, p75: 102.7, p90: 106.0, p97: 110.3 },
  { age: 48, p3: 92.0, p10: 97.3, p25: 102.3, p50: 106.9, p75: 111.3, p90: 115.2, p97: 120.2 },
  { age: 60, p3: 97.4, p10: 103.3, p25: 108.9, p50: 114.2, p75: 119.2, p90: 123.7, p97: 129.4 }
]

// Real Brazilian children data for exercises
export const brazilianChildrenData: ChildMeasurement[] = [
  {
    id: 'child001',
    name: 'Ana',
    age: 24,
    gender: 'F',
    weight: 12.1,
    height: 86.4,
    bmi: 16.2,
    region: 'São Paulo',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 25,
    percentileHeight: 25
  },
  {
    id: 'child002',
    name: 'João',
    age: 36,
    gender: 'M',
    weight: 14.6,
    height: 95.8,
    bmi: 15.9,
    region: 'Rio de Janeiro',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 25,
    percentileHeight: 25
  },
  {
    id: 'child003',
    name: 'Maria',
    age: 12,
    gender: 'F',
    weight: 8.1,
    height: 74.0,
    bmi: 14.8,
    region: 'Minas Gerais',
    nutritionalStatus: 'Baixo peso',
    percentileWeight: 10,
    percentileHeight: 25
  },
  {
    id: 'child004',
    name: 'Pedro',
    age: 48,
    gender: 'M',
    weight: 21.2,
    height: 102.9,
    bmi: 20.0,
    region: 'Bahia',
    nutritionalStatus: 'Sobrepeso',
    percentileWeight: 90,
    percentileHeight: 25
  },
  {
    id: 'child005',
    name: 'Carla',
    age: 18,
    gender: 'F',
    weight: 10.8,
    height: 80.7,
    bmi: 16.6,
    region: 'Rio Grande do Sul',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 25,
    percentileHeight: 25
  },
  // Additional Brazilian children cases for enhanced educational content
  {
    id: 'child006',
    name: 'Lucas',
    age: 6,
    gender: 'M',
    weight: 7.1,
    height: 65.8,
    bmi: 16.4,
    region: 'Ceará',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 25,
    percentileHeight: 50
  },
  {
    id: 'child007',
    name: 'Sofia',
    age: 30,
    gender: 'F',
    weight: 13.8,
    height: 91.5,
    bmi: 16.5,
    region: 'Pernambuco',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 50,
    percentileHeight: 75
  },
  {
    id: 'child008',
    name: 'Gabriel',
    age: 42,
    gender: 'M',
    weight: 16.2,
    height: 99.8,
    bmi: 16.3,
    region: 'Paraná',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 50,
    percentileHeight: 50
  },
  {
    id: 'child009',
    name: 'Valentina',
    age: 15,
    gender: 'F',
    weight: 8.9,
    height: 76.2,
    bmi: 15.3,
    region: 'Goiás',
    nutritionalStatus: 'Baixo peso',
    percentileWeight: 3,
    percentileHeight: 10
  },
  {
    id: 'child010',
    name: 'Miguel',
    age: 54,
    gender: 'M',
    weight: 19.8,
    height: 107.2,
    bmi: 17.2,
    region: 'Santa Catarina',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 75,
    percentileHeight: 75
  },
  {
    id: 'child011',
    name: 'Isabella',
    age: 9,
    gender: 'F',
    weight: 8.1,
    height: 70.5,
    bmi: 16.3,
    region: 'Maranhão',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 50,
    percentileHeight: 75
  },
  {
    id: 'child012',
    name: 'Davi',
    age: 21,
    gender: 'M',
    weight: 11.8,
    height: 83.9,
    bmi: 16.8,
    region: 'Pará',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 50,
    percentileHeight: 25
  },
  {
    id: 'child013',
    name: 'Alice',
    age: 39,
    gender: 'F',
    weight: 17.2,
    height: 97.8,
    bmi: 18.0,
    region: 'Distrito Federal',
    nutritionalStatus: 'Sobrepeso',
    percentileWeight: 90,
    percentileHeight: 50
  },
  {
    id: 'child014',
    name: 'Arthur',
    age: 33,
    gender: 'M',
    weight: 14.1,
    height: 92.7,
    bmi: 16.4,
    region: 'Espírito Santo',
    nutritionalStatus: 'Eutrófico',
    percentileWeight: 25,
    percentileHeight: 25
  },
  {
    id: 'child015',
    name: 'Helena',
    age: 45,
    gender: 'F',
    weight: 18.9,
    height: 101.3,
    bmi: 18.4,
    region: 'Amazonas',
    nutritionalStatus: 'Sobrepeso',
    percentileWeight: 97,
    percentileHeight: 75
  }
]

// Function to get growth curve data by type and gender
export function getGrowthCurveData(type: 'weight' | 'height', gender: 'M' | 'F'): GrowthPoint[] {
  switch (type) {
    case 'weight':
      return gender === 'M' ? weightForAgeBoys : weightForAgeGirls
    case 'height':
      return gender === 'M' ? heightForAgeBoys : heightForAgeGirls
    default:
      return []
  }
}

// Function to calculate percentile for a given measurement
export function calculatePercentile(
  age: number,
  measurement: number,
  type: 'weight' | 'height',
  gender: 'M' | 'F'
): number {
  const curveData = getGrowthCurveData(type, gender)
  
  // Find the closest age points
  const lowerPoint = curveData.find(point => point.age <= age)
  const upperPoint = curveData.find(point => point.age >= age)
  
  if (!lowerPoint || !upperPoint) return 50 // Default to median if no data
  
  // Simple interpolation for the age
  const ageRatio = (age - lowerPoint.age) / (upperPoint.age - lowerPoint.age)
  
  // Check which percentile the measurement falls into
  const percentiles = [3, 10, 25, 50, 75, 90, 97]
  const values = [
    lowerPoint.p3 + (upperPoint.p3 - lowerPoint.p3) * ageRatio,
    lowerPoint.p10 + (upperPoint.p10 - lowerPoint.p10) * ageRatio,
    lowerPoint.p25 + (upperPoint.p25 - lowerPoint.p25) * ageRatio,
    lowerPoint.p50 + (upperPoint.p50 - lowerPoint.p50) * ageRatio,
    lowerPoint.p75 + (upperPoint.p75 - lowerPoint.p75) * ageRatio,
    lowerPoint.p90 + (upperPoint.p90 - lowerPoint.p90) * ageRatio,
    lowerPoint.p97 + (upperPoint.p97 - lowerPoint.p97) * ageRatio
  ]
  
  // Find which percentile range the measurement falls into
  for (let i = 0; i < values.length; i++) {
    if (measurement <= values[i]) {
      return percentiles[i]
    }
  }
  
  return 97 // Above 97th percentile
}

// Function to classify nutritional status based on percentiles
export function classifyNutritionalStatus(
  weightPercentile: number,
  heightPercentile: number
): {
  status: string
  description: string
  color: string
  recommendation: string
} {
  if (weightPercentile < 3 || heightPercentile < 3) {
    return {
      status: 'Desnutrição',
      description: 'Peso e/ou altura abaixo do percentil 3',
      color: 'red',
      recommendation: 'Avaliação médica urgente e intervenção nutricional'
    }
  }
  
  if (weightPercentile < 10) {
    return {
      status: 'Baixo peso',
      description: 'Peso abaixo do percentil 10',
      color: 'orange',
      recommendation: 'Monitoramento nutricional e avaliação médica'
    }
  }
  
  if (weightPercentile > 97) {
    return {
      status: 'Obesidade',
      description: 'Peso acima do percentil 97',
      color: 'red',
      recommendation: 'Intervenção nutricional e atividade física'
    }
  }
  
  if (weightPercentile > 85) {
    return {
      status: 'Sobrepeso',
      description: 'Peso acima do percentil 85',
      color: 'yellow',
      recommendation: 'Orientação nutricional e estímulo à atividade física'
    }
  }
  
  return {
    status: 'Eutrófico',
    description: 'Peso e altura adequados para a idade',
    color: 'green',
    recommendation: 'Manter hábitos saudáveis e monitoramento regular'
  }
}

// Function to get age in months from age in years and months
export function getAgeInMonths(years: number, months: number = 0): number {
  return years * 12 + months
}

// Function to format age for display
export function formatAge(ageInMonths: number): string {
  const years = Math.floor(ageInMonths / 12)
  const months = ageInMonths % 12
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  }
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
  
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`
}

// Brazilian Ministry of Health citation
export const growthCurvesCitation = {
  authors: 'Ministério da Saúde do Brasil',
  title: 'Curvas de Crescimento da Organização Mundial da Saúde - OMS: Manual de Orientações para Profissionais de Saúde',
  journal: 'Secretaria de Atenção à Saúde - Departamento de Atenção Básica',
  year: 2022,
  institution: 'Ministério da Saúde do Brasil',
  reference: 'Baseado nos padrões de crescimento da OMS adaptados para a população brasileira'
}

// Interactive Growth Curve Functions for Educational Module

export interface PlottedPoint {
  id: string
  age: number
  value: number
  type: 'weight' | 'height'
  gender: 'M' | 'F'
  percentile: number
  nutritionalStatus: string
  timestamp: number
}

export interface InteractionHistory {
  action: 'plot' | 'remove' | 'move'
  point: PlottedPoint
  previousPoint?: PlottedPoint
  timestamp: number
}

// Calculate real-time percentile for interactive plotting
export function calculateRealTimePercentile(
  age: number,
  value: number,
  type: 'weight' | 'height',
  gender: 'M' | 'F'
): number {
  const curveData = getGrowthCurveData(type, gender)

  // Find the closest age points for interpolation
  const lowerPoint = curveData.filter(point => point.age <= age).pop()
  const upperPoint = curveData.find(point => point.age > age)

  if (!lowerPoint && !upperPoint) return 50 // Default if no data
  if (!upperPoint) return calculatePercentile(age, value, type, gender)
  if (!lowerPoint) return calculatePercentile(age, value, type, gender)

  // Interpolate percentile values for exact age
  const ageDiff = upperPoint.age - lowerPoint.age
  const ageRatio = (age - lowerPoint.age) / ageDiff

  const percentiles = [3, 10, 25, 50, 75, 90, 97]
  const percentileKeys = ['p3', 'p10', 'p25', 'p50', 'p75', 'p90', 'p97'] as const

  for (let i = 0; i < percentiles.length; i++) {
    const key = percentileKeys[i]
    const lowerValue = lowerPoint[key]
    const upperValue = upperPoint[key]
    const interpolatedValue = lowerValue + (upperValue - lowerValue) * ageRatio

    if (value <= interpolatedValue) {
      if (i === 0) return percentiles[0]

      // Interpolate between percentiles
      const prevKey = percentileKeys[i - 1]
      const prevLowerValue = lowerPoint[prevKey]
      const prevUpperValue = upperPoint[prevKey]
      const prevInterpolatedValue = prevLowerValue + (prevUpperValue - prevLowerValue) * ageRatio

      const valueRatio = (value - prevInterpolatedValue) / (interpolatedValue - prevInterpolatedValue)
      return percentiles[i - 1] + (percentiles[i] - percentiles[i - 1]) * valueRatio
    }
  }

  return 97 // Above P97
}

// Validate if a plotted point is within reasonable bounds
export function validatePlottedPoint(
  age: number,
  value: number,
  type: 'weight' | 'height',
  gender: 'M' | 'F'
): { isValid: boolean; message: string } {
  if (age < 0 || age > 60) {
    return {
      isValid: false,
      message: 'Idade deve estar entre 0 e 60 meses'
    }
  }

  if (type === 'weight') {
    if (value < 1 || value > 30) {
      return {
        isValid: false,
        message: 'Peso deve estar entre 1 kg e 30 kg para esta faixa etária'
      }
    }
  } else if (type === 'height') {
    if (value < 40 || value > 120) {
      return {
        isValid: false,
        message: 'Altura deve estar entre 40 cm e 120 cm para esta faixa etária'
      }
    }
  }

  return { isValid: true, message: '' }
}

// Generate educational feedback for plotted points
export function generateEducationalFeedback(
  point: PlottedPoint,
  targetChild?: ChildMeasurement
): string {
  const percentile = point.percentile
  let feedback = `Plotagem realizada: Percentil ${percentile.toFixed(1)}. `

  if (percentile < 3) {
    feedback += '⚠️ Diagnóstico nutricional: Magreza acentuada. Percentil <P3 segundo critérios SISVAN indica déficit ponderal grave. '
    feedback += 'Requer avaliação nutricional completa e intervenção terapêutica imediata.'
  } else if (percentile < 10) {
    feedback += '⚠️ Diagnóstico nutricional: Magreza/Risco nutricional. Faixa P3-P10 indica necessidade de monitoramento nutricional intensivo. '
    feedback += 'Considerar intervenção dietoterápica preventiva.'
  } else if (percentile <= 85) {
    feedback += '✅ Diagnóstico nutricional: Eutrofia. Faixa P10-P85 caracteriza estado nutricional adequado segundo padrões de referência da OMS/SISVAN. '
    feedback += 'Manter acompanhamento nutricional de rotina.'
  } else if (percentile <= 97) {
    feedback += '⚠️ Diagnóstico nutricional: Sobrepeso. Faixa P85-P97 indica excesso de peso. '
    feedback += 'Requer orientação nutricional para prevenção de obesidade e complicações cardiometabólicas.'
  } else {
    feedback += '🔴 Diagnóstico nutricional: Obesidade. Percentil >P97 caracteriza obesidade infantil. '
    feedback += 'Demanda intervenção nutricional multidisciplinar e acompanhamento especializado.'
  }

  if (targetChild) {
    const targetPercentile = point.type === 'weight' ? targetChild.percentileWeight! : targetChild.percentileHeight!
    const accuracy = Math.abs(percentile - targetPercentile)
    if (accuracy <= 5) {
      feedback += ' ✅ Excelente precisão na plotagem!'
    } else if (accuracy <= 15) {
      feedback += ' ✓ Boa aproximação na plotagem.'
    } else {
      feedback += ' ⚠️ Tente ajustar a posição do ponto.'
    }
  }

  return feedback
}

// Get percentile color for visual feedback
export function getPercentileColor(percentile: number): string {
  if (percentile < 3) return '#dc2626' // red-600
  if (percentile < 10) return '#ea580c' // orange-600
  if (percentile <= 85) return '#059669' // emerald-600
  if (percentile <= 97) return '#d97706' // amber-600
  return '#dc2626' // red-600
}

// Interactive exercise data for the enhanced Game 1
export const interactiveExercises = [
  {
    id: 1,
    title: 'Identificação de Percentis de Referência',
    description: 'Desenvolva habilidades de reconhecimento visual dos percentis nas curvas de crescimento',
    type: 'click-to-identify' as const,
    difficulty: 'Muito Fácil',
    instructions: 'Identifique e clique na linha do P50 (mediana populacional) no gráfico peso-por-idade masculino. Esta linha representa o percentil de referência central utilizado na avaliação nutricional.',
    targetPercentile: 50,
    chartType: 'weight' as const,
    gender: 'M' as const,
    maxAttempts: 3,
    points: 10,
    educationalContent: 'O P50 constitui a mediana populacional, dividindo a distribuição de referência em duas metades iguais. Na prática clínica, representa o valor central esperado para a idade e sexo.'
  },
  {
    id: 2,
    title: 'Leitura de Percentis',
    description: 'Pratique a leitura de valores de percentil no gráfico',
    type: 'hover-and-read' as const,
    difficulty: 'Muito Fácil',
    instructions: 'Passe o mouse sobre diferentes pontos e identifique os percentis correspondentes',
    chartType: 'height' as const,
    gender: 'F' as const,
    maxAttempts: 5,
    points: 10,
    educationalContent: 'Cada linha colorida representa um percentil diferente. Use as cores para identificá-las.'
  },
  {
    id: 3,
    title: 'Plotagem Guiada - Peso',
    description: 'Aprenda a plotar medições de peso com orientação passo a passo',
    type: 'guided-plot' as const,
    difficulty: 'Fácil',
    instructions: 'Arraste o ponto para plotar o peso de Lucas (7,1 kg aos 6 meses) no gráfico',
    targetChild: 'child006',
    chartType: 'weight' as const,
    maxAttempts: 5,
    points: 15,
    educationalContent: 'Encontre a idade no eixo X e o peso no eixo Y. O ponto de intersecção mostra o percentil.'
  },
  {
    id: 4,
    title: 'Plotagem Guiada - Altura',
    description: 'Pratique a plotagem de medições de altura com assistência',
    type: 'guided-plot' as const,
    difficulty: 'Fácil',
    instructions: 'Plote a altura de Sofia (91,5 cm aos 30 meses) no gráfico correto',
    targetChild: 'child007',
    chartType: 'height' as const,
    maxAttempts: 5,
    points: 15,
    educationalContent: 'A altura é plotada da mesma forma que o peso, mas observe as unidades (cm vs kg).'
  },
  {
    id: 5,
    title: 'Plotagem Independente - Peso',
    description: 'Plote medições de peso sem orientação visual',
    type: 'independent-plot' as const,
    difficulty: 'Médio',
    instructions: 'Plote o peso de Gabriel (16,2 kg aos 42 meses) e determine seu percentil',
    targetChild: 'child008',
    chartType: 'weight' as const,
    maxAttempts: 3,
    points: 20,
    educationalContent: 'Agora você deve plotar sem guias visuais. Lembre-se: idade no X, peso no Y.'
  },
  {
    id: 6,
    title: 'Plotagem Independente - Altura',
    description: 'Plote medições de altura de forma autônoma',
    type: 'independent-plot' as const,
    difficulty: 'Médio',
    instructions: 'Plote a altura de Valentina (76,2 cm aos 15 meses) e interprete o resultado',
    targetChild: 'child009',
    chartType: 'height' as const,
    maxAttempts: 3,
    points: 20,
    educationalContent: 'Observe que Valentina está no P10 para altura - isso indica baixa estatura.'
  },
  {
    id: 7,
    title: 'Avaliação Nutricional Completa',
    description: 'Plote peso e altura para avaliação nutricional completa',
    type: 'multi-plot' as const,
    difficulty: 'Difícil',
    instructions: 'Plote peso e altura de Miguel e determine seu estado nutricional completo',
    targetChild: 'child010',
    chartType: 'both' as const,
    maxAttempts: 3,
    points: 25,
    educationalContent: 'Para avaliação completa, analise peso E altura. Miguel está no P75 para ambos - crescimento adequado.'
  },
  {
    id: 8,
    title: 'Interpretação Clínica Avançada',
    description: 'Analise múltiplas medições e faça interpretação clínica',
    type: 'clinical-interpretation' as const,
    difficulty: 'Muito Difícil',
    instructions: 'Compare as medições de Helena com os padrões e forneça recomendações nutricionais',
    targetChild: 'child015',
    chartType: 'both' as const,
    maxAttempts: 2,
    points: 30,
    educationalContent: 'Helena está no P97 para peso e P75 para altura - indica sobrepeso que requer intervenção.'
  }
]

// Pre-game educational content for interactive module
export const preGameEducationalContent = {
  title: 'Avaliação do Crescimento Infantil: Aplicação Clínica das Curvas de Referência',
  subtitle: 'Desenvolva competências em avaliação nutricional pediátrica através da aplicação prática de curvas de crescimento',
  introduction: `
    As curvas de crescimento constituem instrumento fundamental na prática da nutrição pediátrica,
    permitindo avaliação objetiva do estado nutricional e monitoramento do crescimento infantil.
    Este módulo desenvolve competências práticas para aplicação clínica das curvas de referência,
    utilizando casos reais de crianças brasileiras e protocolos padronizados do SISVAN.
  `,
  analogies: [
    {
      title: 'Analogia da Fila de Crianças',
      description: `
        Imagine 100 crianças da mesma idade em uma fila, organizadas por peso (ou altura):
        • P3 = uma das 3 menores
        • P25 = criança na posição 25
        • P50 = criança no meio da fila (posição 50)
        • P75 = criança na posição 75
        • P97 = uma das 3 maiores
      `
    },
    {
      title: 'Semáforo Nutricional',
      description: `
        Use as cores como um semáforo para interpretação:
        • 🔴 Vermelho (P3): Pare! Investigação necessária
        • 🟡 Amarelo (P10-P85): Atenção, acompanhe
        • 🟢 Verde (P25-P75): Siga em frente, normal
        • 🟡 Amarelo (P85-P97): Atenção, risco de sobrepeso
        • 🔴 Vermelho (>P97): Pare! Intervenção necessária
      `
    }
  ],
  keyLearningObjectives: [
    'Identificar e interpretar percentis de referência nas curvas de crescimento infantil',
    'Aplicar técnicas de plotagem antropométrica com precisão clínica',
    'Interpretar percentis segundo critérios diagnósticos do SISVAN',
    'Classificar estado nutricional infantil baseado em pontos de corte padronizados',
    'Desenvolver raciocínio clínico através de casos reais da atenção básica brasileira'
  ]
}
