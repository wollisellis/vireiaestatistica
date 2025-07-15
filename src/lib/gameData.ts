// Game definitions and datasets for AvaliaNutri
export interface GameDefinition {
  id: number
  title: string
  description: string
  category: 'descriptive' | 'inferential' | 'correlation' | 'regression' | 'hypothesis'
  difficulty: number
  learningObjectives: string[]
  estimatedTime: number // in minutes
  maxScore: number
  instructions: string
  dataset?: any[]
  references: string[]
}

export interface GameProgress {
  gameId: number
  completed: boolean
  score: number
  attempts: number
  bestTime?: number
  lastPlayed?: string
}

export const gameDefinitions: GameDefinition[] = [
  {
    id: 1,
    title: 'Compreensão do Valor-p',
    description: 'Aprenda significância estatística e interpretação de valores-p usando exemplos de pesquisa nutricional',
    category: 'hypothesis',
    difficulty: 3,
    learningObjectives: [
      'Compreender o conceito de valor-p',
      'Interpretar significância estatística',
      'Aplicar testes de hipóteses em nutrição',
      'Distinguir entre significância estatística e clínica'
    ],
    estimatedTime: 15,
    maxScore: 100,
    instructions: 'Analise estudos nutricionais e determine a significância estatística dos resultados.',
    references: [
      'Wasserstein, R. L., & Lazar, N. A. (2016). The ASA statement on p-values. The American Statistician, 70(2), 129-133.',
      'Greenland, S., et al. (2016). Statistical tests, P values, confidence intervals, and power. European Journal of Epidemiology, 31(4), 337-350.'
    ]
  },
  {
    id: 2,
    title: 'Correlação de Spearman',
    description: 'Análise de correlação não-paramétrica com dados de desempenho esportivo',
    category: 'correlation',
    difficulty: 2,
    learningObjectives: [
      'Calcular correlação de Spearman',
      'Interpretar coeficientes de correlação',
      'Comparar correlações paramétricas e não-paramétricas',
      'Aplicar em dados de desempenho esportivo'
    ],
    estimatedTime: 12,
    maxScore: 100,
    instructions: 'Analise a relação entre diferentes métricas de desempenho atlético usando correlação de Spearman.',
    references: [
      'Mukaka, M. M. (2012). Statistics corner: A guide to appropriate use of correlation coefficient in medical research. Malawi Medical Journal, 24(3), 69-71.',
      'Hauke, J., & Kossowski, T. (2011). Comparison of values of Pearson\'s and Spearman\'s correlation coefficients. Quaestiones Geographicae, 30(2), 87-93.'
    ]
  },
  {
    id: 3,
    title: 'Média, Mediana e Moda',
    description: 'Exercícios interativos com conjuntos de dados reais de ingestão dietética',
    category: 'descriptive',
    difficulty: 1,
    learningObjectives: [
      'Calcular medidas de tendência central',
      'Interpretar diferenças entre média, mediana e moda',
      'Identificar distribuições assimétricas',
      'Aplicar em dados nutricionais'
    ],
    estimatedTime: 10,
    maxScore: 100,
    instructions: 'Calcule e interprete medidas de tendência central em dados de consumo alimentar.',
    references: [
      'Kirkwood, B. R., & Sterne, J. A. (2003). Essential medical statistics. Blackwell Science.',
      'Altman, D. G. (1991). Practical statistics for medical research. Chapman and Hall.'
    ]
  },
  {
    id: 4,
    title: 'Desvio Padrão e Variância',
    description: 'Jogos visuais usando métricas de desempenho de atletas',
    category: 'descriptive',
    difficulty: 2,
    learningObjectives: [
      'Calcular desvio padrão e variância',
      'Interpretar medidas de dispersão',
      'Comparar variabilidade entre grupos',
      'Visualizar distribuições de dados'
    ],
    estimatedTime: 12,
    maxScore: 100,
    instructions: 'Explore a variabilidade em dados de desempenho atlético através de cálculos e visualizações.',
    references: [
      'Bland, J. M., & Altman, D. G. (1996). Statistics notes: measurement error. BMJ, 312(7047), 1654.',
      'Hopkins, W. G. (2000). Measures of reliability in sports medicine and science. Sports Medicine, 30(1), 1-15.'
    ]
  },
  {
    id: 5,
    title: 'Distribuição Normal',
    description: 'Exercícios interativos de distribuição de probabilidade',
    category: 'inferential',
    difficulty: 2,
    learningObjectives: [
      'Compreender propriedades da distribuição normal',
      'Calcular probabilidades usando a curva normal',
      'Aplicar o teorema do limite central',
      'Interpretar escores z'
    ],
    estimatedTime: 15,
    maxScore: 100,
    instructions: 'Explore as propriedades da distribuição normal e calcule probabilidades em contextos nutricionais.',
    references: [
      'Ghasemi, A., & Zahediasl, S. (2012). Normality tests for statistical analysis: a guide for non-statisticians. International Journal of Endocrinology and Metabolism, 10(2), 486-489.',
      'Razali, N. M., & Wah, Y. B. (2011). Power comparisons of Shapiro-Wilk, Kolmogorov-Smirnov, Lilliefors and Anderson-Darling tests. Journal of Statistical Modeling and Analytics, 2(1), 21-33.'
    ]
  },
  {
    id: 6,
    title: 'Testes t',
    description: 'Comparação de grupos em estudos de intervenção nutricional',
    category: 'hypothesis',
    difficulty: 3,
    learningObjectives: [
      'Aplicar teste t para uma amostra',
      'Realizar teste t para amostras independentes',
      'Executar teste t pareado',
      'Interpretar resultados em contexto nutricional'
    ],
    estimatedTime: 18,
    maxScore: 100,
    instructions: 'Analise estudos de intervenção nutricional usando diferentes tipos de testes t.',
    references: [
      'de Winter, J. C. (2013). Using the Student\'s t-test with extremely small sample sizes. Practical Assessment, Research, and Evaluation, 18(1), 10.',
      'Ruxton, G. D. (2006). The unequal variance t-test is an underused alternative to Student\'s t-test and the Mann–Whitney U test. Behavioral Ecology, 17(4), 688-690.'
    ]
  },
  {
    id: 7,
    title: 'Testes Qui-quadrado',
    description: 'Análise de dados categóricos com exemplos das ciências do esporte',
    category: 'hypothesis',
    difficulty: 3,
    learningObjectives: [
      'Aplicar teste qui-quadrado de independência',
      'Realizar teste qui-quadrado de aderência',
      'Interpretar tabelas de contingência',
      'Calcular resíduos padronizados'
    ],
    estimatedTime: 16,
    maxScore: 100,
    instructions: 'Analise associações entre variáveis categóricas em estudos esportivos.',
    references: [
      'McHugh, M. L. (2013). The chi-square test of independence. Biochemia Medica, 23(2), 143-149.',
      'Sharpe, D. (2015). Chi-square test is statistically significant: Now what? Practical Assessment, Research, and Evaluation, 20(1), 8.'
    ]
  },
  {
    id: 8,
    title: 'ANOVA',
    description: 'Comparações multi-grupos em cenários de pesquisa',
    category: 'hypothesis',
    difficulty: 4,
    learningObjectives: [
      'Compreender princípios da ANOVA',
      'Realizar ANOVA de uma via',
      'Interpretar testes post-hoc',
      'Verificar pressupostos da ANOVA'
    ],
    estimatedTime: 20,
    maxScore: 100,
    instructions: 'Compare múltiplos grupos em estudos nutricionais usando análise de variância.',
    references: [
      'Kim, H. Y. (2017). Statistical notes for clinical researchers: Analysis of variance (ANOVA). Restorative Dentistry & Endodontics, 42(4), 357-365.',
      'McDonald, J. H. (2014). Handbook of biological statistics (Vol. 2). Sparky House Publishing.'
    ]
  },
  {
    id: 9,
    title: 'Regressão Linear',
    description: 'Modelagem preditiva com dados de nutrição e esporte',
    category: 'regression',
    difficulty: 4,
    learningObjectives: [
      'Construir modelos de regressão linear',
      'Interpretar coeficientes de regressão',
      'Avaliar qualidade do ajuste (R²)',
      'Verificar pressupostos da regressão'
    ],
    estimatedTime: 22,
    maxScore: 100,
    instructions: 'Desenvolva modelos preditivos para relacionar variáveis nutricionais e de desempenho.',
    references: [
      'Schneider, A., Hommel, G., & Blettner, M. (2010). Linear regression analysis: part 14 of a series on evaluation of scientific publications. Deutsches Ärzteblatt International, 107(44), 776.',
      'Altman, N., & Krzywinski, M. (2015). Association, correlation and causation. Nature Methods, 12(10), 899-900.'
    ]
  },
  {
    id: 10,
    title: 'Intervalos de Confiança',
    description: 'Exercícios de estimação estatística',
    category: 'inferential',
    difficulty: 3,
    learningObjectives: [
      'Calcular intervalos de confiança',
      'Interpretar níveis de confiança',
      'Compreender margem de erro',
      'Aplicar em estimativas populacionais'
    ],
    estimatedTime: 14,
    maxScore: 100,
    instructions: 'Calcule e interprete intervalos de confiança para parâmetros populacionais.',
    references: [
      'Cumming, G., & Finch, S. (2005). Inference by eye: confidence intervals and how to read pictures of data. American Psychologist, 60(2), 170.',
      'Morey, R. D., et al. (2016). The fallacy of placing confidence in confidence intervals. Psychonomic Bulletin & Review, 23(1), 103-123.'
    ]
  },
  // ADDITIONAL GAMES - Expanding to 30+ total
  {
    id: 11,
    title: 'Introdução aos Dados',
    description: 'Conceitos básicos para iniciantes absolutos',
    category: 'descriptive',
    difficulty: 1,
    learningObjectives: [
      'Entender o que são dados',
      'Diferenciar tipos de variáveis',
      'Reconhecer escalas de medição',
      'Organizar dados simples'
    ],
    estimatedTime: 8,
    maxScore: 100,
    instructions: 'Aprenda os conceitos fundamentais sobre dados e variáveis.',
    references: [
      'Stevens, S. S. (1946). On the theory of scales of measurement. Science, 103(2684), 677-680.'
    ]
  },
  {
    id: 12,
    title: 'Amostragem e População',
    description: 'Diferenças entre amostra e população',
    category: 'inferential',
    difficulty: 1,
    learningObjectives: [
      'Distinguir amostra de população',
      'Compreender representatividade',
      'Identificar vieses de seleção',
      'Aplicar em pesquisa nutricional'
    ],
    estimatedTime: 10,
    maxScore: 100,
    instructions: 'Explore conceitos de amostragem em estudos nutricionais.',
    references: [
      'Cochran, W. G. (1977). Sampling techniques. John Wiley & Sons.'
    ]
  },
  {
    id: 13,
    title: 'Percentis e Quartis',
    description: 'Medidas de posição em dados nutricionais',
    category: 'descriptive',
    difficulty: 2,
    learningObjectives: [
      'Calcular percentis e quartis',
      'Interpretar box plots',
      'Identificar outliers',
      'Aplicar em avaliação nutricional'
    ],
    estimatedTime: 12,
    maxScore: 100,
    instructions: 'Analise a posição relativa de dados usando percentis.',
    references: [
      'Tukey, J. W. (1977). Exploratory data analysis. Addison-Wesley.'
    ]
  },
  {
    id: 14,
    title: 'Gráficos e Visualizações',
    description: 'Criação e interpretação de gráficos estatísticos',
    category: 'descriptive',
    difficulty: 2,
    learningObjectives: [
      'Escolher gráficos apropriados',
      'Interpretar histogramas',
      'Analisar gráficos de dispersão',
      'Identificar padrões visuais'
    ],
    estimatedTime: 15,
    maxScore: 100,
    instructions: 'Domine a arte da visualização de dados estatísticos.',
    references: [
      'Tufte, E. R. (2001). The visual display of quantitative information. Graphics Press.'
    ]
  },
  {
    id: 15,
    title: 'Probabilidade Básica',
    description: 'Fundamentos de probabilidade para estatística',
    category: 'inferential',
    difficulty: 2,
    learningObjectives: [
      'Compreender conceitos de probabilidade',
      'Calcular probabilidades simples',
      'Aplicar regras de probabilidade',
      'Conectar com inferência estatística'
    ],
    estimatedTime: 14,
    maxScore: 100,
    instructions: 'Aprenda os fundamentos da probabilidade.',
    references: [
      'Ross, S. (2014). A first course in probability. Pearson.'
    ]
  },
  {
    id: 16,
    title: 'Teste de Normalidade',
    description: 'Verificação de pressupostos de normalidade',
    category: 'inferential',
    difficulty: 3,
    learningObjectives: [
      'Aplicar testes de normalidade',
      'Interpretar Q-Q plots',
      'Decidir entre testes paramétricos e não-paramétricos',
      'Verificar pressupostos'
    ],
    estimatedTime: 16,
    maxScore: 100,
    instructions: 'Verifique se seus dados seguem distribuição normal.',
    references: [
      'Shapiro, S. S., & Wilk, M. B. (1965). An analysis of variance test for normality. Biometrika, 52(3/4), 591-611.'
    ]
  },
  {
    id: 17,
    title: 'Mann-Whitney U',
    description: 'Teste não-paramétrico para duas amostras independentes',
    category: 'hypothesis',
    difficulty: 3,
    learningObjectives: [
      'Aplicar teste de Mann-Whitney',
      'Comparar com teste t',
      'Interpretar rankings',
      'Usar com dados ordinais'
    ],
    estimatedTime: 18,
    maxScore: 100,
    instructions: 'Compare dois grupos usando métodos não-paramétricos.',
    references: [
      'Mann, H. B., & Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. The Annals of Mathematical Statistics, 18(1), 50-60.'
    ]
  },
  {
    id: 18,
    title: 'Wilcoxon Signed-Rank',
    description: 'Teste não-paramétrico para amostras pareadas',
    category: 'hypothesis',
    difficulty: 3,
    learningObjectives: [
      'Aplicar teste de Wilcoxon',
      'Comparar com teste t pareado',
      'Analisar diferenças pareadas',
      'Interpretar resultados'
    ],
    estimatedTime: 16,
    maxScore: 100,
    instructions: 'Analise dados pareados com métodos não-paramétricos.',
    references: [
      'Wilcoxon, F. (1945). Individual comparisons by ranking methods. Biometrics Bulletin, 1(6), 80-83.'
    ]
  },
  {
    id: 19,
    title: 'Kruskal-Wallis',
    description: 'ANOVA não-paramétrica para múltiplos grupos',
    category: 'hypothesis',
    difficulty: 4,
    learningObjectives: [
      'Aplicar teste de Kruskal-Wallis',
      'Comparar múltiplos grupos',
      'Realizar comparações post-hoc',
      'Interpretar rankings'
    ],
    estimatedTime: 20,
    maxScore: 100,
    instructions: 'Compare múltiplos grupos usando métodos não-paramétricos.',
    references: [
      'Kruskal, W. H., & Wallis, W. A. (1952). Use of ranks in one-criterion variance analysis. Journal of the American Statistical Association, 47(260), 583-621.'
    ]
  },
  {
    id: 20,
    title: 'Regressão Múltipla',
    description: 'Modelos com múltiplas variáveis preditoras',
    category: 'regression',
    difficulty: 4,
    learningObjectives: [
      'Construir modelos de regressão múltipla',
      'Interpretar coeficientes parciais',
      'Avaliar multicolinearidade',
      'Selecionar variáveis'
    ],
    estimatedTime: 25,
    maxScore: 100,
    instructions: 'Desenvolva modelos complexos com múltiplas variáveis.',
    references: [
      'Montgomery, D. C., Peck, E. A., & Vining, G. G. (2012). Introduction to linear regression analysis. John Wiley & Sons.'
    ]
  },
  {
    id: 21,
    title: 'Regressão Logística',
    description: 'Modelos para variáveis dependentes categóricas',
    category: 'regression',
    difficulty: 5,
    learningObjectives: [
      'Compreender regressão logística',
      'Interpretar odds ratios',
      'Avaliar qualidade do modelo',
      'Aplicar em desfechos binários'
    ],
    estimatedTime: 28,
    maxScore: 100,
    instructions: 'Modele probabilidades de eventos em estudos clínicos.',
    references: [
      'Hosmer Jr, D. W., Lemeshow, S., & Sturdivant, R. X. (2013). Applied logistic regression. John Wiley & Sons.'
    ]
  },
  {
    id: 22,
    title: 'Análise de Sobrevivência',
    description: 'Introdução à análise de tempo até evento',
    category: 'regression',
    difficulty: 5,
    learningObjectives: [
      'Compreender curvas de sobrevivência',
      'Interpretar Kaplan-Meier',
      'Aplicar teste log-rank',
      'Entender censura'
    ],
    estimatedTime: 30,
    maxScore: 100,
    instructions: 'Analise tempo até eventos em estudos longitudinais.',
    references: [
      'Kaplan, E. L., & Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association, 53(282), 457-481.'
    ]
  },
  {
    id: 23,
    title: 'Cálculo de Tamanho Amostral',
    description: 'Determinação do número adequado de participantes',
    category: 'inferential',
    difficulty: 4,
    learningObjectives: [
      'Calcular tamanho amostral',
      'Compreender poder estatístico',
      'Definir tamanho de efeito',
      'Aplicar em planejamento de estudos'
    ],
    estimatedTime: 22,
    maxScore: 100,
    instructions: 'Planeje estudos com tamanho amostral adequado.',
    references: [
      'Cohen, J. (1988). Statistical power analysis for the behavioral sciences. Lawrence Erlbaum Associates.'
    ]
  },
  {
    id: 24,
    title: 'Análise de Poder',
    description: 'Avaliação da capacidade de detectar efeitos',
    category: 'inferential',
    difficulty: 4,
    learningObjectives: [
      'Compreender poder estatístico',
      'Calcular poder post-hoc',
      'Interpretar curvas de poder',
      'Relacionar com tamanho amostral'
    ],
    estimatedTime: 20,
    maxScore: 100,
    instructions: 'Avalie a capacidade de seus testes detectarem efeitos.',
    references: [
      'Ellis, P. D. (2010). The essential guide to effect sizes: Statistical power, meta-analysis, and the interpretation of research results. Cambridge University Press.'
    ]
  },
  {
    id: 25,
    title: 'Tamanho de Efeito',
    description: 'Medidas de magnitude de efeitos estatísticos',
    category: 'inferential',
    difficulty: 3,
    learningObjectives: [
      'Calcular diferentes tamanhos de efeito',
      'Interpretar Cohen\'s d',
      'Compreender eta-quadrado',
      'Aplicar em meta-análises'
    ],
    estimatedTime: 18,
    maxScore: 100,
    instructions: 'Quantifique a magnitude prática de seus achados.',
    references: [
      'Cohen, J. (1992). A power primer. Psychological Bulletin, 112(1), 155-159.'
    ]
  },
  {
    id: 26,
    title: 'Identificação de Vieses',
    description: 'Reconhecimento e controle de vieses em pesquisa',
    category: 'inferential',
    difficulty: 4,
    learningObjectives: [
      'Identificar tipos de viés',
      'Compreender viés de seleção',
      'Reconhecer viés de informação',
      'Aplicar estratégias de controle'
    ],
    estimatedTime: 24,
    maxScore: 100,
    instructions: 'Identifique e controle vieses em estudos epidemiológicos.',
    references: [
      'Sackett, D. L. (1979). Bias in analytic research. Journal of Chronic Diseases, 32(1-2), 51-63.'
    ]
  },
  {
    id: 27,
    title: 'Delineamento de Estudos',
    description: 'Tipos de estudos epidemiológicos e experimentais',
    category: 'inferential',
    difficulty: 3,
    learningObjectives: [
      'Distinguir tipos de estudos',
      'Compreender estudos observacionais',
      'Planejar estudos experimentais',
      'Avaliar validade interna e externa'
    ],
    estimatedTime: 26,
    maxScore: 100,
    instructions: 'Domine os diferentes delineamentos de pesquisa.',
    references: [
      'Hulley, S. B., et al. (2013). Designing clinical research. Lippincott Williams & Wilkins.'
    ]
  },
  {
    id: 28,
    title: 'Meta-análise Básica',
    description: 'Introdução à síntese quantitativa de evidências',
    category: 'inferential',
    difficulty: 5,
    learningObjectives: [
      'Compreender princípios de meta-análise',
      'Calcular efeitos combinados',
      'Avaliar heterogeneidade',
      'Interpretar forest plots'
    ],
    estimatedTime: 32,
    maxScore: 100,
    instructions: 'Combine evidências de múltiplos estudos.',
    references: [
      'Borenstein, M., et al. (2009). Introduction to meta-analysis. John Wiley & Sons.'
    ]
  },
  {
    id: 29,
    title: 'Estatística Bayesiana Introdutória',
    description: 'Conceitos básicos de inferência bayesiana',
    category: 'inferential',
    difficulty: 5,
    learningObjectives: [
      'Compreender teorema de Bayes',
      'Distinguir frequentista de bayesiano',
      'Interpretar intervalos de credibilidade',
      'Aplicar priors informativos'
    ],
    estimatedTime: 35,
    maxScore: 100,
    instructions: 'Explore a abordagem bayesiana para inferência.',
    references: [
      'Kruschke, J. (2014). Doing Bayesian data analysis: A tutorial with R, JAGS, and Stan. Academic Press.'
    ]
  },
  {
    id: 30,
    title: 'Análise Multivariada Introdutória',
    description: 'Técnicas para múltiplas variáveis simultaneamente',
    category: 'regression',
    difficulty: 5,
    learningObjectives: [
      'Compreender análise multivariada',
      'Aplicar análise de componentes principais',
      'Interpretar análise de clusters',
      'Explorar análise discriminante'
    ],
    estimatedTime: 40,
    maxScore: 100,
    instructions: 'Analise padrões complexos em dados multidimensionais.',
    references: [
      'Johnson, R. A., & Wichern, D. W. (2007). Applied multivariate statistical analysis. Pearson Prentice Hall.'
    ]
  },
  {
    id: 31,
    title: 'Controle de Qualidade de Dados',
    description: 'Verificação e limpeza de dados para análise',
    category: 'descriptive',
    difficulty: 2,
    learningObjectives: [
      'Identificar dados inconsistentes',
      'Detectar outliers',
      'Tratar valores ausentes',
      'Validar entrada de dados'
    ],
    estimatedTime: 16,
    maxScore: 100,
    instructions: 'Garanta a qualidade de seus dados antes da análise.',
    references: [
      'Van den Broeck, J., et al. (2005). Data cleaning: detecting, diagnosing, and editing data abnormalities. PLoS Medicine, 2(10), e267.'
    ]
  },
  {
    id: 32,
    title: 'Interpretação de Resultados',
    description: 'Comunicação efetiva de achados estatísticos',
    category: 'inferential',
    difficulty: 3,
    learningObjectives: [
      'Interpretar resultados estatísticos',
      'Comunicar incerteza',
      'Evitar interpretações errôneas',
      'Apresentar achados claramente'
    ],
    estimatedTime: 20,
    maxScore: 100,
    instructions: 'Aprenda a comunicar resultados estatísticos efetivamente.',
    references: [
      'Gelman, A., & Stern, H. (2006). The difference between "significant" and "not significant" is not itself statistically significant. The American Statistician, 60(4), 328-331.'
    ]
  },
  // ULTRA-BEGINNER GAMES - Designed for absolute beginners
  {
    id: 33,
    title: 'Conectando Conceitos Estatísticos',
    description: 'Jogo de associação para reconhecer quando usar cada conceito estatístico',
    category: 'descriptive',
    difficulty: 1,
    learningObjectives: [
      'Reconhecer conceitos estatísticos básicos',
      'Conectar teoria com aplicações práticas',
      'Desenvolver intuição estatística',
      'Usar analogias do dia a dia'
    ],
    estimatedTime: 12,
    maxScore: 100,
    instructions: 'Conecte conceitos estatísticos com exemplos da vida real através de um jogo de associação interativo.',
    references: [
      'Moore, D. S. (1997). New pedagogy and new content: The case of statistics. International Statistical Review, 65(2), 123-137.'
    ]
  },
  {
    id: 34,
    title: 'Simulações Interativas para Iniciantes',
    description: 'Aprenda conceitos estatísticos manipulando parâmetros em simulações do mundo real',
    category: 'descriptive',
    difficulty: 1,
    learningObjectives: [
      'Compreender média e variabilidade',
      'Explorar correlações através de simulação',
      'Desenvolver intuição sobre distribuições',
      'Aprender fazendo (aprendizado ativo)'
    ],
    estimatedTime: 15,
    maxScore: 100,
    instructions: 'Use simulações interativas para explorar como diferentes fatores afetam resultados estatísticos.',
    references: [
      'Chance, B., Ben-Zvi, D., Garfield, J., & Medina, E. (2007). The role of technology in improving student learning of statistics. Technology Innovations in Statistics Education, 1(1).'
    ]
  },
  {
    id: 35,
    title: 'Seleção de Testes Estatísticos',
    description: 'Aprenda a escolher o teste estatístico correto para cada situação através de jogos de associação',
    difficulty: 3,
    category: 'hypothesis',
    estimatedTime: 15,
    maxScore: 100,
    learningObjectives: [
      'Identificar quando usar cada teste estatístico',
      'Diferenciar entre tipos de dados e análises apropriadas',
      'Reconhecer situações para Kappa de Cohen'
    ],
    instructions: 'Conecte cada situação com o teste estatístico mais apropriado através de jogos de associação.',
    references: [
      'Field, A. (2013). Discovering statistics using IBM SPSS statistics. Sage.'
    ]
  },
  {
    id: 36,
    title: 'Simulações Estatísticas Interativas',
    description: 'Aprenda estatística através de simulações hands-on com feedback visual imediato',
    difficulty: 4,
    category: 'inferential',
    estimatedTime: 20,
    maxScore: 100,
    learningObjectives: [
      'Entender como parâmetros afetam resultados estatísticos',
      'Diferenciar significância estatística de relevância prática',
      'Explorar efeitos do tamanho da amostra'
    ],
    instructions: 'Use simulações interativas para explorar como diferentes fatores afetam resultados estatísticos.',
    references: [
      'Cohen, J. (1988). Statistical power analysis for the behavioral sciences. Routledge.'
    ]
  },
  {
    id: 37,
    title: 'Reconhecimento de Conceitos Estatísticos',
    description: 'Desenvolva a habilidade de identificar e diferenciar métodos estatísticos através de cenários práticos',
    difficulty: 4,
    category: 'hypothesis',
    estimatedTime: 18,
    maxScore: 100,
    learningObjectives: [
      'Identificar qual análise usar baseada no tipo de dados',
      'Reconhecer limitações dos testes estatísticos',
      'Diferenciar entre correlação e causalidade'
    ],
    instructions: 'Analise cenários e identifique os conceitos estatísticos apropriados para cada situação.',
    references: [
      'Altman, D. G., & Bland, J. M. (1995). Statistics notes: Absence of evidence is not evidence of absence. BMJ, 311(7003), 485.'
    ]
  },
  {
    id: 38,
    title: 'Kappa de Cohen e Medidas de Concordância',
    description: 'Domine o conceito de concordância entre avaliadores através de jogos de associação práticos',
    difficulty: 4,
    category: 'hypothesis',
    estimatedTime: 16,
    maxScore: 100,
    learningObjectives: [
      'Entender quando usar Kappa de Cohen',
      'Interpretar valores de Kappa corretamente',
      'Diferenciar concordância simples de concordância ajustada'
    ],
    instructions: 'Conecte valores de Kappa com suas interpretações corretas e identifique situações apropriadas.',
    references: [
      'Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33(1), 159-174.'
    ]
  }
]

// Sample datasets for games
export const nutritionDataset = [
  { participant: 1, age: 25, calories: 2100, protein: 85, fiber: 28, bmi: 22.1 },
  { participant: 2, age: 32, calories: 1950, protein: 78, fiber: 25, bmi: 24.3 },
  { participant: 3, age: 28, calories: 2300, protein: 92, fiber: 32, bmi: 21.8 },
  { participant: 4, age: 35, calories: 1800, protein: 70, fiber: 22, bmi: 26.1 },
  { participant: 5, age: 29, calories: 2150, protein: 88, fiber: 30, bmi: 23.5 },
  // Add more data points...
]

export const sportsDataset = [
  { athlete: 1, sport: 'Futebol', vo2max: 58.2, speed: 24.5, strength: 145, flexibility: 32 },
  { athlete: 2, sport: 'Basquete', vo2max: 55.8, speed: 22.1, strength: 138, flexibility: 28 },
  { athlete: 3, sport: 'Natação', vo2max: 62.1, speed: 26.8, strength: 152, flexibility: 38 },
  { athlete: 4, sport: 'Tênis', vo2max: 54.3, speed: 23.7, strength: 142, flexibility: 35 },
  { athlete: 5, sport: 'Corrida', vo2max: 65.4, speed: 28.2, strength: 135, flexibility: 30 },
  // Add more data points...
]
