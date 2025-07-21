'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Users,
  TrendingUp,
  Crown,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isRecentActivity } from '@/utils/dateUtils';
import rankingService, { RankingEntry, RankingStats } from '@/services/rankingService';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface CollapsibleRankingProps {
  moduleId?: string;
}

export function CollapsibleRanking({ moduleId }: CollapsibleRankingProps) {
  const { user } = useFirebaseAuth();
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [stats, setStats] = useState<RankingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLimit = 8;

  useEffect(() => {
    loadRankingData();
    
    const unsubscribe = rankingService.subscribeToRanking(
      (newRankings) => {
        setRankings(newRankings);
        setLoading(false);
      },
      user?.id,
      displayLimit
    );

    const handleExerciseCompleted = () => {
      setTimeout(() => {
        loadRankingData();
      }, 1000);
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

      const rankingData = moduleId 
        ? await rankingService.getModuleRanking(moduleId, user?.id, displayLimit)
        : await rankingService.getGeneralRanking(user?.id, displayLimit);
      
      if (rankingData.length === 0) {
        console.log('Nenhum dado real encontrado - exibindo estado vazio');
        setRankings([]);
        
        setStats({
          totalStudents: 0,
          averageScore: 0,
          highestScore: 0,
          userPosition: 0
        });
      } else {
        setRankings(rankingData);
        const statsData = await rankingService.getRankingStats(user?.id);
        setStats(statsData);
      }
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
      // Em caso de erro, exibir estado de erro apropriado
      setError('Não foi possível carregar o ranking. Tente novamente.');
      setRankings([]);
      
      setStats({
        totalStudents: 0,
        averageScore: 0,
        highestScore: 0,
        userPosition: 0
      });
    } finally {
      setLoading(false);
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
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">#{position}</span>;
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

  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-40">
      <AnimatePresence>
        {collapsed ? (
          // Aba recolhida
          <motion.div
            initial={{ x: 240 }}
            animate={{ x: 0 }}
            exit={{ x: 240 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white border border-r-0 border-gray-200 rounded-l-lg shadow-lg cursor-pointer"
            onClick={() => setCollapsed(false)}
          >
            <div className="p-3 flex flex-col items-center space-y-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div className="text-xs font-semibold text-gray-700 writing-mode-vertical-rl transform rotate-180">
                Ranking
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </div>
          </motion.div>
        ) : (
          // Painel expandido
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-80"
          >
            <Card className="border-r-0 rounded-r-none shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">
                      {moduleId ? 'Ranking do Módulo' : 'Ranking Geral'}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(true)}
                    className="p-1 h-6 w-6"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                {stats && (
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

              <CardContent className="pt-0 max-h-96 overflow-y-auto">
                {loading ? (
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
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadRankingData}
                      className="mt-2"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                ) : rankings.length === 0 ? (
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
                          flex items-center justify-between p-3 rounded-lg border transition-all
                          ${entry.isCurrentUser 
                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-100' 
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                            ${getPositionColor(entry.position)}
                          `}>
                            {entry.position <= 3 ? getRankIcon(entry.position) : entry.position}
                          </div>

                          <div className="min-w-0 flex-1">
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

                        {entry.lastActivity && (
                          <div className="flex items-center space-x-1">
                            <div className={`
                              w-2 h-2 rounded-full
                              ${isRecentActivity(entry.lastActivity)
                                ? 'bg-green-400' : 'bg-gray-300'
                              }
                            `} />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {rankings.length === displayLimit && (
                      <div className="text-center pt-3">
                        <p className="text-xs text-gray-500">
                          Top {displayLimit} estudantes
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CollapsibleRanking;