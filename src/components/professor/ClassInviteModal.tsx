'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  Copy, 
  Share, 
  QrCode, 
  Users, 
  Calendar,
  CheckCircle,
  Mail,
  MessageSquare,
  Download,
  ExternalLink,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

interface ClassInviteModalProps {
  isOpen: boolean
  onClose: () => void
  classInfo: {
    id: string
    name: string
    code: string
    semester: string
    year: number
    studentsCount: number
    capacity?: number
    maxStudents?: number
  }
}

export function ClassInviteModal({ isOpen, onClose, classInfo }: ClassInviteModalProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Verificações de segurança
  if (!classInfo) {
    return null
  }

  const safeClassInfo = {
    ...classInfo,
    code: classInfo.code || classInfo.inviteCode || 'CÓDIGO_PENDENTE',
    capacity: classInfo.capacity || classInfo.maxStudents || 50,
    studentsCount: classInfo.studentsCount || 0
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/entrar-turma?codigo=${safeClassInfo.code}`
  
  const copyToClipboard = (text: string, type: string) => {
    if (!text || text === 'CÓDIGO_PENDENTE') {
      alert('Código ainda não foi gerado. Tente novamente em alguns segundos.')
      return
    }

    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const shareViaEmail = () => {
    const subject = `Convite para a turma: ${safeClassInfo.name}`
    const body = `Olá!

Você foi convidado(a) para participar da turma:

📚 ${safeClassInfo.name}
📅 ${safeClassInfo.semester} ${safeClassInfo.year}
👥 ${safeClassInfo.studentsCount}/${safeClassInfo.capacity} estudantes

Para entrar na turma, você pode:

1. Clicar no link: ${inviteLink}
2. Ou usar o código: ${safeClassInfo.code}

Acesse a plataforma AvaliaNutri e faça sua matrícula!

Atenciosamente,
Professor`

    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  const shareViaWhatsApp = () => {
    const message = `🎓 *Convite para Turma - AvaliaNutri*

📚 *Turma:* ${safeClassInfo.name}
📅 *Período:* ${safeClassInfo.semester} ${safeClassInfo.year}
👥 *Vagas:* ${safeClassInfo.capacity - safeClassInfo.studentsCount} disponíveis

*Para entrar na turma:*
1. Acesse: ${inviteLink}
2. Ou use o código: *${safeClassInfo.code}*

Entre agora e comece a aprender! 🚀`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const downloadQRCode = () => {
    // Implementar geração e download de QR code
    alert('Funcionalidade de QR Code em desenvolvimento')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Share className="w-6 h-6 text-indigo-600" />
            <span>Convite para Turma</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Informações da turma */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-indigo-900">{safeClassInfo.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-indigo-700">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{safeClassInfo.semester} {safeClassInfo.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{safeClassInfo.studentsCount}/{safeClassInfo.capacity} estudantes</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800 text-lg px-4 py-2 font-mono">
                  {classInfo.code}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de compartilhamento rápido */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Compartilhar Convite</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={shareViaWhatsApp}
                className="h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                WhatsApp
              </Button>
              
              <Button
                onClick={shareViaEmail}
                variant="outline"
                className="h-12 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email
              </Button>
              
              <Button
                onClick={downloadQRCode}
                variant="outline"
                className="h-12 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <QrCode className="w-5 h-5 mr-2" />
                QR Code
              </Button>
            </div>
          </div>

          {/* Código da turma */}
          <div>
            <Label className="text-base font-medium">Código da Turma</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                value={safeClassInfo.code}
                readOnly
                className={`font-mono text-lg text-center tracking-wider ${
                  safeClassInfo.code === 'CÓDIGO_PENDENTE' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                }`}
              />
              <Button
                onClick={() => copyToClipboard(safeClassInfo.code, 'code')}
                variant="outline"
                className={`px-4 ${copied === 'code' ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                disabled={safeClassInfo.code === 'CÓDIGO_PENDENTE'}
              >
                {copied === 'code' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {safeClassInfo.code === 'CÓDIGO_PENDENTE'
                ? 'Código sendo gerado... Aguarde alguns segundos e reabra este modal.'
                : 'Compartilhe este código com os estudantes para que possam se matricular'
              }
            </p>
          </div>

          {/* Link de convite */}
          <div>
            <Label className="text-base font-medium">Link de Convite Direto</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                value={inviteLink}
                readOnly
                className="text-sm bg-gray-50"
              />
              <Button
                onClick={() => copyToClipboard(inviteLink, 'link')}
                variant="outline"
                className={`px-4 ${copied === 'link' ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
              >
                {copied === 'link' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => window.open(inviteLink, '_blank')}
                variant="outline"
                className="px-4"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Link direto que leva os estudantes para a página de matrícula
            </p>
          </div>

          {/* Instruções para estudantes */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Instruções para Estudantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Acessar a plataforma AvaliaNutri</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Clicar no link de convite OU inserir o código da turma</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Fazer login com email @dac.unicamp.br ou criar conta</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Matrícula automática na turma após autenticação</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opções avançadas */}
          <div>
            <Button
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between text-gray-600"
            >
              <span>Opções Avançadas</span>
              <motion.div
                animate={{ rotate: showAdvanced ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ▼
              </motion.div>
            </Button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <Card className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Expiração do Convite</span>
                          <p className="text-sm text-gray-600">Definir prazo limite para matrículas</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Clock className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Limite de Estudantes</span>
                          <p className="text-sm text-gray-600">Capacidade máxima da turma</p>
                        </div>
                        <Badge variant="outline">
                          {classInfo.capacity} vagas
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">Gerar Novo Código</span>
                          <p className="text-sm text-gray-600">Invalidar código atual e criar novo</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                          Regenerar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Ações finais */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={onClose} className="flex-1">
              Concluído
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ClassInviteModal