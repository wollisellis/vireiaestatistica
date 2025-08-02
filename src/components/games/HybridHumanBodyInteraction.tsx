'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  MousePointer, 
  Move, 
  Target,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { AnatomicalPoint } from '@/data/questionBanks/module3AnthropometricData';

interface HybridHumanBodyInteractionProps {
  onPointClick: (x: number, y: number) => void;
  onDragComplete: (pointId: string, targetZone: string) => void;
  highlightedPoint?: AnatomicalPoint;
  feedbackPoint?: { x: number; y: number; correct: boolean };
  showHints?: boolean;
  currentTargetPoint?: AnatomicalPoint;
  availablePoints: AnatomicalPoint[];
  completedPoints: string[];
}

interface DroppableItem {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
}

export default function HybridHumanBodyInteraction({
  onPointClick,
  onDragComplete,
  highlightedPoint,
  feedbackPoint,
  showHints = false,
  currentTargetPoint,
  availablePoints,
  completedPoints
}: HybridHumanBodyInteractionProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [interactionMode, setInteractionMode] = useState<'click' | 'drag'>('click');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [draggedOverZone, setDraggedOverZone] = useState<string | null>(null);

  // Zonas anatômicas para cliques e drops - Ajustadas para figura realista
  const anatomicalZones = {
    waist: { cx: 200, cy: 247, r: 45, label: 'Cintura' },
    hip: { cx: 200, cy: 340, r: 50, label: 'Quadril' },
    arm: { cx: 115, cy: 280, r: 40, label: 'Braço' },
    calf: { cx: 175, cy: 600, r: 38, label: 'Panturrilha' },
    shoulder: { cx: 200, cy: 147, r: 55, label: 'Ombro' },
    wrist: { cx: 88, cy: 380, r: 30, label: 'Pulso' }
  };

  // Itens arrastáveis
  const draggableItems: DroppableItem[] = availablePoints
    .filter(point => point && point.id) // Filtrar pontos válidos
    .map(point => ({
      id: point.id,
      name: point.name,
      icon: getIconForPoint(point.id),
      completed: completedPoints.includes(point.id)
    }));

  function getIconForPoint(pointId: string): string {
    const icons: Record<string, string> = {
      waist: '📏',
      hip: '🦴', 
      arm: '💪',
      calf: '🦵',
      shoulder: '👐',
      wrist: '✋'
    };
    return icons[pointId] || '📍';
  }

  const handleSVGClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (interactionMode !== 'click' || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    onPointClick(svgP.x, svgP.y);
  }, [interactionMode, onPointClick]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (interactionMode !== 'click' || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // Detectar zona de hover
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
  }, [interactionMode]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const sourceId = result.draggableId;
    const targetZone = result.destination.droppableId;
    
    onDragComplete(sourceId, targetZone);
  }, [onDragComplete]);

  const renderProfessionalBody = () => (
    <g id="medical-grade-body">
      {/* Gradientes para realismo */}
      <defs>
        <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#f4c2a1', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#f7d4b3', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#f4c2a1', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="limbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#e8b394', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#f4c2a1', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#e8b394', stopOpacity: 1}} />
        </linearGradient>
      </defs>

      {/* Cabeça - Proporção anatômica correta */}
      <path d="M 165 25 C 165 15, 180 5, 200 5 C 220 5, 235 15, 235 25 
               C 235 35, 235 45, 235 55 C 235 75, 220 85, 200 85 
               C 180 85, 165 75, 165 55 C 165 45, 165 35, 165 25 Z" 
            fill="url(#bodyGradient)" stroke="#d4a574" strokeWidth="1.5" />
      
      {/* Pescoço */}
      <path d="M 185 85 L 185 115 L 215 115 L 215 85 Z" 
            fill="url(#bodyGradient)" stroke="#d4a574" strokeWidth="1" />
      
      {/* Tórax - Formato anatômico realista */}
      <path d="M 140 115 C 140 115, 160 120, 200 120 C 240 120, 260 115, 260 115
               L 255 180 C 255 190, 250 200, 245 210 L 155 210 
               C 150 200, 145 190, 145 180 L 140 115 Z" 
            fill="url(#bodyGradient)" stroke="#d4a574" strokeWidth="2" />
      
      {/* Braço esquerdo - Anatomicamente correto */}
      <path d="M 140 140 C 130 140, 120 145, 115 155 
               L 110 200 C 108 215, 105 230, 102 245
               L 98 280 C 95 295, 92 310, 88 325
               L 85 360 C 83 375, 80 390, 78 405
               L 75 425 C 73 430, 75 435, 80 435
               L 95 435 C 100 435, 102 430, 100 425
               L 103 405 C 105 390, 108 375, 110 360
               L 113 325 C 116 310, 119 295, 122 280
               L 126 245 C 129 230, 132 215, 134 200
               L 139 155 C 141 145, 140 140, 140 140 Z" 
            fill="url(#limbGradient)" stroke="#d4a574" strokeWidth="1.5" />
      
      {/* Braço direito - Simétrico */}
      <path d="M 260 140 C 270 140, 280 145, 285 155 
               L 290 200 C 292 215, 295 230, 298 245
               L 302 280 C 305 295, 308 310, 312 325
               L 315 360 C 317 375, 320 390, 322 405
               L 325 425 C 327 430, 325 435, 320 435
               L 305 435 C 300 435, 298 430, 300 425
               L 297 405 C 295 390, 292 375, 290 360
               L 287 325 C 284 310, 281 295, 278 280
               L 274 245 C 271 230, 268 215, 266 200
               L 261 155 C 259 145, 260 140, 260 140 Z" 
            fill="url(#limbGradient)" stroke="#d4a574" strokeWidth="1.5" />
      
      {/* Cintura - Região de medida */}
      <path d="M 155 210 C 160 220, 175 225, 200 225 
               C 225 225, 240 220, 245 210
               L 250 260 C 250 270, 245 280, 240 285
               L 160 285 C 155 280, 150 270, 150 260 L 155 210 Z" 
            fill="url(#bodyGradient)" stroke="#d4a574" strokeWidth="2" />
      
      {/* Quadril - Região de medida */}
      <path d="M 150 285 C 145 295, 140 310, 140 325
               C 140 340, 145 355, 150 370
               C 155 385, 165 395, 175 400
               L 225 400 C 235 395, 245 385, 250 370
               C 255 355, 260 340, 260 325
               C 260 310, 255 295, 250 285 L 150 285 Z" 
            fill="url(#bodyGradient)" stroke="#d4a574" strokeWidth="2" />
      
      {/* Perna esquerda - Proporções realistas */}
      <path d="M 175 400 C 170 410, 165 425, 162 440
               L 158 480 C 155 520, 152 560, 150 600
               L 148 640 C 146 680, 145 720, 145 760
               C 145 770, 150 775, 160 775
               L 190 775 C 200 775, 205 770, 205 760
               C 205 720, 204 680, 202 640
               L 200 600 C 198 560, 195 520, 192 480
               L 188 440 C 185 425, 180 410, 175 400 Z" 
            fill="url(#limbGradient)" stroke="#d4a574" strokeWidth="1.5" />
      
      {/* Perna direita - Simétrica */}
      <path d="M 225 400 C 230 410, 235 425, 238 440
               L 242 480 C 245 520, 248 560, 250 600
               L 252 640 C 254 680, 255 720, 255 760
               C 255 770, 250 775, 240 775
               L 210 775 C 200 775, 195 770, 195 760
               C 195 720, 196 680, 198 640
               L 200 600 C 202 560, 205 520, 208 480
               L 212 440 C 215 425, 220 410, 225 400 Z" 
            fill="url(#limbGradient)" stroke="#d4a574" strokeWidth="1.5" />
      
      {/* Detalhes anatômicos sutis */}
      <circle cx="185" cy="145" r="3" fill="#d4a574" opacity="0.6" />
      <circle cx="215" cy="145" r="3" fill="#d4a574" opacity="0.6" />
      <line x1="180" y1="170" x2="220" y2="170" stroke="#d4a574" strokeWidth="1" opacity="0.4" />
    </g>
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controles de Modo */}
      <div className="lg:col-span-3">
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={() => setInteractionMode('click')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              interactionMode === 'click' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <MousePointer className="w-4 h-4" />
            <span>Clique Direto</span>
          </button>
          <button
            onClick={() => setInteractionMode('drag')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              interactionMode === 'drag' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Move className="w-4 h-4" />
            <span>Arrastar e Soltar</span>
          </button>
        </div>
      </div>

      {/* Lista de Itens Arrastáveis */}
      {interactionMode === 'drag' && (
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Circunferências
          </h3>
          <Droppable droppableId="available-points">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {draggableItems.filter(item => !item.completed).map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                            snapshot.isDragging
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-300 bg-white hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

          {/* Itens Completados */}
          {completedPoints.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-green-600 mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Concluídos
              </h4>
              <div className="space-y-2">
                {draggableItems.filter(item => item.completed).map(item => (
                  <div key={item.id} className="p-2 rounded bg-green-50 border border-green-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium text-green-800">{item.name}</span>
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SVG do Corpo Humano */}
      <div className={`${interactionMode === 'drag' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
        <div className="relative w-full max-w-md mx-auto bg-gray-50 rounded-lg p-4">
          <svg
            ref={svgRef}
            viewBox="0 0 400 800"
            className="w-full h-auto"
            onClick={handleSVGClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredZone(null)}
            style={{ 
              maxHeight: '70vh', 
              cursor: interactionMode === 'click' ? (hoveredZone ? 'pointer' : 'crosshair') : 'default'
            }}
          >
            {/* Gradientes */}
            <defs>
              <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#fdbcb4', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f4a09c', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Corpo Humano */}
            {renderProfessionalBody()}

            {/* Zonas de Drop (modo drag) */}
            {interactionMode === 'drag' && Object.entries(anatomicalZones).map(([zoneId, zone]) => (
              <Droppable key={zoneId} droppableId={zoneId}>
                {(provided, snapshot) => (
                  <g ref={provided.innerRef} {...provided.droppableProps}>
                    <circle
                      cx={zone.cx}
                      cy={zone.cy}
                      r={zone.r}
                      fill={snapshot.isDraggingOver ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'}
                      stroke={snapshot.isDraggingOver ? '#3b82f6' : '#60a5fa'}
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <text
                      x={zone.cx}
                      y={zone.cy + 5}
                      textAnchor="middle"
                      className="text-xs fill-blue-700 font-medium"
                    >
                      {zone.label}
                    </text>
                    {provided.placeholder}
                  </g>
                )}
              </Droppable>
            ))}

            {/* Zona de hover (modo click) */}
            {interactionMode === 'click' && hoveredZone && anatomicalZones[hoveredZone as keyof typeof anatomicalZones] && currentTargetPoint && (
              <motion.g>
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
          </svg>

          {/* Tooltip do modo click */}
          {interactionMode === 'click' && hoveredZone && currentTargetPoint && (
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
              {anatomicalZones[hoveredZone as keyof typeof anatomicalZones].label}
            </motion.div>
          )}
        </div>

        {/* Instruções */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                {interactionMode === 'click' 
                  ? 'Clique diretamente na área do corpo correspondente à circunferência solicitada.'
                  : 'Arraste o nome da circunferência até a área correspondente no corpo humano.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DragDropContext>
  );
}