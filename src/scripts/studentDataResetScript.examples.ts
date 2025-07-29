// Exemplos de Uso do Student Data Reset Script
// Guia prático para usar o script de reset de dados dos estudantes
// Created by Ellis Abhulime - UNICAMP

import StudentDataResetScript from './studentDataResetScript'

/**
 * 🎯 EXEMPLOS DE USO BÁSICO
 */

// 1. Verificar status do sistema antes de qualquer operação
export async function checkSystemStatus() {
  console.log('📊 Verificando status do sistema...')
  
  const status = await StudentDataResetScript.getSystemStatus()
  
  if (status.systemHealth === 'critical') {
    console.error('🚨 SISTEMA CRÍTICO - NÃO EXECUTE RESET!')
    return false
  }
  
  console.log(`✅ Sistema OK: ${status.professors} professores, ${status.students} estudantes`)
  return true
}

// 2. Executar teste completo antes do reset real
export async function runFullTest() {
  console.log('🧪 Executando teste completo...')
  
  const testResults = await StudentDataResetScript.runComprehensiveTest()
  
  console.log('📋 Recomendações do teste:')
  testResults.recommendations.forEach(rec => console.log(`  ${rec}`))
  
  const isReady = testResults.recommendations.every(rec => 
    !rec.includes('❌') && !rec.includes('🚨')
  )
  
  if (isReady) {
    console.log('✅ Sistema pronto para reset!')
  } else {
    console.log('⚠️ Corrigir problemas antes de executar reset')
  }
  
  return testResults
}

// 3. Executar reset com backup (dry run primeiro)
export async function executeResetWithBackup() {
  console.log('🚀 Executando reset com backup...')
  
  try {
    // Primeiro: Dry run para testar
    console.log('1️⃣ Executando dry run...')
    const dryRunReport = await StudentDataResetScript.executeQuickReset(true)
    
    if (dryRunReport.totalErrors > 0) {
      console.error('❌ Erros no dry run - cancelando')
      return false
    }
    
    console.log(`✅ Dry run OK: ${dryRunReport.totalDocumentsFound} documentos seriam deletados`)
    
    // Segundo: Confirmar execução real
    const userConfirmed = confirm(`
      🚨 ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE ${dryRunReport.totalDocumentsFound} documentos!
      
      Dados que serão removidos:
      - ${dryRunReport.results.find(r => r.collection === 'users')?.documentsFound || 0} contas de estudantes
      - Todos os progressos e pontuações
      - Todas as tentativas de exercícios
      
      Deseja continuar? Esta ação NÃO PODE SER DESFEITA!
    `)
    
    if (!userConfirmed) {
      console.log('❌ Operação cancelada pelo usuário')
      return false
    }
    
    // Terceiro: Executar reset real
    console.log('2️⃣ Executando reset real...')
    const finalReport = await StudentDataResetScript.executeQuickReset(false)
    
    console.log(`✅ Reset concluído: ${finalReport.totalDocumentsDeleted} documentos deletados`)
    
    return finalReport
    
  } catch (error) {
    console.error('❌ Erro durante reset:', error)
    return false
  }
}

// 4. Verificar dependências antes de executar
export async function checkDependencies() {
  console.log('🔧 Verificando dependências...')
  
  const deps = await StudentDataResetScript.checkDependencies()
  
  if (!deps.firebaseConnected) {
    console.error('❌ Firebase não conectado!')
    return false
  }
  
  if (!deps.permissionsOk) {
    console.error('❌ Problemas de permissão!')
    console.log('Coleções inacessíveis:', deps.collectionsInaccessible)
    return false
  }
  
  console.log(`✅ Dependências OK - Tempo estimado: ${deps.estimatedExecutionTime}s`)
  return true
}

/**
 * 🎯 EXEMPLOS DE USO AVANÇADO
 */

// 5. Reset customizado com configuração específica
export async function customReset() {
  console.log('⚙️ Executando reset customizado...')
  
  const script = new StudentDataResetScript({
    dryRun: false, // ⚠️ PRODUÇÃO
    createBackup: true,
    validateBeforeDelete: true,
    logLevel: 'verbose',
    confirmationRequired: true,
    batchSize: 50, // Menor para sistemas lentos
    preserveSystemData: true
  })
  
  const report = await script.executeReset()
  
  console.log('📊 Relatório customizado:')
  console.table({
    'Coleções': report.totalCollections,
    'Docs Encontrados': report.totalDocumentsFound,
    'Docs Deletados': report.totalDocumentsDeleted,
    'Erros': report.totalErrors,
    'Tempo': `${(report.executionTime / 1000).toFixed(2)}s`
  })
  
  return report
}

