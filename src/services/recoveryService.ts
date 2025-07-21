// Sistema de Recovery Robusto - AvaliaNutri
// Recuperação automática de dados, estado e sessões após falhas

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { connectionMonitor } from './connectionMonitorService';
import unifiedScoringService from './unifiedScoringService';

export interface RecoverySnapshot {
  id: string;
  userId: string;
  timestamp: Date;
  dataType: 'user_progress' | 'game_scores' | 'module_progress' | 'session_state' | 'full_backup';
  data: any;
  version: string;
  checksum?: string;
  recoveredFrom?: string;
}

export interface RecoveryOperation {
  id: string;
  userId: string;
  operation: 'restore_progress' | 'restore_session' | 'fix_corruption' | 'merge_data' | 'rollback';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  result?: string;
  error?: string;
  dataBackup?: any;
}

export interface RecoveryMetrics {
  totalRecoveries: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  lastRecovery?: Date;
  dataIntegrityChecks: number;
  corruptionDetections: number;
  averageRecoveryTime: number;
}

export class RecoveryService {
  private static instance: RecoveryService;
  private metrics: RecoveryMetrics = {
    totalRecoveries: 0,
    successfulRecoveries: 0,
    failedRecoveries: 0,
    dataIntegrityChecks: 0,
    corruptionDetections: 0,
    averageRecoveryTime: 0
  };

  private recoveryOperations: Map<string, RecoveryOperation> = new Map();
  private autoBackupInterval?: NodeJS.Timeout;
  private integrityCheckInterval?: NodeJS.Timeout;

  static getInstance(): RecoveryService {
    if (!RecoveryService.instance) {
      RecoveryService.instance = new RecoveryService();
    }
    return RecoveryService.instance;
  }

  private constructor() {
    this.initializeRecoverySystem();
  }

  /**
   * Inicializar sistema de recovery
   */
  private initializeRecoverySystem(): void {
    console.log('🔄 [RecoveryService] Inicializando sistema de recovery...');

    // Auto backup a cada 30 minutos
    this.startAutoBackup();

    // Verificação de integridade a cada 10 minutos
    this.startIntegrityChecks();

    // Monitor de falhas de conexão para recovery automático
    connectionMonitor.onStatusChange((status) => {
      if (status.firestore === 'connected' && status.errorCount > 0) {
        this.checkAndRepairData();
      }
    });

    console.log('✅ [RecoveryService] Sistema de recovery inicializado');
  }

  /**
   * Iniciar backup automático
   */
  private startAutoBackup(): void {
    this.autoBackupInterval = setInterval(async () => {
      await this.performAutoBackup();
    }, 30 * 60 * 1000); // 30 minutos

    console.log('📦 [RecoveryService] Auto backup configurado (30min)');
  }

  /**
   * Iniciar verificações de integridade
   */
  private startIntegrityChecks(): void {
    this.integrityCheckInterval = setInterval(async () => {
      await this.performIntegrityCheck();
    }, 10 * 60 * 1000); // 10 minutos

    console.log('🔍 [RecoveryService] Verificações de integridade configuradas (10min)');
  }

  /**
   * Criar snapshot de dados do usuário
   */
  async createSnapshot(userId: string, dataType: RecoverySnapshot['dataType']): Promise<string> {
    try {
      console.log(`📸 [RecoveryService] Criando snapshot para ${userId} - tipo: ${dataType}`);

      let data: any = {};

      switch (dataType) {
        case 'user_progress':
          data = await this.collectUserProgress(userId);
          break;
        case 'game_scores':
          data = await this.collectGameScores(userId);
          break;
        case 'module_progress':
          data = await this.collectModuleProgress(userId);
          break;
        case 'session_state':
          data = await this.collectSessionState(userId);
          break;
        case 'full_backup':
          data = await this.collectFullUserData(userId);
          break;
      }

      const snapshot: RecoverySnapshot = {
        id: `snapshot_${userId}_${Date.now()}`,
        userId,
        timestamp: new Date(),
        dataType,
        data,
        version: '1.0',
        checksum: this.calculateChecksum(data)
      };

      // Salvar snapshot no Firestore
      await setDoc(doc(db, 'recovery_snapshots', snapshot.id), {
        ...snapshot,
        timestamp: serverTimestamp()
      });

      console.log(`✅ [RecoveryService] Snapshot criado: ${snapshot.id}`);
      return snapshot.id;

    } catch (error) {
      console.error('❌ [RecoveryService] Erro ao criar snapshot:', error);
      throw error;
    }
  }

