// Banco de questões do Módulo 1: Introdução à Avaliação Nutricional
// 14 questões → 7 sorteadas aleatoriamente = 10 pontos total

import { QuestionBank } from '@/types/randomizedQuiz';

export const module1QuestionBank: QuestionBank = {
  id: 'bank-module-1',
  moduleId: 'module-1',
  title: 'Introdução à Avaliação Nutricional',
  totalQuestions: 14,
  questionsPerQuiz: 7,
  totalPoints: 10,
  passingScore: 70,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: 'q1-objetivos-avaliacao',
      text: 'Qual das opções abaixo NÃO é um objetivo da Avaliação Nutricional?',
      options: [
        'Estabelecer situações de risco para a saúde',
        'Planejar ações de promoção à saúde',
        'Avaliar respostas imunológicas específicas',
        'Prevenir doenças por meio de diagnóstico precoce'
      ],
      correctAnswer: 'Avaliar respostas imunológicas específicas',
      explanation: 'A avaliação nutricional foca na análise do estado nutricional e seus impactos na saúde, não incluindo avaliações imunológicas específicas, que são campo da imunologia.',
      feedback: 'A avaliação nutricional tem objetivos específicos relacionados ao diagnóstico e intervenção nutricional. Respostas imunológicas específicas são avaliadas por outras áreas da saúde.',
      difficulty: 'easy',
      category: 'conceitos-fundamentais',
      timeToAnswer: 60
    },
    {
      id: 'q2-avaliacao-individual',
      text: 'A avaliação nutricional individual NÃO inclui obrigatoriamente:',
      options: [
        'Inquéritos alimentares',
        'Medidas antropométricas',
        'Dosagem de anticorpos específicos',
        'Exames bioquímicos'
      ],
      correctAnswer: 'Dosagem de anticorpos específicos',
      explanation: 'A dosagem de anticorpos específicos não faz parte da avaliação nutricional básica, sendo um exame especializado de imunologia.',
      feedback: 'A avaliação nutricional individual é composta por componentes específicos. Anticorpos específicos são exames imunológicos, não nutricionais.',
      difficulty: 'easy',
      category: 'avaliacao-individual',
      timeToAnswer: 60
    },
    {
      id: 'q3-circunferencia-cefalica',
      text: 'A circunferência cefálica é uma medida antropométrica especialmente útil em:',
      options: [
        'Atletas',
        'Idosos',
        'Adultos jovens',
        'Crianças pequenas'
      ],
      correctAnswer: 'Crianças pequenas',
      explanation: 'A circunferência cefálica é um indicador importante do crescimento e desenvolvimento cerebral, sendo crucial na avaliação de crianças pequenas.',
      feedback: 'A medida da circunferência cefálica é padrão na avaliação pediátrica para monitorar o desenvolvimento neurológico adequado.',
      difficulty: 'medium',
      category: 'antropometria',
      timeToAnswer: 45
    },
    {
      id: 'q4-objetivos-disciplina',
      text: 'Um dos objetivos da disciplina apresentada é:',
      options: [
        'Aprofundar a legislação brasileira de rotulagem de alimentos',
        'Desenvolver habilidades práticas em dietoterapia hospitalar',
        'Introduzir conceitos e ferramentas para avaliação do estado nutricional',
        'Focar exclusivamente em aspectos bioquímicos da nutrição'
      ],
      correctAnswer: 'Introduzir conceitos e ferramentas para avaliação do estado nutricional',
      explanation: 'O objetivo principal da disciplina é fornecer uma base sólida em conceitos e ferramentas práticas para avaliação nutricional.',
      feedback: 'A disciplina tem foco amplo na avaliação nutricional, não se limitando a aspectos específicos como legislação ou bioquímica apenas.',
      difficulty: 'easy',
      category: 'conceitos-fundamentais',
      timeToAnswer: 50
    },
    {
      id: 'q5-areas-disciplina',
      text: 'Qual das áreas abaixo NÃO está explicitamente mencionada como foco da disciplina?',
      options: [
        'Avaliação nutricional individual',
        'Avaliação nutricional populacional',
        'Bioinformática aplicada à nutrição',
        'Indicadores antropométricos'
      ],
      correctAnswer: 'Bioinformática aplicada à nutrição',
      explanation: 'Bioinformática não é mencionada como foco da disciplina, que se concentra em métodos tradicionais de avaliação nutricional.',
      feedback: 'A disciplina aborda métodos clássicos de avaliação nutricional. Bioinformática é uma área especializada não coberta neste curso introdutório.',
      difficulty: 'medium',
      category: 'conceitos-fundamentais',
      timeToAnswer: 55
    },
    {
      id: 'q6-anamnese-alimentar',
      text: 'Qual das alternativas está corretamente associada à anamnese alimentar?',
      options: [
        'Medição de gordura subcutânea',
        'Dosagem sérica de micronutrientes',
        'Registro alimentar de 3-7 dias',
        'Testes de intolerância alimentar'
      ],
      correctAnswer: 'Registro alimentar de 3-7 dias',
      explanation: 'O registro alimentar de 3-7 dias é um dos principais métodos de anamnese alimentar para avaliar o consumo habitual de alimentos.',
      feedback: 'A anamnese alimentar utiliza diferentes métodos de coleta de dados sobre consumo alimentar, sendo o registro de múltiplos dias uma ferramenta padrão.',
      difficulty: 'medium',
      category: 'inqueritos-alimentares',
      timeToAnswer: 50
    },
    {
      id: 'q7-diagnostico-populacional',
      text: 'O diagnóstico nutricional populacional é mais comumente baseado em:',
      options: [
        'Biopsias musculares',
        'Curvas de crescimento e medidas antropométricas',
        'Sequenciamento genético em massa',
        'Avaliação por ressonância magnética'
      ],
      correctAnswer: 'Curvas de crescimento e medidas antropométricas',
      explanation: 'Para populações, utilizam-se métodos práticos e aplicáveis em larga escala, como antropometria e curvas de crescimento padronizadas.',
      feedback: 'O diagnóstico populacional requer métodos aplicáveis em grande escala. Métodos caros ou invasivos não são viáveis para estudos populacionais.',
      difficulty: 'medium',
      category: 'avaliacao-populacional',
      timeToAnswer: 55
    },
    {
      id: 'q8-gasto-energetico',
      text: 'A estimativa de gasto energético NÃO é influenciada por:',
      options: [
        'Atividade física',
        'Estado fisiológico (como gestação)',
        'Volume de ingestão hídrica',
        'Composição corporal'
      ],
      correctAnswer: 'Volume de ingestão hídrica',
      explanation: 'O volume de ingestão hídrica não afeta significativamente o gasto energético, ao contrário dos outros fatores listados.',
      feedback: 'O gasto energético é determinado principalmente por fatores metabólicos. A ingestão hídrica, embora importante para a saúde, não influencia o gasto calórico.',
      difficulty: 'medium',
      category: 'metabolismo-energetico',
      timeToAnswer: 50
    },
    {
      id: 'q9-populacoes-avaliacao',
      text: 'A disciplina inclui avaliação de estado nutricional de:',
      options: [
        'Apenas indivíduos hospitalizados',
        'Crianças, adultos, idosos e populações',
        'Atletas de elite exclusivamente',
        'Animais experimentais exclusivamente'
      ],
      correctAnswer: 'Crianças, adultos, idosos e populações',
      explanation: 'A disciplina oferece uma abordagem abrangente, cobrindo diferentes faixas etárias e níveis de análise (individual e populacional).',
      feedback: 'A avaliação nutricional é uma área ampla que deve ser aplicável a diferentes grupos populacionais e contextos clínicos.',
      difficulty: 'easy',
      category: 'escopo-disciplina',
      timeToAnswer: 40
    },
    {
      id: 'q10-abordagem-cientifica',
      text: 'O conteúdo da disciplina destaca a importância de qual abordagem científica para a avaliação nutricional?',
      options: [
        'Análise subjetiva baseada em entrevistas abertas',
        'Ferramentas empíricas de observação clínica',
        'Métodos baseados em evidências científicas e indicadores objetivos',
        'Técnicas de adivinhação de padrões alimentares'
      ],
      correctAnswer: 'Métodos baseados em evidências científicas e indicadores objetivos',
      explanation: 'A disciplina enfatiza o uso de métodos científicos rigorosos e indicadores objetivos e validados para garantir precisão diagnóstica.',
      feedback: 'A prática nutricional moderna baseia-se em evidências científicas e métodos objetivos para garantir diagnósticos precisos e intervenções eficazes.',
      difficulty: 'easy',
      category: 'metodologia-cientifica',
      timeToAnswer: 60
    },
    {
      id: 'q11-altura-criancas',
      text: 'A altura de crianças maiores de 2 anos deve ser medida:',
      options: [
        'Com a criança deitada',
        'Com trena flexível',
        'Com estadiômetro, em pé',
        'Em balança pediátrica'
      ],
      correctAnswer: 'Com estadiômetro, em pé',
      explanation: 'Para crianças maiores de 2 anos que conseguem ficar em pé, utiliza-se o estadiômetro na posição vertical, seguindo protocolos padronizados.',
      feedback: 'A técnica de medição da altura varia conforme a idade. Crianças maiores de 2 anos já podem ser medidas em pé, como adultos.',
      difficulty: 'easy',
      category: 'tecnicas-antropometricas',
      timeToAnswer: 45
    },
    {
      id: 'q12-erros-coleta-altura',
      text: 'O que pode prejudicar a coleta de dados de altura/comprimento em crianças?',
      options: [
        'Criança em jejum',
        'Uso de roupas leves',
        'Posições incorretas durante o procedimento',
        'Horário da coleta'
      ],
      correctAnswer: 'Posições incorretas durante o procedimento',
      explanation: 'A posição incorreta da criança durante a medição é o principal fator que pode comprometer a precisão da medida antropométrica.',
      feedback: 'A precisão das medidas antropométricas depende fundamentalmente da técnica correta. Posicionamento inadequado é a principal fonte de erro.',
      difficulty: 'medium',
      category: 'erros-antropometricos',
      timeToAnswer: 50
    },
    {
      id: 'q13-historia-clinica',
      text: 'A história clínica na avaliação nutricional inclui, EXCETO:',
      options: [
        'Antecedentes familiares',
        'História de desenvolvimento',
        'Resultados de exames genéticos',
        'Fatores socioeconômicos'
      ],
      correctAnswer: 'Resultados de exames genéticos',
      explanation: 'Exames genéticos não fazem parte da história clínica padrão em avaliação nutricional, sendo testes especializados específicos.',
      feedback: 'A história clínica nutricional foca em aspectos clínicos, sociais e de desenvolvimento. Testes genéticos são especializados e não fazem parte da avaliação básica.',
      difficulty: 'medium',
      category: 'anamnese-clinica',
      timeToAnswer: 55
    },
    {
      id: 'q14-composicao-corporal',
      text: 'Em relação à composição corporal, um dos componentes básicos destacados na aula é:',
      options: [
        'Fosfato',
        'Adipócitos',
        'Vitamina D',
        'Cálcio'
      ],
      correctAnswer: 'Adipócitos',
      explanation: 'Os adipócitos (células de gordura) são um dos componentes básicos da composição corporal, representando o compartimento de gordura corporal.',
      feedback: 'A composição corporal é dividida em compartimentos básicos. Adipócitos representam o tecido adiposo, um dos principais componentes corporais.',
      difficulty: 'easy',
      category: 'composicao-corporal',
      timeToAnswer: 45
    }
  ]
};

