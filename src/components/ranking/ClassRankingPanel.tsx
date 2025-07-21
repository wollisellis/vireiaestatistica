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
  const { user } = useFirebaseAuth();
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [error, setError] = useState<string | null>(null);

  const displayLimit = compact ? 5 : 8;

  useEffect(() => {
    if (user?.id && user.role === 'student') {
      loadClassRankingData();
    } else {
      setLoading(false);
    }
  }, [user?.id, moduleId]);

  const loadClassRankingData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) return;

      // Buscar turmas do estudante
      const studentClasses = await ProfessorClassService.getStudentClasses(user.id);
      
      if (studentClasses.length === 0) {
        setError('Você não está matriculado em nenhuma turma');
        return;
      }

      // Usar a primeira turma encontrada (ou poderia ter lógica para selecionar)
      const firstClass = studentClasses[0];
      
      setClassInfo({
        id: firstClass.id,
        name: firstClass.name,
        semester: firstClass.semester,
        year: firstClass.year,
        studentsCount: firstClass.studentsCount
      });

      // Buscar dados dos estudantes da turma
      const studentsData = await enhancedClassService.getClassStudents(firstClass.id);
      
      if (!Array.isArray(studentsData) || studentsData.length === 0) {
        setError('Nenhum estudante encontrado na turma');
        return;
      }

      // Transformar dados para o formato esperado
      const transformedStudents: ClassStudent[] = studentsData.map((student: any) => ({
        studentId: student.studentId || student.id || '',
        studentName: student.studentName || student.name || 'Usuário Anônimo',
        email: student.email || '',
        totalScore: student.totalScore || student.totalNormalizedScore || 0,
        completedModules: student.completedModules || 0,
        lastActivity: student.lastActivity,
        isCurrentUser: student.studentId === user.id
      }));

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

  if (loading) {
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

  // Se não há estudantes ou não é estudante, não mostrar
  if (!user || user.role !== 'student' || classStudents.length === 0) {
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
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                <p className="text-xs text-blue-800">
                  <strong>Sua posição: #{classStudents.find(s => s.isCurrentUser)?.position}</strong>
                  <span className="ml-2">
                    {formatScore(classStudents.find(s => s.isCurrentUser)?.totalScore || 0)} pts
                  </span>
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
              <div className="space-y-2">
                {classStudents.map((student, index) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all
                      ${student.isCurrentUser 
                        ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    {/* Lado Esquerdo: Posição e Info */}
                    <div className="flex items-center space-x-3">
                      {/* Posição */}
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                        ${getPositionColor(student.position || 0)}
                      `}>
                        {(student.position || 0) <= 3 ? getRankIcon(student.position || 0) : student.position}
                      </div>

                      {/* Informações do estudante */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.studentName}
                          </p>
                          {student.isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">
                              Você
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {formatScore(student.totalScore)} pts
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-gray-600">
                              {student.completedModules}/4 módulos
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
                          ${Date.now() - new Date(student.lastActivity).getTime() < 24 * 60 * 60 * 1000
                            ? 'bg-green-400' : 'bg-gray-300'
                          }
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
                    <p className="text-sm text-gray-500">Nenhum resultado ainda</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Complete exercícios para aparecer no ranking da turma!
                    </p>
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