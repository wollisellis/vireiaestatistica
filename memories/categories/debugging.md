# 🔍 Debugging & Diagnósticos

Sessões focadas em investigação de problemas e diagnósticos do sistema.

## 2025-01-22

### Debug: Sistema de Autenticação e Exibição de Dados
- **Sessão**: [2025-01-22-session-001](../sessions/2025-01-22-session-001.md)
- **Foco**: Investigar por que dados não apareciam na UI
- **Ferramentas Criadas**: 
  - `FirebaseConnectionTest.tsx` - Debug de conectividade
  - Logs detalhados no useModuleProgress
- **Descobertas**:
  - Hook retornava função em vez de valor
  - Falta de fallback em autenticação
  - Configuração restritiva de convidados
- **Impacto**: Problema crítico na UX resolvido

---

## Template para Próximas Sessões de Debug

### Debug: [Área/Sistema Investigado]
- **Sessão**: [link para sessão]
- **Foco**: [o que estava sendo investigado]
- **Ferramentas Criadas**: [componentes/scripts de debug]
- **Descobertas**: [principais insights obtidos]
- **Impacto**: [como afetou o projeto]