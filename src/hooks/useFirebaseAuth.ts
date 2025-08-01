import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db, User, isFirebaseConfigured, generateAnonymousId, handleFirestoreError, retryFirestoreOperation, extractFirstNameFromEmail } from '@/lib/firebase'

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

// 🚀 PROFESSOR AUTO-SETUP: Garantir que professores tenham documento correto
const ensureProfessorSetup = async (firebaseUser: FirebaseUser): Promise<void> => {
  if (!db || !firebaseUser?.email) return

  try {
    console.log(`🔧 [ProfessorAutoSetup] Verificando setup para: ${firebaseUser.email}`)
    
    // 1. Verificar se documento do usuário existe
    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)
    
    const isInstitutionalEmail = (
      firebaseUser.email.includes('@dac.unicamp.br') ||
      firebaseUser.email.includes('@unicamp.br') ||
      firebaseUser.email.includes('@gmail.com') // Temporário para desenvolvimento
    )
    
    if (!userDoc.exists()) {
      // 2. Criar documento completo para professor
      if (isInstitutionalEmail) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || extractFirstNameFromEmail(firebaseUser.email),
          role: 'professor', // ⭐ CRUCIAL: Definir role como professor
          emailDomain: firebaseUser.email.split('@')[1],
          createdAt: serverTimestamp(),
          setupBy: 'ProfessorAutoSetup_v1.0',
          autoSetup: true,
          permissions: {
            canCreateClasses: true,
            canManageStudents: true,
            canViewAnalytics: true
          }
        }
        
        await setDoc(userDocRef, userData)
        console.log(`✅ [ProfessorAutoSetup] Documento criado para professor: ${firebaseUser.email}`)
      } else {
        // Criar como estudante se não for email institucional
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || extractFirstNameFromEmail(firebaseUser.email),
          role: 'student',
          emailDomain: firebaseUser.email.split('@')[1],
          createdAt: serverTimestamp(),
          setupBy: 'ProfessorAutoSetup_v1.0',
          autoSetup: true
        }
        
        await setDoc(userDocRef, userData)
        console.log(`✅ [ProfessorAutoSetup] Documento criado para estudante: ${firebaseUser.email}`)
      }
    } else {
      // 3. Verificar e corrigir role se necessário
      const userData = userDoc.data()
      if (!userData?.role || (isInstitutionalEmail && userData.role !== 'professor')) {
        const roleToSet = isInstitutionalEmail ? 'professor' : 'student'
        
        await setDoc(userDocRef, {
          ...userData,
          role: roleToSet,
          correctedAt: serverTimestamp(),
          correctedBy: 'ProfessorAutoSetup_v1.0',
          emailDomain: firebaseUser.email.split('@')[1],
          permissions: isInstitutionalEmail ? {
            canCreateClasses: true,
            canManageStudents: true,
            canViewAnalytics: true
          } : userData.permissions
        }, { merge: true })
        
        console.log(`🔧 [ProfessorAutoSetup] Role corrigido para: ${roleToSet} (${firebaseUser.email})`)
      }
    }
    
    // 4. Forçar refresh do token JWT para incluir custom claims
    await firebaseUser.getIdToken(true)
    console.log(`🔄 [ProfessorAutoSetup] Token JWT refreshed para: ${firebaseUser.email}`)
    
  } catch (error) {
    console.error(`❌ [ProfessorAutoSetup] Erro ao configurar usuário:`, error)
    // Não falhar o login por causa do auto-setup
  }
}

// Global state to prevent multiple auth listeners
let globalAuthListener: (() => void) | null = null
let globalUser: FirebaseUser | null = null
let globalLoading = true
const authStateCallbacks = new Set<(user: FirebaseUser | null, loading: boolean) => void>()

// Initialize auth listener once globally
const initializeGlobalAuthListener = () => {
  if (globalAuthListener || !auth || !isFirebaseConfigured()) {
    return
  }

  console.log('🔥 Configurando listener de autenticação global...')

  globalAuthListener = onAuthStateChanged(auth, async (firebaseUser) => {
    console.log('🔄 Estado de autenticação mudou:', firebaseUser ? 'Logado' : 'Deslogado')

    if (firebaseUser) {
      console.log('✅ Usuário autenticado:', firebaseUser)

      try {
        // Set authentication cookie when user is authenticated
        const token = await firebaseUser.getIdToken()
        setCookie('auth-token', token, 7) // 7 days

        // 🚀 AUTO-SETUP PROFESSOR: Garantir que o documento do usuário existe com role correto
        await ensureProfessorSetup(firebaseUser)

        // Save last login time
        if (typeof window !== 'undefined') {
          localStorage.setItem('last-login', new Date().toISOString())
        }
      } catch (error) {
        console.error('❌ Erro ao obter token de autenticação:', error)
        // Continue mesmo com erro no token
        setCookie('auth-token', firebaseUser.uid, 7) // Fallback to UID

        // Save last login time even on error
        if (typeof window !== 'undefined') {
          localStorage.setItem('last-login', new Date().toISOString())
        }
      }
    } else {
      console.log('❌ Usuário não autenticado')
      // Clear auth token cookie
      deleteCookie('auth-token')
    }

    globalUser = firebaseUser
    globalLoading = false

    // Notify all subscribers
    authStateCallbacks.forEach(callback => {
      callback(firebaseUser, false)
    })
  })
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(globalUser)
  const [loading, setLoading] = useState(globalLoading)

  useEffect(() => {
    if (!auth || !isFirebaseConfigured()) {
      console.warn('🔥 Firebase não configurado ou credenciais inválidas - usando modo mock')
      setLoading(false)
      return
    }

    // Initialize global listener if not already done
    initializeGlobalAuthListener()

    // Subscribe to auth state changes
    const callback = (user: FirebaseUser | null, loading: boolean) => {
      setUser(user)
      setLoading(loading)
    }

    authStateCallbacks.add(callback)

    // Set initial state
    setUser(globalUser)
    setLoading(globalLoading)

    return () => {
      authStateCallbacks.delete(callback)
    }
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

      // Validate email domain for students (should be @dac.unicamp.br or @unicamp.br)
      if (role === 'student' && !email.endsWith('@dac.unicamp.br') && !email.endsWith('@unicamp.br')) {
        throw new Error('Estudantes devem usar email institucional @dac.unicamp.br ou @unicamp.br')
      }

      // Professors can use any valid email domain
      if (role === 'professor') {
        console.log('Professor registration with email:', email)
      }

      // Check if registrations are allowed for students
      if (role === 'student') {
        const registrationSettingsDoc = await getDoc(doc(db, 'settings', 'registration_control'))
        const registrationSettings = registrationSettingsDoc.data()
        
        if (registrationSettings && registrationSettings.allowNewRegistrations === false) {
          throw new Error('Novos cadastros estão temporariamente fechados. Entre em contato com seu professor.')
        }
      }

      // Create user with email and password
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: fullName
      })

      // Generate anonymous ID for students
      const anonymousId = role === 'student' ? generateAnonymousId() : undefined

      // Create user profile in Firestore (remove undefined fields)
      const userProfile: any = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        fullName,
        role,
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

      // Only add anonymousId if it's not undefined
      if (anonymousId) {
        userProfile.anonymousId = anonymousId
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
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      
      // Verificar se usuário tem perfil e se precisa de anonymousId
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const existingProfile = userDoc.data() as User
        
        // Verificar se usuário estudante precisa de anonymousId
        if (!existingProfile.anonymousId && existingProfile.role === 'student') {
          console.log('🆔 Gerando anonymousId para usuário existente (login email)...')
          const newAnonymousId = generateAnonymousId()
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            anonymousId: newAnonymousId,
            anonymousIdGeneratedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
          
          console.log('✅ AnonymousId gerado com sucesso:', newAnonymousId)
          return { data: { user: firebaseUser, profile: { ...existingProfile, anonymousId: newAnonymousId } }, error: null }
        }
        
        return { data: { user: firebaseUser, profile: existingProfile }, error: null }
      }
      
      return { data: { user: firebaseUser }, error: null }
    } catch (error: unknown) {
      console.error('Sign in error:', error)
      return { data: null, error: { message: (error as Error).message } }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async (role: 'student' | 'professor' = 'student') => {
    if (!auth || !db || !isFirebaseConfigured()) {
      throw new Error('Firebase not configured')
    }

    try {
      setLoading(true)

      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      console.log('🔄 Iniciando autenticação Google...')
      const result = await signInWithPopup(auth, provider)

      const firebaseUser = result.user
      const email = firebaseUser.email!

      console.log('✅ Autenticação Google bem-sucedida:', { 
        email, 
        role,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName 
      })

      // Delegando validação para Firestore Rules - permite flexibilidade total
      console.log('✅ Prosseguindo com validação via Firestore Rules')

      // Check if user already exists in Firestore with retry logic
      let userDoc
      try {
        console.log('🔍 Verificando se usuário existe no Firestore...')
        userDoc = await retryFirestoreOperation(async () => {
          return await getDoc(doc(db, 'users', firebaseUser.uid))
        })
        console.log('✅ Verificação concluída. Existe?', userDoc.exists())
      } catch (firestoreError) {
        console.error('❌ Erro ao acessar Firestore:', firestoreError)
        // Não fazer logout aqui - vamos tentar criar o usuário mesmo assim
        console.log('⚠️ Tentando prosseguir com criação de novo usuário...')
        userDoc = { exists: () => false } // Simular documento não existente
      }

      if (!userDoc.exists()) {
        console.log('👤 Criando novo usuário...')
        // Create new user profile
        const anonymousId = role === 'student' ? generateAnonymousId() : undefined

        // Extract name from email if displayName is not available
        const fullName = firebaseUser.displayName ||
          extractFirstNameFromEmail(firebaseUser.email!) ||
          'Usuário'

        const userProfile: any = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          fullName,
          role,
          roleHistory: [role], // Initialize with current role
          institutionId: 'unicamp',
          totalScore: 0,
          levelReached: 1,
          gamesCompleted: 0,
          collaborationHistory: [],
          preferredPartners: [],
          achievements: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: 'google'
        }

        // Only add anonymousId if it's not undefined
        if (anonymousId) {
          userProfile.anonymousId = anonymousId
        }

        // Add autoSetup flag for professors using Google Sign In
        if (role === 'professor') {
          userProfile.autoSetup = true
          userProfile.setupMethod = 'google_signin_v1.0'
        }

        try {
          console.log('📝 Tentando criar documento do usuário...')
          console.log('📋 Dados do perfil:', userProfile)
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })

          console.log('✅ Usuário criado com sucesso:', userProfile)
        } catch (createError) {
          console.error('❌ Erro ao criar documento do usuário:', createError)
          console.error('📋 Dados que tentamos salvar:', userProfile)
          throw new Error('Erro ao criar perfil do usuário. Verifique as permissões.')
        }
        return { data: { user: firebaseUser, profile: userProfile, isNewUser: true }, error: null }
      } else {
        console.log('👤 Usuário existente encontrado')
        // Existing user - allow role switching or multiple roles
        const existingProfile = userDoc.data() as User
        
        // Verificar se usuário estudante precisa de anonymousId
        let needsUpdate = false
        const updates: any = {}
        
        if (!existingProfile.anonymousId && existingProfile.role === 'student') {
          console.log('🆔 Gerando anonymousId para usuário existente...')
          const newAnonymousId = generateAnonymousId()
          updates.anonymousId = newAnonymousId
          updates.anonymousIdGeneratedAt = serverTimestamp()
          needsUpdate = true
        }

        // If user is trying to access a different role, update their profile
        if (existingProfile.role !== role) {
          console.log('🔄 Atualizando papel do usuário:', { from: existingProfile.role, to: role })

          // Update role history
          const currentRoleHistory = existingProfile.roleHistory || [existingProfile.role]
          const newRoleHistory = currentRoleHistory.includes(role)
            ? currentRoleHistory
            : [...currentRoleHistory, role]

          // Update user role in Firestore
          const updatedProfile = {
            ...existingProfile,
            role,
            roleHistory: newRoleHistory,
            updatedAt: new Date().toISOString()
          }

          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...updatedProfile,
            updatedAt: serverTimestamp()
          }, { merge: true })

          console.log('✅ Papel atualizado com sucesso:', updatedProfile)
          return { data: { user: firebaseUser, profile: updatedProfile, isNewUser: false }, error: null }
        }
        
        // Se precisa apenas atualizar o anonymousId (sem mudança de role)
        if (needsUpdate) {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...updates,
            updatedAt: serverTimestamp()
          }, { merge: true })
          
          const updatedProfile = {
            ...existingProfile,
            ...updates
          }
          
          console.log('✅ AnonymousId gerado com sucesso:', updates.anonymousId)
          return { data: { user: firebaseUser, profile: updatedProfile, isNewUser: false }, error: null }
        }

        console.log('✅ Login bem-sucedido:', existingProfile)
        return { data: { user: firebaseUser, profile: existingProfile, isNewUser: false }, error: null }
      }
    } catch (error: unknown) {
      console.error('❌ Erro no Google sign in:', error)
      return { data: null, error: { message: (error as Error).message } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      // Clear all authentication cookies and storage
      deleteCookie('auth-token')
      deleteCookie('user-role')
      deleteCookie('user-session')
      deleteCookie('firebase-auth-token')
      
      // Clear localStorage auth-related items
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firebase-auth-token')
        localStorage.removeItem('user-data')
        localStorage.removeItem('auth-state')
        localStorage.removeItem('selected-role')
        sessionStorage.clear()
      }
      
      return { error: null }
    } catch (error: unknown) {
      console.error('Sign out error:', error)
      return { error: { message: (error as Error).message } }
    }
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
    signInWithGoogle,
    signUp,
    signOut,
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
        const docSnap = await retryFirestoreOperation(async () => {
          const docRef = doc(db, 'users', userId)
          return await getDoc(docRef)
        })

        if (docSnap.exists()) {
          const data = docSnap.data()
          let anonymousId = data.anonymousId

          // 🆔 AUTO-GENERATE ANONYMOUS ID: Se usuário é estudante e não tem anonymousId, gerar automaticamente
          if (data.role === 'student' && !anonymousId) {
            console.log('🆔 Gerando anonymousId automaticamente para estudante...')
            anonymousId = generateAnonymousId()

            try {
              // Atualizar no Firestore
              await setDoc(doc(db, 'users', userId), {
                anonymousId: anonymousId,
                anonymousIdGeneratedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              }, { merge: true })

              console.log(`✅ AnonymousId gerado: ${anonymousId}`)
            } catch (error) {
              console.error('❌ Erro ao salvar anonymousId:', error)
              // Continuar mesmo se falhar ao salvar
            }
          }

          setProfile({
            id: docSnap.id,
            email: data.email,
            fullName: data.fullName,
            role: data.role || 'student',
            roleHistory: data.roleHistory || [data.role || 'student'],
            anonymousId: anonymousId, // Usar o anonymousId gerado ou existente
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
        // Don't throw error here, just log it and continue with null profile
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
