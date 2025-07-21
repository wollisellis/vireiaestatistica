'use client'

// Corretor de Status das Turmas - Execução única para corrigir problema identificado
// USAR APENAS UMA VEZ - Depois remover componente

import React, { useState } from 'react'
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, AlertTriangle, Wrench, Play } from 'lucide-react'

interface FixResult {
  classId: string
  className: string
  oldStatus: string | undefined
  newStatus: string
  result: 'success' | 'error'
  message: string
}

export function ClassStatusFixer() {
  const [results, setResults] = useState<FixResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const addResult = (result: FixResult) => {
    setResults(prev => [...prev, result])
  }

  const clearResults = () => {
    setResults([])
    setShowPreview(true)
  }

  const previewClassesStatus = async () => {
    console.log('🔍 [ClassStatusFixer] Carregando preview das turmas...')
    setResults([])
    
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'))
      
      classesSnapshot.forEach((classDoc) => {
        const data = classDoc.data()
        const currentStatus = data.status
        const needsFix = !currentStatus || currentStatus === 'deleted'
        
        addResult({
          classId: classDoc.id,
          className: data.name || 'Nome não definido',
          oldStatus: currentStatus,
          newStatus: 'active',
          result: needsFix ? 'error' : 'success',
          message: needsFix 
            ? `❌ Precisa correção: status="${currentStatus || 'undefined'}"` 
            : `✅ Status OK: "${currentStatus}"`
        })
      })

      console.log('✅ [ClassStatusFixer] Preview carregado')
    } catch (error) {
      console.error('❌ [ClassStatusFixer] Erro no preview:', error)
      addResult({
        classId: 'error',
        className: 'ERRO',
        oldStatus: undefined,
        newStatus: 'active',
        result: 'error',
        message: `Erro ao carregar preview: ${error.message}`
      })
    }
  }

  const fixAllClassesStatus = async () => {
    if (!confirm('⚠️ CONFIRMAÇÃO: Deseja corrigir o status de TODAS as turmas para "active"?\n\nEsta operação não pode ser desfeita!')) {
      return
    }

    setIsRunning(true)
    setResults([])
    setShowPreview(false)
    
    console.log('🔧 [ClassStatusFixer] Iniciando correção em lote...')

    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'))
      const batch = writeBatch(db)
      let fixCount = 0
      let skipCount = 0

      // Preparar batch de updates
      classesSnapshot.forEach((classDoc) => {
        const data = classDoc.data()
        const currentStatus = data.status
        const needsFix = !currentStatus || currentStatus === 'deleted'

        if (needsFix) {
          const classRef = doc(db, 'classes', classDoc.id)
          batch.update(classRef, { 
            status: 'active',
            updatedAt: new Date(),
            statusFixedAt: new Date(),
            statusFixedBy: 'ClassStatusFixer'
          })
          
          fixCount++
          addResult({
            classId: classDoc.id,
            className: data.name || 'Nome não definido',
            oldStatus: currentStatus,
            newStatus: 'active',
            result: 'success',
            message: `✅ Corrigido: "${currentStatus || 'undefined'}" → "active"`
          })
        } else {
          skipCount++
          addResult({
            classId: classDoc.id,
            className: data.name || 'Nome não definido', 
            oldStatus: currentStatus,
            newStatus: currentStatus,
            result: 'success',
            message: `⏭️ Ignorado: status já é "${currentStatus}"`
          })
        }
      })

      // Executar batch
      if (fixCount > 0) {
        await batch.commit()
        console.log(`✅ [ClassStatusFixer] ${fixCount} turmas corrigidas, ${skipCount} ignoradas`)
        
        addResult({
          classId: 'summary',
          className: 'RESUMO FINAL',
          oldStatus: undefined,
          newStatus: 'active',
          result: 'success',
          message: `🎉 SUCESSO: ${fixCount} turmas corrigidas para "active", ${skipCount} já estavam corretas`
        })
      } else {
        addResult({
          classId: 'summary',
          className: 'RESUMO FINAL',
          oldStatus: undefined,
          newStatus: 'active',
          result: 'success',
          message: `ℹ️ Nenhuma correção necessária - todas as ${skipCount} turmas já têm status válido`
        })
      }

    } catch (error) {
      console.error('❌ [ClassStatusFixer] Erro na correção:', error)
      addResult({
        classId: 'error',
        className: 'ERRO NA CORREÇÃO',
        oldStatus: undefined,
        newStatus: 'active',
        result: 'error',
        message: `❌ Erro durante correção: ${error.message}`
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getResultIcon = (result: FixResult['result']) => {
    switch (result) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  const needsFixCount = results.filter(r => 
    r.result === 'error' && r.classId !== 'error' && r.classId !== 'summary'
  ).length

  return (
    <Card className="w-full max-w-4xl mx-auto border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wrench className="w-5 h-5 text-orange-600" />
          <span className="text-orange-800">🔧 Corretor de Status das Turmas</span>
        </CardTitle>
        <p className="text-orange-600 text-sm">
          <strong>Problema identificado:</strong> 7 turmas existem mas têm status="deleted" ou sem status.
          <br />
          <strong>Solução:</strong> Corrigir status para "active" para que apareçam na interface.
          <br />
          <strong>⚠️ Usar apenas UMA VEZ - Remover componente após correção!</strong>
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button
              onClick={previewClassesStatus}
              disabled={isRunning}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Turmas
            </Button>
            
            <Button
              onClick={fixAllClassesStatus}
              disabled={isRunning || needsFixCount === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRunning ? 'Corrigindo...' : `Corrigir ${needsFixCount > 0 ? needsFixCount : ''} Turmas`}
            </Button>
            
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning}
            >
              Limpar
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                {showPreview ? '👀 Preview - Estado Atual das Turmas:' : '📋 Resultados da Correção:'}
              </h3>
              
              {needsFixCount > 0 && showPreview && (
                <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>{needsFixCount} turmas</strong> precisam de correção de status.
                    Clique em "Corrigir Turmas" para resolver o problema.
                  </p>
                </div>
              )}
              
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {getResultIcon(result.result)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.classId === 'summary' ? 'RESUMO' : 
                             result.classId === 'error' ? 'ERRO' : 'TURMA'}
                          </Badge>
                          <span className="font-medium text-sm">
                            {result.className}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {result.message}
                        </p>
                        {result.classId !== 'summary' && result.classId !== 'error' && (
                          <p className="text-xs text-gray-500 mt-1">
                            ID: {result.classId} | Status: {result.oldStatus || 'undefined'} → {result.newStatus}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!showPreview && results.some(r => r.result === 'success' && r.classId === 'summary') && (
                <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Correção Concluída com Sucesso!</h4>
                  <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                    <li>As turmas agora têm status="active" e devem aparecer na interface</li>
                    <li>Recarregue a página do professor para ver as turmas</li>
                    <li><strong>IMPORTANTE:</strong> Remova este componente ClassStatusFixer do código</li>
                    <li>O problema está resolvido - não execute novamente</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}