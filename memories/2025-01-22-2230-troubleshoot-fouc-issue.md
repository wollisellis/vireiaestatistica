# Troubleshoot: FOUC Issue Resolution

**Data/Hora**: 2025-01-22 22:30  
**Categoria**: Bug Fix + Debugging  
**Status**: ✅ Implementado (pendente validação)

## 🎯 Problema Reportado

**Descrição do FOUC**:
> "Estamos vendo um **FOUC de estado**: a página `/jogos` mostra por milissegundos o dashboard correto (HTML/estado inicial) e, após a hidratação do React + efeitos assíncronos, o estado é **sobrescrito por fallbacks vazios** porque várias chamadas falham e/ou retornam vazio."

**Sintomas Identificados**:
1. **`Missing or insufficient permissions`** ao ler `userAccess`, `class_students` 
2. **`updateStudentRanking is not a function`** em `unifiedScoringService`
3. **Auth listener dispara várias vezes** causando rerenders
4. **Primeiro render usa valores default** mas efeitos falham e trocam por estado vazio

## 🔍 Diagnóstico Detalhado

### Root Causes Identificadas:

#### 1. Coleção `userAccess` sem regras
- Código tentava ouvir `doc(db, 'userAccess', user.uid)`
- Firestore rules não tinham regra para esta coleção
- Listener sempre falhava com erro de permissão
- Estado ficava em loading/vazio permanentemente

#### 2. Método `updateStudentRanking` inexistente
- `jogos/page.tsx` chamava `unifiedScoringService.updateStudentRanking()`
- Método não existia no service (verificado com grep)
- Exception abortava refresh do ranking
- Estado de ranking não atualizava

#### 3. Estados sendo sobrescritos em catch handlers
- Efeitos que falhavam definiam `setState` para valores vazios
- Estado anterior (correto) era perdido
- UI mostrava placeholders em vez de manter dados anteriores

#### 4. Render prematuro sem validação ready
- Componente renderizava antes de ter dados necessários
- Hidratação do React sobrescrevia HTML/estado inicial
- Não havia controle de quando estava "ready"

## 💡 Soluções Implementadas

### 1. Adicionado método `updateStudentRanking`
```typescript
// unifiedScoringService.ts - linha 576
async updateStudentRanking(studentId: string): Promise<void> {
  if (!db || !studentId) return;
  
  try {
    const score = await this.getUnifiedScore(studentId);
    if (!score) return;

    await this.updateModuleScore(
      studentId, 
      'overall', 
      score.totalScore, 
      score.normalizedScore
    );
  } catch (error) {
    console.error(`[UnifiedScoring] Erro ao atualizar ranking:`, error);
    // Não propagar erro para não quebrar o fluxo
  }
}
```

### 2. Removido listener `userAccess` problemático
```typescript
// ANTES - com erro de permissão:
const unsubscribe = onSnapshot(doc(db, 'userAccess', user.uid), ...)

// DEPOIS - hardcoded temporário:
const defaultUnlocked = isProfessor 
  ? ['module-1', 'module-2', 'module-3', 'module-4'] 
  : ['module-1'];
setUnlockedModules(defaultUnlocked);
```

### 3. Tratamento de erro que preserva estado
```typescript
// ANTES - perdia estado anterior:
} catch (error) {
  setEstado(valorVazio);
}

// DEPOIS - preserva estado anterior:
} catch (error) {
  console.error('Error updating scoring:', error);
  // NÃO setar estado vazio - manter estado anterior
}
```

### 4. Controle de estado "ready"
```typescript
const [ready, setReady] = useState(false);

// Marcar ready após carregar módulos
useEffect(() => {
  setUnlockedModules(defaultUnlocked);
  setReady(true); // 👈 Controle de quando está pronto
}, [user?.uid, isProfessor]);

// Render condicional
if (loading || !ready) {
  return <LoadingSkeleton />; // 👈 Skeleton consistente
}
```

### 5. Forçar dinamismo da página
```typescript
// Evitar cache do Next.js
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

## 📝 Arquivos Modificados

### `src/services/unifiedScoringService.ts`
- **Adicionado**: método `updateStudentRanking()` (linha 576-597)
- **Motivo**: Resolver erro "function is not defined"

### `src/app/jogos/page.tsx`
- **Removido**: listener `onSnapshot` da coleção `userAccess`
- **Adicionado**: estado `ready` para controle de renderização
- **Modificado**: tratamento de erro que não derruba estado
- **Adicionado**: exports `dynamic='force-dynamic'` e `revalidate=0`

### Sistema de Memória
- **Ajustado**: CLAUDE.md para modo passivo (não consulta automática)
- **Renomeado**: arquivos para formato `YYYY-MM-DD-HHMM-titulo.md`

## ✅ Commit Realizado

```bash
Hash: ce87061  
Título: "Fix: Resolver problema FOUC na página /jogos"

Mensagem completa inclui:
- Problema identificado (FOUC com dados sobrescritos)
- 5 correções implementadas
- Resultado esperado (eliminar flash, manter dados visíveis)
- Baseado em instruções detalhadas de troubleshoot
```

## 🔄 Próximos Passos

### Validação Necessária:
1. **Testar na produção**: Verificar se FOUC foi eliminado
2. **Verificar dados persistentes**: Nome do usuário e info dos módulos
3. **Monitorar console**: Menos erros de permissão Firebase
4. **Performance**: Renderização mais estável

### Tarefas Pendentes:
- [ ] **Regras Firestore**: Adicionar regras para `userAccess` se necessário
- [ ] **Listeners duplicados**: Verificar se auth listeners ainda duplicam
- [ ] **Cache Next.js**: Confirmar se force-dynamic resolve todos os casos

### Issues Conhecidas:
- **Módulos hardcoded**: Temporário até resolver regras Firebase
- **userAccess**: Funcionalidade desabilitada até implementar regras corretas

## 🧠 Conhecimento Extraído

### Padrões FOUC Identificados:
1. **Hydration Mismatch**: HTML estático ≠ estado JavaScript inicial
2. **Async Effect Failures**: Efeitos falham → sobrescrevem estado bom
3. **Premature Rendering**: Render antes de dados estarem prontos
4. **Error State Pollution**: Catch handlers destroem estado anterior

### Soluções Eficazes:
1. **Ready State**: Controle explícito de quando renderizar
2. **Error Preservation**: Não sobrescrever estado em catch
3. **Fallback Strategies**: Hardcode temporário > dados vazios
4. **Dynamic Rendering**: Evitar cache quando dados são críticos

### Tools Utilizados:
- **Grep**: Localizar método inexistente no service
- **Read**: Investigar implementação de hooks e listeners  
- **Sequential Thinking**: Análise sistemática do problema FOUC

---

**Tags**: `fouc`, `hydration`, `firebase-permissions`, `state-management`, `performance`  
**Componentes**: `unifiedScoringService`, `JogosPage`, `useFirebaseAuth`  
**Commit**: `ce87061`