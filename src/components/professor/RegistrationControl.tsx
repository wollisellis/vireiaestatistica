'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { 
  Users, 
  Lock, 
  Unlock,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserPlus,
  UserX
} from 'lucide-react'
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, where, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { toast } from 'react-hot-toast'

interface RegistrationControlProps {
  className?: string
}

export function RegistrationControl({ className = '' }: RegistrationControlProps) {
  const { user } = useFirebaseAuth()
  const [allowRegistrations, setAllowRegistrations] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [studentCount, setStudentCount] = useState(0)
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (!user?.id) return

    // Buscar configuração inicial
    fetchRegistrationSettings()
    
    // Buscar contagem de estudantes
    fetchStudentCount()

    // Subscrever a mudanças na configuração
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'registration_control'),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data()
          setAllowRegistrations(data.allowNewRegistrations ?? true)
          setLastUpdatedBy(data.lastUpdatedBy || null)
          setLastUpdatedAt(data.lastUpdatedAt?.toDate() || null)
        }
      },
      (error) => {
        console.error('Erro ao monitorar configurações:', error)
      }
    )

    return () => unsubscribe()
  }, [user])

  const fetchRegistrationSettings = async () => {
    try {
      setLoading(true)
      const docRef = doc(db, 'settings', 'registration_control')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setAllowRegistrations(data.allowNewRegistrations ?? true)
        setLastUpdatedBy(data.lastUpdatedBy || null)
        setLastUpdatedAt(data.lastUpdatedAt?.toDate() || null)
      } else {
        // Criar documento com valor padrão se não existir
        await setDoc(docRef, {
          allowNewRegistrations: true,
          lastUpdatedBy: user?.id,
          lastUpdatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentCount = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'student')
      )
      const snapshot = await getDocs(usersQuery)
      setStudentCount(snapshot.size)
    } catch (error) {
      console.error('Erro ao contar estudantes:', error)
    }
  }

  const handleToggleRegistrations = async () => {
    if (!user?.id) return

    try {
      setUpdating(true)
      const newValue = !allowRegistrations

      await setDoc(doc(db, 'settings', 'registration_control'), {
        allowNewRegistrations: newValue,
        lastUpdatedBy: user.id,
        lastUpdatedAt: new Date()
      })

      setAllowRegistrations(newValue)
      
      toast.success(
        newValue 
          ? '✅ Cadastros abertos! Novos alunos podem se registrar.'
          : '🔒 Cadastros fechados! Apenas alunos já cadastrados podem acessar.'
      )
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error)
      toast.error('Erro ao atualizar configuração')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} border-2 ${allowRegistrations ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {allowRegistrations ? (
              <>
                <Unlock className="w-5 h-5 text-green-600" />
                Cadastros Abertos
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-red-600" />
                Cadastros Fechados
              </>
            )}
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {studentCount} alunos
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Descrição do Status */}
        <div className={`p-3 rounded-lg flex items-start gap-2 ${
          allowRegistrations ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {allowRegistrations ? (
            <>
              <UserPlus className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Novos alunos podem criar contas e acessar a plataforma.
              </p>
            </>
          ) : (
            <>
              <UserX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                Apenas alunos já cadastrados podem fazer login. Novos cadastros estão bloqueados.
              </p>
            </>
          )}
        </div>

        {/* Switch de Controle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Switch
              checked={allowRegistrations}
              onCheckedChange={handleToggleRegistrations}
              disabled={updating}
              className="data-[state=checked]:bg-green-600"
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {allowRegistrations ? 'Permitir novos cadastros' : 'Bloquear novos cadastros'}
            </label>
          </div>
          {updating && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {/* Última Atualização */}
        {lastUpdatedAt && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <AlertCircle className="w-3 h-3" />
            <span>
              Última alteração em {lastUpdatedAt.toLocaleDateString('pt-BR')} 
              às {lastUpdatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {/* Aviso */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Atenção:</strong> Ao fechar os cadastros, apenas alunos que já possuem conta 
            poderão acessar a plataforma. Use esta opção quando a turma estiver completa.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RegistrationControl