// Validações do banco de questões
export const validateQuestionBank = (bank: QuestionBank): boolean => {
  // Verificar se tem questões suficientes
  if (bank.questions.length < bank.questionsPerQuiz) {
    console.error(`Banco insuficiente: ${bank.questions.length} questões, necessárias: ${bank.questionsPerQuiz}`);
    return false;
  }

  // Verificar se todas as questões têm 4 opções
  for (const question of bank.questions) {
    if (question.options.length !== 4) {
      console.error(`Questão ${question.id} não tem 4 opções`);
      return false;
    }

    // Verificar se a resposta correta existe nas opções
    if (!question.options.includes(question.correctAnswer)) {
      console.error(`Questão ${question.id}: resposta correta não encontrada nas opções`);
      return false;
    }
  }

  return true;
};

// Estatísticas do banco
export const getBankStatistics = (bank: QuestionBank) => {
  const difficulties = bank.questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = bank.questions.reduce((acc, q) => {
    const cat = q.category || 'sem-categoria';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalQuestions: bank.questions.length,
    questionsPerQuiz: bank.questionsPerQuiz,
    difficulties,
    categories,
    averageTimeToAnswer: bank.questions.reduce((sum, q) => sum + (q.timeToAnswer || 60), 0) / bank.questions.length
  };
};