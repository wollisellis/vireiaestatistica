import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, User, isFirebaseConfigured } from '@/lib/firebase'

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!auth || !db || !isFirebaseConfigured()) {
      throw new Error('Firebase not configured')
    }

    try {
      setLoading(true)

      // Create user with email and password
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: fullName
      })

      // Create user profile in Firestore
      const userProfile: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName,
        totalScore: 0,
        levelReached: 1,
        gamesCompleted: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      return { data: { user: firebaseUser }, error: null }
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
      return { error: null }
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      return { error: { message: (error as Error).message } }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
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
            totalScore: data.totalScore || 0,
            levelReached: data.levelReached || 1,
            gamesCompleted: data.gamesCompleted || 0,
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
