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
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    // Converter coordenadas do mouse para coordenadas SVG
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    
    onPointClick(svgP.x, svgP.y);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    // Converter coordenadas do mouse para coordenadas SVG
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setMousePosition({ x: svgP.x, y: svgP.y });

    // Detectar qual zona está sendo hover
    let foundZone: string | null = null;
    for (const [zoneId, zone] of Object.entries(anatomicalZones)) {
      const distance = Math.sqrt(
        Math.pow(svgP.x - zone.cx, 2) + Math.pow(svgP.y - zone.cy, 2)
      );
      if (distance <= zone.r) {
        foundZone = zoneId;
        break;
      }
    }
    setHoveredZone(foundZone);
  };

  // Áreas clicáveis para cada ponto anatômico
  const anatomicalZones = {
    waist: { cx: 200, cy: 360, r: 40 },
    hip: { cx: 200, cy: 460, r: 45 },
    arm: { cx: 120, cy: 280, r: 35 },
    calf: { cx: 180, cy: 650, r: 35 },
    shoulder: { cx: 200, cy: 200, r: 50 },
    wrist: { cx: 88, cy: 420, r: 25 }
  };

  return (
    <div className="relative w-full max-w-md mx-auto bg-gray-50 rounded-lg p-4">
      <svg
        ref={svgRef}
        viewBox="0 0 400 800"
        className="w-full h-auto"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredZone(null)}
        style={{ maxHeight: '70vh', cursor: hoveredZone ? 'pointer' : 'crosshair' }}
      >
        <defs>
          {/* Gradientes para profundidade e realismo */}
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#fdbcb4', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#f4a09c', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#e89b92', stopOpacity: 1 }} />
          </linearGradient>

          <radialGradient id="muscleShading">
            <stop offset="0%" style={{ stopColor: '#f4a09c', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#d48b82', stopOpacity: 1 }} />
          </radialGradient>

          {/* Filtro de sombra para profundidade */}
          <filter id="bodyShading" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="2" dy="2" result="offsetblur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offsetblur" operator="in"/>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Corpo humano anatomicamente proporcional */}
        <g id="human-body" filter="url(#bodyShading)">
          
          {/* Cabeça e pescoço */}
          <g id="head-neck">
            {/* Cabeça */}
            <ellipse cx="200" cy="80" rx="40" ry="50" fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
            
            {/* Pescoço */}
            <path d="M 180 120 Q 180 140 185 150 L 215 150 Q 220 140 220 120" 
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
            
            {/* Detalhes faciais simplificados */}
            <circle cx="185" cy="75" r="2" fill="#8b6355" opacity="0.6" />
            <circle cx="215" cy="75" r="2" fill="#8b6355" opacity="0.6" />
            <path d="M 195 85 Q 200 88 205 85" stroke="#d48b82" strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 190 100 Q 200 105 210 100" stroke="#d48b82" strokeWidth="1" fill="none" opacity="0.5" />
          </g>

          {/* Ombros e tórax */}
          <g id="shoulders-chest">
            {/* Ombros */}
            <path d="M 150 150 Q 130 160 120 180 L 140 200 Q 150 190 160 190 L 240 190 Q 250 190 260 200 L 280 180 Q 270 160 250 150 Z"
                  fill="url(#muscleShading)" stroke="#d48b82" strokeWidth="1.5" />
            
            {/* Tórax */}
            <path d="M 160 190 Q 160 250 165 280 L 235 280 Q 240 250 240 190 Z"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1.5" />
            
            {/* Definição peitoral */}
            <path d="M 200 200 L 200 260" stroke="#d48b82" strokeWidth="0.5" opacity="0.4" />
            <path d="M 180 210 Q 190 215 200 210" stroke="#d48b82" strokeWidth="0.5" opacity="0.4" />
            <path d="M 200 210 Q 210 215 220 210" stroke="#d48b82" strokeWidth="0.5" opacity="0.4" />
          </g>

          {/* Braços */}
          <g id="arms">
            {/* Braço esquerdo */}
            <path d="M 120 180 Q 110 220 105 260 L 105 340 Q 105 360 100 380 L 95 400 Q 90 410 88 420"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="2" />
            {/* Mão esquerda */}
            <ellipse cx="88" cy="440" rx="15" ry="20" fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
            
            {/* Braço direito */}
            <path d="M 280 180 Q 290 220 295 260 L 295 340 Q 295 360 300 380 L 305 400 Q 310 410 312 420"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="2" />
            {/* Mão direita */}
            <ellipse cx="312" cy="440" rx="15" ry="20" fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
          </g>

          {/* Abdômen e cintura */}
          <g id="abdomen">
            <path d="M 165 280 Q 165 320 170 360 Q 175 380 180 400 L 220 400 Q 225 380 230 360 Q 235 320 235 280 Z"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1.5" />
            
            {/* Definição abdominal */}
            <line x1="200" y1="300" x2="200" y2="380" stroke="#d48b82" strokeWidth="0.5" opacity="0.3" />
            <path d="M 180 320 Q 190 318 200 320 Q 210 318 220 320" stroke="#d48b82" strokeWidth="0.5" opacity="0.3" />
            <path d="M 180 350 Q 190 348 200 350 Q 210 348 220 350" stroke="#d48b82" strokeWidth="0.5" opacity="0.3" />
          </g>

          {/* Quadril e pélvis */}
          <g id="hip-pelvis">
            <path d="M 180 400 Q 175 420 175 440 Q 175 460 180 480 L 220 480 Q 225 460 225 440 Q 225 420 220 400 Z"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1.5" />
          </g>

          {/* Pernas */}
          <g id="legs">
            {/* Perna esquerda */}
            <path d="M 180 480 Q 175 520 175 560 L 175 620 Q 175 640 180 660 L 180 700 Q 180 720 175 740"
                  fill="url(#muscleShading)" stroke="#d48b82" strokeWidth="2" />
            {/* Pé esquerdo */}
            <path d="M 175 740 L 165 750 L 165 760 L 195 760 L 195 750 L 185 740"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
            
            {/* Perna direita */}
            <path d="M 220 480 Q 225 520 225 560 L 225 620 Q 225 640 220 660 L 220 700 Q 220 720 225 740"
                  fill="url(#muscleShading)" stroke="#d48b82" strokeWidth="2" />
            {/* Pé direito */}
            <path d="M 225 740 L 235 750 L 235 760 L 205 760 L 205 750 L 215 740"
                  fill="url(#skinGradient)" stroke="#d48b82" strokeWidth="1" />
          </g>
        </g>

        {/* Zonas clicáveis invisíveis (para debug e interação) */}
        {process.env.NODE_ENV === 'development' && Object.entries(anatomicalZones).map(([id, zone]) => (
          <circle
            key={id}
            cx={zone.cx}
            cy={zone.cy}
            r={zone.r}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        ))}

        {/* Indicador visual do ponto alvo atual */}
        {currentTargetPoint && showHints && anatomicalZones[currentTargetPoint.id as keyof typeof anatomicalZones] && (
          <motion.circle
            cx={anatomicalZones[currentTargetPoint.id as keyof typeof anatomicalZones].cx}
            cy={anatomicalZones[currentTargetPoint.id as keyof typeof anatomicalZones].cy}
            r={anatomicalZones[currentTargetPoint.id as keyof typeof anatomicalZones].r + 10}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray="10,5"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Feedback visual do clique */}
        {feedbackPoint && (
          <motion.g
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <circle
              cx={feedbackPoint.x}
              cy={feedbackPoint.y}
              r="25"
              fill={feedbackPoint.correct ? '#10b981' : '#ef4444'}
              opacity="0.6"
            />
            {feedbackPoint.correct ? (
              <path
                d="M -10 0 L -3 7 L 10 -7"
                transform={`translate(${feedbackPoint.x}, ${feedbackPoint.y})`}
                stroke="white"
                strokeWidth="3"
                fill="none"
              />
            ) : (
              <g transform={`translate(${feedbackPoint.x}, ${feedbackPoint.y})`}>
                <line x1="-8" y1="-8" x2="8" y2="8" stroke="white" strokeWidth="3" />
                <line x1="8" y1="-8" x2="-8" y2="8" stroke="white" strokeWidth="3" />
              </g>
            )}
          </motion.g>
        )}

        {/* Áreas destacadas ao passar o mouse */}
        {hoveredZone && anatomicalZones[hoveredZone as keyof typeof anatomicalZones] && currentTargetPoint && (
          <motion.g>
            {/* Área de destaque */}
            <motion.circle
              cx={anatomicalZones[hoveredZone as keyof typeof anatomicalZones].cx}
              cy={anatomicalZones[hoveredZone as keyof typeof anatomicalZones].cy}
              r={anatomicalZones[hoveredZone as keyof typeof anatomicalZones].r}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.6)"
              strokeWidth="3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: [0.95, 1.05, 0.95],
                opacity: 1
              }}
              transition={{ 
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.2 }
              }}
            />
            {/* Ponto central */}
            <motion.circle
              cx={anatomicalZones[hoveredZone as keyof typeof anatomicalZones].cx}
              cy={anatomicalZones[hoveredZone as keyof typeof anatomicalZones].cy}
              r="5"
              fill="#3b82f6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          </motion.g>
        )}
      </svg>

      {/* Tooltip do ponto anatômico em hover */}
      {hoveredZone && currentTargetPoint && (
        <motion.div
          className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-lg pointer-events-none"
          style={{
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {(() => {
            const zoneNames: Record<string, string> = {
              waist: 'Cintura',
              hip: 'Quadril',
              arm: 'Braço',
              calf: 'Panturrilha',
              shoulder: 'Ombro',
              wrist: 'Pulso'
            };
            return zoneNames[hoveredZone] || hoveredZone;
          })()}
        </motion.div>
      )}

      {/* Labels dos pontos anatômicos */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
          <span>Cintura</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-200 rounded-full"></div>
          <span>Quadril</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-purple-200 rounded-full"></div>
          <span>Braço</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-200 rounded-full"></div>
          <span>Panturrilha</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-200 rounded-full"></div>
          <span>Ombro</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-indigo-200 rounded-full"></div>
          <span>Pulso</span>
        </div>
      </div>
    </div>
  );
}