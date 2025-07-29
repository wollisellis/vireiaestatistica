# Student Data Reset Script

## 🎯 Visão Geral

O **Student Data Reset Script** é uma ferramenta completa para resetar todos os dados relacionados aos estudantes na plataforma Bioestat, preservando dados de professores e configurações do sistema.

### ⚠️ IMPORTANTE
- **Esta ferramenta DELETA PERMANENTEMENTE dados dos estudantes**
- **Use sempre em modo DRY RUN primeiro**
- **Crie backups antes de executar em produção**
- **Teste em ambiente de desenvolvimento**

## 🚀 Funcionalidades

### ✅ Funcionalidades Principais
- **Reset Completo**: Remove todos os dados de estudantes de 12+ coleções Firebase
- **Modo Dry Run**: Simula operações sem deletar dados reais
- **Sistema de Backup**: Cria backup automático antes da execução
- **Validação Robusta**: Verifica integridade antes e depois das operações
- **Logs Detalhados**: Rastreamento completo de todas as operações
- **Restauração**: Capacidade de restaurar dados do backup
- **Análise de Dependências**: Verifica pré-requisitos e permissões

### 🛡️ Funcionalidades de Segurança
- **Confirmação Obrigatória**: Requer confirmação explícita para operações destrutivas
- **Preservação Inteligente**: Mantém dados de professores e sistema
- **Validação de Integridade**: Checksums e verificações de consistência
- **Execução em Lotes**: Evita timeouts e sobrecarga do sistema
- **Rollback Completo**: Instruções e ferramentas para reverter operações

## 📁 Estrutura de Arquivos

```
src/scripts/
├── studentDataResetScript.ts          # Script principal
├── studentDataResetScript.examples.ts # Exemplos de uso
└── README.md                          # Esta documentação
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Firebase configurado e conectado
- Permissões de escrita em todas as coleções
- Node.js com TypeScript

### Importação
```typescript
import StudentDataResetScript from './studentDataResetScript'
import Examples from './studentDataResetScript.examples'
```

## 📚 Guia de Uso

### 1. Verificação Inicial do Sistema

```typescript
// Verificar status geral
const status = await StudentDataResetScript.getSystemStatus()
console.log('Status:', status.systemHealth) // 'healthy', 'warning', ou 'critical'

// Verificar dependências
const deps = await StudentDataResetScript.checkDependencies()
console.log('Firebase OK:', deps.firebaseConnected)
console.log('Permissões OK:', deps.permissionsOk)
```

### 2. Teste Completo (Recomendado)

```typescript
// Executar teste abrangente
const testResults = await StudentDataResetScript.runComprehensiveTest()

// Analisar recomendações
testResults.recommendations.forEach(rec => console.log(rec))

// Verificar se sistema está pronto
const isReady = testResults.recommendations.every(rec => 
  !rec.includes('❌') && !rec.includes('🚨')
)
```

### 3. Execução Segura (Dry Run → Produção)

```typescript
// PASSO 1: Dry Run (sempre primeiro!)
const dryRunReport = await StudentDataResetScript.executeQuickReset(true)
console.log(`Seria deletado: ${dryRunReport.totalDocumentsFound} documentos`)

// PASSO 2: Analisar resultados do dry run
if (dryRunReport.totalErrors > 0) {
  console.error('❌ Erros no dry run - NÃO execute em produção!')
  return
}

// PASSO 3: Executar em produção (apenas se dry run passou)
const prodReport = await StudentDataResetScript.executeQuickReset(false)
console.log(`✅ Deletados: ${prodReport.totalDocumentsDeleted} documentos`)
```

### 4. Configuração Customizada

```typescript
const script = new StudentDataResetScript({
  dryRun: false,                    // ⚠️ false = PRODUÇÃO
  createBackup: true,               // Sempre recomendado
  validateBeforeDelete: true,       // Validações extras
  logLevel: 'detailed',             // 'minimal', 'detailed', 'verbose'
  confirmationRequired: true,       // Pedir confirmação
  batchSize: 100,                   // Documentos por lote
  preserveSystemData: true          // Preservar dados do sistema
})

const report = await script.executeReset()
```

## 🎮 Comandos de Console

Para uso interativo no console do navegador:

```javascript
// Verificar status
await ResetCommands.status()

// Teste completo
await ResetCommands.test()

// Dry run
await ResetCommands.dryRun()