// 6. Monitoramento de progresso em tempo real
export async function monitoredReset() {
  console.log('📊 Reset com monitoramento...')
  
  const startTime = Date.now()
  
  // Verificar status inicial
  const initialStatus = await StudentDataResetScript.getSystemStatus()
  console.log(`📈 Status inicial: ${initialStatus.totalStudentData} documentos`)
  
  // Executar reset
  const report = await StudentDataResetScript.executeQuickReset(false)
  
  // Verificar status final
  const finalStatus = await StudentDataResetScript.getSystemStatus()
  console.log(`📉 Status final: ${finalStatus.totalStudentData} documentos`)
  
  // Métricas
  const totalTime = Date.now() - startTime
  const docsPerSecond = report.totalDocumentsDeleted / (totalTime / 1000)
  
  console.log('📊 Métricas de performance:')
  console.table({
    'Documentos deletados': report.totalDocumentsDeleted,
    'Tempo total': `${(totalTime / 1000).toFixed(2)}s`,
    'Docs/segundo': docsPerSecond.toFixed(2),
    'Eficiência': report.totalErrors === 0 ? '100%' : `${((report.totalDocumentsDeleted / report.totalDocumentsFound) * 100).toFixed(1)}%`
  })
  
  return { report, metrics: { totalTime, docsPerSecond } }
}

/**
 * 🎯 UTILIDADES E HELPERS
 */

// 7. Gerar relatório de pré-execução
export async function generatePreExecutionReport() {
  console.log('📋 Gerando relatório de pré-execução...')
  
  const [status, dependencies, dryRun] = await Promise.all([
    StudentDataResetScript.getSystemStatus(),
    StudentDataResetScript.checkDependencies(),
    StudentDataResetScript.executeQuickReset(true)
  ])
  
  const report = {
    timestamp: new Date().toISOString(),
    systemStatus: status,
    dependencies: dependencies,
    dryRunResults: dryRun,
    readinessScore: calculateReadinessScore(status, dependencies, dryRun),
    recommendation: generateRecommendation(status, dependencies, dryRun)
  }
  
  console.log('📋 Relatório de pré-execução:')
  console.log(`🎯 Score de prontidão: ${report.readinessScore}/100`)
  console.log(`💡 Recomendação: ${report.recommendation}`)
  
  return report
}

// 8. Calcular score de prontidão do sistema
function calculateReadinessScore(status: any, deps: any, dryRun: any): number {
  let score = 0
  
  // Sistema saudável (30 pontos)
  if (status.systemHealth === 'healthy') score += 30
  else if (status.systemHealth === 'warning') score += 15
  
  // Firebase e permissões OK (25 pontos)
  if (deps.firebaseConnected) score += 15
  if (deps.permissionsOk) score += 10
  
  // Dry run sem erros (25 pontos)
  if (dryRun.totalErrors === 0) score += 25
  else if (dryRun.totalErrors < 3) score += 15
  
  // Dados para processar (20 pontos)
  if (dryRun.totalDocumentsFound > 0) score += 20
  
  return Math.min(100, score)
}

// 9. Gerar recomendação baseada no score
function generateRecommendation(status: any, deps: any, dryRun: any): string {
  const score = calculateReadinessScore(status, deps, dryRun)
  
  if (score >= 90) {
    return '✅ EXECUTE: Sistema pronto para reset'
  } else if (score >= 70) {
    return '⚠️ CUIDADO: Execute com monitoramento'
  } else if (score >= 50) {
    return '🔧 CORRIJA: Resolver problemas antes de executar'
  } else {
    return '🚨 NÃO EXECUTE: Sistema não está pronto'
  }
}

/**
 * 🎯 COMANDOS RÁPIDOS PARA CONSOLE
 */

// Para usar no console do navegador:
export const QuickCommands = {
  // Verificar status
  async status() {
    return await StudentDataResetScript.getSystemStatus()
  },
  
  // Teste rápido
  async test() {
    return await StudentDataResetScript.runComprehensiveTest()
  },
  
  // Dry run
  async dryRun() {
    return await StudentDataResetScript.executeQuickReset(true)
  },
  
  // Reset real (com confirmação)
  async reset() {
    const confirmed = confirm('🚨 ATENÇÃO: Esta operação irá DELETAR todos os dados dos estudantes! Confirma?')
    if (!confirmed) return 'Cancelado pelo usuário'
    
    return await StudentDataResetScript.executeQuickReset(false)
  }
}

// Disponibilizar no console global
if (typeof window !== 'undefined') {
  (window as any).ResetCommands = QuickCommands
  console.log('🎮 Comandos disponíveis no console:')
  console.log('  ResetCommands.status() - Verificar status')
  console.log('  ResetCommands.test() - Teste completo')
  console.log('  ResetCommands.dryRun() - Simular reset')
  console.log('  ResetCommands.reset() - Executar reset REAL')
}

export default {
  checkSystemStatus,
  runFullTest,
  executeResetWithBackup,
  checkDependencies,
  customReset,
  monitoredReset,
  generatePreExecutionReport,
  QuickCommands
}