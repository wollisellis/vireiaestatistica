// Sistema de Pontuação Educacional Simplificado - AvaliaNutri
// Focado em aprendizagem individual, não competição
// Created by Ellis Abhulime - Unicamp

export interface SimpleScoreCalculation {
  correctAnswers: number
  totalQuestions: number
  completionRate: number // 0-100 percentage
  conceptsMastered: string[]
  attemptsUsed: number
  learningAssessment: LearningAssessment
}

export interface LearningAssessment {
  level: 'Iniciante' | 'Desenvolvendo' | 'Competente' | 'Proficiente'
  feedback: string
  nextSteps: string[]
  color: string
}

export interface ConceptProgress {
  conceptId: string
  conceptName: string
  isMastered: boolean
  attemptsNeeded: number
}

export interface QuestionResult {
  questionId: number
  correct: boolean
  attempts: number
  conceptId: string
}

export class EducationalScoringSystem {
  // Conceitos de avaliação nutricional por módulo
  private static readonly MODULE_CONCEPTS = {
    1: ['IMC', 'Antropometria', 'Medidas Corporais', 'Percentis'],
    2: ['Exames Bioquímicos', 'Sinais Clínicos', 'Diagnóstico Nutricional'],
    3: ['Fatores Socioeconômicos', 'Acesso Alimentar', 'Vulnerabilidade Social'],
    4: ['Curvas de Crescimento', 'Avaliação Populacional', 'Interpretação de Dados']
  }

  public static calculateEducationalScore(
    questionResults: QuestionResult[],
    moduleId: number
  ): SimpleScoreCalculation {
    const correctAnswers = questionResults.filter(q => q.correct).length
    const totalQuestions = questionResults.length
    const completionRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    
    // Calcular conceitos dominados
    const conceptsMastered = this.calculateConceptsMastered(questionResults, moduleId)
    
    // Calcular tentativas totais utilizadas
    const attemptsUsed = questionResults.reduce((sum, q) => sum + q.attempts, 0)
    
    // Avaliação educacional baseada em compreensão
    const learningAssessment = this.assessLearning(completionRate, conceptsMastered, moduleId)
    
    return {
      correctAnswers,
      totalQuestions,
      completionRate,
      conceptsMastered,
      attemptsUsed,
      learningAssessment
    }
  }

  private static calculateConceptsMastered(
    questionResults: QuestionResult[],
    moduleId: number
  ): string[] {
    const moduleConcepts = this.MODULE_CONCEPTS[moduleId as keyof typeof this.MODULE_CONCEPTS] || []
    const conceptProgress: { [key: string]: QuestionResult[] } = {}
    
    // Agrupar questões por conceito
    questionResults.forEach(result => {
      if (!conceptProgress[result.conceptId]) {
        conceptProgress[result.conceptId] = []
      }
      conceptProgress[result.conceptId].push(result)
    })
    
    const masteredConcepts: string[] = []
    
    // Um conceito é considerado dominado se:
    // - Pelo menos 70% das questões desse conceito foram respondidas corretamente
    // - Ou todas as questões foram respondidas corretamente em no máximo 2 tentativas
    Object.entries(conceptProgress).forEach(([conceptId, questions]) => {
      const correctQuestions = questions.filter(q => q.correct).length
      const totalQuestions = questions.length
      const accuracy = (correctQuestions / totalQuestions) * 100
      
      const allCorrectQuickly = questions.every(q => q.correct && q.attempts <= 2)
      
      if (accuracy >= 70 || allCorrectQuickly) {
        const conceptName = moduleConcepts.find(c => c.toLowerCase().includes(conceptId.toLowerCase())) || conceptId
        masteredConcepts.push(conceptName)
      }
    })
    
    return masteredConcepts
  }

  private static assessLearning(
    completionRate: number,
    conceptsMastered: string[],
    moduleId: number
  ): LearningAssessment {
    const totalConcepts = this.MODULE_CONCEPTS[moduleId as keyof typeof this.MODULE_CONCEPTS]?.length || 4
    const masteryRatio = conceptsMastered.length / totalConcepts
    
    if (completionRate >= 85 && masteryRatio >= 0.8) {
      return {
        level: 'Proficiente',
        feedback: 'Excelente compreensão dos conceitos de avaliação nutricional! Você demonstra domínio das competências deste módulo.',
        nextSteps: [
          'Aplicar conhecimentos em casos práticos reais',
          'Explorar conexões com outros módulos',
          'Considerar aspectos avançados da avaliação nutricional'
        ],
        color: 'emerald'
      }
    }
    
    if (completionRate >= 70 && masteryRatio >= 0.6) {
      return {
        level: 'Competente',
        feedback: 'Bom entendimento dos conceitos principais. Você está no caminho certo para dominar a avaliação nutricional.',
        nextSteps: [
          'Revisar conceitos com menor domínio',
          'Praticar aplicação em casos variados',
          'Fortalecer conexões teórico-práticas'
        ],
        color: 'blue'
      }
    }
    
    if (completionRate >= 50 && masteryRatio >= 0.4) {
      return {
        level: 'Desenvolvendo',
        feedback: 'Você está progredindo no entendimento. Continue estudando para fortalecer sua base conceitual.',
        nextSteps: [
          'Revisar material teórico básico',
          'Refazer exercícios com dificuldades',
          'Buscar exemplos práticos adicionais'
        ],
        color: 'yellow'
      }
    }
    
    return {
      level: 'Iniciante',
      feedback: 'Este é um bom começo! A avaliação nutricional requer prática e estudo contínuo.',
      nextSteps: [
        'Revisar conceitos fundamentais',
        'Estudar material introdutório',
        'Praticar exercícios básicos',
        'Buscar apoio docente quando necessário'
      ],
      color: 'red'
    }
  }

  // Função para gerar feedback personalizado
  public static generatePersonalizedFeedback(
    score: SimpleScoreCalculation,
    previousAttempts?: SimpleScoreCalculation[]
  ): string {
    const { completionRate, conceptsMastered, learningAssessment } = score
    
    let feedback = learningAssessment.feedback + '\n\n'
    
    if (conceptsMastered.length > 0) {
      feedback += `Conceitos que você domina: ${conceptsMastered.join(', ')}\n\n`
    }
    
    if (previousAttempts && previousAttempts.length > 0) {
      const lastAttempt = previousAttempts[previousAttempts.length - 1]
      const improvement = completionRate - lastAttempt.completionRate
      
      if (improvement > 0) {
        feedback += `🎉 Melhoria de ${improvement}% em relação à tentativa anterior!\n\n`
      }
    }
    
    feedback += 'Próximos passos para seu aprendizado:\n'
    learningAssessment.nextSteps.forEach((step, index) => {
      feedback += `${index + 1}. ${step}\n`
    })
    
    return feedback
  }
}