# Especificação de Requisitos - Sistema de Feedback Visual

## Resumo Executivo
Implementar sistema de feedback visual educativo para exercícios da plataforma AvaliaNutri, estendendo componentes existentes e mantendo consistência com o design system atual.

## Requisitos Funcionais

### 1. Feedback Imediato
- Mostrar resultado assim que aluno responder
- Sem delays artificiais
- Transição suave com Framer Motion

### 2. Feedback Visual
- ✅ Correto: Ícone Check + cor green-500 + animação de sucesso
- ❌ Incorreto: Ícone X + cor red-500 + animação de erro
- Usar ícones do Lucide React já instalado

### 3. Explicações Educativas
- Aparecer inline abaixo da questão
- Apenas para respostas incorretas
- Formatação com markdown suportada
- Fundo com opacity para destaque

### 4. Integração com Pontuação
- Usar hook `useUnifiedScore`
- Registrar pontos automaticamente
- Mostrar pontos ganhos/perdidos

### 5. Comportamento
- Não persistir histórico entre questões
- Limpar feedback ao mudar de exercício
- Manter feedback visível até próxima ação

## Requisitos Técnicos

### Arquivos a Modificar

1. **Estender LiveScoreFeedback**
   ```
   src/components/scoring/LiveScoreFeedback.tsx
   ```
   - Adicionar prop `explanation?: string`
   - Adicionar renderização condicional

2. **Criar EnhancedExerciseFeedback**
   ```
   src/components/exercises/EnhancedExerciseFeedback.tsx
   ```
   - Wrapper que combina LiveScoreFeedback + explicações
   - Props: `isCorrect`, `points`, `explanation`

3. **Atualizar ExerciseRenderer**
   ```
   src/components/exercises/ExerciseRenderer.tsx
   ```
   - Integrar novo componente de feedback
   - Passar estado de resposta

4. **Tipos TypeScript**
   ```typescript
   interface ExerciseFeedback {
     isCorrect: boolean;
     points: number;
     explanation?: string;
     showFeedback: boolean;
   }
   ```

### Padrões de Implementação

1. **Animações (Framer Motion)**
   ```tsx
   const feedbackVariants = {
     initial: { opacity: 0, y: -10 },
     animate: { opacity: 1, y: 0 },
     exit: { opacity: 0, y: -10 }
   };
   ```

2. **Cores Tailwind**
   - Sucesso: `bg-green-50 border-green-500 text-green-700`
   - Erro: `bg-red-50 border-red-500 text-red-700`

3. **Estrutura de Componente**
   ```tsx
   <AnimatePresence>
     {showFeedback && (
       <motion.div variants={feedbackVariants}>
         <LiveScoreFeedback />
         {!isCorrect && explanation && (
           <ExplanationBox />
         )}
       </motion.div>
     )}
   </AnimatePresence>
   ```

### Integração com Sistema Existente

1. **Hook useUnifiedScore**
   - Chamar `updateScore()` ao mostrar feedback
   - Respeitar configurações de módulo

2. **Eventos de Exercício**
   - Emitir evento `onAnswerFeedback`
   - Permitir tracking Analytics

3. **Acessibilidade**
   - Aria-live para leitores de tela
   - Foco automático em explicações

## Critérios de Aceitação

- [ ] Feedback aparece imediatamente após resposta
- [ ] Cores e ícones corretos para cada estado
- [ ] Explicações visíveis apenas para erros
- [ ] Animações suaves sem delay
- [ ] Pontuação registrada corretamente
- [ ] Componente reutilizável para todos exercícios
- [ ] Testes unitários para novo componente
- [ ] Documentação de props atualizada

## Próximos Passos

1. Criar branch `feature/enhanced-exercise-feedback`
2. Implementar EnhancedExerciseFeedback.tsx
3. Integrar com ExerciseRenderer
4. Testar com diferentes tipos de exercício
5. Ajustar animações se necessário
6. Documentar uso para outros devs

## Notas de Implementação

- Manter retrocompatibilidade com exercícios existentes
- Considerar modo de alto contraste para acessibilidade
- Possibilidade futura: sons de feedback (desabilitado por padrão)