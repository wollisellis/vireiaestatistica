/**
 * Serviço para gerenciar convites e códigos de turma
 */

import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'

export interface ClassInvite {
  id: string
  classId: string
  code: string
  createdAt: Date
  expiresAt?: Date
  isActive: boolean
  maxUses?: number
  currentUses: number
  createdBy: string
}

export interface ClassRegistration {
  studentId: string
  studentName: string
  studentEmail: string
  email: string // Alias para compatibilidade
  registeredAt: Date
  enrolledAt: Date // Alias para compatibilidade
  inviteCode: string
  status: 'pending' | 'active' | 'inactive'
}

export class ClassInviteService {
  /**
   * Gera um código único para a turma
   */
  static generateClassCode(className: string, year: number): string {
    console.log('Gerando código para:', { className, year })
    
    // Pegar as primeiras letras da turma e combinar com ano
    const classPrefix = className
      .replace(/[^a-zA-Z]/g, '') // Remove caracteres especiais
      .toUpperCase()
      .substring(0, 4) // Primeiros 4 caracteres
      .padEnd(4, 'X') // Preenche com X se necessário
    
    console.log('Prefix gerado:', classPrefix)
    
    const yearSuffix = year.toString().slice(-2) // Últimos 2 dígitos do ano
    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
    
    console.log('Year suffix:', yearSuffix, 'Random suffix:', randomSuffix)
    
    const finalCode = `${classPrefix}${yearSuffix}${randomSuffix}`
    console.log('Código final gerado:', finalCode)
    
    return finalCode
  }

  /**
   * Cria um código de convite para a turma
   */
  static async createClassInvite(
    classId: string,
    className: string,
    professorId: string,
    options?: {
      expiresIn?: number // dias
      maxUses?: number
    }
  ): Promise<string> {
    try {
      console.log('ClassInviteService.createClassInvite chamado:', { classId, className, professorId })
      
      const code = this.generateClassCode(className, new Date().getFullYear())
      console.log('Código gerado:', code)
      
      const now = new Date()
      
      const invite: any = {
        id: `invite_${classId}_${now.getTime()}`,
        classId,
        code,
        createdAt: now,
        isActive: true,
        currentUses: 0,
        createdBy: professorId
      }

      // Adicionar campos opcionais somente se definidos
      if (options?.expiresIn) {
        invite.expiresAt = new Date(now.getTime() + options.expiresIn * 24 * 60 * 60 * 1000);
      }
      
      if (options?.maxUses !== undefined) {
        invite.maxUses = options.maxUses;
      }

      console.log('Dados do convite:', invite)

      // Salvar convite no Firebase
      if (db) {
        console.log('Salvando convite no Firebase...')
        await setDoc(doc(db, 'classInvites', code), invite)
        console.log('Convite salvo no Firebase')
        
        // Atualizar a turma com o código
        console.log('Atualizando turma com inviteCode...')
        await updateDoc(doc(db, 'classes', classId), {
          inviteCode: code,
          lastInviteCreated: now
        })
        console.log('Turma atualizada com inviteCode')
      } else {
        console.warn('Firebase db não disponível!')
      }

      console.log('ClassInviteService retornando código:', code)
      return code
    } catch (error) {
      console.error('Erro ao criar convite:', error)
      throw error
    }
  }

