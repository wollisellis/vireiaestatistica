'use client'

import React from 'react'

export default function SimpleJogosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-white text-2xl">⚖️</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                AvaliaNutri
              </h1>
              <p className="text-xl text-emerald-600 mt-2 font-medium">Jogos Educacionais para Avaliação Nutricional</p>
              <p className="text-sm text-gray-600 mt-1">NT600 - Proposta Inovadora 2025</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Plataforma inovadora para ensino de avaliação nutricional através de gamificação educacional 
            com dados reais brasileiros e abordagem ultra-iniciante.
          </p>
        </div>

        {/* Learning Connection Card */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-4">🎯</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Como os Jogos Reforçam seu Aprendizado</h2>
                <p className="text-gray-600">Conexão direta entre teoria e prática em avaliação nutricional</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg border border-emerald-100">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-3">⚖️</span>
                  <h3 className="font-semibold text-gray-900">Teoria → Prática</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Cada conceito teórico da disciplina é aplicado em <strong>casos reais brasileiros</strong>, 
                  permitindo que você pratique imediatamente o que aprendeu em aula.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-emerald-100">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-3">📊</span>
                  <h3 className="font-semibold text-gray-900">Dados Autênticos</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Trabalhe com <strong>datasets reais</strong> do IBGE, Ministério da Saúde e pesquisas 
                  peer-reviewed, preparando você para a realidade profissional.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg border border-emerald-100">
                <div className="flex items-center mb-3">
                  <span className="text-xl mr-3">📈</span>
                  <h3 className="font-semibold text-gray-900">Progresso Mensurável</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Acompanhe seu <strong>desenvolvimento</strong> através de pontuações e feedback 
                  imediato, identificando áreas que precisam de mais estudo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Progress */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">🏆</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Seu Progresso</h3>
                  <p className="text-sm text-gray-600">
                    0/3 jogos • 0% média
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200">
                Começar
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Game 1 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">📏</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">Muito Fácil</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Jogo 1: Indicadores Antropométricos</h3>
              <p className="text-emerald-100 text-sm">
                Aprenda a avaliar peso, altura, IMC e circunferências usando dados reais da população brasileira
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>15-20 minutos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🎯</span>
                  <span>8 exercícios + curvas de crescimento</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📊</span>
                  <span>Dados POF-IBGE</span>
                </div>
              </div>
              <button className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                Começar Jogo
              </button>
            </div>
          </div>

          {/* Game 2 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-teal-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🩺</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">Médio</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Jogo 2: Indicadores Clínicos e Bioquímicos</h3>
              <p className="text-teal-100 text-sm">
                Domine a interpretação de exames laboratoriais e sinais clínicos para avaliação nutricional
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>20-25 minutos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🎯</span>
                  <span>5 exercícios com casos clínicos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📊</span>
                  <span>Dados PNS-Ministério da Saúde</span>
                </div>
              </div>
              <button className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-600 transition-colors">
                Começar Jogo
              </button>
            </div>
          </div>

          {/* Game 3 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-cyan-500 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">👥</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">Difícil</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Jogo 3: Fatores Socioeconômicos</h3>
              <p className="text-cyan-100 text-sm">
                Entenda como fatores sociais e econômicos influenciam o estado nutricional populacional
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>25-30 minutos</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🎯</span>
                  <span>5 exercícios com análise populacional</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📊</span>
                  <span>Dados SISVAN</span>
                </div>
              </div>
              <button className="w-full bg-cyan-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-cyan-600 transition-colors">
                Começar Jogo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 p-8 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Platform Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white">⚖️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    AvaliaNutri
                  </h3>
                  <p className="text-sm text-emerald-600">Jogos Educacionais</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Plataforma inovadora para ensino de avaliação nutricional através de 
                gamificação educacional com dados reais brasileiros.
              </p>
            </div>

            {/* Educational Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recursos Educacionais</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  Indicadores Antropométricos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                  Indicadores Clínicos e Bioquímicos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></span>
                  Fatores Socioeconômicos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Curvas de Crescimento
                </li>
              </ul>
            </div>

            {/* Developer Attribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Desenvolvimento</h3>
              <div className="bg-white border-emerald-200 border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white">👨‍💻</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Ellis Wollis</h4>
                    <p className="text-sm text-emerald-600 mb-2">Desenvolvedor Full-Stack</p>
                    <p className="text-xs text-gray-600 mb-3">
                      Mestrando em Nutrição, Esporte e Metabolismo - UNICAMP
                    </p>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-400">📧 elliswollismalta@gmail.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-emerald-200 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-600">
                © 2025 AvaliaNutri. Desenvolvido por Ellis Wollis para UNICAMP.
              </div>
              <div className="flex items-center space-x-6 text-xs text-gray-500">
                <span>Plataforma Educacional</span>
                <span>•</span>
                <span>Dados Brasileiros Reais</span>
                <span>•</span>
                <span>Código Aberto</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
