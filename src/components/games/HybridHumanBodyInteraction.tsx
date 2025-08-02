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

  // Zonas anatômicas para cliques e drops
  const anatomicalZones = {
    waist: { cx: 200, cy: 340, r: 40, label: 'Cintura' },
    hip: { cx: 200, cy: 440, r: 45, label: 'Quadril' },
    arm: { cx: 135, cy: 280, r: 35, label: 'Braço' },
    calf: { cx: 180, cy: 650, r: 35, label: 'Panturrilha' },
    shoulder: { cx: 200, cy: 175, r: 50, label: 'Ombro' },
    wrist: { cx: 88, cy: 420, r: 25, label: 'Pulso' }
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
    <g id="professional-body">
      {/* Cabeça */}
      <ellipse cx="200" cy="80" rx="35" ry="45" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="2" />
      
      {/* Pescoço */}
      <ellipse cx="200" cy="130" rx="20" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      
      {/* Ombros */}
      <ellipse cx="200" cy="175" rx="60" ry="25" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="2" />
      
      {/* Tórax */}
      <ellipse cx="200" cy="230" rx="45" ry="50" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="2" />
      
      {/* Braço esquerdo */}
      <ellipse cx="135" cy="220" rx="20" ry="35" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="115" cy="280" rx="17" ry="30" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="100" cy="340" rx="15" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="88" cy="390" rx="18" ry="35" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      
      {/* Braço direito */}
      <ellipse cx="265" cy="220" rx="20" ry="35" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="285" cy="280" rx="17" ry="30" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="300" cy="340" rx="15" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="312" cy="390" rx="18" ry="35" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      
      {/* Abdômen */}
      <ellipse cx="200" cy="310" rx="40" ry="35" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="2" />
      
      {/* Cintura */}
      <ellipse cx="200" cy="340" rx="35" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="2" />
      
      {/* Quadril */}
      <ellipse cx="200" cy="410" rx="45" ry="35" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="2" />
      
      {/* Perna esquerda */}
      <ellipse cx="175" cy="480" rx="25" ry="40" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="2" />
      <ellipse cx="175" cy="550" rx="22" ry="35" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="175" cy="620" rx="20" ry="30" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="175" cy="680" rx="18" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="175" cy="720" rx="25" ry="15" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      
      {/* Perna direita */}
      <ellipse cx="225" cy="480" rx="25" ry="40" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="2" />
      <ellipse cx="225" cy="550" rx="22" ry="35" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="225" cy="620" rx="20" ry="30" 
               fill="#f4a09c" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="225" cy="680" rx="18" ry="25" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
      <ellipse cx="225" cy="720" rx="25" ry="15" 
               fill="#fdbcb4" stroke="#d48b82" strokeWidth="1.5" />
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