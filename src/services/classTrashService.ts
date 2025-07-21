// Serviço de Lixeira para Turmas - Sistema de Soft Delete
// Gerencia exclusão temporária e restauração de turmas com prazo de 20 dias

import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ProfessorClassService, ClassInfo } from './professorClassService'

export interface DeletedClass {
  id: string
  originalData: ClassInfo
  deletedAt: Timestamp
  deletedBy: string
  deletedByName: string
  expiresAt: Timestamp
  reason?: string
  canRestore: boolean
  daysRemaining: number
}

export interface TrashStats {
  totalDeleted: number
  expiringSoon: number // próximos 3 dias
  totalSize: number // aproximado em KB
}

export class ClassTrashService {
  private static readonly CLASSES_COLLECTION = 'classes'
  private static readonly DELETED_CLASSES_COLLECTION = 'deleted_classes'
  private static readonly RETENTION_DAYS = 20

  /**
   * Exclui uma turma (soft delete)
   */
  static async deleteClass(
    classId: string,
    deletedBy: string,
    deletedByName: string,
    reason?: string
  ): Promise<void> {
    try {
      console.log(`Iniciando exclusão da turma ${classId}`)

      // Buscar dados originais da turma
      const classData = await ProfessorClassService.getClassInfo(classId)
      if (!classData) {
        throw new Error('Turma não encontrada')
      }

      // ✅ CORREÇÃO: Verificar se é um professor válido (acesso compartilhado)
      // Buscar dados do usuário que está tentando excluir
      const userDoc = await getDoc(doc(db, 'users', deletedBy))
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado')
      }
      
      const userData = userDoc.data()
      if (userData.role !== 'professor') {
        throw new Error('Apenas professores podem excluir turmas')
      }
      
      console.log(`✅ Professor ${userData.fullName || deletedBy} autorizado a excluir turma ${classData.className}`)

      const now = new Date()
      const expiresAt = new Date(now.getTime() + (this.RETENTION_DAYS * 24 * 60 * 60 * 1000))

      const batch = writeBatch(db)

      // 1. Marcar turma como excluída na coleção principal
      const classRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.update(classRef, {
        status: 'deleted',
        deletedAt: serverTimestamp(),
        deletedBy,
        expiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp()
      })

      // 2. Criar registro na lixeira
      const deletedClassRef = doc(db, this.DELETED_CLASSES_COLLECTION, classId)
      const deletedClassData: Omit<DeletedClass, 'id' | 'canRestore' | 'daysRemaining'> = {
        originalData: classData,
        deletedAt: Timestamp.fromDate(now),
        deletedBy,
        deletedByName,
        expiresAt: Timestamp.fromDate(expiresAt),
        reason: reason || 'Excluída pelo professor'
      }

      batch.set(deletedClassRef, deletedClassData)

      // 3. Desativar convites da turma
      if (classData.code) {
        const inviteRef = doc(db, 'classInvites', classData.code)
        batch.update(inviteRef, {
          isActive: false,
          deletedAt: serverTimestamp()
        })
      }

      await batch.commit()

      console.log(`Turma ${classId} excluída com sucesso`)
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      throw error
    }
  }

  /**
   * Restaura uma turma da lixeira
   */
  static async restoreClass(classId: string, restoredBy: string): Promise<void> {
    try {
      console.log(`Iniciando restauração da turma ${classId}`)

      // Verificar se a turma está na lixeira
      const deletedClassRef = doc(db, this.DELETED_CLASSES_COLLECTION, classId)
      const deletedClassDoc = await getDoc(deletedClassRef)

      if (!deletedClassDoc.exists()) {
        throw new Error('Turma não encontrada na lixeira')
      }

      const deletedData = deletedClassDoc.data() as DeletedClass

      // Verificar se ainda pode ser restaurada
      const now = new Date()
      const expiresAt = deletedData.expiresAt.toDate()
      if (now > expiresAt) {
        throw new Error('O prazo para restauração desta turma expirou')
      }

      // Verificar permissão
      if (deletedData.originalData.professorId !== restoredBy) {
        throw new Error('Não autorizado a restaurar esta turma')
      }

      const batch = writeBatch(db)

      // 1. Restaurar status da turma
      const classRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.update(classRef, {
        status: 'open',
        restoredAt: serverTimestamp(),
        restoredBy,
        updatedAt: serverTimestamp(),
        // Remover campos de exclusão
        deletedAt: null,
        deletedBy: null,
        expiresAt: null
      })

      // 2. Reativar convites se existir código
      if (deletedData.originalData.code) {
        const inviteRef = doc(db, 'classInvites', deletedData.originalData.code)
        batch.update(inviteRef, {
          isActive: true,
          restoredAt: serverTimestamp(),
          deletedAt: null
        })
      }

      // 3. Remover da lixeira
      batch.delete(deletedClassRef)

      await batch.commit()

      console.log(`Turma ${classId} restaurada com sucesso`)
    } catch (error) {
      console.error('Erro ao restaurar turma:', error)
      throw error
    }
  }

  /**
   * Lista turmas na lixeira do professor
   */
  static async getDeletedClasses(professorId: string): Promise<DeletedClass[]> {
    try {
      const q = query(
        collection(db, this.DELETED_CLASSES_COLLECTION),
        where('deletedBy', '==', professorId),
        orderBy('deletedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const deletedClasses: DeletedClass[] = []

      const now = new Date()

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const expiresAt = data.expiresAt.toDate()
        const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
        
        deletedClasses.push({
          id: doc.id,
          ...data,
          canRestore: now < expiresAt,
          daysRemaining
        } as DeletedClass)
      })

      return deletedClasses
    } catch (error) {
      console.error('Erro ao listar turmas excluídas:', error)
      return []
    }
  }

  /**
   * Remove permanentemente turmas expiradas
   */
  static async cleanupExpiredClasses(): Promise<number> {
    try {
      const now = new Date()
      const q = query(
        collection(db, this.DELETED_CLASSES_COLLECTION),
        where('expiresAt', '<=', Timestamp.fromDate(now))
      )

      const querySnapshot = await getDocs(q)
      const batch = writeBatch(db)
      let deletedCount = 0

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Remover turma permanentemente da coleção principal
        const classRef = doc(db, this.CLASSES_COLLECTION, doc.id)
        batch.delete(classRef)
        
        // Remover da lixeira
        batch.delete(doc.ref)
        
        // Remover convite se existir
        if (data.originalData?.code) {
          const inviteRef = doc(db, 'classInvites', data.originalData.code)
          batch.delete(inviteRef)
        }
        
        deletedCount++
      })

      if (deletedCount > 0) {
        await batch.commit()
        console.log(`${deletedCount} turmas expiradas removidas permanentemente`)
      }

      return deletedCount
    } catch (error) {
      console.error('Erro ao limpar turmas expiradas:', error)
      return 0
    }
  }

  /**
   * Obtém estatísticas da lixeira
   */
  static async getTrashStats(professorId: string): Promise<TrashStats> {
    try {
      const deletedClasses = await this.getDeletedClasses(professorId)
      const now = new Date()

      const stats: TrashStats = {
        totalDeleted: deletedClasses.length,
        expiringSoon: 0,
        totalSize: 0
      }

      deletedClasses.forEach((deletedClass) => {
        // Contar turmas que expiram em 3 dias
        if (deletedClass.daysRemaining <= 3 && deletedClass.daysRemaining > 0) {
          stats.expiringSoon++
        }

        // Estimar tamanho (aproximado)
        const dataSize = JSON.stringify(deletedClass.originalData).length
        stats.totalSize += dataSize
      })

      return stats
    } catch (error) {
      console.error('Erro ao obter estatísticas da lixeira:', error)
      return {
        totalDeleted: 0,
        expiringSoon: 0,
        totalSize: 0
      }
    }
  }

  /**
   * Verifica se uma turma pode ser restaurada
   */
  static async canRestoreClass(classId: string): Promise<boolean> {
    try {
      const deletedClassRef = doc(db, this.DELETED_CLASSES_COLLECTION, classId)
      const deletedClassDoc = await getDoc(deletedClassRef)

      if (!deletedClassDoc.exists()) {
        return false
      }

      const data = deletedClassDoc.data()
      const now = new Date()
      const expiresAt = data.expiresAt.toDate()

      return now < expiresAt
    } catch (error) {
      console.error('Erro ao verificar se turma pode ser restaurada:', error)
      return false
    }
  }

  /**
   * Força exclusão permanente de uma turma (apenas para casos especiais)
   */
  static async forceDeleteClass(classId: string, deletedBy: string): Promise<void> {
    try {
      console.log(`Forçando exclusão permanente da turma ${classId}`)

      // Verificar permissões
      const deletedClassRef = doc(db, this.DELETED_CLASSES_COLLECTION, classId)
      const deletedClassDoc = await getDoc(deletedClassRef)

      if (!deletedClassDoc.exists()) {
        throw new Error('Turma não encontrada na lixeira')
      }

      const data = deletedClassDoc.data()
      if (data.deletedBy !== deletedBy) {
        throw new Error('Não autorizado a excluir permanentemente esta turma')
      }

      const batch = writeBatch(db)

      // Remover da coleção principal
      const classRef = doc(db, this.CLASSES_COLLECTION, classId)
      batch.delete(classRef)

      // Remover da lixeira
      batch.delete(deletedClassRef)

      // Remover convite se existir
      if (data.originalData?.code) {
        const inviteRef = doc(db, 'classInvites', data.originalData.code)
        batch.delete(inviteRef)
      }

      await batch.commit()

      console.log(`Turma ${classId} excluída permanentemente`)
    } catch (error) {
      console.error('Erro ao excluir turma permanentemente:', error)
      throw error
    }
  }
}