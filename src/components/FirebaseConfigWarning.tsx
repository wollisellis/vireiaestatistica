import React from 'react'
import { AlertTriangle, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface FirebaseConfigWarningProps {
  onDismiss?: () => void
}

export default function FirebaseConfigWarning({ onDismiss }: FirebaseConfigWarningProps) {
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Firebase Configuration - REAL CREDENTIALS
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envTemplate)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              Firebase não configurado
            </h2>
          </div>

          <div className="space-y-4 text-sm text-gray-600">
            <p>
              O sistema detectou que o Firebase não está configurado com credenciais reais. 
              Para usar a autenticação e banco de dados, você precisa:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Passo a passo:</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Acesse o <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="h-3 w-3" /></a></li>
                <li>Selecione seu projeto (ou crie um novo)</li>
                <li>Vá em "Configurações do projeto" (ícone de engrenagem)</li>
                <li>Na aba "Geral", role até "Seus apps"</li>
                <li>Clique no ícone de configuração (&lt;/&gt;) para ver as credenciais</li>
                <li>Copie os valores e cole no arquivo <code className="bg-gray-100 px-1 rounded">.env.local</code></li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Template do .env.local:</h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                {envTemplate}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">⚠️ Importante:</h3>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>Substitua todos os valores de exemplo pelos valores reais do seu projeto</li>
                <li>Nunca commite o arquivo .env.local no Git (já está no .gitignore)</li>
                <li>Após configurar, reinicie o servidor de desenvolvimento</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Continuar sem Firebase (modo demo)
            </button>
            <a
              href="https://console.firebase.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center inline-flex items-center justify-center gap-2"
            >
              Abrir Firebase Console
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
