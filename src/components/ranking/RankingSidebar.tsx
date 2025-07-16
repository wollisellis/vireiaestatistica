'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  User, 
  Clock,
  Target,
  Star,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { AnonymousIdBadge } from '@/components/ui/AnonymousIdBadge'
import { useStudentProgress } from '@/contexts/StudentProgressContext'
import { useRBAC } from '@/hooks/useRBAC'
import type { RankingEntry } from '@/contexts/StudentProgressContext'

interface RankingSidebarProps {
  className?: string
}

const RankingSidebar: React.FC<RankingSidebarProps> = ({ className = '' }) => {
  const { user } = useRBAC()
  const [isPerformanceVisible, setIsPerformanceVisible] = useState(true)

  const {
    progress,
    getRankingData,
    getCurrentRank,
    getTopPerformers,
    calculateOverallPerformance
  } = useStudentProgress()

  const currentRank = getCurrentRank()
  const topPerformers = getTopPerformers(5)
  const performance = calculateOverallPerformance()
  const rankingData = getRankingData()
  const currentStudentData = rankingData.find(entry => entry.studentId === progress.studentId)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 75) return 'text-blue-600 bg-blue-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  return (
    <div className={`w-80 bg-white border-l border-gray-200 overflow-y-auto ${className}`}>
      <div className="p-6 space-y-6">
        {/* Current Student Performance */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Seu Desempenho
                </h3>
                {user?.anonymousId && (
                  <AnonymousIdBadge
                    anonymousId={user.anonymousId}
                    size="sm"
                    variant="student"
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPerformanceVisible(!isPerformanceVisible)}
                className="h-8 w-8 p-0 hover:bg-emerald-100"
                title={isPerformanceVisible ? "Esconder desempenho" : "Mostrar desempenho"}
              >
                {isPerformanceVisible ? (
                  <EyeOff className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-600" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isPerformanceVisible && (
            <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getRankIcon(currentRank)}
                <span className="font-semibold text-lg">#{currentRank}</span>
              </div>
              <Badge className={`${getPerformanceColor(progress.averageScore)} border-0`}>
                {performance.performance}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pontuação Total</span>
                <span className="font-semibold">{progress.totalScore}/{progress.totalPossibleScore}</span>
              </div>
              <Progress value={progress.totalPossibleScore > 0 ? (progress.totalScore / progress.totalPossibleScore) * 100 : 0} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="font-semibold text-emerald-600">{progress.gamesCompleted}</div>
                <div className="text-gray-600">Jogos</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="font-semibold text-emerald-600">{progress.averageScore.toFixed(1)}%</div>
                <div className="text-gray-600">Média</div>
              </div>
            </div>

            {progress.improvementStreak > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-white p-2 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                <span>Sequência de {progress.improvementStreak} melhorias!</span>
              </div>
            )}
            </CardContent>
          )}
        </Card>

        {/* Individual Game Scores */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Pontuação por Jogo
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { id: 1, name: 'Indicadores Antropométricos', maxScore: 100 },
              { id: 4, name: 'Curvas de Crescimento', maxScore: 100 }
            ].map(game => {
              const gameScore = progress.gameScores.find(score => score.gameId === game.id)
              const normalizedScore = gameScore?.normalizedScore || 0
              const isCompleted = gameScore !== undefined

              return (
                <div key={game.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{game.name}</span>
                    <div className="flex items-center gap-2">
                      {gameScore?.isPersonalBest && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className={`text-sm font-semibold ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {normalizedScore}/100
                      </span>
                    </div>
                  </div>
                  <Progress value={normalizedScore} className="h-2" />
                  {gameScore && gameScore.attempt > 1 && (
                    <div className="text-xs text-gray-500">
                      Tentativa {gameScore.attempt} 
                      {gameScore.previousBestScore && (
                        <span className="ml-2 text-emerald-600">
                          (+{normalizedScore - gameScore.previousBestScore} pts)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Ranking Geral
            </h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((performer, index) => {
              const rank = index + 1
              const isCurrentStudent = performer.studentId === progress.studentId

              return (
                <motion.div
                  key={performer.studentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isCurrentStudent ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(rank)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium truncate ${
                        isCurrentStudent ? 'text-emerald-700' : 'text-gray-900'
                      }`}>
                        {isCurrentStudent ? 'Você' : performer.studentName}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {performer.rankingScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{performer.gamesCompleted} jogos</span>
                      <span>{performer.averageScore.toFixed(1)}% média</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {currentRank > 5 && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <div className="flex-shrink-0">
                    {getRankIcon(currentRank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-700">Você</span>
                      <span className="text-sm font-semibold text-gray-600">
                        {progress.rankingScore}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{progress.gamesCompleted} jogos</span>
                      <span>{progress.averageScore.toFixed(1)}% média</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        {progress.achievements.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Conquistas
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {progress.achievements.map(achievement => (
                  <Badge key={achievement} variant="secondary" className="text-xs">
                    {achievement === 'first-game' && '🎯 Primeiro Jogo'}
                    {achievement === 'all-games' && '🏆 Todos os Jogos'}
                    {achievement === 'perfect-score' && '⭐ Pontuação Perfeita'}
                    {achievement === 'high-performer' && '🚀 Alto Desempenho'}
                    {achievement === 'improvement-streak' && '📈 Sequência de Melhoria'}
                    {achievement === 'quick-learner' && '⚡ Aprendizado Rápido'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default RankingSidebar
