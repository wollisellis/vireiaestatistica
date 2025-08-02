'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AnatomicalPoint } from '@/data/questionBanks/module3AnthropometricData';

interface HumanBodySVGProps {
  onPointClick: (x: number, y: number) => void;
  highlightedPoint?: AnatomicalPoint;
  feedbackPoint?: { x: number; y: number; correct: boolean };
  showHints?: boolean;
  currentTargetPoint?: AnatomicalPoint;
}

export default function HumanBodySVG({
  onPointClick,
  highlightedPoint,
  feedbackPoint,
  showHints = false,
  currentTargetPoint
}: HumanBodySVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setSvgDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    onPointClick(x, y);
  };

  // Converter coordenadas percentuais para pixels
  const getPixelCoordinates = (point: AnatomicalPoint) => {
    return {
      x: (point.position.x / 100) * svgDimensions.width,
      y: (point.position.y / 100) * svgDimensions.height
    };
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 400 600"
        className="w-full h-auto cursor-crosshair"
        onClick={handleClick}
        style={{ maxHeight: '70vh' }}
      >
        {/* Fundo */}
        <rect width="400" height="600" fill="#f9fafb" />

        {/* Corpo humano simplificado */}
        <g id="human-body">
          {/* Cabeça */}
          <ellipse cx="200" cy="80" rx="40" ry="50" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Pescoço */}
          <rect x="185" y="125" width="30" height="25" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Tronco */}
          <path
            d="M 150 150 L 150 350 Q 150 370 170 370 L 230 370 Q 250 370 250 350 L 250 150 Z"
            fill="#e3f2fd"
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Braço esquerdo */}
          <path
            d="M 150 160 L 100 160 Q 90 160 90 170 L 90 280 Q 90 290 100 290 L 110 290 Q 120 290 120 280 L 120 190 L 150 190"
            fill="#fde4cf"
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Braço direito */}
          <path
            d="M 250 160 L 300 160 Q 310 160 310 170 L 310 280 Q 310 290 300 290 L 290 290 Q 280 290 280 280 L 280 190 L 250 190"
            fill="#fde4cf"
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Mão esquerda */}
          <ellipse cx="100" cy="310" rx="15" ry="20" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Mão direita */}
          <ellipse cx="300" cy="310" rx="15" ry="20" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Perna esquerda */}
          <path
            d="M 170 370 L 170 480 Q 170 490 160 490 L 150 490 Q 140 490 140 480 L 140 370"
            fill="#90a4ae"
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Perna direita */}
          <path
            d="M 230 370 L 230 480 Q 230 490 240 490 L 250 490 Q 260 490 260 480 L 260 370"
            fill="#90a4ae"
            stroke="#333"
            strokeWidth="2"
          />
          
          {/* Panturrilha esquerda (mais detalhada) */}
          <ellipse cx="155" cy="490" rx="25" ry="40" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Panturrilha direita (mais detalhada) */}
          <ellipse cx="245" cy="490" rx="25" ry="40" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Pé esquerdo */}
          <rect x="135" y="525" width="40" height="15" rx="5" fill="#fde4cf" stroke="#333" strokeWidth="2" />
          
          {/* Pé direito */}
          <rect x="225" y="525" width="40" height="15" rx="5" fill="#fde4cf" stroke="#333" strokeWidth="2" />

          {/* Linha da cintura (referência visual) */}
          <line 
            x1="150" y1="270" 
            x2="250" y2="270" 
            stroke="#ccc" 
            strokeWidth="1" 
            strokeDasharray="5,5" 
            opacity="0.5"
          />
          
          {/* Linha do quadril (referência visual) */}
          <line 
            x1="150" y1="350" 
            x2="250" y2="350" 
            stroke="#ccc" 
            strokeWidth="1" 
            strokeDasharray="5,5" 
            opacity="0.5"
          />
        </g>

        {/* Indicador de ponto alvo atual (se houver) */}
        {showHints && currentTargetPoint && (
          <motion.circle
            cx={(currentTargetPoint.position.x / 100) * 400}
            cy={(currentTargetPoint.position.y / 100) * 600}
            r={currentTargetPoint.tolerance}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Feedback visual do clique */}
        {feedbackPoint && (
          <motion.g
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle
              cx={feedbackPoint.x}
              cy={feedbackPoint.y}
              r="20"
              fill={feedbackPoint.correct ? '#10b981' : '#ef4444'}
              opacity="0.5"
            />
            {feedbackPoint.correct ? (
              <text
                x={feedbackPoint.x}
                y={feedbackPoint.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
              >
                ✓
              </text>
            ) : (
              <text
                x={feedbackPoint.x}
                y={feedbackPoint.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="20"
                fontWeight="bold"
              >
                ✗
              </text>
            )}
          </motion.g>
        )}

        {/* Pontos de referência anatômicos (para debug) */}
        {process.env.NODE_ENV === 'development' && highlightedPoint && (
          <circle
            cx={(highlightedPoint.position.x / 100) * 400}
            cy={(highlightedPoint.position.y / 100) * 600}
            r={highlightedPoint.tolerance}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Labels dos pontos anatômicos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Cintura */}
        <div className="absolute text-xs text-gray-500" style={{ left: '10%', top: '44%' }}>
          Cintura
        </div>
        
        {/* Quadril */}
        <div className="absolute text-xs text-gray-500" style={{ left: '10%', top: '57%' }}>
          Quadril
        </div>
        
        {/* Braço */}
        <div className="absolute text-xs text-gray-500" style={{ left: '15%', top: '32%' }}>
          Braço
        </div>
        
        {/* Ombro */}
        <div className="absolute text-xs text-gray-500" style={{ left: '45%', top: '23%' }}>
          Ombros
        </div>
        
        {/* Panturrilha */}
        <div className="absolute text-xs text-gray-500" style={{ right: '25%', top: '80%' }}>
          Panturrilha
        </div>
        
        {/* Pulso */}
        <div className="absolute text-xs text-gray-500" style={{ left: '12%', top: '50%' }}>
          Pulso
        </div>
      </div>
    </div>
  );
}