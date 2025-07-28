// Serviço para interagir com Cloud Functions - bioestat-platform
// Interface client-side para as funções de ranking automáticas

import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/lib/firebase'

const functions = getFunctions(app)

// 📊 Interface para resultados das Cloud Functions
interface RankingStats {
  totalRankings: number
  averageStudentsPerClass: number
  totalStudents: number
  oldestUpdate: string | null
  newestUpdate: string | null
  versionDistribution: Record<string, number>
  generatedAt: string
}

interface UpdateRankingResult {
  success: boolean
  classId: string
  studentsCount: number
  averageScore: number
  completionRate: number
}

interface MaintenanceResult {
  totalClasses: number
  successful: number
  failed: number
  timestamp: string
}

export class CloudFunctionsService {
  
  // ✅ FUNÇÃO 1: Regenerar ranking de uma turma específica
  static async updateClassRanking(classId: string): Promise<UpdateRankingResult> {
    try {
      console.log(`🔄 [CloudFunctions] Solicitando regeneração para turma: ${classId}`)
      
      const updateRankingFunction = httpsCallable<
        { classId: string }, 
        UpdateRankingResult
      >(functions, 'updateClassRanking')
      
      const result = await updateRankingFunction({ classId })
      
      console.log(`✅ [CloudFunctions] Regeneração concluída:`, result.data)
      return result.data
      
    } catch (error: any) {
      console.error(`❌ [CloudFunctions] Erro na regeneração:`, error)
      throw new Error(`Erro ao regenerar ranking: ${error.message}`)
    }
  }
  
  // ✅ FUNÇÃO 2: Obter estatísticas dos rankings
  static async getRankingStats(): Promise<RankingStats> {
    try {
      console.log(`📊 [CloudFunctions] Buscando estatísticas dos rankings...`)
      
      const getStatsFunction = httpsCallable<{}, RankingStats>(functions, 'getRankingStats')
      const result = await getStatsFunction({})
      
      console.log(`📋 [CloudFunctions] Estatísticas obtidas:`, result.data)
      return result.data
      
    } catch (error: any) {
      console.error(`❌ [CloudFunctions] Erro ao obter estatísticas:`, error)
      throw new Error(`Erro ao obter estatísticas: ${error.message}`)
    }
  }
  
  // ✅ FUNÇÃO 3: Verificar se Cloud Functions estão disponíveis
  static async testConnection(): Promise<{
    available: boolean
    latency?: number
    error?: string
  }> {
    try {
      console.log(`🔗 [CloudFunctions] Testando conexão...`)
      
      const startTime = performance.now()
      await this.getRankingStats()
      const endTime = performance.now()
      
      const latency = Math.round(endTime - startTime)
      
      console.log(`✅ [CloudFunctions] Conexão OK (${latency}ms)`)
      return { available: true, latency }
      
    } catch (error: any) {
      console.warn(`⚠️ [CloudFunctions] Conexão falhou:`, error.message)
      return { 
        available: false, 
        error: error.message 
      }
    }
  }
  
  // ✅ FUNÇÃO 4: Forçar regeneração de todos os rankings (admin)
  static async forceFullRegeneration(): Promise<{
    initiated: boolean
    message: string
  }> {
    try {
      console.log(`🚨 [CloudFunctions] Solicitando regeneração completa (ADMIN)...`)
      
      // Esta função é chamada através da scheduled function
      // Não há HTTP trigger direto por segurança
      console.warn(`⚠️ [CloudFunctions] Regeneração completa é executada automaticamente às 2:00 AM`)
      console.warn(`💡 [CloudFunctions] Para regeneração manual, use updateClassRanking() para cada turma`)
      
      return {
        initiated: false,
        message: 'Use updateClassRanking() para regeneração manual por turma'
      }
      
    } catch (error: any) {
      console.error(`❌ [CloudFunctions] Erro na regeneração completa:`, error)
      throw new Error(`Erro na regeneração completa: ${error.message}`)
    }
  }
  
  // 🔧 UTILITÁRIO: Monitorar triggers automáticos
  static setupTriggerMonitoring(): () => void {
    console.log(`👁️ [CloudFunctions] Configurando monitoramento de triggers...`)
    
    // Listener para eventos de pontuação
    const handleScoreUpdate = (event: CustomEvent) => {
      const { userId, moduleId, score } = event.detail
      console.log(`🎯 [CloudFunctions] Trigger detectado: ${userId} completou ${moduleId} com ${score} pontos`)
      console.log(`⚡ [CloudFunctions] Cloud Function será executada automaticamente para atualizar rankings`)
    }
    
    // Adicionar listener global
    window.addEventListener('moduleCompleted', handleScoreUpdate as EventListener)
    
    // Retornar função de cleanup
    return () => {
      window.removeEventListener('moduleCompleted', handleScoreUpdate as EventListener)
      console.log(`🧹 [CloudFunctions] Monitoramento de triggers removido`)
    }
  }
  
