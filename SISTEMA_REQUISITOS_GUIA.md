# 🎯 Sistema de Coleta de Requisitos - AvaliaNutri

Sistema inteligente implementado para coletar requisitos de forma estruturada através de perguntas sim/não.

## ✅ Instalação Completa

O sistema foi instalado com sucesso com:

### 📁 Estrutura Criada
```
bioestat/
├── commands/                    # Comandos do Claude
│   ├── requirements-start.md   # Iniciar coleta
│   ├── requirements-status.md  # Verificar progresso
│   ├── requirements-current.md # Status atual (alias)
│   ├── requirements-end.md     # Finalizar coleta
│   ├── requirements-list.md    # Listar requisitos
│   ├── requirements-remind.md  # Lembrar regras
│   └── remind.md              # Atalho rápido
│
├── requirements/               # Armazenamento de requisitos
│   ├── .current-requirement   # Rastreamento ativo
│   └── index.md              # Índice geral
│
└── examples/                  # Exemplo completo
    └── 2025-07-17-1500-sistema-feedback-exercicios/
```

## 🚀 Como Usar

### 1. Iniciar Nova Coleta
```
/requirements-start adicionar exportação de relatórios em PDF
```

### 2. Processo de Coleta
O sistema seguirá 5 fases automaticamente:

#### Fase 1: Análise do Código
- IA analisa toda estrutura do projeto
- Identifica tecnologias e padrões

#### Fase 2: Perguntas de Contexto (5 perguntas)
```
P1: Os usuários precisarão selecionar quais dados exportar?
(Padrão se não souber: SIM - flexibilidade é importante)

Você: sim
```

#### Fase 3: Análise Profunda
- IA pesquisa arquivos relevantes
- Lê código relacionado automaticamente

#### Fase 4: Perguntas Técnicas (5 perguntas)
```
P1: Devemos usar a biblioteca jsPDF já instalada no projeto?
(Padrão se não souber: SIM - aproveitar dependências existentes)

Você: não sei
IA: ✓ Usando padrão: SIM
```

#### Fase 5: Especificação Final
- Documento completo gerado
- Inclui caminhos de arquivo
- Critérios de aceitação

### 3. Comandos Disponíveis

| Comando | Descrição | Quando Usar |
|---------|-----------|-------------|
| `/requirements-start [desc]` | Inicia nova coleta | Novo recurso/mudança |
| `/requirements-status` | Verifica progresso | Continuar coleta |
| `/requirements-list` | Lista todos requisitos | Ver histórico |
| `/requirements-end` | Finaliza coleta | Terminar/pausar |
| `/remind` | Lembra regras à IA | IA fazendo perguntas erradas |

## 💡 Dicas Importantes

### Para Responder
- Use apenas: **sim**, **não** ou **não sei**
- "não sei" usa o padrão inteligente
- Não precisa explicar - apenas responda

### Exemplo de Sessão
```
Você: /requirements-start implementar gráficos interativos

IA: Analisando código... ✓
    React com Recharts encontrado

P1: Os gráficos devem atualizar em tempo real?
(Padrão: NÃO - maioria é estática)

Você: sim

P2: Deve funcionar em dispositivos móveis?
(Padrão: SIM - mobile-first é padrão)

Você: idk
IA: ✓ Usando padrão: SIM

[continua até 10 perguntas totais...]
```

## 🎯 Benefícios

1. **Simplicidade**: Apenas sim/não
2. **Inteligente**: IA analisa código primeiro
3. **Completo**: Especificações detalhadas
4. **Rastreável**: Histórico organizado

## 📋 Ver Exemplo Completo

Um exemplo completo está em:
```
examples/2025-07-17-1500-sistema-feedback-exercicios/
```

Mostra todo o processo do início ao fim!

## 🆘 Problemas Comuns

**IA fazendo perguntas abertas?**
→ Use `/remind`

**Quer pausar a coleta?**
→ Use `/requirements-end` e escolha "pausar"

**Perdeu onde estava?**
→ Use `/requirements-status`

---

**Pronto para usar!** Comece com:
```
/requirements-start [sua ideia aqui]
```