// Script de Migração e Teste - Rankings Pré-Agregados
// Utilitário para Fase 2: Geração, teste e monitoramento dos rankings

import ClassRankingService from '@/services/classRankingService'
import OptimizedClassService from '@/services/optimizedClassService'
import { enhancedClassService } from '@/services/enhancedClassService'

// 🎯 Interface para resultados de benchmark
interface BenchmarkResult {
  method: string
  time: number
  studentsCount: number
  success: boolean
  error?: string
}

export class RankingMigrationScript {
  
  // ✅ MIGRAÇÃO: Gerar rankings para todas as turmas ativas
  static async migrateAllClassRankings(): Promise<{
    totalClasses: number
    successful: number
    failed: number
    errors: string[]
    timeElapsed: number
  }> {
    console.log(`🚀 [RankingMigration] Iniciando migração de todos os rankings...`)
    const startTime = performance.now()
    
    const result = await ClassRankingService.regenerateAllRankings()
    
    const endTime = performance.now()
    const timeElapsed = endTime - startTime

    console.log(`✅ [RankingMigration] Migração concluída em ${(timeElapsed / 1000).toFixed(2)}s`)
    console.table({
      'Total de turmas': result.success + result.failed,
      'Sucessos': result.success,
      'Falhas': result.failed,
      'Taxa de sucesso': `${((result.success / (result.success + result.failed)) * 100).toFixed(1)}%`,
      'Tempo total': `${(timeElapsed / 1000).toFixed(2)}s`
    })

    if (result.errors.length > 0) {
      console.warn('⚠️ Erros encontrados:')
      result.errors.forEach(error => console.warn(`  - ${error}`))
    }

    return {
      totalClasses: result.success + result.failed,
      successful: result.success,
      failed: result.failed,
      errors: result.errors,
      timeElapsed
    }
  }

