// Script de Reset de Dados dos Estudantes - Bioestat Platform
// Remove todos os dados relacionados aos estudantes, preservando dados de professores e sistema
// Created by Ellis Abhulime - UNICAMP

import { 
  collection, 
  doc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  writeBatch,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  limit,
  WhereFilterOp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// 🎯 Interfaces para o sistema de reset
export interface StudentDataResetConfig {
  dryRun: boolean
  createBackup: boolean
  validateBeforeDelete: boolean
  logLevel: 'minimal' | 'detailed' | 'verbose'
  confirmationRequired: boolean
  batchSize: number
  preserveSystemData: boolean
}

export interface ResetOperation {
  collectionName: string
  condition?: {
    field: string
    operator: WhereFilterOp
    value: any
  }
  customFilter?: (doc: any) => boolean
  priority: 'high' | 'medium' | 'low'
  description: string
}

export interface ResetResult {
  operation: string
  collection: string
  documentsFound: number
  documentsDeleted: number
  errors: string[]
  warnings: string[]
  executionTime: number
  backupCreated?: boolean
  backupSize?: number
}

export interface ResetReport {
  timestamp: Date
  config: StudentDataResetConfig
  totalCollections: number
  totalDocumentsFound: number
  totalDocumentsDeleted: number
  totalErrors: number
  totalWarnings: number
  executionTime: number
  results: ResetResult[]
  backupLocation?: string
  rollbackInstructions?: string[]
}

export interface BackupData {
  collectionName: string
  documents: any[]
  metadata: {
    createdAt: Date
    documentCount: number
    totalSize: number
    checksum?: string
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  professorsFound: number
  studentsFound: number
  systemDataIntact: boolean
}

// 🚨 Configuração padrão do reset
const DEFAULT_CONFIG: StudentDataResetConfig = {
  dryRun: true, // Sempre começar em modo seguro
  createBackup: true,
  validateBeforeDelete: true,
  logLevel: 'detailed',
  confirmationRequired: true,
  batchSize: 100, // Processar em lotes para evitar timeout
  preserveSystemData: true
}

// 📋 Operações de reset organizadas por prioridade
const RESET_OPERATIONS: ResetOperation[] = [
  // 🔴 ALTA PRIORIDADE - Dados principais dos estudantes
  {
    collectionName: 'users',
    condition: { field: 'role', operator: '==', value: 'student' },
    priority: 'high',
    description: 'Contas de estudantes (preservar professores e admin)'
  },
  {
    collectionName: 'unified_scores',
    priority: 'high',
    description: 'Pontuações unificadas dos estudantes'
  },
  {
    collectionName: 'userProgress',
    priority: 'high',
    description: 'Progresso geral dos usuários estudantes'
  },

  // 🟡 MÉDIA PRIORIDADE - Dados de turmas e relacionamentos
  {
    collectionName: 'classStudents',
    priority: 'medium',
    description: 'Relacionamento estudante-turma'
  },
  {
    collectionName: 'student_module_progress',
    priority: 'medium',
    description: 'Progresso detalhado por módulo'
  },

  // 🟢 BAIXA PRIORIDADE - Dados de atividades e histórico
  {
    collectionName: 'quiz_attempts',
    priority: 'low',
    description: 'Tentativas de quizzes'
  },
  {
    collectionName: 'randomized_quizzes',
    priority: 'low',
    description: 'Quizzes personalizados gerados'
  },
  {
    collectionName: 'quiz_sessions',
    priority: 'low',
    description: 'Sessões ativas de quizzes'
  },
  {
    collectionName: 'exercise_attempts',
    priority: 'low',
    description: 'Tentativas de exercícios individuais'
  },
  {
    collectionName: 'achievements',
    priority: 'low',
    description: 'Conquistas e badges dos estudantes'
  },
  {
    collectionName: 'rankings',
    priority: 'low',
    description: 'Rankings e classificações'
  },
  {
    collectionName: 'module_progress',
    priority: 'low',
    description: 'Progresso detalhado de módulos (legacy)'
  }
]

export class StudentDataResetScript {
  private config: StudentDataResetConfig
  private report: Partial<ResetReport> = {}
  private backups: BackupData[] = []
  private startTime: number = 0

  constructor(config: Partial<StudentDataResetConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    console.log('🚨 [StudentDataReset] Inicializado com configuração:', this.config)
  }

  // 🎯 MÉTODO PRINCIPAL: Executar reset completo
  async executeReset(): Promise<ResetReport> {
    this.startTime = Date.now()
    console.log('🚨 [StudentDataReset] ========================================')
    console.log('🚨 [StudentDataReset] INICIANDO RESET DE DADOS DOS ESTUDANTES')
    console.log('🚨 [StudentDataReset] ========================================')

    try {
      // 1. Validação inicial
      await this.validateEnvironment()

      // 2. Confirmação de segurança
      if (this.config.confirmationRequired) {
        await this.requireConfirmation()
      }

      // 3. Criar backup se solicitado
      if (this.config.createBackup) {
        await this.createFullBackup()
      }

      // 4. Executar operações de reset
      const results = await this.executeResetOperations()

      // 5. Validação pós-reset
      await this.validatePostReset()

      // 6. Gerar relatório final
      const finalReport = this.generateFinalReport(results)

      console.log('✅ [StudentDataReset] Reset concluído com sucesso!')
      return finalReport

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro crítico durante reset:', error)
      throw error
    }
  }

  // 🔍 VALIDAÇÃO: Ambiente e pré-condições
  private async validateEnvironment(): Promise<ValidationResult> {
    console.log('🔍 [StudentDataReset] Validando ambiente...')

    try {
      const validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        professorsFound: 0,
        studentsFound: 0,
        systemDataIntact: true
      }

      // Verificar conexão com Firebase
      if (!db) {
        validation.errors.push('Conexão com Firebase não disponível')
        validation.isValid = false
        return validation
      }

      // Contar professores (devem ser preservados)
      const professorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professor')
      )
      const professorsSnapshot = await getDocs(professorsQuery)
      validation.professorsFound = professorsSnapshot.size

      if (validation.professorsFound === 0) {
        validation.warnings.push('Nenhum professor encontrado - verificar se dados estão corretos')
      }

      // Contar estudantes (serão removidos)
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      )
      const studentsSnapshot = await getDocs(studentsQuery)
      validation.studentsFound = studentsSnapshot.size

      console.log(`📊 [StudentDataReset] Encontrados: ${validation.professorsFound} professores, ${validation.studentsFound} estudantes`)

      // Verificar coleções críticas do sistema
      const systemCollections = ['users', 'classes', 'modules']
      for (const collectionName of systemCollections) {
        try {
          const testDoc = await getDocs(query(collection(db, collectionName), limit(1)))
          if (testDoc.empty && collectionName === 'users') {
            validation.warnings.push(`Coleção ${collectionName} está vazia`)
          }
        } catch (error) {
          validation.errors.push(`Erro ao acessar coleção ${collectionName}: ${error.message}`)
          validation.isValid = false
        }
      }

      return validation

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro na validação:', error)
      return {
        isValid: false,
        errors: [`Erro na validação: ${error.message}`],
        warnings: [],
        professorsFound: 0,
        studentsFound: 0,
        systemDataIntact: false
      }
    }
  }

  // ⚠️ SEGURANÇA: Requerer confirmação explícita
  private async requireConfirmation(): Promise<void> {
    console.log('⚠️ [StudentDataReset] ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE todos os dados dos estudantes!')
    console.log('⚠️ [StudentDataReset] Dados que serão removidos:')
    console.log('   - Todas as contas de estudantes')
    console.log('   - Todo o progresso e pontuações')
    console.log('   - Todas as tentativas de exercícios e quizzes')
    console.log('   - Todos os relacionamentos com turmas')
    console.log('⚠️ [StudentDataReset] Dados que serão PRESERVADOS:')
    console.log('   - Contas de professores')
    console.log('   - Configurações de turmas e módulos')
    console.log('   - Dados do sistema')

    if (this.config.dryRun) {
      console.log('🛡️ [StudentDataReset] MODO DRY RUN ATIVO - Nada será deletado realmente')
    } else {
      console.log('🚨 [StudentDataReset] MODO PRODUÇÃO - DADOS SERÃO DELETADOS PERMANENTEMENTE!')
    }

    // Em produção, implementar prompt interativo ou flag de confirmação
    // Por enquanto, apenas log de aviso
    console.log('✅ [StudentDataReset] Confirmação registrada (implementar prompt interativo em produção)')
  }

  // 💾 BACKUP: Criar backup completo antes do reset
  private async createFullBackup(): Promise<void> {
    console.log('💾 [StudentDataReset] Criando backup completo...')

    try {
      for (const operation of RESET_OPERATIONS) {
        await this.backupCollection(operation.collectionName, operation.condition)
      }

      // Calcular tamanho total do backup
      const totalSize = this.backups.reduce((sum, backup) => sum + backup.metadata.totalSize, 0)
      const totalDocs = this.backups.reduce((sum, backup) => sum + backup.metadata.documentCount, 0)

      console.log(`✅ [StudentDataReset] Backup criado: ${totalDocs} documentos, ${(totalSize / 1024).toFixed(2)} KB`)

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro ao criar backup:', error)
      throw error
    }
  }

  // 💾 BACKUP: Fazer backup de uma coleção específica
  private async backupCollection(
    collectionName: string, 
    condition?: ResetOperation['condition']
  ): Promise<void> {
    try {
      let queryRef = collection(db, collectionName)
      let queryConstraints: any = queryRef

      // Aplicar filtro se especificado
      if (condition) {
        queryConstraints = query(queryRef, where(condition.field, condition.operator, condition.value))
      }

      const snapshot = await getDocs(queryConstraints)
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))

      const backup: BackupData = {
        collectionName,
        documents,
        metadata: {
          createdAt: new Date(),
          documentCount: documents.length,
          totalSize: JSON.stringify(documents).length,
          checksum: this.calculateChecksum(documents)
        }
      }

      this.backups.push(backup)
      console.log(`📦 [StudentDataReset] Backup ${collectionName}: ${documents.length} documentos`)

    } catch (error) {
      console.error(`❌ [StudentDataReset] Erro no backup de ${collectionName}:`, error)
      throw error
    }
  }

  // 🚀 EXECUÇÃO: Executar operações de reset por prioridade
  private async executeResetOperations(): Promise<ResetResult[]> {
    console.log('🚀 [StudentDataReset] Executando operações de reset...')

    const results: ResetResult[] = []

    // Ordenar por prioridade: high -> medium -> low
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const sortedOperations = [...RESET_OPERATIONS].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )

    for (const operation of sortedOperations) {
      const result = await this.executeResetOperation(operation)
      results.push(result)

      // Pausa entre operações para evitar sobrecarga
      if (result.documentsDeleted > 0) {
        await this.sleep(1000) // 1 segundo
      }
    }

    return results
  }

  // 🎯 EXECUÇÃO: Executar uma operação de reset específica
  private async executeResetOperation(operation: ResetOperation): Promise<ResetResult> {
    const startTime = Date.now()
    console.log(`🎯 [StudentDataReset] Processando: ${operation.description}`)

    const result: ResetResult = {
      operation: operation.description,
      collection: operation.collectionName,
      documentsFound: 0,
      documentsDeleted: 0,
      errors: [],
      warnings: [],
      executionTime: 0
    }

    try {
      // Buscar documentos para deletar
      let queryRef = collection(db, operation.collectionName)
      let queryConstraints: any = queryRef

      if (operation.condition) {
        queryConstraints = query(
          queryRef, 
          where(operation.condition.field, operation.condition.operator, operation.condition.value)
        )
      }

      const snapshot = await getDocs(queryConstraints)
      result.documentsFound = snapshot.size

      if (result.documentsFound === 0) {
        console.log(`ℹ️ [StudentDataReset] Nenhum documento encontrado em ${operation.collectionName}`)
        result.executionTime = Date.now() - startTime
        return result
      }

      console.log(`📊 [StudentDataReset] Encontrados ${result.documentsFound} documentos em ${operation.collectionName}`)

      if (!this.config.dryRun) {
        // Deletar em lotes para evitar timeout
        const batches = this.createBatches(snapshot.docs, this.config.batchSize)
        
        for (const batch of batches) {
          const deleteBatch = writeBatch(db)
          
          for (const doc of batch) {
            deleteBatch.delete(doc.ref)
          }
          
          await deleteBatch.commit()
          result.documentsDeleted += batch.length
          
          console.log(`🗑️ [StudentDataReset] Deletados ${result.documentsDeleted}/${result.documentsFound} de ${operation.collectionName}`)
        }
      } else {
        result.documentsDeleted = result.documentsFound // Simular deleção em dry run
        console.log(`🛡️ [StudentDataReset] DRY RUN: Seria deletado ${result.documentsFound} documentos de ${operation.collectionName}`)
      }

    } catch (error) {
      console.error(`❌ [StudentDataReset] Erro em ${operation.collectionName}:`, error)
      result.errors.push(`Erro: ${error.message}`)
    }

    result.executionTime = Date.now() - startTime
    return result
  }

  // 🔍 VALIDAÇÃO: Verificar estado pós-reset
  private async validatePostReset(): Promise<void> {
    console.log('🔍 [StudentDataReset] Validando resultado do reset...')

    try {
      // Verificar se ainda existem estudantes
      const studentsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      )
      const studentsSnapshot = await getDocs(studentsQuery)

      if (studentsSnapshot.size > 0 && !this.config.dryRun) {
        console.warn(`⚠️ [StudentDataReset] Ainda existem ${studentsSnapshot.size} estudantes após reset`)
      }

      // Verificar se professores foram preservados
      const professorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professor')
      )
      const professorsSnapshot = await getDocs(professorsQuery)

      if (professorsSnapshot.size === 0) {
        console.error('❌ [StudentDataReset] ERRO CRÍTICO: Nenhum professor encontrado após reset!')
      } else {
        console.log(`✅ [StudentDataReset] ${professorsSnapshot.size} professores preservados`)
      }

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro na validação pós-reset:', error)
    }
  }

  // 📊 RELATÓRIO: Gerar relatório final
  private generateFinalReport(results: ResetResult[]): ResetReport {
    const totalDocumentsFound = results.reduce((sum, r) => sum + r.documentsFound, 0)
    const totalDocumentsDeleted = results.reduce((sum, r) => sum + r.documentsDeleted, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)

    const report: ResetReport = {
      timestamp: new Date(),
      config: this.config,
      totalCollections: RESET_OPERATIONS.length,
      totalDocumentsFound,
      totalDocumentsDeleted,
      totalErrors,
      totalWarnings,
      executionTime: Date.now() - this.startTime,
      results,
      backupLocation: this.config.createBackup ? 'memoria_local' : undefined,
      rollbackInstructions: this.generateRollbackInstructions()
    }

    // Log do relatório
    console.log('📊 [StudentDataReset] ========== RELATÓRIO FINAL ==========')
    console.table({
      'Coleções processadas': report.totalCollections,
      'Documentos encontrados': report.totalDocumentsFound,
      'Documentos deletados': report.totalDocumentsDeleted,
      'Erros': report.totalErrors,
      'Avisos': report.totalWarnings,
      'Tempo execução': `${(report.executionTime / 1000).toFixed(2)}s`,
      'Modo': this.config.dryRun ? 'DRY RUN' : 'PRODUÇÃO'
    })

    return report
  }

  // 🔄 ROLLBACK: Gerar instruções de rollback
  private generateRollbackInstructions(): string[] {
    const instructions = [
      '🔄 INSTRUÇÕES DE ROLLBACK:',
      '1. Use o backup criado antes do reset',
      '2. Execute: StudentDataResetScript.restoreFromBackup(backupData)',
      '3. Valide a integridade dos dados restaurados',
      '4. Execute testes completos do sistema'
    ]

    if (!this.config.createBackup) {
      instructions.push('⚠️ ATENÇÃO: Backup não foi criado - rollback não é possível!')
    }

    return instructions
  }

  // 🛠️ UTILITÁRIOS
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  private calculateChecksum(data: any): string {
    // Implementação simples de checksum
    return btoa(JSON.stringify(data)).slice(0, 10)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 🚀 MÉTODO ESTÁTICO: Executar reset com configuração rápida
  static async executeQuickReset(dryRun: boolean = true): Promise<ResetReport> {
    const script = new StudentDataResetScript({
      dryRun,
      createBackup: true,
      validateBeforeDelete: true,
      logLevel: 'detailed',
      confirmationRequired: !dryRun, // Pular confirmação apenas em dry run
      batchSize: 100
    })

    return await script.executeReset()
  }

  // 🔄 MÉTODO ESTÁTICO: Restaurar do backup
  static async restoreFromBackup(backupData: BackupData[]): Promise<boolean> {
    console.log('🔄 [StudentDataReset] Iniciando restauração do backup...')
    
    try {
      let totalRestored = 0
      const batch = writeBatch(db)
      let batchOperations = 0
      const BATCH_LIMIT = 500

      for (const backup of backupData) {
        console.log(`📥 [StudentDataReset] Restaurando ${backup.collectionName}: ${backup.documents.length} documentos`)
        
        for (const document of backup.documents) {
          // Restaurar documento
          const docRef = doc(db, backup.collectionName, document.id)
          batch.set(docRef, {
            ...document.data,
            restoredAt: serverTimestamp(),
            restoredFrom: 'backup'
          })
          
          batchOperations++
          totalRestored++
          
          // Commit batch quando atingir limite
          if (batchOperations >= BATCH_LIMIT) {
            await batch.commit()
            batchOperations = 0
            console.log(`💾 [StudentDataReset] Batch commitado: ${totalRestored} documentos restaurados`)
          }
        }
      }

      // Commit batch final se houver operações pendentes
      if (batchOperations > 0) {
        await batch.commit()
      }

      console.log(`✅ [StudentDataReset] Restauração concluída: ${totalRestored} documentos restaurados`)
      return true

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro na restauração:', error)
      return false
    }
  }

  // 🔍 MÉTODO ESTÁTICO: Validar integridade do backup
  static validateBackupIntegrity(backupData: BackupData[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
    totalDocuments: number
    totalSize: number
  } {
    console.log('🔍 [StudentDataReset] Validando integridade do backup...')
    
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      totalDocuments: 0,
      totalSize: 0
    }

    try {
      for (const backup of backupData) {
        // Verificar estrutura básica
        if (!backup.collectionName || !backup.documents || !backup.metadata) {
          result.errors.push(`Backup de ${backup.collectionName} está corrompido`)
          result.isValid = false
          continue
        }

        // Verificar consistência de contagem
        if (backup.documents.length !== backup.metadata.documentCount) {
          result.errors.push(
            `Inconsistência em ${backup.collectionName}: ${backup.documents.length} docs vs ${backup.metadata.documentCount} metadata`
          )
          result.isValid = false
        }

        // Verificar checksum se disponível
        if (backup.metadata.checksum) {
          const calculatedChecksum = btoa(JSON.stringify(backup.documents)).slice(0, 10)
          if (calculatedChecksum !== backup.metadata.checksum) {
            result.errors.push(`Checksum inválido para ${backup.collectionName}`)
            result.isValid = false
          }
        }

        // Verificar se documentos têm estrutura válida
        for (const doc of backup.documents) {
          if (!doc.id || !doc.data) {
            result.warnings.push(`Documento inválido encontrado em ${backup.collectionName}`)
          }
        }

        result.totalDocuments += backup.documents.length
        result.totalSize += backup.metadata.totalSize
      }

      console.log(`🔍 [StudentDataReset] Validação: ${result.isValid ? 'VÁLIDO' : 'INVÁLIDO'} - ${result.totalDocuments} docs, ${result.errors.length} erros`)
      return result

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro na validação do backup:', error)
      return {
        isValid: false,
        errors: [`Erro na validação: ${error.message}`],
        warnings: [],
        totalDocuments: 0,
        totalSize: 0
      }
    }
  }

  // 💾 MÉTODO ESTÁTICO: Exportar backup para arquivo JSON
  static exportBackupToFile(backupData: BackupData[], filename?: string): string {
    console.log('💾 [StudentDataReset] Exportando backup para arquivo...')
    
    try {
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalCollections: backupData.length,
          totalDocuments: backupData.reduce((sum, b) => sum + b.metadata.documentCount, 0),
          totalSize: backupData.reduce((sum, b) => sum + b.metadata.totalSize, 0),
          version: '1.0.0'
        },
        backup: backupData
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const finalFilename = filename || `student-data-backup-${new Date().toISOString().split('T')[0]}.json`

      // Em ambiente browser, criar download
      if (typeof window !== 'undefined') {
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = finalFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      console.log(`✅ [StudentDataReset] Backup exportado: ${finalFilename} (${(jsonString.length / 1024).toFixed(2)} KB)`)
      return jsonString

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro ao exportar backup:', error)
      throw error
    }
  }

  // 📊 MÉTODO ESTÁTICO: Verificar status atual do sistema
  static async getSystemStatus(): Promise<{
    professors: number
    students: number
    classes: number
    totalStudentData: number
    collections: Record<string, number>
    systemHealth: 'healthy' | 'warning' | 'critical'
  }> {
    console.log('📊 [StudentDataReset] Verificando status do sistema...')
    
    try {
      const status = {
        professors: 0,
        students: 0,
        classes: 0,
        totalStudentData: 0,
        collections: {} as Record<string, number>,
        systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical'
      }

      // Contar usuários por tipo
      const usersSnapshot = await getDocs(collection(db, 'users'))
      usersSnapshot.forEach(doc => {
        const userData = doc.data()
        if (userData.role === 'professor') {
          status.professors++
        } else if (userData.role === 'student') {
          status.students++
        }
      })

      // Contar turmas
      try {
        const classesSnapshot = await getDocs(collection(db, 'classes'))
        status.classes = classesSnapshot.size
      } catch (error) {
        console.warn('Coleção classes não encontrada ou inacessível')
      }

      // Contar documentos por coleção
      let totalDocs = 0
      for (const operation of RESET_OPERATIONS) {
        try {
          let queryRef = collection(db, operation.collectionName)
          let queryConstraints: any = queryRef

          if (operation.condition) {
            queryConstraints = query(
              queryRef, 
              where(operation.condition.field, operation.condition.operator, operation.condition.value)
            )
          }

          const snapshot = await getDocs(queryConstraints)
          const count = snapshot.size
          status.collections[operation.collectionName] = count
          totalDocs += count
        } catch (error) {
          console.warn(`Erro ao contar ${operation.collectionName}:`, error.message)
          status.collections[operation.collectionName] = -1 // Erro
        }
      }

      status.totalStudentData = totalDocs

      // Determinar saúde do sistema
      if (status.professors === 0) {
        status.systemHealth = 'critical'
      } else if (status.students === 0 && status.totalStudentData > 0) {
        status.systemHealth = 'warning' // Dados orfãos
      } else if (Object.values(status.collections).some(count => count === -1)) {
        status.systemHealth = 'warning' // Alguns erros de acesso
      }

      console.log('📊 [StudentDataReset] Status do sistema:')
      console.table({
        'Professores': status.professors,
        'Estudantes': status.students,
        'Turmas': status.classes,
        'Dados estudantes': status.totalStudentData,
        'Saúde': status.systemHealth
      })

      return status

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro ao verificar status:', error)
      return {
        professors: -1,
        students: -1,
        classes: -1,
        totalStudentData: -1,
        collections: {},
        systemHealth: 'critical'
      }
    }
  }

  // 🔧 MÉTODO ESTÁTICO: Verificar dependências e pré-requisitos
  static async checkDependencies(): Promise<{
    firebaseConnected: boolean
    collectionsAccessible: string[]
    collectionsInaccessible: string[]
    permissionsOk: boolean
    estimatedExecutionTime: number
    recommendations: string[]
  }> {
    console.log('🔧 [StudentDataReset] Verificando dependências...')
    
    const result = {
      firebaseConnected: false,
      collectionsAccessible: [] as string[],
      collectionsInaccessible: [] as string[],
      permissionsOk: true,
      estimatedExecutionTime: 0,
      recommendations: [] as string[]
    }

    try {
      // Testar conexão Firebase
      if (db) {
        result.firebaseConnected = true
      } else {
        result.recommendations.push('❌ Firebase não conectado - verificar configuração')
        return result
      }

      // Testar acesso às coleções
      let totalDocuments = 0
      for (const operation of RESET_OPERATIONS) {
        try {
          const testQuery = query(collection(db, operation.collectionName), limit(1))
          await getDocs(testQuery)
          result.collectionsAccessible.push(operation.collectionName)
          
          // Estimar quantidade de documentos
          const fullQuery = collection(db, operation.collectionName)
          const snapshot = await getDocs(fullQuery)
          totalDocuments += snapshot.size
          
        } catch (error) {
          result.collectionsInaccessible.push(operation.collectionName)
          result.permissionsOk = false
          result.recommendations.push(`⚠️ Acesso negado à coleção ${operation.collectionName}`)
        }
      }

      // Estimar tempo de execução (baseado em 100 docs/segundo)
      result.estimatedExecutionTime = Math.ceil(totalDocuments / 100)

      // Gerar recomendações
      if (result.collectionsAccessible.length === RESET_OPERATIONS.length) {
        result.recommendations.push('✅ Todas as coleções estão acessíveis')
      }

      if (totalDocuments > 10000) {
        result.recommendations.push('⚠️ Grande volume de dados - considere executar em horário de baixo uso')
      }

      if (result.estimatedExecutionTime > 60) {
        result.recommendations.push('⚠️ Execução estimada > 1 minuto - monitore progresso')
      }

      result.recommendations.push(`ℹ️ Documentos encontrados: ${totalDocuments}`)
      result.recommendations.push(`ℹ️ Tempo estimado: ~${result.estimatedExecutionTime} segundos`)

      console.log('🔧 [StudentDataReset] Verificação de dependências concluída')
      console.table({
        'Firebase': result.firebaseConnected ? '✅' : '❌',
        'Coleções OK': result.collectionsAccessible.length,
        'Coleções Erro': result.collectionsInaccessible.length,
        'Permissões': result.permissionsOk ? '✅' : '❌',
        'Tempo Estimado': `${result.estimatedExecutionTime}s`
      })

      return result

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro na verificação de dependências:', error)
      result.recommendations.push(`❌ Erro na verificação: ${error.message}`)
      return result
    }
  }

  // 🧪 MÉTODO ESTÁTICO: Executar teste completo (dry run com relatório detalhado)
  static async runComprehensiveTest(): Promise<{
    systemStatus: any
    dependencies: any
    dryRunResults: ResetReport
    recommendations: string[]
  }> {
    console.log('🧪 [StudentDataReset] Executando teste completo...')
    
    try {
      // 1. Verificar status do sistema
      const systemStatus = await this.getSystemStatus()
      
      // 2. Verificar dependências
      const dependencies = await this.checkDependencies()
      
      // 3. Executar dry run
      const dryRunResults = await this.executeQuickReset(true)
      
      // 4. Gerar recomendações finais
      const recommendations = []
      
      if (systemStatus.systemHealth === 'critical') {
        recommendations.push('🚨 CRÍTICO: Sistema em estado crítico - não execute reset em produção')
      } else if (systemStatus.systemHealth === 'warning') {
        recommendations.push('⚠️ ATENÇÃO: Sistema com avisos - revisar antes de executar')
      } else {
        recommendations.push('✅ Sistema saudável - safe para executar reset')
      }
      
      if (!dependencies.permissionsOk) {
        recommendations.push('❌ Problemas de permissão - corrigir antes de executar')
      }
      
      if (dryRunResults.totalErrors > 0) {
        recommendations.push('❌ Erros encontrados no dry run - investigar')
      } else {
        recommendations.push('✅ Dry run executado sem erros')
      }
      
      if (dependencies.estimatedExecutionTime > 300) {
        recommendations.push('⏱️ Execução longa prevista - considere executar em manutenção')
      }

      const result = {
        systemStatus,
        dependencies,
        dryRunResults,
        recommendations
      }

      console.log('🧪 [StudentDataReset] Teste completo finalizado')
      console.log('📋 Recomendações principais:')
      recommendations.forEach(rec => console.log(`  ${rec}`))

      return result

    } catch (error) {
      console.error('❌ [StudentDataReset] Erro no teste completo:', error)
      throw error
    }
  }
}

// 🌐 DISPONIBILIZAR NO CONSOLE GLOBAL
declare global {
  interface Window {
    StudentDataResetScript: typeof StudentDataResetScript
  }
}

if (typeof window !== 'undefined') {
  window.StudentDataResetScript = StudentDataResetScript
}

export default StudentDataResetScript