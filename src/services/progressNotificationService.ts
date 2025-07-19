// Sistema de Notificações em Tempo Real - AvaliaNutri
// Notifica alunos e professores sobre conquistas e marcos importantes

import { db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  updateDoc,
  doc
} from 'firebase/firestore'

export interface ProgressNotification {
  id?: string
  type: 'achievement' | 'milestone' | 'alert' | 'encouragement'
  recipientId: string
  recipientRole: 'student' | 'professor'
  title: string
  message: string
  icon?: string
  color?: string
  metadata?: Record<string, any>
  read: boolean
  createdAt: Date
}

export interface NotificationPreferences {
  achievements: boolean
  milestones: boolean
  alerts: boolean
  encouragements: boolean
  soundEnabled: boolean
  emailEnabled: boolean
}

class ProgressNotificationService {
  private static instance: ProgressNotificationService
  private listeners: Map<string, () => void> = new Map()

  static getInstance(): ProgressNotificationService {
    if (!ProgressNotificationService.instance) {
      ProgressNotificationService.instance = new ProgressNotificationService()
    }
    return ProgressNotificationService.instance
  }

  // Notificar conquista
  async notifyAchievement(
    studentId: string,
    achievement: {
      name: string
      description: string
      icon?: string
      points?: number
    }
  ) {
    const notification: ProgressNotification = {
      type: 'achievement',
      recipientId: studentId,
      recipientRole: 'student',
      title: `Nova Conquista: ${achievement.name}!`,
      message: achievement.description,
      icon: achievement.icon || '🏆',
      color: 'gold',
      metadata: {
        achievementName: achievement.name,
        points: achievement.points
      },
      read: false,
      createdAt: new Date()
    }

    await this.sendNotification(notification)

    // Notificar também o professor
    await this.notifyProfessorsAboutAchievement(studentId, achievement)
  }

  // Notificar marco importante
  async notifyMilestone(
    studentId: string,
    milestone: {
      type: 'module_complete' | 'level_up' | 'streak' | 'perfect_score'
      title: string
      description: string
      value?: number
    }
  ) {
    const icons = {
      module_complete: '📚',
      level_up: '🎯',
      streak: '🔥',
      perfect_score: '💯'
    }

    const colors = {
      module_complete: 'blue',
      level_up: 'purple',
      streak: 'orange',
      perfect_score: 'green'
    }

    const notification: ProgressNotification = {
      type: 'milestone',
      recipientId: studentId,
      recipientRole: 'student',
      title: milestone.title,
      message: milestone.description,
      icon: icons[milestone.type],
      color: colors[milestone.type],
      metadata: {
        milestoneType: milestone.type,
        value: milestone.value
      },
      read: false,
      createdAt: new Date()
    }

    await this.sendNotification(notification)
  }

  // Alertar professor sobre aluno com dificuldade
  async alertProfessorAboutStrugglingStudent(
    professorId: string,
    student: {
      id: string
      name: string
      module: string
      averageScore: number
      attempts: number
    }
  ) {
    const notification: ProgressNotification = {
      type: 'alert',
      recipientId: professorId,
      recipientRole: 'professor',
      title: 'Aluno Precisando de Ajuda',
      message: `${student.name} está com dificuldades no módulo ${student.module}. Média: ${student.averageScore}% após ${student.attempts} tentativas.`,
      icon: '⚠️',
      color: 'red',
      metadata: {
        studentId: student.id,
        studentName: student.name,
        module: student.module,
        averageScore: student.averageScore,
        attempts: student.attempts
      },
      read: false,
      createdAt: new Date()
    }

    await this.sendNotification(notification)
  }

  // Enviar encorajamento
  async sendEncouragement(
    studentId: string,
    type: 'comeback' | 'improvement' | 'consistency' | 'effort'
  ) {
    const messages = {
      comeback: {
        title: 'Bem-vindo de volta! 🎉',
        message: 'Que bom ver você novamente! Continue de onde parou.'
      },
      improvement: {
        title: 'Excelente Progresso! 📈',
        message: 'Suas pontuações estão melhorando consistentemente. Continue assim!'
      },
      consistency: {
        title: 'Você está arrasando! 🌟',
        message: 'Sua dedicação diária está dando resultados. Parabéns!'
      },
      effort: {
        title: 'Persistência é a chave! 💪',
        message: 'Cada tentativa é um passo em direção ao sucesso. Não desista!'
      }
    }

    const notification: ProgressNotification = {
      type: 'encouragement',
      recipientId: studentId,
      recipientRole: 'student',
      title: messages[type].title,
      message: messages[type].message,
      icon: '💝',
      color: 'pink',
      metadata: {
        encouragementType: type
      },
      read: false,
      createdAt: new Date()
    }

    await this.sendNotification(notification)
  }

  // Enviar notificação
  private async sendNotification(notification: ProgressNotification) {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      })

      // Disparar evento para atualização em tempo real
      this.triggerNotificationEvent(notification)
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  // Notificar professores sobre conquista do aluno
  private async notifyProfessorsAboutAchievement(
    studentId: string,
    achievement: any
  ) {
    // Buscar professores relacionados ao aluno
    // Por enquanto, implementação simplificada
    console.log(`Notificando professores sobre conquista de ${studentId}`)
  }

  // Escutar notificações em tempo real
  subscribeToNotifications(
    userId: string,
    role: 'student' | 'professor',
    callback: (notifications: ProgressNotification[]) => void
  ): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId),
      where('recipientRole', '==', role),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: ProgressNotification[] = []
      
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data() as ProgressNotification
        })
      })

      callback(notifications)
    })

    // Armazenar listener
    this.listeners.set(`${userId}-${role}`, unsubscribe)

    return unsubscribe
  }

  // Marcar notificação como lida
  async markAsRead(notificationId: string) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      })
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  // Disparar evento de notificação
  private triggerNotificationEvent(notification: ProgressNotification) {
    // Implementar sistema de eventos
    // Por enquanto, apenas log
    console.log('Nova notificação:', notification)
  }

  // Limpar listeners
  unsubscribeAll() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // Análise inteligente para alertas automáticos
  async analyzeStudentPerformance(
    studentId: string,
    recentScores: number[]
  ) {
    const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length

    // Alerta se média abaixo de 60%
    if (average < 60) {
      // Buscar informações do aluno e notificar professor
      console.log(`Aluno ${studentId} com média baixa: ${average}%`)
    }

    // Encorajamento se melhoria detectada
    if (recentScores.length >= 3) {
      const improving = recentScores[recentScores.length - 1] > recentScores[0]
      if (improving) {
        await this.sendEncouragement(studentId, 'improvement')
      }
    }
  }
}

export default ProgressNotificationService