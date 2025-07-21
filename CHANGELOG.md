# Changelog - bioestat-platform

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-21

### 🚀 Adicionado
- **Sistema de Design Tokens Unificado**: Criado sistema completo de tokens para cores, espaçamentos e tipografia
- **Variáveis CSS Customizadas**: Expandido globals.css com variáveis específicas para módulos educacionais
- **Cores Específicas por Módulo**: Emerald (Antropométricos), Teal (Clínicos), Blue (Socioeconômicos), Violet (Crescimento)
- **Estados Hover/Active Consistentes**: Melhorados estados de interação em todos os componentes

### 🔧 Corrigido
- **Inconsistências de IDs**: Unificado sistema de IDs para usar strings ('module-1') em toda aplicação
- **Problema de Desbloqueio**: Resolvido erro no dashboard do professor ao desbloquear módulos
- **Tipos TypeScript**: Corrigidas inconsistências entre number/string nos hooks useModuleAccess
- **GameScore Interface**: Atualizada para suportar tanto string quanto number em gameId (compatibilidade)

### 🎨 Melhorado
- **Componente Button**: Redesenhado com variantes consistentes usando design tokens
- **Paleta de Cores**: Padronizada tema nutricional com emerald/teal como cores primárias
- **Focus Rings**: Atualizados para usar emerald-500 em vez de blue-500
- **Transições**: Melhoradas durações e tipos de transição em componentes interativos

### 📚 Documentação
- **README Atualizado**: Reflete estado atual com stack tecnológico e correções implementadas
- **Design Tokens**: Documentação completa do sistema de design
- **Changelog**: Criado histórico de mudanças estruturado

## [2.0.0] - 2025-01-15

### 🚀 Adicionado
- **Sistema Unificado de Pontuação**: Serviço centralizado para gerenciar scores com normalização 0-100
- **Sistema de Ranking em Tempo Real**: Atualização automática de posições e estatísticas
- **Dashboard Avançado do Professor**: Interface completa para gerenciamento de turmas
- **Sistema Híbrido de Autenticação**: Firebase + Mock para flexibilidade educacional
- **AG-Grid**: Tabelas avançadas para visualização de dados complexos
- **Highcharts**: Gráficos profissionais para análises detalhadas

### 🔧 Corrigido
- **Performance**: Otimização de carregamento e renderização
- **Responsividade**: Melhorias em dispositivos móveis
- **Validação de Dados**: Sistema robusto de validação com Zod

### 🎨 Melhorado
- **Interface do Usuário**: Design moderno e consistente
- **Experiência de Usuário**: Navegação intuitiva e feedback visual
- **Acessibilidade**: Conformidade com padrões WCAG

## [1.5.0] - 2024-12-01

### 🚀 Adicionado
- **Jogo 4**: Curvas de Crescimento Interativas
- **Sistema de Conquistas**: Badges educacionais por desempenho
- **Modo Convidado**: Acesso sem registro para demonstrações

### 🔧 Corrigido
- **Persistência de Dados**: localStorage robusto para progresso
- **Validação de Formulários**: React Hook Form + Zod

## [1.0.0] - 2024-10-01

### 🚀 Lançamento Inicial
- **Jogo 1**: Indicadores Antropométricos (Liberado)
- **Jogo 2**: Indicadores Clínicos e Bioquímicos (Bloqueado)
- **Jogo 3**: Fatores Demográficos e Socioeconômicos (Bloqueado)
- **Interface Base**: Next.js + TypeScript + Tailwind CSS
- **Dados Brasileiros**: IBGE, SISVAN, Ministério da Saúde
- **Sistema de Progresso**: Tracking básico de exercícios
- **Design Responsivo**: Desktop e mobile

---

## Categorias de Mudanças

- **🚀 Adicionado**: Para novas funcionalidades
- **🔧 Corrigido**: Para correções de bugs
- **🎨 Melhorado**: Para mudanças em funcionalidades existentes
- **📚 Documentação**: Para mudanças apenas na documentação
- **🗑️ Removido**: Para funcionalidades removidas
- **🔒 Segurança**: Para correções de vulnerabilidades

## Links Úteis

- [Releases no GitHub](https://github.com/wollisellis/bioestat-platform/releases)
- [Issues Abertas](https://github.com/wollisellis/bioestat-platform/issues)
- [Pull Requests](https://github.com/wollisellis/bioestat-platform/pulls)