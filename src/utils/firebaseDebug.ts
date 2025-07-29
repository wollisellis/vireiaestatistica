// Debug utilities for Firebase Authentication and Firestore
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

export async function debugFirebaseState() {
  console.log('🔍 === FIREBASE DEBUG START ===')
  
  // Check Firebase config
  console.log('🔥 Firebase configurado?', !!auth && !!db)
  
  // Check current auth state
  const currentUser = auth?.currentUser
  console.log('👤 Usuário atual:', currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    emailVerified: currentUser.emailVerified,
    providerData: currentUser.providerData
  } : 'Nenhum usuário logado')
  
  // Listen to auth state changes
  if (auth) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('🔄 Auth state changed - Usuário logado:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        })
        
        // Try to get ID token claims
        try {
          const idTokenResult = await user.getIdTokenResult()
          console.log('🎫 Token claims:', idTokenResult.claims)
          console.log('🎫 Custom claims:', {
            role: idTokenResult.claims.role,
            email: idTokenResult.claims.email
          })
        } catch (error) {
          console.error('❌ Erro ao obter token claims:', error)
        }
        
        // Try to read user document
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            console.log('📄 Documento do usuário existe?', userDoc.exists())
            if (userDoc.exists()) {
              console.log('📄 Dados do documento:', userDoc.data())
            }
          } catch (error) {
            console.error('❌ Erro ao ler documento do usuário:', error)
          }
        }
      } else {
        console.log('🔄 Auth state changed - Usuário deslogado')
      }
    })
  }
  
  console.log('🔍 === FIREBASE DEBUG END ===')
}

// Test creating a user document with minimal data
export async function testCreateUserDoc(uid: string, email: string, role: 'student' | 'professor') {
  if (!db || !uid || !email) {
    console.error('❌ Missing required parameters')
    return
  }
  
  console.log('🧪 Testando criação de documento...')
  
  const testData = {
    email,
    role,
    autoSetup: role === 'professor',
    testCreated: true,
    createdAt: serverTimestamp()
  }
  
  console.log('📋 Dados de teste:', testData)
  
  try {
    await setDoc(doc(db, 'users', uid), testData)
    console.log('✅ Documento de teste criado com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar documento de teste:', error)
  }
}

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  (window as any).debugFirebase = debugFirebaseState;
  (window as any).testFirebaseCreate = testCreateUserDoc;
}