// Reset real (com confirmação)
await ResetCommands.reset()
```

## 📊 Relatórios e Monitoramento

### Relatório de Status do Sistema
```typescript
const status = await StudentDataResetScript.getSystemStatus()
// Retorna: professores, estudantes, turmas, saúde do sistema
```

### Relatório de Execução
```typescript
const report = await StudentDataResetScript.executeQuickReset(true)
// Retorna: documentos encontrados/deletados, erros, tempo de execução
```

### Métricas de Performance
```typescript
console.table({
  'Documentos/segundo': docsDeleted / (timeElapsed / 1000),
  'Taxa de sucesso': (docsDeleted / docsFound) * 100,
  'Coleções processadas': collections.length
})
```

## 💾 Sistema de Backup

### Criação Automática
O backup é criado automaticamente quando `createBackup: true`:

```typescript
// Dados salvos em memória com:
interface BackupData {
  collectionName: string
  documents: Array<{id: string, data: any}>
  metadata: {
    createdAt: Date
    documentCount: number
    totalSize: number
    checksum: string
  }
}
```

### Exportar para Arquivo
```typescript
const backupString = StudentDataResetScript.exportBackupToFile(
  backupData, 
  'backup-2024-01-15.json'
)
```

### Restauração
```typescript
const success = await StudentDataResetScript.restoreFromBackup(backupData)
if (success) {
  console.log('✅ Dados restaurados com sucesso')
}
```

### Validação de Backup
```typescript
const validation = StudentDataResetScript.validateBackupIntegrity(backupData)
if (!validation.isValid) {
  console.error('❌ Backup corrompido:', validation.errors)
}
```

## 🗂️ Coleções Processadas

O script processa as seguintes coleções do Firebase:

### 🔴 Alta Prioridade (Dados Principais)
- `users` (apenas estudantes)
- `unified_scores`
- `userProgress`

### 🟡 Média Prioridade (Relacionamentos)
- `classStudents`
- `student_module_progress`

### 🟢 Baixa Prioridade (Histórico)
- `quiz_attempts`
- `randomized_quizzes`
- `quiz_sessions`
- `exercise_attempts`
- `achievements`
- `rankings`
- `module_progress`

## ⚠️ Considerações de Segurança

### ✅ O que é PRESERVADO
- ✅ Contas de professores (`users` com `role: 'professor'`)
- ✅ Dados de turmas e módulos (`classes`, `modules`)
- ✅ Configurações do sistema
- ✅ Bancos de questões
- ✅ Metadados educacionais

### ❌ O que é REMOVIDO
- ❌ Contas de estudantes (`users` com `role: 'student'`)
- ❌ Todo progresso e pontuações
- ❌ Tentativas de exercícios e quizzes
- ❌ Relacionamentos estudante-turma
- ❌ Rankings e classificações
- ❌ Histórico de atividades

## 🚨 Procedimentos de Emergência

### Se algo der errado:
1. **NÃO PÂNICO** - O backup foi criado automaticamente
2. **Parar execução** - Fechar console/aplicação se ainda executando
3. **Verificar backup** - Validar integridade dos dados salvos
4. **Restaurar dados** - Usar função de restore
5. **Investigar causa** - Analisar logs de erro
6. **Reportar problema** - Documentar para correção

### Comandos de Emergência:
```typescript
// Verificar se backup existe e é válido
const isValid = StudentDataResetScript.validateBackupIntegrity(backupData)

// Restaurar tudo imediatamente
await StudentDataResetScript.restoreFromBackup(backupData)

// Verificar status pós-restauração
const status = await StudentDataResetScript.getSystemStatus()
```

## 📈 Melhores Práticas

### ✅ Recomendações
1. **Sempre teste primeiro**: Use dry run em produção
2. **Backup obrigatório**: Nunca execute sem backup
3. **Horário apropriado**: Execute fora do horário de uso
4. **Monitore progresso**: Acompanhe logs em tempo real
5. **Valide resultado**: Confirme que professores foram preservados
6. **Documente execução**: Registre data, motivo e resultados

### ❌ Não faça
1. ❌ Executar sem dry run primeiro
2. ❌ Desabilitar backup em produção
3. ❌ Executar durante horário de aula
4. ❌ Ignorar erros de validação
5. ❌ Executar sem confirmação
6. ❌ Modificar script sem testar

## 🐛 Troubleshooting

### Erro: "Firebase não conectado"
```typescript
// Verificar configuração
import { db } from '@/lib/firebase'
console.log('DB conectado:', !!db)
```

### Erro: "Acesso negado à coleção"
```typescript
// Verificar permissões no Firestore Rules
// Executar checkDependencies() para diagnóstico
const deps = await StudentDataResetScript.checkDependencies()
console.log('Coleções inacessíveis:', deps.collectionsInaccessible)
```

### Erro: "Timeout durante execução"
```typescript
// Reduzir batchSize na configuração
const script = new StudentDataResetScript({
  batchSize: 50, // Reduzir de 100 para 50
  // outras configurações...
})
```

### Erro: "Backup corrompido"
```typescript
// Validar integridade
const validation = StudentDataResetScript.validateBackupIntegrity(backup)
console.log('Erros:', validation.errors)
console.log('Avisos:', validation.warnings)
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar esta documentação
2. Executar `runComprehensiveTest()` para diagnóstico
3. Analisar logs detalhados
4. Contatar desenvolvedor: Ellis Abhulime

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- ✅ Implementação inicial completa
- ✅ Sistema de backup e restauração
- ✅ Validações de segurança
- ✅ Modo dry run
- ✅ Documentação completa
- ✅ Exemplos de uso
- ✅ Comandos de console

---

**⚠️ LEMBRE-SE: Esta ferramenta é DESTRUTIVA. Use com extrema cautela e sempre teste primeiro!**