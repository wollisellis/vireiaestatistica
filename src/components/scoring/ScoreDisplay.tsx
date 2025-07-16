'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Star,
  AlertCircle,
  Clock,
  BarChart3,
  Award
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { ScoreCalculation } from '@/lib/scoringSystem'

interface ScoreDisplayProps {
  scoreCalculation: ScoreCalculation
  showAnimation?: boolean
  compact?: boolean
}

export function ScoreDisplay({ 
  scoreCalculation, 
  showAnimation = true,
  compact = false 
}: ScoreDisplayProps) {
  const { finalScore, breakdown } = scoreCalculation
  
  // Calculate normalized score (0-100)
  const normalizedScore = Math.min(100, Math.round((finalScore / (breakdown.totalQuestions * 300)) * 100))
  
  // Get performance rating
  const getPerformanceRating = () => {
    if (normalizedScore >= 95) return { label: 'Excepcional', color: 'text-purple-600', bg: 'bg-purple-100' }
    if (normalizedScore >= 85) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' }
    if (normalizedScore >= 70) return { label: 'Muito Bom', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (normalizedScore >= 60) return { label: 'Bom', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (normalizedScore >= 50) return { label: 'Regular', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { label: 'Precisa Melhorar', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const rating = getPerformanceRating()

  if (compact) {
    return (
      <motion.div
        initial={showAnimation ? { opacity: 0, scale: 0.9 } : {}}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Pontuação Final</p>
              <p className="text-2xl font-bold text-gray-900">{finalScore}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${rating.bg}`}>
            <span className={`text-sm font-medium ${rating.color}`}>{rating.label}</span>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Detalhamento da Pontuação</h3>
          <div className={`px-4 py-2 rounded-full ${rating.bg}`}>
            <span className={`font-medium ${rating.color}`}>{rating.label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Final Score Display */}
        <motion.div
          initial={showAnimation ? { opacity: 0, y: 20 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">Pontuação Final</p>
          <p className="text-5xl font-bold text-gray-900">{finalScore}</p>
          <p className="text-sm text-gray-500 mt-2">
            {breakdown.correctAnswers} de {breakdown.totalQuestions} questões corretas
          </p>
        </motion.div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">Componentes da Pontuação</h4>
          
          <AnimatePresence>
            {/* Base Score */}
            <ScoreComponent
              icon={<Target className="w-5 h-5" />}
              label="Pontuação Base"
              value={scoreCalculation.baseScore}
              color="blue"
              delay={0.1}
              showAnimation={showAnimation}
            />

            {/* Time Bonus */}
            {scoreCalculation.timeBonus > 0 && (
              <ScoreComponent
                icon={<Clock className="w-5 h-5" />}
                label="Bônus de Tempo"
                value={`+${scoreCalculation.timeBonus}%`}
                color="green"
                delay={0.2}
                showAnimation={showAnimation}
              />
            )}

            {/* Streak Multiplier */}
            {scoreCalculation.streakMultiplier > 0 && (
              <ScoreComponent
                icon={<TrendingUp className="w-5 h-5" />}
                label="Multiplicador de Sequência"
                value={`+${scoreCalculation.streakMultiplier}%`}
                color="purple"
                delay={0.3}
                showAnimation={showAnimation}
              />
            )}

            {/* Difficulty Multiplier */}
            {scoreCalculation.difficultyMultiplier > 0 && (
              <ScoreComponent
                icon={<BarChart3 className="w-5 h-5" />}
                label="Multiplicador de Dificuldade"
                value={`+${scoreCalculation.difficultyMultiplier}%`}
                color="orange"
                delay={0.4}
                showAnimation={showAnimation}
              />
            )}

            {/* Collaboration Bonus */}
            {scoreCalculation.collaborationBonus > 0 && (
              <ScoreComponent
                icon={<Users className="w-5 h-5" />}
                label="Bônus Colaborativo"
                value={`+${scoreCalculation.collaborationBonus}%`}
                color="indigo"
                delay={0.5}
                showAnimation={showAnimation}
              />
            )}

            {/* Perfect Score Bonus */}
            {scoreCalculation.perfectBonus > 0 && (
              <ScoreComponent
                icon={<Star className="w-5 h-5" />}
                label="Bônus de Pontuação Perfeita"
                value={`+${scoreCalculation.perfectBonus}`}
                color="yellow"
                delay={0.6}
                showAnimation={showAnimation}
              />
            )}

            {/* Penalties */}
            {scoreCalculation.penaltyDeduction > 0 && (
              <ScoreComponent
                icon={<AlertCircle className="w-5 h-5" />}
                label="Penalidades"
                value={`-${scoreCalculation.penaltyDeduction}`}
                color="red"
                delay={0.7}
                showAnimation={showAnimation}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Statistics */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700">Estatísticas de Desempenho</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <StatItem
              label="Precisão"
              value={`${breakdown.accuracy.toFixed(1)}%`}
              icon={<Target className="w-4 h-4" />}
            />
            <StatItem
              label="Sequência Máxima"
              value={`${breakdown.maxStreak} acertos`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatItem
              label="Tempo Médio"
              value={`${breakdown.averageTimePerQuestion.toFixed(1)}s`}
              icon={<Clock className="w-4 h-4" />}
            />
            <StatItem
              label="Dicas Usadas"
              value={breakdown.hintsUsed.toString()}
              icon={<AlertCircle className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Achievement Progress */}
        {normalizedScore >= 70 && (
          <motion.div
            initial={showAnimation ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Conquista Desbloqueada!
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {normalizedScore >= 95 && "Mestre Excepcional - Desempenho extraordinário!"}
                  {normalizedScore >= 85 && normalizedScore < 95 && "Expert em Nutrição - Excelente domínio do conteúdo!"}
                  {normalizedScore >= 70 && normalizedScore < 85 && "Praticante Dedicado - Continue progredindo!"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Score Component Helper
function ScoreComponent({ 
  icon, 
  label, 
  value, 
  color, 
  delay,
  showAnimation 
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  delay: number
  showAnimation: boolean
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    red: 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      initial={showAnimation ? { opacity: 0, x: -20 } : {}}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className={`text-lg font-bold ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]}`}>
        {value}
      </span>
    </motion.div>
  )
}

// Stat Item Helper
function StatItem({ 
  label, 
  value, 
  icon 
}: {
  label: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}