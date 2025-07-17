// Serviço de Persistência no Firebase para Progresso de Módulos
// Created by Ellis Abhulime - UNICAMP

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  increment,
  arrayUnion,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { 
  StudentModuleProgress, 
  ModuleProgress, 
  ExerciseProgress 
} from '@/lib/moduleProgressSystem'

export interface FirebaseModuleProgress extends Omit<StudentModuleProgress, 'lastActivity'> {
  lastActivity: any // Firestore Timestamp
  createdAt: any
  updatedAt: any
}

export class ModuleProgressService {
  private static readonly COLLECTION = 'module_progress'
  private static readonly RANKINGS_COLLECTION = 'rankings'
  private static readonly EXERCISE_ATTEMPTS_COLLECTION = 'exercise_attempts'

  // Salvar/Atualizar progresso completo do estudante
  static async saveStudentProgress(progress: StudentModuleProgress): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, progress.studentId)
      
      const firebaseData: Partial<FirebaseModuleProgress> = {
        ...progress,
        lastActivity: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Se é novo registro, adicionar createdAt
      const existingDoc = await getDoc(docRef)
      if (!existingDoc.exists()) {
        firebaseData.createdAt = serverTimestamp()
      }

      await setDoc(docRef, firebaseData, { merge: true })
      console.log('Progresso salvo com sucesso para:', progress.studentId)
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
      throw error
    }
  }

  // Carregar progresso do estudante
  static async loadStudentProgress(studentId: string): Promise<StudentModuleProgress | null> {
    try {
      const docRef = doc(db, this.COLLECTION, studentId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as FirebaseModuleProgress
        
        // Converter Firestore Timestamp para Date
        return {
          ...data,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          modules: data.modules.map(module => ({
            ...module,
            lastActivityAt: module.lastActivityAt || new Date(),
            startedAt: module.startedAt || undefined,
            completedAt: module.completedAt || undefined,
            exercises: module.exercises.map(exercise => ({
              ...exercise,
              lastAttemptAt: exercise.lastAttemptAt || new Date(),
              completedAt: exercise.completedAt || undefined
            }))
          }))
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
      return null
    }
  }

  // Atualizar progresso de um exercício específico
  static async updateExerciseProgress(
    studentId: string,
    moduleId: string,
    exerciseProgress: ExerciseProgress
  ): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      // 1. Atualizar no documento principal
      const progressRef = doc(db, this.COLLECTION, studentId)
      
      // Buscar progresso atual
      const currentDoc = await getDoc(progressRef)
      if (currentDoc.exists()) {
        const currentData = currentDoc.data() as FirebaseModuleProgress
        
        // Encontrar e atualizar o módulo
        const updatedModules = currentData.modules.map(module => {
          if (module.moduleId === moduleId) {
            const updatedExercises = module.exercises.map(exercise => 
              exercise.exerciseId === exerciseProgress.exerciseId 
                ? exerciseProgress 
                : exercise
            )
            return { ...module, exercises: updatedExercises }
          }
          return module
        })
        
        batch.update(progressRef, {
          modules: updatedModules,
          updatedAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        })
      }

      // 2. Salvar tentativa individual para análise detalhada
      const attemptRef = doc(collection(db, this.EXERCISE_ATTEMPTS_COLLECTION))
      batch.set(attemptRef, {
        studentId,
        moduleId,
        exerciseId: exerciseProgress.exerciseId,
        score: exerciseProgress.score,
        normalizedScore: exerciseProgress.normalizedScore,
        timeSpent: exerciseProgress.timeSpent,
        attempt: exerciseProgress.attempts,
        completed: exerciseProgress.completed,
        questionMetrics: exerciseProgress.questionMetrics || [],
        timestamp: serverTimestamp()
      })

      await batch.commit()
      console.log('Progresso do exercício atualizado:', exerciseProgress.exerciseId)
    } catch (error) {
      console.error('Erro ao atualizar progresso do exercício:', error)
      throw error
    }
  }

  // Atualizar progresso de um módulo específico
  static async updateModuleProgress(
    studentId: string,
    moduleProgress: ModuleProgress
  ): Promise<void> {
    try {
      const progressRef = doc(db, this.COLLECTION, studentId)
      
      // Buscar progresso atual
      const currentDoc = await getDoc(progressRef)
      if (currentDoc.exists()) {
        const currentData = currentDoc.data() as FirebaseModuleProgress
        
        // Atualizar o módulo específico
        const updatedModules = currentData.modules.map(module => 
          module.moduleId === moduleProgress.moduleId ? moduleProgress : module
        )
        
        // Se módulo não existe, adicionar
        if (!currentData.modules.find(m => m.moduleId === moduleProgress.moduleId)) {
          updatedModules.push(moduleProgress)
        }
        
        await updateDoc(progressRef, {
          modules: updatedModules,
          updatedAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        })
      } else {
        // Criar novo documento se não existe
        await setDoc(progressRef, {
          studentId,
          modules: [moduleProgress],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastActivity: serverTimestamp()
        })
      }
      
      console.log('Progresso do módulo atualizado:', moduleProgress.moduleId)
    } catch (error) {
      console.error('Erro ao atualizar progresso do módulo:', error)
      throw error
    }
  }

  // Marcar módulo como concluído
  static async completeModule(studentId: string, moduleId: string): Promise<void> {
    try {
      const progressRef = doc(db, this.COLLECTION, studentId)
      
      await updateDoc(progressRef, {
        [`modules.${moduleId}.isCompleted`]: true,
        [`modules.${moduleId}.completedAt`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      })

      // Registrar conquista de conclusão
      await this.recordAchievement(studentId, `module_${moduleId}_completed`, {
        moduleId,
        completedAt: new Date(),
        type: 'module_completion'
      })
      
      console.log('Módulo marcado como concluído:', moduleId)
    } catch (error) {
      console.error('Erro ao marcar módulo como concluído:', error)
      throw error
    }
  }

  // Desbloquear próximo módulo
  static async unlockModule(studentId: string, moduleId: string): Promise<void> {
    try {
      const progressRef = doc(db, this.COLLECTION, studentId)
      
      await updateDoc(progressRef, {
        [`modules.${moduleId}.isUnlocked`]: true,
        updatedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      })

      console.log('Módulo desbloqueado:', moduleId)
    } catch (error) {
      console.error('Erro ao desbloquear módulo:', error)
      throw error
    }
  }

  // Obter ranking por pontuação total
  static async getRankingByScore(limit: number = 10): Promise<StudentModuleProgress[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('totalNormalizedScore', 'desc'),
        orderBy('overallProgress', 'desc'),
        limit(limit)
      )
      
      const querySnapshot = await getDocs(q)
      const rankings: StudentModuleProgress[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseModuleProgress
        rankings.push({
          ...data,
          lastActivity: data.lastActivity?.toDate() || new Date()
        })
      })
      
      return rankings
    } catch (error) {
      console.error('Erro ao obter ranking:', error)
      return []
    }
  }

  // Obter estatísticas do progresso dos estudantes
  static async getProgressStats(): Promise<{
    totalStudents: number
    activeStudents: number
    averageProgress: number
    completionRates: { [moduleId: string]: number }
  }> {
    try {
      const q = query(collection(db, this.COLLECTION))
      const querySnapshot = await getDocs(q)
      
      let totalStudents = 0
      let activeStudents = 0
      let totalProgress = 0
      const moduleCompletions: { [moduleId: string]: number } = {}
      
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseModuleProgress
        totalStudents++
        totalProgress += data.overallProgress || 0
        
        // Verificar se está ativo
        const lastActivity = data.lastActivity?.toDate() || new Date(0)
        if (lastActivity > oneWeekAgo) {
          activeStudents++
        }
        
        // Contar conclusões por módulo
        data.modules?.forEach(module => {
          if (module.isCompleted) {
            moduleCompletions[module.moduleId] = (moduleCompletions[module.moduleId] || 0) + 1
          }
        })
      })
      
      const averageProgress = totalStudents > 0 ? totalProgress / totalStudents : 0
      
      // Calcular taxas de conclusão percentuais
      const completionRates: { [moduleId: string]: number } = {}
      Object.keys(moduleCompletions).forEach(moduleId => {
        completionRates[moduleId] = Math.round((moduleCompletions[moduleId] / totalStudents) * 100)
      })
      
      return {
        totalStudents,
        activeStudents,
        averageProgress: Math.round(averageProgress),
        completionRates
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return {
        totalStudents: 0,
        activeStudents: 0,
        averageProgress: 0,
        completionRates: {}
      }
    }
  }

  // Registrar conquista/achievement
  private static async recordAchievement(
    studentId: string, 
    achievementId: string, 
    metadata: any
  ): Promise<void> {
    try {
      const achievementRef = doc(collection(db, 'achievements'))
      await setDoc(achievementRef, {
        studentId,
        achievementId,
        metadata,
        timestamp: serverTimestamp()
      })
    } catch (error) {
      console.error('Erro ao registrar conquista:', error)
    }
  }

  // Obter histórico de tentativas de um exercício
  static async getExerciseAttempts(
    studentId: string, 
    exerciseId: string
  ): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.EXERCISE_ATTEMPTS_COLLECTION),
        where('studentId', '==', studentId),
        where('exerciseId', '==', exerciseId),
        orderBy('timestamp', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const attempts: any[] = []
      
      querySnapshot.forEach((doc) => {
        attempts.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return attempts
    } catch (error) {
      console.error('Erro ao obter histórico de tentativas:', error)
      return []
    }
  }

  // Método para sincronização offline
  static async syncOfflineData(offlineData: StudentModuleProgress[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      offlineData.forEach(progress => {
        const docRef = doc(db, this.COLLECTION, progress.studentId)
        batch.set(docRef, {
          ...progress,
          lastActivity: serverTimestamp(),
          updatedAt: serverTimestamp(),
          syncedAt: serverTimestamp()
        }, { merge: true })
      })
      
      await batch.commit()
      console.log('Dados offline sincronizados com sucesso')
    } catch (error) {
      console.error('Erro na sincronização offline:', error)
      throw error
    }
  }
}

export default ModuleProgressService