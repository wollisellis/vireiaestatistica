# 📋 PRÓXIMOS PASSOS - PLATAFORMA BIOESTAT

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. **BUG DE ROTEAMENTO - PRIORIDADE ALTA**
**Problema:** Ambos os botões (Professor e Estudante Visitante) redirecionam para `/jogos`

**Solução Necessária:**
- ✅ **Professor Visitante** → deve ir para `/` (dashboard professor)
- ✅ **Estudante Visitante** → deve ir para `/jogos` (dashboard estudante)

**Arquivos a Modificar:**
- `src/app/page.tsx` - Corrigir redirecionamento do botão Professor
- `src/middleware.ts` - Ajustar lógica de redirecionamento
- Criar rota `/professor` ou usar `/` para dashboard professor

### 2. **CONFIGURAÇÃO FIREBASE - PRIORIDADE ALTA**
**Problema:** Sistema ainda usa dados mock/exemplo

**Solução Necessária:**
- ✅ Conectar com Firebase real usando `.env.local`
- ✅ Substituir todos os dados de demonstração
- ✅ Configurar autenticação real
- ✅ Implementar Firestore para dados reais

## 🎯 TAREFAS IMEDIATAS

### **FASE 1: CORREÇÃO DE BUGS (1-2 dias)**

#### ✅ **Task 1: Corrigir Roteamento de Guest Modes** [EM ANDAMENTO]
- [ ] Modificar botão "Professor Visitante" para redirecionar para `/`
- [ ] Manter botão "Estudante Visitante" redirecionando para `/jogos`
- [ ] Atualizar middleware para reconhecer rotas corretas
- [ ] Testar ambos os fluxos de guest mode

#### ✅ **Task 2: Criar Dashboard Professor em Rota Separada**
- [ ] Mover `ProfessorDashboard` para rota `/` ou `/professor`
- [ ] Manter `/jogos` exclusivo para estudantes
- [ ] Atualizar navegação e links internos
- [ ] Configurar proteção de rotas adequada

### **FASE 2: INTEGRAÇÃO FIREBASE REAL (2-3 dias)**

#### ✅ **Task 3: Configurar Firebase com Dados Reais**
- [ ] Verificar configuração atual do `.env.local`
- [ ] Conectar Firebase Auth com dados reais
- [ ] Configurar Firestore collections necessárias
- [ ] Implementar regras de segurança do Firestore

#### ✅ **Task 4: Integrar Dados Reais nos Dashboards**
- [ ] Substituir `ProfessorDemoContext` por dados reais
- [ ] Conectar dashboard estudante com dados reais
- [ ] Implementar queries Firestore para analytics
- [ ] Remover todos os dados mock e de demonstração

## 📊 STATUS ATUAL

### **✅ IMPLEMENTADO E FUNCIONANDO:**
- [x] Sistema de RBAC básico
- [x] Middleware de autenticação
- [x] Guest modes (com bug de roteamento)
- [x] Dashboard professor (com dados mock)
- [x] Dashboard estudante básico
- [x] Contextos de demonstração
- [x] Interface responsiva
- [x] Sistema de achievements mock

### **🔧 EM DESENVOLVIMENTO:**
- [/] Correção de roteamento guest modes
- [ ] Integração Firebase real
- [ ] Dashboard professor em rota correta
- [ ] Dados reais nos dashboards

### **⏳ PENDENTE:**
- [ ] Sistema colaborativo simplificado
- [ ] Leaderboard real-time
- [ ] Integração Highcharts/AG Grid
- [ ] Testes automatizados
- [ ] Otimização de performance

## 🔧 ARQUIVOS PRINCIPAIS A MODIFICAR

### **Roteamento:**
- `src/app/page.tsx` - Botão professor visitante
- `src/middleware.ts` - Lógica de redirecionamento
- `src/app/professor/page.tsx` - Nova rota professor (se necessário)

### **Firebase Integration:**
- `src/lib/firebase.ts` - Configuração real
- `src/contexts/AuthContext.tsx` - Auth real
- `src/contexts/ProfessorDemoContext.tsx` - Substituir por real
- `src/hooks/useFirestore.ts` - Queries reais

### **Dashboards:**
- `src/components/professor/ProfessorDashboard.tsx` - Dados reais
- `src/app/jogos/page.tsx` - Dashboard estudante
- `src/components/analytics/` - Analytics reais

## 🎯 OBJETIVOS FINAIS

### **Curto Prazo (1 semana):**
1. ✅ Corrigir bug de roteamento
2. ✅ Implementar Firebase real
3. ✅ Dashboards funcionando com dados reais
4. ✅ Guest modes funcionando corretamente

### **Médio Prazo (2-3 semanas):**
1. ✅ Sistema colaborativo simplificado
2. ✅ Leaderboard real-time
3. ✅ Analytics avançadas
4. ✅ Testes automatizados

### **Longo Prazo (1-2 meses):**
1. ✅ Integração completa Highcharts/AG Grid
2. ✅ Sistema de notificações
3. ✅ Otimização de performance
4. ✅ Deploy em produção

## 📝 NOTAS IMPORTANTES

- **Firebase Config:** Verificar se `.env.local` tem todas as variáveis necessárias
- **Segurança:** Implementar regras Firestore adequadas
- **Performance:** Considerar lazy loading para dashboards
- **UX:** Manter loading states durante transições
- **Testing:** Testar ambos os guest modes após correções

## 🚀 PRÓXIMO DESENVOLVEDOR

**Prioridade 1:** Corrigir roteamento dos guest modes
**Prioridade 2:** Configurar Firebase real
**Prioridade 3:** Integrar dados reais nos dashboards

**Tempo Estimado:** 3-5 dias para correções críticas
