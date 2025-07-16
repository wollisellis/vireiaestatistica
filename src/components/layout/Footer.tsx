'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Code, 
  GraduationCap, 
  Github, 
  Linkedin, 
  Mail,
  Scale,
  BookOpen,
  Users,
  Award
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Platform Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
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
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>NT600</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>UNICAMP</span>
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                <span>2025</span>
              </div>
            </div>
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
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Datasets Brasileiros Reais
              </li>
            </ul>
          </div>

          {/* Developer Attribution */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Desenvolvimento</h3>
            <Card className="bg-white border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">AvaliaNutri</h4>
                    <p className="text-sm text-emerald-600 mb-2">Plataforma Educacional</p>
                    <p className="text-xs text-gray-600 mb-3">
                      Sistema de Avaliação Nutricional
                    </p>
                    <div className="flex items-center space-x-3">
                      <a
                        href="mailto:e165905@dac.unicamp.br"
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <a
                        href="https://github.com/wollisellis/"
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="GitHub"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href="https://www.linkedin.com/in/%C3%A9llis-wollis/"
                        className="text-gray-400 hover:text-emerald-600 transition-colors"
                        title="LinkedIn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex items-center">
                <Heart className="w-3 h-3 mr-1 text-red-500" />
                Desenvolvido com dedicação para educação nutricional
              </p>
              <p className="flex items-center">
                <GraduationCap className="w-3 h-3 mr-1 text-blue-500" />
                Proposta educacional inovadora para NT600
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-emerald-200 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              © {currentYear} AvaliaNutri. Desenvolvido por Ellis Wollis para UNICAMP.
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
      </div>
    </footer>
  )
}

// About Modal Component for detailed credits
export function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sobre o AvaliaNutri</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Sobre o Projeto</h3>
              <p className="text-gray-700 leading-relaxed">
                O AvaliaNutri é uma plataforma educacional inovadora para o ensino de 
                avaliação nutricional. Combina gamificação educacional com dados reais 
                brasileiros, oferecendo uma experiência de aprendizado única e culturalmente relevante.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tecnologias Utilizadas</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Frontend:</strong> Next.js, React, TypeScript
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Styling:</strong> Tailwind CSS, Framer Motion
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Charts:</strong> Recharts, D3.js
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <strong>Data:</strong> Datasets brasileiros reais
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contato</h3>
              <div className="flex items-center space-x-4">
                <a
                  href="mailto:e165905@dac.unicamp.br"
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Mail className="w-4 h-4" />
                  <span>e165905@dac.unicamp.br</span>
                </a>
                <a
                  href="https://github.com/wollisellis/"
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/%C3%A9llis-wollis/"
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
