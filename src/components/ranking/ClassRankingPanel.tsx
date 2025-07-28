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
  GraduationCap,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isRecentActivity } from '@/utils/dateUtils';
import { useFlexibleAccess } from '@/hooks/useRoleRedirect';
import { enhancedClassService } from '@/services/enhancedClassService';
import ProfessorClassService from '@/services/professorClassService';

interface ClassStudent {
  studentId: string;
  studentName: string;
  email: string;
  totalScore: number;
  completedModules: number;
  lastActivity?: Date;
  isCurrentUser?: boolean;
  position?: number;
  anonymousId?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  semester: string;
  year: string;
  studentsCount: number;
}

interface ClassRankingPanelProps {
  className?: string;
  compact?: boolean;
  showStats?: boolean;
  moduleId?: string;
  user?: any; // 🔧 NOVO: Usuário passado como prop
  loading?: boolean; // 🔧 NOVO: Estado de loading
  expanded?: boolean; // 🔧 NOVO: Layout expandido para desktop
  showNames?: boolean; // 🔧 NOVO: Controle de exibição de nomes
}

export function ClassRankingPanel({
  className = '',
  compact = false,
  showStats = true,
  moduleId,
  user: propUser,
  loading: propLoading,
  expanded = false,
  showNames = false
}: ClassRankingPanelProps) {
  console.log(`🔧 [ClassRankingPanel] Componente renderizado! moduleId: ${moduleId}`);

  // 🔧 NOVO: Usar usuário da prop ou do contexto como fallback
  const { user: contextUser } = useFlexibleAccess();
  const user = propUser || contextUser;
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLimit = compact ? 5 : (expanded ? 10 : 8);

  // 🎯 HYDRATION EFFECT - Carrega localStorage após hidratação
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    console.log(`🔧 [ClassRankingPanel] useEffect executado:`, {
      propUser: propUser,
      contextUser: contextUser,
      finalUser: user,
      userType: typeof user,
      userId: user?.id || user?.uid,
      userEmail: user?.email,
      userRole: user?.role,
      propLoading: propLoading,
      moduleId: moduleId
    });

    // 🎯 AGUARDAR: Aguardar usuário estar disponível
    if (user === null) {
      console.log(`🔧 [ClassRankingPanel] Usuário ainda carregando...`);
      return; // Aguardar próximo render
    }

    if (user === undefined) {
      console.log(`🔧 [ClassRankingPanel] Usuário undefined, aguardando...`);
      return; // Aguardar próximo render
    }

    if (user?.id || user?.uid) {
      const userId = user.id || user.uid;
      console.log(`🔧 [ClassRankingPanel] Usuário logado (${userId}), chamando loadClassRankingData...`);
      loadClassRankingData();
    } else {
      console.log(`🔧 [ClassRankingPanel] Usuário sem ID válido, setLoading(false)`);
      setLoading(false);
    }
  }, [user, moduleId, propUser, contextUser]);

  // 🚀 OTIMIZAÇÃO: Atualização automática do ranking a cada 60 segundos (otimizado para performance)
  useEffect(() => {
    if (user?.id && (user.role === 'student' || user.role === 'professor')) {
      const interval = setInterval(() => {
        console.log('🔄 Atualização automática do ranking (60s)...');
        loadClassRankingData();
      }, 180000); // Atualizado: 3 minutos (180 segundos) para reduzir atualizações

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // 🚀 MELHORADO: Listener otimizado para atualização quando módulo é completado
  useEffect(() => {
    const handleModuleCompleted = (event: any) => {
      const eventDetail = event.detail || {};
      console.log('🎯 Evento moduleCompleted recebido:', {
        userId: eventDetail.userId,
        moduleId: eventDetail.moduleId,
        score: eventDetail.score,
        percentage: eventDetail.percentage,
        passed: eventDetail.passed
      });
      
      // Atualização com delay específico por usuário para evitar conflitos
      const isCurrentUser = eventDetail.userId === user?.id;
      const updateDelay = isCurrentUser ? 2000 : 5000; // Usuário atual: 2s, outros: 5s
      
      setTimeout(() => {
        console.log(`📊 Atualizando ranking após conclusão (delay: ${updateDelay}ms)...`);
        loadClassRankingData();
      }, updateDelay);
    };

    window.addEventListener('moduleCompleted', handleModuleCompleted);
    
    return () => {
      window.removeEventListener('moduleCompleted', handleModuleCompleted);
    };
  }, [user?.id]);

  const loadClassRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      let targetClasses = [];
      let allClasses = [];

      // Buscar como professor (turmas que administra)
      try {
        const professorClasses = await ProfessorClassService.getProfessorClasses(user.id);
        if (professorClasses && professorClasses.length > 0) {
          allClasses.push(...professorClasses);
        }
      } catch (error) {
        // Silently handle error
      }

      // Buscar como estudante (turmas em que está matriculado)
      try {
        const studentClasses = await ProfessorClassService.getStudentClasses(user.id);
        if (studentClasses && studentClasses.length > 0) {
          allClasses.push(...studentClasses);
        }
      } catch (error) {
        // Silently handle error
      }

      // Remover duplicatas (caso esteja como professor e estudante na mesma turma)
      targetClasses = allClasses.filter((classe, index, self) =>
        index === self.findIndex(c => c.id === classe.id)
      );

      if (!targetClasses || targetClasses.length === 0) {
        // Sem turmas encontradas

        setError('Nenhum estudante encontrado no sistema');
        setLoading(false);
        return;
      }

      // Usar a primeira turma encontrada
      const firstClass = targetClasses[0];

      setClassInfo({
        id: firstClass.id,
        name: firstClass.name,
        semester: firstClass.semester,
        year: firstClass.year,
        studentsCount: firstClass.studentsCount
      });

      let studentsData = await enhancedClassService.getClassStudents(firstClass.id);

      // Fallback: Se não encontrar estudantes via users, buscar diretamente de classStudents
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        studentsData = await enhancedClassService.getClassStudentsDirectly(firstClass.id);
      }

      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        setError('Nenhum estudante encontrado na turma');
        return;
      }

      // Transformar dados usando a mesma lógica da página do professor
      const transformedStudents: ClassStudent[] = studentsData.map((student: any) => {
        const studentScore = student.normalizedScore || student.totalScore || 0;
        const studentId = student.studentId || student.id || student.uid || '';
        const isCurrentUser = studentId === user.id;

        return {
          studentId,
          studentName: student.studentName || student.name || student.displayName || `Estudante (${studentId.slice(-6)})`,
          email: student.email || '',
          totalScore: Math.min(100, Math.max(0, studentScore)), // Escala 0-100 sem arredondamento
          completedModules: student.completedModules || (studentScore > 0 ? 1 : 0),
          lastActivity: student.lastActivity ? new Date(student.lastActivity) : new Date(),
          isCurrentUser,
          anonymousId: student.anonymousId || studentId.slice(-4) // Usa anonymousId se disponível
        };
      });

      // Ordenar por pontuação e definir posições
      const sortedStudents = transformedStudents
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((student, index) => ({
          ...student,
          position: index + 1
        }))
        .slice(0, displayLimit);

      setClassStudents(sortedStudents);

    } catch (err) {
      setError('Erro ao carregar dados da turma');
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

  const formatScore = (score: number) => {
    // Mostrar até 1 casa decimal se necessário, sem arredondamento
    const truncated = Math.trunc(score * 10) / 10;
    return truncated % 1 === 0 ? truncated.toString() : truncated.toFixed(1);
  };

  if (loading || !isHydrated) {
    return (
      <Card className={`${className} border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50`}>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                🏆 Carregando Ranking...
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Buscando dados da turma
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
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
      <Card className={`${className} border-0 shadow-lg bg-gradient-to-br from-red-50 to-pink-50`}>
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base mb-2">
            ⚠️ Ops! Algo deu errado
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadClassRankingData}
            className="bg-white hover:bg-red-50 border-red-200 text-red-700 hover:border-red-300"
          >
            🔄 Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user || (user.role !== 'student' && user.role !== 'professor')) {
    return null;
  }

  return (
    <Card className={`${className} bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 text-base">
                🏆 Ranking da Turma
              </h3>
              {classInfo && (
                <p className="text-sm text-gray-600 mt-1 font-medium truncate">
                  {classInfo.name}
                  {classInfo.semester && classInfo.year && (
                    <span className="text-gray-400"> • {classInfo.semester}/{classInfo.year}</span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadClassRankingData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
              title="Atualizar ranking"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {showStats && classInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{classInfo.studentsCount} estudantes</span>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Activity className="w-3 h-3" />
                <span>Ativo</span>
              </div>
            </div>

            {/* Posição do usuário atual */}
            {classStudents.find(s => s.isCurrentUser) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">#{classStudents.find(s => s.isCurrentUser)?.position}</span>
                    </div>
                    <p className="text-sm font-bold text-blue-900 truncate">
                      Sua Posição
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex-shrink-0 ${
                    (classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 90 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                    (classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 70 ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                    'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800'
                  }`}>
                    {formatScore(classStudents.find(s => s.isCurrentUser)?.totalScore || 0)} pts
                    {(classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 70 && (
                      <span className="ml-1">✅</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-700 mt-1">
                  <span className="font-mono font-bold bg-blue-100 px-2 py-0.5 rounded">
                    #{(user as any)?.anonymousId || user?.id?.slice(-4) || '0000'}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    {classStudents.find(s => s.isCurrentUser)?.completedModules || 0}/1 módulo
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
              <div className={`space-y-2 ${expanded ? 'lg:space-y-3' : ''}`}>
                {classStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`
                      flex items-center justify-between ${expanded ? 'p-5' : 'p-4'} rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5
                      ${student.isCurrentUser
                        ? 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-400 ring-2 ring-blue-300 shadow-blue-100'
                        : 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:border-gray-300 hover:from-gray-50 hover:to-gray-100'
                      }
                    `}
                  >
                    {/* Lado Esquerdo: Posição e Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Posição */}
                      <div className={`
                        ${expanded ? 'w-12 h-12' : 'w-10 h-10'} rounded-full flex items-center justify-center font-bold ${expanded ? 'text-base' : 'text-sm'} shadow-lg flex-shrink-0 transform transition-transform hover:scale-110
                        ${getPositionColor(student.position || 0)}
                      `}>
                        {(student.position || 0) <= 3 ? getRankIcon(student.position || 0) : student.position}
                      </div>

                      {/* Informações do estudante */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate flex-1">
                            {showNames ? student.studentName : `#${student.anonymousId || student.studentId.slice(-4) || '0000'}`}
                          </p>
                          {student.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 font-semibold flex-shrink-0">
                              Você
                            </Badge>
                          )}
                        </div>

                        {/* Segunda linha: Pontuação e Módulos */}
                        <div className="flex items-center justify-between mt-1">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold ${
                            student.totalScore >= 90 ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' :
                            student.totalScore >= 70 ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800' :
                            student.totalScore >= 50 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800' :
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                          }`}>
                            <span className="text-base">{formatScore(student.totalScore)}</span>
                            <span className="text-xs">pts</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {student.completedModules}/1 módulo
                            </span>
                            {student.totalScore >= 70 && (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Indicador de atividade */}
                    <div className="flex items-center justify-center flex-shrink-0 w-8">
                      {student.lastActivity && (
                        <div className={`
                          w-2 h-2 rounded-full
                          ${(() => {
                            try {
                              const activityDate = student.lastActivity instanceof Date
                                ? student.lastActivity
                                : new Date(student.lastActivity);

                              if (isNaN(activityDate.getTime())) return 'bg-gray-300';

                              return Date.now() - activityDate.getTime() < 24 * 60 * 60 * 1000
                                ? 'bg-green-400 animate-pulse' : 'bg-gray-300';
                            } catch (error) {
                              return 'bg-gray-300';
                            }
                          })()}
                        `} />
                      )}
                    </div>
                  </motion.div>
                ))}

                {classStudents.length === displayLimit && (
                  <div className="text-center pt-3">
                    <p className="text-xs text-gray-500">
                      Mostrando top {displayLimit} da turma
                    </p>
                  </div>
                )}

                {classStudents.length === 0 && (
                  <div className="text-center py-6">
                    <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Ranking em construção</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete o Módulo 1 para aparecer no ranking da turma!
                    </p>
                    <div className="mt-3 text-xs text-blue-600">
                      🏆 Seja o primeiro a pontuar!
                    </div>
                  </div>
                )}
              </div>
      </CardContent>
    </Card>
  );
}

export default ClassRankingPanel;