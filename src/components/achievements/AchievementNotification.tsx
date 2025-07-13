'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Trophy, Zap } from 'lucide-react'
import { ACHIEVEMENT_DEFINITIONS } from '@/lib/achievementSystem'

interface AchievementNotificationProps {
  achievementId: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export function AchievementNotification({ 
  achievementId, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const achievement = ACHIEVEMENT_DEFINITIONS[achievementId]

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  if (!achievement) return null

  const getRarityStyles = (rarity: string) => {
    const styles = {
      common: {
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        border: 'border-gray-400',
        glow: 'shadow-gray-500/50'
      },
      rare: {
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
        border: 'border-blue-400',
        glow: 'shadow-blue-500/50'
      },
      epic: {
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        border: 'border-purple-400',
        glow: 'shadow-purple-500/50'
      },
      legendary: {
        bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        border: 'border-yellow-400',
        glow: 'shadow-yellow-500/50'
      }
    }
    return styles[rarity as keyof typeof styles] || styles.common
  }

  const rarityStyles = getRarityStyles(achievement.rarity)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`
            ${rarityStyles.bg} ${rarityStyles.border} ${rarityStyles.glow}
            border-2 rounded-xl p-4 text-white shadow-2xl
            backdrop-blur-sm
          `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-wide">
                  Conquista Desbloqueada!
                </span>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Achievement Content */}
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="text-4xl">
                {achievement.icon}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  {achievement.title}
                </h3>
                <p className="text-white/90 text-sm mb-2">
                  {achievement.description}
                </p>
                
                {/* Points and Rarity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-xs">
                    <Zap className="w-3 h-3" />
                    <span>{achievement.points} pontos</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: getRarityStars(achievement.rarity) }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-xs font-medium capitalize ml-1">
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar Animation */}
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200
                }}
                transition={{ 
                  duration: 2, 
                  delay: Math.random() * 1,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function getRarityStars(rarity: string): number {
  const stars = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4
  }
  return stars[rarity as keyof typeof stars] || 1
}

// Achievement Toast Manager
interface AchievementToastManagerProps {
  achievements: string[]
  onAchievementShown: (achievementId: string) => void
}

export function AchievementToastManager({ 
  achievements, 
  onAchievementShown 
}: AchievementToastManagerProps) {
  const [currentAchievement, setCurrentAchievement] = useState<string | null>(null)
  const [queue, setQueue] = useState<string[]>([])

  useEffect(() => {
    if (achievements.length > 0 && !currentAchievement) {
      const [next, ...rest] = achievements
      setCurrentAchievement(next)
      setQueue(rest)
    }
  }, [achievements, currentAchievement])

  const handleClose = () => {
    if (currentAchievement) {
      onAchievementShown(currentAchievement)
    }
    
    setCurrentAchievement(null)
    
    // Show next achievement in queue
    if (queue.length > 0) {
      setTimeout(() => {
        const [next, ...rest] = queue
        setCurrentAchievement(next)
        setQueue(rest)
      }, 500)
    }
  }

  return (
    <>
      {currentAchievement && (
        <AchievementNotification
          achievementId={currentAchievement}
          onClose={handleClose}
          autoClose={true}
          duration={4000}
        />
      )}
    </>
  )
}

// Hook for managing achievement notifications
export function useAchievementNotifications() {
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([])

  const showAchievement = (achievementId: string) => {
    setPendingAchievements(prev => [...prev, achievementId])
  }

  const showMultipleAchievements = (achievementIds: string[]) => {
    setPendingAchievements(prev => [...prev, ...achievementIds])
  }

  const markAchievementShown = (achievementId: string) => {
    setPendingAchievements(prev => prev.filter(id => id !== achievementId))
  }

  return {
    pendingAchievements,
    showAchievement,
    showMultipleAchievements,
    markAchievementShown
  }
}
