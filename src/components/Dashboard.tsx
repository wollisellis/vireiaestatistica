'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Clock, 
  Star,
  TrendingUp,
  BookOpen,
  Play
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuth, useProfile } from '@/hooks/useSupabase'
import { t } from '@/lib/translations'

interface ProfileData {
  id: string
  email: string
  full_name?: string
  fullName?: string
  total_score?: number
  totalScore?: number
  level_reached?: number
  levelReached?: number
  games_completed?: number
  gamesCompleted?: number
  created_at: string
}

export function Dashboard() {
  const { user } = useAuth()
  // Handle both Firebase user (uid) and mock user (id) properties
  const userId = (user as { uid?: string; id?: string })?.uid || (user as { uid?: string; id?: string })?.id || ''
  const { profile } = useProfile(userId)

  // Type assertion for profile data
  const profileData = profile as ProfileData

  const stats = [
    {
      label: t('dashboard.totalScore'),
      value: profileData?.total_score || profileData?.totalScore || 0,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: t('dashboard.levelReached'),
      value: profileData?.level_reached || profileData?.levelReached || 1,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: t('dashboard.gamesCompleted'),
      value: profileData?.games_completed || profileData?.gamesCompleted || 0,
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: t('dashboard.studyTime'),
      value: '2h 30m', // This would come from session tracking
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const recentGames = [
    { id: 1, title: t('games.titles.1'), level: 1, score: 85, completed: true },
    { id: 2, title: t('games.titles.2'), level: 2, score: 92, completed: true },
    { id: 3, title: t('games.titles.3'), level: 3, score: 0, completed: false },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcomeBack')}, {profileData?.full_name || profileData?.fullName || user?.email}!
          </h1>
          <p className="text-blue-100 text-lg">
            {t('dashboard.readyToContinue')}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Learning Progress</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Completion</span>
                    <span>{Math.round(((profileData?.level_reached || 1) / 20) * 100)}%</span>
                  </div>
                  <ProgressBar 
                    value={profileData?.level_reached || 1}
                    max={20} 
                    color="blue"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Current Level Progress</span>
                    <span>75%</span>
                  </div>
                  <ProgressBar 
                    value={75} 
                    max={100} 
                    color="green"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold">Quick Actions</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Learning
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Review Concepts
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Achievements
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Games */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Games</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      game.completed ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <span className="text-sm font-semibold">L{game.level}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{game.title}</h3>
                      <p className="text-sm text-gray-600">
                        {game.completed ? `Score: ${game.score}%` : 'Not completed'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant={game.completed ? "outline" : "primary"} 
                    size="sm"
                  >
                    {game.completed ? 'Replay' : 'Start'}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
