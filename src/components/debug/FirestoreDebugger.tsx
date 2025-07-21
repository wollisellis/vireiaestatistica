'use client'

// Componente de Debug para diagnosticar problemas com Firestore Rules e turmas
// Para usar: importe em qualquer página do professor e renderize temporariamente

import React, { useState } from 'react'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  limit as limitQuery 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, AlertCircle, Bug, Database, User, Users } from 'lucide-react'

interface DebugResult {
  category: string
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
}

export function FirestoreDebugger() {
  const { user } = useFirebaseAuth()
  const [results, setResults] = useState<DebugResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: DebugResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
  }

  const runDiagnostics = async () => {
    if (!user || !db) {
      addResult({
        category: 'Auth',
        test: 'Usuário Autenticado',
        status: 'error',
        message: 'Usuário não autenticado ou Firebase não configurado'
      })
      return
    }

    setIsRunning(true)
    clearResults()

    console.log('🔍 [FirestoreDebugger] Iniciando diagnósticos...')

    // 1. Verificar documento do usuário na coleção users
    try {
      addResult({
        category: 'Auth',
        test: 'Usuário Firebase',
        status: 'success',
        message: `Autenticado: ${user.email} (${user.uid})`
      })

      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const hasRole = userData.role
        const isProfessor = userData.role === 'professor'

        addResult({
          category: 'Users Collection',
          test: 'Documento do Usuário',
          status: 'success',
          message: `Documento existe na coleção users`,
          data: userData
        })

        addResult({
          category: 'Users Collection',
          test: 'Role do Usuário',
          status: isProfessor ? 'success' : 'error',
          message: `Role: ${hasRole || 'undefined'} ${isProfessor ? '✅' : '❌ (precisa ser professor)'}`
        })
      } else {
        addResult({
          category: 'Users Collection',
          test: 'Documento do Usuário',
          status: 'error',
          message: '❌ CRÍTICO: Documento não existe na coleção users - isso impede acesso às turmas!'
        })
      }
    } catch (error) {
      addResult({
        category: 'Users Collection',
        test: 'Acesso à Coleção Users',
        status: 'error',
        message: `Erro ao acessar: ${error.message}`
      })
    }

    // 2. Tentar listar turmas com query simples (sem filtros)
    try {
      const allClassesSnapshot = await getDocs(collection(db, 'classes'))
      const allClassesCount = allClassesSnapshot.size

      addResult({
        category: 'Classes Collection',
        test: 'Total de Turmas (sem filtros)',
        status: allClassesCount > 0 ? 'success' : 'warning',
        message: `${allClassesCount} documentos na coleção classes`
      })

      if (allClassesCount > 0) {
        const sampleClasses = []
        allClassesSnapshot.forEach((doc, index) => {
          if (index < 3) { // Pegar apenas 3 exemplos
            const data = doc.data()
            sampleClasses.push({
              id: doc.id,
              name: data.name || 'Sem nome',
              status: data.status || 'undefined',
              professorId: data.professorId || 'undefined',
              createdAt: data.createdAt ? 'exists' : 'missing'
            })
          }
        })

        addResult({
          category: 'Classes Collection',
          test: 'Exemplos de Turmas',
          status: 'success',
          message: 'Estrutura das turmas encontradas',
          data: sampleClasses
        })
      }
    } catch (error) {
      addResult({
        category: 'Classes Collection',
        test: 'Acesso à Coleção Classes',
        status: 'error',
        message: `Erro ao acessar: ${error.message}`
      })
    }

    // 3. Tentar query com filtros (que o ProfessorClassService usa)
    try {
      const filteredQuery = query(
        collection(db, 'classes'),
        where('status', '!=', 'deleted')
      )
      
      const filteredSnapshot = await getDocs(filteredQuery)
      const filteredCount = filteredSnapshot.size

      addResult({
        category: 'Classes Collection',
        test: 'Query com Filtro status != deleted',
        status: filteredCount > 0 ? 'success' : 'warning',
        message: `${filteredCount} turmas após filtrar status != deleted`
      })

      if (filteredCount === 0 && filteredSnapshot.size === 0) {
        addResult({
          category: 'Classes Collection',
          test: 'Possível Problema de Status',
          status: 'error',
          message: '❌ PROVÁVEL CAUSA: Todas as turmas podem ter status="deleted" ou sem campo status'
        })
      }
    } catch (error) {
      if (error.message.includes('index')) {
        addResult({
          category: 'Classes Collection',
          test: 'Índice Composto',
          status: 'error',
          message: '❌ CRÍTICO: Falta índice composto. Criar índice para (status, createdAt) no Firebase Console'
        })
      } else {
        addResult({
          category: 'Classes Collection',
          test: 'Query Filtrada',
          status: 'error',
          message: `Erro na query filtrada: ${error.message}`
        })
      }
    }

    // 4. Tentar query completa (como o ProfessorClassService faz)
    try {
      const fullQuery = query(
        collection(db, 'classes'),
        where('status', '!=', 'deleted'),
        orderBy('status', 'desc'),
        orderBy('createdAt', 'desc'),
        limitQuery(10)
      )
      
      const fullSnapshot = await getDocs(fullQuery)
      const fullCount = fullSnapshot.size

      addResult({
        category: 'Classes Collection',
        test: 'Query Completa (como ProfessorClassService)',
        status: fullCount > 0 ? 'success' : 'warning',
        message: `${fullCount} turmas com query completa`
      })
    } catch (error) {
      if (error.message.includes('index')) {
        addResult({
          category: 'Classes Collection',
          test: 'Índice Composto Complexo',
          status: 'error',
          message: '❌ CRÍTICO: Falta índice composto. Criar índice para (status DESC, createdAt DESC) no Firebase Console'
        })
      } else {
        addResult({
          category: 'Classes Collection',
          test: 'Query Completa',
          status: 'error',
          message: `Erro na query completa: ${error.message}`
        })
      }
    }

    // 5. Verificar regras de segurança tentando uma operação
    try {
      // Tentar criar uma turma de teste (vai falhar mas nos dirá se as regras estão funcionando)
      const testClassRef = doc(collection(db, 'classes'))
      // Não vamos realmente criar, apenas testar permissões tentando ler
      await getDoc(testClassRef) // Isso vai sempre funcionar pois documento não existe
      
      addResult({
        category: 'Security Rules',
        test: 'Acesso à Coleção Classes',
        status: 'success',
        message: 'Regras permitem acesso à coleção classes'
      })
    } catch (error) {
      if (error.message.includes('permission-denied')) {
        addResult({
          category: 'Security Rules',
          test: 'Regras de Segurança',
          status: 'error',
          message: '❌ CRÍTICO: Regras do Firestore estão negando acesso. Verificar isProfessor() function'
        })
      }
    }

    setIsRunning(false)
    console.log('✅ [FirestoreDebugger] Diagnósticos concluídos')
  }

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Auth': return <User className="w-4 h-4" />
      case 'Users Collection': return <Users className="w-4 h-4" />
      case 'Classes Collection': return <Database className="w-4 h-4" />
      case 'Security Rules': return <Bug className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-red-600" />
          <span className="text-red-800">🔧 Firestore Debugger - Diagnóstico de Turmas</span>
        </CardTitle>
        <p className="text-red-600 text-sm">
          Este componente de debug ajuda a identificar por que as turmas não estão carregando.
          <br />
          <strong>⚠️ Remover este componente antes do deploy para produção!</strong>
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRunning ? 'Executando...' : 'Executar Diagnósticos'}
            </Button>
            
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning}
            >
              Limpar Resultados
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">📋 Resultados do Diagnóstico:</h3>
              
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {getCategoryIcon(result.category)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getStatusIcon(result.status)}
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                          <span className="font-medium text-sm">
                            {result.test}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {result.message}
                        </p>
                        {result.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 cursor-pointer">
                              Ver dados (clique para expandir)
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Resumo dos problemas críticos */}
              {results.some(r => r.status === 'error') && (
                <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🚨 Problemas Críticos Identificados:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {results
                      .filter(r => r.status === 'error')
                      .map((result, index) => (
                        <li key={index}>
                          <strong>{result.category}:</strong> {result.message}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Soluções recomendadas */}
              <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Soluções Recomendadas:</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Se usuário não tem role=professor: Re-registrar como professor ou atualizar documento users</li>
                  <li>Se falta índice: Firebase Console → Firestore → Indexes → Criar índice composto</li>
                  <li>Se todas turmas deleted: Verificar se há turmas com status=active no banco</li>
                  <li>Se permission-denied: Verificar firestore.rules e função isProfessor()</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Como usar:
// 1. Importe em src/app/professor/page.tsx
// 2. Adicione <FirestoreDebugger /> temporariamente na página
// 3. Execute diagnósticos para ver o problema
// 4. Remova componente após encontrar e corrigir o problema