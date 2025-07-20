// Hybrid authentication hooks - Firebase with fallback to mock
// This file provides Firebase auth when configured, otherwise falls back to mock auth for development
// File renamed from useSupabase.ts for better semantic clarity

import { useFirebaseAuth, useFirebaseProfile, useFirebaseGameProgress } from './useFirebaseAuth'
import { useMockAuth, useMockGameProgress, useMockProfile } from './useMockAuth'
import { isFirebaseConfigured } from '@/lib/firebase'

/**
 * Hybrid authentication hook
 * Uses Firebase when configured, falls back to mock auth for development
 */
export function useAuth() {
  const firebaseAuth = useFirebaseAuth()
  const mockAuth = useMockAuth()

  // Use Firebase auth if configured, otherwise fall back to mock auth
  if (isFirebaseConfigured()) {
    return firebaseAuth
  }

  return mockAuth
}

/**
 * Hybrid game progress hook
 * Uses Firebase when configured, falls back to mock progress for development
 */
export function useGameProgress(userId: string) {
  const firebaseProgress = useFirebaseGameProgress(userId)
  const mockProgress = useMockGameProgress(userId)

  // Use Firebase progress if configured, otherwise fall back to mock progress
  if (isFirebaseConfigured()) {
    return firebaseProgress
  }

  return mockProgress
}

/**
 * Hybrid profile hook
 * Uses Firebase when configured, falls back to mock profile for development
 */
export function useProfile(userId: string) {
  const firebaseProfile = useFirebaseProfile(userId)
  const mockProfile = useMockProfile(userId)

  // Use Firebase profile if configured, otherwise fall back to mock profile
  if (isFirebaseConfigured()) {
    return firebaseProfile
  }

  return mockProfile
}
