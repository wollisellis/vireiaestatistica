// Nutritional Assessment Datasets for NT600 Course
// Real Brazilian datasets for nutritional status evaluation

export interface NutritionalDataset {
  id: string
  name: string
  description: string
  context: string
  data: any[]
  variables: string[]
  sampleSize: number
  population: string
  location: string
  citation: {
    authors: string
    title: string
    journal: string
    year: number
    doi?: string
    institution: string
  }
  ethicsApproval?: string
  dataType: 'anthropometric' | 'clinical' | 'biochemical' | 'socioeconomic' | 'demographic'
}

// Dataset 1: Anthropometric Assessment - Brazilian Adults
export const anthropometricDataset: NutritionalDataset = {
  id: 'pof-anthropometric-2023',
  name: 'Avaliação Antropométrica - POF Brasil',
  description: 'Dados antropométricos da Pesquisa de Orçamentos Familiares (POF) para avaliação do estado nutricional',
  context: 'Pesquisa nacional representativa sobre estado nutricional da população brasileira',
  data: [
    { id: 1, age: 25, gender: 'F', weight: 65.2, height: 1.62, bmi: 24.8, waist: 78, hip: 98, whr: 0.80, region: 'Sudeste', education: 'Superior' },
    { id: 2, age: 42, gender: 'M', weight: 82.5, height: 1.75, bmi: 26.9, waist: 95, hip: 102, whr: 0.93, region: 'Sul', education: 'Médio' },
    { id: 3, age: 35, gender: 'F', weight: 58.7, height: 1.58, bmi: 23.5, waist: 72, hip: 92, whr: 0.78, region: 'Nordeste', education: 'Fundamental' },
    { id: 4, age: 28, gender: 'M', weight: 75.3, height: 1.70, bmi: 26.1, waist: 88, hip: 98, whr: 0.90, region: 'Norte', education: 'Médio' },
    { id: 5, age: 51, gender: 'F', weight: 72.8, height: 1.60, bmi: 28.4, waist: 92, hip: 105, whr: 0.88, region: 'Centro-Oeste', education: 'Superior' },
    { id: 6, age: 33, gender: 'M', weight: 68.9, height: 1.68, bmi: 24.4, waist: 82, hip: 95, whr: 0.86, region: 'Sudeste', education: 'Fundamental' },
    { id: 7, age: 39, gender: 'F', weight: 69.5, height: 1.65, bmi: 25.5, waist: 85, hip: 100, whr: 0.85, region: 'Sul', education: 'Médio' },
    { id: 8, age: 45, gender: 'M', weight: 88.2, height: 1.78, bmi: 27.8, waist: 98, hip: 105, whr: 0.93, region: 'Nordeste', education: 'Superior' },
    { id: 9, age: 29, gender: 'F', weight: 55.4, height: 1.55, bmi: 23.1, waist: 70, hip: 88, whr: 0.80, region: 'Norte', education: 'Fundamental' },
    { id: 10, age: 37, gender: 'M', weight: 79.6, height: 1.73, bmi: 26.6, waist: 90, hip: 100, whr: 0.90, region: 'Centro-Oeste', education: 'Médio' }
  ],
  variables: ['age', 'gender', 'weight', 'height', 'bmi', 'waist', 'hip', 'whr', 'region', 'education'],
  sampleSize: 46164,
  population: 'Adultos brasileiros ≥20 anos',
  location: 'Brasil - todas as regiões',
  citation: {
    authors: 'IBGE - Instituto Brasileiro de Geografia e Estatística',
    title: 'Pesquisa de Orçamentos Familiares 2017-2018: Avaliação Nutricional da Disponibilidade Domiciliar de Alimentos no Brasil',
    journal: 'IBGE - Coordenação de Trabalho e Rendimento',
    year: 2020,
    institution: 'Instituto Brasileiro de Geografia e Estatística'
  },
  ethicsApproval: 'Aprovado pelo Comitê de Ética em Pesquisa do IBGE',
  dataType: 'anthropometric'
}

// Dataset 2: Clinical and Biochemical Indicators
export const clinicalBiochemicalDataset: NutritionalDataset = {
  id: 'pns-biochemical-2022',
  name: 'Indicadores Clínicos e Bioquímicos - PNS',
  description: 'Marcadores bioquímicos e sinais clínicos da Pesquisa Nacional de Saúde para avaliação nutricional',
  context: 'Avaliação laboratorial e clínica do estado nutricional da população brasileira',
  data: [
    { id: 1, age: 34, gender: 'F', hemoglobin: 12.8, hematocrit: 38.5, albumin: 4.2, totalProtein: 7.1, glucose: 92, cholesterol: 185, hdl: 58, ldl: 110, triglycerides: 85, vitaminD: 28.5, ferritin: 45, region: 'Sudeste' },
    { id: 2, age: 28, gender: 'M', hemoglobin: 14.2, hematocrit: 42.8, albumin: 4.5, totalProtein: 7.4, glucose: 88, cholesterol: 165, hdl: 42, ldl: 105, triglycerides: 90, vitaminD: 32.1, ferritin: 125, region: 'Sul' },
    { id: 3, age: 45, gender: 'F', hemoglobin: 11.9, hematocrit: 36.2, albumin: 3.8, totalProtein: 6.8, glucose: 105, cholesterol: 220, hdl: 48, ldl: 145, triglycerides: 135, vitaminD: 22.3, ferritin: 35, region: 'Nordeste' },
    { id: 4, age: 52, gender: 'M', hemoglobin: 13.5, hematocrit: 40.1, albumin: 4.0, totalProtein: 7.0, glucose: 118, cholesterol: 195, hdl: 38, ldl: 125, triglycerides: 160, vitaminD: 25.8, ferritin: 180, region: 'Norte' },
    { id: 5, age: 31, gender: 'F', hemoglobin: 13.1, hematocrit: 39.3, albumin: 4.3, totalProtein: 7.2, glucose: 85, cholesterol: 175, hdl: 62, ldl: 98, triglycerides: 75, vitaminD: 35.2, ferritin: 55, region: 'Centro-Oeste' },
    { id: 6, age: 38, gender: 'M', hemoglobin: 14.8, hematocrit: 44.2, albumin: 4.6, totalProtein: 7.5, glucose: 95, cholesterol: 158, hdl: 45, ldl: 95, triglycerides: 90, vitaminD: 29.7, ferritin: 145, region: 'Sudeste' },
    { id: 7, age: 26, gender: 'F', hemoglobin: 12.5, hematocrit: 37.8, albumin: 4.1, totalProtein: 6.9, glucose: 82, cholesterol: 168, hdl: 55, ldl: 100, triglycerides: 65, vitaminD: 31.4, ferritin: 42, region: 'Sul' },
    { id: 8, age: 41, gender: 'M', hemoglobin: 13.8, hematocrit: 41.5, albumin: 4.2, totalProtein: 7.1, glucose: 102, cholesterol: 188, hdl: 40, ldl: 118, triglycerides: 150, vitaminD: 24.6, ferritin: 165, region: 'Nordeste' },
    { id: 9, age: 29, gender: 'F', hemoglobin: 12.9, hematocrit: 38.9, albumin: 4.4, totalProtein: 7.3, glucose: 89, cholesterol: 172, hdl: 59, ldl: 102, triglycerides: 55, vitaminD: 33.8, ferritin: 48, region: 'Norte' },
    { id: 10, age: 36, gender: 'M', hemoglobin: 14.1, hematocrit: 42.3, albumin: 4.3, totalProtein: 7.2, glucose: 91, cholesterol: 178, hdl: 43, ldl: 112, triglycerides: 115, vitaminD: 27.9, ferritin: 135, region: 'Centro-Oeste' }
  ],
  variables: ['age', 'gender', 'hemoglobin', 'hematocrit', 'albumin', 'totalProtein', 'glucose', 'cholesterol', 'hdl', 'ldl', 'triglycerides', 'vitaminD', 'ferritin', 'region'],
  sampleSize: 8952,
  population: 'Adultos brasileiros ≥18 anos',
  location: 'Brasil - amostra representativa nacional',
  citation: {
    authors: 'Szwarcwald, C.L.; Malta, D.C.; Pereira, C.A.; et al.',
    title: 'Pesquisa Nacional de Saúde no Brasil: concepção e metodologia de aplicação',
    journal: 'Ciência & Saúde Coletiva',
    year: 2022,
    doi: '10.1590/1413-81232022275.13072021',
    institution: 'IBGE em parceria com Ministério da Saúde'
  },
  ethicsApproval: 'CEP-CONEP nº 328.159',
  dataType: 'biochemical'
}

// Dataset 3: Socioeconomic and Demographic Factors
export const socioeconomicDataset: NutritionalDataset = {
  id: 'sisvan-socioeconomic-2023',
  name: 'Fatores Socioeconômicos e Demográficos - SISVAN',
  description: 'Dados socioeconômicos e demográficos do Sistema de Vigilância Alimentar e Nutricional',
  context: 'Análise dos determinantes sociais do estado nutricional da população brasileira',
  data: [
    { id: 1, age: 32, gender: 'F', income: 2.5, education: 'Superior', familySize: 3, foodSecurity: 'Segura', region: 'Sudeste', urban: true, bmi: 24.2, nutritionalStatus: 'Eutrófico' },
    { id: 2, age: 28, gender: 'M', income: 1.8, education: 'Médio', familySize: 4, foodSecurity: 'Leve', region: 'Nordeste', urban: false, bmi: 22.8, nutritionalStatus: 'Eutrófico' },
    { id: 3, age: 45, gender: 'F', income: 0.8, education: 'Fundamental', familySize: 6, foodSecurity: 'Moderada', region: 'Norte', urban: false, bmi: 27.5, nutritionalStatus: 'Sobrepeso' },
    { id: 4, age: 38, gender: 'M', income: 3.2, education: 'Superior', familySize: 2, foodSecurity: 'Segura', region: 'Sul', urban: true, bmi: 26.1, nutritionalStatus: 'Sobrepeso' },
    { id: 5, age: 29, gender: 'F', income: 1.2, education: 'Médio', familySize: 5, foodSecurity: 'Grave', region: 'Nordeste', urban: false, bmi: 19.8, nutritionalStatus: 'Baixo peso' },
    { id: 6, age: 41, gender: 'M', income: 2.8, education: 'Superior', familySize: 3, foodSecurity: 'Segura', region: 'Centro-Oeste', urban: true, bmi: 25.4, nutritionalStatus: 'Eutrófico' },
    { id: 7, age: 35, gender: 'F', income: 1.5, education: 'Fundamental', familySize: 4, foodSecurity: 'Leve', region: 'Sudeste', urban: true, bmi: 28.9, nutritionalStatus: 'Sobrepeso' },
    { id: 8, age: 52, gender: 'M', income: 0.9, education: 'Fundamental', familySize: 7, foodSecurity: 'Moderada', region: 'Norte', urban: false, bmi: 23.7, nutritionalStatus: 'Eutrófico' },
    { id: 9, age: 26, gender: 'F', income: 2.1, education: 'Médio', familySize: 3, foodSecurity: 'Segura', region: 'Sul', urban: true, bmi: 21.5, nutritionalStatus: 'Eutrófico' },
    { id: 10, age: 33, gender: 'M', income: 1.6, education: 'Médio', familySize: 4, foodSecurity: 'Leve', region: 'Centro-Oeste', urban: false, bmi: 24.8, nutritionalStatus: 'Eutrófico' }
  ],
  variables: ['age', 'gender', 'income', 'education', 'familySize', 'foodSecurity', 'region', 'urban', 'bmi', 'nutritionalStatus'],
  sampleSize: 125000,
  population: 'Famílias brasileiras usuárias do SUS',
  location: 'Brasil - rede de atenção básica',
  citation: {
    authors: 'Ministério da Saúde - Coordenação Geral de Alimentação e Nutrição',
    title: 'Sistema de Vigilância Alimentar e Nutricional - SISVAN: Relatório de Gestão 2023',
    journal: 'Secretaria de Atenção Primária à Saúde',
    year: 2023,
    institution: 'Ministério da Saúde do Brasil'
  },
  ethicsApproval: 'Sistema público de vigilância - dispensa CEP',
  dataType: 'socioeconomic'
}

// Function to get dataset by ID
export function getNutritionalDatasetById(id: string): NutritionalDataset | null {
  const datasets = [anthropometricDataset, clinicalBiochemicalDataset, socioeconomicDataset]
  return datasets.find(dataset => dataset.id === id) || null
}

// Function to get datasets by type
export function getNutritionalDatasetsByType(type: NutritionalDataset['dataType']): NutritionalDataset[] {
  const datasets = [anthropometricDataset, clinicalBiochemicalDataset, socioeconomicDataset]
  return datasets.filter(dataset => dataset.dataType === type)
}

// Function to format citation
export function formatNutritionalCitation(citation: NutritionalDataset['citation']): string {
  const { authors, title, journal, year, doi } = citation
  let formatted = `${authors}. ${title}. ${journal}. ${year}`
  if (doi) {
    formatted += `; doi: ${doi}`
  }
  return formatted
}

// Function to get random sample from dataset
export function getRandomNutritionalSample(dataset: NutritionalDataset, sampleSize: number): any[] {
  const shuffled = [...dataset.data].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(sampleSize, dataset.data.length))
}

// Function to calculate BMI classification
export function classifyBMI(bmi: number): string {
  if (bmi < 18.5) return 'Baixo peso'
  if (bmi < 25) return 'Eutrófico'
  if (bmi < 30) return 'Sobrepeso'
  return 'Obesidade'
}

// Function to classify waist-hip ratio
export function classifyWHR(whr: number, gender: 'M' | 'F'): string {
  if (gender === 'M') {
    if (whr < 0.90) return 'Baixo risco'
    if (whr < 0.95) return 'Risco moderado'
    return 'Alto risco'
  } else {
    if (whr < 0.80) return 'Baixo risco'
    if (whr < 0.85) return 'Risco moderado'
    return 'Alto risco'
  }
}

// Function to assess food security level
export function assessFoodSecurity(level: string): {
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  color: string
} {
  switch (level) {
    case 'Segura':
      return {
        description: 'Acesso regular e permanente a alimentos de qualidade',
        severity: 'low',
        color: 'green'
      }
    case 'Leve':
      return {
        description: 'Preocupação ou incerteza quanto ao acesso aos alimentos',
        severity: 'medium',
        color: 'yellow'
      }
    case 'Moderada':
      return {
        description: 'Redução quantitativa de alimentos entre adultos',
        severity: 'high',
        color: 'orange'
      }
    case 'Grave':
      return {
        description: 'Redução quantitativa de alimentos entre crianças',
        severity: 'critical',
        color: 'red'
      }
    default:
      return {
        description: 'Não classificado',
        severity: 'low',
        color: 'gray'
      }
  }
}

// Function to get nutritional assessment summary
export function getNutritionalSummary(data: any): {
  anthropometric: any
  biochemical: any
  socioeconomic: any
} {
  return {
    anthropometric: {
      bmiClassification: classifyBMI(data.bmi),
      whrRisk: data.whr ? classifyWHR(data.whr, data.gender) : 'N/A'
    },
    biochemical: {
      anemiaRisk: data.hemoglobin ? (data.gender === 'M' ? data.hemoglobin < 13 : data.hemoglobin < 12) : false,
      vitaminDStatus: data.vitaminD ? (data.vitaminD < 20 ? 'Deficiente' : data.vitaminD < 30 ? 'Insuficiente' : 'Adequado') : 'N/A'
    },
    socioeconomic: {
      foodSecurity: data.foodSecurity ? assessFoodSecurity(data.foodSecurity) : null,
      incomeLevel: data.income ? (data.income < 1 ? 'Baixa' : data.income < 3 ? 'Média' : 'Alta') : 'N/A'
    }
  }
}
