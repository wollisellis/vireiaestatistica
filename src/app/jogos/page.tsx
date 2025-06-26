export default function JogosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-emerald-800 mb-8 text-center">
          AvaliaNutri - Jogos Educacionais
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jogo 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">
              Jogo 1: Indicadores Antropométricos
            </h2>
            <p className="text-gray-600 mb-4">
              Aprenda sobre medidas corporais e cálculo de IMC
            </p>
            <a 
              href="/jogos/1"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Jogar
            </a>
          </div>

          {/* Jogo 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">
              Jogo 2: Indicadores Clínicos
            </h2>
            <p className="text-gray-600 mb-4">
              Explore exames laboratoriais e sinais clínicos
            </p>
            <a 
              href="/jogos/2"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Jogar
            </a>
          </div>

          {/* Jogo 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">
              Jogo 3: Fatores Socioeconômicos
            </h2>
            <p className="text-gray-600 mb-4">
              Analise questionários e dados socioeconômicos
            </p>
            <a 
              href="/jogos/3"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Jogar
            </a>
          </div>

          {/* Jogo 4 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-emerald-700 mb-4">
              Jogo 4: Curvas de Crescimento
            </h2>
            <p className="text-gray-600 mb-4">
              Trabalhe com gráficos de crescimento infantil
            </p>
            <a 
              href="/jogos/4"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Jogar
            </a>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Plataforma educacional para avaliação nutricional
          </p>
        </div>
      </div>
    </div>
  )
}