  /**
   * Restaurar dados de um snapshot
   */
  async restoreFromSnapshot(snapshotId: string, userId: string): Promise<RecoveryOperation> {
    const operationId = `restore_${userId}_${Date.now()}`;

    const operation: RecoveryOperation = {
      id: operationId,
      userId,
      operation: 'restore_progress',
      status: 'pending',
      startedAt: new Date()
    };

    this.recoveryOperations.set(operationId, operation);
    this.metrics.totalRecoveries++;

    try {
      console.log(`🔄 [RecoveryService] Iniciando restore do snapshot: ${snapshotId}`);

      operation.status = 'running';

      // Buscar snapshot
      const snapshotDoc = await getDoc(doc(db, 'recovery_snapshots', snapshotId));
      if (!snapshotDoc.exists()) {
        throw new Error(`Snapshot não encontrado: ${snapshotId}`);
      }

      const snapshot = snapshotDoc.data() as RecoverySnapshot;

      // Backup dos dados atuais antes do restore
      const currentDataBackup = await this.collectFullUserData(userId);
      operation.dataBackup = currentDataBackup;

      // Verificar integridade do snapshot
      if (snapshot.checksum) {
        const calculatedChecksum = this.calculateChecksum(snapshot.data);
        if (calculatedChecksum !== snapshot.checksum) {
          throw new Error('Snapshot corrompido - checksum inválido');
        }
      }

      // Executar restore usando batch operation
      const batch = writeBatch(db);

      switch (snapshot.dataType) {
        case 'user_progress':
          await this.restoreUserProgress(batch, userId, snapshot.data);
          break;
        case 'game_scores':
          await this.restoreGameScores(batch, userId, snapshot.data);
          break;
        case 'module_progress':
          await this.restoreModuleProgress(batch, userId, snapshot.data);
          break;
        case 'session_state':
          await this.restoreSessionState(batch, userId, snapshot.data);
          break;
        case 'full_backup':
          await this.restoreFullUserData(batch, userId, snapshot.data);
          break;
      }

      await batch.commit();

      operation.status = 'completed';
      operation.completedAt = new Date();
      operation.result = `Dados restaurados com sucesso do snapshot ${snapshotId}`;

      this.metrics.successfulRecoveries++;

      console.log(`✅ [RecoveryService] Restore concluído: ${operationId}`);

    } catch (error) {
      console.error(`❌ [RecoveryService] Erro no restore ${operationId}:`, error);

      operation.status = 'failed';
      operation.completedAt = new Date();
      operation.error = error instanceof Error ? error.message : 'Erro desconhecido';

      this.metrics.failedRecoveries++;
    }

    // Salvar operação no histórico
    await this.saveRecoveryOperation(operation);

    return operation;
  }

  /**
   * Detectar e corrigir corrupção de dados
   */
  async checkAndRepairData(userId?: string): Promise<boolean> {
    try {
      console.log(`🔍 [RecoveryService] Verificando integridade dos dados${userId ? ` para ${userId}` : ''}`);

      if (userId) {
        return await this.repairUserData(userId);
      } else {
        // Verificar dados de todos os usuários ativos
        const usersSnapshot = await getDocs(
          query(collection(db, 'users'), limit(50))
        );

        let repairedCount = 0;
        for (const userDoc of usersSnapshot.docs) {
          const repaired = await this.repairUserData(userDoc.id);
          if (repaired) repairedCount++;
        }

        console.log(`🔧 [RecoveryService] Reparados dados de ${repairedCount} usuários`);
        return repairedCount > 0;
      }

    } catch (error) {
      console.error('❌ [RecoveryService] Erro na verificação de integridade:', error);
      return false;
    }
  }

  /**
   * Reparar dados de um usuário específico
   */
  private async repairUserData(userId: string): Promise<boolean> {
    let repaired = false;

    try {
      // 1. Verificar consistency entre unified_scores e userProgress
      const unifiedScore = await unifiedScoringService.getUnifiedScore(userId);
      const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));

      if (unifiedScore && userProgressDoc.exists()) {
        const userProgress = userProgressDoc.data();

        // Comparar e sincronizar dados inconsistentes
        const modules = userProgress.modules || {};
        let needsRepair = false;

        for (const [moduleId, moduleData] of Object.entries(modules)) {
          const moduleScore = unifiedScore.moduleScores[moduleId] || 0;
          const progressScore = (moduleData as any).totalScore || 0;

          // Se há discrepância significativa (>10%), usar o maior score
          if (Math.abs(moduleScore - progressScore) > 10) {
            const correctedScore = Math.max(moduleScore, progressScore);
            
            // Atualizar no sistema unificado
            await unifiedScoringService.updateModuleScore(userId, moduleId, correctedScore);
            
            // Atualizar no userProgress
            await setDoc(doc(db, 'userProgress', userId), {
              modules: {
                ...modules,
                [moduleId]: {
                  ...(moduleData as any),
                  totalScore: correctedScore,
                  score: correctedScore,
                  completed: correctedScore >= 70,
                  lastRepaired: new Date()
                }
              }
            }, { merge: true });

            needsRepair = true;
            this.metrics.corruptionDetections++;

            console.log(`🔧 [RecoveryService] Reparado módulo ${moduleId} para usuário ${userId}: ${progressScore} -> ${correctedScore}`);
          }
        }

        repaired = needsRepair;
      }