  /**
   * Verifica se um código de convite é válido
   */
  static async validateInviteCode(code: string): Promise<{
    isValid: boolean
    classInfo?: any
    error?: string
  }> {
    try {
      if (!db) {
        throw new Error('Firebase não configurado')
      }

      const inviteDoc = await getDoc(doc(db, 'classInvites', code))
      
      if (!inviteDoc.exists()) {
        return { isValid: false, error: 'Código de convite não encontrado' }
      }

      const invite = inviteDoc.data() as ClassInvite
      const now = new Date()

      // Verificar se está ativo
      if (!invite.isActive) {
        return { isValid: false, error: 'Código de convite desativado' }
      }

      // Verificar expiração
      if (invite.expiresAt && invite.expiresAt < now) {
        return { isValid: false, error: 'Código de convite expirado' }
      }

      // Verificar limite de usos
      if (invite.maxUses && invite.currentUses >= invite.maxUses) {
        return { isValid: false, error: 'Limite de usos do convite atingido' }
      }

      // Buscar informações da turma
      const classDoc = await getDoc(doc(db, 'classes', invite.classId))
      
      if (!classDoc.exists()) {
        return { isValid: false, error: 'Turma não encontrada' }
      }

      const classInfo = classDoc.data()
      
      return {
        isValid: true,
        classInfo: {
          id: invite.classId,
          name: classInfo.name,
          semester: classInfo.semester,
          year: classInfo.year,
          professorName: classInfo.professorName,
          description: classInfo.description,
          studentsCount: classInfo.studentsCount || 0,
          capacity: classInfo.capacity || 50
        }
      }
    } catch (error) {
      console.error('Erro ao validar código:', error)
      return { isValid: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Registra um estudante na turma usando o código de convite
   */
  static async registerStudentWithCode(
    code: string,
    studentId: string,
    studentName: string,
    studentEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!db) {
        throw new Error('Firebase não configurado')
      }

      // Validar código primeiro
      const validation = await this.validateInviteCode(code)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      const classInfo = validation.classInfo!
      const now = new Date()

      // Criar registro do estudante
      const registration: ClassRegistration = {
        studentId,
        studentName,
        studentEmail,
        email: studentEmail, // Adicionar campo 'email' para compatibilidade
        registeredAt: now,
        enrolledAt: now, // Adicionar campo 'enrolledAt' para compatibilidade
        inviteCode: code,
        status: 'active'
      }

      // Adicionar estudante à turma
      await setDoc(doc(db, 'classStudents', `${classInfo.id}_${studentId}`), registration)

      // Atualizar contador de estudantes na turma
      await updateDoc(doc(db, 'classes', classInfo.id), {
        studentsCount: (classInfo.studentsCount || 0) + 1,
        lastStudentAdded: now,
        students: arrayUnion(studentId)
      })

      // Incrementar uso do convite
      await updateDoc(doc(db, 'classInvites', code), {
        currentUses: (await getDoc(doc(db, 'classInvites', code))).data()?.currentUses + 1 || 1,
        lastUsed: now
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao registrar estudante:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Gera link de convite para compartilhamento
   */
  static generateInviteLink(code: string, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/entrar-turma?codigo=${code}`
  }

  /**
   * Gera QR Code para o link de convite
   */
  static generateQRCodeData(code: string, baseUrl?: string): string {
    return this.generateInviteLink(code, baseUrl)
  }

  /**
   * Lista todas as turmas que um estudante participa
   */
  static async getStudentClasses(studentId: string): Promise<any[]> {
    try {
      if (!db) return []

      // Implementar busca das turmas do estudante
      // Por enquanto retorna array vazio
      return []
    } catch (error) {
      console.error('Erro ao buscar turmas do estudante:', error)
      return []
    }
  }

  /**
   * Remove estudante de uma turma
   */
  static async removeStudentFromClass(
    classId: string,
    studentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!db) {
        return { success: false, error: 'Firebase não configurado' }
      }

      // Remover registro do estudante
      await setDoc(doc(db, 'classStudents', `${classId}_${studentId}`), {
        status: 'inactive',
        removedAt: new Date()
      }, { merge: true })

      // Decrementar contador da turma
      const classDoc = await getDoc(doc(db, 'classes', classId))
      if (classDoc.exists()) {
        const currentCount = classDoc.data().studentsCount || 0
        await updateDoc(doc(db, 'classes', classId), {
          studentsCount: Math.max(0, currentCount - 1)
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Erro ao remover estudante:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Desativa um código de convite
   */
  static async deactivateInviteCode(code: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!db) {
        return { success: false, error: 'Firebase não configurado' }
      }

      await updateDoc(doc(db, 'classInvites', code), {
        isActive: false,
        deactivatedAt: new Date()
      })

      return { success: true }
    } catch (error) {
      console.error('Erro ao desativar convite:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  /**
   * Gera estatísticas de uma turma
   */
  static async getClassStats(classId: string): Promise<{
    totalStudents: number
    activeStudents: number
    avgProgress: number
    lastActivity: Date | null
  }> {
    try {
      // Implementar busca de estatísticas
      // Por enquanto retorna dados mock
      return {
        totalStudents: 0,
        activeStudents: 0,
        avgProgress: 0,
        lastActivity: null
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        totalStudents: 0,
        activeStudents: 0,
        avgProgress: 0,
        lastActivity: null
      }
    }
  }
}

export default ClassInviteService