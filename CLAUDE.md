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
- Usar mensagens de commit descritivas em português
- Fazer commit frequentes durante o desenvolvimento
- Nunca deixar alterações sem commit ao finalizar uma tarefa
- **CRÍTICO - Firebase Rules**: Sempre atualizar `firestore.rules` quando:
  - Criar novas coleções no Firestore (`collection(db, 'nova_colecao')`)
  - Adicionar novos tipos de documentos ou estruturas de dados
  - Modificar a estrutura de acesso aos dados ou permissões
  - Implementar novas funcionalidades que usem o banco de dados

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
1. **Jogo 1**: Indicadores Antropométricos (Liberado)
2. **Jogo 2**: Indicadores Clínicos e Bioquímicos (Bloqueado)
3. **Jogo 3**: Fatores Demográficos e Socioeconômicos (Bloqueado)
4. **Jogo 4**: Curvas de Crescimento Interativas (Liberado)

### Considerações de Segurança
- **IDs Anônimos**: Para privacidade dos estudantes
- **RBAC**: Sistema de permissões professor/aluno
- **Cookies Seguros**: Para modo convidado
- **Proteção de Conteúdo**: Material educacional protegido
