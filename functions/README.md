# Cloud Functions - Rankings Pré-Agregados

## 🎯 Visão Geral

Cloud Functions para manter rankings pré-agregados atualizados automaticamente no Firebase Firestore. Sistema completamente automatizado que elimina a necessidade de atualização manual de rankings.

## 🚀 Funcionalidades

### 1. Trigger Automático (`onUnifiedScoreUpdate`)
- **Trigger**: `unified_scores/{studentId}` - Firestore onWrite
- **Ação**: Atualiza rankings automaticamente quando pontuação muda
- **Performance**: Execução em paralelo para múltiplas turmas
- **Fallback**: Regeneração completa se ranking não existe

### 2. Regeneração Manual (`updateClassRanking`)
- **Trigger**: HTTPS Callable Function
- **Ação**: Regenera ranking completo de uma turma específica
- **Uso**: `CloudFunctionsService.updateClassRanking('classId')`
- **Autenticação**: Requer usuário logado

### 3. Manutenção Automática (`regenerateRankings`)
- **Trigger**: Scheduled Function (diariamente às 2:00 AM)
- **Ação**: Regenera todos os rankings de turmas ativas
- **Processamento**: Lotes de 3 turmas com pausa entre lotes
- **Timezone**: America/Sao_Paulo

### 4. Estatísticas (`getRankingStats`)
- **Trigger**: HTTPS Callable Function
- **Ação**: Retorna estatísticas dos rankings
- **Dados**: Total, média, versões, datas de atualização
- **Uso**: Debug e monitoramento

## 📦 Instalação e Deploy

### Pré-requisitos
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Verificar projeto
firebase projects:list
```

### Instalação Local
```bash
# Navegar para o diretório functions
cd functions

# Instalar dependências
npm install

# Compilar TypeScript
npm run build
```

### Deploy
```bash
# Deploy de todas as funções
npm run deploy

# Deploy apenas funções de ranking
npm run deploy:ranking

# Deploy de função específica
firebase deploy --only functions:updateClassRanking
```

### Emulador Local
```bash
# Iniciar emulador (desenvolvimento)
npm run serve

# Acessar UI do emulador
# http://localhost:4000
```

## 🔧 Configuração

### Variáveis de Ambiente
As Cloud Functions usam a configuração automática do Firebase Admin SDK. Não são necessárias variáveis de ambiente adicionais.

### Permissões IAM
As funções precisam das seguintes permissões (configuradas automaticamente):
- `firestore.documents.read`
- `firestore.documents.write`
- `cloudscheduler.jobs.run`

### Limites e Quotas
```typescript
// Configurações padrão
timeout: 540s        // 9 minutos máximo
memory: 256MB        // Memória alocada
runtime: nodejs18    // Versão do Node.js
```

## 💻 Uso no Client-Side

### Importar Serviço
```typescript
import CloudFunctionsService from '@/services/cloudFunctionsService'
```

### Regenerar Ranking de Turma
```typescript
try {
  const result = await CloudFunctionsService.updateClassRanking('classId')
  console.log(`✅ ${result.studentsCount} estudantes, média: ${result.averageScore}`)
} catch (error) {
  console.error('Erro:', error.message)
}
```

### Obter Estatísticas
```typescript
try {
  const stats = await CloudFunctionsService.getRankingStats()
  console.log(`📊 ${stats.totalRankings} rankings ativos`)
} catch (error) {
  console.error('Erro:', error.message)
}
```

### Testar Conexão
```typescript
const connection = await CloudFunctionsService.testConnection()
if (connection.available) {
  console.log(`✅ Conectado (${connection.latency}ms)`)
} else {
  console.log(`❌ Erro: ${connection.error}`)
}
```

### Console do Navegador
```javascript
// Demonstração completa
await CloudFunctionsService.runCloudFunctionsDemo('classId')

// Benchmark client vs server
await CloudFunctionsService.benchmarkCloudFunctions('classId')

