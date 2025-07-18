'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, Trophy, AlertTriangle, Heart, Flame } from 'lucide-react'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import ProgressNotificationService, { ProgressNotification } from '@/services/progressNotificationService'
// Removido date-fns - usando formatação nativa

interface NotificationCenterProps {
  role: 'student' | 'professor'
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ role }) => {
  const { user } = useFirebaseAuth()
  const [notifications, setNotifications] = useState<ProgressNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const unsubscribe = ProgressNotificationService.getInstance().subscribeToNotifications(
      user.uid,
      role,
      (newNotifications) => {
        setNotifications(newNotifications)
        setUnreadCount(newNotifications.filter(n => !n.read).length)
      }
    )

    return () => unsubscribe()
  }, [user, role])

  const handleMarkAsRead = async (notificationId: string) => {
    await ProgressNotificationService.getInstance().markAsRead(notificationId)
  }

  const getIcon = (notification: ProgressNotification) => {
    switch (notification.type) {
      case 'achievement':
        return <Trophy className="w-5 h-5" />
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />
      case 'encouragement':
        return <Heart className="w-5 h-5" />
      case 'milestone':
        return <Flame className="w-5 h-5" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pink':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Painel */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notificações</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Lista de notificações */}
              <div className="overflow-y-auto max-h-[500px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => notification.id && handleMarkAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          {/* Ícone */}
                          <div className={`p-2 rounded-lg ${getColorClass(notification.color)}`}>
                            {getIcon(notification)}
                          </div>

                          {/* Conteúdo */}
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString('pt-BR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Indicador de não lida */}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}