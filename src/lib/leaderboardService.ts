import { db } from './firebase'
import { ref, set, get, onValue, off, push, serverTimestamp } from 'firebase/database'
import { User, LeaderboardEntry } from './firebase'

// Real-time leaderboard using Firebase Realtime Database
export interface LeaderboardData {
  userId: string
  anonymousId: string
  totalScore: number
  gamesCompleted: number
  averageScore: number
  lastUpdated: number
  rank?: number
}

export interface LeaderboardMetadata {
  totalParticipants: number
  lastUpdated: number
  courseId: string
}

export class LeaderboardService {
  private courseId: string
  private listeners: Map<string, (data: LeaderboardData[]) => void> = new Map()

  constructor(courseId: string = 'NT600') {
    this.courseId = courseId
  }

  // Update user's leaderboard entry
  async updateUserScore(
    userId: string,
    anonymousId: string,
    totalScore: number,
    gamesCompleted: number,
    averageScore: number
  ): Promise<void> {
    if (!db) {
      console.warn('Firebase Realtime Database not configured')
      return
    }

    try {
      const leaderboardRef = ref(db, `leaderboards/${this.courseId}/rankings/${anonymousId}`)
      
      const leaderboardData: LeaderboardData = {
        userId,
        anonymousId,
        totalScore,
        gamesCompleted,
        averageScore,
        lastUpdated: Date.now()
      }

      await set(leaderboardRef, leaderboardData)

      // Update metadata
      await this.updateMetadata()
      
      console.log('Leaderboard updated for user:', anonymousId)
    } catch (error) {
      console.error('Error updating leaderboard:', error)
    }
  }

  // Get current leaderboard data
  async getLeaderboard(): Promise<LeaderboardData[]> {
    if (!db) {
      console.warn('Firebase Realtime Database not configured')
      return []
    }

    try {
      const leaderboardRef = ref(db, `leaderboards/${this.courseId}/rankings`)
      const snapshot = await get(leaderboardRef)
      
      if (!snapshot.exists()) {
        return []
      }

      const data = snapshot.val()
      const leaderboardArray: LeaderboardData[] = Object.values(data)
      
      // Sort by total score (descending) and assign ranks
      const sortedLeaderboard = leaderboardArray
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }))

      return sortedLeaderboard
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  // Subscribe to real-time leaderboard updates
  subscribeToLeaderboard(
    callback: (data: LeaderboardData[]) => void,
    listenerId: string = 'default'
  ): void {
    if (!db) {
      console.warn('Firebase Realtime Database not configured')
      return
    }

    // Store callback for cleanup
    this.listeners.set(listenerId, callback)

    const leaderboardRef = ref(db, `leaderboards/${this.courseId}/rankings`)
    
    const unsubscribe = onValue(leaderboardRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const leaderboardArray: LeaderboardData[] = Object.values(data)
        
        // Sort and rank
        const sortedLeaderboard = leaderboardArray
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1
          }))

        callback(sortedLeaderboard)
      } else {
        callback([])
      }
    })

    // Store unsubscribe function
    this.listeners.set(`${listenerId}_unsubscribe`, unsubscribe as any)
  }

  // Unsubscribe from leaderboard updates
  unsubscribeFromLeaderboard(listenerId: string = 'default'): void {
    const unsubscribe = this.listeners.get(`${listenerId}_unsubscribe`)
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe()
    }
    
    this.listeners.delete(listenerId)
    this.listeners.delete(`${listenerId}_unsubscribe`)
  }

  // Get user's current rank
  async getUserRank(anonymousId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard()
    const userEntry = leaderboard.find(entry => entry.anonymousId === anonymousId)
    return userEntry?.rank || 0
  }

  // Get top performers
  async getTopPerformers(limit: number = 10): Promise<LeaderboardData[]> {
    const leaderboard = await this.getLeaderboard()
    return leaderboard.slice(0, limit)
  }

  // Update leaderboard metadata
  private async updateMetadata(): Promise<void> {
    if (!db) return

    try {
      const leaderboard = await this.getLeaderboard()
      const metadataRef = ref(db, `leaderboards/${this.courseId}/metadata`)
      
      const metadata: LeaderboardMetadata = {
        totalParticipants: leaderboard.length,
        lastUpdated: Date.now(),
        courseId: this.courseId
      }

      await set(metadataRef, metadata)
    } catch (error) {
      console.error('Error updating metadata:', error)
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats(): Promise<{
    totalParticipants: number
    averageScore: number
    highestScore: number
    lastUpdated: number
  }> {
    const leaderboard = await this.getLeaderboard()
    
    if (leaderboard.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        highestScore: 0,
        lastUpdated: Date.now()
      }
    }

    const totalScore = leaderboard.reduce((sum, entry) => sum + entry.totalScore, 0)
    const averageScore = totalScore / leaderboard.length
    const highestScore = Math.max(...leaderboard.map(entry => entry.totalScore))

    return {
      totalParticipants: leaderboard.length,
      averageScore: Math.round(averageScore),
      highestScore,
      lastUpdated: Date.now()
    }
  }

  // Clear all leaderboard data (admin function)
  async clearLeaderboard(): Promise<void> {
    if (!db) return

    try {
      const leaderboardRef = ref(db, `leaderboards/${this.courseId}`)
      await set(leaderboardRef, null)
      console.log('Leaderboard cleared for course:', this.courseId)
    } catch (error) {
      console.error('Error clearing leaderboard:', error)
    }
  }
}

// Hook for using leaderboard in React components
export function useLeaderboard(courseId: string = 'NT600') {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<any>(null)
  
  const leaderboardService = React.useMemo(() => new LeaderboardService(courseId), [courseId])

  React.useEffect(() => {
    // Subscribe to real-time updates
    leaderboardService.subscribeToLeaderboard((data) => {
      setLeaderboard(data)
      setLoading(false)
    })

    // Load initial stats
    leaderboardService.getLeaderboardStats().then(setStats)

    // Cleanup on unmount
    return () => {
      leaderboardService.unsubscribeFromLeaderboard()
    }
  }, [leaderboardService])

  const updateUserScore = React.useCallback(
    (userId: string, anonymousId: string, totalScore: number, gamesCompleted: number, averageScore: number) => {
      return leaderboardService.updateUserScore(userId, anonymousId, totalScore, gamesCompleted, averageScore)
    },
    [leaderboardService]
  )

  const getUserRank = React.useCallback(
    (anonymousId: string) => {
      return leaderboardService.getUserRank(anonymousId)
    },
    [leaderboardService]
  )

  return {
    leaderboard,
    loading,
    stats,
    updateUserScore,
    getUserRank,
    getTopPerformers: (limit?: number) => leaderboardService.getTopPerformers(limit)
  }
}

// Import React for the hook
import React from 'react'

// Default export
export default LeaderboardService
