// Sistema de Monitoramento de Saúde - Previne problemas como "0 turmas carregadas"
// Detecta, reporta e corrige problemas automaticamente

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export interface SystemHealthMetrics {
  // Métricas gerais
  timestamp: Date;
  overallHealth: 'healthy' | 'warning' | 'critical' | 'error';
  
  // Métricas de turmas
  classMetrics: {
    totalClasses: number;
    activeClasses: number;
    classesWithoutStatus: number;
    classesWithDeletedStatus: number;
    recentCreations: number; // últimas 24h
    failedCreations: number; // últimas 24h
    averageCreationTime: number; // ms
  };
  
  // Métricas de usuários
  userMetrics: {
    totalUsers: number;
    professorsCount: number;
    studentsCount: number;
    usersWithoutRole: number;
  };
  
  // Métricas de performance
  performanceMetrics: {
    averageQueryTime: number; // ms
    dbConnectionHealth: 'connected' | 'slow' | 'disconnected';
    errorRate: number; // %
  };
  
  // Issues detectadas
  detectedIssues: HealthIssue[];
  
  // Ações de recovery executadas
  recoveryActions: RecoveryAction[];
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'classes' | 'users' | 'performance' | 'data_integrity';
  title: string;
  description: string;
  affectedCount: number;
  detectedAt: Date;
  resolvedAt?: Date;
  autoFixable: boolean;
}

export interface RecoveryAction {
  id: string;
  issueId: string;
  action: 'fix_class_status' | 'cleanup_orphaned_data' | 'notify_admin' | 'create_backup';
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  executedAt: Date;
  completedAt?: Date;
}

export interface HealthAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  recipientId: string; // professor ou admin
  category: string;
  createdAt: Date;
  readAt?: Date;
  actionRequired: boolean;
  actionUrl?: string;
}

export class SystemHealthService {
  private static readonly HEALTH_COLLECTION = 'system_health';
  private static readonly ISSUES_COLLECTION = 'health_issues';
  private static readonly ALERTS_COLLECTION = 'health_alerts';
  private static readonly LOGS_COLLECTION = 'system_logs';

