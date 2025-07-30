# 📋 Templates para Manutenção do CHANGELOG.md

Este documento contém templates e guidelines para manter o CHANGELOG.md como um "banco de memória" eficaz do projeto.

## 🎯 Template de Nova Versão

```markdown
## Version X.Y.Z – YYYY-MM-DD

### 🐛 **Bug Fixes**
- **[Nome do Bug]**:
  - **Issue**: [Descrição clara do problema]
  - **Root Cause**: [Causa raiz técnica identificada]
  - **Solution**: [Solução implementada]
  - **Files Modified**: [Lista de arquivos com linha aproximada]
  - **Impact**: [Impacto para usuários/sistema]

### ✨ **New Features**
- **[Nome da Feature]**:
  - [Descrição detalhada da funcionalidade]
  - [Valor educacional/técnico]
  - **Files Added**: [Novos arquivos criados]
  - **Files Modified**: [Arquivos existentes alterados]
  - **Integration**: [Como se integra ao sistema existente]

### 🔧 **Improvements**
- **[Nome da Melhoria]**:
  - [Descrição do que foi melhorado]
  - [Métricas de performance se aplicável]
  - **Files Modified**: [Arquivos alterados]

### 🎨 **UI/UX Improvements**
- **[Nome da Melhoria UX]**:
  - [Descrição da melhoria visual/experiência]
  - [Feedback do usuário considerado]
  - **Files Modified**: [Componentes alterados]

### 📝 **Technical Details**
- **[Mudança Técnica]**: [Descrição técnica para desenvolvedores]
- **[Refatoração]**: [Melhorias de código/arquitetura]
- **[Performance]**: [Otimizações implementadas]

### ⚠️ **Breaking Changes**
- **[Nome da Mudança]**:
  - **Impact**: [O que quebra e por quê]
  - **Migration Required**: [Passos para migração]
  - **Affected Files**: [Arquivos que precisam ser atualizados]
  - **Timeline**: [Quando a mudança será efetiva]
```

## 🔍 Checklist Pré-Commit

Antes de cada commit, verificar:

### ✅ Obrigatório
- [ ] CHANGELOG.md atualizado com nova entrada
- [ ] Versão incrementada corretamente (PATCH/MINOR/MAJOR)
- [ ] package.json atualizado com nova versão
- [ ] Arquivos modificados listados com contexto
- [ ] Root cause incluída para bug fixes

### ✅ Recomendado
- [ ] Impacto no usuário documentado
- [ ] Links para documentação relacionada
- [ ] Métricas de performance (se aplicável)
- [ ] Breaking changes destacados
- [ ] Migrações documentadas

### ✅ Qualidade
- [ ] Linguagem clara e técnica
- [ ] Contexto suficiente para debugging futuro
- [ ] Links para commits/PRs relevantes
- [ ] Categorização correta (🐛🎨📝⚠️✨🔧)

## 📊 Critérios de Versionamento

### PATCH (0.9.1 → 0.9.2)
- Bug fixes sem mudança de API
- Melhorias de performance
- Correções de UI/UX
- Ajustes de documentação
- Security patches

**Exemplo**: Corrigir cálculo de ranking, remover bug visual

### MINOR (0.9.x → 0.10.0)
- Novas funcionalidades
- Novos módulos educacionais
- Novas APIs ou endpoints
- Melhorias significativas de UX
- Novas integrações

**Exemplo**: Adicionar Módulo 3, implementar sistema de achievements

### MAJOR (0.x.x → 1.0.0)
- Breaking changes
- Refatoração arquitetural
- Mudanças na estrutura de dados
- Remoção de funcionalidades
- Nova versão de dependências críticas

**Exemplo**: Migração para novo sistema de autenticação, mudança de banco de dados

## 🎨 Guia de Categorização

### 🐛 Bug Fixes
**Quando usar**: Correção de problemas existentes
**Foco**: Root cause, solução técnica, impacto
**Exemplo**: "Sistema de ranking só contava módulo 1"

### ✨ New Features  
**Quando usar**: Funcionalidades completamente novas
**Foco**: Valor educacional, integração, arquivos criados
**Exemplo**: "Módulo 2 drag-and-drop implementado"

### 🔧 Improvements
**Quando usar**: Melhorias em funcionalidades existentes
**Foco**: Performance, usabilidade, código
**Exemplo**: "Otimização de queries do Firebase"

### 🎨 UI/UX Improvements
**Quando usar**: Mudanças visuais e de experiência
**Foco**: Design, acessibilidade, responsividade
**Exemplo**: "Padronização do sistema de estrelas"

### 📝 Technical Details
**Quando usar**: Mudanças internas sem impacto direto no usuário
**Foco**: Arquitetura, refatoração, debt técnico
**Exemplo**: "Unificação de algoritmos de pontuação"

### ⚠️ Breaking Changes
**Quando usar**: Mudanças que quebram compatibilidade
**Foco**: Migração, impacto, timeline
**Exemplo**: "Nova estrutura de autenticação"

## 🔧 Processo Token-Eficiente

### Workflow Rápido (5 min)
1. **Identificar mudança**: Bug fix? Feature? Improvement?
2. **Escolher categoria**: 🐛🎨📝⚠️✨🔧
3. **Usar template**: Copiar seção apropriada
4. **Preencher rapidamente**: Issue → Root cause → Solution → Files → Impact
5. **Incrementar versão**: Patch/Minor/Major
6. **Commit**: Incluir changelog na mesma transação

### Template Ultra-Rápido
```markdown
### 🐛 **[Nome]**: [Problema] → [Solução] ([arquivos])
```

### Template Detalhado (para mudanças importantes)
```markdown
### ✨ **[Feature]**:
  - [Descrição em 1-2 linhas]
  - **Files**: [lista]
  - **Integration**: [como conecta]
```

## 📚 Integração com Sistema de Memórias

### Links Bidirecionais
- CHANGELOG.md → memories/sessions/
- memories/sessions/ → CHANGELOG.md
- Usar mesmo padrão de nomenclatura
- Cross-reference em ambos sistemas

### Padrões de Nomenclatura
```
CHANGELOG: Version 0.9.3 – 2025-07-30
Memories: 2025-07-30-session-ranking-fixes.md
```

## 🎯 Exemplos Práticos

### Bug Fix Simples
```markdown
### 🐛 **Fixed Mobile Touch Issue**:
  - **Issue**: Close button not responding on iOS Safari
  - **Root Cause**: CSS touch-action preventing events
  - **Solution**: Removed conflicting CSS, added 44px touch targets
  - **Files Modified**: `Modal.tsx:45-52`
```

### Feature Complexa
```markdown
### ✨ **Patient Weight Tracking**:
  - Interactive charts with gestational curves
  - BMI calculations and alerts
  - Export to PDF functionality
  - **Files Added**: `WeightChart.tsx`, `BMICalculator.ts`
  - **Integration**: Dashboard + Report system
```

### Breaking Change
```markdown
### ⚠️ **Authentication Overhaul**:
  - **Migration Required**: Run `npm run migrate:auth-v2`
  - **Impact**: User roles moved from `user.role` to `user.permissions`
  - **Timeline**: Effective immediately
  - **Files**: All auth-related components affected
```

---

**Maintained by**: Claude Code + Ellis Wollis Malta Abhulime  
**Version**: 1.0  
**Last Updated**: 2025-07-30