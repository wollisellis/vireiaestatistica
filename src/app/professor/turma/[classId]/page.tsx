'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enhancedClassService } from '@/services/enhancedClassService';
import { EnhancedClass, ClassEnrollment, StudentProgress, ClassAnalytics } from '@/types/classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Users, Trophy, Target, Clock, BookOpen, TrendingUp, Filter, Download, 
  Settings, UserPlus, UserMinus, Eye, BarChart3, Calendar, 
  Search, ChevronRight, Activity, Star, ArrowLeft, Trash2
} from 'lucide-react';
import { DeleteClassModal } from '@/components/professor/DeleteClassModal';
import { ClassTrashService } from '@/services/classTrashService';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface EnhancedStudent extends ClassEnrollment {
  name?: string;
  email: string;
  progress?: StudentProgress;
  totalScore: number;
  completedModules: number;
  lastActivity?: Date;
  // Adicionar campos para melhor exibição
  moduleScores?: { [moduleId: string]: number };
  normalizedScore?: number;
  studentId: string;
}

export default function EnhancedClassDashboard() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const { user } = useFirebaseAuth();
  
  const [classData, setClassData] = useState<EnhancedClass | null>(null);
  const [students, setStudents] = useState<EnhancedStudent[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [progressFilter, setProgressFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState(false);
  
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        // Validar classId
        if (!classId) {
          console.error('ClassId não fornecido');
          setLoading(false);
          return;
        }

        // Buscar dados da turma
        const classInfo = await enhancedClassService.getClassById(classId);
        if (classInfo) {
          setClassData(classInfo);
        }

        // Buscar estudantes da turma
        const studentsData = await enhancedClassService.getClassStudents(classId);
        // Garantir que studentsData é sempre um array
        setStudents(Array.isArray(studentsData) ? studentsData : []);

        // Buscar analytics da turma
        const analyticsData = await enhancedClassService.getClassAnalytics(classId);
        setAnalytics(analyticsData);

      } catch (error) {
        console.error('Erro ao carregar dados da turma:', error);
        // Definir valores padrão em caso de erro
        setStudents([]);
        setAnalytics(null);
        
        // Mostrar informações de debug em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.group('🔍 Debug: Dados da turma não carregados');
          console.log('ClassId:', classId);
          console.log('Erro:', error);
          console.log('Verifique os logs do [EnhancedClassService] para mais detalhes');
          console.groupEnd();
        }
        
        alert('Erro ao carregar dados da turma. Verifique o console para detalhes.');
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClassData();
    }
  }, [classId]);
  
  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = !searchTerm ||
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    const matchesProgress = progressFilter === 'all' || (
      progressFilter === 'active' && (student.completedModules || 0) > 0
    ) || (
      progressFilter === 'inactive' && (student.completedModules || 0) === 0
    );

    return matchesSearch && matchesStatus && matchesProgress;
  });
  
  const getProgressStats = () => {
    const safeStudents = students || [];
    if (safeStudents.length === 0) return {
      total: 0,
      active: 0,
      avgProgress: 0,
      avgScore: 0,
      topPerformers: [] as EnhancedStudent[]
    };

    const total = safeStudents.length;
    const active = safeStudents.filter(student => (student.completedModules || 0) > 0).length;
    const totalProgress = safeStudents.reduce((sum, student) => sum + ((student.completedModules || 0) / 4) * 100, 0);
    const totalScore = safeStudents.reduce((sum, student) => sum + (student.totalScore || 0), 0);
    const avgProgress = total > 0 ? totalProgress / total : 0;
    const avgScore = total > 0 ? totalScore / total : 0;
    const topPerformers = safeStudents
      .filter(s => (s.totalScore || 0) > 0)
      .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
      .slice(0, 5);

    return { total, active, avgProgress, avgScore, topPerformers };
  };
  
  // Função para extrair número de RA do email
  const extractRANumber = (email: string): string => {
    if (!email) return 'N/A';
    
    // Para emails da UNICAMP (padrão: ra123456@dac.unicamp.br ou ra123456@unicamp.br)
    if (email.includes('@dac.unicamp.br') || email.includes('@unicamp.br')) {
      const raMatch = email.match(/^([a-z]\d+)/i);
      return raMatch ? raMatch[1].toUpperCase() : email.split('@')[0];
    }
    
    // Para outros emails, retornar parte antes do @
    return email.split('@')[0];
  };

  // Função para formatar nome (primeiro nome + sobrenome)
  const formatStudentName = (student: EnhancedStudent): string => {
    const fullName = student.name || student.studentName || 'Usuário Anônimo';
    const nameParts = fullName.trim().split(' ');
    
    if (nameParts.length === 1) {
      return nameParts[0];
    } else if (nameParts.length >= 2) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
    
    return fullName;
  };

  // Função para obter nota do módulo específico
  const getModuleScore = (student: EnhancedStudent, moduleId: string): string => {
    // Primeiro: tentar usar dados do sistema unificado
    if (student.moduleScores && student.moduleScores[moduleId]) {
      return `${Math.round(student.moduleScores[moduleId])}%`;
    }
    
    // Segundo: verificar moduleProgress (dados detalhados)
    if (student.moduleProgress && Array.isArray(student.moduleProgress)) {
      const moduleData = student.moduleProgress.find(m => m.moduleId === moduleId);
      if (moduleData && moduleData.isCompleted && moduleData.maxScore > 0) {
        return `${Math.round((moduleData.score / moduleData.maxScore) * 100)}%`;
      }
    }
    
    // Terceiro: fallback para dados legados
    if (student.progress?.modules && student.progress.modules[moduleId]) {
      const moduleProgress = student.progress.modules[moduleId];
      if (moduleProgress.completed && moduleProgress.maxScore > 0) {
        return `${Math.round((moduleProgress.score / moduleProgress.maxScore) * 100)}%`;
      }
    }
    
    return '-';
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await enhancedClassService.removeStudentFromClass(classId, studentId);
      setStudents((prevStudents) => (prevStudents || []).filter(s => s.studentId !== studentId));
      alert('Estudante removido da turma');
    } catch (error) {
      console.error('Erro ao remover estudante:', error);
      alert('Erro ao remover estudante');
    }
  };
  
  const handleDeleteClass = async () => {
    if (!user?.uid || !classData) return;
    
    try {
      setDeletingClass(true);
      
      await ClassTrashService.deleteClass(
        classId,
        user.uid,
        user.displayName || user.email || 'Professor',
        'Excluída pelo professor'
      );
      
      alert('Turma enviada para a lixeira com sucesso!');
      router.push('/professor');
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Tente novamente.');
    } finally {
      setDeletingClass(false);
    }
  };
  
  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dashboard da turma...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Turma não encontrada</h2>
            <p className="text-gray-600">A turma solicitada não existe ou você não tem permissão para visualizá-la.</p>
            <Button 
              onClick={() => router.push('/professor')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Turmas
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/professor')}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
                <Badge 
                  variant={classData.status === 'open' ? 'default' : classData.status === 'closed' ? 'secondary' : 'destructive'}
                >
                  {classData.status === 'open' ? 'Aberta' : classData.status === 'closed' ? 'Fechada' : 'Arquivada'}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg">{classData.semester} - {classData.year}</p>
              {classData.description && (
                <p className="text-gray-700 mt-2">{classData.description}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/professor/turma/${classId}/analytics`)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/professor/turma/${classId}/ranking`)}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Ranking
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/professor/turma/${classId}/configuracoes`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{stats.total} estudantes</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Activity className="h-4 w-4" />
              <span>{stats.active} ativos</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Target className="h-4 w-4" />
              <span>{Math.round(stats.avgProgress)}% progresso</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <Star className="h-4 w-4" />
              <span>{Math.round(stats.avgScore)} pts médio</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <BookOpen className="h-4 w-4" />
              <code className="px-2 py-1 bg-gray-100 rounded text-xs">{classData.inviteCode}</code>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total de Estudantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs opacity-75 mt-1">
                {classData.maxStudents ? `de ${classData.maxStudents} máximo` : 'sem limite'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Estudantes Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.active}</div>
              <p className="text-xs opacity-75 mt-1">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% de engajamento
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Progresso Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(stats.avgProgress)}%</div>
              <p className="text-xs opacity-75 mt-1">dos módulos concluídos</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Pontuação Média</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(stats.avgScore)}</div>
              <p className="text-xs opacity-75 mt-1">pontos por estudante</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Top Performers */}
        {stats.topPerformers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Top 5 Performantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topPerformers.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{student.name || 'Usuário Anônimo'}</div>
                        <div className="text-sm text-gray-600">{student.completedModules}/4 módulos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{student.totalScore}</div>
                      <div className="text-sm text-gray-600">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Enhanced Students Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Gerenciamento de Estudantes</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                  <SelectItem value="removed">Removidos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={progressFilter} onValueChange={setProgressFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Progresso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Com progresso</SelectItem>
                  <SelectItem value="inactive">Sem progresso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Estudante</th>
                    <th className="text-left py-3 px-4 font-medium">Progresso Geral</th>
                    <th className="text-left py-3 px-4 font-medium">Pontuação Total</th>
                    <th className="text-left py-3 px-4 font-medium">Última Atividade</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents && filteredStudents.length > 0 ? filteredStudents.map(student => {
                    if (!student) return null;

                    const progressPercentage = ((student.completedModules || 0) / 4) * 100;
                    const raNumber = extractRANumber(student.email || '');
                    const displayName = formatStudentName(student);

                    return (
                      <tr key={student.studentId || Math.random()} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            {/* Nome formatado */}
                            <div className="font-medium text-gray-900">
                              {displayName}
                            </div>
                            {/* Email */}
                            <div className="text-sm text-gray-500">
                              {student.email || 'Email não disponível'}
                            </div>
                            {/* Número de RA */}
                            <div className="text-xs text-blue-600 font-semibold">
                              RA: {raNumber}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(Math.max(progressPercentage, 0), 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {student.completedModules || 0}/{classData.totalModules || 4} Módulos
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-center">
                            <div className="font-semibold text-lg text-blue-600">
                              {student.normalizedScore || student.totalScore || 0}
                            </div>
                            <div className="text-sm text-gray-500">
                              pontos
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {student.lastActivity ?
                              new Date(student.lastActivity).toLocaleDateString('pt-BR') :
                              'Nunca'
                            }
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              student.status === 'active' ? 'default' :
                              student.status === 'inactive' ? 'secondary' : 'destructive'
                            }
                          >
                            {student.status === 'active' ? 'Ativo' :
                             student.status === 'inactive' ? 'Inativo' : 'Removido'
                            }
                          </Badge>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/professor/turma/${classId}/aluno/${student.studentId}`)}
                              disabled={!student.studentId}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.studentId)}
                              disabled={student.status === 'removed' || !student.studentId}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }).filter(Boolean) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        Nenhum estudante encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {filteredStudents.length === 0 && students.length > 0 && (
                <div className="text-center py-8">
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum estudante encontrado</h3>
                  <p className="text-gray-600">Tente ajustar os filtros de busca.</p>
                </div>
              )}
              
              {students.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum estudante encontrado</h3>
                  
                  {/* Debug Information */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left max-w-2xl mx-auto">
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-600 mt-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800 mb-2">
                          Diagnóstico de Dados da Turma
                        </h4>
                        <div className="text-xs text-yellow-700 space-y-1">
                          <p><strong>ID da Turma:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{classId}</code></p>
                          <p><strong>Código de Convite:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{classData?.inviteCode || 'N/A'}</code></p>
                          <p><strong>Status da Turma:</strong> {classData?.status || 'unknown'}</p>
                          <p><strong>Data de Criação:</strong> {classData?.createdAt?.toLocaleDateString('pt-BR') || 'N/A'}</p>
                        </div>
                        <div className="mt-3 text-xs text-yellow-700">
                          <p className="mb-1"><strong>Possíveis Causas:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Estudantes ainda não se inscreveram na turma</li>
                            <li>Problema de sincronização no Firestore</li>
                            <li>Dados de matrícula em formato incorreto</li>
                            <li>Verificar logs do console para detalhes técnicos</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Se você já adicionou estudantes, verifique os logs do console ou recarregue a página.
                  </p>
                  
                  <div className="flex justify-center space-x-3">
                    <Button onClick={() => window.location.reload()}>
                      🔄 Recarregar Página
                    </Button>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Convidar Estudantes
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/professor/turma/${classId}/analytics`)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Analytics Detalhados</h3>
                  <p className="text-sm text-gray-600">Métricas avançadas e insights</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/professor/turma/${classId}/ranking`)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Ranking da Turma</h3>
                  <p className="text-sm text-gray-600">Competição e gamificação</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/professor/turma/${classId}/configuracoes`)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Configurações</h3>
                  <p className="text-sm text-gray-600">Gerencie a turma</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Delete Class Modal */}
        {showDeleteModal && classData && (
          <DeleteClassModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirmDelete={handleDeleteClass}
            classInfo={{
              id: classId,
              name: classData.name,
              studentsCount: stats.total,
              semester: classData.semester,
              year: classData.year
            }}
            loading={deletingClass}
          />
        )}
      </div>
    </div>
  );
}