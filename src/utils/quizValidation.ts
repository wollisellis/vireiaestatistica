// Utilitários de validação e teste para o sistema de quiz
// Garante integridade dos dados e funcionamento correto

import { QuestionBank, RandomizedQuiz, QuizAttempt } from '@/types/randomizedQuiz';
import { QuizShuffler } from './quizShuffler';
import { QuizScoringService } from '@/services/quizScoringService';
import { module1QuestionBank } from '@/data/questionBanks/module1QuestionBank';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class QuizValidation {
  /**
   * Valida integridade do banco de questões
   */
  static validateQuestionBank(bank: QuestionBank): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Verificar campos obrigatórios
    if (!bank.id || !bank.moduleId || !bank.title) {
      errors.push('Campos obrigatórios do banco de questões não preenchidos');
    }

    // Verificar se tem questões suficientes
    if (bank.questions.length < bank.questionsPerQuiz) {
      errors.push(`Questões insuficientes: ${bank.questions.length} disponíveis, ${bank.questionsPerQuiz} necessárias`);
    }

    // Verificar cada questão
    bank.questions.forEach((question, index) => {
      const questionErrors = this.validateQuestion(question, index);
      errors.push(...questionErrors);
    });

    // Verificar distribuição de dificuldades
    const difficulties = bank.questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (!difficulties.easy) {
      warnings.push('Nenhuma questão fácil encontrada');
    }
    if (!difficulties.medium) {
      warnings.push('Nenhuma questão média encontrada');
    }
    if (!difficulties.hard) {
      warnings.push('Nenhuma questão difícil encontrada');
    }

    // Verificar IDs únicos
    const ids = bank.questions.map(q => q.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('IDs de questões não são únicos');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida questão individual
   */
  private static validateQuestion(question: any, index: number): string[] {
    const errors: string[] = [];

    // Campos obrigatórios
    if (!question.id) errors.push(`Questão ${index}: ID não definido`);
    if (!question.text) errors.push(`Questão ${index}: Texto não definido`);
    if (!question.correctAnswer) errors.push(`Questão ${index}: Resposta correta não definida`);
    if (!question.explanation) errors.push(`Questão ${index}: Explicação não definida`);

    // Opções
    if (!Array.isArray(question.options)) {
      errors.push(`Questão ${index}: Opções não são um array`);
    } else {
      if (question.options.length !== 4) {
        errors.push(`Questão ${index}: Deve ter exatamente 4 opções, tem ${question.options.length}`);
      }

      // Verificar se resposta correta está nas opções
      if (!question.options.includes(question.correctAnswer)) {
        errors.push(`Questão ${index}: Resposta correta não encontrada nas opções`);
      }

      // Verificar opções únicas
      const uniqueOptions = new Set(question.options);
      if (question.options.length !== uniqueOptions.size) {
        errors.push(`Questão ${index}: Opções não são únicas`);
      }
    }

    // Dificuldade válida
    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push(`Questão ${index}: Dificuldade inválida: ${question.difficulty}`);
    }

    return errors;
  }

  /**
   * Testa algoritmo de embaralhamento
   */
  static testShuffleAlgorithm(iterations: number = 100): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const testQuestions = module1QuestionBank.questions.slice(0, 7);
      const seeds = Array.from({ length: iterations }, (_, i) => `test_seed_${i}`);
      
      // Testar consistência com mesmo seed
      const seed1 = 'consistent_test_seed';
      const shuffle1 = QuizShuffler.selectRandomQuestions(testQuestions, 5, seed1);
      const shuffle2 = QuizShuffler.selectRandomQuestions(testQuestions, 5, seed1);
      
      if (JSON.stringify(shuffle1) !== JSON.stringify(shuffle2)) {
        errors.push('Algoritmo não é determinístico com mesmo seed');
      }

      // Testar variação com seeds diferentes
      const results = seeds.map(seed => 
        QuizShuffler.selectRandomQuestions(testQuestions, 5, seed)
          .map(q => q.id)
          .join(',')
      );
      
      const uniqueResults = new Set(results);
      const variationRate = uniqueResults.size / results.length;
      
      if (variationRate < 0.5) {
        warnings.push(`Baixa variação no embaralhamento: ${Math.round(variationRate * 100)}%`);
      }

      // Testar embaralhamento de opções
      const testQuestion = testQuestions[0];
      const shuffled1 = QuizShuffler.shuffleQuestionOptions(testQuestion, seed1);
      const shuffled2 = QuizShuffler.shuffleQuestionOptions(testQuestion, seed1);
      
      if (JSON.stringify(shuffled1.shuffledOptions) !== JSON.stringify(shuffled2.shuffledOptions)) {
        errors.push('Embaralhamento de opções não é determinístico');
      }

      // Verificar se resposta correta é mantida
      const originalCorrect = testQuestion.correctAnswer;
      const shuffledCorrect = shuffled1.shuffledOptions[shuffled1.correctOptionIndex];
      
      if (originalCorrect !== shuffledCorrect) {
        errors.push('Resposta correta não mantida após embaralhamento');
      }

    } catch (error) {
      errors.push(`Erro durante teste de embaralhamento: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Testa sistema de pontuação
   */
  static testScoringSystem(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Criar quiz de teste
      const mockQuiz: RandomizedQuiz = {
        id: 'test_quiz',
        studentId: 'test_student',
        questionBankId: 'test_bank',
        moduleId: 'module-1',
        selectedQuestions: module1QuestionBank.questions.slice(0, 7).map(q => 
          QuizShuffler.shuffleQuestionOptions(q, 'test_seed')
        ),
        createdAt: new Date(),
        seed: 'test_seed'
      };

      // Teste 1: 100% de acertos
      const perfectAnswers: Record<string, string> = {};
      mockQuiz.selectedQuestions.forEach(q => {
        perfectAnswers[q.originalId] = q.shuffledOptions[q.correctOptionIndex];
      });

      const perfectAttempt = QuizScoringService.calculateScore(perfectAnswers, mockQuiz, 10, 1);
      
      if (perfectAttempt.percentage !== 100) {
        errors.push(`Pontuação 100% incorreta: ${perfectAttempt.percentage}%`);
      }
      if (!perfectAttempt.passed) {
        errors.push('Tentativa perfeita não marcada como aprovada');
      }
      if (perfectAttempt.score !== 10) {
        errors.push(`Pontuação máxima incorreta: ${perfectAttempt.score}/10`);
      }

      // Teste 2: 70% de acertos (limiar de aprovação)
      const passingAnswers: Record<string, string> = {};
      mockQuiz.selectedQuestions.slice(0, 5).forEach(q => {
        passingAnswers[q.originalId] = q.shuffledOptions[q.correctOptionIndex];
      });
      mockQuiz.selectedQuestions.slice(5).forEach(q => {
        passingAnswers[q.originalId] = q.shuffledOptions[0]; // resposta incorreta
      });

      const passingAttempt = QuizScoringService.calculateScore(passingAnswers, mockQuiz, 10, 1);
      
      if (Math.round(passingAttempt.percentage) !== 71) { // 5/7 ≈ 71%
        warnings.push(`Pontuação 70% não está em 71%: ${passingAttempt.percentage}%`);
      }
      if (!passingAttempt.passed) {
        errors.push('Tentativa de 71% não marcada como aprovada');
      }

      // Teste 3: 0% de acertos
      const zeroAnswers: Record<string, string> = {};
      mockQuiz.selectedQuestions.forEach(q => {
        // Selecionar primeira opção incorreta
        const incorrectIndex = q.correctOptionIndex === 0 ? 1 : 0;
        zeroAnswers[q.originalId] = q.shuffledOptions[incorrectIndex];
      });

      const zeroAttempt = QuizScoringService.calculateScore(zeroAnswers, mockQuiz, 10, 1);
      
      if (zeroAttempt.percentage !== 0) {
        errors.push(`Pontuação 0% incorreta: ${zeroAttempt.percentage}%`);
      }
      if (zeroAttempt.passed) {
        errors.push('Tentativa de 0% marcada como aprovada');
      }
      if (zeroAttempt.score !== 0) {
        errors.push(`Pontuação zero incorreta: ${zeroAttempt.score}/10`);
      }

    } catch (error) {
      errors.push(`Erro durante teste de pontuação: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Executa todos os testes
   */
  static runAllTests(): {
    questionBank: ValidationResult;
    shuffleAlgorithm: ValidationResult;
    scoringSystem: ValidationResult;
    overall: ValidationResult;
  } {
    console.log('🧪 Executando testes do sistema de quiz...');

    const questionBank = this.validateQuestionBank(module1QuestionBank);
    const shuffleAlgorithm = this.testShuffleAlgorithm(50);
    const scoringSystem = this.testScoringSystem();

    const allErrors = [
      ...questionBank.errors,
      ...shuffleAlgorithm.errors,
      ...scoringSystem.errors
    ];

    const allWarnings = [
      ...questionBank.warnings,
      ...shuffleAlgorithm.warnings,
      ...scoringSystem.warnings
    ];

    const overall: ValidationResult = {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };

    // Log dos resultados
    console.log('📊 Banco de Questões:', questionBank.isValid ? '✅ Válido' : '❌ Inválido');
    console.log('🔀 Algoritmo de Embaralhamento:', shuffleAlgorithm.isValid ? '✅ Válido' : '❌ Inválido');
    console.log('🏆 Sistema de Pontuação:', scoringSystem.isValid ? '✅ Válido' : '❌ Inválido');
    console.log('🎯 Resultado Geral:', overall.isValid ? '✅ Todos os testes passaram' : '❌ Falhas encontradas');

    if (allErrors.length > 0) {
      console.error('❌ Erros encontrados:');
      allErrors.forEach(error => console.error(`  - ${error}`));
    }

    if (allWarnings.length > 0) {
      console.warn('⚠️ Avisos:');
      allWarnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    return {
      questionBank,
      shuffleAlgorithm,
      scoringSystem,
      overall
    };
  }

  /**
   * Gera relatório de estatísticas do banco
   */
  static generateBankReport(bank: QuestionBank): {
    summary: any;
    categories: Record<string, number>;
    difficulties: Record<string, number>;
    averageTimeToAnswer: number;
  } {
    const categories = bank.questions.reduce((acc, q) => {
      const cat = q.category || 'sem-categoria';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficulties = bank.questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageTimeToAnswer = bank.questions.reduce((sum, q) => 
      sum + (q.timeToAnswer || 60), 0
    ) / bank.questions.length;

    return {
      summary: {
        totalQuestions: bank.questions.length,
        questionsPerQuiz: bank.questionsPerQuiz,
        totalPoints: bank.totalPoints,
        passingScore: bank.passingScore
      },
      categories,
      difficulties,
      averageTimeToAnswer
    };
  }
}

// Executar testes automaticamente em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // QuizValidation.runAllTests();
}