'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Shield, 
  Eye, 
  Copy, 
  Code, 
  Camera, 
  Users, 
  Settings,
  Download,
  AlertTriangle
} from 'lucide-react'
import { useGameProtectionSettings, ProtectionStatus } from '@/components/security'

interface ContentProtectionPanelProps {
  className?: string
}

export function ContentProtectionPanel({ className = '' }: ContentProtectionPanelProps) {
  const { 
    settings, 
    toggleScreenshotProtection, 
    toggleCopyProtection, 
    toggleDevToolsProtection, 
    toggleWatermark 
  } = useGameProtectionSettings()
  
  const [selectedGame, setSelectedGame] = useState<number>(1)
  const [showAccessLogs, setShowAccessLogs] = useState(false)

  const games = [
    { id: 1, title: 'Indicadores Antropométricos' },
    { id: 2, title: 'Indicadores Clínicos e Bioquímicos' },
    { id: 3, title: 'Fatores Demográficos e Socioeconômicos' },
    { id: 4, title: 'Curvas de Crescimento Interativas' }
  ]

  const exportAccessLogs = () => {
    const logs = JSON.parse(localStorage.getItem('game-access-logs') || '[]')
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `avalianutri-access-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAccessLogs = () => {
    if (confirm('Tem certeza que deseja limpar todos os logs de acesso?')) {
      localStorage.removeItem('game-access-logs')
      alert('Logs de acesso removidos com sucesso!')
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Proteção de Conteúdo
          </h2>
          <p className="text-gray-600 mt-1">
            Configure as medidas de segurança para proteger o conteúdo educacional
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Sistema Ativo
        </Badge>
      </div>

      {/* Protection Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Proteção
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Screenshot Protection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.screenshotProtection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Proteção contra Screenshots</h4>
                  <p className="text-sm text-gray-600">Bloqueia PrintScreen e embaça conteúdo</p>
                </div>
              </div>
              <Button
                variant={settings.screenshotProtection ? "default" : "outline"}
                size="sm"
                onClick={toggleScreenshotProtection}
              >
                {settings.screenshotProtection ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            {/* Copy Protection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.copyProtection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Proteção contra Cópia</h4>
                  <p className="text-sm text-gray-600">Desabilita seleção e cópia de texto</p>
                </div>
              </div>
              <Button
                variant={settings.copyProtection ? "default" : "outline"}
                size="sm"
                onClick={toggleCopyProtection}
              >
                {settings.copyProtection ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            {/* DevTools Protection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.devToolsProtection ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Proteção DevTools</h4>
                  <p className="text-sm text-gray-600">Bloqueia F12 e ferramentas de desenvolvedor</p>
                </div>
              </div>
              <Button
                variant={settings.devToolsProtection ? "default" : "outline"}
                size="sm"
                onClick={toggleDevToolsProtection}
              >
                {settings.devToolsProtection ? 'Ativo' : 'Inativo'}
              </Button>
            </div>

            {/* Watermark */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${settings.watermarkEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Marca d'Água</h4>
                  <p className="text-sm text-gray-600">Adiciona marca d'água com dados do usuário</p>
                </div>
              </div>
              <Button
                variant={settings.watermarkEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleWatermark}
              >
                {settings.watermarkEnabled ? 'Ativo' : 'Inativo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game-specific Protection Status */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Status por Módulo
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Game Selector */}
            <div className="flex flex-wrap gap-2">
              {games.map((game) => (
                <Button
                  key={game.id}
                  variant={selectedGame === game.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGame(game.id)}
                >
                  Jogo {game.id}
                </Button>
              ))}
            </div>

            {/* Protection Status for Selected Game */}
            <ProtectionStatus gameId={selectedGame} />
          </div>
        </CardContent>
      </Card>

      {/* Access Logs Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Logs de Acesso
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAccessLogs}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAccessLogs}
                className="text-red-600 hover:text-red-700"
              >
                Limpar Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Os logs de acesso registram quando e quem acessou cada módulo educacional.
              Isso ajuda a monitorar o uso do sistema e identificar possíveis tentativas de violação.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">
                📊 Logs armazenados localmente
              </span>
              <span className="text-gray-500">
                🔒 Dados criptografados
              </span>
              <span className="text-gray-500">
                ⏰ Retenção: 30 dias
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Importante sobre Proteção de Conteúdo</h4>
            <p className="text-sm text-blue-800 mt-1">
              As medidas de proteção implementadas dificultam significativamente a cópia e captura de conteúdo, 
              mas não são 100% infalíveis. Usuários com conhecimento técnico avançado podem contornar algumas proteções. 
              O sistema serve principalmente como deterrente e para registrar tentativas de acesso não autorizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
