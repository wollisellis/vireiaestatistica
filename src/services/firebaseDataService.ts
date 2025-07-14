import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db, handleFirestoreError, retryFirestoreOperation } from '@/lib/firebase'

// Types for Firebase data
export interface FirebaseUser {
  id: string
  email: string
  fullName: string
  role: 'professor' | 'student'
  anonymousId: string
  institutionId: string
  totalScore: number
  levelReached: number
  gamesCompleted: number
  collaborationHistory: string[]
  preferredPartners: string[]
  achievements: string[]
  createdAt: string
  updatedAt: string
}

export interface GameProgress {
  id: string
  userId: string
  gameId: number
  level: number
  score: number
  completed: boolean
  attempts: number
  bestTime: number
  completedAt: string
  createdAt: string
}

export interface Course {
  id: string
  name: string
  code: string
  professorId: string
  students: string[]
  modules: number[]
  createdAt: string
  updatedAt: string
}

export interface ClassAnalytics {
  totalStudents: number
  activeStudents: number
  averageProgress: number
  completionRates: {
    moduleId: number
    moduleName: string
    completionRate: number
    averageScore: number
    isLocked: boolean
  }[]
}

// User Management
export const createUserProfile = async (userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!db) throw new Error('Firebase not configured')
  
  const userDoc = {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  const docRef = await addDoc(collection(db, 'users'), userDoc)
  return docRef.id
}

export const getUserProfile = async (userId: string): Promise<FirebaseUser | null> => {
  if (!db) throw new Error('Firebase not configured')

  try {
    const docSnap = await retryFirestoreOperation(async () => {
      const docRef = doc(db, 'users', userId)
      return await getDoc(docRef)
    })

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      } as FirebaseUser
    }

    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw new Error(handleFirestoreError(error))
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<FirebaseUser>) => {
  if (!db) throw new Error('Firebase not configured')
  
  const docRef = doc(db, 'users', userId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  })
}

// Game Progress Management
export const saveGameProgress = async (progressData: Omit<GameProgress, 'id' | 'createdAt'>) => {
  if (!db) throw new Error('Firebase not configured')
  
  const progressDoc = {
    ...progressData,
    createdAt: Timestamp.now()
  }
  
  const docRef = await addDoc(collection(db, 'gameProgress'), progressDoc)
  return docRef.id
}

export const getUserGameProgress = async (userId: string): Promise<GameProgress[]> => {
  if (!db) throw new Error('Firebase not configured')

  try {
    const querySnapshot = await retryFirestoreOperation(async () => {
      const q = query(
        collection(db, 'gameProgress'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      return await getDocs(q)
    })

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || doc.data().completedAt,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    })) as GameProgress[]
  } catch (error) {
    console.error('Error getting user game progress:', error)
    throw new Error(handleFirestoreError(error))
  }
}

// Course Management
export const createCourse = async (courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (!db) throw new Error('Firebase not configured')
  
  const courseDoc = {
    ...courseData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
  
  const docRef = await addDoc(collection(db, 'courses'), courseDoc)
  return docRef.id
}

export const getProfessorCourses = async (professorId: string): Promise<Course[]> => {
  if (!db) throw new Error('Firebase not configured')

  try {
    const querySnapshot = await retryFirestoreOperation(async () => {
      const q = query(
        collection(db, 'courses'),
        where('professorId', '==', professorId)
      )
      return await getDocs(q)
    })

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    })) as Course[]
  } catch (error) {
    console.error('Error getting professor courses:', error)
    throw new Error(handleFirestoreError(error))
  }
}

// Analytics and Reporting
export const getClassAnalytics = async (professorId: string): Promise<ClassAnalytics> => {
  if (!db) throw new Error('Firebase not configured')
  
  // Get professor's courses
  const courses = await getProfessorCourses(professorId)
  const allStudentIds = courses.flatMap(course => course.students)
  
  // Get student progress data
  const progressPromises = allStudentIds.map(studentId => getUserGameProgress(studentId))
  const allProgress = (await Promise.all(progressPromises)).flat()
  
  // Calculate analytics
  const totalStudents = allStudentIds.length
  const activeStudents = new Set(allProgress.map(p => p.userId)).size
  
  // Calculate module completion rates
  const moduleStats = [1, 2, 3, 4].map(moduleId => {
    const moduleProgress = allProgress.filter(p => p.gameId === moduleId)
    const completedCount = moduleProgress.filter(p => p.completed).length
    const totalScores = moduleProgress.map(p => p.score)
    const averageScore = totalScores.length > 0 
      ? totalScores.reduce((a, b) => a + b, 0) / totalScores.length 
      : 0
    
    return {
      moduleId,
      moduleName: getModuleName(moduleId),
      completionRate: totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0,
      averageScore: Math.round(averageScore),
      isLocked: false // TODO: Implement module locking logic
    }
  })
  
  const averageProgress = moduleStats.reduce((sum, module) => sum + module.completionRate, 0) / moduleStats.length
  
  return {
    totalStudents,
    activeStudents,
    averageProgress: Math.round(averageProgress),
    completionRates: moduleStats
  }
}

// Helper function to get module names
const getModuleName = (moduleId: number): string => {
  const moduleNames = {
    1: 'Indicadores Antropométricos',
    2: 'Indicadores Clínicos e Bioquímicos',
    3: 'Fatores Socioeconômicos',
    4: 'Curvas de Crescimento'
  }
  return moduleNames[moduleId as keyof typeof moduleNames] || `Módulo ${moduleId}`
}

// Real-time data subscriptions
export const subscribeToUserProgress = (userId: string, callback: (progress: GameProgress[]) => void) => {
  if (!db) throw new Error('Firebase not configured')
  
  const q = query(
    collection(db, 'gameProgress'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (querySnapshot) => {
    const progress = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completedAt: doc.data().completedAt?.toDate?.()?.toISOString() || doc.data().completedAt,
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
    })) as GameProgress[]
    
    callback(progress)
  })
}

// Enrollment functions
export const enrollStudentInCourse = async (studentId: string, courseCode: string) => {
  if (!db) throw new Error('Firebase not configured')
  
  // Find course by code
  const q = query(collection(db, 'courses'), where('code', '==', courseCode))
  const querySnapshot = await getDocs(q)
  
  if (querySnapshot.empty) {
    throw new Error('Course not found')
  }
  
  const courseDoc = querySnapshot.docs[0]
  const courseData = courseDoc.data() as Course
  
  // Add student to course if not already enrolled
  if (!courseData.students.includes(studentId)) {
    await updateDoc(courseDoc.ref, {
      students: [...courseData.students, studentId],
      updatedAt: Timestamp.now()
    })
  }
}
