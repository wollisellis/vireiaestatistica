# Requirements Remind

Lembra a IA das regras do sistema de coleta de requisitos.

## Uso
`/remind` ou `/requirements-remind`

## Quando Usar

Use este comando quando a IA:
- Fizer perguntas abertas ao invés de sim/não
- Começar a implementar código durante a coleta
- Fazer múltiplas perguntas ao mesmo tempo
- Esquecer de incluir padrões nas perguntas
- Pular fases do processo

## Mensagem de Lembrete

```
🔔 Lembrete: Regras de Coleta de Requisitos

✅ FAZER:
1. Uma pergunta por vez
2. Apenas perguntas SIM/NÃO
3. Incluir padrão inteligente em cada pergunta
4. Aguardar resposta antes da próxima
5. Aceitar "não sei" e usar o padrão
6. Seguir as 5 fases do processo

❌ NÃO FAZER:
1. Perguntas abertas ("Como você quer...?")
2. Múltiplas perguntas juntas
3. Implementar código durante coleta
4. Pular análise de contexto
5. Esquecer de documentar

📋 Fase Atual: [mostrar fase atual se houver requisito ativo]

Continue seguindo o processo estruturado.
```

## Exemplos de Correção

### Pergunta Aberta (Incorreto)
```
IA: Como você gostaria que as notificações fossem exibidas?

Usuário: /remind

IA: 🔔 Corrigindo abordagem...

📋 PERGUNTA 3 de 5 (Descoberta):
As notificações devem aparecer no canto superior direito da tela?
(Padrão se não souber: SIM - posição padrão mais comum)
```

### Múltiplas Perguntas (Incorreto)
```
IA: Você quer que o modo escuro seja ativado automaticamente à noite? 
E deve sincronizar com as preferências do sistema?

Usuário: /remind

IA: 🔔 Corrigindo - uma pergunta por vez...

📋 PERGUNTA 4 de 5 (Descoberta):
O modo escuro deve ser ativado automaticamente baseado no horário?
(Padrão se não souber: NÃO - controle manual é mais previsível)
```

### Implementação Prematura (Incorreto)
```
IA: Vou criar o componente ThemeToggle.tsx...

Usuário: /remind

IA: 🔔 Ainda estamos na fase de coleta de requisitos!

Retornando ao processo...

📋 PERGUNTA 5 de 5 (Especializadas):
Devemos usar o hook useTheme existente em hooks/useTheme.ts?
(Padrão se não souber: SIM - reutilizar código existente)
```

## Comportamento Esperado

Após o lembrete, a IA deve:
1. Reconhecer o erro
2. Voltar ao processo correto
3. Continuar de onde parou
4. Manter o contexto anterior

## Alias
`/remind` é um atalho conveniente para uso rápido durante conversas.