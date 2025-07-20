'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { enhancedClassService } from '@/services/enhancedClassService';
import { EnhancedClass, ClassAnalytics } from '@/types/classes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, BarChart3, TrendingUp, Users, Clock, Target, 
  Activity, Calendar, Download, Filter, Brain, Zap, Award,
  AlertCircle, CheckCircle, XCircle, Star, Eye, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart, Scatter, ScatterChart
} from 'recharts';

interface AnalyticsData {
  classInfo: EnhancedClass;
  analytics: ClassAnalytics;
  timeSeriesData: TimeSeriesPoint[];
  modulePerformance: ModulePerformanceData[];
  engagementMetrics: EngagementMetrics;
  activityHeatmap: ActivityHeatmapData[];
  studentDistribution: StudentDistributionData[];
  insights: AutomatedInsight[];
}

interface TimeSeriesPoint {
  date: string;
  activeStudents: number;
  avgScore: number;
  completedExercises: number;
  timeSpent: number;
}

interface ModulePerformanceData {
  module: string;
  avgScore: number;
  completionRate: number;
  avgTimeSpent: number;
  difficultyScore: number;
  studentCount: number;
}

interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  avgSessionTime: number;
  retentionRate: number;
  dropoffPoints: string[];
}

interface ActivityHeatmapData {
  day: string;
  hour: number;
  activity: number;
}

interface StudentDistributionData {
  scoreRange: string;
  count: number;
  percentage: number;
}

