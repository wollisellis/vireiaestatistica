'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Target, 
  Award,
  Zap,
  Medal,
  ChevronUp,
  ChevronDown,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import type { GameScore } from '@/contexts/StudentProgressContext'

interface ScoreFeedbackProps {
  gameScore: GameScore
  currentRank: number
  previousRank?: number
  onPlayAgain?: () => void
  onContinue?: () => void
  className?: string
}

const ScoreFeedback: React.FC<ScoreFeedbackProps> = ({
  gameScore,
  currentRank,
  previousRank,
  onPlayAgain,
  onContinue,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excelente'
    if (score >= 75) return 'Bom'
    if (score >= 60) return 'Regular'
    return 'Precisa Melhorar'
  }

  const getMotivationalMessage = (score: number, isPersonalBest: boolean, attempt: number) => {
    if (score === 100) {
      return "🎯 Perfeito! Você domina completamente este conteúdo!"
    }
    if (isPersonalBest && attempt > 1) {
      return "📈 Excelente melhoria! Seu esforço está dando resultado!"
    }
    if (score >= 90) {
      return "🌟 Desempenho excepcional! Continue assim!"
    }
    if (score >= 75) {
      return "👏 Bom trabalho! Você está no caminho certo!"
    }
    if (score >= 60) {
      return "💪 Continue praticando! Você pode melhorar ainda mais!"
    }
    return "📚 Revise o conteúdo e tente novamente. Você consegue!"
  }

  const getAcademicFeedback = (score: number, gameId: number) => {
    const gameTopics = {
      1: 'avaliação antropométrica e indicadores nutricionais',
      4: 'interpretação de curvas de crescimento e percentis'
    }

    const topic = gameTopics[gameId as keyof typeof gameTopics] || 'conceitos nutricionais'

    if (score >= 90) {
      return `Demonstrou excelente compreensão dos conceitos de ${topic}. Está preparado(a) para aplicar estes conhecimentos na prática clínica.`
    }
    if (score >= 75) {
      return `Boa compreensão dos fundamentos de ${topic}. Recomenda-se revisar alguns conceitos específicos para aprimoramento.`
    }
    if (score >= 60) {
      return `Compreensão básica de ${topic}. É importante revisar o material teórico e praticar mais exercícios.`
    }
    return `Recomenda-se estudo mais aprofundado dos conceitos de ${topic} antes de prosseguir.`
  }

  const rankChange = previousRank ? previousRank - currentRank : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`max-w-2xl mx-auto ${className}`}
    >
      <Card className="border-2 border-emerald-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4"
          >
            {gameScore.normalizedScore >= 90 ? (
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            ) : gameScore.normalizedScore >= 75 ? (
              <Medal className="w-16 h-16 text-blue-500 mx-auto" />
            ) : (
              <Target className="w-16 h-16 text-emerald-500 mx-auto" />
            )}
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900">
            Jogo Concluído!
          </h2>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className={`${getScoreColor(gameScore.normalizedScore)} bg-opacity-10 border-0 text-lg px-4 py-1`}>
              {getScoreGrade(gameScore.normalizedScore)}
            </Badge>
            {gameScore.isPersonalBest && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="w-3 h-3 mr-1" />
                Recorde Pessoal!
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <div className={`text-6xl font-bold ${getScoreColor(gameScore.normalizedScore)}`}>
                {gameScore.normalizedScore}
                <span className="text-2xl text-gray-500">/100</span>
              </div>
              <div className="text-lg text-gray-600">
                {gameScore.exercisesCompleted} de {gameScore.totalExercises} exercícios corretos
              </div>
            </div>

            <Progress 
              value={gameScore.normalizedScore} 
              className="h-4 w-full max-w-md mx-auto"
            />
          </div>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-lg font-medium text-emerald-800">
              {getMotivationalMessage(gameScore.normalizedScore, gameScore.isPersonalBest, gameScore.attempt)}
            </p>
          </div>

          {/* Academic Feedback */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Avaliação Acadêmica:</h4>
            <p className="text-blue-800 text-sm leading-relaxed">
              {getAcademicFeedback(gameScore.normalizedScore, gameScore.gameId)}
            </p>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">#{currentRank}</div>
              <div className="text-sm text-gray-600">Posição</div>
              {rankChange !== 0 && (
                <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${
                  rankChange > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rankChange > 0 ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      +{rankChange}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      {rankChange}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{gameScore.attempt}</div>
              <div className="text-sm text-gray-600">Tentativa</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(gameScore.timeElapsed / 60)}:{(gameScore.timeElapsed % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">Tempo</div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {gameScore.previousBestScore ? `+${gameScore.normalizedScore - gameScore.previousBestScore}` : gameScore.normalizedScore}
              </div>
              <div className="text-sm text-gray-600">
                {gameScore.previousBestScore ? 'Melhoria' : 'Pontos'}
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          {gameScore.normalizedScore < 100 && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">💡 Dicas para Melhorar:</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Revise o conteúdo educacional antes de jogar novamente</li>
                <li>• Pratique os conceitos que apresentaram maior dificuldade</li>
                <li>• Consulte materiais complementares sobre o tema</li>
                <li>• Discuta dúvidas com colegas ou professores</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {onPlayAgain && (
              <Button
                onClick={onPlayAgain}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Jogar Novamente
              </Button>
            )}
            
            {onContinue && (
              <Button
                onClick={onContinue}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Continuar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ScoreFeedback
