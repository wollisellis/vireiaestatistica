'use client';

// Página do quiz aleatório do Módulo 1
// Sistema estilo Khan Academy com questões embaralhadas

import { RandomizedQuizComponent } from '@/components/quiz/RandomizedQuizComponent';
import { QuizAttempt } from '@/types/randomizedQuiz';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Target, Clock, Trophy } from 'lucide-react';

// Disable static generation for this page since it requires authentication
export const dynamic = 'force-dynamic';

export default function Module1QuizPage() {
  const router = useRouter();

  const handleQuizComplete = (attempt: QuizAttempt) => {
    console.log('Quiz concluído:', attempt);
    
    // Se passou, pode redirecionar para o próximo módulo ou jogos
    if (attempt.passed) {
      // Opcional: mostrar modal de parabéns antes de redirecionar
      setTimeout(() => {
        router.push('/jogos');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header da Página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Módulo 1: Introdução à Avaliação Nutricional
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complete o quiz com questões aleatórias para demonstrar seu conhecimento sobre os conceitos fundamentais da avaliação nutricional.
          </p>
        </div>

        {/* Informações do Quiz */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">7</div>
              <div className="text-sm text-gray-600">Questões</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">70%</div>
              <div className="text-sm text-gray-600">Mín. Aprovação</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">Minutos</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div className="text-sm text-gray-600">Pontos</div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções Essenciais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📝 Critérios de Aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  <span><strong>Mínimo de 70% de acertos</strong> para conclusão do módulo</span>
                </li>
                <li className="flex items-center">
                  <Trophy className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>Você pode <strong>tentar quantas vezes precisar</strong></span>
                </li>
                <li className="flex items-center">
                  <BookOpen className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  <span><strong>Feedback detalhado</strong> será fornecido para cada questão</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Componente Principal do Quiz */}
        <RandomizedQuizComponent 
          moduleId="module-1" 
          onComplete={handleQuizComplete}
        />
      </div>
    </div>
  );
}