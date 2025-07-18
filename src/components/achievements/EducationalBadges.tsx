'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Award, 
  Scale, 
  BarChart3, 
  Activity, 
  Heart, 
  BookOpen, 
  Target, 
  TrendingUp,
  User,
  Star,
  CheckCircle,
  Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useStudentProgress } from '@/contexts/StudentProgressContext'

// Badges educacionais - APENAS MÓDULO 1
export const EDUCATIONAL_BADGES = {
  // Badge Iniciante
  'imc-beginner': {
    id: 'imc-beginner',
    name: 'Iniciante em IMC',
    description: 'Primeiros passos no cálculo do Índice de Massa Corporal',
    icon: <Scale className="w-6 h-6" />,
    color: 'blue',
    criteria: {
      moduleId: 'module-1',
      minAccuracy: 50,
      requiredConcepts: ['imc']
    },
    educationalValue: 'Primeiro contato com avaliação antropométrica'
  },
  
  // Badge Intermediário
  'anthropometry-student': {
    id: 'anthropometry-student',
    name: 'Estudante de Antropometria',
    description: 'Compreende medidas antropométricas básicas',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'emerald',
    criteria: {
      moduleId: 'module-1',
      minAccuracy: 70,
      requiredConcepts: ['antropometria', 'imc']
    },
    educationalValue: 'Base sólida em medidas corporais'
  },
  
  // Badge Avançado
  'imc-expert': {
    id: 'imc-expert',
    name: 'Expert em IMC e Antropometria',
    description: 'Domina cálculos e interpretações antropométricas',
    icon: <Target className="w-6 h-6" />,
    color: 'purple',
    criteria: {
      moduleId: 'module-1',
      minAccuracy: 85,
      requiredConcepts: ['imc', 'antropometria']
    },
    educationalValue: 'Competência sólida em avaliação antropométrica'
  },
  
  // Badge Mestre
  'anthropometry-master': {
    id: 'anthropometry-master',
    name: 'Mestre em Avaliação Antropométrica',
    description: 'Excelência em todos os aspectos do módulo antropométrico',
    icon: <Star className="w-6 h-6" />,
    color: 'gold',
    criteria: {
      moduleId: 'module-1',
      minAccuracy: 95,
      requiredConcepts: ['imc', 'antropometria', 'percentis', 'curvas']
    },
    educationalValue: 'Excelência completa no módulo fundamental de avaliação nutricional'
  }
}

interface EducationalBadgesProps {
  studentId?: string
  showOnlyEarned?: boolean
  compact?: boolean
}

export const EducationalBadges: React.FC<EducationalBadgesProps> = ({
  studentId,
  showOnlyEarned = false,
  compact = false
}) => {
  const { progress } = useStudentProgress()

  // Verificar quais badges foram conquistados - APENAS MÓDULO 1
  const checkBadgeEarned = (badge: typeof EDUCATIONAL_BADGES[keyof typeof EDUCATIONAL_BADGES]) => {
    const { criteria } = badge

    // Verificar apenas módulo 1
    if (criteria.moduleId === 'module-1') {
      const moduleScore = progress.gameScores.find(score => score.gameId === 1)
      
      if (!moduleScore) return false
      
      const accuracy = (moduleScore.score / moduleScore.maxScore) * 100
      return accuracy >= criteria.minAccuracy
    }

    return false
  }

  const earnedBadges = Object.values(EDUCATIONAL_BADGES).filter(badge => checkBadgeEarned(badge))
  const availableBadges = Object.values(EDUCATIONAL_BADGES).filter(badge => !checkBadgeEarned(badge))

  const displayBadges = showOnlyEarned ? earnedBadges : [...earnedBadges, ...availableBadges]

  if (compact) {
    return (
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Competências Conquistadas
            </h4>
            <Badge className="bg-purple-600 text-white">
              {earnedBadges.length}/{Object.keys(EDUCATIONAL_BADGES).length}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {earnedBadges.slice(0, 3).map(badge => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`p-2 rounded-lg bg-${badge.color}-100 border border-${badge.color}-200`}
              >
                <div className={`text-${badge.color}-600`}>
                  {badge.icon}
                </div>
              </motion.div>
            ))}
            {earnedBadges.length > 3 && (
              <div className="p-2 rounded-lg bg-gray-100 border border-gray-200 flex items-center">
                <span className="text-sm text-gray-600">+{earnedBadges.length - 3}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Competências Educacionais
          </h3>
          <Badge className="bg-purple-600 text-white">
            {earnedBadges.length}/{Object.keys(EDUCATIONAL_BADGES).length} Conquistadas
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badges Conquistados */}
        {earnedBadges.length > 0 && (
          <div>
            <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Competências Dominadas ({earnedBadges.length})
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {earnedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 border-${badge.color}-200 bg-${badge.color}-50`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${badge.color}-100 text-${badge.color}-600`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-semibold text-${badge.color}-800`}>{badge.name}</h5>
                      <p className={`text-sm text-${badge.color}-700 mb-2`}>{badge.description}</p>
                      <p className={`text-xs text-${badge.color}-600 italic`}>
                        {badge.educationalValue}
                      </p>
                    </div>
                    <CheckCircle className={`w-5 h-5 text-${badge.color}-600`} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Disponíveis */}
        {!showOnlyEarned && availableBadges.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Próximas Competências ({availableBadges.length})
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {availableBadges.slice(0, 4).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-200 text-gray-500">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-700">{badge.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <p className="text-xs text-gray-500 italic">
                        {badge.educationalValue}
                      </p>
                    </div>
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Motivação Educacional */}
        {earnedBadges.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">🎓 Progresso Acadêmico</h4>
            <p className="text-purple-700 text-sm">
              Você conquistou {earnedBadges.length} competência{earnedBadges.length > 1 ? 's' : ''} essencial{earnedBadges.length > 1 ? 'is' : ''} 
              para a prática profissional em avaliação nutricional. Continue estudando para dominar todas as habilidades!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}