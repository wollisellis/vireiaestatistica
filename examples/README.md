# Exemplos de Requisitos - AvaliaNutri

Este diretório contém exemplos de requisitos coletados usando o Sistema de Coleta de Requisitos do Claude.

## Exemplo Disponível

### 1. Sistema de Feedback Visual (2025-07-17-1500)
Demonstra o processo completo de coleta de requisitos para implementar feedback visual em exercícios:

- **Fase 1**: Requisição inicial do usuário
- **Fase 2**: 5 perguntas de descoberta (contexto geral)
- **Fase 3**: Análise automática do código
- **Fase 4**: 5 perguntas técnicas especializadas
- **Fase 5**: Especificação completa com detalhes de implementação

## Como Usar os Exemplos

1. **Para Referência**: Veja como o processo funciona do início ao fim
2. **Para Templates**: Use como base para novos requisitos similares
3. **Para Aprendizado**: Entenda o nível de detalhe esperado

## Estrutura de Cada Exemplo

```
exemplo-requisito/
├── metadata.json              # Metadados e progresso
├── 00-initial-request.md      # Pedido original
├── 01-discovery-questions.md  # Perguntas de contexto
├── 02-discovery-answers.md    # Respostas do usuário
├── 03-context-findings.md     # Análise do código
├── 04-detail-questions.md     # Perguntas técnicas
├── 05-detail-answers.md       # Respostas detalhadas
└── 06-requirements-spec.md    # Especificação final
```

## Pontos Importantes

1. **Perguntas Sim/Não**: Todas as perguntas são binárias
2. **Padrões Inteligentes**: Cada pergunta tem um padrão
3. **Análise Profunda**: IA examina código relevante
4. **Especificação Detalhada**: Inclui caminhos de arquivo e código

## Criar Novo Requisito

Para iniciar nova coleta de requisitos:

```
/requirements-start [sua descrição aqui]
```

O sistema guiará você pelo processo completo!