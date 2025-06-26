export default function HomePage() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          AvaliaNutri - Teste
        </h1>
        <p className="text-blue-700 mb-8">
          Página de teste funcionando!
        </p>
        <a 
          href="/jogos"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Ir para Jogos
        </a>
      </div>
    </div>
  )
}
