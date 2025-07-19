import { 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserInfo {
  uid: string
  email: string
  displayName: string
  role: 'student' | 'professor'
  createdAt: any
}

export class UserService {
  private static readonly USERS_COLLECTION = 'users'

  // Buscar usuário por email
  static async getUserByEmail(email: string): Promise<UserInfo | null> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('email', '==', email.toLowerCase())
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0]
        return {
          uid: userDoc.id,
          ...userDoc.data()
        } as UserInfo
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error)
      return null
    }
  }

  // Buscar múltiplos usuários por email
  static async getUsersByEmails(emails: string[]): Promise<UserInfo[]> {
    try {
      if (emails.length === 0) return []
      
      // Firestore tem limite de 10 items em where-in
      const chunks = []
      for (let i = 0; i < emails.length; i += 10) {
        chunks.push(emails.slice(i, i + 10))
      }
      
      const allUsers: UserInfo[] = []
      
      for (const chunk of chunks) {
        const q = query(
          collection(db, this.USERS_COLLECTION),
          where('email', 'in', chunk.map(e => e.toLowerCase()))
        )
        
        const querySnapshot = await getDocs(q)
        querySnapshot.forEach((doc) => {
          allUsers.push({
            uid: doc.id,
            ...doc.data()
          } as UserInfo)
        })
      }
      
      return allUsers
    } catch (error) {
      console.error('Erro ao buscar usuários por emails:', error)
      return []
    }
  }

  // Verificar se usuário existe
  static async userExists(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId))
      return userDoc.exists()
    } catch (error) {
      console.error('Erro ao verificar existência do usuário:', error)
      return false
    }
  }

  // Buscar informações do usuário
  static async getUserInfo(userId: string): Promise<UserInfo | null> {
    try {
      const userDoc = await getDoc(doc(db, this.USERS_COLLECTION, userId))
      
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data()
        } as UserInfo
      }
      
      return null
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error)
      return null
    }
  }

  // Buscar estudantes (role = 'student')
  static async getStudents(limit: number = 50): Promise<UserInfo[]> {
    try {
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('role', '==', 'student')
      )
      
      const querySnapshot = await getDocs(q)
      const students: UserInfo[] = []
      
      querySnapshot.forEach((doc) => {
        if (students.length < limit) {
          students.push({
            uid: doc.id,
            ...doc.data()
          } as UserInfo)
        }
      })
      
      return students
    } catch (error) {
      console.error('Erro ao buscar estudantes:', error)
      return []
    }
  }
}

export default UserService