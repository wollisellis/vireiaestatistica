'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page which is the login page
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para login...</p>
      </div>
    </div>
  )
}