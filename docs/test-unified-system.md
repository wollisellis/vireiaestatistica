# Guia de Teste - Sistema Unificado DUAL

## 🎯 Objetivo
Validar a implementação do sistema DUAL (unificado + legacy) no ModuleProgressContext.

## 🔍 O que foi implementado

### 1. Hook useUnifiedProgress
- **Arquivo**: `/src/hooks/useUnifiedProgress.tsx`
- **Função**: Interface para o sistema unificado de pontuação
- **Features**:
  - Carrega progresso do sistema unificado
  - Salva pontuações de exercícios
  - Sincroniza todos os sistemas

### 2. ModuleProgressContext Atualizado
- **Arquivo**: `/src/contexts/ModuleProgressContext.tsx`
- **Mudanças**:
  - Carrega de AMBOS sistemas (unificado + legacy)
  - Salva em AMBOS sistemas simultaneamente
  - Detecta e loga discrepâncias
  - Fallback automático se um sistema falhar

## 📋 Checklist de Testes

### 1. Console do Navegador
Abra o console do navegador (F12) e procure por logs com prefixos:
- `[ModuleProgressContext]` - Sistema dual
- `[useUnifiedProgress]` - Hook unificado
- `[unifiedScoringService]` - Sistema unificado

### 2. Fluxo de Teste - Estudante

1. **Login como estudante**
   - Acesse `/login`
   - Entre com credenciais de estudante

2. **Verificar carregamento DUAL**
   - Console deve mostrar: `🔄 Carregando progresso DUAL (unificado + legacy)`
   - Verificar se detecta discrepâncias

3. **Completar um exercício**
   - Acesse `/jogos`
   - Complete qualquer exercício
   - Console deve mostrar: `💾 Salvando em sistema DUAL`
   - Verificar: `✅ Salvo em ambos sistemas`

4. **Verificar pontuação**
   - Pontuação deve aparecer no ranking
   - Pontuação deve aparecer nos módulos concluídos
   - Ambas devem estar sincronizadas

### 3. Fluxo de Teste - Professor

1. **Login como professor**
   - Acesse `/professor`
   - Entre com credenciais de professor

2. **Visualizar estudantes**
   - Acessar uma turma
   - Dados devem vir do sistema unificado
   - Console: `[StudentProgressViewer] 🔄 Carregando dados com sistema unificado`

3. **Exportar dados**
   - Clicar em "Exportar"
   - CSV deve conter dados unificados

### 4. Verificação de Discrepâncias

Se houver diferenças entre sistemas, o console mostrará:
```
⚠️ Discrepância detectada: {
  unificado: 85,
  legacy: 80,
  diferença: 5
}
```

### 5. Verificação no Firebase

1. **Console Firebase**
   - Acessar Firebase Console
   - Verificar coleções:
     - `unified_scores` - Sistema unificado
     - `userProgress` - Sistema legacy
     - `moduleProgress` - Sistema legacy

2. **Dados devem estar sincronizados**
   - Mesmas pontuações em ambos sistemas
   - Mesmo progresso de módulos

## 🐛 Problemas Conhecidos

1. **Browser Tools MCP não disponível**
   - Não foi possível usar ferramentas automatizadas
   - Teste manual necessário

2. **Possível latência**
   - Salvamento duplo pode causar pequena latência
   - Monitor performance durante testes

## 🚀 Próximos Passos

1. **Migrar getClassStatistics**
   - Ainda usa sistema legacy
   - TODO pendente

2. **Deprecar ModuleProgressService**
   - Após validação completa
   - Remover sistema legacy gradualmente

## 📊 Métricas de Sucesso

- ✅ Sem erros no console
- ✅ Pontuações sincronizadas entre sistemas
- ✅ Professor vê mesmos dados que estudantes
- ✅ Exportação funciona corretamente
- ✅ Performance aceitável (<2s para operações)

## 🔧 Debug Avançado

Para debug detalhado, adicione no console:
```javascript
localStorage.setItem('DEBUG_UNIFIED', 'true')
```

Isso habilitará logs extras do sistema unificado.