// Monitorar triggers
const cleanup = CloudFunctionsService.setupTriggerMonitoring()
// Para parar: cleanup()
```

## 📊 Monitoramento

### Logs das Funções
```bash
# Ver logs em tempo real
firebase functions:log

# Logs de função específica
firebase functions:log --only updateClassRanking

# Logs com filtro de tempo
firebase functions:log --since 1h
```

### Console Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione projeto → Functions
3. Visualize execuções, erros e performance

### Métricas de Performance
- **Trigger automático**: ~2-5 segundos por turma
- **Regeneração manual**: ~10-30 segundos por turma
- **Manutenção diária**: ~5-15 minutos para todas as turmas

## 🛠️ Desenvolvimento

### Estrutura do Código
```
functions/
├── src/
│   └── index.ts           # Todas as funções
├── package.json           # Dependências
├── tsconfig.json         # Configuração TypeScript
└── README.md             # Esta documentação
```

### Debugging Local
```typescript
// Adicionar logs detalhados
console.log(`🔍 [Debug] Variável:`, variable)

// Testar função específica
firebase functions:shell
> updateClassRanking({classId: 'test'})
```

### Testes
```bash
# Executar testes (quando disponíveis)
npm test

# Validar compilação
npm run build
```

## 🚨 Troubleshooting

### Problemas Comuns

**1. "Function not found"**
```bash
# Verificar se função foi deployada
firebase functions:list

# Re-deploy se necessário
firebase deploy --only functions
```

**2. "Permission denied"**
```bash
# Verificar autenticação
firebase login

# Verificar projeto
firebase use --list
```

**3. "Timeout exceeded"**
- Verifique se há muitos estudantes na turma
- Considere otimizar lógica de processamento
- Aumente timeout se necessário

**4. "Cold start latency"**
- Primeira execução pode ser lenta (~5-10s)
- Execuções subsequentes são mais rápidas (~1-2s)
- Considere pré-aquecimento para produção

### Debugging Avançado

**Verificar triggers:**
```typescript
// No cliente, monitorar eventos
window.addEventListener('moduleCompleted', (event) => {
  console.log('Trigger detectado:', event.detail)
})
```

**Verificar dados:**
```typescript
// Verificar se ranking foi atualizado
const ranking = await ClassRankingService.getPreAggregatedRanking('classId', false)
console.log('Última atualização:', ranking[0]?.lastActivity)
```

## 📈 Performance

### Benchmarks Esperados
- **Trigger automático**: 2-5s após mudança de pontuação
- **Regeneração manual**: 10-30s para turma de 50+ estudantes  
- **Consulta de ranking**: <100ms (dados pré-agregados)
- **Manutenção diária**: 5-15min para ~20 turmas

### Otimizações Implementadas
- ✅ Processamento em lotes para múltiplas turmas
- ✅ Atualização incremental (apenas estudante alterado)
- ✅ Fallback gracioso para dados inexistentes
- ✅ Logs estruturados para debugging
- ✅ Cache de dados de usuário entre chamadas

## 🔄 Versionamento

### Versão Atual: 2.0
- Triggers automáticos em tempo real
- Regeneração manual via HTTPS
- Manutenção automática diária
- Estatísticas e monitoramento

### Roadmap
- **v2.1**: Notificações em tempo real
- **v2.2**: Métricas avançadas de performance
- **v2.3**: Backup automático de rankings
- **v3.0**: Machine Learning para previsões

---

## 🎉 Resumo

As Cloud Functions automatizam completamente o sistema de rankings, oferecendo:

- **⚡ Performance**: Atualizações automáticas em segundos
- **🔄 Confiabilidade**: Triggers automáticos + manutenção diária
- **📊 Transparência**: Logs detalhados e estatísticas
- **🛡️ Segurança**: Autenticação obrigatória + validação de dados
- **🔧 Flexibilidade**: API client-side + ferramentas de debug

**Para dúvidas**: Consulte logs no Firebase Console ou use `CloudFunctionsService.runCloudFunctionsDemo()`