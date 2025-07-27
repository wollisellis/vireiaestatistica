'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  ChevronUp, 
  ChevronDown,
  Star,
  Users,
  TrendingUp,
  Crown,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isRecentActivity } from '@/utils/dateUtils';
import rankingService, { RankingEntry, RankingStats } from '@/services/rankingService';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface RankingPanelProps {
  className?: string;
  compact?: boolean;
  showStats?: boolean;
  moduleId?: string; // Para ranking específico de módulo
}

// Função para buscar dados reais de estudantes que completaram atividades
async function generateRealRankingData(): Promise<RankingEntry[]> {
  try {
    console.log('🔍 Buscando dados reais de estudantes...');

    // 1. Buscar estudantes matriculados
    const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
    const enrolledStudents: { [key: string]: any } = {};

    classStudentsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.status === 'accepted' && data.studentId) {
        enrolledStudents[data.studentId] = {
          studentName: data.studentName,
          anonymousId: data.anonymousId,
          className: data.className
        };
      }
    });

    console.log(`Estudantes matriculados encontrados: ${Object.keys(enrolledStudents).length}`);

    // 2. Buscar progresso de jogos
    const gameProgressSnapshot = await getDocs(collection(db, 'gameProgress'));
    const studentGameScores: { [key: string]: any[] } = {};

    gameProgressSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId && data.score && data.completed && enrolledStudents[data.userId]) {
        if (!studentGameScores[data.userId]) {
          studentGameScores[data.userId] = [];
        }
        studentGameScores[data.userId].push({
          gameId: data.gameId,
          score: data.normalizedScore || data.score,
          completedAt: data.completedAt
        });
      }
    });

    console.log(`Estudantes com progresso de jogos: ${Object.keys(studentGameScores).length}`);

    // 3. Buscar progresso de módulos
    const moduleProgressSnapshot = await getDocs(collection(db, 'student_module_progress'));
    const studentModuleScores: { [key: string]: any[] } = {};

    moduleProgressSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.score && data.isCompleted && enrolledStudents[data.studentId]) {
        if (!studentModuleScores[data.studentId]) {
          studentModuleScores[data.studentId] = [];
        }
        studentModuleScores[data.studentId].push({
          moduleId: data.moduleId,
          score: data.score,
          completedAt: data.updatedAt
        });
      }
    });

    console.log(`Estudantes com progresso de módulos: ${Object.keys(studentModuleScores).length}`);

    // 4. Combinar dados e calcular ranking
    const rankingData: RankingEntry[] = [];
    const allStudentIds = new Set([
      ...Object.keys(studentGameScores),
      ...Object.keys(studentModuleScores)
    ]);

    allStudentIds.forEach(studentId => {
      const student = enrolledStudents[studentId];
      if (!student) return;

      const gameScores = studentGameScores[studentId] || [];
      const moduleScores = studentModuleScores[studentId] || [];

      // Calcular pontuação total
      const totalGameScore = gameScores.reduce((sum, game) => sum + game.score, 0);
      const totalModuleScore = moduleScores.reduce((sum, module) => sum + module.score, 0);
      const totalScore = totalGameScore + totalModuleScore;

      // Calcular pontuação normalizada
      const totalActivities = gameScores.length + moduleScores.length;
      const normalizedScore = totalActivities > 0 ? Math.round(totalScore / totalActivities) : 0;

      if (totalScore > 0) {
        // Preparar moduleScores object
        const moduleScoresObj: { [key: string]: number } = {};
        moduleScores.forEach(module => {
          moduleScoresObj[module.moduleId] = module.score;
        });

        rankingData.push({
          studentId: studentId,
          anonymousId: student.anonymousId || 'N/A',
          fullName: student.studentName || 'Estudante',
          totalScore: Math.round(totalScore),
          normalizedScore: normalizedScore,
          moduleScores: moduleScoresObj,
          position: 0, // Será definido após ordenação
          lastActivity: new Date(),
          isCurrentUser: false
        });
      }
    });

    // Ordenar por pontuação e definir posições
    rankingData.sort((a, b) => b.totalScore - a.totalScore);
    rankingData.forEach((entry, index) => {
      entry.position = index + 1;
    });

    console.log(`Ranking gerado com ${rankingData.length} estudantes`);
    return rankingData;

  } catch (error) {
    console.error('Erro ao gerar ranking real:', error);
    return [];
  }
}

