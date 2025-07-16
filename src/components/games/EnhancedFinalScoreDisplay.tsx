'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  BarChart3, 
  Home, 
  RefreshCw, 
  Award,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Zap,
  Brain,
  Users,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useRouter } from 'next/navigation'
import { ScoreCalculation, AdvancedScoringSystem } from '@/lib/scoringSystem'
import { ScoreDisplay } from '@/components/scoring/ScoreDisplay'

interface EnhancedFinalScoreDisplayProps {
  gameId: number
  gameTitle: string
  score: number
  maxScore: number
  timeElapsed: number
  accuracy: number
  onRestart?: () => void
  onComplete: () => void
  scoreCalculation?: ScoreCalculation
  showAdvancedScoring?: boolean
  strengthAreas?: string[]
  improvementAreas?: string[]
  recommendations?: string[]
}

export function EnhancedFinalScoreDisplay({
  gameId,
  gameTitle,
  score,
  maxScore,
  timeElapsed,
  accuracy,
  onRestart,
  onComplete,
  scoreCalculation,
  showAdvancedScoring = true,
  strengthAreas = [],
  improvementAreas = [],
  recommendations = []
}: EnhancedFinalScoreDisplayProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)
  
  // Calculate performance metrics
  const normalizedScore = scoreCalculation 
    ? AdvancedScoringSystem.calculateNormalizedScore(scoreCalculation)
    : Math.round((score / maxScore) * 100)
    
  const performanceRating = AdvancedScoringSystem.getPerformanceRating(normalizedScore)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header with confetti animation */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-t-2xl text-white">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-2">{gameTitle} Concluído!</h2>
            <p className="text-lg opacity-90">Parabéns pelo seu desempenho!</p>
          </motion.div>
          
          {/* Animated trophy */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-4 right-4"
          >
            <Trophy className="w-12 h-12 text-yellow-300" />
          </motion.div>
        </div>

        <div className="p-8">
          {/* Main Score Display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${
              performanceRating.color === 'purple' ? 'bg-purple-100' :
              performanceRating.color === 'green' ? 'bg-green-100' :
              performanceRating.color === 'blue' ? 'bg-blue-100' :
              performanceRating.color === 'yellow' ? 'bg-yellow-100' :
              performanceRating.color === 'orange' ? 'bg-orange-100' :
              'bg-red-100'
            } mb-4`}>
              <span className={`text-5xl font-bold ${
                performanceRating.color === 'purple' ? 'text-purple-600' :
                performanceRating.color === 'green' ? 'text-green-600' :
                performanceRating.color === 'blue' ? 'text-blue-600' :
                performanceRating.color === 'yellow' ? 'text-yellow-600' :
                performanceRating.color === 'orange' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {normalizedScore}%
              </span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-4xl">{performanceRating.emoji}</span>
              <h3 className="text-2xl font-bold text-gray-900">{performanceRating.rating}</h3>
            </div>
            
            <p className="text-gray-600">{performanceRating.message}</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Pontuação</p>
                <p className="text-xl font-bold text-gray-900">
                  {scoreCalculation ? scoreCalculation.finalScore : score}/{maxScore}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Tempo</p>
                <p className="text-xl font-bold text-gray-900">{formatTime(timeElapsed)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Precisão</p>
                <p className="text-xl font-bold text-gray-900">{accuracy}%</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Advanced Scoring Details */}
          {showAdvancedScoring && scoreCalculation && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Ver Detalhamento da Pontuação
                </span>
                {showDetails ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4">
                      <ScoreDisplay 
                        scoreCalculation={scoreCalculation} 
                        showAnimation={false}
                        compact={false}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Achievement Badges */}
          {scoreCalculation && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Conquistas Desbloqueadas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scoreCalculation.breakdown.accuracy === 100 && (
                  <AchievementBadge
                    icon={<Star className="w-6 h-6" />}
                    title="Perfeição"
                    description="100% de precisão"
                    color="yellow"
                  />
                )}
                
                {scoreCalculation.breakdown.maxStreak >= 5 && (
                  <AchievementBadge
                    icon={<TrendingUp className="w-6 h-6" />}
                    title="Em Sequência"
                    description={`${scoreCalculation.breakdown.maxStreak} acertos seguidos`}
                    color="purple"
                  />
                )}
                
                {scoreCalculation.timeBonus > 25 && (
                  <AchievementBadge
                    icon={<Zap className="w-6 h-6" />}
                    title="Velocista"
                    description="Resposta rápida"
                    color="blue"
                  />
                )}
                
                {scoreCalculation.breakdown.hintsUsed === 0 && (
                  <AchievementBadge
                    icon={<Brain className="w-6 h-6" />}
                    title="Autodidata"
                    description="Sem usar dicas"
                    color="green"
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Strengths and Areas for Improvement */}
          {(strengthAreas.length > 0 || improvementAreas.length > 0) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid md:grid-cols-2 gap-6 mb-8"
            >
              {strengthAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="text-sm font-semibold text-green-700 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Pontos Fortes
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {strengthAreas.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {improvementAreas.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="text-sm font-semibold text-orange-700 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Áreas para Melhorar
                    </h4>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          <span className="text-sm text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mb-8"
            >
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <h4 className="text-sm font-semibold text-blue-900">
                    💡 Recomendações para Próximos Passos
                  </h4>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-800">
                        {index + 1}. {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {onRestart && (
              <Button
                variant="outline"
                onClick={onRestart}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Jogar Novamente
              </Button>
            )}
            
            <Button
              onClick={onComplete}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar aos Jogos
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Achievement Badge Component
function AchievementBadge({ 
  icon, 
  title, 
  description, 
  color 
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'yellow' | 'purple' | 'blue' | 'green'
}) {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    green: 'bg-green-100 text-green-700 border-green-300'
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={`p-4 rounded-lg border ${colorClasses[color]} text-center`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <h5 className="font-semibold text-sm">{title}</h5>
      <p className="text-xs mt-1 opacity-80">{description}</p>
    </motion.div>
  )
}