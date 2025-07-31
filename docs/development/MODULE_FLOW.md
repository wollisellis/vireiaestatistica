# Fluxo de Produção de Módulos - AvaliaNutri

Este documento descreve o fluxo completo para criação e integração de novos módulos educacionais na plataforma.

## Visão Geral

Sistema modular flexível que suporta diferentes tipos de jogos educacionais com:
- Controle de acesso global pelo professor
- Sistema de pontuação unificado
- Feedback educacional baseado no método EA2
- Integração automática com ranking
- Contador de progresso dinâmico

## Estrutura Base de um Módulo

### 1. Definição do Módulo (`src/data/modules.ts`)

```typescript
{
  id: 'module-X',
  title: 'Nome do Módulo',
  description: 'Descrição detalhada do que o aluno aprenderá',
  icon: '🎯', // Emoji representativo
  estimatedTime: 'XX min',
  maxPoints?: number, // Opcional, padrão 100
  exercises?: any[], // Dados específicos do jogo
  content?: any[], // Conteúdo educacional
}
```

### 2. Implementação do Jogo

#### Localização
- **Diretório**: `src/app/jogos/modulo-X/`
- **Componente principal**: `src/app/jogos/modulo-X/quiz/page.tsx`

#### Tipos de Jogos Implementados

**A) Múltipla Escolha (Módulo 1)**
- Banco de questões: `src/data/questionBanks/module1QuestionBank.ts`
- Shuffler de questões: `src/utils/quizShuffler.ts`
- Interface: `RandomizedQuizComponent`
- Pontuação: 70 pontos

**B) Drag-and-Drop (Módulo 2)**
- Banco de métodos: `src/data/questionBanks/module2QuestionBank.ts`
- Interface customizada com zonas de drop
- Feedback contextual por categoria
- Pontuação: 30 pontos

#### Tipos Futuros Possíveis
- **Simulação Interativa**: Para cálculos nutricionais
- **Caso Clínico**: Análise de pacientes virtuais
- **Matching/Correspondência**: Relacionar conceitos
- **Puzzle Nutricional**: Montagem de dietas
- **Timeline**: Sequência de processos fisiológicos

### 3. Banco de Questões/Dados

```typescript
// Estrutura para múltipla escolha
export const moduleXQuestionBank: QuestionBank = {
  id: 'bank-module-X',
  moduleId: 'module-X',
  title: 'Título do Banco',
  totalQuestions: number,
  questionsPerQuiz: number,
  totalPoints: number,
  passingScore: number,
  questions: Question[]
}

// Estrutura para outros tipos
export const moduleXData = {
  // Dados específicos do tipo de jogo
  items: any[],
  categories: any[],
  rules: any[],
  // etc.
}
```

### 4. Sistema de Pontuação

#### Configuração (`src/services/unifiedScoringService.ts`)

```typescript
// Adicionar peso do módulo
const MODULE_WEIGHTS = {
  'module-1': 70,
  'module-2': 30,
  'module-X': XXX, // Definir peso
}
```

#### Integração Automática
- Salvamento automático da pontuação
- Atualização do ranking global
- Cálculo do progresso do aluno
- Sincronização com Firebase

### 5. Feedback Educacional (Método EA2)

#### Implementação no Componente

```typescript
const generateEducationalFeedback = (
  userAnswer: any,
  correctAnswer: any,
  context: any
) => {
  return {
    explanation: "Por que a resposta está incorreta",
    tip: "Dica para entender o conceito",
    correctInfo: "Informação correta",
    relatedConcepts: ["Conceito A", "Conceito B"]
  }
}
```

#### Princípios EA2
- **Exposição**: Apresentar o conceito correto
- **Análise**: Explicar o erro do aluno
- **Contextualização**: Relacionar com casos reais
- **Reforço**: Dicas para fixação

### 6. Controle de Acesso Global

#### Fluxo de Controle
1. **Professor** acessa `/docente`
2. **Ativa/Desativa** módulos na seção "Controle de Módulos"
3. **Configuração salva** em Firebase `settings/modules`
4. **Alunos em `/jogos`** veem apenas módulos ativos

#### Estados
- **Desbloqueado**: Aparece para todos os alunos
- **Bloqueado**: Não aparece na lista de módulos

### 7. Contador de Progresso

#### Formato: X/N
- **X**: Módulos completados pelo aluno específico
- **N**: Total de módulos desbloqueados no sistema
- **Exemplo**: "2/3" = aluno completou 2 de 3 módulos disponíveis

#### Atualização Dinâmica
- Recalculado quando professor ativa/desativa módulos
- Atualizado quando aluno completa módulo
- Sincronizado em tempo real

## Checklist para Novo Módulo

### ✅ Desenvolvimento
- [ ] Definir módulo em `modules.ts`
- [ ] Criar banco de questões/dados
- [ ] Implementar componente do jogo
- [ ] Configurar peso no `unifiedScoringService`
- [ ] Implementar feedback educacional EA2
- [ ] Testar integração com sistema de pontuação

### ✅ Configuração
- [ ] Adicionar às configurações globais
- [ ] Testar controle de acesso via `/docente`
- [ ] Verificar aparição em `/jogos`
- [ ] Validar contador de progresso

### ✅ Qualidade
- [ ] Testar todos os caminhos do jogo
- [ ] Validar feedback para erros comuns
- [ ] Verificar responsividade mobile
- [ ] Testar integração com ranking

## Padrões de Código

### Nomenclatura
- **Módulo**: `module-X` (sempre com hífen)
- **Componente**: `ModuleXQuiz` ou `ModuleXGame`
- **Banco**: `moduleXQuestionBank` ou `moduleXData`

### Estrutura de Arquivos
```
src/app/jogos/modulo-X/
├── quiz/
│   └── page.tsx          # Componente principal
├── components/           # Componentes específicos (opcional)
└── utils/               # Utilitários específicos (opcional)
```

### Integração com Unificadores
- **Pontuação**: Usar `unifiedScoringService.saveScore()`
- **Progresso**: Usar hooks existentes (`useModuleProgress`)
- **Navegação**: Seguir padrão de roteamento

## Troubleshooting Comum

### Módulo não aparece em /jogos
- Verificar se está em `modules.ts`
- Verificar se está desbloqueado em `settings/modules`
- Verificar filtros no componente de listagem

### Pontuação não salva
- Verificar integração com `unifiedScoringService`
- Verificar permissões do Firebase
- Verificar formato dos dados enviados

### Feedback não aparece
- Verificar implementação da função de feedback
- Verificar estados de erro/acerto
- Verificar renderização condicional

---

**Última atualização**: 2025-07-31  
**Mantido por**: Claude Code + Ellis Wollis Malta Abhulime  
**Versão do sistema**: 0.9.5