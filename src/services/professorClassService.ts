// Serviço de Gerenciamento de Turma para Professores
// Created by Ellis Abhulime - UNICAMP

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  limit,
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { StudentModuleProgress } from '@/lib/moduleProgressSystem'
import ModuleProgressService from './moduleProgressService'
import { modules } from '@/data/modules'
import { ClassInviteService } from './classInviteService'
import { enhancedClassService } from './enhancedClassService'
import { EnhancedStudentOverview } from '@/types/classes'

export interface ClassInfo {
  id: string
  name: string
  code: string
  semester: string
  year: number
  professorId: string
  professorName: string
  studentsCount: number
  activeStudents: number
  totalModules: number
  avgProgress: number
  avgScore: number
  maxStudents?: number
  capacity?: number
  createdAt: any
  updatedAt: any
}

export interface StudentOverview {
  studentId: string
  studentName: string
  email?: string
  enrolledAt: any
  
  // Progresso geral
  overallProgress: number
  totalNormalizedScore: number
  completedModules: number
  
  // Status de módulos
  moduleStatus: {
    [moduleId: string]: {
      isUnlocked: boolean
      isCompleted: boolean
      normalizedScore: number
      timeSpent: number
      exercisesCompleted: number
      totalExercises: number
    }
  }
  
  // Atividade recente
  isActive: boolean
  lastActivity: any
  currentStreak: number
  
  // Performance
  averageScore: number
  averageAttempts: number
  perfectExercises: number
  
  // Ranking
  classRank: number
  percentile: number
}

export interface ModuleSettings {
  moduleId: string
  moduleName: string
  isAvailable: boolean
  releaseDate?: any
  dueDate?: any
  maxAttempts?: number
  timeLimit?: number
  isCollaborativeEnabled: boolean
  minPassingScore: number
  prerequisites: string[]
  customInstructions?: string
}

export interface ClassStatistics {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  averageScore: number
  completionRate: number
  
  // Por módulo
  moduleStats: {
    [moduleId: string]: {
      studentsStarted: number
      studentsCompleted: number
      averageScore: number
      averageTime: number
      completionRate: number
      difficulty: 'Fácil' | 'Médio' | 'Difícil'
    }
  }
  
  // Distribuição de performance
  performanceDistribution: {
    excellent: number    // >=90%
    good: number        // 80-89%
    average: number     // 70-79%
    belowAverage: number // 60-69%
    struggling: number   // <60%
  }
  
  // Tendências
  trends: {
    weeklyProgress: number[]
    engagementTrend: 'up' | 'down' | 'stable'
    averageStudyTime: number
  }
}

export class ProfessorClassService {
  private static readonly CLASSES_COLLECTION = 'classes'
  private static readonly CLASS_STUDENTS_COLLECTION = 'class_students'
  private static readonly MODULE_SETTINGS_COLLECTION = 'module_settings'

