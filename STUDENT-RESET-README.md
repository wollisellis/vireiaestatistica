# 🚀 Student Data Reset Scripts - Bioestat Platform

## 📋 Visão Geral

Este conjunto de scripts permite resetar todos os dados relacionados aos estudantes na plataforma Bioestat, preservando dados de professores e configurações do sistema.

### ⚠️ ATENÇÃO CRÍTICA
- **Esta ferramenta DELETA PERMANENTEMENTE dados dos estudantes**
- **Use sempre em modo DRY RUN primeiro**
- **Teste em ambiente de desenvolvimento antes de usar em produção**
- **Dados de professores e sistema são PRESERVADOS**

## 📁 Arquivos Incluídos

### 1. `src/scripts/studentDataResetScript.ts` (1000+ linhas)
- **Script principal completo em TypeScript**
- Sistema de backup automático
- Validações robustas de segurança
- Logs detalhados e relatórios
- Configurações avançadas

### 2. `src/scripts/studentDataResetScript.examples.ts`
- **Exemplos práticos de uso**
- Casos de uso comuns
- Configurações customizadas
- Comandos de console

### 3. `browser-student-reset.js`
- **Versão simplificada para console do navegador**
- Funciona quando logado como professor
- Interface amigável
- Comandos interativos

### 4. `student-reset-tool.html`
- **Interface web completa**
- Botões para cada operação
- Console visual integrado
- Instruções passo a passo

### 5. `run-student-reset.js`
- **Versão Node.js (requer autenticação)**
- Para execução via linha de comando
- Configuração via .env.local

## 🚀 Como Usar

### Opção 1: Interface Web (RECOMENDADO)

1. **Abra o arquivo HTML:**
   ```bash
   # Abra student-reset-tool.html no navegador
   open student-reset-tool.html
   ```

2. **Faça login como professor** na plataforma principal

3. **Execute a sequência:**
   - Clique em "Verificar Status"
   - Clique em "Simular Reset" (dry run)
   - Se tudo estiver OK, clique em "Reset REAL"

### Opção 2: Console do Navegador

1. **Abra a plataforma** e faça login como professor

2. **Abra o console** (F12 → Console)

3. **Cole e execute o script:**
   ```javascript
   // Cole todo o conteúdo de browser-student-reset.js
   // Depois execute:
   StudentResetCommands.fullSequence()
   ```

### Opção 3: TypeScript (Desenvolvimento)

1. **Importe o script:**
   ```typescript
   import StudentDataResetScript from './src/scripts/studentDataResetScript'
   import Examples from './src/scripts/studentDataResetScript.examples'
   ```

2. **Execute sequência segura:**
   ```typescript
   // 1. Verificar status
   const status = await StudentDataResetScript.getSystemStatus()
   
   // 2. Dry run
   const dryRun = await StudentDataResetScript.executeQuickReset(true)
   
   // 3. Reset real (apenas se dry run passou)
   const result = await StudentDataResetScript.executeQuickReset(false)
   ```

## 🗂️ Dados Processados

### ✅ PRESERVADO (NÃO será deletado)
- ✅ Contas de professores (`users` com `role: 'professor'`)
- ✅ Dados de turmas (`classes`)
- ✅ Módulos educacionais (`modules`)
- ✅ Configurações do sistema
- ✅ Bancos de questões
- ✅ Metadados educacionais

### ❌ REMOVIDO (será deletado)
- ❌ Contas de estudantes (`users` com `role: 'student'`)
- ❌ Pontuações (`unified_scores`)
- ❌ Progresso (`userProgress`, `student_module_progress`)
- ❌ Tentativas de exercícios (`quiz_attempts`, `exercise_attempts`)
- ❌ Relacionamentos estudante-turma (`classStudents`)
- ❌ Rankings e classificações
- ❌ Conquistas dos estudantes
- ❌ Sessões de quiz ativas

## 🛡️ Funcionalidades de Segurança

### Validações Automáticas
- ✅ Verificação de saúde do sistema
- ✅ Contagem de professores (não pode ser zero)
- ✅ Análise de dependências
- ✅ Verificação de permissões

