# Requirements List

Lista todos os requisitos coletados com seus status.

## Uso
`/requirements-list`

## Formato de Saída

```
📊 Resumo de Requisitos - AvaliaNutri

Estatísticas:
- Total: 8 requisitos
- Completos: 5 (62.5%)
- Em andamento: 1 (12.5%)
- Incompletos: 2 (25%)

═══════════════════════════════════════════

🟢 COMPLETOS (5)
├── 2025-07-15-0930 modo-escuro-dashboard
│   └── Implementar tema escuro no dashboard principal
├── 2025-07-16-1100 exportar-relatorios-pdf
│   └── Adicionar exportação PDF aos relatórios
├── 2025-07-16-1445 api-autenticacao-jwt
│   └── Migrar autenticação para JWT
├── 2025-07-17-0800 melhorias-performance
│   └── Otimizar carregamento do dashboard
└── 2025-07-17-1030 sistema-notificacoes
    └── Implementar notificações em tempo real

🔴 EM ANDAMENTO (1)
└── 2025-07-17-1445 upload-avatar-usuario
    └── Adicionar upload de foto de perfil
    └── Fase: Perguntas Especializadas (3/5)

🟡 INCOMPLETOS (2)
├── 2025-07-14-1600 integracao-whatsapp [Pausado há 3 dias]
│   └── Integrar notificações via WhatsApp
│   └── Progresso: Descoberta (2/5)
└── 2025-07-15-1700 gamificacao-completa [Pausado há 2 dias]
    └── Sistema completo de gamificação
    └── Progresso: Análise Contextual

═══════════════════════════════════════════

Comandos:
- /requirements-start: Novo requisito
- /requirements-status: Continuar requisito ativo
- /requirements-resume [nome]: Retomar requisito pausado
```

## Detalhamento por Status

### Completos (🟢)
- Nome e data de criação
- Descrição resumida
- Link implícito para pasta de documentação

### Em Andamento (🔴)
- Requisito atualmente ativo
- Fase atual e progresso
- Sugestão para continuar

### Incompletos (🟡)
- Tempo desde última atividade
- Último progresso conhecido
- Opção de retomar

## Filtros Opcionais

`/requirements-list --complete` - Apenas completos
`/requirements-list --active` - Apenas em andamento
`/requirements-list --incomplete` - Apenas incompletos
`/requirements-list --recent` - Últimos 7 dias

## Exemplo com Filtro
```
Usuário: /requirements-list --recent

IA: 📊 Requisitos Recentes (últimos 7 dias)

🟢 COMPLETOS (2)
├── 2025-07-17-0800 melhorias-performance
└── 2025-07-17-1030 sistema-notificacoes

🔴 EM ANDAMENTO (1)
└── 2025-07-17-1445 upload-avatar-usuario
```