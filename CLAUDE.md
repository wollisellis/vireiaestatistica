# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Sempre fale comigo em pt-br

## 🚨 IMPORTANTE: Estrutura do Projeto
**Este é o diretório principal e oficial do projeto `bioestat-platform` (AvaliaNutri)**. Todo o desenvolvimento deve ser realizado neste local:
- **Localização**: `/mnt/c/Users/ellis/bioestat/bioestat-platform/`
- **Código-fonte**: `./src/` (dentro deste diretório)
- **Documentação**: `./docs/` (organizada por categoria)

### Organização da Documentação
- `./docs/archive/` - Documentação histórica (AVALIANUTRI_*, correções antigas)
- `./docs/development/` - Guias técnicos (setup, deploy, especificações)
  - `MODULE_FLOW.md` - **Fluxo completo de produção de módulos educacionais**
- `./docs/features/` - Documentação de funcionalidades específicas
- **Raiz**: Apenas arquivos essenciais (CLAUDE.md, README.md, LICENSE)

## Comandos de Desenvolvimento

```bash
# Servidor de desenvolvimento (todos os comandos abaixo iniciam na porta 3000)
npm run dev
npm run development
npm run serve
npm run start-dev

# Build para produção
npm run build

# Servidor de produção
npm start

# Linting
npm run lint

# Verificação de tipos TypeScript
npx tsc --noEmit

# Instalação de dependências (sempre use --legacy-peer-deps)
npm install --legacy-peer-deps

# Limpar cache de build (Windows PowerShell)
Remove-Item -Recurse -Force .next

# Limpar cache de build (Linux/Mac)
rm -rf .next
```

## Workflow de Desenvolvimento
- **OBRIGATÓRIO**: Sempre fazer `git add .` e `git commit` após completar qualquer alteração no código
- **OBRIGATÓRIO**: Sempre atualizar o `CHANGELOG.md` ANTES de fazer commit com:
  - Versão incrementada (patch/minor/major conforme o tipo de mudança)
  - **Root Cause Analysis**: Para bugs, explicar causa raiz e solução técnica
  - **Código específico**: Linhas de código importantes, funções modificadas
  - **Context completo**: Por que a mudança foi necessária
  - **Arquivos modificados**: Lista completa com caminhos específicos
  - **Impacto educacional/técnico**: Como afeta usuários e sistema
  - **Detalhes de implementação**: Estados adicionados, lógica alterada
  - Seguir o formato existente no arquivo (🎯 🐛 ✨ 📊 etc.)
- **EXEMPLO de entrada completa no CHANGELOG**:
  ```markdown
  - **Issue**: Descrição específica do problema
  - **Root Cause**: Linha X usava Y ao invés de Z
  - **Solution**: Implementado estado `newState` que preserva W
  - **Files Modified**: `src/path/file.tsx` (linhas 123-145)
  - **Technical Details**: Adicionado useEffect para X, modificado handleY()
  ```
- Usar mensagens de commit descritivas em português
- Fazer commit frequentes durante o desenvolvimento
- Nunca deixar alterações sem commit ao finalizar uma tarefa
- **CRÍTICO - Firebase Rules**: Sempre atualizar `firestore.rules` quando:
  - Criar novas coleções no Firestore (`collection(db, 'nova_colecao')`)
  - Adicionar novos tipos de documentos ou estruturas de dados
  - Modificar a estrutura de acesso aos dados ou permissões
  - Implementar novas funcionalidades que usem o banco de dados

## 📚 CHANGELOG como Memória do Projeto

**CRITICAL**: O `CHANGELOG.md` serve como **memória técnica completa** do projeto, permitindo:

### 🎯 **Por que é obrigatório documentar tudo?**
- **Continuidade**: Próximas sessões Claude Code podem entender exatamente o que foi feito
- **Root Cause**: Evita repetir os mesmos bugs/problemas
- **Context**: Preserva o "por que" das decisões técnicas, não apenas o "o que"
- **Rastreabilidade**: Localiza rapidamente quando/onde mudanças específicas foram feitas

### 📋 **O que deve ser SEMPRE documentado:**
- **Estados adicionados**: `const [newState, setNewState] = useState()`
- **Hooks modificados**: `useEffect`, `useCallback`, mudanças em dependências
- **Lógica de negócio**: Algoritmos, validações, condições importantes
- **Integrações**: Calls para APIs, Firebase, serviços externos
- **Correções de bugs**: Causa raiz técnica + solução específica
- **Refatorações**: O que mudou na arquitetura e por que

### ⚠️ **Sem essa documentação:**
- Futuras sessões perdem contexto técnico crucial
- Bugs podem reaparecer por falta de context
- Decisões arquiteturais são esquecidas
- Tempo perdido re-investigando problemas já resolvidos

**Regra de Ouro**: Se você mudou código, deve documentar no CHANGELOG com detalhes técnicos suficientes para alguém entender e dar continuidade.

## 🧠 Sistema de Memória Persistente

**Sistema inspirado no OpenMemory MCP** para manter contexto entre sessões de desenvolvimento.

### Localização e Estrutura
```
./memories/
├── sessions/          # Sessões de desenvolvimento por data
├── categories/        # Organizadas por tipo (fixes, features, debugging)
├── index.md          # Ponto de entrada e navegação
└── memory-config.json # Configurações do sistema
```

### Instruções para Claude Code
1. **Modo Passivo**: Sistema de memória é **consultado apenas quando solicitado explicitamente** pelo usuário para economizar tokens.

