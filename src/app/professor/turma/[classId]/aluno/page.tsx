'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function StudentRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  useEffect(() => {
    // Redirecionar imediatamente para a página da turma
    if (classId) {
      router.push(`/professor/turma/${classId}`);
    } else {
      // Se não houver classId, voltar para a lista de turmas
      router.push('/professor');
    }
  }, [classId, router]);

  // Mostrar uma mensagem temporária enquanto redireciona
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecionando...</p>
          </div>
        </div>
      </div>
    </div>
  );
}