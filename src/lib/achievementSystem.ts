import { Achievement, AchievementCriteria, User } from './firebase'

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<string, Omit<Achievement, 'id' | 'userId' | 'earnedAt'>> = {
  'first-game': {
    achievementType: 'milestone',
    title: 'Primeiro Passo',
    description: 'Completou seu primeiro jogo com sucesso',
    icon: '🎯',
    points: 10,
    rarity: 'common',
    criteria: {
      trigger: 'completion_time',
      value: 1,
      gameId: 1
    }
  },
  'perfect-score': {
    achievementType: 'performance',
    title: 'Pontuação Perfeita',
    description: 'Obteve pontuação máxima em um exercício',
    icon: '⭐',
    points: 25,
    rarity: 'rare',
    criteria: {
      trigger: 'perfect_score',
      value: 100
    }
  },
  'quick-learner': {
    achievementType: 'performance',
    title: 'Aprendiz Rápido',
    description: 'Completou exercício em menos de 10 minutos com boa pontuação',
    icon: '⚡',
    points: 20,
    rarity: 'rare',
    criteria: {
      trigger: 'completion_time',
      value: 600 // 10 minutes in seconds
    }
  },
  'high-performer': {
    achievementType: 'performance',
    title: 'Alto Desempenho',
    description: 'Mantém média acima de 85% em todos os jogos',
    icon: '🏆',
    points: 50,
    rarity: 'epic',
    criteria: {
      trigger: 'score_threshold',
      value: 85
    }
  },
  'improvement-streak': {
    achievementType: 'engagement',
    title: 'Em Evolução',
    description: 'Melhorou a pontuação em 3 tentativas consecutivas',
    icon: '📈',
    points: 30,
    rarity: 'rare',
    criteria: {
      trigger: 'streak',
      value: 3
    }
  },
  'collaborative-learner': {
    achievementType: 'collaboration',
    title: 'Aprendiz Colaborativo',
    description: 'Completou primeiro exercício colaborativo',
    icon: '🤝',
    points: 15,
    rarity: 'common',
    criteria: {
      trigger: 'collaboration',
      value: 1
    }
  },
  'team-player': {
    achievementType: 'collaboration',
    title: 'Jogador de Equipe',
    description: 'Completou 3 exercícios colaborativos',
    icon: '👥',
    points: 35,
    rarity: 'rare',
    criteria: {
      trigger: 'collaboration',
      value: 3
    }
  },
  'collaborative-excellence': {
    achievementType: 'collaboration',
    title: 'Excelência Colaborativa',
    description: 'Obteve pontuação máxima em exercício colaborativo',
    icon: '🌟',
    points: 40,
    rarity: 'epic',
    criteria: {
      trigger: 'perfect_score',
      value: 100
    }
  },
  'anthropometry-master': {
    achievementType: 'mastery',
    title: 'Mestre da Antropometria',
    description: 'Dominou completamente o módulo de indicadores antropométricos',
    icon: '📏',
    points: 60,
    rarity: 'epic',
    criteria: {
      trigger: 'score_threshold',
      value: 90,
      moduleId: 1
    }
  },
  'clinical-expert': {
    achievementType: 'mastery',
    title: 'Especialista Clínico',
    description: 'Dominou completamente o módulo de indicadores clínicos',
    icon: '🩺',
    points: 60,
    rarity: 'epic',
    criteria: {
      trigger: 'score_threshold',
      value: 90,
      moduleId: 2
    }
  },
  'growth-curves-guru': {
    achievementType: 'mastery',
    title: 'Guru das Curvas de Crescimento',
    description: 'Dominou completamente o módulo de curvas de crescimento',
    icon: '📊',
    points: 60,
    rarity: 'epic',
    criteria: {
      trigger: 'score_threshold',
      value: 90,
      moduleId: 4
    }
  },
  'nutrition-scholar': {
    achievementType: 'mastery',
    title: 'Acadêmico da Nutrição',
    description: 'Completou todos os módulos com excelência',
    icon: '🎓',
    points: 100,
    rarity: 'legendary',
    criteria: {
      trigger: 'score_threshold',
      value: 85
    }
  }
}

// Achievement evaluation functions
export interface GameScore {
  gameId: number
  score: number
  maxScore: number
  timeElapsed: number
  isCollaborative?: boolean
  partnerId?: string
}

export interface StudentProgress {
  totalScore: number
  averageScore: number
  gamesCompleted: number
  gameScores: GameScore[]
  achievements: string[]
  improvementStreak: number
}

export function evaluateAchievements(
  progress: StudentProgress,
  newGameScore: GameScore
): string[] {
  const newAchievements: string[] = []
  const currentAchievements = progress.achievements

  // First game completion
  if (progress.gamesCompleted === 0 && !currentAchievements.includes('first-game')) {
    newAchievements.push('first-game')
  }

  // Perfect score
  if (newGameScore.score === newGameScore.maxScore && !currentAchievements.includes('perfect-score')) {
    newAchievements.push('perfect-score')
  }

  // Quick learner (completed in less than 10 minutes with good score)
  if (newGameScore.timeElapsed < 600 && 
      (newGameScore.score / newGameScore.maxScore) >= 0.8 && 
      !currentAchievements.includes('quick-learner')) {
    newAchievements.push('quick-learner')
  }

  // High performer (average above 85%)
  const newAverageScore = calculateNewAverage(progress, newGameScore)
  if (newAverageScore >= 85 && !currentAchievements.includes('high-performer')) {
    newAchievements.push('high-performer')
  }

  // Improvement streak
  if (progress.improvementStreak >= 3 && !currentAchievements.includes('improvement-streak')) {
    newAchievements.push('improvement-streak')
  }

  // Collaborative achievements
  if (newGameScore.isCollaborative) {
    if (!currentAchievements.includes('collaborative-learner')) {
      newAchievements.push('collaborative-learner')
    }

    const collaborativeGames = progress.gameScores.filter(g => g.isCollaborative).length + 1
    if (collaborativeGames >= 3 && !currentAchievements.includes('team-player')) {
      newAchievements.push('team-player')
    }

    if (newGameScore.score === newGameScore.maxScore && !currentAchievements.includes('collaborative-excellence')) {
      newAchievements.push('collaborative-excellence')
    }
  }

  // Module mastery achievements
  const moduleScore = (newGameScore.score / newGameScore.maxScore) * 100
  if (moduleScore >= 90) {
    const moduleAchievements = {
      1: 'anthropometry-master',
      2: 'clinical-expert',
      4: 'growth-curves-guru'
    }

    const achievementId = moduleAchievements[newGameScore.gameId as keyof typeof moduleAchievements]
    if (achievementId && !currentAchievements.includes(achievementId)) {
      newAchievements.push(achievementId)
    }
  }

  // Nutrition scholar (all modules completed with excellence)
  const allModulesCompleted = [1, 2, 3, 4].every(moduleId => 
    progress.gameScores.some(score => score.gameId === moduleId && (score.score / score.maxScore) >= 0.85)
  )
  if (allModulesCompleted && !currentAchievements.includes('nutrition-scholar')) {
    newAchievements.push('nutrition-scholar')
  }

  return newAchievements
}

function calculateNewAverage(progress: StudentProgress, newScore: GameScore): number {
  const allScores = [...progress.gameScores, newScore]
  const totalPercentage = allScores.reduce((sum, score) => sum + (score.score / score.maxScore) * 100, 0)
  return totalPercentage / allScores.length
}

export function getAchievementInfo(achievementId: string): Omit<Achievement, 'id' | 'userId' | 'earnedAt'> | null {
  return ACHIEVEMENT_DEFINITIONS[achievementId] || null
}

export function calculateAchievementPoints(achievements: string[]): number {
  return achievements.reduce((total, achievementId) => {
    const achievement = ACHIEVEMENT_DEFINITIONS[achievementId]
    return total + (achievement?.points || 0)
  }, 0)
}

export function getAchievementsByRarity(achievements: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    common: [],
    rare: [],
    epic: [],
    legendary: []
  }

  achievements.forEach(achievementId => {
    const achievement = ACHIEVEMENT_DEFINITIONS[achievementId]
    if (achievement) {
      grouped[achievement.rarity].push(achievementId)
    }
  })

  return grouped
}

export function getNextAchievements(progress: StudentProgress): Array<{
  id: string
  title: string
  description: string
  progress: number
  target: number
}> {
  const nextAchievements = []
  const currentAchievements = progress.achievements

  // High performer progress
  if (!currentAchievements.includes('high-performer')) {
    nextAchievements.push({
      id: 'high-performer',
      title: 'Alto Desempenho',
      description: 'Mantenha média acima de 85%',
      progress: Math.min(progress.averageScore, 85),
      target: 85
    })
  }

  // Team player progress
  if (!currentAchievements.includes('team-player')) {
    const collaborativeGames = progress.gameScores.filter(g => g.isCollaborative).length
    nextAchievements.push({
      id: 'team-player',
      title: 'Jogador de Equipe',
      description: 'Complete 3 exercícios colaborativos',
      progress: Math.min(collaborativeGames, 3),
      target: 3
    })
  }

  // Module mastery progress
  const moduleProgress = [
    { id: 1, achievement: 'anthropometry-master', name: 'Antropometria' },
    { id: 2, achievement: 'clinical-expert', name: 'Indicadores Clínicos' },
    { id: 4, achievement: 'growth-curves-guru', name: 'Curvas de Crescimento' }
  ]

  moduleProgress.forEach(module => {
    if (!currentAchievements.includes(module.achievement)) {
      const moduleScore = progress.gameScores
        .filter(score => score.gameId === module.id)
        .reduce((max, score) => Math.max(max, (score.score / score.maxScore) * 100), 0)

      nextAchievements.push({
        id: module.achievement,
        title: `Mestre da ${module.name}`,
        description: `Obtenha 90% ou mais no módulo`,
        progress: Math.min(moduleScore, 90),
        target: 90
      })
    }
  })

  return nextAchievements.slice(0, 5) // Return top 5 next achievements
}
