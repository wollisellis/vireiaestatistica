'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Lock, AlertCircle, CheckCircle } from 'lucide-react'

interface ProfessorCodeModalProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
}

const PROFESSOR_CODE = 'D0c3nt3'

export function ProfessorCodeModal({ isOpen, onSuccess, onCancel }: ProfessorCodeModalProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsValidating(true)

    // Simular pequeno delay para validação
    await new Promise(resolve => setTimeout(resolve, 500))

    if (code === PROFESSOR_CODE) {
      // Salvar no localStorage que o código foi validado
      localStorage.setItem('professor-code-validated', 'true')
      localStorage.setItem('professor-code-timestamp', new Date().toISOString())
      setIsValidating(false)
      onSuccess()
    } else {
      setError('Código inválido. Tente novamente.')
      setIsValidating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Acesso do Professor</h2>
            <p className="text-gray-600 mt-2">
              Digite o código de acesso para continuar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Digite o código de acesso"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`text-center text-lg ${error ? 'border-red-500' : ''}`}
                  autoFocus
                />
                {error && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isValidating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={!code || isValidating}
                >
                  {isValidating ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validando...</span>
                    </span>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Este código é fornecido apenas para professores autorizados.
                Se você não possui o código, utilize o acesso de estudante.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}