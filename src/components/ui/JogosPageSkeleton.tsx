'use client';

import React from 'react';
import { ModuleSkeleton, RankingSkeleton, ClassInfoSkeleton, DashboardSkeleton, SkeletonLoader } from './SkeletonLoader';

export function JogosPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <SkeletonLoader variant="circular" width={40} height={40} />
              <SkeletonLoader variant="text" width={120} height={20} />
            </div>
            
            {/* User info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SkeletonLoader variant="circular" width={32} height={32} />
                <SkeletonLoader variant="text" width={80} height={16} />
              </div>
              <SkeletonLoader variant="rectangular" width={80} height={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main content area */}
          <div className="xl:col-span-3 space-y-8">
            {/* Welcome section */}
            <div className="text-center space-y-4">
              <SkeletonLoader variant="text" width={300} height={32} className="mx-auto" />
              <SkeletonLoader variant="text" width={400} height={16} className="mx-auto" />
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center space-x-2">
              <SkeletonLoader variant="circular" width={16} height={16} />
              <SkeletonLoader variant="text" width={60} height={14} />
              <SkeletonLoader variant="circular" width={16} height={16} />
              <SkeletonLoader variant="text" width={80} height={14} />
            </div>

            {/* Modules grid */}
            <div className="space-y-6">
              <SkeletonLoader variant="text" width={200} height={24} />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <ModuleSkeleton />
                <ModuleSkeleton />
                <ModuleSkeleton />
                <ModuleSkeleton />
              </div>
            </div>

            {/* Personal dashboard */}
            <div className="mt-12">
              <DashboardSkeleton />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Class info */}
            <ClassInfoSkeleton />
            
            {/* Ranking */}
            <RankingSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton mais simples para estados de transição rápida
export function JogosPageMinimalSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <SkeletonLoader variant="circular" width={64} height={64} />
        </div>
        <SkeletonLoader variant="text" width={200} height={20} className="mx-auto" />
        <SkeletonLoader variant="text" width={150} height={16} className="mx-auto" />
      </div>
    </div>
  );
}
