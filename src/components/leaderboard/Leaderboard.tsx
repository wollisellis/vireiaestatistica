'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp, Users, Clock, Star, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useLeaderboard, LeaderboardData } from '@/lib/leaderboardService'
import { useRBAC } from '@/hooks/useRBAC'

interface LeaderboardProps {
  courseId?: string
  showUserHighlight?: boolean
  maxEntries?: number
  refreshInterval?: number
}

export function Leaderboard({ 
  courseId = 'NT600', 
  showUserHighlight = true,
  maxEntries = 10,
  refreshInterval = 30000 // 30 seconds
}: LeaderboardProps) {
  const { user } = useRBAC()
  const { leaderboard, loading, stats, getUserRank } = useLeaderboard(courseId)
  const [userRank, setUserRank] = useState<number>(0)
  const [displayedEntries, setDisplayedEntries] = useState<LeaderboardData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    if (leaderboard.length > 0) {
      setDisplayedEntries(leaderboard.slice(0, maxEntries))
      setLastUpdated(new Date())

      // Get user's rank if they're a student
      if (user?.role === 'student' && user.anonymousId) {
        getUserRank(user.anonymousId).then(setUserRank)
      }
    }
  }, [leaderboard, maxEntries, user, getUserRank])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-white border border-gray-200'
    }
  }

  const isCurrentUser = (entry: LeaderboardData) => {
    return user?.role === 'student' && user.anonymousId === entry.anonymousId
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Ranking da Turma</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Ranking da Turma</h3>
          </div>
          
          {stats && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{stats.totalParticipants} participantes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {displayedEntries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 mb-2">
              Ranking em Construção
            </h4>
            <p className="text-gray-400">
              Complete jogos para aparecer no ranking!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {displayedEntries.map((entry, index) => (
                <motion.div
                  key={entry.anonymousId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`
                    relative p-4 rounded-lg transition-all duration-200
                    ${getRankColor(entry.rank || index + 1)}
                    ${isCurrentUser(entry) && showUserHighlight ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                    ${entry.rank && entry.rank <= 3 ? 'shadow-lg' : 'hover:shadow-md'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank Icon */}
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank || index + 1)}
                      </div>

                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-semibold ${entry.rank && entry.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                            {entry.anonymousId}
                          </h4>
                          {isCurrentUser(entry) && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <span className={entry.rank && entry.rank <= 3 ? 'text-white/90' : 'text-gray-600'}>
                            {entry.gamesCompleted} jogos • {Math.round(entry.averageScore)}% média
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-xl font-bold ${entry.rank && entry.rank <= 3 ? 'text-white' : 'text-gray-900'}`}>
                        {entry.totalScore}
                      </div>
                      <div className={`text-sm ${entry.rank && entry.rank <= 3 ? 'text-white/90' : 'text-gray-600'}`}>
                        pontos
                      </div>
                    </div>
                  </div>

                  {/* Rank change indicator (placeholder for future feature) */}
                  {entry.rank && entry.rank <= 3 && (
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: entry.rank }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-white/80" />
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* User's position if not in top entries */}
            {showUserHighlight && user?.role === 'student' && userRank > maxEntries && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 font-medium">Sua posição:</span>
                    <span className="text-blue-800 font-bold">#{userRank}</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    Continue jogando para subir no ranking!
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stats Summary */}
            {stats && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.totalParticipants}</div>
                    <div className="text-sm text-gray-600">Participantes</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.averageScore}</div>
                    <div className="text-sm text-gray-600">Média da Turma</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{stats.highestScore}</div>
                    <div className="text-sm text-gray-600">Maior Pontuação</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact leaderboard for dashboard widgets
export function CompactLeaderboard({ courseId = 'NT600', limit = 5 }: { courseId?: string, limit?: number }) {
  const { leaderboard, loading } = useLeaderboard(courseId)
  const topEntries = leaderboard.slice(0, limit)

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-2 p-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            <div className="flex-1 h-4 bg-gray-300 rounded"></div>
            <div className="w-12 h-4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {topEntries.map((entry, index) => (
        <div key={entry.anonymousId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">
              #{entry.rank || index + 1}
            </span>
            <span className="text-sm font-medium text-gray-900">{entry.anonymousId}</span>
          </div>
          <span className="text-sm font-bold text-gray-700">{entry.totalScore}</span>
        </div>
      ))}
    </div>
  )
}