2. **Durante o desenvolvimento**: Documentar descobertas importantes quando relevante.

3. **Ao finalizar uma sessão significativa**:
   - Criar arquivo `./memories/YYYY-MM-DD-HHMM-titulo-principal.md`
   - Formato: data-hora-titulo (ex: `2025-01-22-2200-fix-user-display-module-info.md`)
   - Atualizar categoria relevante apenas se necessário
   - **NÃO** consultar automaticamente memórias anteriores

### Template de Sessão
```markdown
# Sessão YYYY-MM-DD-XXX

**Categoria**: [Bug Fix | Feature | Debugging | Refactoring]
**Status**: [✅ Concluído | ⏳ Pendente | 🔄 Em Andamento]

## 🎯 Contexto
- **Problema**: [descrição]
- **Objetivo**: [o que precisava ser resolvido]

## 🔍 Diagnóstico
- **Root cause**: [causa identificada]
- **Arquivos envolvidos**: [lista]

## 💡 Solução
- **Abordagem**: [estratégia]
- **Implementação**: [passos]

## 📝 Mudanças
- **Arquivos modificados**: [lista com links]
- **Commits**: [hash e mensagem]

## ✅ Resultados
- **Verificação**: [como validar]
- **Próximos passos**: [ações pendentes]
```

### Comandos Úteis
```bash
# Consultar última sessão
ls memories/sessions/ | sort -r | head -1

# Buscar por componente específico
grep -r "useRoleRedirect" memories/

# Ver estatísticas gerais
cat memories/index.md | grep "Total de"
```

### Benefícios
- 📚 **Conhecimento cumulativo** preservado entre sessões
- 🔍 **Padrões identificados** para evitar problemas recorrentes  
- ⏰ **Contexto imediato** sobre o que foi feito anteriormente
- 🎯 **Soluções consultáveis** para problemas similares

## Contexto do Projeto
**bioestat-platform** (anteriormente AvaliaNutri) - Plataforma educacional para avaliação nutricional e estatística em saúde

### Disciplina
Avaliação Nutricional - Disciplina focada no ensino dos métodos e técnicas para avaliação do estado nutricional de indivíduos e populações.

### Instituição
UNICAMP - Área: Ciências da Saúde - Nutrição
Modalidade: Presencial com suporte digital

### Objetivos de Aprendizagem
• Compreender os indicadores antropométricos
• Aplicar métodos de avaliação nutricional
• Interpretar dados populacionais brasileiros
• Desenvolver habilidades práticas de diagnóstico

## Arquitetura de Alto Nível

### Stack Principal
- **Framework**: Next.js 15.3.5 com App Router
- **TypeScript**: 5.5.3 com modo strict
- **Autenticação**: Firebase 10.12.2 (com fallback mock local)
- **Estado**: Zustand 4.5.4 + React Context API
- **UI**: Tailwind CSS 3.4.4 + Framer Motion 11.3.8
- **Visualização**: Recharts 2.12.7, Highcharts 12.3.0, AG-Grid 34.0.1
- **Formulários**: React Hook Form 7.52.1 + Zod 3.23.8

### Estrutura de Diretórios
```
src/
├── app/                    # Rotas Next.js App Router
│   ├── jogos/             # 4 jogos nutricionais principais
│   ├── professor/         # Dashboard do professor
│   └── dashboard-avancado/# Dashboard avançado
├── components/            
│   ├── auth/             # Autenticação (mock + Firebase)
│   ├── games/            # Componentes dos jogos
│   ├── nutritional-games/# Jogos especializados de nutrição
│   └── ui/               # Biblioteca de componentes
├── contexts/             # Providers globais
├── services/             # Lógica de negócio
│   └── unifiedScoringService.ts # Sistema de pontuação unificado
└── types/                # TypeScript types
```

### Padrões Arquiteturais
- **Autenticação Híbrida**: Firebase com fallback para mock auth local
- **Persistência Local**: localStorage para progresso offline
- **Sistema de Pontuação**: Service unificado para todos os jogos
- **Proteção de Rotas**: Middleware para áreas autenticadas
- **Modo Convidado**: Acesso sem registro via cookies

## Configurações Importantes

### Build e Deploy
- **ESLint**: Configurado para ignorar erros durante build (`ignoreDuringBuilds: true`)
- **TypeScript**: Permite build com erros (`ignoreBuildErrors: true`)
- **Deploy**: Preparado para Vercel (sem `output: standalone`)

### Dados Brasileiros
- **Fontes**: IBGE, SISVAN, Ministério da Saúde, DataSUS
- **Curvas de Crescimento**: Padrões oficiais brasileiros
- **Contexto**: Todos os exemplos e dados são brasileiros

### Sistema de Jogos
1. **Módulo 1**: Indicadores Antropométricos (Múltipla escolha - 70 pontos)
2. **Módulo 2**: Métodos de Avaliação Nutricional (Drag-and-drop - 30 pontos) 
3. **Módulo 3**: Fatores Demográficos e Socioeconômicos (Planejado)
4. **Módulo 4**: Curvas de Crescimento Interativas (Planejado)

**📋 Para criar novos módulos**: Consulte [`docs/development/MODULE_FLOW.md`](docs/development/MODULE_FLOW.md)

### Considerações de Segurança
- **IDs Anônimos**: Para privacidade dos estudantes
- **RBAC**: Sistema de permissões professor/aluno
- **Cookies Seguros**: Para modo convidado
- **Proteção de Conteúdo**: Material educacional protegido