  // 📊 BENCHMARK: Comparar performance entre todas as versões
  static async benchmarkAllVersions(classId: string, iterations: number = 3): Promise<{
    results: BenchmarkResult[]
    winner: string
    performanceGain: string
    recommendation: string
  }> {
    console.log(`🏁 [RankingMigration] Benchmark para turma ${classId} (${iterations} iterações)`)
    
    const results: BenchmarkResult[] = []

    // Teste 1: Sistema Legado
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now()
        const legacyData = await enhancedClassService.getClassStudents(classId)
        const endTime = performance.now()
        
        results.push({
          method: 'Sistema Legado',
          time: endTime - startTime,
          studentsCount: legacyData?.length || 0,
          success: true
        })
      } catch (error) {
        results.push({
          method: 'Sistema Legado',
          time: 0,
          studentsCount: 0,
          success: false,
          error: error.message
        })
      }
    }

    // Teste 2: Fase 1 (Otimizado com Cache)
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now()
        const optimizedData = await OptimizedClassService.getOptimizedClassStudents(classId, {}, false)
        const endTime = performance.now()
        
        results.push({
          method: 'Fase 1 (Otimizado)',
          time: endTime - startTime,
          studentsCount: optimizedData?.length || 0,
          success: true
        })
      } catch (error) {
        results.push({
          method: 'Fase 1 (Otimizado)',
          time: 0,
          studentsCount: 0,
          success: false,
          error: error.message
        })
      }
    }

    // Teste 3: Fase 2 (Pré-Agregado) - sem cache para primeiro teste
    for (let i = 0; i < iterations; i++) {
      try {
        const startTime = performance.now()
        const preAggregatedData = await ClassRankingService.getPreAggregatedRanking(classId, i > 0) // Cache apenas após primeira execução
        const endTime = performance.now()
        
        results.push({
          method: 'Fase 2 (Pré-Agregado)',
          time: endTime - startTime,
          studentsCount: preAggregatedData?.length || 0,
          success: true
        })
      } catch (error) {
        results.push({
          method: 'Fase 2 (Pré-Agregado)',
          time: 0,
          studentsCount: 0,
          success: false,
          error: error.message
        })
      }
    }

    // Calcular médias por método
    const averages = this.calculateAverages(results)
    console.table(averages)

    // Determinar vencedor
    const validAverages = averages.filter(avg => avg.success && avg.averageTime > 0)
    const winner = validAverages.reduce((fastest, current) => 
      current.averageTime < fastest.averageTime ? current : fastest
    )

    const slowest = validAverages.reduce((slowest, current) => 
      current.averageTime > slowest.averageTime ? current : slowest
    )

    const performanceGain = slowest.averageTime > 0 
      ? `${((slowest.averageTime / winner.averageTime) - 1) * 100}%` 
      : 'N/A'

    let recommendation = ''
    if (winner.method.includes('Pré-Agregado')) {
      recommendation = '🚀 Recomendado: Ativar Fase 2 (rankings pré-agregados) para máxima performance'
    } else if (winner.method.includes('Otimizado')) {
      recommendation = '⚡ Recomendado: Usar Fase 1 (otimizado com cache) como boa opção'
    } else {
      recommendation = '⚠️ Investigar: Sistema legado teve melhor performance (problema nos otimizados?)'
    }

    console.log(`🏆 Vencedor: ${winner.method} (${winner.averageTime.toFixed(2)}ms)`)
    console.log(`📈 Ganho de performance: ${performanceGain} mais rápido`)
    console.log(`💡 ${recommendation}`)

    return {
      results,
      winner: winner.method,
      performanceGain,
      recommendation
    }
  }

  // 📊 HELPER: Calcular médias dos benchmarks
  private static calculateAverages(results: BenchmarkResult[]): Array<{
    method: string
    averageTime: number
    studentsCount: number
    successRate: number
    success: boolean
  }> {
    const grouped = results.reduce((acc, result) => {
      if (!acc[result.method]) {
        acc[result.method] = []
      }
      acc[result.method].push(result)
      return acc
    }, {} as Record<string, BenchmarkResult[]>)

    return Object.entries(grouped).map(([method, methodResults]) => {
      const successfulResults = methodResults.filter(r => r.success && r.time > 0)
      const averageTime = successfulResults.length > 0 
        ? successfulResults.reduce((sum, r) => sum + r.time, 0) / successfulResults.length 
        : 0
      
      const studentsCount = methodResults.find(r => r.studentsCount > 0)?.studentsCount || 0
      const successRate = (successfulResults.length / methodResults.length) * 100

      return {
        method,
        averageTime: Math.round(averageTime * 100) / 100, // 2 casas decimais
        studentsCount,
        successRate: Math.round(successRate),
        success: successRate > 0
      }
    })
  }

  // 🔧 UTILITÁRIO: Testar consistência de dados entre versões
  static async validateDataConsistency(classId: string): Promise<{
    isConsistent: boolean
    differences: string[]
    summary: {
      legacy: { count: number, topScore: number }
      optimized: { count: number, topScore: number }
      preAggregated: { count: number, topScore: number }
    }
  }> {
    console.log(`🔍 [RankingMigration] Validando consistência de dados para turma ${classId}`)
    
    const differences: string[] = []
    let legacy, optimized, preAggregated

    try {
      // Buscar dados de todas as versões
      [legacy, optimized, preAggregated] = await Promise.all([
        enhancedClassService.getClassStudents(classId),
        OptimizedClassService.getOptimizedClassStudents(classId, {}, false),
        ClassRankingService.getPreAggregatedRanking(classId, false)
      ])

      // Comparar contagens
      const legacyCount = legacy?.length || 0
      const optimizedCount = optimized?.length || 0
      const preAggregatedCount = preAggregated?.length || 0

      if (legacyCount !== optimizedCount) {
        differences.push(`Contagem diferente: Legacy(${legacyCount}) vs Otimizado(${optimizedCount})`)
      }
      
      if (optimizedCount !== preAggregatedCount) {
        differences.push(`Contagem diferente: Otimizado(${optimizedCount}) vs Pré-Agregado(${preAggregatedCount})`)
      }

      // Comparar top scores
      const legacyTopScore = legacy?.[0]?.normalizedScore || legacy?.[0]?.totalScore || 0
      const optimizedTopScore = optimized?.[0]?.totalNormalizedScore || optimized?.[0]?.totalScore || 0
      const preAggregatedTopScore = preAggregated?.[0]?.totalNormalizedScore || 0

      if (Math.abs(legacyTopScore - optimizedTopScore) > 0.1) {
        differences.push(`Top score diferente: Legacy(${legacyTopScore}) vs Otimizado(${optimizedTopScore})`)
      }

      if (Math.abs(optimizedTopScore - preAggregatedTopScore) > 0.1) {
        differences.push(`Top score diferente: Otimizado(${optimizedTopScore}) vs Pré-Agregado(${preAggregatedTopScore})`)
      }

      // Comparar estudantes específicos (sample de 3)
      if (optimized && preAggregated && optimized.length > 0 && preAggregated.length > 0) {
        const sampleSize = Math.min(3, optimized.length, preAggregated.length)
        for (let i = 0; i < sampleSize; i++) {
          const optStudent = optimized[i]
          const preStudent = preAggregated.find(s => s.studentId === optStudent.studentId)
          
          if (preStudent) {
            const optScore = optStudent.totalNormalizedScore || 0
            const preScore = preStudent.totalNormalizedScore || 0
            
            if (Math.abs(optScore - preScore) > 0.1) {
              differences.push(`Estudante ${optStudent.studentId}: Otimizado(${optScore}) vs Pré-Agregado(${preScore})`)
            }
          } else {
            differences.push(`Estudante ${optStudent.studentId} não encontrado no pré-agregado`)
          }
        }
      }

      const summary = {
        legacy: { count: legacyCount, topScore: legacyTopScore },
        optimized: { count: optimizedCount, topScore: optimizedTopScore },
        preAggregated: { count: preAggregatedCount, topScore: preAggregatedTopScore }
      }

      const isConsistent = differences.length === 0

      if (isConsistent) {
        console.log(`✅ [RankingMigration] Dados consistentes entre todas as versões`)
      } else {
        console.warn(`⚠️ [RankingMigration] ${differences.length} inconsistências encontradas:`)
        differences.forEach(diff => console.warn(`  - ${diff}`))
      }

      console.table(summary)

      return { isConsistent, differences, summary }

    } catch (error) {
      console.error(`❌ [RankingMigration] Erro na validação:`, error)
      return {
        isConsistent: false,
        differences: [`Erro na validação: ${error.message}`],
        summary: {
          legacy: { count: 0, topScore: 0 },
          optimized: { count: 0, topScore: 0 },
          preAggregated: { count: 0, topScore: 0 }
        }
      }
    }
  }

  // 📋 RELATÓRIO: Gerar relatório completo de migração
  static async generateMigrationReport(): Promise<{
    timestamp: Date
    rankingStats: any
    cacheStats: any
    recommendations: string[]
  }> {
    console.log(`📋 [RankingMigration] Gerando relatório completo...`)

    try {
      const [rankingStats, performanceStats] = await Promise.all([
        ClassRankingService.getRankingStats(),
        OptimizedClassService.getPerformanceStats()
      ])

      const recommendations: string[] = []

      // Análise dos rankings
      if (rankingStats.totalRankings === 0) {
        recommendations.push('🚨 CRÍTICO: Nenhum ranking pré-agregado encontrado. Execute migração completa.')
      } else if (rankingStats.totalRankings < 5) {
        recommendations.push('⚠️ ATENÇÃO: Poucos rankings pré-agregados. Considere migração completa.')
      } else {
        recommendations.push('✅ BOAS: Rankings pré-agregados disponíveis.')
      }

      // Análise do cache
      if (performanceStats.cacheStats.hitRate > 80) {
        recommendations.push('✅ CACHE: Excelente hit rate de cache.')
      } else if (performanceStats.cacheStats.hitRate > 60) {
        recommendations.push('⚡ CACHE: Hit rate adequado, pode melhorar.')
      } else {
        recommendations.push('⚠️ CACHE: Hit rate baixo, revisar estratégia.')
      }

      // Análise de versões
      const currentVersionCount = rankingStats.versionDistribution['2.0'] || 0
      const totalRankings = rankingStats.totalRankings
      
      if (currentVersionCount < totalRankings * 0.8) {
        recommendations.push('🔄 VERSÃO: Alguns rankings em versão antiga, considere regeneração.')
      }

      // Análise temporal
      if (rankingStats.oldestUpdate) {
        const hoursOld = (Date.now() - rankingStats.oldestUpdate.getTime()) / (1000 * 60 * 60)
        if (hoursOld > 24) {
          recommendations.push('⏰ TEMPO: Alguns rankings com mais de 24h, considere regeneração.')
        }
      }

      const report = {
        timestamp: new Date(),
        rankingStats,
        cacheStats: performanceStats.cacheStats,
        recommendations
      }

      console.log(`📊 Relatório de Migração:`)
      console.table({
        'Total de Rankings': rankingStats.totalRankings,
        'Média de Estudantes': rankingStats.averageStudentsPerClass,
        'Cache Hit Rate': `${performanceStats.cacheStats.hitRate}%`,
        'Recomendações': recommendations.length
      })

      console.log(`💡 Recomendações:`)
      recommendations.forEach(rec => console.log(`  ${rec}`))

      return report

    } catch (error) {
      console.error(`❌ [RankingMigration] Erro ao gerar relatório:`, error)
      throw error
    }
  }

  // 🎮 DEMO: Demonstração interativa das capacidades
  static async runInteractiveDemo(classId: string): Promise<void> {
    console.log(`🎮 [RankingMigration] Demonstração interativa para turma ${classId}`)
    console.log(`-`.repeat(80))

    try {
      // 1. Benchmark
      console.log(`1️⃣ Executando benchmark de performance...`)
      const benchmark = await this.benchmarkAllVersions(classId, 2)
      console.log(`   🏆 Vencedor: ${benchmark.winner}`)
      console.log(`   📈 Ganho: ${benchmark.performanceGain}`)
      
      // 2. Validação
      console.log(`\n2️⃣ Validando consistência de dados...`)
      const validation = await this.validateDataConsistency(classId)
      console.log(`   ${validation.isConsistent ? '✅' : '❌'} Consistência: ${validation.isConsistent ? 'OK' : validation.differences.length + ' problemas'}`)
      
      // 3. Geração de ranking se necessário
      if (!validation.isConsistent || validation.summary.preAggregated.count === 0) {
        console.log(`\n3️⃣ Gerando ranking pré-agregado...`)
        const generated = await ClassRankingService.generateClassRanking(classId)
        console.log(`   ${generated ? '✅' : '❌'} Geração: ${generated ? 'Sucesso' : 'Falha'}`)
      }

      // 4. Debug de otimização
      console.log(`\n4️⃣ Debug de otimização...`)
      await ClassRankingService.debugRankingGeneration(classId)

      console.log(`\n🎉 Demonstração concluída!`)
      console.log(`💡 Para ativar Fase 2 em produção: localStorage.setItem('enable-preaggregated-ranking', 'true')`)

    } catch (error) {
      console.error(`❌ [RankingMigration] Erro na demonstração:`, error)
    }
  }
}

// 🚀 FUNÇÃO AUXILIAR: Para usar no console do navegador
declare global {
  interface Window {
    RankingMigrationScript: typeof RankingMigrationScript
  }
}

if (typeof window !== 'undefined') {
  window.RankingMigrationScript = RankingMigrationScript
}

export default RankingMigrationScript