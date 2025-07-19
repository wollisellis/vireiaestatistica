# Requirements Start

Inicia uma nova coleta de requisitos para o projeto AvaliaNutri.

## Uso
`/requirements-start [descrição do recurso ou mudança]`

## Processo

### Fase 1: Análise Inicial
1. Analisar a estrutura completa do código-fonte
2. Identificar tecnologias e padrões utilizados
3. Preparar contexto para perguntas

### Fase 2: Perguntas de Descoberta (5 perguntas sim/não)
Fazer 5 perguntas de alto nível sobre o escopo do recurso:
- Todas as perguntas devem ser sim/não
- Incluir padrões inteligentes para cada pergunta
- Aguardar todas as respostas antes de prosseguir

### Fase 3: Análise Contextual
Baseado nas respostas:
1. Pesquisar arquivos relevantes
2. Ler código relacionado
3. Identificar padrões e restrições

### Fase 4: Perguntas Especializadas (5 perguntas sim/não)
Com contexto profundo, fazer 5 perguntas técnicas:
- Referenciar arquivos e serviços específicos
- Incluir padrões baseados no código existente
- Aguardar todas as respostas

### Fase 5: Documentação
Gerar especificação completa em `requirements/YYYY-MM-DD-HHMM-nome/`

## Estrutura de Arquivos
```
requirements/YYYY-MM-DD-HHMM-nome/
├── metadata.json              # Status e progresso
├── 00-initial-request.md      # Requisição original
├── 01-discovery-questions.md  # 5 perguntas de contexto
├── 02-discovery-answers.md    # Respostas do usuário
├── 03-context-findings.md     # Análise do código
├── 04-detail-questions.md     # 5 perguntas técnicas
├── 05-detail-answers.md       # Respostas detalhadas
└── 06-requirements-spec.md    # Especificação final
```

## Regras Importantes
1. SEMPRE fazer perguntas sim/não
2. NUNCA fazer múltiplas perguntas de uma vez
3. SEMPRE incluir padrões inteligentes
4. SEMPRE aguardar resposta antes da próxima pergunta
5. Aceitar "não sei" ou "idk" e usar o padrão

## Exemplo
```
Usuário: /requirements-start adicionar modo escuro ao dashboard

IA: Iniciando coleta de requisitos para "adicionar modo escuro ao dashboard"...

🔍 Analisando estrutura do código...
✓ Encontrado: React 18.3.1, Next.js 15.3.5, Tailwind CSS
✓ Componentes identificados: 47 arquivos em src/components
✓ Sistema de temas atual: Tailwind com classes utilitárias

📋 PERGUNTA 1 de 5 (Descoberta):
O modo escuro deve estar disponível em todas as páginas da aplicação?
(Padrão se não souber: SIM - consistência visual é importante)

Usuário: sim

[continua com as próximas perguntas...]
```