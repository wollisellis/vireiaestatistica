'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import unifiedScoringService from '@/services/unifiedScoringService';

interface TestResults {
  unifiedScores: number;
  users: number;
  classStudents: number;
  progress: number;
  quizAttempts: number;
}

export default function TestRankingPage() {
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testRankingData = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);
    
    try {
      addLog('🔍 Iniciando teste dos dados do ranking...');
      
      // 1. Verificar dados na coleção unified_scores
      addLog('📊 Verificando coleção unified_scores...');
      const unifiedScoresSnapshot = await getDocs(collection(db, 'unified_scores'));
      addLog(`Documentos unified_scores encontrados: ${unifiedScoresSnapshot.size}`);
      
      if (unifiedScoresSnapshot.size > 0) {
        unifiedScoresSnapshot.forEach((doc) => {
          const data = doc.data();
          addLog(`Estudante ${doc.id}: totalScore=${data.totalScore}, normalizedScore=${data.normalizedScore}`);
        });
      }

      // 2. Verificar dados na coleção users
      addLog('👥 Verificando coleção users...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      addLog(`Usuários encontrados: ${usersSnapshot.size}`);
      
      if (usersSnapshot.size > 0) {
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          addLog(`Usuário ${doc.id}: ${data.fullName} (${data.role}) - ${data.email}`);
        });
      }

      // 3. Verificar dados na coleção classStudents
      addLog('🎓 Verificando coleção classStudents...');
      const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
      addLog(`Matrículas encontradas: ${classStudentsSnapshot.size}`);
      
      if (classStudentsSnapshot.size > 0) {
        classStudentsSnapshot.forEach((doc) => {
          const data = doc.data();
          addLog(`Matrícula ${doc.id}: studentId=${data.studentId}, classId=${data.classId}`);
        });
      }

      // 4. Verificar dados na coleção student_module_progress
      addLog('📈 Verificando coleção student_module_progress...');
      const progressSnapshot = await getDocs(collection(db, 'student_module_progress'));
      addLog(`Progressos encontrados: ${progressSnapshot.size}`);
      
      if (progressSnapshot.size > 0) {
        progressSnapshot.forEach((doc) => {
          const data = doc.data();
          addLog(`Progresso ${doc.id}: studentId=${data.studentId}, moduleId=${data.moduleId}, completed=${data.completed}, score=${data.score}`);
        });
      }

      // 5. Verificar dados na coleção quiz_attempts
      addLog('📝 Verificando coleção quiz_attempts...');
      const quizAttemptsSnapshot = await getDocs(collection(db, 'quiz_attempts'));
      addLog(`Tentativas de quiz encontradas: ${quizAttemptsSnapshot.size}`);
      
      if (quizAttemptsSnapshot.size > 0) {
        quizAttemptsSnapshot.forEach((doc) => {
          const data = doc.data();
          addLog(`Tentativa ${doc.id}: studentId=${data.studentId}, moduleId=${data.moduleId}, score=${data.score}, completed=${data.completed}`);
        });
      }

      setResults({
        unifiedScores: unifiedScoresSnapshot.size,
        users: usersSnapshot.size,
        classStudents: classStudentsSnapshot.size,
        progress: progressSnapshot.size,
        quizAttempts: quizAttemptsSnapshot.size
      });

      addLog('✅ Teste concluído com sucesso!');

    } catch (err: any) {
      const errorMessage = `❌ Erro ao testar dados: ${err.message}`;
      addLog(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const populateTestData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('🔄 Iniciando população de dados de teste...');
      
      // Buscar estudantes matriculados
      const classStudentsSnapshot = await getDocs(collection(db, 'classStudents'));
      addLog(`📚 Encontrados ${classStudentsSnapshot.size} estudantes matriculados`);

      if (classStudentsSnapshot.size === 0) {
        addLog('❌ Nenhum estudante matriculado encontrado');
        return;
      }

      // Para cada estudante, verificar se tem dados de pontuação
      for (const classDoc of classStudentsSnapshot.docs) {
        const classData = classDoc.data();
        const studentId = classData.studentId;
        
        addLog(`🔍 Verificando estudante: ${studentId}`);
        
        // Verificar se já tem pontuação unificada
        const unifiedScoreDoc = await getDoc(doc(db, 'unified_scores', studentId));
        
        if (!unifiedScoreDoc.exists()) {
          addLog(`📝 Criando pontuação unificada para: ${studentId}`);
          
          // Sincronizar dados do estudante
          await unifiedScoringService.syncAllSystems(studentId);
          addLog(`✅ Pontuação criada para: ${studentId}`);
        } else {
          addLog(`✅ Estudante ${studentId} já tem pontuação unificada`);
        }
      }

      addLog('✅ População de dados concluída!');
      
      // Executar teste novamente para ver os resultados
      await testRankingData();
      
    } catch (err: any) {
      const errorMessage = `❌ Erro ao popular dados: ${err.message}`;
      addLog(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Teste de Dados do Ranking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testRankingData} 
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Testando...' : 'Testar Dados'}
            </Button>
            
            <Button 
              onClick={populateTestData} 
              disabled={loading}
              variant="default"
            >
              {loading ? 'Populando...' : 'Popular Dados de Teste'}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>📊 Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.unifiedScores}</div>
                    <div className="text-sm text-gray-600">Unified Scores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{results.users}</div>
                    <div className="text-sm text-gray-600">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{results.classStudents}</div>
                    <div className="text-sm text-gray-600">Class Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{results.progress}</div>
                    <div className="text-sm text-gray-600">Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{results.quizAttempts}</div>
                    <div className="text-sm text-gray-600">Quiz Attempts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📝 Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