  // 📊 UTILITÁRIO: Comparar performance client vs server
  static async benchmarkCloudFunctions(classId: string): Promise<{
    clientSide: { time: number, method: string }
    serverSide: { time: number, method: string }
    recommendation: string
  }> {
    try {
      console.log(`🏁 [CloudFunctions] Benchmark client vs server para turma ${classId}`)
      
      // Importar serviços client-side dinamicamente
      const [{ default: ClassRankingService }, { default: OptimizedClassService }] = await Promise.all([
        import('./classRankingService'),
        import('./optimizedClassService')
      ])
      
      // Teste client-side (Fase 2)
      const clientStart = performance.now()
      const clientData = await ClassRankingService.getPreAggregatedRanking(classId, false)
      const clientEnd = performance.now()
      const clientTime = clientEnd - clientStart
      
      // Teste server-side (Cloud Function)
      const serverStart = performance.now()
      const serverData = await this.updateClassRanking(classId)
      const serverEnd = performance.now()
      const serverTime = serverEnd - serverStart
      
      console.log(`📊 Client-side: ${clientTime.toFixed(2)}ms (${clientData.length} estudantes)`)
      console.log(`☁️ Server-side: ${serverTime.toFixed(2)}ms (${serverData.studentsCount} estudantes)`)
      
      let recommendation = ''
      if (clientTime < serverTime * 0.5) {
        recommendation = '🚀 Client-side é mais rápido para consultas'
      } else if (serverTime < clientTime * 0.5) {
        recommendation = '☁️ Server-side é mais eficiente'
      } else {
        recommendation = '⚖️ Performance similar, use server-side para consistência'
      }
      
      return {
        clientSide: { time: Math.round(clientTime), method: 'Fase 2 Pré-Agregado' },
        serverSide: { time: Math.round(serverTime), method: 'Cloud Function' },
        recommendation
      }
      
    } catch (error: any) {
      console.error(`❌ [CloudFunctions] Erro no benchmark:`, error)
      throw new Error(`Erro no benchmark: ${error.message}`)
    }
  }
  
  // 🎮 DEMO: Demonstração das Cloud Functions
  static async runCloudFunctionsDemo(classId: string): Promise<void> {
    console.log(`🎮 [CloudFunctions] Demonstração das Cloud Functions`)
    console.log(`-`.repeat(80))
    
    try {
      // 1. Testar conexão
      console.log(`1️⃣ Testando conexão...`)
      const connection = await this.testConnection()
      console.log(`   ${connection.available ? '✅' : '❌'} Conexão: ${connection.available ? `OK (${connection.latency}ms)` : connection.error}`)
      
      if (!connection.available) {
        console.log(`❌ Cloud Functions não disponíveis, demo encerrado`)
        return
      }
      
      // 2. Obter estatísticas
      console.log(`\n2️⃣ Obtendo estatísticas...`)
      const stats = await this.getRankingStats()
      console.log(`   📊 ${stats.totalRankings} rankings, ${stats.totalStudents} estudantes total`)
      console.log(`   📅 Última atualização: ${stats.newestUpdate}`)
      
      // 3. Regenerar ranking
      console.log(`\n3️⃣ Regenerando ranking da turma...`)
      const result = await this.updateClassRanking(classId)
      console.log(`   ✅ ${result.studentsCount} estudantes, média: ${result.averageScore}, conclusão: ${result.completionRate}%`)
      
      // 4. Benchmark
      console.log(`\n4️⃣ Benchmark client vs server...`)
      const benchmark = await this.benchmarkCloudFunctions(classId)
      console.log(`   🏆 ${benchmark.recommendation}`)
      console.log(`   📊 Client: ${benchmark.clientSide.time}ms | Server: ${benchmark.serverSide.time}ms`)
      
      console.log(`\n🎉 Demonstração das Cloud Functions concluída!`)
      
    } catch (error) {
      console.error(`❌ [CloudFunctions] Erro na demonstração:`, error)
    }
  }
}

// 🚀 FUNÇÃO AUXILIAR: Para usar no console do navegador
declare global {
  interface Window {
    CloudFunctionsService: typeof CloudFunctionsService
  }
}

if (typeof window !== 'undefined') {
  window.CloudFunctionsService = CloudFunctionsService
}

export default CloudFunctionsService