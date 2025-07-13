'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Trophy, Users, Target, Zap, BookOpen, Award, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ACHIEVEMENT_DEFINITIONS, getAchievementsByRarity, getNextAchievements } from '@/lib/achievementSystem'

interface AchievementDisplayProps {
  earnedAchievements: string[]
  studentProgress?: any
  showProgress?: boolean
}

export function AchievementDisplay({ 
  earnedAchievements, 
  studentProgress,
  showProgress = true 
}: AchievementDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showLocked, setShowLocked] = useState(false)

  const groupedAchievements = getAchievementsByRarity(earnedAchievements)
  const nextAchievements = studentProgress ? getNextAchievements(studentProgress) : []

  const categories = [
    { id: 'all', name: 'Todas', icon: Trophy },
    { id: 'milestone', name: 'Marcos', icon: Target },
    { id: 'performance', name: 'Desempenho', icon: Star },
    { id: 'engagement', name: 'Engajamento', icon: Zap },
    { id: 'collaboration', name: 'Colaboração', icon: Users },
    { id: 'mastery', name: 'Maestria', icon: BookOpen }
  ]

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return earnedAchievements
    }
    return earnedAchievements.filter(id => {
      const achievement = ACHIEVEMENT_DEFINITIONS[id]
      return achievement?.achievementType === selectedCategory
    })
  }

  const getLockedAchievements = () => {
    const allAchievementIds = Object.keys(ACHIEVEMENT_DEFINITIONS)
    return allAchievementIds.filter(id => !earnedAchievements.includes(id))
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const getRarityTextColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-700',
      rare: 'text-blue-700',
      epic: 'text-purple-700',
      legendary: 'text-yellow-700'
    }
    return colors[rarity as keyof typeof colors] || colors.common
  }

  const filteredAchievements = getFilteredAchievements()
  const lockedAchievements = showLocked ? getLockedAchievements() : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conquistas</h2>
          <p className="text-gray-600">
            {earnedAchievements.length} de {Object.keys(ACHIEVEMENT_DEFINITIONS).length} conquistadas
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={showLocked ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLocked(!showLocked)}
          >
            {showLocked ? 'Ocultar Bloqueadas' : 'Mostrar Bloqueadas'}
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-1"
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          )
        })}
      </div>

      {/* Progress Section */}
      {showProgress && nextAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Próximas Conquistas
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextAchievements.map((next) => (
                <div key={next.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{next.title}</h4>
                    <span className="text-sm text-gray-600">
                      {next.progress}/{next.target}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{next.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(next.progress / next.target) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rarity Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(groupedAchievements).map(([rarity, achievements]) => (
          <Card key={rarity} className={getRarityColor(rarity)}>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                {Array.from({ length: getRarityStars(rarity) }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 fill-current ${getRarityTextColor(rarity)}`} />
                ))}
              </div>
              <p className={`font-bold text-lg ${getRarityTextColor(rarity)}`}>
                {achievements.length}
              </p>
              <p className={`text-sm capitalize ${getRarityTextColor(rarity)}`}>
                {rarity}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Earned Achievements */}
        {filteredAchievements.map((achievementId) => {
          const achievement = ACHIEVEMENT_DEFINITIONS[achievementId]
          if (!achievement) return null

          return (
            <motion.div
              key={achievementId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`${getRarityColor(achievement.rarity)} border-2 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{achievement.icon}</div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-600">
                          {achievement.points} pts
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: getRarityStars(achievement.rarity) }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 fill-current ${getRarityTextColor(achievement.rarity)}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Locked Achievements */}
        {showLocked && lockedAchievements.map((achievementId) => {
          const achievement = ACHIEVEMENT_DEFINITIONS[achievementId]
          if (!achievement) return null

          return (
            <motion.div
              key={`locked-${achievementId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 border-gray-200 bg-gray-100 opacity-60">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3 grayscale">
                      <Lock className="w-10 h-10 mx-auto text-gray-400" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-500 mb-1">
                      ???
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Conquista bloqueada
                    </p>
                    
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {achievement.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && !showLocked && (
        <div className="text-center py-12">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Nenhuma conquista nesta categoria
          </h3>
          <p className="text-gray-400">
            Continue jogando para desbloquear conquistas!
          </p>
        </div>
      )}
    </div>
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
