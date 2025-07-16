'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Code, User, Book, ChevronDown, ChevronUp } from 'lucide-react';

export default function SystemInfo() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: 'system',
      title: 'Sobre o Sistema',
      icon: <Info className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>
            O <strong>AvaliaNutri</strong> é uma plataforma educacional interativa desenvolvida para o ensino de avaliação nutricional, 
            baseada em dados reais da população brasileira e nas mais recentes diretrizes científicas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Recursos Principais</h4>
              <ul className="text-sm space-y-1">
                <li>• Módulos interativos baseados em casos reais</li>
                <li>• Sistema de ranking e progresso</li>
                <li>• Dados brasileiros atualizados (POF 2024, SISVAN)</li>
                <li>• Exercícios práticos de drag-and-drop</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Tecnologias</h4>
              <ul className="text-sm space-y-1">
                <li>• Next.js 14 com TypeScript</li>
                <li>• Firebase (Firestore & Auth)</li>
                <li>• Framer Motion para animações</li>
                <li>• Tailwind CSS para estilização</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'developer',
      title: 'Desenvolvedor',
      icon: <Code className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Ellis</h4>
              <p className="text-gray-600">Desenvolvedor Full Stack</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Sobre o Desenvolvimento</h4>
            <p className="text-sm">
              Esta plataforma foi desenvolvida com foco na experiência do usuário e na aplicação prática dos conceitos de 
              avaliação nutricional, utilizando metodologias ágeis e as melhores práticas de desenvolvimento web moderno.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'discipline',
      title: 'Disciplina',
      icon: <Book className="w-5 h-5" />,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Avaliação Nutricional</h4>
            <p className="text-sm mb-3">
              Disciplina focada no ensino dos métodos e técnicas para avaliação do estado nutricional de indivíduos e populações.
            </p>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Instituição:</span> UNICAMP
              </div>
              <div>
                <span className="font-medium">Área:</span> Ciências da Saúde - Nutrição
              </div>
              <div>
                <span className="font-medium">Modalidade:</span> Presencial com suporte digital
              </div>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Objetivos de Aprendizagem</h4>
            <ul className="text-sm space-y-1">
              <li>• Compreender os indicadores antropométricos</li>
              <li>• Aplicar métodos de avaliação nutricional</li>
              <li>• Interpretar dados populacionais brasileiros</li>
              <li>• Desenvolver habilidades práticas de diagnóstico</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Info className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Informações do Sistema</h2>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="text-blue-600">{section.icon}</div>
                <span className="font-medium text-gray-800">{section.title}</span>
              </div>
              {openSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            <motion.div
              initial={false}
              animate={{
                height: openSection === section.id ? 'auto' : 0,
                opacity: openSection === section.id ? 1 : 0
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4">
                {section.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}