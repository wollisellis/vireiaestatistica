'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function FirebaseConnectionTest() {
  const { user } = useFirebaseAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testando...');
  const [userDataTest, setUserDataTest] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        setConnectionStatus('❌ Firebase não inicializado');
        return;
      }

      setConnectionStatus('✅ Firebase conectado');

      if (user?.uid) {
        // Testar dados do usuário
        const testCollection = collection(db, 'users');
        const userQuery = query(testCollection, where('uid', '==', user.uid), limit(1));
        const userSnapshot = await getDocs(userQuery);
        
        setUserDataTest({
          userExists: !userSnapshot.empty,
          userData: userSnapshot.empty ? null : userSnapshot.docs[0].data()
        });

        // Testar dados de quiz
        const quizCollection = collection(db, 'quiz_attempts');
        const quizQuery = query(
          quizCollection, 
          where('studentId', '==', user.uid),
          orderBy('startedAt', 'desc'),
          limit(3)
        );
        const quizSnapshot = await getDocs(quizQuery);
        
        const quizResults = quizSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setQuizData({
          hasQuizData: !quizSnapshot.empty,
          quizCount: quizSnapshot.size,
          quizData: quizResults
        });
      }
    } catch (error) {
      setConnectionStatus(`❌ Erro: ${error}`);
      console.error('Firebase test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid && db) {
      testFirebaseConnection();
    }
  }, [user?.uid]);

  return (
    <Card className="max-w-4xl mx-auto m-4">
      <CardHeader>
        <h2 className="text-2xl font-bold">🔧 Firebase Connection Test</h2>
        <p className="text-gray-600">Diagnosticando conectividade e dados do Firebase</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Status da Conexão</h3>
            <p className="p-2 bg-gray-100 rounded text-sm font-mono">{connectionStatus}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Usuário Atual</h3>
            <div className="p-2 bg-gray-100 rounded text-sm">
              <p><strong>UID:</strong> {user?.uid || 'Não logado'}</p>
              <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
              <p><strong>Nome:</strong> {user?.displayName || user?.name || 'N/A'}</p>
              <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Dados do Usuário</h3>
            <div className="p-2 bg-gray-100 rounded text-sm">
              {userDataTest ? (
                <>
                  <p><strong>Existe no DB:</strong> {userDataTest.userExists ? '✅' : '❌'}</p>
                  {userDataTest.userData && (
                    <pre className="text-xs mt-2 overflow-auto">
                      {JSON.stringify(userDataTest.userData, null, 2)}
                    </pre>
                  )}
                </>
              ) : (
                <p>Carregando dados do usuário...</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Dados de Quiz</h3>
            <div className="p-2 bg-gray-100 rounded text-sm">
              {quizData ? (
                <>
                  <p><strong>Tem dados de quiz:</strong> {quizData.hasQuizData ? '✅' : '❌'}</p>
                  <p><strong>Total de tentativas:</strong> {quizData.quizCount}</p>
                  {quizData.quizData && quizData.quizData.length > 0 && (
                    <pre className="text-xs mt-2 overflow-auto max-h-32">
                      {JSON.stringify(quizData.quizData, null, 2)}
                    </pre>
                  )}
                </>
              ) : (
                <p>Carregando dados de quiz...</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={testFirebaseConnection} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testando...' : 'Testar Novamente'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}