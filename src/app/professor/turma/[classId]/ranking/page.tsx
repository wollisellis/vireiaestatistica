'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { 
  Trophy, Medal, Award, TrendingUp, TrendingDown, Minus,
  Search, Filter, Download, ArrowLeft, Star, Target,
  User, Clock, BookOpen, CheckCircle
} from 'lucide-react';
import { enhancedClassService } from '@/services/enhancedClassService';
import { ProfessorClassService } from '@/services/professorClassService';
import unifiedScoringService from '@/services/unifiedScoringService';

interface StudentRanking {
  position: number;
  previousPosition?: number;
  studentId: string;
  studentName: string;
  anonymousId?: string;
  totalScore: number;
  completedModules: number;
  averageScore: number;
  lastActivity: Date;
  trend: 'up' | 'down' | 'same' | 'new';
}

export default function ClassRankingPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'modules' | 'average'>('score');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  
  useEffect(() => {
    loadRankingData();
  }, [classId, sortBy, filterBy]);
  
  const loadRankingData = async () => {
    try {
      setLoading(true);
      
      // Carregar informações da turma
      const classData = await ProfessorClassService.getClassInfo(classId);
      if (!classData) {
        throw new Error('Turma não encontrada');
      }
      setClassInfo(classData);
      
      // Carregar estudantes da turma
      const students = await ProfessorClassService.getStudentOverviews(classId);
      
      // Criar ranking baseado nos dados dos estudantes
      const rankingData: StudentRanking[] = students.map((student, index) => ({
        position: 0, // Será calculado após ordenação
        studentId: student.studentId,
        studentName: student.studentName,
        anonymousId: student.anonymousId || student.studentId.slice(-4),
        totalScore: student.totalNormalizedScore,
        completedModules: student.completedModules,
        averageScore: student.averageScore,
        lastActivity: student.lastActivity,
        trend: 'same' as const
      }));
      
      // Ordenar baseado no critério selecionado
      rankingData.sort((a, b) => {
        switch (sortBy) {
          case 'score':
            return b.totalScore - a.totalScore;
          case 'modules':
            return b.completedModules - a.completedModules;
          case 'average':
            return b.averageScore - a.averageScore;
          default:
            return b.totalScore - a.totalScore;
        }
      });
      
      // Atribuir posições
      rankingData.forEach((student, index) => {
        student.position = index + 1;
      });
      
      // Aplicar filtros
      let filteredRankings = rankingData;
      if (filterBy === 'active') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredRankings = rankingData.filter(s => 
          new Date(s.lastActivity) > sevenDaysAgo
        );
      } else if (filterBy === 'inactive') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filteredRankings = rankingData.filter(s => 
          new Date(s.lastActivity) <= sevenDaysAgo
        );
      }
      
      setRankings(filteredRankings);
      
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      alert('Erro ao carregar dados do ranking');
    } finally {
      setLoading(false);
    }
  };
  
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-gray-600 font-semibold">{position}º</span>;
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'new':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const filteredRankings = rankings.filter(student => {
    const matchesSearch = !searchTerm || 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.anonymousId && student.anonymousId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  const exportRanking = () => {
    // Implementar exportação para CSV
    alert('Funcionalidade de exportação em desenvolvimento');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando ranking...</p>
        </div>
      </div>
    );
  }
  
  if (!classInfo) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Turma não encontrada</h2>
            <Button onClick={() => router.push('/professor')}>
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push(`/professor/turma/${classId}`)}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">Ranking da Turma</h1>
              </div>
              <p className="text-gray-600 text-lg">{classInfo.name} - {classInfo.semester} {classInfo.year}</p>
            </div>
            
            <Button onClick={exportRanking} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome ou ID do estudante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="score">Pontuação Total</SelectItem>
                    <SelectItem value="modules">Módulos Completos</SelectItem>
                    <SelectItem value="average">Média Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Filtrar</label>
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos (última semana)</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Ranking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Classificação Geral</span>
              <Badge variant="outline">{filteredRankings.length} estudantes</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRankings.map((student) => (
                <div
                  key={student.studentId}
                  className={`p-4 rounded-lg border ${
                    student.position <= 3 ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' : 'bg-white'
                  } hover:shadow-md transition-all cursor-pointer`}
                  onClick={() => router.push(`/professor/turma/${classId}/aluno/${student.studentId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getPositionIcon(student.position)}
                        {getTrendIcon(student.trend)}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                        <p className="text-sm text-gray-500">ID: {student.anonymousId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-600">{student.totalScore}</div>
                        <div className="text-xs text-gray-500">Pontos</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{student.completedModules}/4</div>
                        <div className="text-xs text-gray-500">Módulos</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">{student.averageScore}%</div>
                        <div className="text-xs text-gray-500">Média</div>
                      </div>
                      
                      <Badge 
                        variant={new Date(student.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'default' : 'secondary'}
                        className="ml-4"
                      >
                        {new Date(student.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredRankings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Nenhum estudante encontrado com os filtros aplicados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}