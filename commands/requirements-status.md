# Requirements Status

Verifica o status da coleta de requisitos atual e continua o processo.

## Uso
`/requirements-status` ou `/requirements-current`

## Funcionalidade

1. Ler o arquivo `.current-requirement` para identificar requisito ativo
2. Verificar metadata.json para status e progresso
3. Mostrar resumo do progresso
4. Continuar de onde parou

## Possíveis Estados

### Sem Requisito Ativo
```
❌ Nenhum requisito ativo no momento.
Use /requirements-start [descrição] para iniciar uma nova coleta.
```

### Em Fase de Descoberta
```
📋 Requisito Ativo: adicionar-modo-escuro
Fase: Perguntas de Descoberta
Progresso: 3/5 perguntas respondidas

Próxima: P4: O tema deve persistir entre sessões?
```

### Em Análise
```
📋 Requisito Ativo: adicionar-modo-escuro
Fase: Análise Contextual
Status: Analisando componentes e serviços...
```

### Em Perguntas Detalhadas
```
📋 Requisito Ativo: adicionar-modo-escuro
Fase: Perguntas Especializadas
Progresso: 2/5 perguntas respondidas

Próxima: P3: Devemos usar o ThemeProvider existente em contexts/ThemeContext.tsx?
```

### Completo
```
✅ Requisito Ativo: adicionar-modo-escuro
Status: COMPLETO
Documentação: requirements/2025-07-17-1430-adicionar-modo-escuro/

Use /requirements-end para finalizar ou /requirements-start para novo requisito.
```

## Ações por Fase

- **Descoberta**: Continuar com próxima pergunta
- **Análise**: Mostrar progresso da análise
- **Detalhamento**: Continuar com próxima pergunta técnica
- **Completo**: Sugerir finalização ou novo requisito

## Exemplo de Continuação
```
Usuário: /requirements-status

IA: 📋 Requisito Ativo: sistema-notificacoes
Fase: Perguntas de Descoberta
Progresso: 2/5 perguntas respondidas

Continuando coleta...

📋 PERGUNTA 3 de 5 (Descoberta):
As notificações devem aparecer mesmo quando o usuário não estiver na aba ativa?
(Padrão se não souber: NÃO - respeita limites do navegador)
```