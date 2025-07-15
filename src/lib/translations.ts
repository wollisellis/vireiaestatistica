// Brazilian Portuguese translations for AvaliaNutri
export const translations = {
  // Authentication
  auth: {
    welcomeBack: 'Bem-vindo de volta',
    createAccount: 'Criar Conta',
    signInToContinue: 'Faça login para continuar aprendendo',
    startYourJourney: 'Inicie sua jornada de aprendizado em avaliação nutricional',
    fullName: 'Nome Completo',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    signIn: 'Entrar',
    signUp: 'Cadastrar',
    signOut: 'Sair',
    alreadyHaveAccount: 'Já tem uma conta? Faça login',
    dontHaveAccount: 'Não tem uma conta? Cadastre-se',
    enterFullName: 'Digite seu nome completo',
    enterEmail: 'Digite seu e-mail',
    enterPassword: 'Digite sua senha',
    confirmYourPassword: 'Confirme sua senha',
    skipLogin: 'Pular Login',
    continueAsGuest: 'Continuar como Visitante',
    guestModeDescription: 'Explore a plataforma sem criar uma conta',
    
    // Validation messages
    validation: {
      emailRequired: 'E-mail é obrigatório',
      emailInvalid: 'E-mail inválido',
      passwordRequired: 'Senha é obrigatória',
      passwordMinLength: 'A senha deve ter pelo menos 6 caracteres',
      fullNameRequired: 'Nome completo é obrigatório',
      fullNameMinLength: 'Nome deve ter pelo menos 2 caracteres',
      passwordsDontMatch: 'As senhas não coincidem',
    },
    
    // Error messages
    errors: {
      invalidCredentials: 'Credenciais inválidas',
      userNotFound: 'Usuário não encontrado',
      emailAlreadyExists: 'E-mail já está em uso',
      weakPassword: 'Senha muito fraca',
      networkError: 'Erro de conexão. Tente novamente.',
      unknownError: 'Ocorreu um erro inesperado',
    }
  },

  // Navigation
  navigation: {
    home: 'Início',
    games: 'Jogos',
    progress: 'Progresso',
    leaderboard: 'Ranking',
    learn: 'Aprender',
    profile: 'Perfil',
  },

  // Dashboard
  dashboard: {
    welcomeBack: 'Bem-vindo de volta',
    readyToContinue: 'Pronto para continuar sua jornada em avaliação nutricional?',
    totalScore: 'Pontuação Total',
    levelReached: 'Nível Alcançado',
    gamesCompleted: 'Jogos Concluídos',
    studyTime: 'Tempo de Estudo',
    learningProgress: 'Progresso de Aprendizado',
    overallCompletion: 'Conclusão Geral',
    currentLevelProgress: 'Progresso do Nível Atual',
    quickActions: 'Ações Rápidas',
    continueLearning: 'Continuar Aprendendo',
    reviewConcepts: 'Revisar Conceitos',
    viewAchievements: 'Ver Conquistas',
    recentGames: 'Jogos Recentes',
    score: 'Pontuação',
    notCompleted: 'Não concluído',
    replay: 'Jogar Novamente',
    start: 'Iniciar',
  },

  // Games
  games: {
    level: 'Nível',
    game: 'Jogo',
    completed: 'Concluído',
    locked: 'Bloqueado',
    inProgress: 'Em Andamento',
    
    // Game titles and descriptions
    titles: {
      1: 'Compreensão do Valor-p',
      2: 'Correlação de Spearman',
      3: 'Média, Mediana e Moda',
      4: 'Desvio Padrão e Variância',
      5: 'Distribuição Normal',
      6: 'Testes t',
      7: 'Testes Qui-quadrado',
      8: 'ANOVA',
      9: 'Regressão Linear',
      10: 'Intervalos de Confiança',
    },

    descriptions: {
      1: 'Aprenda significância estatística e interpretação de valores-p usando exemplos de pesquisa nutricional',
      2: 'Análise de correlação não-paramétrica com dados de desempenho esportivo',
      3: 'Exercícios interativos com conjuntos de dados reais de ingestão dietética',
      4: 'Jogos visuais usando métricas de desempenho de atletas',
      5: 'Exercícios interativos de distribuição de probabilidade',
      6: 'Comparação de grupos em estudos de intervenção nutricional',
      7: 'Análise de dados categóricos com exemplos das ciências do esporte',
      8: 'Comparações multi-grupos em cenários de pesquisa',
      9: 'Modelagem preditiva com dados de nutrição e esporte',
      10: 'Exercícios de estimação estatística',
    },

    categories: {
      all: 'Todos os Jogos',
      descriptive: 'Estatística Descritiva',
      inferential: 'Estatística Inferencial',
      hypothesis: 'Testes de Hipóteses',
      correlation: 'Correlação',
      regression: 'Regressão'
    },

    difficulty: {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado'
    },

    status: {
      locked: 'Bloqueado',
      available: 'Disponível',
      completed: 'Concluído',
      inProgress: 'Em Progresso'
    },

    actions: {
      start: 'Iniciar Jogo',
      continue: 'Continuar',
      restart: 'Jogar Novamente',
      backToGames: 'Voltar aos Jogos',
      nextQuestion: 'Próxima Questão',
      submitAnswer: 'Confirmar Resposta',
      showExplanation: 'Ver Explicação',
      hideExplanation: 'Ocultar Explicação'
    }
  },

  // Common UI elements
  ui: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    close: 'Fechar',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    retry: 'Tentar Novamente',
    backToHome: 'Voltar ao Início',
  },

  // Academic context
  academic: {
    platformName: process.env.NEXT_PUBLIC_APP_NAME || 'AvaliaNutri',
    subtitle: 'Plataforma Educacional de Avaliação Nutricional',
    description: 'Aprenda avaliação nutricional através de jogos interativos com dados reais brasileiros e abordagem ultra-iniciante',
    author: 'Ellis Wollis Malta Abhulime',
    institution: 'Mestrando em Nutrição, Esporte e Metabolismo - Unicamp',
    course: 'NT600 - Avaliação Nutricional',
  },

  // Progress and achievements
  progress: {
    level: 'Nível',
    points: 'pontos',
    completed: 'concluído',
    inProgress: 'em andamento',
    locked: 'bloqueado',
    achievement: 'Conquista',
    achievements: 'Conquistas',
    badge: 'Medalha',
    badges: 'Medalhas',
    streak: 'Sequência',
    perfectScore: 'Pontuação Perfeita',
    speedRun: 'Velocidade',
    exploration: 'Exploração',
  },

  // Time and dates
  time: {
    seconds: 'segundos',
    minutes: 'minutos',
    hours: 'horas',
    days: 'dias',
    weeks: 'semanas',
    months: 'meses',
    ago: 'atrás',
    now: 'agora',
  }
}

// Helper function to get nested translation
export function t(key: string): string {
  const keys = key.split('.')
  let value: Record<string, unknown> = translations
  
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k] as Record<string, unknown>
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }
  }

  return value as unknown as string
}
