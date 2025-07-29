import { DocenteRegistration } from '@/components/auth/DocenteRegistration'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro de Docente - AvaliaNutri',
  description: 'Cadastro seguro para docentes na plataforma AvaliaNutri',
}

export default function DocenteRegistroPage() {
  return <DocenteRegistration />
}