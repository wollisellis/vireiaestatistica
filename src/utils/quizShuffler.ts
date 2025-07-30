// Algoritmo de embaralhamento determinístico para questões aleatórias
// Estilo Khan Academy - garantindo reproduzibilidade com seeds

import { BankQuestion, ShuffledQuestion } from '@/types/randomizedQuiz';

export class QuizShuffler {
  /**
   * Gerador de números pseudoaleatórios baseado em seed
   * Usa Linear Congruential Generator para garantir reproduzibilidade
   */
  private static seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    
    hash = Math.abs(hash);
    hash = (a * hash + c) % m;
    return hash / m;
  }

  /**
   * Embaralha um array usando Fisher-Yates com seed determinístico
   */
  static shuffleArray<T>(array: T[], seed: string): T[] {
    const shuffled = [...array];
    let currentSeed = seed;
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Gerar novo seed baseado no anterior para cada iteração
      currentSeed = (parseInt(currentSeed.slice(-8), 36) + i).toString(36);
      const randomValue = this.seededRandom(currentSeed);
      const j = Math.floor(randomValue * (i + 1));
      
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  }

  /**
   * Seleciona questões aleatórias do banco
   * @param questions - Array de questões disponíveis
   * @param count - Número de questões a selecionar (7 para módulo 1)
   * @param seed - Seed para reproduzibilidade
   */
  static selectRandomQuestions(
    questions: BankQuestion[], 
    count: number, 
    seed: string
  ): BankQuestion[] {
    if (questions.length < count) {
      throw new Error(`Banco de questões insuficiente. Disponíveis: ${questions.length}, Necessárias: ${count}`);
    }

    // Embaralhar todas as questões
    const shuffled = this.shuffleArray(questions, seed);
    
    // Selecionar as primeiras 'count' questões
    return shuffled.slice(0, count);
  }

  /**
   * Embaralha as alternativas de uma questão
   * Mantém rastreamento da resposta correta
   */
  static shuffleQuestionOptions(
    question: BankQuestion, 
    seed: string
  ): ShuffledQuestion {
    // Criar array com opções e metadata
    const optionsWithMetadata = question.options.map((option, index) => ({
      option,
      isCorrect: option === question.correctAnswer,
      originalIndex: index
    }));

    // Embaralhar as opções usando seed específico para esta questão
    const questionSeed = `${seed}_${question.id}`;
    const shuffledOptions = this.shuffleArray(optionsWithMetadata, questionSeed);
    
    // Encontrar o índice da resposta correta após embaralhamento
    const correctIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

    if (correctIndex === -1) {
      throw new Error(`Resposta correta não encontrada para questão ${question.id}`);
    }

    return {
      originalId: question.id,
      text: question.text,
      shuffledOptions: shuffledOptions.map(opt => opt.option),
      correctOptionIndex: correctIndex,
      explanation: question.explanation,
      feedback: question.feedback,
      difficulty: question.difficulty,
      category: question.category
    };
  }

  /**
   * Gera seed único para um estudante e tentativa
   */
  static generateSeed(studentId: string, moduleId: string, attemptNumber: number = 1): string {
    const timestamp = Date.now().toString(36);
    const randomComponent = Math.random().toString(36).substring(2, 8);
    
    return `${studentId}_${moduleId}_${attemptNumber}_${timestamp}_${randomComponent}`;
  }

  /**
   * Valida se o embaralhamento foi bem-sucedido
   */
  static validateShuffling(
    original: BankQuestion[],
    shuffled: ShuffledQuestion[]
  ): boolean {
    // Verificar se o número de questões é o mesmo
    if (original.length !== shuffled.length) {
      return false;
    }

    // Verificar se todas as questões originais estão presentes
    const originalIds = new Set(original.map(q => q.id));
    const shuffledIds = new Set(shuffled.map(q => q.originalId));
    
    for (const id of originalIds) {
      if (!shuffledIds.has(id)) {
        return false;
      }
    }

    // Verificar se cada questão tem 4 opções embaralhadas
    for (const question of shuffled) {
      if (question.shuffledOptions.length !== 4) {
        return false;
      }
      
      if (question.correctOptionIndex < 0 || question.correctOptionIndex >= 4) {
        return false;
      }
    }

    return true;
  }

  /**
   * Cria distribuição balanceada de dificuldades
   * Garante que sempre há questões fáceis, médias e difíceis
   */
  static selectBalancedQuestions(
    questions: BankQuestion[], 
    count: number, 
    seed: string
  ): BankQuestion[] {
    const easy = questions.filter(q => q.difficulty === 'easy');
    const medium = questions.filter(q => q.difficulty === 'medium');
    const hard = questions.filter(q => q.difficulty === 'hard');

    // Distribuição fixa para garantir exatamente o número correto de questões
    const distribution = (() => {
      if (count === 7) {
        // Distribuição específica para 7 questões: 3 fáceis, 3 médias, 1 difícil
        return { easy: 3, medium: 3, hard: 1 };
      } else if (count === 4) {
        // Distribuição específica para 4 questões (módulo 2): 2 fáceis, 1 média, 1 difícil
        return { easy: 2, medium: 1, hard: 1 };
      } else {
        // Distribuição padrão proporcional para outros casos
        const easyCount = Math.floor(count * 0.4);
        const hardCount = Math.floor(count * 0.2);
        const mediumCount = count - easyCount - hardCount;
        return { easy: easyCount, medium: mediumCount, hard: hardCount };
      }
    })();

    const selected: BankQuestion[] = [];

    // Selecionar questões fáceis
    if (easy.length >= distribution.easy) {
      selected.push(...this.selectRandomQuestions(easy, distribution.easy, `${seed}_easy`));
    } else {
      selected.push(...easy);
    }

    // Selecionar questões médias
    if (medium.length >= distribution.medium) {
      selected.push(...this.selectRandomQuestions(medium, distribution.medium, `${seed}_medium`));
    } else {
      selected.push(...medium);
    }

    // Selecionar questões difíceis
    if (hard.length >= distribution.hard) {
      selected.push(...this.selectRandomQuestions(hard, distribution.hard, `${seed}_hard`));
    } else {
      selected.push(...hard);
    }

    // Se não atingiu o número necessário, completar com questões aleatórias
    const remaining = count - selected.length;
    if (remaining > 0) {
      const availableQuestions = questions.filter(q => 
        !selected.some(s => s.id === q.id)
      );
      
      if (availableQuestions.length >= remaining) {
        selected.push(...this.selectRandomQuestions(availableQuestions, remaining, `${seed}_remaining`));
      }
    }

    // Embaralhar a ordem final das questões selecionadas
    return this.shuffleArray(selected, `${seed}_final`);
  }
}