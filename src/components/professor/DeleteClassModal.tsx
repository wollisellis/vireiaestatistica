'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Trash2, 
  AlertTriangle, 
  Clock, 
  RotateCcw,
  X,
  Users,
  BookOpen,
  Shield,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DeleteClassModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => Promise<void>
  classInfo: {
    id: string
    name: string
    studentsCount: number
    semester: string
    year: number
  }
  loading?: boolean
}

export function DeleteClassModal({ 
  isOpen, 
  onClose, 
  onConfirmDelete, 
  classInfo,
  loading = false 
}: DeleteClassModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [step, setStep] = useState<'warning' | 'confirmation'>('warning')
  const [isDeleting, setIsDeleting] = useState(false)

  const isConfirmationValid = confirmationText === classInfo.name

  const handleConfirmDelete = async () => {
    if (!isConfirmationValid) return

    try {
      setIsDeleting(true)
      await onConfirmDelete()
      
      // Reset modal state
      setConfirmationText('')
      setStep('warning')
      onClose()
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (isDeleting) return
    setConfirmationText('')
    setStep('warning')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none m-0 p-0 sm:w-[90vw] sm:max-w-2xl sm:max-h-[90vh] sm:m-4 sm:rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 pb-6 sm:p-6 sm:pb-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-2xl flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="font-bold truncate">
                  {step === 'warning' ? 'Excluir Turma' : 'Confirmar Exclusão'}
                </span>
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose}
                disabled={isDeleting}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-red-100 mt-3 text-sm leading-relaxed">
              {step === 'warning' 
                ? 'Esta ação enviará a turma para a lixeira por 30 dias'
                : 'Digite o nome da turma para confirmar a exclusão'
              }
            </p>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {step === 'warning' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Informações da turma */}
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-red-900 mb-2">
                          Turma que será excluída:
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-red-600" />
                            <span className="font-medium">{classInfo.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-red-600" />
                            <span>{classInfo.studentsCount} estudantes matriculados</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Info className="w-4 h-4 text-red-600" />
                            <span>{classInfo.semester} {classInfo.year}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* O que acontecerá */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-orange-500" />
                    O que acontecerá:
                  </h4>
                  
                  <div className="space-y-3 ml-7">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        A turma será <strong>movida para a lixeira</strong> e ficará inacessível para estudantes
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        Todos os <strong>dados dos estudantes serão preservados</strong> durante 30 dias
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        Os estudantes <strong>não perderão</strong> seu progresso nos jogos
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700">
                        Você poderá <strong>restaurar a turma</strong> a qualquer momento nos próximos 30 dias
                      </p>
                    </div>
                  </div>
                </div>

                {/* Período de retenção */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Período de Retenção</h4>
                        <p className="text-sm text-yellow-800 mt-1">
                          A turma ficará na lixeira por <strong>30 dias</strong>. Após esse período, 
                          todos os dados serão permanentemente removidos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Como restaurar */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RotateCcw className="w-5 h-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-blue-900">Como Restaurar</h4>
                        <p className="text-sm text-blue-800 mt-1">
                          Acesse <strong>Configurações → Lixeira</strong> no painel do professor 
                          para visualizar e restaurar turmas excluídas.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-red-900 mb-2">
                      Confirmação Final
                    </h3>
                    <p className="text-red-700">
                      Esta ação enviará a turma "{classInfo.name}" para a lixeira.
                    </p>
                  </CardContent>
                </Card>

                <div>
                  <Label htmlFor="confirmName" className="text-base font-medium text-gray-900 mb-3 block">
                    Digite o nome da turma para confirmar: *
                  </Label>
                  <Input
                    id="confirmName"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={classInfo.name}
                    className={`h-14 text-base ${
                      confirmationText && !isConfirmationValid 
                        ? 'border-red-300 bg-red-50' 
                        : isConfirmationValid 
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    disabled={isDeleting}
                  />
                  {confirmationText && !isConfirmationValid && (
                    <p className="text-sm text-red-600 mt-2">
                      O nome não confere. Digite exatamente: "{classInfo.name}"
                    </p>
                  )}
                  {isConfirmationValid && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Nome confirmado corretamente
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {step === 'warning' ? (
                <>
                  <Button
                    onClick={() => setStep('confirmation')}
                    className="flex-1 h-12 text-base bg-red-600 hover:bg-red-700 font-semibold"
                    disabled={loading}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Continuar com Exclusão
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 h-12 text-base border-2 border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleConfirmDelete}
                    disabled={!isConfirmationValid || isDeleting}
                    className="flex-1 h-12 text-base bg-red-600 hover:bg-red-700 disabled:opacity-50 font-semibold"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2" />
                        Confirmar Exclusão
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep('warning')}
                    disabled={isDeleting}
                    className="flex-1 h-12 text-base border-2 border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Voltar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteClassModal