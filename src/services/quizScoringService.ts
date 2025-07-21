// Sistema de pontuação e feedback para questões aleatórias
// Estilo Khan Academy com feedback detalhado e análise por categoria

import { 
  QuizAttempt, 
  RandomizedQuiz, 
  QuestionFeedback, 
  ProgressReport,
  StudentQuizStats 
} from '@/types/randomizedQuiz';
import { parseFirebaseDate } from '@/utils/dateUtils';

export class QuizScoringService {
  /**
   * Calcula pontuação e gera feedback detalhado
   */
  static calculateScore(
    answers: Record<string, string>,
    quiz: RandomizedQuiz,
    totalPoints: number = 10,
    attemptNumber: number = 1
  ): QuizAttempt {
    const questions = quiz.selectedQuestions;
    const feedback: QuestionFeedback[] = [];
    let correctAnswers = 0;

    // Analisar cada questão
    questions.forEach((question) => {
      const studentAnswer = answers[question.originalId] || '';
      const correctOption = question.shuffledOptions[question.correctOptionIndex];
      const isCorrect = studentAnswer === correctOption;

      if (isCorrect) {
        correctAnswers++;
      }

      feedback.push({
        questionId: question.originalId,
        isCorrect,
        studentAnswer: studentAnswer || 'Não respondida',
        correctAnswer: correctOption,
        explanation: question.explanation,
        customFeedback: this.generateCustomFeedback(isCorrect, question, studentAnswer),
        category: question.category
      });
    });

    // Calcular pontuação
    const pointsPerQuestion = totalPoints / questions.length;
    const score = Math.round((correctAnswers * pointsPerQuestion) * 100) / 100;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    const passed = percentage >= 70;

    return {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId: quiz.studentId,
      quizId: quiz.id,
      moduleId: quiz.moduleId,
      answers,
      score,
      percentage,
      passed,
      startedAt: new Date(),
      timeSpent: 0,
      feedback,
      attemptNumber
    };
  }

  /**
   * Gera feedback personalizado baseado na resposta
   */
  private static generateCustomFeedback(
    isCorrect: boolean,
    question: any,
    studentAnswer: string
  ): string {
    if (isCorrect) {
      const encouragements = [
        "✅ Excelente! Você demonstrou compreensão do conceito.",
        "✅ Perfeito! Essa resposta mostra domínio do conteúdo.",
        "✅ Muito bem! Continue assim.",
        "✅ Correto! Você está no caminho certo."
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    }

    if (!studentAnswer || studentAnswer === 'Não respondida') {
      return "⏰ Questão não respondida. Lembre-se de revisar todas as questões antes de submeter.";
    }

    // Feedback contextualizado por categoria
    const categoryFeedback: Record<string, string> = {
      'conceitos-fundamentais': "📚 Revise os conceitos básicos da avaliação nutricional no material do módulo.",
      'antropometria': "📏 Pratique mais sobre técnicas antropométricas e suas aplicações.",
      'avaliacao-individual': "👤 Foque nos componentes da avaliação nutricional individual.",
      'avaliacao-populacional': "👥 Estude mais sobre métodos de avaliação populacional.",
      'inqueritos-alimentares': "🍽️ Revise os diferentes métodos de inquéritos alimentares.",
      'metodologia-cientifica': "🔬 Reforce o entendimento sobre evidências científicas em nutrição.",
      'tecnicas-antropometricas': "⚖️ Pratique mais as técnicas corretas de medição antropométrica.",
      'erros-antropometricos': "⚠️ Estude os principais erros que podem comprometer as medidas.",
      'anamnese-clinica': "📋 Revise os componentes da história clínica nutricional.",
      'composicao-corporal': "🏗️ Foque nos componentes básicos da composição corporal."
    };

    const category = question.category || 'geral';
    const specificFeedback = categoryFeedback[category] || 
      "❌ Resposta incorreta. Revise o material sobre este tópico e tente novamente.";

    // Usar feedback específico da questão se disponível
    if (question.feedback) {
      return `❌ ${question.feedback}`;
    }

    return specificFeedback;
  }

  /**
   * Gera relatório completo de progresso
   */
  static generateProgressReport(attempt: QuizAttempt): ProgressReport {
    const totalQuestions = attempt.feedback.length;
    const correctAnswers = attempt.feedback.filter(f => f.isCorrect).length;
    const incorrectQuestions = attempt.feedback.filter(f => !f.isCorrect);

    // Análise por categoria
    const categoryAnalysis = this.analyzeCategoryPerformance(attempt.feedback);

    return {
      score: attempt.score,
      percentage: attempt.percentage,
      passed: attempt.passed,
      summary: {
        total: totalQuestions,
        correct: correctAnswers,
        incorrect: totalQuestions - correctAnswers,
        timeSpent: attempt.timeSpent,
        attemptNumber: attempt.attemptNumber
      },
      recommendations: this.generateRecommendations(attempt, categoryAnalysis),
      incorrectQuestions: incorrectQuestions.map(q => ({
        questionId: q.questionId,
        category: q.category,
        explanation: q.explanation,
        feedback: q.customFeedback
      })),
      categoryAnalysis
    };
  }

  /**
   * Analisa performance por categoria de questões
   */
  private static analyzeCategoryPerformance(feedback: QuestionFeedback[]) {
    const categoryStats: Record<string, { total: number; correct: number }> = {};

    feedback.forEach(f => {
      const category = f.category || 'sem-categoria';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, correct: 0 };
      }
      categoryStats[category].total++;
      if (f.isCorrect) {
        categoryStats[category].correct++;
      }
    });

    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    })).sort((a, b) => a.percentage - b.percentage); // Pior performance primeiro
  }

  /**
   * Gera recomendações personalizadas
   */
  private static generateRecommendations(
    attempt: QuizAttempt, 
    categoryAnalysis: any[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (attempt.percentage < 70) {
      recommendations.push("📚 Recomendamos revisar o material do módulo antes de tentar novamente.");
      
      // Recomendações específicas por categoria com pior performance
      const weakCategories = categoryAnalysis.filter(cat => cat.percentage < 50);
      if (weakCategories.length > 0) {
        const categoryNames: Record<string, string> = {
          'conceitos-fundamentais': 'Conceitos fundamentais',
          'antropometria': 'Antropometria',
          'avaliacao-individual': 'Avaliação individual',
          'avaliacao-populacional': 'Avaliação populacional',
          'inqueritos-alimentares': 'Inquéritos alimentares',
          'metodologia-cientifica': 'Metodologia científica',
          'tecnicas-antropometricas': 'Técnicas antropométricas',
          'erros-antropometricos': 'Erros em antropometria',
          'anamnese-clinica': 'Anamnese clínica',
          'composicao-corporal': 'Composição corporal'
        };

        const weakTopics = weakCategories
          .map(cat => categoryNames[cat.category] || cat.category)
          .join(', ');
        
        recommendations.push(`💡 Foque especialmente em: ${weakTopics}.`);
      }

      if (attempt.attemptNumber > 1) {
        recommendations.push("💪 Não desista! A persistência é fundamental para o aprendizado.");
      }
    }

    if (attempt.percentage >= 70 && attempt.percentage < 85) {
      recommendations.push("👍 Bom trabalho! Para melhorar ainda mais, revise os conceitos das questões incorretas.");
      
      if (attempt.timeSpent > 600) { // mais de 10 minutos
        recommendations.push("⏰ Tente ser mais eficiente com o tempo. A prática ajuda a ganhar confiança.");
      }
    }

    if (attempt.percentage >= 85 && attempt.percentage < 100) {
      recommendations.push("🎉 Excelente performance! Você demonstrou bom domínio do conteúdo.");
      recommendations.push("🎯 Para atingir a perfeição, revise os tópicos das questões que errou.");
    }

    if (attempt.percentage === 100) {
      if (attempt.attemptNumber === 1) {
        recommendations.push("🏆 PERFEITO! Parabéns pela performance impecável na primeira tentativa!");
      } else {
        recommendations.push("🎉 EXCELENTE! Sua persistência foi recompensada com uma performance perfeita!");
      }
      recommendations.push("⭐ Você está pronto para avançar para o próximo módulo.");
    }

    // Recomendação sobre tempo
    if (attempt.timeSpent < 300) { // menos de 5 minutos
      recommendations.push("🤔 Você foi muito rápido. Considere ler as questões com mais atenção.");
    }

    return recommendations;
  }

  /**
   * Calcula estatísticas do estudante ao longo do tempo
   */
  static calculateStudentStats(attempts: QuizAttempt[]): StudentQuizStats {
    if (attempts.length === 0) {
      throw new Error('Nenhuma tentativa encontrada');
    }

    const sortedAttempts = attempts.sort((a, b) => {
      const aDate = parseFirebaseDate(a.startedAt)
      const bDate = parseFirebaseDate(b.startedAt)
      const aTime = aDate?.getTime() || 0
      const bTime = bDate?.getTime() || 0
      return aTime - bTime
    });

    const scores = attempts.map(a => a.score);
    const percentages = attempts.map(a => a.percentage);
    const totalTime = attempts.reduce((sum, a) => sum + a.timeSpent, 0);
    const completedAttempts = attempts.filter(a => a.passed);

    return {
      studentId: attempts[0].studentId,
      moduleId: attempts[0].moduleId,
      totalAttempts: attempts.length,
      bestScore: Math.max(...scores),
      bestPercentage: Math.max(...percentages),
      averageScore: Math.round((scores.reduce((sum, s) => sum + s, 0) / scores.length) * 100) / 100,
      averagePercentage: Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length),
      totalTimeSpent: totalTime,
      firstAttemptDate: sortedAttempts[0].startedAt,
      lastAttemptDate: sortedAttempts[sortedAttempts.length - 1].startedAt,
      isCompleted: completedAttempts.length > 0,
      completedAt: completedAttempts.length > 0 ? completedAttempts[0].completedAt : undefined
    };
  }

  /**
   * Verifica se o estudante pode tentar novamente
   */
  static canRetakeQuiz(lastAttempt: QuizAttempt): boolean {
    // Pode tentar novamente se não passou no último teste
    return !lastAttempt.passed;
  }

  /**
   * Calcula tempo médio por questão
   */
  static calculateAverageTimePerQuestion(attempt: QuizAttempt): number {
    return Math.round(attempt.timeSpent / attempt.feedback.length);
  }

  /**
   * Identifica padrões de erro
   */
  static identifyErrorPatterns(attempts: QuizAttempt[]): Record<string, number> {
    const errorsByCategory: Record<string, number> = {};

    attempts.forEach(attempt => {
      attempt.feedback.forEach(feedback => {
        if (!feedback.isCorrect && feedback.category) {
          errorsByCategory[feedback.category] = (errorsByCategory[feedback.category] || 0) + 1;
        }
      });
    });

    return errorsByCategory;
  }
}