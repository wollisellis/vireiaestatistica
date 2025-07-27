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
  User,
  GraduationCap,
  Target,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isRecentActivity } from '@/utils/dateUtils';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
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
}

export function ClassRankingPanel({
  className = '',
  compact = false,
  showStats = true,
  moduleId
}: ClassRankingPanelProps) {
  console.log(`🔧 [ClassRankingPanel] Componente renderizado! moduleId: ${moduleId}`);

  const { user } = useFirebaseAuth();
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  // 🎯 HYDRATION-SAFE EXPANDED STATE
  const [expanded, setExpanded] = useState(!compact); // Default fixo para evitar mismatch
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayLimit = compact ? 5 : 8;

  // 🎯 HYDRATION EFFECT - Carrega localStorage após hidratação
  useEffect(() => {
    setIsHydrated(true);
    const saved = localStorage.getItem('ranking-panel-expanded');
    if (saved) {
      setExpanded(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    console.log(`🔧 [ClassRankingPanel] useEffect executado - user: ${user?.fullName}, role: ${user?.role}, id: ${user?.id}`);

    // 🎯 NOVO: Suporte para contas múltiplas (professor + estudante)
    if (user?.id) {
      console.log(`🔧 [ClassRankingPanel] Usuário logado, chamando loadClassRankingData...`);
      loadClassRankingData();
    } else {
      console.log(`🔧 [ClassRankingPanel] Usuário não logado, setLoading(false)`);
      setLoading(false);
    }
  }, [user?.id, moduleId]);

  // 🚀 OTIMIZAÇÃO: Atualização automática do ranking a cada 60 segundos (otimizado para performance)
  useEffect(() => {
    if (user?.id && (user.role === 'student' || user.role === 'professor')) {
      const interval = setInterval(() => {
        console.log('🔄 Atualização automática do ranking (60s)...');
        loadClassRankingData();
      }, 60000); // Otimizado: 60 segundos para melhor performance

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

      console.log(`🎯 [ClassRankingPanel] Iniciando carregamento para usuário: ${user.fullName} (${user.role})`);

      let targetClasses = [];

      // 🎯 NOVO: Suporte para contas múltiplas (professor + estudante)
      console.log(`🔧 [ClassRankingPanel] Buscando turmas para usuário: ${user.fullName} (role: ${user.role})`);

      let allClasses = [];

      // Buscar como professor (turmas que administra)
      try {
        console.log('🎓 Buscando turmas como professor...');
        const professorClasses = await ProfessorClassService.getProfessorClasses(user.id);
        if (professorClasses && professorClasses.length > 0) {
          console.log(`🎓 Encontradas ${professorClasses.length} turmas como professor`);
          allClasses.push(...professorClasses);
        }
      } catch (error) {
        console.log('🎓 Erro ao buscar turmas como professor:', error);
      }

      // Buscar como estudante (turmas em que está matriculado)
      try {
        console.log('👨‍🎓 Buscando turmas como estudante...');
        const studentClasses = await ProfessorClassService.getStudentClasses(user.id);
        if (studentClasses && studentClasses.length > 0) {
          console.log(`👨‍🎓 Encontradas ${studentClasses.length} turmas como estudante`);
          allClasses.push(...studentClasses);
        }
      } catch (error) {
        console.log('👨‍🎓 Erro ao buscar turmas como estudante:', error);
      }

      // Remover duplicatas (caso esteja como professor e estudante na mesma turma)
      targetClasses = allClasses.filter((classe, index, self) =>
        index === self.findIndex(c => c.id === classe.id)
      );

      console.log(`🔧 [ClassRankingPanel] Total de turmas encontradas: ${targetClasses.length}`);

      if (!targetClasses || targetClasses.length === 0) {
        console.log(`🔧 [ClassRankingPanel] Nenhuma turma encontrada, tentando busca direta...`);

        // 🎯 FALLBACK: Buscar diretamente estudantes da turma padrão
        try {
          const directStudents = await getClassStudentsDirectly();
          if (directStudents && directStudents.length > 0) {
            console.log(`✅ [ClassRankingPanel] Encontrados ${directStudents.length} estudantes via busca direta`);
            setClassStudents(directStudents);
            setClassInfo({
              id: 'default-class',
              name: 'Turma Geral',
              description: 'Ranking geral de todos os estudantes'
            });
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('❌ Erro na busca direta:', error);
        }

        const errorMsg = 'Nenhum estudante encontrado no sistema';
        console.log(`❌ [ClassRankingPanel] ${errorMsg}`);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Usar a primeira turma encontrada
      const firstClass = targetClasses[0];
      console.log(`🎯 Usando turma: ${firstClass.name} (${firstClass.id})`);
      
      setClassInfo({
        id: firstClass.id,
        name: firstClass.name,
        semester: firstClass.semester,
        year: firstClass.year,
        studentsCount: firstClass.studentsCount
      });

      // Buscar dados dos estudantes da turma
      let studentsData = await enhancedClassService.getClassStudents(firstClass.id);

      // 🚀 FALLBACK: Se não encontrar estudantes via users, buscar diretamente de classStudents
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        console.log('⚠️ Nenhum estudante encontrado via users, tentando busca direta...');
        studentsData = await enhancedClassService.getClassStudentsDirectly(firstClass.id);
      }

      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        setError('Nenhum estudante encontrado na turma');
        return;
      }

      // 📊 MELHORADO: Transformar dados com melhor processamento e debug
      const transformedStudents: ClassStudent[] = studentsData.map((student: any) => {
        // Priorizar totalNormalizedScore (escala 0-100) para ranking consistente
        const studentScore = student.totalNormalizedScore || student.totalScore || student.score || 0;
        const studentId = student.studentId || student.id || student.uid || '';
        const isCurrentUser = studentId === user.id;
        
        // Log detalhado para debug
        console.log(`🎯 Processando estudante:`, {
          name: student.studentName || student.name,
          id: studentId.slice(-6),
          totalNormalizedScore: student.totalNormalizedScore,
          totalScore: student.totalScore,
          score: student.score,
          scoreUsed: studentScore,
          completedModules: student.completedModules,
          isCurrentUser
        });
        
        return {
          studentId,
          studentName: student.studentName || student.name || student.displayName || `Estudante (${studentId.slice(-6)})`,
          email: student.email || '',
          totalScore: Math.round(Math.max(0, studentScore)), // Garantir valor não-negativo
          completedModules: student.completedModules || (studentScore > 0 ? 1 : 0), // Inferir se completou pelo score
          lastActivity: student.lastActivity ? new Date(student.lastActivity) : new Date(),
          isCurrentUser
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
      console.error('Erro ao carregar ranking da turma:', err);
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
    return Math.round(score).toLocaleString('pt-BR');
  };

  if (loading || !isHydrated) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Ranking da Turma</h3>
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
          <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadClassRankingData}
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se não é estudante, não mostrar
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Ranking da Turma
              </h3>
              {classInfo && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {classInfo.name} · {classInfo.semester}/{classInfo.year}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadClassRankingData}
              className="p-1 text-gray-500 hover:text-blue-600"
              title="Atualizar ranking"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newState = !expanded;
                setExpanded(newState);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('ranking-panel-expanded', JSON.stringify(newState));
                }
              }}
              className="p-1"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
        </div>
        
        {showStats && classInfo && expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{classInfo.studentsCount} estudantes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>Ativo</span>
              </div>
            </div>
            
            {/* Posição do usuário atual */}
            {classStudents.find(s => s.isCurrentUser) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">#{classStudents.find(s => s.isCurrentUser)?.position}</span>
                    </div>
                    <p className="text-sm font-bold text-blue-900">
                      Sua Posição
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    (classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 90 ? 'bg-green-100 text-green-700' :
                    (classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 70 ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {formatScore(classStudents.find(s => s.isCurrentUser)?.totalScore || 0)}%
                    {(classStudents.find(s => s.isCurrentUser)?.totalScore || 0) >= 70 && (
                      <span className="ml-2">✅</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span className="font-medium">
                    ID: ...{user?.id?.slice(-6)}
                  </span>
                  <span className="font-medium">
                    {classStudents.find(s => s.isCurrentUser)?.completedModules || 0} módulo(s) concluído(s)
                  </span>
                </div>
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
              <div className="space-y-2">
                {classStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md
                      ${student.isCurrentUser
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    {/* Lado Esquerdo: Posição e Info */}
                    <div className="flex items-center space-x-3">
                      {/* Posição */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md
                        ${getPositionColor(student.position || 0)}
                      `}>
                        {(student.position || 0) <= 3 ? getRankIcon(student.position || 0) : student.position}
                      </div>

                      {/* Informações do estudante */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {student.studentName}
                          </p>
                          {student.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 font-semibold">
                              Você
                            </Badge>
                          )}
                          {/* 🏦 Mostrar ID parcial para identificação */}
                          <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                            ...{student.studentId.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-2">
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                              student.totalScore >= 90 ? 'bg-green-100 text-green-700' :
                              student.totalScore >= 70 ? 'bg-blue-100 text-blue-700' :
                              student.totalScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <Star className="w-3 h-3" />
                              <span>{formatScore(student.totalScore)}%</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              student.totalScore >= 70 ? 'bg-green-50 text-green-700' :
                              student.totalScore > 0 ? 'bg-blue-50 text-blue-700' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {student.totalScore >= 70 ? '✅ Aprovado' : student.totalScore > 0 ? '📚 Cursando' : '⏳ Aguardando'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-600">
                              {student.completedModules}/1 módulo{student.completedModules !== 1 ? 's' : ''}
                              {student.totalScore >= 70 && <span className="ml-1 text-green-600">✓</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lado Direito: Indicador de atividade */}
                    <div className="flex items-center space-x-2">
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
                                ? 'bg-green-400' : 'bg-gray-300';
                            } catch (error) {
                              console.warn('Erro ao processar lastActivity:', error);
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
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default ClassRankingPanel;