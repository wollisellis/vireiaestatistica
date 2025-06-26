'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main games page
    router.push('/jogos')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-emerald-900 mb-2">AvaliaNutri</h2>
        <p className="text-emerald-700">Redirecionando para os jogos educacionais...</p>
      </div>
    </div>
  )
}
