import { useFirebaseAuth, useFirebaseProfile, useFirebaseGameProgress } from './useFirebaseAuth'
import { useMockAuth, useMockGameProgress, useMockProfile } from './useMockAuth'
import { isFirebaseConfigured } from '@/lib/firebase'

export function useAuth() {
  const firebaseAuth = useFirebaseAuth()
  const mockAuth = useMockAuth()

  // Use Firebase auth if configured, otherwise fall back to mock auth
  if (isFirebaseConfigured()) {
    return firebaseAuth
  }

  return mockAuth
}

export function useGameProgress(userId: string) {
  const firebaseProgress = useFirebaseGameProgress(userId)
  const mockProgress = useMockGameProgress(userId)

  // Use Firebase progress if configured, otherwise fall back to mock progress
  if (isFirebaseConfigured()) {
    return firebaseProgress
  }

  return mockProgress
}

export function useProfile(userId: string) {
  const firebaseProfile = useFirebaseProfile(userId)
  const mockProfile = useMockProfile(userId)

  // Use Firebase profile if configured, otherwise fall back to mock profile
  if (isFirebaseConfigured()) {
    return firebaseProfile
  }

  return mockProfile
}
