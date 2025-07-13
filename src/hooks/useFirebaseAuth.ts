import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db, User, isFirebaseConfigured, generateAnonymousId } from '@/lib/firebase'

// Cookie management functions
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return

  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null

  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set authentication cookie when user is authenticated
        const token = await user.getIdToken()
        setCookie('auth-token', token, 7) // 7 days
        deleteCookie('guest-mode') // Remove guest mode if user logs in
      } else {
        // Remove authentication cookie when user logs out
        deleteCookie('auth-token')
      }

      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'professor' | 'student' = 'student',
    courseCode?: string
  ) => {
    if (!auth || !db || !isFirebaseConfigured()) {
      throw new Error('Firebase not configured')
    }

    try {
      setLoading(true)

      // Validate email domain for students (should be @dac.unicamp.br)
      if (role === 'student' && !email.endsWith('@dac.unicamp.br')) {
        throw new Error('Estudantes devem usar email institucional @dac.unicamp.br')
      }

      // Professors can use any valid email domain
      if (role === 'professor') {
        console.log('Professor registration with email:', email)
      }

      // Create user with email and password
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: fullName
      })

      // Generate anonymous ID for students
      const anonymousId = role === 'student' ? generateAnonymousId() : undefined

      // Create user profile in Firestore
      const userProfile: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName,
        role,
        anonymousId,
        institutionId: 'unicamp', // Default institution
        totalScore: 0,
        levelReached: 1,
        gamesCompleted: 0,
        collaborationHistory: [],
        preferredPartners: [],
        achievements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // If student with course code, enroll in course
      if (role === 'student' && courseCode) {
        await enrollStudentInCourse(firebaseUser.uid, courseCode)
      }

      return { data: { user: firebaseUser, profile: userProfile }, error: null }
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      return { data: null, error: { message: (error as Error).message } }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      return { data: { user }, error: null }
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      return { data: null, error: { message: (error as Error).message } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      // Clear authentication cookies
      deleteCookie('auth-token')
      deleteCookie('guest-mode')
      return { error: null }
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      return { error: { message: (error as Error).message } }
    }
  }

  const enableGuestMode = () => {
    setCookie('guest-mode', 'true', 1) // 1 day for guest mode
    deleteCookie('auth-token') // Remove any existing auth token
  }

  // Helper function to enroll student in course
  const enrollStudentInCourse = async (studentId: string, courseCode: string) => {
    if (!db) return

    try {
      // Find course by code
      const coursesRef = collection(db, 'courses')
      const q = query(coursesRef, where('code', '==', courseCode))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        throw new Error('Código do curso não encontrado')
      }

      const courseDoc = querySnapshot.docs[0]
      const courseData = courseDoc.data()

      // Add student to course
      const updatedStudentIds = [...(courseData.studentIds || []), studentId]
      await setDoc(courseDoc.ref, {
        ...courseData,
        studentIds: updatedStudentIds,
        updatedAt: serverTimestamp()
      }, { merge: true })

    } catch (error) {
      console.error('Error enrolling student in course:', error)
      throw error
    }
  }

  // Get user by email (for partner validation)
  const getUserByEmail = async (email: string) => {
    if (!db) return null

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const userDoc = querySnapshot.docs[0]
      return { id: userDoc.id, ...userDoc.data() } as User
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    enableGuestMode,
    getUserByEmail,
  }
}

export function useFirebaseProfile(userId: string) {
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfile({
            id: docSnap.id,
            email: data.email,
            fullName: data.fullName,
            role: data.role || 'student',
            anonymousId: data.anonymousId,
            institutionId: data.institutionId || 'unicamp',
            totalScore: data.totalScore || 0,
            levelReached: data.levelReached || 1,
            gamesCompleted: data.gamesCompleted || 0,
            collaborationHistory: data.collaborationHistory || [],
            preferredPartners: data.preferredPartners || [],
            achievements: data.achievements || [],
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates: Partial<User>) => {
    if (!userId) return { data: null, error: { message: 'No user ID' } }

    try {
      const docRef = doc(db, 'users', userId)
      await setDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true })

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      
      return { data: updates, error: null }
    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      return { data: null, error: { message: (error as Error).message } }
    }
  }

  return {
    profile,
    loading,
    updateProfile,
  }
}

interface GameProgressData {
  id: string
  userId: string
  gameId: number
  level: number
  score: number
  completed: boolean
  attempts: number
  bestTime?: number
  createdAt: string
}

export function useFirebaseGameProgress(userId: string) {
  const [progress, setProgress] = useState<GameProgressData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // For now, return mock data until we implement the full Firestore structure
    // This will be replaced with real Firestore queries
    const mockProgress = [
      {
        id: 'progress-1',
        userId,
        gameId: 1,
        level: 1,
        score: 85,
        completed: true,
        attempts: 2,
        bestTime: 120,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'progress-2',
        userId,
        gameId: 2,
        level: 2,
        score: 92,
        completed: true,
        attempts: 1,
        bestTime: 95,
        createdAt: new Date().toISOString(),
      },
    ]

    setTimeout(() => {
      setProgress(mockProgress)
      setLoading(false)
    }, 500)
  }, [userId])

  const updateProgress = async (gameId: number, score: number, completed: boolean) => {
    if (!userId) return { data: null, error: { message: 'No user ID' } }

    // This will be implemented with real Firestore operations
    const newProgress = {
      id: `progress-${Date.now()}`,
      userId,
      gameId,
      level: gameId,
      score,
      completed,
      attempts: 1,
      createdAt: new Date().toISOString(),
    }

    setProgress(prev => {
      const updated = prev.filter(p => p.gameId !== gameId)
      return [...updated, newProgress]
    })

    return { data: newProgress, error: null }
  }

  return {
    progress,
    loading,
    updateProgress,
  }
}
