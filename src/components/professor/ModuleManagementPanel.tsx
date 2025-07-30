'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { 
  ProfessorClassService, 
  ModuleSettings,
  ClassStatistics 
} from '@/services/professorClassService'
import { modules } from '@/data/modules'
import { 
  Lock, 
  Unlock, 
  Settings, 
  Calendar,
  Clock,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Eye,
  Edit
} from 'lucide-react'

interface ModuleManagementPanelProps {
  classId: string
  className?: string
}

export function ModuleManagementPanel({ classId, className = '' }: ModuleManagementPanelProps) {
  const [moduleSettings, setModuleSettings] = useState<ModuleSettings[]>([])
  const [classStats, setClassStats] = useState<ClassStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  // Carregar configurações dos módulos
  useEffect(() => {
    loadModuleSettings()
    loadClassStatistics()
  }, [classId])

  const loadModuleSettings = async () => {
    try {
      const settings = await ProfessorClassService.getModuleSettings(classId)
      setModuleSettings(settings)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadClassStatistics = async () => {
    try {
      const stats = await ProfessorClassService.getClassStatistics(classId)
      setClassStats(stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Bloquear/Desbloquear módulo
  const toggleModuleAccess = async (moduleId: string, isCurrentlyAvailable: boolean) => {
    try {
      if (isCurrentlyAvailable) {
        await ProfessorClassService.lockModuleForClass(classId, moduleId)
      } else {
        await ProfessorClassService.unlockModuleForClass(classId, moduleId)
      }
      
      // Atualizar configurações locais
      setModuleSettings(prev => prev.map(setting => 
        setting.moduleId === moduleId 
          ? { ...setting, isAvailable: !isCurrentlyAvailable }
          : setting
      ))
      
      console.log(`Módulo ${moduleId} ${isCurrentlyAvailable ? 'bloqueado' : 'desbloqueado'}`)
    } catch (error) {
      console.error('Erro ao alterar acesso do módulo:', error)
    }
  }

  // Configurar módulo avançado
  const configureModule = async (moduleId: string, newSettings: Partial<ModuleSettings>) => {
    try {
      await ProfessorClassService.configureModule(classId, moduleId, newSettings)
      
      // Atualizar configurações locais
      setModuleSettings(prev => prev.map(setting => 
        setting.moduleId === moduleId 
          ? { ...setting, ...newSettings }
          : setting
      ))
      
      setSelectedModule(null)
      console.log('Configurações do módulo atualizadas')
    } catch (error) {
      console.error('Erro ao configurar módulo:', error)
    }
  }

  // Obter configuração de um módulo específico
  const getModuleSetting = (moduleId: string): ModuleSettings | null => {
    return moduleSettings.find(setting => setting.moduleId === moduleId) || null
  }

  // Obter estatísticas de um módulo específico
  const getModuleStats = (moduleId: string) => {
    return classStats?.moduleStats[moduleId] || {
      studentsStarted: 0,
      studentsCompleted: 0,
      averageScore: 0,
      averageTime: 0,
      completionRate: 0,
      difficulty: 'Médio'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas gerais */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>Gerenciamento de Módulos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {classStats?.totalStudents || 0}
              </div>
              <div className="text-sm text-gray-600">Estudantes</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {classStats?.averageProgress || 0}%
              </div>
              <div className="text-sm text-gray-600">Progresso Médio</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {classStats?.averageScore.toFixed(0) || 0}
              </div>
              <div className="text-sm text-gray-600">Pontuação Média</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {classStats?.activeStudents || 0}
              </div>
              <div className="text-sm text-gray-600">Ativos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Realidade da Plataforma */}
      <Card className="bg-yellow-50 border-yellow-200 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Status Real da Plataforma</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-yellow-700">
            <p className="mb-2">
              <strong>Situação Atual:</strong> Apenas 1 módulo está totalmente implementado e funcional para os estudantes.
            </p>
            <p className="text-sm">
              Os módulos 2-4 possuem apenas estrutura de dados (não funcionais). 
              Esta é a mesma visualização que os estudantes têm em <code className="bg-yellow-100 px-1 rounded">/jogos</code>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Módulo Funcional */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Módulo Implementado e Ativo
        </h3>
        
        {(() => {
          const module = modules.find(m => m.id === 'module-1')
          if (!module) return null
          
          const setting = getModuleSetting(module.id)
          const stats = getModuleStats(module.id)
          const isAvailable = setting?.isAvailable || false
          
          return (
            <FunctionalModuleCard
              module={module}
              setting={setting}
              stats={stats}
              isAvailable={isAvailable}
              onToggleAccess={() => toggleModuleAccess(module.id, isAvailable)}
              onConfigure={(newSettings) => configureModule(module.id, newSettings)}
            />
          )
        })()}
      </div>

      {/* Módulos em Desenvolvimento */}
      <div>
        <h3 className="text-lg font-semibold text-gray-600 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Módulos Planejados (Apenas Estrutura)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.filter(m => m.id !== 'module-1').map((module, index) => (
            <PlannedModuleCard key={module.id} module={module} moduleNumber={index + 2} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ModuleCardProps {
  module: any
  setting: ModuleSettings | null
  stats: any
  isAvailable: boolean
  moduleNumber: number
  onToggleAccess: () => void
  onConfigure: (settings: Partial<ModuleSettings>) => void
}

function ModuleCard({ 
  module, 
  setting, 
  stats, 
  isAvailable, 
  moduleNumber,
  onToggleAccess,
  onConfigure 
}: ModuleCardProps) {
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [configForm, setConfigForm] = useState({
    minPassingScore: setting?.minPassingScore || 70,
    maxAttempts: setting?.maxAttempts || undefined,
    timeLimit: setting?.timeLimit || undefined,
    isCollaborativeEnabled: setting?.isCollaborativeEnabled || true,
    customInstructions: setting?.customInstructions || '',
    weight: setting?.weight || (module.id === 'module-1' ? 70 : module.id === 'module-2' ? 30 : 100)
  })

  const handleSaveConfig = () => {
    onConfigure(configForm)
    setIsConfiguring(false)
  }

  // Determinar cor do status
  const getStatusColor = () => {
    if (!isAvailable) return 'red'
    if (stats.completionRate >= 80) return 'green'
    if (stats.completionRate >= 50) return 'yellow'
    return 'blue'
  }

  const statusColor = getStatusColor()

  return (
    <Card className={`transition-all duration-200 ${
      !isAvailable ? 'opacity-75 border-red-200' : 'hover:shadow-md'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {moduleNumber}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {module.description}
                </p>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge 
                variant={isAvailable ? 'success' : 'secondary'}
                className="text-xs"
              >
                {isAvailable ? (
                  <><Unlock className="w-3 h-3 mr-1" /> Disponível</>
                ) : (
                  <><Lock className="w-3 h-3 mr-1" /> Bloqueado</>
                )}
              </Badge>
              
              <Badge 
                variant={statusColor === 'green' ? 'success' : 
                        statusColor === 'yellow' ? 'warning' : 'info'}
                className="text-xs"
              >
                {stats.completionRate.toFixed(0)}% Conclusão
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {stats.difficulty}
              </Badge>
              
              <Badge variant="outline" className="text-xs bg-purple-50 border-purple-300 text-purple-700">
                Peso: {setting?.weight || (module.id === 'module-1' ? 70 : module.id === 'module-2' ? 30 : 100)} pts
              </Badge>
            </div>
          </div>

          {/* Switch de acesso */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAvailable}
              onCheckedChange={onToggleAccess}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm text-gray-600">
              {isAvailable ? 'Ativo' : 'Bloqueado'}
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{stats.studentsStarted}</div>
            <div className="text-xs text-gray-600">Iniciaram</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{stats.studentsCompleted}</div>
            <div className="text-xs text-gray-600">Concluíram</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{stats.averageScore.toFixed(0)}</div>
            <div className="text-xs text-gray-600">Nota Média</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-lg font-semibold">{Math.round(stats.averageTime / 60)}min</div>
            <div className="text-xs text-gray-600">Tempo Médio</div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Ver detalhes do módulo')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          
          <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurações do Módulo</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Peso do Módulo (0-100)</label>
                  <Input
                    type="number"
                    value={configForm.weight}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      weight: parseInt(e.target.value) || 100
                    }))}
                    min={0}
                    max={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Define quantos pontos este módulo vale no total
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Nota Mínima para Aprovação</label>
                  <Input
                    type="number"
                    value={configForm.minPassingScore}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      minPassingScore: parseInt(e.target.value) || 70
                    }))}
                    min={0}
                    max={100}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tentativas Máximas (opcional)</label>
                  <Input
                    type="number"
                    value={configForm.maxAttempts || ''}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      maxAttempts: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="Ilimitado"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Limite de Tempo (minutos, opcional)</label>
                  <Input
                    type="number"
                    value={configForm.timeLimit || ''}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined
                    }))}
                    placeholder="Sem limite"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={configForm.isCollaborativeEnabled}
                    onCheckedChange={(checked) => setConfigForm(prev => ({
                      ...prev,
                      isCollaborativeEnabled: checked
                    }))}
                  />
                  <label className="text-sm font-medium">Atividades Colaborativas</label>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Instruções Personalizadas</label>
                  <Textarea
                    value={configForm.customInstructions}
                    onChange={(e) => setConfigForm(prev => ({
                      ...prev,
                      customInstructions: e.target.value
                    }))}
                    placeholder="Instruções específicas para este módulo..."
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSaveConfig} className="flex-1">
                    Salvar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfiguring(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerta para módulos com baixa performance */}
        {isAvailable && stats.completionRate < 30 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Atenção</span>
            </div>
            <div className="text-sm text-yellow-700 mt-1">
              Baixa taxa de conclusão. Considere revisar o conteúdo ou oferece suporte adicional.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para módulos funcionais (implementados)
function FunctionalModuleCard(props: any) {
  // Usar o ModuleCard padrão para módulos funcionais
  return <ModuleCard {...props} moduleNumber={1} />
}

// Componente para módulos planejados (não implementados)
function PlannedModuleCard({ module, moduleNumber }: { module: any; moduleNumber: number }) {
  return (
    <Card className="opacity-60 border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-sm font-bold">
            {moduleNumber}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {module.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {module.description}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{module.estimatedTime || 90} min</span>
              </div>
              
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-300">
                Em desenvolvimento
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ModuleManagementPanel