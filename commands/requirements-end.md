# Requirements End

Finaliza a coleta de requisitos atual, mesmo que incompleta.

## Uso
`/requirements-end`

## Opções de Finalização

### 1. Requisito Completo
Se todas as fases foram completadas:
```
✅ Finalizando requisito: adicionar-modo-escuro
Status: COMPLETO
Documentação salva em: requirements/2025-07-17-1430-adicionar-modo-escuro/

Resumo:
- 10 perguntas respondidas
- Análise de 23 arquivos
- Especificação completa gerada

Requisito pronto para implementação!
```

### 2. Requisito Incompleto
Se ainda há perguntas pendentes:
```
⚠️ Requisito incompleto: sistema-cache
Progresso: Descoberta 3/5

Opções:
1. Gerar especificação parcial com informações atuais
2. Marcar como pausado para continuar depois
3. Cancelar e excluir requisito

Escolha (1/2/3):
```

### 3. Cancelamento
Se usuário escolher cancelar:
```
🗑️ Requisito cancelado e removido.
Use /requirements-start para iniciar novo requisito.
```

## Ações de Finalização

1. **Atualizar metadata.json** com status final
2. **Limpar .current-requirement**
3. **Atualizar index.md** com novo status
4. **Gerar resumo** se aplicável

## Geração de Especificação Parcial

Para requisitos incompletos, gerar com seções:
- ✅ Informações coletadas
- ⚠️ Informações pendentes
- 📋 Próximos passos sugeridos

## Exemplo
```
Usuário: /requirements-end

IA: ⚠️ Requisito incompleto: api-webhooks
Progresso: Perguntas Especializadas 4/5

Opções:
1. Gerar especificação parcial (80% completo)
2. Pausar para continuar depois
3. Cancelar requisito

Usuário: 1

IA: 📄 Gerando especificação parcial...

✓ Especificação criada com:
- 9 de 10 perguntas respondidas
- Análise de contexto completa
- Recomendações baseadas em dados disponíveis

⚠️ Nota: Falta definir estratégia de retry (pergunta 10)
Documentação: requirements/2025-07-17-1445-api-webhooks/

Requisito marcado como PARCIAL.
```