### Confirmações Obrigatórias
- ✅ Confirmação dupla para reset real
- ✅ Texto "CONFIRMO" obrigatório
- ✅ Dry run obrigatório antes do reset real

### Sistema de Backup
- ✅ Backup automático antes da execução
- ✅ Validação de integridade
- ✅ Função de restauração
- ✅ Checksums para verificação

## 📊 Relatórios Gerados

### Status do Sistema
```javascript
{
  professors: 5,           // Número de professores
  students: 150,          // Número de estudantes
  classes: 8,             // Número de turmas
  totalStudentData: 2847, // Total de documentos de estudantes
  systemHealth: 'healthy' // healthy/warning/critical
}
```

### Relatório de Execução
```javascript
{
  timestamp: Date,
  totalCollections: 10,
  totalDocumentsFound: 2847,
  totalDocumentsDeleted: 2847,
  totalErrors: 0,
  executionTime: 15432, // ms
  results: [...]
}
```

## 🚨 Procedimentos de Emergência

### Se algo der errado:

1. **NÃO PÂNICO** - O backup foi criado automaticamente
2. **Parar execução** - Fechar console/aplicação
3. **Verificar backup** - Validar integridade
4. **Restaurar dados** - Usar função de restore
5. **Investigar causa** - Analisar logs

### Comandos de Emergência:
```javascript
// Verificar se backup existe
const isValid = StudentDataResetScript.validateBackupIntegrity(backup)

// Restaurar tudo
await StudentDataResetScript.restoreFromBackup(backup)

// Verificar status pós-restauração
const status = await StudentDataResetScript.getSystemStatus()
```

## 🔧 Configurações Avançadas

### Configuração Customizada
```typescript
const script = new StudentDataResetScript({
  dryRun: false,                    // false = PRODUÇÃO
  createBackup: true,               // Sempre recomendado
  validateBeforeDelete: true,       // Validações extras
  logLevel: 'detailed',             // minimal/detailed/verbose
  confirmationRequired: true,       // Pedir confirmação
  batchSize: 100,                   // Documentos por lote
  preserveSystemData: true          // Preservar dados do sistema
})
```

### Variáveis de Ambiente (.env.local)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_dominio
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
# ... outras configurações Firebase
```

## 📈 Melhores Práticas

### ✅ FAÇA
1. **Sempre teste primeiro** - Use dry run
2. **Backup obrigatório** - Nunca execute sem backup
3. **Horário apropriado** - Execute fora do horário de uso
4. **Monitore progresso** - Acompanhe logs
5. **Valide resultado** - Confirme que professores foram preservados
6. **Documente execução** - Registre data, motivo e resultados

### ❌ NÃO FAÇA
1. ❌ Executar sem dry run primeiro
2. ❌ Desabilitar backup em produção
3. ❌ Executar durante horário de aula
4. ❌ Ignorar erros de validação
5. ❌ Executar sem confirmação
6. ❌ Modificar scripts sem testar

## 🐛 Troubleshooting

### "Firebase não conectado"
- Verificar configuração em .env.local
- Confirmar que está logado na plataforma
- Verificar permissões do Firestore

### "Acesso negado"
- Fazer login como professor
- Verificar regras do Firestore
- Confirmar permissões de administrador

### "Timeout durante execução"
- Reduzir batchSize na configuração
- Executar em horário de menor uso
- Verificar conexão de internet

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar esta documentação
2. Executar `runComprehensiveTest()` para diagnóstico
3. Analisar logs detalhados
4. Contatar: Ellis Abhulime

## 🔄 Changelog

### v1.0.0 (2025-01-28)
- ✅ Implementação completa dos 3 scripts
- ✅ Interface web interativa
- ✅ Sistema de backup e restauração
- ✅ Validações de segurança robustas
- ✅ Documentação completa
- ✅ Exemplos práticos
- ✅ Comandos de console

---

**⚠️ LEMBRE-SE: Esta ferramenta é DESTRUTIVA. Use com extrema cautela e sempre teste primeiro!**

**🎯 Objetivo: Limpar dados de estudantes para novos semestres, preservando a estrutura educacional.**
