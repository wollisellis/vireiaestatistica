'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enhancedClassService } from '@/services/enhancedClassService';
import { EnhancedClass, StudentProgress, StudentAnalytics } from '@/types/classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { 
  User, Trophy, Target, Clock, BookOpen, TrendingUp, ArrowLeft,
  Calendar, CheckCircle, XCircle, Star, Brain, Zap, Award,
  BarChart3, Activity, Users, PlayCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface StudentDetailData {
  student: {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'inactive' | 'removed';
    enrolledAt: Date;
    totalScore: number;
    completedModules: number;
    lastActivity?: Date;
  };
  progress: StudentProgress;
  analytics: StudentAnalytics;
  classData: EnhancedClass;
  classAverages: {
    avgScore: number;
    avgProgress: number;
    avgTimeSpent: number;
  };
}

interface ActivityTimelineItem {
  id: string;
  type: 'module_completed' | 'exercise_completed' | 'score_achieved' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: Date;
  score?: number;
  module?: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ScoreEvolutionData {
  date: string;
  score: number;
  cumulative: number;
  module: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const studentId = params.studentId as string;
  
  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const studentData = await enhancedClassService.getStudentDetail(classId, studentId);
        setData(studentData);
      } catch (error) {
        console.error('Erro ao carregar dados do estudante:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (classId && studentId) {
      fetchStudentData();
    }
  }, [classId, studentId]);
  
  const generateActivityTimeline = (): ActivityTimelineItem[] => {
    if (!data) return [];
    
    const timeline: ActivityTimelineItem[] = [];
    
    // Simular atividades baseadas no progresso
    Object.entries(data.progress.modules || {}).forEach(([moduleId, moduleProgress]) => {
      if (moduleProgress.completed) {
        timeline.push({
          id: `module-${moduleId}`,
          type: 'module_completed',
          title: `Módulo ${moduleId} Concluído`,
          description: `Pontuação: ${moduleProgress.score} pontos`,
          timestamp: moduleProgress.completedAt || new Date(),
          score: moduleProgress.score,
          module: moduleId,
          icon: CheckCircle,
          color: 'text-green-600'
        });
      }
    });
    
    // Ordenar por data mais recente primeiro
    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };
  
  const generateScoreEvolution = (): ScoreEvolutionData[] => {
    if (!data) return [];
    
    const evolution: ScoreEvolutionData[] = [];
    let cumulative = 0;
    
    Object.entries(data.progress.modules || {}).forEach(([moduleId, moduleProgress], index) => {
      if (moduleProgress.completed) {
        cumulative += moduleProgress.score;
        evolution.push({
          date: moduleProgress.completedAt?.toLocaleDateString('pt-BR') || `Módulo ${index + 1}`,
          score: moduleProgress.score,
          cumulative,
          module: `Módulo ${moduleId}`
        });
      }
    });
    
    return evolution;
  };
  
  const getModuleProgressData = () => {
    if (!data) return [];
    
    return Object.entries(data.progress.modules || {}).map(([moduleId, moduleProgress]) => ({
      name: `Módulo ${moduleId}`,
      progress: moduleProgress.completed ? 100 : (moduleProgress.score / 100) * 100,
      score: moduleProgress.score,
      completed: moduleProgress.completed,
      timeSpent: moduleProgress.timeSpent || 0
    }));
  };
  
  const getPerformanceComparison = () => {
    if (!data) return { studentScore: 0, classAverage: 0, performance: 0 };
    
    const studentScore = data.student.totalScore;
    const classAverage = data.classAverages.avgScore;
    const performance = classAverage > 0 ? ((studentScore - classAverage) / classAverage) * 100 : 0;
    
    return { studentScore, classAverage, performance };
  };
  
  const timeline = generateActivityTimeline();
  const scoreEvolution = generateScoreEvolution();
  const moduleProgress = getModuleProgressData();
  const performanceComparison = getPerformanceComparison();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando perfil do estudante...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estudante não encontrado</h2>
            <p className="text-gray-600">O estudante solicitado não existe ou não está nesta turma.</p>
            <Button 
              onClick={() => router.push(`/professor/turma/${classId}`)}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Turma
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/professor/turma/${classId}`)}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{data.student.name}</h1>
                  <p className="text-gray-600">{data.student.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant={data.student.status === 'active' ? 'default' : 'secondary'}>
                      {data.student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Matriculado em {data.student.enrolledAt.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                <Award className="h-4 w-4 mr-2" />
                Badges
              </Button>
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Atividade
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{data.student.totalScore}</div>
              <div className="text-sm text-gray-600">Pontos Totais</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{data.student.completedModules}/4</div>
              <div className="text-sm text-gray-600">Módulos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {performanceComparison.performance > 0 ? '+' : ''}{Math.round(performanceComparison.performance)}%
              </div>
              <div className="text-sm text-gray-600">vs. Turma</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((data.analytics.totalTimeSpent || 0) / 60)}h
              </div>
              <div className="text-sm text-gray-600">Tempo Total</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {Math.round(((data.student.completedModules || 0) / 4) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progresso</div>
            </div>
          </div>
        </div>
        
        {/* Tabs de Conteúdo */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Comparação de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Estudante</span>
                        <span className="font-semibold">{performanceComparison.studentScore} pts</span>
                      </div>
                      <Progress value={(performanceComparison.studentScore / 400) * 100} className="h-3" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Média da Turma</span>
                        <span className="font-semibold">{Math.round(performanceComparison.classAverage)} pts</span>
                      </div>
                      <Progress value={(performanceComparison.classAverage / 400) * 100} className="h-3 opacity-60" />
                    </div>
                    <div className={`text-center p-3 rounded-lg ${
                      performanceComparison.performance > 0 ? 'bg-green-50 text-green-700' : 
                      performanceComparison.performance < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                    }`}>
                      <div className="font-semibold">
                        {performanceComparison.performance > 0 ? `${Math.round(performanceComparison.performance)}% acima` :
                         performanceComparison.performance < 0 ? `${Math.abs(Math.round(performanceComparison.performance))}% abaixo` :
                         'Na média'} da turma
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Module Progress Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Progresso por Módulo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {moduleProgress.map((module, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{module.name}</span>
                          <div className="flex items-center space-x-2">
                            {module.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
                            <span className="text-sm font-semibold">{module.score} pts</span>
                          </div>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Score Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Evolução da Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Pontuação Cumulativa"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name="Pontuação do Módulo"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Module Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Progresso por Módulo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={moduleProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8" name="Pontuação" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Time Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={moduleProgress.filter(m => m.timeSpent > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${Math.round(value/60)}h`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="timeSpent"
                      >
                        {moduleProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${Math.round(value/60)}h`, 'Tempo']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Module Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {moduleProgress.map((module, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-lg">{module.name}</h3>
                        <Badge variant={module.completed ? 'default' : 'secondary'}>
                          {module.completed ? 'Concluído' : 'Em Progresso'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Progresso</div>
                          <Progress value={module.progress} className="h-2 mb-1" />
                          <div className="text-sm font-medium">{Math.round(module.progress)}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Pontuação</div>
                          <div className="text-2xl font-bold text-blue-600">{module.score}</div>
                          <div className="text-sm text-gray-500">pontos</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Tempo Gasto</div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(module.timeSpent / 60)}h {Math.round(module.timeSpent % 60)}m
                          </div>
                          <div className="text-sm text-gray-500">tempo total</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Timeline de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade registrada ainda</p>
                    </div>
                  ) : (
                    timeline.map((item, index) => (
                      <div key={item.id} className="flex items-start space-x-4">
                        <div className={`p-2 rounded-full ${
                          item.type === 'module_completed' ? 'bg-green-100' :
                          item.type === 'exercise_completed' ? 'bg-blue-100' :
                          item.type === 'score_achieved' ? 'bg-purple-100' :
                          'bg-yellow-100'
                        }`}>
                          <item.icon className={`h-4 w-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <span className="text-sm text-gray-500">
                              {item.timestamp.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          {item.score && (
                            <div className="mt-2">
                              <Badge variant="outline">{item.score} pontos</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{data.analytics.averageScore || 0}</div>
                      <div className="text-sm text-gray-600">Média por Módulo</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round((data.analytics.totalTimeSpent || 0) / (data.student.completedModules || 1) / 60)}h
                      </div>
                      <div className="text-sm text-gray-600">Tempo Médio/Módulo</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {Math.round((data.analytics.correctAnswers / (data.analytics.totalAttempts || 1)) * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Taxa de Acerto</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        #{data.analytics.classRank || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">Ranking na Turma</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de Tentativas</span>
                      <span className="font-semibold">{data.analytics.totalAttempts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Respostas Corretas</span>
                      <span className="font-semibold text-green-600">{data.analytics.correctAnswers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Respostas Incorretas</span>
                      <span className="font-semibold text-red-600">
                        {(data.analytics.totalAttempts || 0) - (data.analytics.correctAnswers || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dicas Utilizadas</span>
                      <span className="font-semibold">{data.analytics.hintsUsed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessões de Estudo</span>
                      <span className="font-semibold">{data.analytics.studySessions || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Padrões de Estudo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Horário Preferido</div>
                      <div className="font-semibold">{data.analytics.preferredStudyTime || 'Manhã'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Dia da Semana Mais Ativo</div>
                      <div className="font-semibold">{data.analytics.mostActiveDay || 'Segunda-feira'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Tempo Médio por Sessão</div>
                      <div className="font-semibold">
                        {Math.round((data.analytics.avgSessionTime || 0) / 60)}min
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Consistência</div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(data.analytics.consistencyScore || 0) * 100} className="flex-1" />
                        <span className="text-sm font-semibold">
                          {Math.round((data.analytics.consistencyScore || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}