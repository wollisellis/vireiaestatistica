'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Award,
  Star,
  Users,
  TrendingUp,
  Crown,
  User,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface StudentRanking {
  studentId: string;
  studentName: string;
  anonymousId: string;
  totalScore: number;
  position: number;
  isCurrentUser?: boolean;
  lastActivity?: Date;
}

interface SimpleRankingPanelProps {
  className?: string;
  compact?: boolean;
  currentUserId?: string;
  limit?: number;
}

export function SimpleRankingPanel({
  className = '',
  compact = false,
  currentUserId,
  limit = 8
}: SimpleRankingPanelProps) {
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRankingData();
  }, [currentUserId, limit]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [SimpleRanking] Carregando dados de ranking...');

      // Buscar dados de unified_scores
      const scoresSnapshot = await getDocs(collection(db, 'unified_scores'));
      
      if (scoresSnapshot.empty) {
        console.log('📝 [SimpleRanking] Nenhum score unificado, buscando quiz_attempts...');
        await loadFromQuizAttempts();
        return;
      }

      const studentsData: StudentRanking[] = [];

      for (const scoreDoc of scoresSnapshot.docs) {
        const scoreData = scoreDoc.data();
        const studentId = scoreDoc.id;

        try {
          // Buscar dados do usuário
          const userDoc = await getDoc(doc(db, 'users', studentId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          // Verificar se tem pontuação válida
          const totalScore = scoreData.normalizedScore || scoreData.totalScore || 0;
          
          if (totalScore > 0) {
            studentsData.push({
              studentId: studentId,
              studentName: userData.fullName || userData.name || 'Estudante',
              anonymousId: userData.anonymousId || studentId.slice(-4),
              totalScore: Math.round(totalScore),
              position: 0, // Será definido após ordenação
              isCurrentUser: studentId === currentUserId,
              lastActivity: scoreData.lastActivity?.toDate?.() || userData.lastActivity?.toDate?.()
            });
          }
        } catch (error) {
          console.error(`[SimpleRanking] Erro ao processar ${studentId}:`, error);
        }
      }

      // Ordenar por pontuação e definir posições
      studentsData.sort((a, b) => b.totalScore - a.totalScore);
      studentsData.forEach((student, index) => {
        student.position = index + 1;
      });

      // Limitar resultados
      const limitedData = studentsData.slice(0, limit);
      
      console.log(`✅ [SimpleRanking] Carregados ${limitedData.length} estudantes`);
      setRankings(limitedData);

    } catch (err) {
      console.error('❌ [SimpleRanking] Erro ao carregar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const loadFromQuizAttempts = async () => {
    try {
      const attemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
      
      if (attemptsSnapshot.empty) {
        console.log('❌ [SimpleRanking] Nenhum dado encontrado');
        setRankings([]);
        return;
      }

      // Agrupar por estudante
      const studentAttempts: { [key: string]: any[] } = {};
      
      attemptsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.studentId && data.passed === true) {
          if (!studentAttempts[data.studentId]) {
            studentAttempts[data.studentId] = [];
          }
          studentAttempts[data.studentId].push(data);
        }
      });

      const studentsData: StudentRanking[] = [];

      for (const [studentId, attempts] of Object.entries(studentAttempts)) {
        try {
          const userDoc = await getDoc(doc(db, 'users', studentId));
          const userData = userDoc.exists() ? userDoc.data() : {};

          // Agrupar tentativas por módulo e calcular pontuação ponderada
          const moduleScores: { [moduleId: string]: number } = {};
          attempts.forEach(attempt => {
            const moduleId = attempt.moduleId;
            if (moduleId && !moduleScores[moduleId]) {
              moduleScores[moduleId] = attempt.percentage || 0;
            } else if (moduleId && moduleScores[moduleId] < (attempt.percentage || 0)) {
              // Manter a melhor pontuação do módulo
              moduleScores[moduleId] = attempt.percentage || 0;
            }
          });

          // Aplicar pesos dos módulos (consistente com unifiedScoringService)
          const moduleWeights = {
            'module-1': 70,
            'module-2': 30,
            'module-3': 100,
            'module-4': 100
          };

          let totalWeightedScore = 0;
          let totalWeight = 0;
          Object.entries(moduleScores).forEach(([moduleId, score]) => {
            const weight = moduleWeights[moduleId] || 100;
            totalWeightedScore += (score * weight) / 100;
            totalWeight += weight;
          });

          const avgScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

          studentsData.push({
            studentId: studentId,
            studentName: userData.fullName || userData.name || 'Estudante',
            anonymousId: userData.anonymousId || studentId.slice(-4),
            totalScore: Math.round(avgScore),
            position: 0,
            isCurrentUser: studentId === currentUserId
          });
        } catch (error) {
          console.error(`[SimpleRanking] Erro ao processar ${studentId}:`, error);
        }
      }

      // Ordenar e definir posições
      studentsData.sort((a, b) => b.totalScore - a.totalScore);
      studentsData.forEach((student, index) => {
        student.position = index + 1;
      });

      setRankings(studentsData.slice(0, limit));

    } catch (error) {
      console.error('❌ [SimpleRanking] Erro ao carregar quiz attempts:', error);
      setError('Erro ao carregar dados');
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="text-xs font-bold text-gray-500">#{position}</span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };

  if (loading) {
    return (
      <Card className={`${className} border-0 shadow-lg`}>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                🏆 Carregando Ranking...
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-4 bg-gray-100 rounded-xl">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-0 shadow-lg bg-red-50`}>
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">
            ⚠️ Ops! Algo deu errado
          </h3>
          <p className="text-sm text-gray-600 mb-4">Nenhum estudante encontrado no sistema</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadRankingData}
            className="bg-white hover:bg-red-50 border-red-200 text-red-700"
          >
            🔄 Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} bg-white border border-gray-200 shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                🏆 Ranking Geral
              </h3>
              <p className="text-xs text-gray-500">
                {rankings.length} estudante{rankings.length !== 1 ? 's' : ''} ativo{rankings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRankingData}
            className="p-2 text-gray-500 hover:text-blue-600"
            title="Atualizar ranking"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {rankings.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhum resultado ainda</p>
            <p className="text-xs text-gray-400 mt-1">
              Complete exercícios para aparecer no ranking!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((student, index) => (
              <motion.div
                key={student.studentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg
                  ${student.isCurrentUser
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 ring-2 ring-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {/* Posição e Info */}
                <div className="flex items-center space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
                    ${getPositionColor(student.position)}
                  `}>
                    {student.position <= 3 ? getRankIcon(student.position) : student.position}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-semibold text-gray-900">
                        #{student.anonymousId}
                      </p>
                      {student.isCurrentUser && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Você
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">
                        {student.totalScore} pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicador de pontuação */}
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  student.totalScore >= 90 ? 'bg-green-100 text-green-800' :
                  student.totalScore >= 70 ? 'bg-blue-100 text-blue-800' :
                  student.totalScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {student.totalScore >= 70 && '✅ '}
                  {student.totalScore}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SimpleRankingPanel;