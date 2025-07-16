export interface POFData {
  year: number;
  region: string;
  ageGroup: string;
  gender: 'M' | 'F';
  bmi: number;
  weight: number;
  height: number;
  waistCircumference?: number;
  income: number;
  education: string;
}

export interface SISVANData {
  id: string;
  age: number;
  gender: 'M' | 'F';
  weight: number;
  height: number;
  bmi: number;
  nutritionalStatus: 'underweight' | 'normal' | 'overweight' | 'obese';
  region: string;
  municipality: string;
  date: string;
}

export interface IBGEData {
  region: string;
  state: string;
  municipality: string;
  population: number;
  demographicIndicators: {
    lifeExpectancy: number;
    mortalityRate: number;
    birthRate: number;
  };
  nutritionalIndicators: {
    stunting: number;
    wasting: number;
    overweight: number;
  };
}

export interface DataSUSData {
  year: number;
  region: string;
  ageGroup: string;
  gender: 'M' | 'F';
  chronicDiseases: {
    diabetes: number;
    hypertension: number;
    obesity: number;
    cardiovascular: number;
  };
  nutritionalDeficiencies: {
    ironDeficiency: number;
    vitaminADeficiency: number;
    vitaminDDeficiency: number;
    proteinDeficiency: number;
  };
}

class BrazilianDataService {
  private static instance: BrazilianDataService;
  
  private pofData: POFData[] = [];
  private sisvanData: SISVANData[] = [];
  private ibgeData: IBGEData[] = [];
  private dataSUSData: DataSUSData[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): BrazilianDataService {
    if (!BrazilianDataService.instance) {
      BrazilianDataService.instance = new BrazilianDataService();
    }
    return BrazilianDataService.instance;
  }

  private initializeMockData(): void {
    // POF 2024 Mock Data
    this.pofData = [
      {
        year: 2024,
        region: 'Sudeste',
        ageGroup: '20-39',
        gender: 'M',
        bmi: 26.3,
        weight: 78.5,
        height: 175,
        waistCircumference: 89,
        income: 3500,
        education: 'superior'
      },
      {
        year: 2024,
        region: 'Sudeste',
        ageGroup: '20-39',
        gender: 'F',
        bmi: 24.8,
        weight: 62.3,
        height: 162,
        waistCircumference: 78,
        income: 2800,
        education: 'superior'
      },
      {
        year: 2024,
        region: 'Norte',
        ageGroup: '40-59',
        gender: 'M',
        bmi: 27.8,
        weight: 82.1,
        height: 170,
        waistCircumference: 95,
        income: 2200,
        education: 'medio'
      },
      {
        year: 2024,
        region: 'Nordeste',
        ageGroup: '18-29',
        gender: 'F',
        bmi: 23.2,
        weight: 58.9,
        height: 158,
        waistCircumference: 72,
        income: 1800,
        education: 'medio'
      }
    ];

    // SISVAN Mock Data
    this.sisvanData = [
      {
        id: 'SIS001',
        age: 25,
        gender: 'F',
        weight: 65.2,
        height: 165,
        bmi: 24.0,
        nutritionalStatus: 'normal',
        region: 'Sudeste',
        municipality: 'Campinas',
        date: '2024-01-15'
      },
      {
        id: 'SIS002',
        age: 32,
        gender: 'M',
        weight: 85.7,
        height: 178,
        bmi: 27.0,
        nutritionalStatus: 'overweight',
        region: 'Sudeste',
        municipality: 'São Paulo',
        date: '2024-02-20'
      },
      {
        id: 'SIS003',
        age: 19,
        gender: 'F',
        weight: 52.3,
        height: 160,
        bmi: 20.4,
        nutritionalStatus: 'normal',
        region: 'Sul',
        municipality: 'Porto Alegre',
        date: '2024-03-10'
      }
    ];

    // IBGE Mock Data
    this.ibgeData = [
      {
        region: 'Sudeste',
        state: 'SP',
        municipality: 'Campinas',
        population: 1213792,
        demographicIndicators: {
          lifeExpectancy: 78.2,
          mortalityRate: 5.8,
          birthRate: 12.3
        },
        nutritionalIndicators: {
          stunting: 4.2,
          wasting: 1.8,
          overweight: 15.6
        }
      },
      {
        region: 'Nordeste',
        state: 'BA',
        municipality: 'Salvador',
        population: 2872347,
        demographicIndicators: {
          lifeExpectancy: 74.5,
          mortalityRate: 7.2,
          birthRate: 15.1
        },
        nutritionalIndicators: {
          stunting: 8.1,
          wasting: 3.2,
          overweight: 12.4
        }
      }
    ];

    // DataSUS Mock Data
    this.dataSUSData = [
      {
        year: 2024,
        region: 'Sudeste',
        ageGroup: '20-39',
        gender: 'M',
        chronicDiseases: {
          diabetes: 8.2,
          hypertension: 18.5,
          obesity: 22.1,
          cardiovascular: 6.3
        },
        nutritionalDeficiencies: {
          ironDeficiency: 12.4,
          vitaminADeficiency: 5.8,
          vitaminDDeficiency: 28.7,
          proteinDeficiency: 3.2
        }
      },
      {
        year: 2024,
        region: 'Nordeste',
        ageGroup: '20-39',
        gender: 'F',
        chronicDiseases: {
          diabetes: 6.8,
          hypertension: 15.2,
          obesity: 19.7,
          cardiovascular: 4.1
        },
        nutritionalDeficiencies: {
          ironDeficiency: 18.9,
          vitaminADeficiency: 8.3,
          vitaminDDeficiency: 35.4,
          proteinDeficiency: 4.7
        }
      }
    ];
  }