export function RankingPanel({ 
  className = '', 
  compact = false, 
  showStats = true,
  moduleId 
}: RankingPanelProps) {
  const { user } = useFirebaseAuth();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [stats, setStats] = useState<RankingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [error, setError] = useState<string | null>(null);

  const displayLimit = compact ? 5 : 8;

  useEffect(() => {
    loadRankingData();
    
    // Subscription para atualizações em tempo real
    const unsubscribe = rankingService.subscribeToRanking(
      (newRankings) => {
        setRankings(newRankings);
        setLoading(false);
      },
      user?.id,
      displayLimit
    );

    // Listener para atualizações após exercícios completados
    const handleExerciseCompleted = () => {
      console.log('Exercício completado - atualizando ranking...');
      setTimeout(() => {
        loadRankingData();
      }, 1000); // Delay para permitir que o Firebase processe primeiro
    };

    window.addEventListener('exerciseCompleted', handleExerciseCompleted);

    return () => {
      unsubscribe();
      window.removeEventListener('exerciseCompleted', handleExerciseCompleted);
    };
  }, [user?.id, moduleId, displayLimit]);

  const loadRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar ranking
      const rankingData = moduleId 
        ? await rankingService.getModuleRanking(moduleId, user?.id, displayLimit)
        : await rankingService.getGeneralRanking(user?.id, displayLimit);
      
      // Se não há dados reais, tentar buscar dados de estudantes que completaram atividades
      if (rankingData.length === 0) {
        console.log('Nenhum dado real encontrado - tentando buscar dados de estudantes ativos');

        try {
          // Buscar dados reais de estudantes que completaram atividades
          const realRankingData = await generateRealRankingData();

          if (realRankingData.length > 0) {
            console.log(`Encontrados ${realRankingData.length} estudantes com atividades completadas`);
            setRankings(realRankingData);

            if (showStats) {
              setStats({
                totalStudents: realRankingData.length,
                averageScore: Math.round(realRankingData.reduce((acc, s) => acc + s.normalizedScore, 0) / realRankingData.length),
                highestScore: Math.max(...realRankingData.map(s => s.normalizedScore)),
                userPosition: realRankingData.findIndex(s => s.isCurrentUser) + 1
              });
            }
          } else {
            console.log('Nenhum estudante com atividades completadas encontrado');
            setRankings([]);

            if (showStats) {
              setStats({
                totalStudents: 0,
                averageScore: 0,
                highestScore: 0,
                userPosition: 0
              });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar dados reais de estudantes:', error);
          setRankings([]);

          if (showStats) {
            setStats({
              totalStudents: 0,
              averageScore: 0,
              highestScore: 0,
              userPosition: 0
            });
          }
        }
      } else {
        setRankings(rankingData);
        
        // Carregar estatísticas se solicitado
        if (showStats) {
          const statsData = await rankingService.getRankingStats(user?.id);
          setStats(statsData);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      // Em caso de erro, exibir estado de erro apropriado
      setError('Não foi possível carregar o ranking. Tente novamente.');
      setRankings([]);
      
      if (showStats) {
        setStats({
          totalStudents: 0,
          averageScore: 0,
          highestScore: 0,
          userPosition: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{position}</span>;
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

  const formatScore = (score: number) => {
    return Math.round(score).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Ranking</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadRankingData}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">
              {moduleId ? 'Ranking do Módulo' : 'Ranking Geral'}
            </h3>
          </div>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="p-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
        
        {showStats && stats && expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{stats.totalStudents} estudantes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Média: {formatScore(stats.averageScore)}</span>
                </div>
              </div>
            </div>
            {user && stats.userPosition > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                <p className="text-xs text-blue-800">
                  <strong>Sua posição: #{stats.userPosition}</strong>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
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
                  {rankings.map((entry, index) => (
                    <motion.div
                      key={entry.studentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border transition-all
                        ${entry.isCurrentUser 
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      {/* Lado Esquerdo: Posição e Info */}
                      <div className="flex items-center space-x-3">
                        {/* Posição */}
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                          ${getPositionColor(entry.position)}
                        `}>
                          {entry.position <= 3 ? getRankIcon(entry.position) : entry.position}
                        </div>

                        {/* Informações do estudante */}
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              ID: {entry.anonymousId}
                            </p>
                            {entry.isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                Você
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {formatScore(entry.totalScore)} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lado Direito: Atividade e Progresso */}
                      <div className="flex items-center space-x-2">
                        {/* Indicador de atividade recente */}
                        {entry.lastActivity && (
                          <div className="flex items-center space-x-1">
                            <div className={`
                              w-2 h-2 rounded-full
                              ${isRecentActivity(entry.lastActivity)
                                ? 'bg-green-400' : 'bg-gray-300'
                              }
                            `} />
                            <span className="text-xs text-gray-500">
                              {isRecentActivity(entry.lastActivity)
                                ? 'Ativo' : 'Offline'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {rankings.length === displayLimit && (
                    <div className="text-center pt-3">
                      <p className="text-xs text-gray-500">
                        Mostrando top {displayLimit} estudantes
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default RankingPanel;