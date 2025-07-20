import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp,
  onSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  EnhancedClass, 
  EnhancedStudentOverview, 
  ClassAnalytics, 
  ClassRanking, 
  ClassFilter,
  ClassExportData,
  BulkAction,
  ClassAlert,
  StudentModuleProgress,
  StudentExerciseProgress
} from '@/types/classes'
import { modules } from '@/data/modules'

export class EnhancedClassService {
  
  // Obter informações detalhadas da turma
  static async getEnhancedClassInfo(classId: string): Promise<EnhancedClass | null> {
    try {
      const classDoc = await getDoc(doc(db, 'classes', classId))
      
      if (!classDoc.exists()) {
        return null
      }
      
      const data = classDoc.data()
      
      // Calcular estatísticas em tempo real
      const students = await this.getClassStudentsBasic(classId)
      const analytics = await this.calculateClassAnalytics(classId)
      
      return {
        id: classDoc.id,
        name: data.name,
        description: data.description,
        semester: data.semester,
        year: data.year,
        inviteCode: data.inviteCode,
        professorId: data.professorId,
        professorName: data.professorName,
        status: data.status || 'open',
        maxStudents: data.maxStudents,
        acceptingNewStudents: data.acceptingNewStudents ?? true,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        settings: data.settings || this.getDefaultClassSettings(),
        
        // Estatísticas calculadas
        studentsCount: students.length,
        activeStudents: students.filter(s => s.status === 'active' && 
          (Date.now() - s.lastActivity.getTime()) < 7 * 24 * 60 * 60 * 1000).length,
        totalModules: modules.length,
        avgProgress: analytics?.averageProgress || 0,
        avgScore: analytics?.averageScore || 0,
        lastActivity: analytics?.date
      } as EnhancedClass
      
    } catch (error) {
      console.error('Erro ao buscar informações da turma:', error)
      return null
    }
  }
  
  // Obter alunos com informações detalhadas
  static async getEnhancedClassStudents(
    classId: string, 
    filter?: ClassFilter
  ): Promise<EnhancedStudentOverview[]> {
    try {
      const enrollmentsQuery = query(
        collection(db, 'class_enrollments'),
        where('classId', '==', classId),
        where('status', '!=', 'removed')
      )
      
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
      const students: EnhancedStudentOverview[] = []
      
      for (const enrollmentDoc of enrollmentsSnapshot.docs) {
        const enrollmentData = enrollmentDoc.data()
        
        // Buscar dados detalhados do estudante
        const studentProgress = await this.getStudentDetailedProgress(
          enrollmentData.studentId,
          classId
        )
        
        if (studentProgress) {
          students.push(studentProgress)
        }
      }
      
      // Aplicar filtros
      let filteredStudents = students
      
      if (filter) {
        filteredStudents = this.applyFilters(students, filter)
      }
      
      // Calcular rankings
      filteredStudents = this.calculateClassRankings(filteredStudents)
      
      return filteredStudents
      
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error)
      return []
    }
  }
  
  // Obter progresso detalhado de um estudante específico
  static async getStudentDetailedProgress(
    studentId: string,
    classId: string
  ): Promise<EnhancedStudentOverview | null> {
    try {
      // Buscar dados básicos do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId))
      if (!userDoc.exists()) return null
      
      const userData = userDoc.data()
      
      // Buscar dados de matrícula
      const enrollmentQuery = query(
        collection(db, 'class_enrollments'),
        where('classId', '==', classId),
        where('studentId', '==', studentId)
      )
      const enrollmentSnapshot = await getDocs(enrollmentQuery)
      if (enrollmentSnapshot.empty) return null
      
      const enrollmentData = enrollmentSnapshot.docs[0].data()
      
      // Buscar progresso dos módulos
      const moduleProgressQuery = query(
        collection(db, 'student_module_progress'),
        where('studentId', '==', studentId)
      )
      const moduleProgressSnapshot = await getDocs(moduleProgressQuery)
      
      const moduleProgress: StudentModuleProgress[] = []
      let totalScore = 0
      let totalMaxScore = 0
      let completedModules = 0
      let totalTimeSpent = 0
      
      for (const moduleDoc of moduleProgressSnapshot.docs) {
        const moduleData = moduleDoc.data()
        const module = modules.find(m => m.id === moduleData.moduleId)
        
        if (module) {
          const exerciseProgress = await this.getStudentExerciseProgress(
            studentId, 
            moduleData.moduleId
          )
          
          const moduleProgressData: StudentModuleProgress = {
            moduleId: moduleData.moduleId,
            moduleName: module.title,
            progress: moduleData.progress || 0,
            score: moduleData.score || 0,
            maxScore: moduleData.maxScore || module.exercises.reduce((sum, ex) => sum + ex.points, 0),
            timeSpent: moduleData.timeSpent || 0,
            completedExercises: exerciseProgress.filter(ex => ex.completed).length,
            totalExercises: module.exercises.length,
            attempts: moduleData.attempts || 0,
            bestScore: moduleData.bestScore || moduleData.score || 0,
            lastAttempt: moduleData.lastAttempt?.toDate() || new Date(),
            isCompleted: moduleData.isCompleted || false,
            exercises: exerciseProgress
          }
          
          moduleProgress.push(moduleProgressData)
          
          totalScore += moduleProgressData.score
          totalMaxScore += moduleProgressData.maxScore
          totalTimeSpent += moduleProgressData.timeSpent
          
          if (moduleProgressData.isCompleted) {
            completedModules++
          }
        }
      }
      
      // Calcular métricas de engajamento
      const engagementMetrics = await this.calculateStudentEngagement(studentId)
      
      const overallProgress = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0
      
      return {
        studentId,
        studentName: userData.fullName || userData.email,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        enrolledAt: enrollmentData.enrolledAt?.toDate() || new Date(),
        lastActivity: userData.lastActivity?.toDate() || new Date(),
        status: enrollmentData.status || 'active',
        role: enrollmentData.role || 'student',
        
        overallProgress: Math.round(overallProgress),
        totalNormalizedScore: totalScore,
        classRank: 0, // Será calculado depois
        completedModules,
        totalTimeSpent,
        
        activeDays: engagementMetrics.activeDays,
        currentStreak: engagementMetrics.currentStreak,
        longestStreak: engagementMetrics.longestStreak,
        averageSessionTime: engagementMetrics.averageSessionTime,
        
        moduleProgress,
        badges: await this.getStudentBadges(studentId),
        achievements: await this.getStudentAchievements(studentId),
        notes: enrollmentData.notes
      } as EnhancedStudentOverview
      
    } catch (error) {
      console.error('Erro ao buscar progresso detalhado do estudante:', error)
      return null
    }
  }
  
  // Obter progresso detalhado dos exercícios de um estudante
  static async getStudentExerciseProgress(
    studentId: string,
    moduleId: string
  ): Promise<StudentExerciseProgress[]> {
    try {
      const exerciseProgressQuery = query(
        collection(db, 'student_exercise_progress'),
        where('studentId', '==', studentId),
        where('moduleId', '==', moduleId)
      )
      
      const exerciseProgressSnapshot = await getDocs(exerciseProgressQuery)
      const exerciseProgress: StudentExerciseProgress[] = []
      
      const module = modules.find(m => m.id === moduleId)
      if (!module) return []
      
      for (const exercise of module.exercises) {
        const progressDoc = exerciseProgressSnapshot.docs.find(
          doc => doc.data().exerciseId === exercise.id
        )
        
        if (progressDoc) {
          const data = progressDoc.data()
          exerciseProgress.push({
            exerciseId: exercise.id,
            exerciseTitle: exercise.title,
            completed: data.completed || false,
            score: data.score || 0,
            maxScore: data.maxScore || exercise.points,
            attempts: data.attempts || 0,
            timeSpent: data.timeSpent || 0,
            hintsUsed: data.hintsUsed || 0,
            lastAttempt: data.lastAttempt?.toDate() || new Date(),
            completedAt: data.completedAt?.toDate(),
            correctAnswers: data.correctAnswers || 0,
            totalQuestions: data.totalQuestions || 0,
            accuracy: data.accuracy || 0,
            improvement: data.improvement || 0
          })
        } else {
          // Exercício não iniciado
          exerciseProgress.push({
            exerciseId: exercise.id,
            exerciseTitle: exercise.title,
            completed: false,
            score: 0,
            maxScore: exercise.points,
            attempts: 0,
            timeSpent: 0,
            hintsUsed: 0,
            lastAttempt: new Date(),
            correctAnswers: 0,
            totalQuestions: 0,
            accuracy: 0,
            improvement: 0
          })
        }
      }
      
      return exerciseProgress
      
    } catch (error) {
      console.error('Erro ao buscar progresso dos exercícios:', error)
      return []
    }
  }
  
  // Calcular analytics da turma
  static async calculateClassAnalytics(classId: string): Promise<ClassAnalytics | null> {
    try {
      const students = await this.getClassStudentsBasic(classId)
      
      if (students.length === 0) {
        return null
      }
      
      // Calcular métricas básicas
      const totalStudents = students.length
      const activeStudents = students.filter(s => 
        (Date.now() - s.lastActivity.getTime()) < 7 * 24 * 60 * 60 * 1000
      ).length
      
      const progressSum = students.reduce((sum, s) => sum + s.overallProgress, 0)
      const scoreSum = students.reduce((sum, s) => sum + s.totalNormalizedScore, 0)
      
      const averageProgress = Math.round(progressSum / totalStudents)
      const averageScore = Math.round(scoreSum / totalStudents)
      
      // Calcular outras métricas
      const completedModules = students.reduce((sum, s) => sum + s.completedModules, 0)
      const totalTimeSpent = students.reduce((sum, s) => sum + s.totalTimeSpent, 0)
      
      // Distribuição de progresso
      const progressDistribution = this.calculateProgressDistribution(students)
      
      // Estatísticas por módulo
      const moduleStats = await this.calculateModuleStats(classId)
      
      // Exercícios com mais dificuldade
      const difficultExercises = await this.identifyDifficultExercises(classId)
      
      // Métricas de engajamento
      const engagementMetrics = await this.calculateClassEngagement(classId)
      
      return {
        id: `analytics_${classId}_${Date.now()}`,
        classId,
        date: new Date(),
        totalStudents,
        activeStudents,
        averageProgress,
        averageScore,
        completedModules,
        totalTimeSpent,
        dailyActiveUsers: engagementMetrics.dailyActive,
        weeklyActiveUsers: engagementMetrics.weeklyActive,
        sessionDuration: engagementMetrics.averageSessionTime,
        retentionRate: engagementMetrics.retentionRate,
        progressDistribution,
        moduleStats,
        difficultExercises,
        engagementMetrics: {
          peakHours: engagementMetrics.peakHours,
          weeklyPattern: engagementMetrics.weeklyPattern,
          averageSessionsPerWeek: engagementMetrics.averageSessionsPerWeek,
          dropoffPoints: engagementMetrics.dropoffPoints
        }
      } as ClassAnalytics
      
    } catch (error) {
      console.error('Erro ao calcular analytics da turma:', error)
      return null
    }
  }
  
  // Remover estudante da turma
  static async removeStudentFromClass(
    classId: string, 
    studentId: string, 
    reason?: string
  ): Promise<boolean> {
    try {
      const batch = writeBatch(db)
      
      // Atualizar status da matrícula
      const enrollmentQuery = query(
        collection(db, 'class_enrollments'),
        where('classId', '==', classId),
        where('studentId', '==', studentId)
      )
      
      const enrollmentSnapshot = await getDocs(enrollmentQuery)
      
      if (!enrollmentSnapshot.empty) {
        const enrollmentDoc = enrollmentSnapshot.docs[0]
        batch.update(enrollmentDoc.ref, {
          status: 'removed',
          removedAt: Timestamp.now(),
          removalReason: reason
        })
      }
      
      // Log da ação
      const logRef = doc(collection(db, 'class_logs'))
      batch.set(logRef, {
        classId,
        action: 'student_removed',
        studentId,
        reason,
        timestamp: Timestamp.now()
      })
      
      await batch.commit()
      return true
      
    } catch (error) {
      console.error('Erro ao remover estudante:', error)
      return false
    }
  }
  
  // Atualizar configurações da turma
  static async updateClassSettings(
    classId: string, 
    settings: Partial<EnhancedClass>
  ): Promise<boolean> {
    try {
      const classRef = doc(db, 'classes', classId)
      
      await updateDoc(classRef, {
        ...settings,
        updatedAt: Timestamp.now()
      })
      
      return true
      
    } catch (error) {
      console.error('Erro ao atualizar configurações da turma:', error)
      return false
    }
  }
  
  // Exportar dados da turma
  static async exportClassData(
    classId: string, 
    format: 'csv' | 'excel' | 'pdf' = 'csv'
  ): Promise<ClassExportData> {
    try {
      const classInfo = await this.getEnhancedClassInfo(classId)
      const students = await this.getEnhancedClassStudents(classId)
      const analytics = await this.calculateClassAnalytics(classId)
      const rankings = await this.getClassRankings(classId)
      
      return {
        classInfo: classInfo!,
        students,
        analytics: analytics!,
        rankings: rankings!,
        exportDate: new Date(),
        format
      }
      
    } catch (error) {
      console.error('Erro ao exportar dados da turma:', error)
      throw error
    }
  }
  
  // Métodos auxiliares privados
  
  private static async getClassStudentsBasic(classId: string): Promise<any[]> {
    // Implementar busca básica de estudantes para cálculos
    return []
  }
  
  private static getDefaultClassSettings() {
    return {
      allowLateSubmissions: true,
      showRanking: true,
      enableCollaboration: false,
      modulesAvailable: modules.map(m => m.id),
      autoGrading: true,
      requireApproval: false
    }
  }
  
  private static applyFilters(
    students: EnhancedStudentOverview[], 
    filter: ClassFilter
  ): EnhancedStudentOverview[] {
    let filtered = [...students]
    
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(s => s.status === filter.status)
    }
    
    if (filter.progressRange) {
      filtered = filtered.filter(s => 
        s.overallProgress >= filter.progressRange!.min &&
        s.overallProgress <= filter.progressRange!.max
      )
    }
    
    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(s => 
        s.studentName.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search)
      )
    }
    
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filter.sortBy as keyof EnhancedStudentOverview] as any
        const bVal = b[filter.sortBy as keyof EnhancedStudentOverview] as any
        
        if (filter.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }
    
    return filtered
  }
  
  private static calculateClassRankings(
    students: EnhancedStudentOverview[]
  ): EnhancedStudentOverview[] {
    const sorted = [...students].sort((a, b) => b.totalNormalizedScore - a.totalNormalizedScore)
    
    return sorted.map((student, index) => ({
      ...student,
      classRank: index + 1
    }))
  }
  
  private static async calculateStudentEngagement(studentId: string) {
    // Implementar cálculo de métricas de engajamento
    return {
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageSessionTime: 0
    }
  }
  
  private static async getStudentBadges(studentId: string): Promise<string[]> {
    // Implementar busca de badges
    return []
  }
  
  private static async getStudentAchievements(studentId: string) {
    // Implementar busca de conquistas
    return []
  }
  
  private static calculateProgressDistribution(students: EnhancedStudentOverview[]) {
    const ranges = ['0-25%', '25-50%', '50-75%', '75-100%']
    return ranges.map(range => {
      const [min, max] = range.split('-').map(s => parseInt(s.replace('%', '')))
      const count = students.filter(s => s.overallProgress >= min && s.overallProgress < max).length
      return { range, count }
    })
  }
  
  private static async calculateModuleStats(classId: string) {
    // Implementar cálculo de estatísticas por módulo
    return []
  }
  
  private static async identifyDifficultExercises(classId: string) {
    // Implementar identificação de exercícios difíceis
    return []
  }
  
  private static async calculateClassEngagement(classId: string) {
    // Implementar cálculo de engagement da turma
    return {
      dailyActive: 0,
      weeklyActive: 0,
      averageSessionTime: 0,
      retentionRate: 0,
      peakHours: [],
      weeklyPattern: [],
      averageSessionsPerWeek: 0,
      dropoffPoints: []
    }
  }
  
  private static async getClassRankings(classId: string) {
    // Implementar busca de rankings
    return {
      classId,
      rankings: {
        overall: [],
        byModule: {},
        byEngagement: [],
        byImprovement: []
      },
      lastUpdated: new Date()
    }
  }
}

export default EnhancedClassService