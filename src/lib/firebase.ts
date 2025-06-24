import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Connect to emulators in development (optional)
// Uncomment and configure if you want to use Firebase emulators
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099')
//     connectFirestoreEmulator(db, 'localhost', 8080)
//   } catch (error) {
//     console.log('Firebase emulators not connected:', error)
//   }
// }

// Firebase data type definitions
export interface User {
  id: string
  email: string
  fullName?: string
  totalScore: number
  levelReached: number
  gamesCompleted: number
  createdAt: string
  updatedAt: string
}

export interface GameProgress {
  id: string
  userId: string
  gameId: number
  level: number
  score: number
  maxScore: number
  completed: boolean
  attempts: number
  bestTime?: number
  lastAttemptAt: string
  completedAt?: string
  createdAt: string
}

export interface Achievement {
  id: string
  userId: string
  achievementType: string
  title: string
  description: string
  icon: string
  points: number
  earnedAt: string
}

export interface Game {
  id: number
  title: string
  description: string
  category: 'descriptive' | 'inferential' | 'epidemiological' | 'visualization'
  difficultyLevel: number
  learningObjectives: string[]
  maxScore: number
  timeLimit?: number
  instructions: string
  createdAt: string
  updatedAt: string
}

export interface Dataset {
  id: string
  name: string
  description: string
  source: string
  data: Record<string, unknown>
  category: 'descriptive' | 'inferential' | 'epidemiological' | 'visualization'
  difficultyLevel: number
  variables: string[]
  sampleSize: number
  createdAt: string
}

export interface GameSession {
  id: string
  userId: string
  gameId: number
  startTime: string
  endTime?: string
  score: number
  completed: boolean
  sessionData: Record<string, unknown>
  answers: Record<string, unknown>
  feedback: Record<string, unknown>
}

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  )
}

export default app