interface AutomatedInsight {
  type: 'success' | 'warning' | 'info' | 'alert';
  title: string;
  description: string;
  metric?: number;
  trend?: 'up' | 'down' | 'stable';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ClassAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const analyticsData = await enhancedClassService.getAdvancedAnalytics(classId, selectedPeriod);
        setData(analyticsData);
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (classId) {
      fetchAnalyticsData();
    }
  }, [classId, selectedPeriod]);
  
  const generateMockData = (): AnalyticsData => {
    // Dados mockados para demonstração
    const timeSeriesData: TimeSeriesPoint[] = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      activeStudents: Math.floor(Math.random() * 20) + 10,
      avgScore: Math.floor(Math.random() * 40) + 60,
      completedExercises: Math.floor(Math.random() * 15) + 5,
      timeSpent: Math.floor(Math.random() * 120) + 60
    }));
    
    const modulePerformance: ModulePerformanceData[] = [
      { module: 'Módulo 1', avgScore: 85, completionRate: 95, avgTimeSpent: 45, difficultyScore: 3, studentCount: 28 },
      { module: 'Módulo 2', avgScore: 78, completionRate: 88, avgTimeSpent: 52, difficultyScore: 4, studentCount: 25 },
      { module: 'Módulo 3', avgScore: 72, completionRate: 75, avgTimeSpent: 58, difficultyScore: 5, studentCount: 21 },
      { module: 'Módulo 4', avgScore: 80, completionRate: 68, avgTimeSpent: 62, difficultyScore: 4, studentCount: 19 }
    ];
    
    const studentDistribution: StudentDistributionData[] = [
      { scoreRange: '90-100', count: 5, percentage: 17 },
      { scoreRange: '80-89', count: 8, percentage: 27 },
      { scoreRange: '70-79', count: 10, percentage: 33 },
      { scoreRange: '60-69', count: 5, percentage: 17 },
      { scoreRange: '0-59', count: 2, percentage: 6 }
    ];
    
    const activityHeatmap: ActivityHeatmapData[] = [];
    DAYS.forEach((day, dayIndex) => {
      HOURS.forEach(hour => {
        activityHeatmap.push({
          day,
          hour,
          activity: Math.floor(Math.random() * 10)
        });
      });
    });
    
    const insights: AutomatedInsight[] = [
      {
        type: 'success',
        title: 'Excelente Engajamento',
        description: 'A turma apresenta 95% de taxa de participação ativa nos últimos 7 dias.',
        metric: 95,
        trend: 'up'
      },
      {
        type: 'warning',
        title: 'Módulo 3 com Dificuldades',
        description: 'Taxa de conclusão 20% menor que a média. Considere revisão do conteúdo.',
        metric: 75,
        trend: 'down'
      },
      {
        type: 'info',
        title: 'Horário de Pico',
        description: 'Maior atividade entre 14h-16h. Ideal para sessões ao vivo.',
        trend: 'stable'
      }
    ];
    
    return {
      classInfo: {
        id: classId,
        name: 'Avaliação Nutricional',
        description: 'Turma demo',
        semester: '1º Semestre',
        year: 2025,
        inviteCode: 'ABC123',
        professorId: 'prof1',
        status: 'open',
        acceptingNewStudents: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      analytics: {
        id: 'analytics1',
        classId,
        date: new Date(),
        totalStudents: 30,
        activeStudents: 28,
        averageProgress: 78,
        averageScore: 82,
        completedModules: 85,
        totalTimeSpent: 1450,
        engagementMetrics: {
          dailyActiveUsers: 15,
          weeklyActiveUsers: 28,
          avgSessionTime: 35,
          retentionRate: 92,
          dropoffPoints: ['Módulo 3 - Exercício 2', 'Módulo 4 - Introdução']
        }
      },
      timeSeriesData,
      modulePerformance,
      engagementMetrics: {
        dailyActiveUsers: 15,
        weeklyActiveUsers: 28,
        avgSessionTime: 35,
        retentionRate: 92,
        dropoffPoints: ['Módulo 3 - Exercício 2', 'Módulo 4 - Introdução']
      },
      activityHeatmap,
      studentDistribution,
      insights
    };
  };
  
  // Se não temos dados ainda, usar dados mockados
  const analyticsData = data || generateMockData();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando analytics avançados...</p>
            </div>
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
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Avançados</h1>
                <p className="text-gray-600">{analyticsData.classInfo.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{analyticsData.analytics.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Estudantes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{analyticsData.analytics.activeStudents}</div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{analyticsData.analytics.averageProgress}%</div>
              <div className="text-sm text-gray-600">Progresso Médio</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Star className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{analyticsData.analytics.averageScore}</div>
              <div className="text-sm text-gray-600">Pontuação Média</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Clock className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {Math.round(analyticsData.analytics.totalTimeSpent / 60)}h
              </div>
              <div className="text-sm text-gray-600">Tempo Total</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{analyticsData.engagementMetrics.retentionRate}%</div>
              <div className="text-sm text-gray-600">Retenção</div>
            </div>
          </div>
        </div>
        
        {/* Insights Automatizados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyticsData.insights.map((insight, index) => (
            <Card key={index} className={`border-l-4 ${
              insight.type === 'success' ? 'border-l-green-500 bg-green-50' :
              insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
              insight.type === 'alert' ? 'border-l-red-500 bg-red-50' :
              'border-l-blue-500 bg-blue-50'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {insight.type === 'alert' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                  {insight.type === 'info' && <Brain className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    {insight.metric && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-lg font-bold">{insight.metric}%</span>
                        {insight.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {insight.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Tabs de Analytics */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolução Temporal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Evolução Temporal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="activeStudents" stroke="#8884d8" name="Estudantes Ativos" />
                      <Line type="monotone" dataKey="avgScore" stroke="#82ca9d" name="Pontuação Média" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Performance por Módulo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance por Módulo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="module" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#8884d8" name="Pontuação Média" />
                      <Bar dataKey="completionRate" fill="#82ca9d" name="Taxa de Conclusão %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Distribuição de Estudantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Distribuição de Pontuação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.studentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ scoreRange, percentage }) => `${scoreRange}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.studentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Detalhamento por Faixa</h4>
                    {analyticsData.studentDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="font-medium">{item.scoreRange} pontos</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.count} estudantes</div>
                          <div className="text-sm text-gray-600">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dificuldade vs Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Dificuldade vs Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={analyticsData.modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="difficultyScore" name="Dificuldade" />
                      <YAxis dataKey="avgScore" name="Pontuação Média" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Módulos" dataKey="avgScore" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Tempo vs Conclusão */}
              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Estudo vs Taxa de Conclusão</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={analyticsData.modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="module" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="avgTimeSpent" fill="#8884d8" name="Tempo Médio (min)" />
                      <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#ff7300" name="Taxa de Conclusão %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Tabela Detalhada de Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Detalhada por Módulo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Módulo</th>
                        <th className="text-left py-3 px-4">Pontuação Média</th>
                        <th className="text-left py-3 px-4">Taxa de Conclusão</th>
                        <th className="text-left py-3 px-4">Tempo Médio</th>
                        <th className="text-left py-3 px-4">Dificuldade</th>
                        <th className="text-left py-3 px-4">Estudantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.modulePerformance.map((module, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{module.module}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{module.avgScore}</span>
                              <div className={`w-2 h-2 rounded-full ${
                                module.avgScore >= 85 ? 'bg-green-500' :
                                module.avgScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{module.completionRate}%</td>
                          <td className="py-3 px-4">{module.avgTimeSpent}min</td>
                          <td className="py-3 px-4">
                            <div className="flex">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < module.difficultyScore ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">{module.studentCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Activity className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analyticsData.engagementMetrics.dailyActiveUsers}</div>
                      <div className="text-sm text-gray-600">Usuários Ativos Diários</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analyticsData.engagementMetrics.weeklyActiveUsers}</div>
                      <div className="text-sm text-gray-600">Usuários Ativos Semanais</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analyticsData.engagementMetrics.avgSessionTime}min</div>
                      <div className="text-sm text-gray-600">Tempo Médio de Sessão</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Target className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{analyticsData.engagementMetrics.retentionRate}%</div>
                      <div className="text-sm text-gray-600">Taxa de Retenção</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pontos de Abandono */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                  Pontos de Abandono Identificados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.engagementMetrics.dropoffPoints.map((point, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium">{point}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Analisar
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Heatmap de Atividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Visualização da atividade dos estudantes por dia da semana e horário
                  </p>
                  
                  {/* Simplified heatmap representation */}
                  <div className="grid grid-cols-24 gap-1">
                    <div className="col-span-24 grid grid-cols-24 gap-1 mb-2">
                      {HOURS.map(hour => (
                        <div key={hour} className="text-xs text-center text-gray-500">
                          {hour % 4 === 0 ? hour : ''}
                        </div>
                      ))}
                    </div>
                    
                    {DAYS.map(day => (
                      <div key={day} className="col-span-24 grid grid-cols-24 gap-1 items-center">
                        <div className="col-span-2 text-sm font-medium text-gray-700">{day}</div>
                        {HOURS.map(hour => {
                          const activity = Math.floor(Math.random() * 10);
                          const intensity = activity / 10;
                          return (
                            <div
                              key={`${day}-${hour}`}
                              className="col-span-1 h-6 rounded-sm"
                              style={{
                                backgroundColor: `rgba(59, 130, 246, ${intensity})`
                              }}
                              title={`${day} ${hour}:00 - ${activity} atividades`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Menos ativo</span>
                    <div className="flex space-x-1">
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity, index) => (
                        <div
                          key={index}
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                        />
                      ))}
                    </div>
                    <span>Mais ativo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição de Tempo de Estudo */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Tempo de Estudo</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="timeSpent" 
                        stackId="1" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        name="Tempo de Estudo (min)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Distribuição de Exercícios Completados */}
              <Card>
                <CardHeader>
                  <CardTitle>Exercícios Completados por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completedExercises" fill="#82ca9d" name="Exercícios Completados" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}