  // POF 2024 Methods
  public getPOFData(filters?: {
    region?: string;
    ageGroup?: string;
    gender?: 'M' | 'F';
  }): POFData[] {
    let data = this.pofData;

    if (filters) {
      if (filters.region) {
        data = data.filter(item => item.region === filters.region);
      }
      if (filters.ageGroup) {
        data = data.filter(item => item.ageGroup === filters.ageGroup);
      }
      if (filters.gender) {
        data = data.filter(item => item.gender === filters.gender);
      }
    }

    return data;
  }

  public getPOFStatistics(): {
    averageBMI: number;
    averageIncome: number;
    overweightPercentage: number;
    obesityPercentage: number;
  } {
    const totalItems = this.pofData.length;
    const averageBMI = this.pofData.reduce((sum, item) => sum + item.bmi, 0) / totalItems;
    const averageIncome = this.pofData.reduce((sum, item) => sum + item.income, 0) / totalItems;
    const overweightCount = this.pofData.filter(item => item.bmi >= 25 && item.bmi < 30).length;
    const obeseCount = this.pofData.filter(item => item.bmi >= 30).length;

    return {
      averageBMI: Number(averageBMI.toFixed(1)),
      averageIncome: Number(averageIncome.toFixed(2)),
      overweightPercentage: Number(((overweightCount / totalItems) * 100).toFixed(1)),
      obesityPercentage: Number(((obeseCount / totalItems) * 100).toFixed(1))
    };
  }

  // SISVAN Methods
  public getSISVANData(filters?: {
    region?: string;
    municipality?: string;
    nutritionalStatus?: string;
    gender?: 'M' | 'F';
  }): SISVANData[] {
    let data = this.sisvanData;

    if (filters) {
      if (filters.region) {
        data = data.filter(item => item.region === filters.region);
      }
      if (filters.municipality) {
        data = data.filter(item => item.municipality === filters.municipality);
      }
      if (filters.nutritionalStatus) {
        data = data.filter(item => item.nutritionalStatus === filters.nutritionalStatus);
      }
      if (filters.gender) {
        data = data.filter(item => item.gender === filters.gender);
      }
    }

    return data;
  }

  public getSISVANStatistics(): {
    totalRecords: number;
    nutritionalStatusDistribution: Record<string, number>;
    averageBMI: number;
    averageAge: number;
  } {
    const totalRecords = this.sisvanData.length;
    const statusDistribution: Record<string, number> = {};

    this.sisvanData.forEach(item => {
      statusDistribution[item.nutritionalStatus] = (statusDistribution[item.nutritionalStatus] || 0) + 1;
    });

    const averageBMI = this.sisvanData.reduce((sum, item) => sum + item.bmi, 0) / totalRecords;
    const averageAge = this.sisvanData.reduce((sum, item) => sum + item.age, 0) / totalRecords;

    return {
      totalRecords,
      nutritionalStatusDistribution: statusDistribution,
      averageBMI: Number(averageBMI.toFixed(1)),
      averageAge: Number(averageAge.toFixed(1))
    };
  }

  // IBGE Methods
  public getIBGEData(filters?: {
    region?: string;
    state?: string;
    municipality?: string;
  }): IBGEData[] {
    let data = this.ibgeData;

    if (filters) {
      if (filters.region) {
        data = data.filter(item => item.region === filters.region);
      }
      if (filters.state) {
        data = data.filter(item => item.state === filters.state);
      }
      if (filters.municipality) {
        data = data.filter(item => item.municipality === filters.municipality);
      }
    }

    return data;
  }

