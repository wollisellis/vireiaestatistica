'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SimpleRankingPanel } from './SimpleRankingPanel';
import { Badge } from '@/components/ui/Badge';

interface MobileCollapsibleRankingProps {
  currentUserId?: string;
  limit?: number;
  className?: string;
  defaultExpanded?: boolean;
  studentCount?: number;
}

export function MobileCollapsibleRanking({
  currentUserId,
  limit = 8,
  className = '',
  defaultExpanded = false,
  studentCount
}: MobileCollapsibleRankingProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`lg:hidden ${className}`}>
      {/* Botão de Toggle do Ranking */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-yellow-50 border-2 border-yellow-400 hover:border-yellow-500 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl mb-4"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              🏆 Ranking Geral
              {studentCount && studentCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  {studentCount} estudantes
                </Badge>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isExpanded ? 'Toque para ocultar' : 'Toque para ver o ranking'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </Button>

      {/* Ranking Expansível */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <SimpleRankingPanel
              currentUserId={currentUserId}
              limit={limit}
              compact={true}
              className="mb-4"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileCollapsibleRanking;