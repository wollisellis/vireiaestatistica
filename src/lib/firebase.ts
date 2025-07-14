import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

// Helper function to check if Firebase is configured with real credentials
export const isFirebaseConfigured = (): boolean => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

  // Check if all required variables exist and are not placeholder values
  const isConfigured = !!(
    apiKey &&
    authDomain &&
    projectId &&
    appId &&
    !apiKey.includes('COLE_SUA') &&
    !apiKey.includes('SUA_API_KEY') &&
    !authDomain.includes('seu-projeto') &&
    !authDomain.includes('COLE_SEU') &&
    !projectId.includes('seu-projeto') &&
    !projectId.includes('COLE_SEU') &&
    !appId.includes('abcdef123456') &&
    !appId.includes('COLE_SEU')
  )

  const getConfigStatus = (value: string | undefined) => {
    if (!value) return 'MISSING'
    if (value.includes('COLE_SUA') || value.includes('SUA_API_KEY') ||
        value.includes('seu-projeto') || value.includes('COLE_SEU') ||
        value.includes('abcdef123456')) {
      return 'PLACEHOLDER'
    }
    return 'CONFIGURED'
  }

  console.log('🔥 Firebase Configuration Status:', {
    configured: isConfigured,
    apiKey: getConfigStatus(apiKey),
    authDomain: getConfigStatus(authDomain),
    projectId: getConfigStatus(projectId),
    appId: getConfigStatus(appId)
  })

  return isConfigured
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase only if credentials are properly configured
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

try {
  if (isFirebaseConfigured()) {
    console.log('🔥 Initializing Firebase with configured credentials...')
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    console.log('✅ Firebase initialized successfully!')
  } else {
    console.warn('⚠️ Firebase not configured - using fallback mode')
    console.warn('📝 To use Firebase, configure NEXT_PUBLIC_FIREBASE_* variables in .env.local')
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error)
  console.warn('🔄 Using fallback mode')
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
