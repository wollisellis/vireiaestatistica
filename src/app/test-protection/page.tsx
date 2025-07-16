'use client'

import { ContentProtection } from '@/components/security/ContentProtection'

export default function TestProtectionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContentProtection
        enableProtection={true}
        watermarkText="TESTE - AvaliaNutri"
        blurOnPrintScreen={true}
        disableRightClick={true}
        disableTextSelection={true}
        disableDevTools={true}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              🧪 Teste de Proteção de Conteúdo
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 Instruções para Teste
              </h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>1. Teste de Perda de Foco:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clique em outra janela/aplicativo</li>
                  <li>Mude para outra aba do navegador</li>
                  <li>Use Alt+Tab para trocar de aplicativo</li>
                  <li>Minimize a janela</li>
                </ul>
                
                <p><strong>2. Teste de Captura:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Pressione PrintScreen</strong> - Deve mostrar aviso específico</li>
                  <li><strong>Use Win + Shift + S</strong> - Perde foco + ofusca conteúdo</li>
                  <li><strong>Tente usar Snipping Tool</strong> - Detecta perda de foco</li>
                  <li><strong>Abra F12 (DevTools)</strong> - Detecção específica</li>
                </ul>
                
                <p><strong>3. Teste de Interação:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clique com botão direito</li>
                  <li>Tente selecionar texto</li>
                  <li>Use Ctrl+C, Ctrl+V, Ctrl+A</li>
                  <li>Pressione F12</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">
                📊 Conteúdo Educacional Protegido
              </h2>
              <div className="space-y-4 text-blue-900">
                <p>
                  Este é um exemplo de conteúdo educacional que precisa ser protegido
                  contra cópia e captura de tela. O sistema tem <strong>3 tipos de proteção</strong>:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li><strong>🖨️ PrintScreen Direto</strong> - Bloqueia tecla PrintScreen com aviso específico</li>
                  <li><strong>👁️ Perda de Foco</strong> - Detecta quando você sai da janela (Win+Shift+S, Alt+Tab, etc.)</li>
                  <li><strong>🔧 DevTools</strong> - Detecta abertura de ferramentas de desenvolvedor</li>
                  <li><strong>📋 Cópia/Seleção</strong> - Impede seleção de texto e operações de cópia</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm font-semibold">💡 Dica: Abra o Console (F12) para ver os logs de segurança!</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                ⚠️ Comportamento Esperado
              </h2>
              <div className="space-y-3 text-yellow-900">
                <p><strong>Quando você sair desta janela/aba:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>O conteúdo será imediatamente ofuscado (blur)</li>
                  <li>Aparecerá um aviso vermelho no canto superior direito</li>
                  <li>Uma tela de proteção cobrirá todo o conteúdo</li>
                  <li>Será registrada a atividade suspeita no console</li>
                </ul>
                
                <p><strong>Quando você voltar para esta janela/aba:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>O conteúdo será restaurado após 0.5 segundos</li>
                  <li>Os avisos desaparecerão</li>
                  <li>A proteção continuará ativa</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                ✅ Status da Proteção
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Detecção de Perda de Foco</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Bloqueio de PrintScreen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Desabilitação de Clique Direito</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Bloqueio de Seleção de Texto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Detecção de DevTools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Marca d'Água Ativa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentProtection>
    </div>
  )
}