  /**
   * Verifica se o usuário atual está autenticado e tem permissões adequadas
   */
  private static async checkAuthenticationAndPermissions(): Promise<{
    isAuthenticated: boolean,
    hasPermissions: boolean,
    userRole: string | null,
    reason?: string
  }> {
    try {
      // Verificar se Firebase Auth está disponível
      if (!auth || !db) {
        return {
          isAuthenticated: false,
          hasPermissions: false,
          userRole: null,
          reason: 'Firebase não configurado'
        };
      }

      // Verificar se há usuário atual
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return {
          isAuthenticated: false,
          hasPermissions: false,
          userRole: null,
          reason: 'Usuário não autenticado'
        };
      }

      // Verificar custom claims para role
      const idTokenResult = await currentUser.getIdTokenResult();
      const userRole = idTokenResult.claims.role || null;

      // Tentar acesso simples ao Firestore para verificar permissões
      try {
        await getDocs(query(collection(db, 'classes'), limit(1)));
        return {
          isAuthenticated: true,
          hasPermissions: true,
          userRole: userRole as string
        };
      } catch (permError: any) {
        return {
          isAuthenticated: true,
          hasPermissions: false,
          userRole: userRole as string,
          reason: `Erro de permissão: ${permError.code || permError.message}`
        };
      }

    } catch (error: any) {
      return {
        isAuthenticated: false,
        hasPermissions: false,
        userRole: null,
        reason: `Erro na verificação: ${error.message || 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Converte timestamp do Firebase para Date de forma segura
   */
  private static safeToDate(timestamp: any): Date {
    try {
      if (!timestamp) return new Date();
      
      if (timestamp instanceof Date) return timestamp;
      
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      
      if (timestamp.seconds && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000);
      }
      
      if (typeof timestamp === 'string') {
        const parsed = new Date(timestamp);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
      }
      
      if (typeof timestamp === 'number') {
        return new Date(timestamp);
      }
      
      console.warn('[SystemHealthService] Timestamp inválido, usando data atual:', timestamp);
      return new Date();
    } catch (error) {
      console.error('[SystemHealthService] Erro ao converter timestamp:', error);
      return new Date();
    }
  }
  
  /**
   * Executa verificação completa de saúde do sistema
   */
  static async performHealthCheck(): Promise<SystemHealthMetrics> {
    const startTime = Date.now();
    console.log('🏥 [SystemHealthService] Iniciando verificação de saúde do sistema...');
    
    try {
      // CORREÇÃO: Verificar autenticação e permissões primeiro
      const authStatus = await this.checkAuthenticationAndPermissions();
      console.log('🔐 [SystemHealthService] Status de autenticação:', authStatus);

      // Se não tem permissões, retornar métricas limitadas mas funcionais
      if (!authStatus.hasPermissions) {
        console.warn('⚠️ [SystemHealthService] Sem permissões suficientes, retornando métricas limitadas');
        return this.generateLimitedHealthMetrics(authStatus.reason || 'Sem permissões');
      }

      // Executar todas as verificações em paralelo
      const [classMetrics, userMetrics, performanceMetrics] = await Promise.all([
        this.checkClassHealth(),
        this.checkUserHealth(),
        this.checkPerformanceHealth()
      ]);
      
      // Detectar issues baseado nas métricas
      const detectedIssues = await this.detectIssues(classMetrics, userMetrics, performanceMetrics);
      
      // Executar ações de recovery automáticas se necessário
      const recoveryActions = await this.executeAutoRecovery(detectedIssues);
      
      // Determinar saúde geral
      const overallHealth = this.calculateOverallHealth(detectedIssues);
      
      const healthMetrics: SystemHealthMetrics = {
        timestamp: new Date(),
        overallHealth,
        classMetrics,
        userMetrics,
        performanceMetrics,
        detectedIssues,
        recoveryActions
      };
      
      // Tentar salvar métricas no banco (pode falhar se sem permissões)
      try {
        await this.saveHealthMetrics(healthMetrics);
      } catch (saveError) {
        console.warn('⚠️ [SystemHealthService] Não foi possível salvar métricas:', saveError);
      }
      
      // Tentar gerar alertas se necessário
      if (detectedIssues.length > 0) {
        try {
          await this.generateAlerts(detectedIssues);
        } catch (alertError) {
          console.warn('⚠️ [SystemHealthService] Não foi possível gerar alertas:', alertError);
        }
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`✅ [SystemHealthService] Verificação concluída em ${totalTime}ms - Status: ${overallHealth}`);
      
      return healthMetrics;
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro na verificação de saúde:', error);
      
      // CORREÇÃO: Verificar se é erro de permissão especificamente
      const isPermissionError = error instanceof Error && 
        (error.message.includes('permission') || error.message.includes('Permission'));
        
      if (isPermissionError) {
        return this.generateLimitedHealthMetrics(error.message);
      }
      
      // Para outros erros, retornar métricas de erro padrão
      const errorMetrics: SystemHealthMetrics = {
        timestamp: new Date(),
        overallHealth: 'error',
        classMetrics: {
          totalClasses: 0,
          activeClasses: 0,
          classesWithoutStatus: 0,
          classesWithDeletedStatus: 0,
          recentCreations: 0,
          failedCreations: 0,
          averageCreationTime: 0
        },
        userMetrics: {
          totalUsers: 0,
          professorsCount: 0,
          studentsCount: 0,
          usersWithoutRole: 0
        },
        performanceMetrics: {
          averageQueryTime: 0,
          dbConnectionHealth: 'disconnected',
          errorRate: 100
        },
        detectedIssues: [{
          id: `health-check-error-${Date.now()}`,
          severity: 'critical',
          category: 'performance',
          title: 'Falha na Verificação de Saúde',
          description: `Erro ao executar verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          affectedCount: 0,
          detectedAt: new Date(),
          autoFixable: false
        }],
        recoveryActions: []
      };
      
      return errorMetrics;
    }
  }

  /**
   * CORREÇÃO: Gera métricas limitadas quando não há permissões suficientes
   */
  private static generateLimitedHealthMetrics(reason: string): SystemHealthMetrics {
    console.log('📊 [SystemHealthService] Gerando métricas limitadas devido a:', reason);
    
    return {
      timestamp: new Date(),
      overallHealth: 'warning',
      classMetrics: {
        totalClasses: 0,
        activeClasses: 0,
        classesWithoutStatus: 0,
        classesWithDeletedStatus: 0,
        recentCreations: 0,
        failedCreations: 0,
        averageCreationTime: 0
      },
      userMetrics: {
        totalUsers: 0,
        professorsCount: 0,
        studentsCount: 0,
        usersWithoutRole: 0
      },
      performanceMetrics: {
        averageQueryTime: 0,
        dbConnectionHealth: 'disconnected',
        errorRate: 0
      },
      detectedIssues: [{
        id: `permission-issue-${Date.now()}`,
        severity: 'critical',
        category: 'performance',
        title: 'Falha na Verificação de Saúde',
        description: `${reason}`,
        affectedCount: 0,
        detectedAt: new Date(),
        autoFixable: false
      }],
      recoveryActions: []
    };
  }
  
  /**
   * Verifica saúde do sistema de turmas
   */
  private static async checkClassHealth() {
    const startTime = Date.now();
    
    try {
      // CORREÇÃO: Verificar se database está disponível
      if (!db) {
        throw new Error('Database não configurado');
      }

      // Buscar todas as turmas
      const allClassesSnapshot = await getDocs(collection(db, 'classes'));
      const totalClasses = allClassesSnapshot.size;
      
      let activeClasses = 0;
      let classesWithoutStatus = 0;
      let classesWithDeletedStatus = 0;
      let recentCreations = 0;
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      allClassesSnapshot.forEach(doc => {
        const data = doc.data();
        const status = data.status;
        const createdAt = data.createdAt;
        
        // Verificar status
        if (status === 'active') {
          activeClasses++;
        } else if (status === 'deleted') {
          classesWithDeletedStatus++;
        } else if (!status) {
          classesWithoutStatus++;
        }
        
        // Verificar criações recentes
        if (createdAt && createdAt.toDate() > oneDayAgo) {
          recentCreations++;
        }
      });
      
      const queryTime = Date.now() - startTime;
      
      return {
        totalClasses,
        activeClasses,
        classesWithoutStatus,
        classesWithDeletedStatus,
        recentCreations,
        failedCreations: 0, // TODO: implementar tracking de falhas
        averageCreationTime: queryTime
      };
      
    } catch (error: any) {
      console.error('❌ [SystemHealthService] Erro ao verificar saúde das turmas:', error);
      
      // CORREÇÃO: Retornar métricas vazias em caso de erro de permissão
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('⚠️ [SystemHealthService] Sem permissão para acessar coleção classes');
        return {
          totalClasses: 0,
          activeClasses: 0,
          classesWithoutStatus: 0,
          classesWithDeletedStatus: 0,
          recentCreations: 0,
          failedCreations: 0,
          averageCreationTime: Date.now() - startTime
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Verifica saúde do sistema de usuários
   */
  private static async checkUserHealth() {
    try {
      // CORREÇÃO: Verificar se database está disponível
      if (!db) {
        throw new Error('Database não configurado');
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      let professorsCount = 0;
      let studentsCount = 0;
      let usersWithoutRole = 0;
      
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        const role = data.role;
        
        if (role === 'professor') {
          professorsCount++;
        } else if (role === 'student') {
          studentsCount++;
        } else {
          usersWithoutRole++;
        }
      });
      
      return {
        totalUsers,
        professorsCount,
        studentsCount,
        usersWithoutRole
      };
      
    } catch (error: any) {
      console.error('❌ [SystemHealthService] Erro ao verificar saúde dos usuários:', error);
      
      // CORREÇÃO: Retornar métricas vazias em caso de erro de permissão
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('⚠️ [SystemHealthService] Sem permissão para acessar coleção users');
        return {
          totalUsers: 0,
          professorsCount: 0,
          studentsCount: 0,
          usersWithoutRole: 0
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Verifica métricas de performance
   */
  private static async checkPerformanceHealth() {
    const startTime = Date.now();
    
    try {
      // CORREÇÃO: Verificar se database está disponível
      if (!db) {
        return {
          averageQueryTime: 0,
          dbConnectionHealth: 'disconnected' as const,
          errorRate: 100
        };
      }

      // Teste de conectividade simples
      await getDocs(query(collection(db, 'classes'), limit(1)));
      
      const queryTime = Date.now() - startTime;
      const dbConnectionHealth = queryTime < 1000 ? 'connected' : queryTime < 3000 ? 'slow' : 'disconnected';
      
      return {
        averageQueryTime: queryTime,
        dbConnectionHealth: dbConnectionHealth as 'connected' | 'slow' | 'disconnected',
        errorRate: 0 // TODO: implementar tracking de erro
      };
      
    } catch (error: any) {
      console.error('❌ [SystemHealthService] Erro ao verificar performance:', error);
      
      const queryTime = Date.now() - startTime;
      
      // CORREÇÃO: Dar informações mais específicas sobre o erro
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.warn('⚠️ [SystemHealthService] Sem permissão para verificar performance');
      }
      
      return {
        averageQueryTime: queryTime,
        dbConnectionHealth: 'disconnected' as const,
        errorRate: error.code === 'permission-denied' ? 0 : 100
      };
    }
  }
  
  /**
   * Detecta issues baseado nas métricas coletadas
   */
  private static async detectIssues(classMetrics: any, userMetrics: any, performanceMetrics: any): Promise<HealthIssue[]> {
    const issues: HealthIssue[] = [];
    
    // Issue: Turmas sem status
    if (classMetrics.classesWithoutStatus > 0) {
      issues.push({
        id: `classes-without-status-${Date.now()}`,
        severity: 'high',
        category: 'classes',
        title: 'Turmas sem Status Definido',
        description: `${classMetrics.classesWithoutStatus} turmas estão sem campo status definido, impedindo que apareçam na interface.`,
        affectedCount: classMetrics.classesWithoutStatus,
        detectedAt: new Date(),
        autoFixable: true
      });
    }
    
    // Issue: Turmas com status deleted
    if (classMetrics.classesWithDeletedStatus > 0) {
      issues.push({
        id: `classes-deleted-status-${Date.now()}`,
        severity: 'medium',
        category: 'classes',
        title: 'Turmas com Status Deleted',
        description: `${classMetrics.classesWithDeletedStatus} turmas têm status="deleted" mas ainda existem no banco.`,
        affectedCount: classMetrics.classesWithDeletedStatus,
        detectedAt: new Date(),
        autoFixable: true
      });
    }
    
    // Issue: Baixa criação de turmas
    if (classMetrics.totalClasses > 0 && classMetrics.activeClasses / classMetrics.totalClasses < 0.5) {
      issues.push({
        id: `low-active-classes-ratio-${Date.now()}`,
        severity: 'medium',
        category: 'classes',
        title: 'Baixa Proporção de Turmas Ativas',
        description: `Apenas ${Math.round((classMetrics.activeClasses / classMetrics.totalClasses) * 100)}% das turmas estão ativas.`,
        affectedCount: classMetrics.totalClasses - classMetrics.activeClasses,
        detectedAt: new Date(),
        autoFixable: false
      });
    }
    
    // Issue: Usuários sem role
    if (userMetrics.usersWithoutRole > 0) {
      issues.push({
        id: `users-without-role-${Date.now()}`,
        severity: 'high',
        category: 'users',
        title: 'Usuários sem Role Definido',
        description: `${userMetrics.usersWithoutRole} usuários estão sem role definido.`,
        affectedCount: userMetrics.usersWithoutRole,
        detectedAt: new Date(),
        autoFixable: false
      });
    }
    
    // Issue: Performance ruim
    if (performanceMetrics.dbConnectionHealth === 'slow' || performanceMetrics.dbConnectionHealth === 'disconnected') {
      issues.push({
        id: `poor-performance-${Date.now()}`,
        severity: performanceMetrics.dbConnectionHealth === 'disconnected' ? 'critical' : 'medium',
        category: 'performance',
        title: 'Performance do Banco Degradada',
        description: `Conexão com banco está ${performanceMetrics.dbConnectionHealth === 'disconnected' ? 'desconectada' : 'lenta'}.`,
        affectedCount: 0,
        detectedAt: new Date(),
        autoFixable: false
      });
    }
    
    return issues;
  }
  
  /**
   * Executa ações de recovery automáticas
   */
  private static async executeAutoRecovery(issues: HealthIssue[]): Promise<RecoveryAction[]> {
    const actions: RecoveryAction[] = [];
    
    for (const issue of issues) {
      if (!issue.autoFixable) continue;
      
      const actionId = `recovery-${issue.id}`;
      const action: RecoveryAction = {
        id: actionId,
        issueId: issue.id,
        action: issue.category === 'classes' ? 'fix_class_status' : 'notify_admin',
        status: 'pending',
        executedAt: new Date()
      };
      
      try {
        action.status = 'running';
        
        if (issue.category === 'classes' && (issue.title.includes('sem Status') || issue.title.includes('Status Deleted'))) {
          // Executar correção automática de status das turmas
          const result = await this.fixClassStatusIssues();
          action.result = result;
          action.status = 'completed';
          action.completedAt = new Date();
          
          // Marcar issue como resolvida
          issue.resolvedAt = new Date();
        }
        
      } catch (error) {
        action.status = 'failed';
        action.result = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error(`❌ [SystemHealthService] Falha na ação de recovery ${actionId}:`, error);
      }
      
      actions.push(action);
    }
    
    return actions;
  }
  
  /**
   * Corrige problemas de status das turmas automaticamente
   */
  private static async fixClassStatusIssues(): Promise<string> {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const batch = writeBatch(db);
      let fixedCount = 0;
      
      classesSnapshot.forEach(classDoc => {
        const data = classDoc.data();
        const currentStatus = data.status;
        
        // Corrigir turmas sem status ou com status deleted que têm dados válidos
        const needsFix = (!currentStatus || currentStatus === 'deleted') && data.name && data.professorId;
        
        if (needsFix) {
          const classRef = doc(db, 'classes', classDoc.id);
          batch.update(classRef, {
            status: 'active',
            statusCorrectedAt: serverTimestamp(),
            statusCorrectedBy: 'SystemHealthService_AutoRecovery'
          });
          fixedCount++;
        }
      });
      
      if (fixedCount > 0) {
        await batch.commit();
        const result = `✅ ${fixedCount} turmas corrigidas automaticamente para status='active'`;
        console.log(`🔧 [SystemHealthService] ${result}`);
        return result;
      } else {
        return 'Nenhuma correção necessária';
      }
      
    } catch (error) {
      const errorMsg = `Erro na correção automática: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌ [SystemHealthService]', errorMsg);
      throw new Error(errorMsg);
    }
  }
  
  /**
   * Calcula saúde geral do sistema baseado nas issues
   */
  private static calculateOverallHealth(issues: HealthIssue[]): 'healthy' | 'warning' | 'critical' | 'error' {
    if (issues.length === 0) return 'healthy';
    
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    
    if (criticalIssues.length > 0) return 'critical';
    if (highIssues.length > 0) return 'warning';
    return 'warning';
  }
  
  /**
   * Salva métricas de saúde no banco
   */
  private static async saveHealthMetrics(metrics: SystemHealthMetrics): Promise<void> {
    try {
      const docId = `health-${Date.now()}`;
      const docRef = doc(db, this.HEALTH_COLLECTION, docId);
      
      await setDoc(docRef, {
        ...metrics,
        timestamp: Timestamp.fromDate(metrics.timestamp),
        detectedIssues: metrics.detectedIssues.map(issue => ({
          ...issue,
          detectedAt: Timestamp.fromDate(issue.detectedAt),
          resolvedAt: issue.resolvedAt ? Timestamp.fromDate(issue.resolvedAt) : null
        })),
        recoveryActions: metrics.recoveryActions.map(action => ({
          ...action,
          executedAt: Timestamp.fromDate(action.executedAt),
          completedAt: action.completedAt ? Timestamp.fromDate(action.completedAt) : null
        }))
      });
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro ao salvar métricas:', error);
    }
  }
  
  /**
   * Gera alertas baseado nas issues detectadas
   */
  private static async generateAlerts(issues: HealthIssue[]): Promise<void> {
    try {
      // Buscar todos os professores para notificar
      const professorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'professor')
      );
      const professorsSnapshot = await getDocs(professorsQuery);
      
      const batch = writeBatch(db);
      
      for (const issue of issues) {
        // Determinar tipo de alerta baseado na severidade
        const alertType = issue.severity === 'critical' ? 'critical' : 
                         issue.severity === 'high' ? 'error' : 'warning';
        
        // Criar alerta para cada professor
        professorsSnapshot.forEach(professorDoc => {
          const alertId = `alert-${issue.id}-${professorDoc.id}`;
          const alertRef = doc(db, this.ALERTS_COLLECTION, alertId);
          
          const alert: HealthAlert = {
            id: alertId,
            type: alertType,
            title: `🔧 Sistema: ${issue.title}`,
            message: `${issue.description} ${issue.autoFixable && issue.resolvedAt ? '(Corrigido automaticamente)' : ''}`,
            recipientId: professorDoc.id,
            category: issue.category,
            createdAt: new Date(),
            actionRequired: !issue.autoFixable || !issue.resolvedAt,
            actionUrl: issue.category === 'classes' ? '/professor' : undefined
          };
          
          batch.set(alertRef, {
            ...alert,
            createdAt: Timestamp.fromDate(alert.createdAt)
          });
        });
      }
      
      await batch.commit();
      console.log(`📢 [SystemHealthService] ${issues.length} alertas gerados para professores`);
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro ao gerar alertas:', error);
    }
  }
  
  /**
   * Busca alertas para um professor específico
   */
  static async getAlertsForProfessor(professorId: string): Promise<HealthAlert[]> {
    try {
      const alertsQuery = query(
        collection(db, this.ALERTS_COLLECTION),
        where('recipientId', '==', professorId),
        where('readAt', '==', null),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const snapshot = await getDocs(alertsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: this.safeToDate(data.createdAt),
          readAt: data.readAt ? this.safeToDate(data.readAt) : undefined
        } as HealthAlert;
      });
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro ao buscar alertas:', error);
      return [];
    }
  }
  
  /**
   * Marca alerta como lido
   */
  static async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const alertRef = doc(db, this.ALERTS_COLLECTION, alertId);
      await setDoc(alertRef, {
        readAt: serverTimestamp()
      }, { merge: true });
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro ao marcar alerta como lido:', error);
    }
  }
  
  /**
   * Busca métricas de saúde recentes
   */
  static async getRecentHealthMetrics(limit: number = 10): Promise<SystemHealthMetrics[]> {
    try {
      const metricsQuery = query(
        collection(db, this.HEALTH_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(metricsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Conversão segura usando safeToDate
        const convertedData = {
          ...data,
          timestamp: this.safeToDate(data.timestamp),
          detectedIssues: Array.isArray(data.detectedIssues) ? data.detectedIssues.map((issue: any) => ({
            ...issue,
            detectedAt: this.safeToDate(issue.detectedAt),
            resolvedAt: issue.resolvedAt ? this.safeToDate(issue.resolvedAt) : undefined
          })) : [],
          recoveryActions: Array.isArray(data.recoveryActions) ? data.recoveryActions.map((action: any) => ({
            ...action,
            executedAt: this.safeToDate(action.executedAt),
            completedAt: action.completedAt ? this.safeToDate(action.completedAt) : undefined
          })) : []
        } as SystemHealthMetrics;
        
        return convertedData;
      });
      
    } catch (error) {
      console.error('❌ [SystemHealthService] Erro ao buscar métricas:', error);
      return [];
    }
  }
}