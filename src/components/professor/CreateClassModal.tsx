'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateClass: (classData: ClassFormData) => Promise<void>
  loading?: boolean
}

export interface ClassFormData {
  name: string
  semester: string
  year: number
  description: string
  capacity: number
}

export function CreateClassModal({ isOpen, onClose, onCreateClass, loading = false }: CreateClassModalProps) {
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    semester: '',
    year: new Date().getFullYear(),
    description: '',
    capacity: 50
  })
  
  const [errors, setErrors] = useState<Partial<ClassFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const semesterOptions = [
    '1º Semestre',
    '2º Semestre',
    'Intensivo de Verão',
    'Intensivo de Inverno',
    'Anual'
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i)

  const validateForm = (): boolean => {
    const newErrors: Partial<ClassFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da turma é obrigatório'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.semester.trim()) {
      newErrors.semester = 'Semestre é obrigatório'
    }

    if (formData.capacity < 1 || formData.capacity > 200) {
      newErrors.capacity = 'Capacidade deve estar entre 1 e 200'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      await onCreateClass(formData)
      
      // Reset form
      setFormData({
        name: '',
        semester: '',
        year: new Date().getFullYear(),
        description: '',
        capacity: 50
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Erro ao criar turma:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ClassFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-none max-h-none m-0 p-0 sm:w-[90vw] sm:max-w-3xl sm:max-h-[90vh] sm:m-4 sm:rounded-lg overflow-hidden touch-pan-y">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-4 pb-6 sm:p-6 sm:pb-8">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-2xl lg:text-3xl flex items-center space-x-3 flex-1 min-w-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <span className="font-bold truncate">Nova Turma</span>
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-indigo-100 mt-3 text-sm leading-relaxed">
              Configure sua turma e gere um código único para convites
            </p>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 overscroll-contain">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 sm:space-y-6 lg:space-y-8"
            >
              {/* Form Fields */}
              <div className="space-y-5 sm:space-y-6">
                {/* Nome da Turma */}
                <div>
                  <Label htmlFor="className" className="text-base font-medium text-gray-900 mb-3 block">
                    Nome da Turma *
                  </Label>
                  <Input
                    id="className"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Avaliação Nutricional - Turma A"
                    className={`h-14 text-base bg-white border-2 focus:border-indigo-500 rounded-xl ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && (
                    <div className="flex items-center space-x-2 mt-3">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-600">{errors.name}</span>
                    </div>
                  )}
                </div>

                {/* Grid para campos menores em desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Semestre */}
                  <div>
                    <Label htmlFor="semester" className="text-base font-medium text-gray-900 mb-3 block">
                      Semestre *
                    </Label>
                    <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                      <SelectTrigger className={`h-14 text-base bg-white border-2 rounded-xl ${
                        errors.semester ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-indigo-500'
                      }`}>
                        <SelectValue placeholder="Selecione o semestre" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesterOptions.map((semester) => (
                          <SelectItem key={semester} value={semester} className="text-base py-3">
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.semester && (
                      <div className="flex items-center space-x-2 mt-3">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-600">{errors.semester}</span>
                      </div>
                    )}
                  </div>

                  {/* Ano */}
                  <div>
                    <Label htmlFor="year" className="text-base font-medium text-gray-900 mb-3 block">
                      Ano
                    </Label>
                    <Select 
                      value={formData.year.toString()} 
                      onValueChange={(value) => handleInputChange('year', parseInt(value))}
                    >
                      <SelectTrigger className="h-14 text-base bg-white border-2 border-gray-300 focus:border-indigo-500 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-base py-3">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Capacidade */}
                <div>
                  <Label htmlFor="capacity" className="text-base font-medium text-gray-900 mb-3 block">
                    Capacidade Máxima
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.capacity || 50}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 50)}
                    className={`h-14 text-base bg-white border-2 focus:border-indigo-500 rounded-xl ${
                      errors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.capacity && (
                    <div className="flex items-center space-x-2 mt-3">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-600">{errors.capacity}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Número máximo de estudantes que podem se matricular
                  </p>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="description" className="text-base font-medium text-gray-900 mb-3 block">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva os objetivos, horários, metodologia..."
                    rows={4}
                    className="text-base bg-white border-2 border-gray-300 focus:border-indigo-500 resize-none rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Esta informação será visível para os estudantes
                  </p>
                </div>
              </div>

              {/* Info Box - Compact version */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                        Sistema de convites automático
                      </h4>
                      <p className="text-xs text-blue-800">
                        Um código único será gerado para sua turma. Compartilhe com os estudantes para matrícula automática.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 sm:p-6 safe-area-inset-bottom">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="flex-1 h-12 sm:h-12 text-base bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-lg active:scale-95 transition-transform"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando Turma...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Turma
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || loading}
                className="flex-1 h-12 sm:h-12 text-base border-2 border-gray-300 hover:bg-gray-50 font-medium active:scale-95 transition-transform"
              >
                Cancelar
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-3 leading-relaxed">
              Após criar a turma, você poderá compartilhar o código de convite imediatamente
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateClassModal