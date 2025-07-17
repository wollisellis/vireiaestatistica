// Serviço de Gerenciamento de Turma para Professores
// Created by Ellis Abhulime - UNICAMP

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  updateDoc, 
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

  // Criar nova turma
  static async createClass(
    professorId: string,
    professorName: string,
    className: string,
    semester: string,
    year: number
  ): Promise<string> {
    try {
      const classId = `class_${professorId}_${Date.now()}`
      const classCode = this.generateClassCode()
      
      const classInfo: Omit<ClassInfo, 'id'> = {
        name: className,
        code: classCode,
        semester,
        year,
        professorId,
        professorName,
        studentsCount: 0,
        activeStudents: 0,
        totalModules: modules.length,
        avgProgress: 0,
        avgScore: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, this.CLASSES_COLLECTION, classId), classInfo)
      
      // Criar configurações padrão dos módulos
      await this.createDefaultModuleSettings(classId)
      
      console.log('Turma criada:', classId)
      return classId
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      throw error
    }
  }

  // Obter informações da turma
  static async getClassInfo(classId: string): Promise<ClassInfo | null> {
    try {
      const docRef = doc(db, this.CLASSES_COLLECTION, classId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ClassInfo
      }
      return null
    } catch (error) {
      console.error('Erro ao obter informações da turma:', error)
      return null
    }
  }

  // Obter turmas do professor
  static async getProfessorClasses(professorId: string): Promise<ClassInfo[]> {
    try {
      const q = query(
        collection(db, this.CLASSES_COLLECTION),
        where('professorId', '==', professorId),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const classes: ClassInfo[] = []
      
      querySnapshot.forEach((doc) => {
        classes.push({ id: doc.id, ...doc.data() } as ClassInfo)
      })
      
      return classes
    } catch (error) {
      console.error('Erro ao obter turmas do professor:', error)
      return []
    }
  }

  // Adicionar estudante à turma
  static async addStudentToClass(classId: string, studentId: string, studentName: string, email?: string): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // Adicionar estudante à turma
      const studentDocRef = doc(db, this.CLASS_STUDENTS_COLLECTION, `${classId}_${studentId}`)
      batch.set(studentDocRef, {
        classId,
        studentId,
        studentName,
        email: email || '',
        enrolledAt: serverTimestamp(),
        isActive: true
      })
      
      // Atualizar contador de estudantes
      const classDocRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.update(classDocRef, {
        studentsCount: increment(1),
        updatedAt: serverTimestamp()
      })
      
      await batch.commit()
      console.log('Estudante adicionado à turma:', studentId)
    } catch (error) {
      console.error('Erro ao adicionar estudante:', error)
      throw error
    }
  }

  // Obter estudantes da turma
  static async getClassStudents(classId: string): Promise<StudentOverview[]> {
    try {
      // Buscar estudantes da turma
      const q = query(
        collection(db, this.CLASS_STUDENTS_COLLECTION),
        where('classId', '==', classId)
      )
      
      const querySnapshot = await getDocs(q)
      const students: StudentOverview[] = []
      
      // Para cada estudante, buscar seu progresso detalhado
      for (const doc of querySnapshot.docs) {
        const studentData = doc.data()
        const studentProgress = await ModuleProgressService.loadStudentProgress(studentData.studentId)
        
        if (studentProgress) {
          const overview = this.createStudentOverview(studentData, studentProgress)
          students.push(overview)
        }
      }
      
      // Ordenar por ranking (melhor pontuação primeiro)
      students.sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
      
      // Atribuir ranks
      students.forEach((student, index) => {
        student.classRank = index + 1
        student.percentile = Math.round(((students.length - (index + 1)) / students.length) * 100)
      })
      
      return students
    } catch (error) {
      console.error('Erro ao obter estudantes da turma:', error)
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