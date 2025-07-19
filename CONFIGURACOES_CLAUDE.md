# Configurações do Claude Code - Projeto AvaliaNutri

## 🚀 Otimizações Implementadas

### 1. Interleaved Thinking
Configurado no `.claude/settings.local.json`:
- **Recurso**: Pensamento intercalado para melhor raciocínio
- **Tokens**: Até 30.000 tokens de pensamento
- **Benefício**: Respostas mais precisas e contextualizadas

### 2. Estrutura de Hooks
**Localização**: `.claude/hooks/`
- `post-commit.sh`: Automação pós-commit com verificações

### 3. Comandos Slash (SuperClaude Light)
**Localização**: `.claude/slash-commands/`
- `/compacto`: Respostas ultra-concisas
- `/revisao`: Revisão completa de código

### 4. Contexto do Projeto
**Arquivo**: `.claude/project-context.md`
- Visão geral da arquitetura
- Convenções de código
- Estrutura de módulos
- Endpoints principais

## 📁 Estrutura Criada

```
.claude/
├── settings.local.json     # Configurações com interleaved thinking
├── hooks/                  # Scripts de automação
│   └── post-commit.sh      # Hook pós-commit
├── slash-commands/         # Comandos rápidos
│   ├── compacto.md        # Modo compacto
│   └── revisao.md         # Revisão de código
├── mcp-configs/           # Futura configuração de MCPs
└── project-context.md     # Contexto persistente

```

## 🔧 Como Usar

### Comandos Slash
- Digite `/compacto` para respostas curtas
- Digite `/revisao` para análise de código

### Hooks
Os hooks são executados automaticamente após ações específicas.

### Próximos Passos Recomendados
1. Adicionar MCP de memória persistente quando necessário
2. Configurar mais hooks conforme o workflow
3. Criar mais comandos slash personalizados

## 💡 Dicas de Uso

1. **Performance**: O interleaved thinking melhora significativamente a qualidade das respostas
2. **Contexto**: O arquivo project-context.md mantém informações importantes sempre acessíveis
3. **Automação**: Os hooks reduzem tarefas repetitivas

---

*Configurações implementadas baseadas nas melhores práticas para desenvolvimento com LLMs*