      // 2. Verificar e reparar estruturas de dados faltantes
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Garantir que campos essenciais existem
        const requiredFields = {
          totalScore: 0,
          levelReached: 1,
          gamesCompleted: 0,
          achievements: [],
          collaborationHistory: [],
          preferredPartners: []
        };

        let needsFieldRepair = false;
        const updates: any = {};

        for (const [field, defaultValue] of Object.entries(requiredFields)) {
          if (userData[field] === undefined || userData[field] === null) {
            updates[field] = defaultValue;
            needsFieldRepair = true;
          }
        }

        if (needsFieldRepair) {
          await setDoc(doc(db, 'users', userId), updates, { merge: true });
          repaired = true;
          console.log(`🔧 [RecoveryService] Reparados campos faltantes para usuário ${userId}:`, Object.keys(updates));
        }
      }

    } catch (error) {
      console.error(`❌ [RecoveryService] Erro ao reparar dados do usuário ${userId}:`, error);
    }

    return repaired;
  }

  /**
   * Coletar dados completos do usuário
   */
  private async collectFullUserData(userId: string): Promise<any> {
    const data: any = {};

    try {
      // User profile
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        data.user = userDoc.data();
      }

      // User progress
      const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));
      if (userProgressDoc.exists()) {
        data.userProgress = userProgressDoc.data();
      }

      // Unified scores
      data.unifiedScores = await unifiedScoringService.getUnifiedScore(userId);

      // Module progress
      const moduleProgressSnapshot = await getDocs(
        query(
          collection(db, 'student_module_progress'),
          where('studentId', '==', userId)
        )
      );
      data.moduleProgress = moduleProgressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Game progress
      const gameProgressSnapshot = await getDocs(
        query(
          collection(db, 'gameProgress'),
          where('userId', '==', userId)
        )
      );
      data.gameProgress = gameProgressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('❌ [RecoveryService] Erro ao coletar dados:', error);
    }

    return data;
  }

  /**
   * Coletar dados de progresso do usuário
   */
  private async collectUserProgress(userId: string): Promise<any> {
    const userProgressDoc = await getDoc(doc(db, 'userProgress', userId));
    return userProgressDoc.exists() ? userProgressDoc.data() : {};
  }

  /**
   * Coletar pontuações dos jogos
   */
  private async collectGameScores(userId: string): Promise<any> {
    return await unifiedScoringService.getUnifiedScore(userId);
  }

  /**
   * Coletar progresso dos módulos
   */
  private async collectModuleProgress(userId: string): Promise<any> {
    const snapshot = await getDocs(
      query(
        collection(db, 'student_module_progress'),
        where('studentId', '==', userId)
      )
    );
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Coletar estado da sessão
   */
  private async collectSessionState(userId: string): Promise<any> {
    // Coletar dados de sessão do localStorage se disponível
    if (typeof window !== 'undefined') {
      return {
        localStorage: {
          'last-login': localStorage.getItem('last-login'),
          'selected-role': localStorage.getItem('selected-role'),
          'ranking-collapsed': localStorage.getItem('ranking-collapsed')
        },
        timestamp: new Date().toISOString()
      };
    }
    return {};
  }

  /**
   * Restaurar progresso do usuário
   */
  private async restoreUserProgress(batch: any, userId: string, data: any): Promise<void> {
    if (data && Object.keys(data).length > 0) {
      const userProgressRef = doc(db, 'userProgress', userId);
      batch.set(userProgressRef, {
        ...data,
        restoredAt: serverTimestamp()
      }, { merge: true });
    }
  }

  /**
   * Restaurar pontuações dos jogos  
   */
  private async restoreGameScores(batch: any, userId: string, data: any): Promise<void> {
    if (data) {
      const unifiedScoresRef = doc(db, 'unified_scores', userId);
      batch.set(unifiedScoresRef, {
        ...data,
        restoredAt: serverTimestamp()
      }, { merge: true });
    }
  }

  /**
   * Restaurar progresso dos módulos
   */
  private async restoreModuleProgress(batch: any, userId: string, data: any[]): Promise<void> {
    if (Array.isArray(data)) {
      for (const moduleData of data) {
        const moduleRef = doc(db, 'student_module_progress', moduleData.id || `${userId}_${moduleData.moduleId}`);
        batch.set(moduleRef, {
          ...moduleData,
          restoredAt: serverTimestamp()
        }, { merge: true });
      }
    }
  }

  /**
   * Restaurar estado da sessão
   */
  private async restoreSessionState(batch: any, userId: string, data: any): Promise<void> {
    // Restaurar localStorage se disponível
    if (typeof window !== 'undefined' && data.localStorage) {
      for (const [key, value] of Object.entries(data.localStorage)) {
        if (value) {
          localStorage.setItem(key, value as string);
        }
      }
    }
  }

  /**
   * Restaurar todos os dados do usuário
   */
  private async restoreFullUserData(batch: any, userId: string, data: any): Promise<void> {
    if (data.user) {
      const userRef = doc(db, 'users', userId);
      batch.set(userRef, {
        ...data.user,
        restoredAt: serverTimestamp()
      }, { merge: true });
    }

    if (data.userProgress) {
      await this.restoreUserProgress(batch, userId, data.userProgress);
    }

    if (data.unifiedScores) {
      await this.restoreGameScores(batch, userId, data.unifiedScores);
    }

    if (data.moduleProgress) {
      await this.restoreModuleProgress(batch, userId, data.moduleProgress);
    }
  }

  /**
   * Executar backup automático
   */
  private async performAutoBackup(): Promise<void> {
    try {
      console.log('📦 [RecoveryService] Executando backup automático...');

      // Backup dos usuários mais ativos (últimas 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const activeUsersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('updatedAt', '>=', Timestamp.fromDate(yesterday)),
          limit(20)
        )
      );

      let backupCount = 0;
      for (const userDoc of activeUsersSnapshot.docs) {
        try {
          await this.createSnapshot(userDoc.id, 'full_backup');
          backupCount++;
        } catch (error) {
          console.error(`❌ [RecoveryService] Erro no backup do usuário ${userDoc.id}:`, error);
        }
      }

      console.log(`✅ [RecoveryService] Backup automático concluído: ${backupCount} usuários`);

    } catch (error) {
      console.error('❌ [RecoveryService] Erro no backup automático:', error);
    }
  }

  /**
   * Executar verificação de integridade
   */
  private async performIntegrityCheck(): Promise<void> {
    try {
      console.log('🔍 [RecoveryService] Executando verificação de integridade...');

      this.metrics.dataIntegrityChecks++;

      // Verificar alguns usuários aleatórios
      const usersSnapshot = await getDocs(
        query(collection(db, 'users'), limit(10))
      );

      let checkedCount = 0;
      let repairedCount = 0;

      for (const userDoc of usersSnapshot.docs) {
        try {
          const repaired = await this.repairUserData(userDoc.id);
          if (repaired) repairedCount++;
          checkedCount++;
        } catch (error) {
          console.error(`❌ [RecoveryService] Erro na verificação do usuário ${userDoc.id}:`, error);
        }
      }

      console.log(`🔍 [RecoveryService] Verificação concluída: ${checkedCount} verificados, ${repairedCount} reparados`);

    } catch (error) {
      console.error('❌ [RecoveryService] Erro na verificação de integridade:', error);
    }
  }

  /**
   * Calcular checksum simples para validação de dados
   */
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Salvar operação de recovery no histórico
   */
  private async saveRecoveryOperation(operation: RecoveryOperation): Promise<void> {
    try {
      await setDoc(doc(db, 'recovery_operations', operation.id), {
        ...operation,
        startedAt: Timestamp.fromDate(operation.startedAt),
        completedAt: operation.completedAt ? Timestamp.fromDate(operation.completedAt) : null
      });
    } catch (error) {
      console.error('❌ [RecoveryService] Erro ao salvar operação de recovery:', error);
    }
  }

  /**
   * Obter métricas de recovery
   */
  getMetrics(): RecoveryMetrics {
    if (this.metrics.totalRecoveries > 0) {
      // Calcular tempo médio de recovery baseado nas operações concluídas
      const operations = Array.from(this.recoveryOperations.values())
        .filter(op => op.completedAt && op.startedAt);

      if (operations.length > 0) {
        const totalTime = operations.reduce((sum, op) => {
          return sum + (op.completedAt!.getTime() - op.startedAt.getTime());
        }, 0);
        this.metrics.averageRecoveryTime = totalTime / operations.length;
      }
    }

    return { ...this.metrics };
  }

  /**
   * Obter lista de snapshots do usuário
   */
  async getUserSnapshots(userId: string, limit: number = 10): Promise<RecoverySnapshot[]> {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, 'recovery_snapshots'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(limit)
        )
      );

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp.toDate()
        } as RecoverySnapshot;
      });

    } catch (error) {
      console.error('❌ [RecoveryService] Erro ao buscar snapshots:', error);
      return [];
    }
  }

  /**
   * Cleanup de recursos
   */
  cleanup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }
    if (this.integrityCheckInterval) {
      clearInterval(this.integrityCheckInterval);
    }

    console.log('🧹 [RecoveryService] Cleanup concluído');
  }
}

// Instância singleton global
export const recoveryService = RecoveryService.getInstance();

export default RecoveryService;