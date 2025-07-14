import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// Helper function to check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'demo-api-key' &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'demo-project' &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('Demo')
  )

  console.log('🔥 Firebase Configuration Check:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?
      `${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...` : 'MISSING',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    isConfigured,
    environment: process.env.NODE_ENV
  })

  return isConfigured
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
}

// Initialize Firebase only if configured or use mock
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  } else {
    // Mock Firebase for development/demo
    console.warn('Firebase not configured, using mock mode')
  }
} catch (error) {
  console.warn('Firebase initialization failed, using mock mode:', error)
}

export { auth, db }

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
  fullName: string
  role: 'professor' | 'student'
  anonymousId?: string // For students only
  institutionId: string
  totalScore: number
  levelReached: number
  gamesCompleted: number
  collaborationHistory: CollaborationRecord[]
  preferredPartners: string[] // Student IDs
  achievements: string[]
  createdAt: string
  updatedAt: string
  authProvider?: 'email' | 'google' // Track authentication method
}

export interface CollaborationRecord {
  sessionId: string
  partnerId: string
  partnerName: string
  caseStudyId: string
  score: number
  completedAt: string
  collaborationRating: number
}

export interface Course {
  id: string
  code: string // "NT600"
  title: string
  description: string
  professorId: string
  studentIds: string[]
  moduleSettings: ModuleSettings[]
  createdAt: string
  updatedAt: string
}

export interface ModuleSettings {
  moduleId: number
  isLocked: boolean
  unlockedAt?: string
  prerequisites: number[]
}

export interface GameProgress {
  id: string
  userId: string
  gameId: number
  level: number
  score: number
  maxScore: number
  normalizedScore: number
  completed: boolean
  attempts: number
  bestTime?: number
  lastAttemptAt: string
  completedAt?: string
  difficulty: string
  isPersonalBest: boolean
  isCollaborative?: boolean
  partnerId?: string
  partnerName?: string
  collaborationNotes?: string[]
  createdAt: string
}

export interface Achievement {
  id: string
  userId: string
  achievementType: 'milestone' | 'performance' | 'engagement' | 'mastery' | 'collaboration'
  title: string
  description: string
  icon: string
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  criteria: AchievementCriteria
  earnedAt: string
}

export interface AchievementCriteria {
  trigger: 'score_threshold' | 'completion_time' | 'streak' | 'perfect_score' | 'collaboration'
  value: number
  gameId?: number
  moduleId?: number
}

export interface CollaborativeSession {
  id: string
  primaryStudentId: string
  partnerStudentId: string
  caseStudyId: string
  startedAt: string
  completedAt?: string
  sharedScore: number
  collaborationNotes: string[]
  discussionPrompts: DiscussionPrompt[]
  status: 'active' | 'completed' | 'abandoned'
}

export interface DiscussionPrompt {
  id: string
  text: string
  phase: 'analysis' | 'hypothesis' | 'decision' | 'reflection'
  completed: boolean
}

export interface LeaderboardEntry {
  userId: string
  anonymousId: string
  totalScore: number
  gamesCompleted: number
  averageScore: number
  lastUpdated: string
  rank: number
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

// RBAC Permissions Matrix
export const RBAC_PERMISSIONS = {
  professor: {
    modules: ['create', 'read', 'update', 'delete', 'unlock', 'lock'],
    students: ['read', 'monitor', 'message'],
    collaboration: ['view_all_sessions', 'moderate', 'assign_partners'],
    analytics: ['view_class', 'export_data', 'generate_reports'],
    content: ['create_cases', 'edit_cases', 'manage_questions']
  },
  student: {
    modules: ['read_unlocked'],
    collaboration: ['create_session', 'join_session', 'invite_partner'],
    progress: ['read_own', 'update_own'],
    achievements: ['view_own', 'share_public']
  }
} as const

// Utility functions
export const generateAnonymousId = (): string => {
  return `Aluno${Math.floor(Math.random() * 90000) + 10000}`
}

export const hasPermission = (
  userRole: 'professor' | 'student',
  resource: keyof typeof RBAC_PERMISSIONS.professor,
  action: string
): boolean => {
  const permissions = RBAC_PERMISSIONS[userRole]
  return permissions[resource]?.includes(action) || false
}

export default app