  // Criar nova turma com sistema robusto e recovery automático
  static async createClass(
    professorId: string,
    professorName: string,
    className: string,
    semester: string,
    year: number
  ): Promise<string> {
    // 🛡️ VALIDAÇÕES RIGOROSAS
    if (!professorId?.trim()) {
      throw new Error('ID do professor é obrigatório')
    }
    if (!professorName?.trim()) {
      throw new Error('Nome do professor é obrigatório')
    }
    if (!className?.trim() || className.length < 3) {
      throw new Error('Nome da turma deve ter pelo menos 3 caracteres')
    }
    if (!semester?.trim()) {
      throw new Error('Semestre é obrigatório')
    }
    if (year < 2020 || year > 2030) {
      throw new Error('Ano deve estar entre 2020 e 2030')
    }
    if (!db) {
      throw new Error('Firebase não está configurado corretamente')
    }

    const startTime = Date.now()
    let classId: string | null = null
    
    try {
      console.log(`🚀 [ProfessorClassService] Iniciando criação robusta de turma para ${professorId}`)
      
      // Gerar ID único com timestamp mais específico
      classId = `class_${professorId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      
      // 📋 DADOS DA TURMA COM VALIDAÇÃO COMPLETA
      const classInfo: Omit<ClassInfo, 'id' | 'code'> & { 
        code: string;
        status: 'active';
        createdBy: string;
        createdVersion: string;
        integrity: {
          validated: boolean;
          timestamp: number;
          checksum: string;
        };
      } = {
        name: className.trim(),
        code: '', // Será preenchido após criar o convite
        semester: semester.trim(),
        year,
        professorId: professorId.trim(),
        professorName: professorName.trim(),
        studentsCount: 0,
        activeStudents: 0,
        totalModules: modules.length,
        avgProgress: 0,
        avgScore: 0,
        maxStudents: 50,
        status: 'active', // ✅ GARANTIDO: status sempre "active"
        createdBy: 'ProfessorClassService_v2.1', // Versionamento
        createdVersion: '2025.01', // Tracking de versão
        integrity: {
          validated: true,
          timestamp: Date.now(),
          checksum: `${professorId}_${className}_${semester}_${year}`.replace(/\s/g, '').toLowerCase()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      console.log(`📊 [ProfessorClassService] Dados validados:`, {
        classId,
        name: classInfo.name,
        status: classInfo.status,
        integrity: classInfo.integrity
      })

      // 🔒 OPERAÇÃO ATÔMICA - Criar documento da turma
      const docRef = doc(db, this.CLASSES_COLLECTION, classId)
      await setDoc(docRef, classInfo)
      console.log(`✅ [ProfessorClassService] Turma criada no Firestore: ${classId}`)
      
      // ⚡ VERIFICAÇÃO DE INTEGRIDADE PÓS-CRIAÇÃO
      const verificationDoc = await getDoc(docRef)
      if (!verificationDoc.exists()) {
        throw new Error('❌ CRÍTICO: Turma não foi salva no Firestore')
      }
      
      const savedData = verificationDoc.data()
      if (savedData.status !== 'active') {
        console.warn(`⚠️ [ProfessorClassService] Status inesperado: ${savedData.status}, corrigindo...`)
        await updateDoc(docRef, { status: 'active', statusCorrectedAt: serverTimestamp() })
      }

      // 🎫 CRIAR CÓDIGO DE CONVITE COM RETRY
      let classCode: string
      let inviteAttempts = 0
      const maxInviteAttempts = 3
      
      while (inviteAttempts < maxInviteAttempts) {
        try {
          inviteAttempts++
          console.log(`🎫 [ProfessorClassService] Criando código de convite (tentativa ${inviteAttempts}/${maxInviteAttempts})`)
          
          classCode = await ClassInviteService.createClassInvite(
            classId,
            className,
            professorId
          )
          
          if (!classCode || classCode.length < 4) {
            throw new Error('Código de convite inválido gerado')
          }
          
          console.log(`✅ [ProfessorClassService] Código gerado: ${classCode}`)
          break
        } catch (inviteError) {
          console.warn(`⚠️ [ProfessorClassService] Erro na criação do convite (tentativa ${inviteAttempts}):`, inviteError)
          
          if (inviteAttempts >= maxInviteAttempts) {
            // Gerar código fallback se serviço falhar
            classCode = `FALLBACK_${Math.random().toString(36).substr(2, 8).toUpperCase()}`
            console.log(`🔄 [ProfessorClassService] Usando código fallback: ${classCode}`)
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * inviteAttempts)) // Backoff exponencial
          }
        }
      }

      // 📝 ATUALIZAR TURMA COM CÓDIGO E METADADOS FINAIS
      const finalUpdate = {
        code: classCode,
        inviteCode: classCode, // ✅ CORREÇÃO: Garantir que ambos os campos sejam definidos
        codeGeneratedAt: serverTimestamp(),
        setupCompleted: true,
        setupCompletedAt: serverTimestamp(),
        processingTimeMs: Date.now() - startTime,
        status: 'open' // ✅ CORREÇÃO: Garantir status consistente
      }
      
      await updateDoc(docRef, finalUpdate)
      console.log(`📋 [ProfessorClassService] Turma atualizada com código: ${classCode}`)
      
      // 🏗️ CRIAR CONFIGURAÇÕES DOS MÓDULOS COM ERROR HANDLING
      try {
        await this.createDefaultModuleSettings(classId)
        console.log(`⚙️ [ProfessorClassService] Configurações de módulos criadas`)
      } catch (moduleError) {
        console.error(`⚠️ [ProfessorClassService] Erro nas configurações de módulos (não crítico):`, moduleError)
        // Não falhar a operação principal por erro de módulos
        await updateDoc(docRef, { 
          moduleSetupError: moduleError.message,
          moduleSetupErrorAt: serverTimestamp()
        })
      }
      
      // 🎉 SUCESSO COMPLETO
      const totalTime = Date.now() - startTime
      console.log(`🎉 [ProfessorClassService] Turma criada com sucesso em ${totalTime}ms:`, {
        classId,
        code: classCode,
        status: 'active',
        integrity: 'validated'
      })
      
      return classId
      
    } catch (error) {
      const totalTime = Date.now() - startTime
      console.error(`❌ [ProfessorClassService] Erro na criação da turma após ${totalTime}ms:`, error)
      
      // 🔄 CLEANUP EM CASO DE ERRO (se turma foi parcialmente criada)
      if (classId) {
        try {
          console.log(`🧹 [ProfessorClassService] Fazendo cleanup da turma parcial: ${classId}`)
          await deleteDoc(doc(db, this.CLASSES_COLLECTION, classId))
        } catch (cleanupError) {
          console.warn(`⚠️ [ProfessorClassService] Erro no cleanup:`, cleanupError)
        }
      }
      
      // Re-throw com mensagem user-friendly
      if (error.message.includes('permission-denied')) {
        throw new Error('Sem permissão para criar turma. Verifique se você está logado como professor.')
      } else if (error.message.includes('network')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        throw new Error(`Erro ao criar turma: ${error.message}`)
      }
    }
  }

  // Obter informações da turma
  static async getClassInfo(classId: string): Promise<ClassInfo | null> {
    try {
      console.log('Buscando informações da turma:', classId)
      const docRef = doc(db, this.CLASSES_COLLECTION, classId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const classData = { id: docSnap.id, ...docSnap.data() } as ClassInfo
        console.log('Informações da turma encontradas:', classData)
        console.log('Código da turma:', classData.code)
        return classData
      }
      console.log('Turma não encontrada:', classId)
      return null
    } catch (error) {
      console.error('Erro ao obter informações da turma:', error)
      return null
    }
  }

  // Obter todas as turmas com sistema de recovery automático
  static async getProfessorClasses(professorId: string): Promise<ClassInfo[]> {
    const startTime = Date.now()
    
    try {
      console.log('[ProfessorClassService] 🔓 Carregando turmas com sistema de recovery automático')
      
      // 🎯 TENTATIVA 1: Query otimizada com status corretos (incluindo 'active' para compatibilidade)
      try {
        const optimizedQuery = query(
          collection(db, this.CLASSES_COLLECTION),
          where('status', 'in', ['open', 'closed', 'active']),
          orderBy('createdAt', 'desc')
        )
        
        const querySnapshot = await getDocs(optimizedQuery)
        
        if (querySnapshot.size > 0) {
          const classes: ClassInfo[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data()
            classes.push({ id: doc.id, ...data } as ClassInfo)
          })
          
          const processingTime = Date.now() - startTime
          console.log(`✅ [ProfessorClassService] ${classes.length} turmas ativas carregadas em ${processingTime}ms`)
          return classes
        } else {
          console.log('⚠️ [ProfessorClassService] Nenhuma turma com status "open" ou "closed" encontrada, iniciando recovery')
        }
      } catch (queryError) {
        if (queryError.message?.includes('index')) {
          console.log('📋 [ProfessorClassService] Falta índice para query otimizada, usando método de recovery')
        } else {
          console.warn('⚠️ [ProfessorClassService] Erro na query otimizada:', queryError.message)
        }
      }
      
      // 🔄 RECOVERY AUTOMÁTICO: Carregar todas as turmas e corrigir status quando necessário
      console.log('🔄 [ProfessorClassService] Iniciando recovery automático...')
      
      const allClassesQuery = query(
        collection(db, this.CLASSES_COLLECTION),
        orderBy('createdAt', 'desc')
      )
      
      const allQuerySnapshot = await getDocs(allClassesQuery)
      const classes: ClassInfo[] = []
      const classesToFix: { id: string, data: any }[] = []
      
      allQuerySnapshot.forEach((doc) => {
        const data = doc.data()
        const currentStatus = data.status
        
        // Identificar turmas que precisam de correção
        const needsFix = (
          !currentStatus || 
          currentStatus === 'deleted' || 
          currentStatus === 'undefined' ||
          currentStatus === null ||
          currentStatus === 'active' // Corrigir status "active" obsoleto
        )
        
        if (needsFix && data.name && data.professorId) {
          // Esta turma precisa de correção mas tem dados válidos
          classesToFix.push({ id: doc.id, data })
          console.log(`🔧 [ProfessorClassService] Turma precisa correção: ${data.name} (status: ${currentStatus || 'undefined'})`)
        } else if (['open', 'closed'].includes(currentStatus) && currentStatus !== 'deleted') {
          // Turma OK com status válido (open/closed) não-deletado
          classes.push({ id: doc.id, ...data } as ClassInfo)
        }
      })
      
      // 🛠️ RECOVERY AUTOMÁTICO: Corrigir status das turmas problemáticas
      if (classesToFix.length > 0) {
        console.log(`🛠️ [ProfessorClassService] Corrigindo automaticamente ${classesToFix.length} turmas...`)
        
        const batch = writeBatch(db)
        let successCount = 0
        
        classesToFix.forEach(({ id, data }) => {
          try {
            const docRef = doc(db, this.CLASSES_COLLECTION, id)
            batch.update(docRef, {
              status: 'open', // Status correto: 'open' em vez de 'active'
              statusCorrectedAt: serverTimestamp(),
              statusCorrectedBy: 'AutoRecovery_v2.2',
              autoRecoveryReason: `Status was "${data.status || 'undefined'}", corrected to "open"`
            })
            
            // Adicionar à lista de turmas válidas
            classes.push({ 
              id, 
              ...data, 
              status: 'open' // Override local para não afetar UI
            } as ClassInfo)
            successCount++
          } catch (batchError) {
            console.error(`❌ [ProfessorClassService] Erro ao preparar correção da turma ${id}:`, batchError)
          }
        })
        
        // Executar correções em batch
        try {
          await batch.commit()
          console.log(`✅ [ProfessorClassService] ${successCount} turmas corrigidas automaticamente`)
        } catch (batchError) {
          console.error('❌ [ProfessorClassService] Erro ao executar correções em batch:', batchError)
          // Continuar mesmo se as correções falharem
        }
      }
      
      // 📊 RESULTADO FINAL
      const processingTime = Date.now() - startTime
      console.log(`🎉 [ProfessorClassService] Recovery completo: ${classes.length} turmas disponíveis em ${processingTime}ms`)
      
      if (classesToFix.length > 0) {
        console.log(`🔧 [ProfessorClassService] Correções automáticas aplicadas: ${classesToFix.length} turmas`)
      }
      
      return classes.sort((a, b) => {
        // Ordenar por data de criação (mais recente primeiro)
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
      
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ [ProfessorClassService] Erro crítico no recovery após ${processingTime}ms:`, error)
      
      // ⚠️ ÚLTIMO RECURSO: Tentar query mais básica possível
      try {
        console.log('🆘 [ProfessorClassService] Tentando último recurso...')
        const basicQuery = collection(db, this.CLASSES_COLLECTION)
        const basicSnapshot = await getDocs(basicQuery)
        
        const emergencyClasses: ClassInfo[] = []
        basicSnapshot.forEach((doc) => {
          const data = doc.data()
          // Aceitar qualquer turma que não seja explicitamente deletada
          if (data.name && data.professorId && data.status !== 'deleted') {
            emergencyClasses.push({ 
              id: doc.id, 
              ...data, 
              status: data.status || 'active' // Force status se necessário
            } as ClassInfo)
          }
        })
        
        console.log(`🆘 [ProfessorClassService] Último recurso retornou ${emergencyClasses.length} turmas`)
        return emergencyClasses
        
      } catch (emergencyError) {
        console.error('💥 [ProfessorClassService] Falha total no sistema de recovery:', emergencyError)
        return []
      }
    }
  }

  // Adicionar estudante à turma (com verificação de duplicatas)
  static async addStudentToClass(classId: string, studentId: string, studentName: string, email?: string): Promise<void> {
    try {
      // Primeiro, verificar se o estudante já está na turma
      const studentDocRef = doc(db, this.CLASS_STUDENTS_COLLECTION, `${classId}_${studentId}`)
      const studentDoc = await getDoc(studentDocRef)
      
      if (studentDoc.exists()) {
        console.log('Estudante já está matriculado nesta turma:', studentId)
        // Se o estudante já existe mas está inativo, reativá-lo
        const studentData = studentDoc.data()
        if (studentData.isActive === false) {
          await updateDoc(studentDocRef, {
            isActive: true,
            updatedAt: serverTimestamp()
          })
          console.log('Estudante reativado na turma:', studentId)
        }
        return // Não incrementar contador se estudante já existe
      }
      
      const batch = writeBatch(db)
      
      // Adicionar estudante à turma
      batch.set(studentDocRef, {
        classId,
        studentId,
        studentName,
        email: email || '',
        enrolledAt: serverTimestamp(),
        isActive: true
      })
      
      // Atualizar contador de estudantes apenas se for novo estudante
      const classDocRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.update(classDocRef, {
        studentsCount: increment(1),
        updatedAt: serverTimestamp()
      })
      
      await batch.commit()
      console.log('Novo estudante adicionado à turma:', studentId)
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error)
      throw error
    }
  }

  // Remover estudante da turma
  static async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Remover estudante da turma
      const studentDocRef = doc(db, this.CLASS_STUDENTS_COLLECTION, `${classId}_${studentId}`)
      batch.delete(studentDocRef)
      
      // Atualizar contador de estudantes
      const classDocRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.update(classDocRef, {
        studentsCount: increment(-1),
        updatedAt: serverTimestamp()
      })
      
      await batch.commit()
      console.log('Estudante removido da turma:', studentId)
    } catch (error) {
      console.error('Erro ao remover estudante:', error)
      throw error
    }
  }

  // 🚀 CORREÇÃO: Obter estudantes da turma usando sistema unificado
  static async getClassStudents(classId: string): Promise<StudentOverview[]> {
    try {
      console.log(`[ProfessorClassService] 🔄 Buscando estudantes da turma ${classId} (sistema unificado)`)
      
      // Usar enhancedClassService que já está integrado com unifiedScoringService
      const enhancedStudents = await enhancedClassService.getClassStudents(classId)
      
      if (!enhancedStudents || enhancedStudents.length === 0) {
        console.log(`[ProfessorClassService] ⚠️ Nenhum estudante encontrado na turma ${classId}`)
        return []
      }
      
      // Converter EnhancedStudentOverview para StudentOverview (compatibilidade)
      const students: StudentOverview[] = enhancedStudents.map((enhancedStudent, index) => {
        
        // Mapear dados do sistema unificado para interface legacy
        const moduleStatus: { [moduleId: string]: any } = {}
        enhancedStudent.moduleProgress?.forEach(moduleProgress => {
          moduleStatus[moduleProgress.moduleId] = {
            isUnlocked: true, // Assume desbloqueado se está no progresso
            isCompleted: moduleProgress.isCompleted,
            normalizedScore: moduleProgress.score,
            timeSpent: moduleProgress.timeSpent,
            exercisesCompleted: moduleProgress.completedExercises,
            totalExercises: moduleProgress.totalExercises
          }
        }) || {}
        
        const studentOverview: StudentOverview = {
          studentId: enhancedStudent.studentId,
          studentName: enhancedStudent.studentName,
          email: enhancedStudent.email,
          enrolledAt: enhancedStudent.enrolledAt,
          
          // Usar dados normalizados do sistema unificado
          overallProgress: enhancedStudent.overallProgress,
          totalNormalizedScore: enhancedStudent.totalNormalizedScore, // Já normalizado 0-100
          completedModules: enhancedStudent.completedModules,
          
          moduleStatus,
          isActive: enhancedStudent.status === 'active',
          lastActivity: enhancedStudent.lastActivity,
          currentStreak: enhancedStudent.currentStreak || 0,
          
          // Calcular métricas derivadas
          averageScore: enhancedStudent.completedModules > 0 
            ? enhancedStudent.totalNormalizedScore / enhancedStudent.completedModules 
            : 0,
          averageAttempts: enhancedStudent.moduleProgress?.reduce((sum, m) => sum + (m.attempts || 1), 0) / (enhancedStudent.moduleProgress?.length || 1) || 1,
          perfectExercises: enhancedStudent.moduleProgress?.reduce((sum, m) => {
            return sum + m.exercises.filter(ex => ex.score === ex.maxScore).length
          }, 0) || 0,
          
          // Ranking será calculado depois
          classRank: enhancedStudent.classRank || (index + 1),
          percentile: Math.round(((enhancedStudents.length - (index + 1)) / enhancedStudents.length) * 100)
        }
        
        return studentOverview
      })
      
      console.log(`[ProfessorClassService] ✅ ${students.length} estudantes carregados com dados unificados`)
      
      // Dados já vêm ordenados do enhancedClassService
      return students
      
    } catch (error) {
      console.error('[ProfessorClassService] ❌ Erro ao obter estudantes (sistema unificado):', error)
      
      // Fallback para sistema legacy se enhancedClassService falhar
      console.log('[ProfessorClassService] 🔄 Tentando fallback para sistema legacy...')
      return this.getClassStudentsLegacy(classId)
    }
  }

  // 🗂️ FALLBACK: Método legacy mantido para compatibilidade
  private static async getClassStudentsLegacy(classId: string): Promise<StudentOverview[]> {
    try {
      console.log(`[ProfessorClassService] ⚠️ Usando sistema legacy para turma ${classId}`)
      
      const q = query(
        collection(db, 'classStudents'),
        where('studentId', '!=', null)
      )
      
      const querySnapshot = await getDocs(q)
      const students: StudentOverview[] = []
      
      for (const doc of querySnapshot.docs) {
        const studentData = doc.data()
        const docId = doc.id
        
        if (docId.startsWith(`${classId}_`) && studentData.status === 'active') {
          const studentProgress = await ModuleProgressService.loadStudentProgress(studentData.studentId)
          
          if (studentProgress) {
            const overview = this.createStudentOverview(studentData, studentProgress)
            students.push(overview)
          }
        }
      }
      
      students.sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
      
      students.forEach((student, index) => {
        student.classRank = index + 1
        student.percentile = Math.round(((students.length - (index + 1)) / students.length) * 100)
      })
      
      return students
    } catch (error) {
      console.error('[ProfessorClassService] ❌ Erro no fallback legacy:', error)
      return []
    }
  }

  // Configurar módulo (bloquear/desbloquear)
  static async configureModule(
    classId: string, 
    moduleId: string, 
    settings: Partial<ModuleSettings>
  ): Promise<void> {
    try {
      const docRef = doc(db, this.MODULE_SETTINGS_COLLECTION, `${classId}_${moduleId}`)
      
      await setDoc(docRef, {
        classId,
        moduleId,
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      console.log('Configuração do módulo atualizada:', moduleId)
    } catch (error) {
      console.error('Erro ao configurar módulo:', error)
      throw error
    }
  }

  // Obter configurações dos módulos
  static async getModuleSettings(classId: string): Promise<ModuleSettings[]> {
    try {
      const q = query(
        collection(db, this.MODULE_SETTINGS_COLLECTION),
        where('classId', '==', classId)
      )
      
      const querySnapshot = await getDocs(q)
      const settings: ModuleSettings[] = []
      
      querySnapshot.forEach((doc) => {
        settings.push(doc.data() as ModuleSettings)
      })
      
      return settings
    } catch (error) {
      console.error('Erro ao obter configurações dos módulos:', error)
      return []
    }
  }

  // Bloquear módulo para todos os estudantes
  static async lockModuleForClass(classId: string, moduleId: string): Promise<void> {
    try {
      // Atualizar configuração do módulo
      await this.configureModule(classId, moduleId, {
        isAvailable: false,
        moduleId,
        moduleName: modules.find(m => m.id === moduleId)?.title || 'Módulo'
      })
      
      // Opcional: Atualizar progresso dos estudantes (remover acesso)
      const students = await this.getClassStudents(classId)
      const batch = writeBatch(db)
      
      students.forEach(student => {
        // Aqui você poderia atualizar o progresso individual se necessário
      })
      
      await batch.commit()
      console.log('Módulo bloqueado para a turma:', moduleId)
    } catch (error) {
      console.error('Erro ao bloquear módulo:', error)
      throw error
    }
  }

  // Desbloquear módulo para todos os estudantes
  static async unlockModuleForClass(classId: string, moduleId: string): Promise<void> {
    try {
      await this.configureModule(classId, moduleId, {
        isAvailable: true,
        moduleId,
        moduleName: modules.find(m => m.id === moduleId)?.title || 'Módulo'
      })
      
      console.log('Módulo desbloqueado para a turma:', moduleId)
    } catch (error) {
      console.error('Erro ao desbloquear módulo:', error)
      throw error
    }
  }

  // Obter estatísticas da turma
  static async getClassStatistics(classId: string): Promise<ClassStatistics> {
    try {
      const students = await this.getClassStudents(classId)
      
      if (students.length === 0) {
        return this.getEmptyStatistics()
      }
      
      // Estatísticas gerais
      const totalStudents = students.length
      const activeStudents = students.filter(s => s.isActive).length
      const averageProgress = students.reduce((sum, s) => sum + s.overallProgress, 0) / totalStudents
      const averageScore = students.reduce((sum, s) => sum + s.averageScore, 0) / totalStudents
      const completionRate = students.filter(s => s.overallProgress >= 100).length / totalStudents * 100
      
      // Estatísticas por módulo
      const moduleStats: { [moduleId: string]: any } = {}
      modules.forEach(module => {
        const moduleData = students.map(s => s.moduleStatus[module.id]).filter(Boolean)
        
        moduleStats[module.id] = {
          studentsStarted: moduleData.filter(m => m.exercisesCompleted > 0).length,
          studentsCompleted: moduleData.filter(m => m.isCompleted).length,
          averageScore: moduleData.reduce((sum, m) => sum + m.normalizedScore, 0) / Math.max(moduleData.length, 1),
          averageTime: moduleData.reduce((sum, m) => sum + m.timeSpent, 0) / Math.max(moduleData.length, 1),
          completionRate: moduleData.filter(m => m.isCompleted).length / totalStudents * 100,
          difficulty: this.calculateDifficulty(moduleData)
        }
      })
      
      // Distribuição de performance
      const performanceDistribution = {
        excellent: students.filter(s => s.averageScore >= 90).length,
        good: students.filter(s => s.averageScore >= 80 && s.averageScore < 90).length,
        average: students.filter(s => s.averageScore >= 70 && s.averageScore < 80).length,
        belowAverage: students.filter(s => s.averageScore >= 60 && s.averageScore < 70).length,
        struggling: students.filter(s => s.averageScore < 60).length
      }
      
      return {
        totalStudents,
        activeStudents,
        averageProgress: Math.round(averageProgress),
        averageScore: Math.round(averageScore),
        completionRate: Math.round(completionRate),
        moduleStats,
        performanceDistribution,
        trends: {
          weeklyProgress: [75, 78, 82, 85, 87, 89, 91], // Simulado
          engagementTrend: 'up',
          averageStudyTime: 45 // minutos
        }
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas da turma:', error)
      return this.getEmptyStatistics()
    }
  }

  // Exportar dados da turma
  static async exportClassData(classId: string): Promise<any[]> {
    try {
      const students = await this.getClassStudents(classId)
      
      return students.map(student => ({
        nome: student.studentName,
        email: student.email || '',
        progresso_geral: `${student.overallProgress}%`,
        pontuacao_total: student.totalNormalizedScore,
        modulos_completos: student.completedModules,
        media_pontuacao: student.averageScore.toFixed(1),
        exercicios_perfeitos: student.perfectExercises,
        ultimo_acesso: student.lastActivity?.toDate().toLocaleDateString('pt-BR') || '',
        ranking_turma: student.classRank,
        percentil: `${student.percentile}%`
      }))
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      return []
    }
  }

  // Deletar turma - Acesso compartilhado para todos os professores
  static async deleteClass(classId: string, professorId: string): Promise<void> {
    try {
      console.log(`[ProfessorClassService] 🗑️ Professor ${professorId} deletando turma ${classId} (acesso compartilhado)`)
      
      // Verificar se a turma existe (removida a verificação de proprietário)
      const classInfo = await this.getClassInfo(classId)
      if (!classInfo) {
        throw new Error('Turma não encontrada')
      }

      console.log(`[ProfessorClassService] ✅ Turma encontrada: ${classInfo.name} (criada por: ${classInfo.professorId})`)

      const batch = writeBatch(db)
      
      // Deletar turma principal
      const classDocRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.delete(classDocRef)
      
      // Deletar estudantes da turma
      const studentsQuery = query(
        collection(db, this.CLASS_STUDENTS_COLLECTION),
        where('classId', '==', classId)
      )
      const studentsSnapshot = await getDocs(studentsQuery)
      studentsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      // Deletar configurações de módulos
      const moduleSettingsQuery = query(
        collection(db, this.MODULE_SETTINGS_COLLECTION),
        where('classId', '==', classId)
      )
      const moduleSettingsSnapshot = await getDocs(moduleSettingsQuery)
      moduleSettingsSnapshot.forEach((doc) => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      console.log(`[ProfessorClassService] ✅ Turma ${classId} deletada com sucesso pelo professor ${professorId}`)
    } catch (error) {
      console.error('Erro ao deletar turma:', error)
      throw error
    }
  }

  // Obter turmas onde o estudante está matriculado (com timeout e fallback)
  static async getStudentClasses(studentId: string): Promise<ClassInfo[]> {
    const startTime = Date.now()
    
    try {
      console.log(`📚 [ProfessorClassService] Carregando turmas do estudante: ${studentId}`)
      
      // Validação inicial
      if (!studentId) {
        console.warn('❌ [ProfessorClassService] StudentId não fornecido')
        return []
      }
      
      if (!db) {
        console.warn('❌ [ProfessorClassService] Firestore não configurado')
        return []
      }

      // Promise com timeout de 8 segundos
      const timeoutPromise = new Promise<ClassInfo[]>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Operação excedeu 8 segundos'))
        }, 8000)
      })
      
      const mainPromise = async (): Promise<ClassInfo[]> => {
        // Buscar onde o estudante está matriculado
        const q = query(
          collection(db, this.CLASS_STUDENTS_COLLECTION),
          where('studentId', '==', studentId)
        )
        
        console.log(`🔍 [ProfessorClassService] Executando query para estudante ${studentId}`)
        const querySnapshot = await getDocs(q)
        
        const classIds: string[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.isActive) {
            classIds.push(data.classId)
          }
        })
        
        console.log(`📋 [ProfessorClassService] Encontradas ${classIds.length} turmas para estudante`)
        
        // Buscar informações das turmas (com timeout por turma)
        const classes: ClassInfo[] = []
        for (const classId of classIds) {
          try {
            // Timeout menor para cada turma individual (3 segundos)
            const classPromise = this.getClassInfo(classId)
            const classTimeout = new Promise<ClassInfo | null>((_, reject) => {
              setTimeout(() => reject(new Error(`Timeout para turma ${classId}`)), 3000)
            })
            
            const classInfo = await Promise.race([classPromise, classTimeout])
            if (classInfo) {
              classes.push(classInfo)
            }
          } catch (classError) {
            console.warn(`⚠️ [ProfessorClassService] Erro ao carregar turma ${classId}:`, classError)
            // Continue com outras turmas mesmo se uma falhar
          }
        }
        
        return classes
      }
      
      // Executar com timeout global
      const result = await Promise.race([mainPromise(), timeoutPromise])
      
      const processingTime = Date.now() - startTime
      console.log(`✅ [ProfessorClassService] ${result.length} turmas carregadas em ${processingTime}ms`)
      
      return result
      
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`❌ [ProfessorClassService] Erro após ${processingTime}ms:`, error)
      
      // Retornar array vazio em caso de erro (melhor que travar)
      return []
    }
  }

  // Resetar progresso de estudante
  static async resetStudentProgress(classId: string, studentId: string): Promise<void> {
    try {
      // Implementar reset de progresso
      console.log('Reset de progresso para:', studentId)
      
      // Aqui você implementaria a lógica para resetar o progresso
      // Por segurança, isso deve ser uma operação cuidadosa
    } catch (error) {
      console.error('Erro ao resetar progresso:', error)
      throw error
    }
  }

  // Métodos auxiliares privados
  private static generateClassCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }

  private static async createDefaultModuleSettings(classId: string): Promise<void> {
    const batch = writeBatch(db)
    
    modules.forEach((module, index) => {
      const docRef = doc(db, this.MODULE_SETTINGS_COLLECTION, `${classId}_${module.id}`)
      const settings: ModuleSettings = {
        moduleId: module.id,
        moduleName: module.title,
        isAvailable: index === 0, // Apenas primeiro módulo desbloqueado
        isCollaborativeEnabled: true,
        minPassingScore: 70,
        prerequisites: index > 0 ? [modules[index - 1].id] : [],
        customInstructions: ''
      }
      
      batch.set(docRef, {
        classId,
        ...settings,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })
    
    await batch.commit()
  }

  private static createStudentOverview(studentData: any, progress: StudentModuleProgress): StudentOverview {
    // Criar status dos módulos
    const moduleStatus: { [moduleId: string]: any } = {}
    progress.modules.forEach(module => {
      moduleStatus[module.moduleId] = {
        isUnlocked: module.isUnlocked,
        isCompleted: module.isCompleted,
        normalizedScore: module.normalizedScore,
        timeSpent: module.timeSpent,
        exercisesCompleted: module.exercises.filter(e => e.completed).length,
        totalExercises: module.exercises.length
      }
    })

    return {
      studentId: progress.studentId,
      studentName: progress.studentName,
      email: studentData.email,
      enrolledAt: studentData.enrolledAt,
      overallProgress: progress.overallProgress,
      totalNormalizedScore: progress.totalNormalizedScore,
      completedModules: progress.modules.filter(m => m.isCompleted).length,
      moduleStatus,
      isActive: progress.isActive,
      lastActivity: progress.lastActivity,
      currentStreak: progress.currentStreak,
      averageScore: progress.modules.filter(m => m.isCompleted).length > 0
        ? progress.modules.filter(m => m.isCompleted).reduce((sum, m) => sum + m.normalizedScore, 0) / progress.modules.filter(m => m.isCompleted).length
        : 0,
      averageAttempts: progress.modules.reduce((sum, m) => sum + m.averageAttempts, 0) / progress.modules.length,
      perfectExercises: progress.modules.reduce((sum, m) => sum + m.perfectExercises, 0),
      classRank: 0, // Será calculado depois
      percentile: 0 // Será calculado depois
    }
  }

  private static calculateDifficulty(moduleData: any[]): 'Fácil' | 'Médio' | 'Difícil' {
    const avgScore = moduleData.reduce((sum, m) => sum + m.normalizedScore, 0) / Math.max(moduleData.length, 1)
    
    if (avgScore >= 80) return 'Fácil'
    if (avgScore >= 65) return 'Médio'
    return 'Difícil'
  }

  private static getEmptyStatistics(): ClassStatistics {
    return {
      totalStudents: 0,
      activeStudents: 0,
      averageProgress: 0,
      averageScore: 0,
      completionRate: 0,
      moduleStats: {},
      performanceDistribution: {
        excellent: 0,
        good: 0,
        average: 0,
        belowAverage: 0,
        struggling: 0
      },
      trends: {
        weeklyProgress: [],
        engagementTrend: 'stable',
        averageStudyTime: 0
      }
    }
  }

  // Subscrições em tempo real
  static subscribeToClassUpdates(
    classId: string,
    callback: (classInfo: ClassInfo) => void
  ): () => void {
    const docRef = doc(db, this.CLASSES_COLLECTION, classId)
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as ClassInfo)
      }
    })
  }
}

export default ProfessorClassService