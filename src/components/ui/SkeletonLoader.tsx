'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function SkeletonLoader({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animate = true
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-xl'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={skeletonClasses}
        style={style}
        animate={{
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    );
  }

  return <div className={skeletonClasses} style={style} />;
}

// Skeleton específico para módulos
export function ModuleSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SkeletonLoader variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="60%" height={20} />
          <SkeletonLoader variant="text" width="40%" height={16} />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="30%" height={14} />
        <SkeletonLoader variant="rectangular" width="100%" height={8} />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <SkeletonLoader variant="text" width="50%" height={16} />
          <SkeletonLoader variant="text" width="70%" height={12} />
        </div>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <SkeletonLoader variant="text" width="50%" height={16} />
          <SkeletonLoader variant="text" width="70%" height={12} />
        </div>
      </div>
      
      {/* Button */}
      <SkeletonLoader variant="rectangular" width="100%" height={40} />
    </div>
  );
}

// Skeleton para ranking
export function RankingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SkeletonLoader variant="circular" width={20} height={20} />
          <SkeletonLoader variant="text" width={120} height={18} />
        </div>
        <SkeletonLoader variant="circular" width={24} height={24} />
      </div>
      
      {/* Ranking items */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <SkeletonLoader variant="circular" width={32} height={32} />
            <div className="flex-1 space-y-1">
              <SkeletonLoader variant="text" width="60%" height={16} />
              <SkeletonLoader variant="text" width="40%" height={12} />
            </div>
            <SkeletonLoader variant="text" width={40} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para informações da turma
export function ClassInfoSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <SkeletonLoader variant="circular" width={20} height={20} />
        <SkeletonLoader variant="text" width={140} height={18} />
      </div>
      
      {/* Info items */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="text" width={80} height={14} />
          <SkeletonLoader variant="text" width={100} height={14} />
        </div>
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="text" width={70} height={14} />
          <SkeletonLoader variant="text" width={60} height={14} />
        </div>
        <div className="flex justify-between items-center">
          <SkeletonLoader variant="text" width={90} height={14} />
          <SkeletonLoader variant="text" width={40} height={14} />
        </div>
      </div>
    </div>
  );
}

// Skeleton para dashboard pessoal
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <SkeletonLoader variant="text" width={200} height={24} className="mx-auto" />
        <SkeletonLoader variant="text" width={300} height={16} className="mx-auto" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 space-y-3">
            <div className="flex items-center space-x-3">
              <SkeletonLoader variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-1">
                <SkeletonLoader variant="text" width="70%" height={16} />
                <SkeletonLoader variant="text" width="50%" height={12} />
              </div>
            </div>
            <SkeletonLoader variant="text" width={60} height={20} />
          </div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <SkeletonLoader variant="text" width={180} height={20} />
        <SkeletonLoader variant="rectangular" width="100%" height={200} />
      </div>
    </div>
  );
}
