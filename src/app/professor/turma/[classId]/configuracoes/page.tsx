'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import ProfessorClassService, { ClassInfo, ModuleSettings } from '@/services/professorClassService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { 
  ArrowLeft,
  Save,
  Lock,
  Unlock,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  Trash2,
  Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { modules } from '@/data/modules'

export default function ClassSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const classId = params.classId as string

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null)
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingClass, setEditingClass] = useState(false)
  const [classData, setClassData] = useState({
    name: '',
    semester: '',
    year: 2025,
    capacity: 50
  })

  useEffect(() => {
    if (user && classId) {
      loadSettings()
    }
  }, [user, classId])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const [info, settings] = await Promise.all([
        ProfessorClassService.getClassInfo(classId),
        ProfessorClassService.getModuleSettings(classId)
      ])

      if (info) {
        setClassInfo(info)
        setClassData({
          name: info.name,
          semester: info.semester,
          year: info.year,
          capacity: 50 // Adicionar campo capacity ao ClassInfo
        })

        // Criar configurações para módulos que ainda não têm
        const existingModuleIds = settings.map(s => s.moduleId)
        const allModuleSettings = modules.map(module => {
          const existing = settings.find(s => s.moduleId === module.id)
          return existing || {
            moduleId: module.id,
            moduleName: module.title,
            isAvailable: module.id === 'game1', // Apenas game1 liberado por padrão
            isCollaborativeEnabled: true,
            minPassingScore: 70,
            prerequisites: [],
            customInstructions: ''
          }
        })

        setModuleSettings(allModuleSettings)
      } else {
        toast.error('Turma não encontrada')
        router.push('/professor')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleModuleToggle = async (moduleId: string, isAvailable: boolean) => {
    try {
      setSaving(true)
      
      if (isAvailable) {
        await ProfessorClassService.unlockModuleForClass(classId, moduleId)
        toast.success('Módulo desbloqueado')
      } else {
        await ProfessorClassService.lockModuleForClass(classId, moduleId)
        toast.success('Módulo bloqueado')
      }

      // Atualizar estado local
      setModuleSettings(prev => 
        prev.map(m => m.moduleId === moduleId ? { ...m, isAvailable } : m)
      )
    } catch (error) {
      toast.error('Erro ao atualizar módulo')
    } finally {
      setSaving(false)
    }
  }

  const handleModuleSettingChange = async (moduleId: string, field: keyof ModuleSettings, value: any) => {
    try {
      const updatedSettings = moduleSettings.map(m => 
        m.moduleId === moduleId ? { ...m, [field]: value } : m
      )
      setModuleSettings(updatedSettings)

      // Salvar automaticamente algumas configurações
      if (field === 'minPassingScore' || field === 'isCollaborativeEnabled') {
        setSaving(true)
        const moduleConfig = updatedSettings.find(m => m.moduleId === moduleId)
        if (moduleConfig) {
          await ProfessorClassService.configureModule(classId, moduleId, {
            [field]: value
          })
          toast.success('Configuração salva')
        }
        setSaving(false)
      }
    } catch (error) {
      toast.error('Erro ao salvar configuração')
      setSaving(false)
    }
  }

  const saveClassSettings = async () => {
    try {
      setSaving(true)
      // Implementar atualização dos dados da turma
      toast.success('Configurações da turma salvas')
      setEditingClass(false)
    } catch (error) {
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const deleteClass = async () => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await ProfessorClassService.deleteClass(classId, user!.uid)
      toast.success('Turma excluída com sucesso')
      router.push('/professor')
    } catch (error) {
      toast.error('Erro ao excluir turma')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/professor/turma/${classId}`)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configurações da Turma</h1>
                <p className="text-sm text-gray-500">{classInfo?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Informações da Turma */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações da Turma</CardTitle>
                {!editingClass ? (
                  <Button variant="outline" onClick={() => setEditingClass(true)}>
                    Editar
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => setEditingClass(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={saveClassSettings} disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome da Turma</Label>
                  <Input
                    value={classData.name}
                    onChange={(e) => setClassData({ ...classData, name: e.target.value })}
                    disabled={!editingClass}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Semestre</Label>
                  <Input
                    value={classData.semester}
                    onChange={(e) => setClassData({ ...classData, semester: e.target.value })}
                    disabled={!editingClass}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Ano</Label>
                  <Input
                    type="number"
                    value={classData.year}
                    onChange={(e) => setClassData({ ...classData, year: parseInt(e.target.value) })}
                    disabled={!editingClass}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Capacidade Máxima</Label>
                  <Input
                    type="number"
                    value={classData.capacity}
                    onChange={(e) => setClassData({ ...classData, capacity: parseInt(e.target.value) })}
                    disabled={!editingClass}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Código de Convite</p>
                    <p className="text-2xl font-mono font-bold text-indigo-600">{classInfo?.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Alunos matriculados</p>
                    <p className="text-2xl font-bold">{classInfo?.studentsCount || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações dos Módulos */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações dos Módulos</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Controle quais módulos estão disponíveis para os alunos desta turma
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moduleSettings.map((module, index) => (
                  <motion.div
                    key={module.moduleId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {module.isAvailable ? (
                          <Unlock className="w-5 h-5 text-green-600" />
                        ) : (
                          <Lock className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <h4 className="font-semibold">{module.moduleName}</h4>
                          <p className="text-sm text-gray-500">
                            {module.isAvailable ? 'Disponível' : 'Bloqueado'} para os alunos
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={module.isAvailable}
                        onCheckedChange={(checked) => handleModuleToggle(module.moduleId, checked)}
                        disabled={saving}
                      />
                    </div>

                    {module.isAvailable && (
                      <div className="space-y-3 mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Nota Mínima para Aprovação</Label>
                            <Select
                              value={module.minPassingScore.toString()}
                              onValueChange={(value) => 
                                handleModuleSettingChange(module.moduleId, 'minPassingScore', parseInt(value))
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="50">50%</SelectItem>
                                <SelectItem value="60">60%</SelectItem>
                                <SelectItem value="70">70%</SelectItem>
                                <SelectItem value="80">80%</SelectItem>
                                <SelectItem value="90">90%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">Modo Colaborativo</Label>
                            <div className="flex items-center space-x-2 mt-2">
                              <Switch
                                checked={module.isCollaborativeEnabled}
                                onCheckedChange={(checked) => 
                                  handleModuleSettingChange(module.moduleId, 'isCollaborativeEnabled', checked)
                                }
                              />
                              <span className="text-sm text-gray-600">
                                {module.isCollaborativeEnabled ? 'Ativado' : 'Desativado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm">Instruções Personalizadas (opcional)</Label>
                          <Textarea
                            value={module.customInstructions || ''}
                            onChange={(e) => 
                              handleModuleSettingChange(module.moduleId, 'customInstructions', e.target.value)
                            }
                            placeholder="Adicione instruções específicas para este módulo..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Zona de Perigo */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-red-900">Excluir Turma</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Esta ação é permanente e não pode ser desfeita.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={deleteClass}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Turma
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}