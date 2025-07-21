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
          (Date.now() - this.getLastActivityTimestamp(s.lastActivity)) < 7 * 24 * 60 * 60 * 1000).length,
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
      // Validar parâmetros
      if (!classId) {
        console.warn('ClassId não fornecido para getEnhancedClassStudents')
        return []
      }

      // Buscar estudantes na coleção 'classStudents' (usada pelo ClassInviteService)
      const studentsQuery = query(
        collection(db, 'classStudents'),
        where('status', '==', 'active')
      )

      const studentsSnapshot = await getDocs(studentsQuery)
      const students: EnhancedStudentOverview[] = []

      console.log(`[EnhancedClassService] Buscando estudantes para turma: ${classId}`)
      console.log(`[EnhancedClassService] Total de documentos encontrados: ${studentsSnapshot.docs.length}`)

      // Filtrar estudantes desta turma específica
      for (const doc of studentsSnapshot.docs) {
        const studentData = doc.data()
        const docId = doc.id

        console.log(`[EnhancedClassService] Verificando documento: ${docId}`)
        console.log(`[EnhancedClassService] Dados do estudante:`, studentData)

        // Verificar se o documento pertence à turma específica
        if (docId.startsWith(`${classId}_`)) {
          console.log(`[EnhancedClassService] ✅ Documento pertence à turma ${classId}`)
          
          // Buscar dados detalhados do estudante
          const studentProgress = await this.getStudentDetailedProgress(
            studentData.studentId,
            classId
          )

          if (studentProgress) {
            console.log(`[EnhancedClassService] ✅ Progresso do estudante encontrado:`, studentProgress)
            students.push(studentProgress)
          } else {
            console.log(`[EnhancedClassService] ❌ Não foi possível obter progresso do estudante ${studentData.studentId}`)
          }
        } else {
          console.log(`[EnhancedClassService] ❌ Documento ${docId} não pertence à turma ${classId}`)
        }
      }

      console.log(`[EnhancedClassService] Total de estudantes encontrados para a turma: ${students.length}`)

      // Aplicar filtros
      let filteredStudents = students || []

      if (filter && filteredStudents.length > 0) {
        filteredStudents = this.applyFilters(filteredStudents, filter)
      }

      // Calcular rankings
      if (filteredStudents.length > 0) {
        filteredStudents = this.calculateClassRankings(filteredStudents)
      }

      return filteredStudents || []

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
      
      // Buscar dados de matrícula na coleção 'classStudents'
      const enrollmentDoc = await getDoc(doc(db, 'classStudents', `${classId}_${studentId}`))
      if (!enrollmentDoc.exists()) return null
      
      const enrollmentData = enrollmentDoc.data()
      
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
        studentName: userData.fullName || userData.name || enrollmentData.studentName || userData.email,
        email: userData.email || enrollmentData.email || enrollmentData.studentEmail,
        avatarUrl: userData.avatarUrl,
        enrolledAt: enrollmentData.enrolledAt?.toDate() || enrollmentData.registeredAt?.toDate() || new Date(),
        lastActivity: userData.lastActivity?.toDate() || enrollmentData.enrolledAt?.toDate() || new Date(),
        status: enrollmentData.status || 'active',
        role: 'student',
        
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
        (Date.now() - this.getLastActivityTimestamp(s.lastActivity)) < 7 * 24 * 60 * 60 * 1000
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
  
  // Função utilitária para converter lastActivity para timestamp
  private static getLastActivityTimestamp(lastActivity: any): number {
    if (!lastActivity) {
      return Date.now()
    }
    
    // Se é um objeto Date
    if (lastActivity instanceof Date) {
      return lastActivity.getTime()
    }
    
    // Se é um Timestamp do Firebase
    if (lastActivity.toDate && typeof lastActivity.toDate === 'function') {
      return lastActivity.toDate().getTime()
    }
    
    // Se é um Timestamp do Firebase (formato alternativo)
    if (lastActivity.seconds) {
      return lastActivity.seconds * 1000
    }
    
    // Se é um string de data
    if (typeof lastActivity === 'string') {
      return new Date(lastActivity).getTime()
    }
    
    // Se é um número (timestamp)
    if (typeof lastActivity === 'number') {
      return lastActivity
    }
    
    // Fallback para agora
    return Date.now()
  }

  private static async getClassStudentsBasic(classId: string): Promise<any[]> {
    try {
      // Validar parâmetros
      if (!classId) {
        console.warn('ClassId não fornecido para getClassStudentsBasic')
        return []
      }

      // Buscar estudantes na coleção 'classStudents' (usada pelo ClassInviteService)
      const studentsQuery = query(
        collection(db, 'classStudents'),
        where('status', '==', 'active')
      )

      const studentsSnapshot = await getDocs(studentsQuery)
      const students: any[] = []

      console.log(`[getClassStudentsBasic] Buscando estudantes básicos para turma: ${classId}`)
      console.log(`[getClassStudentsBasic] Total de documentos encontrados: ${studentsSnapshot.docs.length}`)

      // Filtrar estudantes desta turma específica
      for (const doc of studentsSnapshot.docs) {
        const studentData = doc.data()
        const docId = doc.id

        console.log(`[getClassStudentsBasic] Verificando documento: ${docId}`)

        // Verificar se o documento pertence à turma específica e se studentData é válido
        if (docId.startsWith(`${classId}_`) && studentData) {
          console.log(`[getClassStudentsBasic] ✅ Documento pertence à turma ${classId}`)
          
          const lastActivityTimestamp = this.getLastActivityTimestamp(
            studentData.lastActivity || studentData.enrolledAt
          )
          
          students.push({
            studentId: studentData.studentId || '',
            studentName: studentData.studentName || studentData.name || 'Usuário Anônimo',
            email: studentData.email || studentData.studentEmail || '',
            status: studentData.status || 'active',
            lastActivity: { getTime: () => lastActivityTimestamp }, // Wrapper compatível
            overallProgress: 0, // Será calculado
            totalNormalizedScore: 0, // Será calculado
            completedModules: 0 // Será calculado
          })
        } else {
          console.log(`[getClassStudentsBasic] ❌ Documento ${docId} não pertence à turma ${classId} ou dados inválidos`)
        }
      }

      console.log(`[getClassStudentsBasic] Total de estudantes básicos encontrados: ${students.length}`)
      return students || []
    } catch (error) {
      console.error('Erro ao buscar estudantes básicos da turma:', error)
      return []
    }
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
    // Verificar se students é um array válido
    if (!Array.isArray(students)) {
      console.warn('applyFilters: students não é um array válido', students)
      return []
    }

    let filtered = [...students]

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(s => s && s.status === filter.status)
    }

    if (filter.progressRange) {
      filtered = filtered.filter(s =>
        s &&
        typeof s.overallProgress === 'number' &&
        s.overallProgress >= filter.progressRange!.min &&
        s.overallProgress <= filter.progressRange!.max
      )
    }

    if (filter.search) {
      const search = filter.search.toLowerCase()
      filtered = filtered.filter(s =>
        s &&
        ((s.studentName && s.studentName.toLowerCase().includes(search)) ||
         (s.email && s.email.toLowerCase().includes(search)))
      )
    }

    if (filter.sortBy) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0

        const aVal = a[filter.sortBy as keyof EnhancedStudentOverview] as any
        const bVal = b[filter.sortBy as keyof EnhancedStudentOverview] as any

        if (filter.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1
        }
        return aVal > bVal ? 1 : -1
      })
    }

    return filtered || []
  }
  
  private static calculateClassRankings(
    students: EnhancedStudentOverview[]
  ): EnhancedStudentOverview[] {
    // Verificar se students é um array válido
    if (!Array.isArray(students) || students.length === 0) {
      console.warn('calculateClassRankings: students não é um array válido ou está vazio', students)
      return []
    }

    const sorted = [...students].sort((a, b) => {
      const scoreA = a?.totalNormalizedScore || 0
      const scoreB = b?.totalNormalizedScore || 0
      return scoreB - scoreA
    })

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
  
  // Métodos alias para compatibilidade com as páginas
  static async getClassById(classId: string) {
    return this.getEnhancedClassInfo(classId)
  }
  
  static async getClassStudents(classId: string) {
    return this.getEnhancedClassStudents(classId)
  }
  
  static async getClassAnalytics(classId: string) {
    return this.calculateClassAnalytics(classId)
  }
  
  static async getStudentDetail(classId: string, studentId: string) {
    try {
      // Buscar dados do estudante na turma na coleção 'classStudents'
      const enrollmentDoc = await getDoc(doc(db, 'classStudents', `${classId}_${studentId}`))
      
      if (!enrollmentDoc.exists()) {
        return null
      }
      
      const enrollment = enrollmentDoc.data()
      
      // Buscar dados do usuário
      const userDoc = await getDoc(doc(db, 'users', studentId))
      if (!userDoc.exists()) {
        return null
      }
      
      const userData = userDoc.data()
      
      // Buscar progresso do estudante
      const progressDoc = await getDoc(doc(db, 'user_progress', studentId))
      const progressData = progressDoc.exists() ? progressDoc.data() : {}
      
      // Buscar dados da turma
      const classData = await this.getClassById(classId)
      
      // Calcular estatísticas
      const totalScore = Object.values(progressData.gameProgress || {}).reduce((sum: number, game: any) => sum + (game.score || 0), 0)
      const completedModules = Object.values(progressData.gameProgress || {}).filter((game: any) => game.completed).length
      
      return {
        student: {
          id: studentId,
          name: userData.name || userData.fullName || enrollment.studentName || 'Usuário Anônimo',
          email: userData.email || enrollment.email || enrollment.studentEmail,
          status: enrollment.status || 'active',
          enrolledAt: enrollment.enrolledAt?.toDate() || enrollment.registeredAt?.toDate() || new Date(),
          totalScore,
          completedModules,
          lastActivity: userData.lastActivity?.toDate()
        },
        progress: {
          modules: progressData.gameProgress || {},
          overallProgress: (completedModules / 4) * 100,
          totalScore
        },
        analytics: {
          totalTimeSpent: progressData.totalTimeSpent || 0,
          averageScore: totalScore / Math.max(completedModules, 1),
          correctAnswers: progressData.correctAnswers || 0,
          totalAttempts: progressData.totalAttempts || 0,
          hintsUsed: progressData.hintsUsed || 0,
          studySessions: progressData.studySessions || 0,
          classRank: 1, // Calcular ranking real
          preferredStudyTime: 'Manhã',
          mostActiveDay: 'Segunda-feira',
          avgSessionTime: 45,
          consistencyScore: 0.8
        },
        classData,
        classAverages: {
          avgScore: 75,
          avgProgress: 60,
          avgTimeSpent: 120
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do estudante:', error)
      return null
    }
  }
  
  static async getAdvancedAnalytics(classId: string, period: string = '30d') {
    try {
      const classInfo = await this.getClassById(classId)
      const analytics = await this.getClassAnalytics(classId)
      
      // Gerar dados mockados para demonstração
      const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
      
      const timeSeriesData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        activeStudents: Math.floor(Math.random() * 20) + 10,
        avgScore: Math.floor(Math.random() * 40) + 60,
        completedExercises: Math.floor(Math.random() * 15) + 5,
        timeSpent: Math.floor(Math.random() * 120) + 60
      }))
      
      const modulePerformance = [
        { module: 'Módulo 1', avgScore: 85, completionRate: 95, avgTimeSpent: 45, difficultyScore: 3, studentCount: 28 },
        { module: 'Módulo 2', avgScore: 78, completionRate: 88, avgTimeSpent: 52, difficultyScore: 4, studentCount: 25 },
        { module: 'Módulo 3', avgScore: 72, completionRate: 75, avgTimeSpent: 58, difficultyScore: 5, studentCount: 21 },
        { module: 'Módulo 4', avgScore: 80, completionRate: 68, avgTimeSpent: 62, difficultyScore: 4, studentCount: 19 }
      ]
      
      const studentDistribution = [
        { scoreRange: '90-100', count: 5, percentage: 17 },
        { scoreRange: '80-89', count: 8, percentage: 27 },
        { scoreRange: '70-79', count: 10, percentage: 33 },
        { scoreRange: '60-69', count: 5, percentage: 17 },
        { scoreRange: '0-59', count: 2, percentage: 6 }
      ]
      
      const insights = [
        {
          type: 'success' as const,
          title: 'Excelente Engajamento',
          description: 'A turma apresenta 95% de taxa de participação ativa nos últimos 7 dias.',
          metric: 95,
          trend: 'up' as const
        },
        {
          type: 'warning' as const,
          title: 'Módulo 3 com Dificuldades',
          description: 'Taxa de conclusão 20% menor que a média. Considere revisão do conteúdo.',
          metric: 75,
          trend: 'down' as const
        },
        {
          type: 'info' as const,
          title: 'Horário de Pico',
          description: 'Maior atividade entre 14h-16h. Ideal para sessões ao vivo.',
          trend: 'stable' as const
        }
      ]
      
      return {
        classInfo,
        analytics,
        timeSeriesData,
        modulePerformance,
        engagementMetrics: {
          dailyActiveUsers: 15,
          weeklyActiveUsers: 28,
          avgSessionTime: 35,
          retentionRate: 92,
          dropoffPoints: ['Módulo 3 - Exercício 2', 'Módulo 4 - Introdução']
        },
        activityHeatmap: [],
        studentDistribution,
        insights
      }
    } catch (error) {
      console.error('Erro ao buscar analytics avançados:', error)
      return null
    }
  }
  
  static async removeStudentFromClass(classId: string, studentId: string) {
    try {
      // Buscar o enrollment na coleção 'classStudents'
      const enrollmentRef = doc(db, 'classStudents', `${classId}_${studentId}`)
      const enrollmentDoc = await getDoc(enrollmentRef)
      
      if (enrollmentDoc.exists()) {
        await updateDoc(enrollmentRef, {
          status: 'removed',
          removedAt: Timestamp.now()
        })
      }
      
      return true
    } catch (error) {
      console.error('Erro ao remover estudante:', error)
      throw error
    }
  }
}

export default EnhancedClassService

// Exportação nomeada para permitir destructuring
export const enhancedClassService = EnhancedClassService