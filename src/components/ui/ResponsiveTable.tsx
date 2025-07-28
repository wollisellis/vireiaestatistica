'use client';

import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  mobileRender?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  priority?: number; // 1 = highest priority (always show), higher numbers = lower priority
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  mobileCardClassName?: string;
  emptyMessage?: string;
  loading?: boolean;
  // Mobile specific props
  showMobileActions?: boolean;
  mobileActions?: (item: T) => React.ReactNode;
  // Tablet specific - how many columns to show
  tabletVisibleColumns?: number;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  className,
  mobileCardClassName,
  emptyMessage = 'Nenhum item encontrado',
  loading = false,
  showMobileActions = true,
  mobileActions,
  tabletVisibleColumns = 4,
}: ResponsiveTableProps<T>) {
  const { isMobile, isTablet } = useResponsive();

  // Sort columns by priority for responsive display
  const sortedColumns = [...columns].sort((a, b) => (a.priority || 999) - (b.priority || 999));
  
  // Determine which columns to show based on screen size
  const visibleColumns = React.useMemo(() => {
    if (isMobile) {
      return sortedColumns.filter(col => !col.hideOnMobile);
    }
    if (isTablet) {
      return sortedColumns.slice(0, tabletVisibleColumns);
    }
    return columns; // Desktop shows all columns in original order
  }, [isMobile, isTablet, sortedColumns, columns, tabletVisibleColumns]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((item) => {
          const key = keyExtractor(item);
          return (
            <div
              key={key}
              className={cn(
                'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden',
                onRowClick && 'cursor-pointer hover:shadow-md transition-shadow',
                mobileCardClassName
              )}
              onClick={() => onRowClick?.(item)}
            >
              <div className="p-4 space-y-3">
                {visibleColumns.map((column) => {
                  const content = column.mobileRender 
                    ? column.mobileRender(item)
                    : column.render(item);
                  
                  if (!content) return null;

                  return (
                    <div key={column.key} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-600">
                        {column.header}:
                      </span>
                      <div className="text-sm text-gray-900 text-right ml-2">
                        {content}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {showMobileActions && (onRowClick || mobileActions) && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  {mobileActions ? (
                    mobileActions(item)
                  ) : (
                    <div className="flex items-center justify-end text-sm text-indigo-600">
                      Ver detalhes
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop/Tablet Table View
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {visibleColumns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'text-left py-3 px-4 font-medium text-gray-700',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => {
            const key = keyExtractor(item);
            return (
              <tr
                key={key}
                className={cn(
                  'border-b hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('py-4 px-4', column.className)}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Utility component for responsive table cell content
export function ResponsiveTableCell({
  desktop,
  mobile,
  className,
}: {
  desktop: React.ReactNode;
  mobile?: React.ReactNode;
  className?: string;
}) {
  const { isMobile } = useResponsive();
  
  return (
    <div className={className}>
      {isMobile && mobile !== undefined ? mobile : desktop}
    </div>
  );
}

// Utility component for action buttons in tables
export function ResponsiveTableActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isMobile } = useResponsive();
  
  return (
    <div
      className={cn(
        'flex items-center',
        isMobile ? 'space-x-2 justify-end' : 'space-x-2',
        className
      )}
    >
      {children}
    </div>
  );
}