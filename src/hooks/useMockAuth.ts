import { useEffect, useState } from 'react'

interface MockUser {
  id: string
  email: string
  full_name?: string
  created_at: string
}

interface MockProfile {
  id: string
  email: string
  full_name?: string
  total_score: number
  level_reached: number
  games_completed: number
  created_at: string
}

interface MockGameProgress {
  id: string
  user_id: string
  game_id: number
  level: number
  score: number
  completed: boolean
  attempts: number
  best_time?: number
  created_at: string
}

// Mock data for development
const MOCK_USER: MockUser = {
  id: 'mock-user-123',
  email: 'ellis@example.com',
  full_name: 'Ellis Wollis Malta Abhulime',
  created_at: new Date().toISOString(),
}

const GUEST_USER: MockUser = {
  id: 'guest-user',
  email: 'visitante@vireiestatistica.com',
  full_name: 'Usuário Visitante',
  created_at: new Date().toISOString(),
}

const MOCK_PROFILE: MockProfile = {
  id: 'mock-user-123',
  email: 'ellis@example.com',
  full_name: 'Ellis Wollis Malta Abhulime',
  total_score: 1250,
  level_reached: 3,
  games_completed: 2,
  created_at: new Date().toISOString(),
}

const GUEST_PROFILE: MockProfile = {
  id: 'guest-user',
  email: 'visitante@vireiestatistica.com',
  full_name: 'Usuário Visitante',
  total_score: 850,
  level_reached: 2,
  games_completed: 1,
  created_at: new Date().toISOString(),
}

const MOCK_PROGRESS: MockGameProgress[] = [
  {
    id: 'progress-1',
    user_id: 'mock-user-123',
    game_id: 1,
    level: 1,
    score: 85,
    completed: true,
    attempts: 2,
    best_time: 120,
    created_at: new Date().toISOString(),
  },
  {
    id: 'progress-2',
    user_id: 'mock-user-123',
    game_id: 2,
    level: 2,
    score: 92,
    completed: true,
    attempts: 1,
    best_time: 95,
    created_at: new Date().toISOString(),
  },
  // Initialize remaining games as not completed
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `progress-${i + 3}`,
    user_id: 'mock-user-123',
    game_id: i + 3,
    level: i + 3,
    score: 0,
    completed: false,
    attempts: 0,
    best_time: 0,
    created_at: new Date().toISOString(),
  }))
]

export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // Check for guest mode first
      const isGuestMode = localStorage.getItem('guest-mode') === 'true'
      if (isGuestMode) {
        setUser(GUEST_USER)
        setLoading(false)
        return
      }

      // Check if user is "logged in" (stored in localStorage for persistence)
      const storedUser = localStorage.getItem('mock-user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple mock validation
    if (email && password.length >= 6) {
      const mockUser = { ...MOCK_USER, email }
      localStorage.setItem('mock-user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { data: { user: mockUser }, error: null }
    } else {
      return { data: null, error: { message: 'Invalid credentials' } }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple mock validation
    if (email && password.length >= 6 && fullName.length >= 2) {
      const mockUser = { ...MOCK_USER, email, full_name: fullName }
      localStorage.setItem('mock-user', JSON.stringify(mockUser))
      setUser(mockUser)
      return { data: { user: mockUser }, error: null }
    } else {
      return { data: null, error: { message: 'Invalid input data' } }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('mock-user')
    localStorage.removeItem('guest-mode')
    setUser(null)
    return { error: null }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}

export function useMockGameProgress(userId: string) {
  const [progress, setProgress] = useState<MockGameProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Simulate loading
    const timer = setTimeout(() => {
      setProgress(MOCK_PROGRESS)
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [userId])

  const updateProgress = async (gameId: number, score: number, completed: boolean) => {
    if (!userId) return { data: null, error: { message: 'No user' } }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const newProgress: MockGameProgress = {
      id: `progress-${Date.now()}`,
      user_id: userId,
      game_id: gameId,
      level: gameId,
      score,
      completed,
      attempts: 1,
      created_at: new Date().toISOString(),
    }

    setProgress(prev => {
      const updated = prev.filter(p => p.game_id !== gameId)
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

export function useMockProfile(userId: string) {
  const [profile, setProfile] = useState<MockProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    // Simulate loading
    const timer = setTimeout(() => {
      // Check for guest mode
      const isGuestMode = localStorage.getItem('guest-mode') === 'true'
      if (isGuestMode) {
        setProfile(GUEST_PROFILE)
      } else {
        setProfile(MOCK_PROFILE)
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [userId])

  const updateProfile = async (updates: Partial<MockProfile>) => {
    if (!userId) return { data: null, error: { message: 'No user' } }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const updatedProfile = { ...MOCK_PROFILE, ...updates }
    setProfile(updatedProfile)

    return { data: updatedProfile, error: null }
  }

  return {
    profile,
    loading,
    updateProfile,
  }
}