  // DataSUS Methods
  public getDataSUSData(filters?: {
    year?: number;
    region?: string;
    ageGroup?: string;
    gender?: 'M' | 'F';
  }): DataSUSData[] {
    let data = this.dataSUSData;

    if (filters) {
      if (filters.year) {
        data = data.filter(item => item.year === filters.year);
      }
      if (filters.region) {
        data = data.filter(item => item.region === filters.region);
      }
      if (filters.ageGroup) {
        data = data.filter(item => item.ageGroup === filters.ageGroup);
      }
      if (filters.gender) {
        data = data.filter(item => item.gender === filters.gender);
      }
    }

    return data;
  }

  public getDataSUSStatistics(): {
    chronicDiseasePrevalence: Record<string, number>;
    nutritionalDeficiencyPrevalence: Record<string, number>;
  } {
    const totalRecords = this.dataSUSData.length;
    const chronicDiseases: Record<string, number> = {};
    const nutritionalDeficiencies: Record<string, number> = {};

    this.dataSUSData.forEach(item => {
      Object.entries(item.chronicDiseases).forEach(([disease, prevalence]) => {
        chronicDiseases[disease] = (chronicDiseases[disease] || 0) + prevalence;
      });

      Object.entries(item.nutritionalDeficiencies).forEach(([deficiency, prevalence]) => {
        nutritionalDeficiencies[deficiency] = (nutritionalDeficiencies[deficiency] || 0) + prevalence;
      });
    });

    // Calculate averages
    Object.keys(chronicDiseases).forEach(disease => {
      chronicDiseases[disease] = Number((chronicDiseases[disease] / totalRecords).toFixed(1));
    });

    Object.keys(nutritionalDeficiencies).forEach(deficiency => {
      nutritionalDeficiencies[deficiency] = Number((nutritionalDeficiencies[deficiency] / totalRecords).toFixed(1));
    });

    return {
      chronicDiseasePrevalence: chronicDiseases,
      nutritionalDeficiencyPrevalence: nutritionalDeficiencies
    };
  }

  // Utility Methods
  public generateCaseStudyData(moduleId: string): any {
    // Generate case study data based on real Brazilian data
    const pofSample = this.getPOFData()[Math.floor(Math.random() * this.pofData.length)];
    const sisvanSample = this.getSISVANData()[Math.floor(Math.random() * this.sisvanData.length)];
    const ibgeSample = this.getIBGEData()[Math.floor(Math.random() * this.ibgeData.length)];

    return {
      moduleId,
      patient: {
        age: sisvanSample.age,
        gender: sisvanSample.gender,
        weight: sisvanSample.weight,
        height: sisvanSample.height,
        bmi: sisvanSample.bmi,
        region: sisvanSample.region,
        municipality: sisvanSample.municipality,
        income: pofSample.income,
        education: pofSample.education
      },
      populationContext: {
        regionalData: ibgeSample,
        nationalAverages: this.getPOFStatistics(),
        healthIndicators: this.getDataSUSStatistics()
      },
      generatedAt: new Date().toISOString()
    };
  }

  public getRegionalComparisons(): {
    regions: string[];
    bmiByRegion: Record<string, number>;
    incomeByRegion: Record<string, number>;
    nutritionalStatusByRegion: Record<string, Record<string, number>>;
  } {
    const regions = [...new Set(this.pofData.map(item => item.region))];
    const bmiByRegion: Record<string, number> = {};
    const incomeByRegion: Record<string, number> = {};
    const nutritionalStatusByRegion: Record<string, Record<string, number>> = {};

    regions.forEach(region => {
      const pofRegionData = this.getPOFData({ region });
      const sisvanRegionData = this.getSISVANData({ region });

      if (pofRegionData.length > 0) {
        bmiByRegion[region] = pofRegionData.reduce((sum, item) => sum + item.bmi, 0) / pofRegionData.length;
        incomeByRegion[region] = pofRegionData.reduce((sum, item) => sum + item.income, 0) / pofRegionData.length;
      }

      if (sisvanRegionData.length > 0) {
        const statusDistribution: Record<string, number> = {};
        sisvanRegionData.forEach(item => {
          statusDistribution[item.nutritionalStatus] = (statusDistribution[item.nutritionalStatus] || 0) + 1;
        });
        nutritionalStatusByRegion[region] = statusDistribution;
      }
    });

    return {
      regions,
      bmiByRegion,
      incomeByRegion,
      nutritionalStatusByRegion
    };
  }
}

export default BrazilianDataService.getInstance();