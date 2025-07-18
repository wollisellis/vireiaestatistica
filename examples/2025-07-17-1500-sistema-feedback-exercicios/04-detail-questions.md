# Perguntas Especializadas - Sistema de Feedback

## Contexto Técnico
Baseado na análise, identificamos:
- `LiveScoreFeedback.tsx` já implementa feedback similar
- Framer Motion disponível para animações
- Sistema de pontuação unificado existente

## Perguntas Técnicas Detalhadas

### Pergunta 1
**Devemos estender o componente LiveScoreFeedback existente em `src/components/scoring/LiveScoreFeedback.tsx`?**
- Padrão se não souber: SIM - reutilizar código existente e manter consistência

### Pergunta 2
**O feedback deve usar as mesmas cores do Tailwind já definidas (green-500 para sucesso, red-500 para erro)?**
- Padrão se não souber: SIM - manter consistência visual

### Pergunta 3
**Devemos integrar com o hook useUnifiedScore para registrar pontuação automaticamente?**
- Padrão se não souber: SIM - manter sistema de pontuação coeso

### Pergunta 4
**As explicações devem aparecer em um modal/dialog ou inline abaixo da questão?**
- Padrão se não souber: INLINE - menos intrusivo e melhor para fluxo

### Pergunta 5
**O feedback deve ter delay mínimo de 300ms para evitar mudanças bruscas?**
- Padrão se não souber: SIM - melhora percepção visual