'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUpDown
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

interface TableAction {
  label: string
  icon: React.ComponentType<any>
  onClick: (row: any) => void
  variant?: 'default' | 'outline' | 'ghost'
  color?: string
}

interface DynamicTableProps {
  title: string
  columns: TableColumn[]
  data: any[]
  actions?: TableAction[]
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  pagination?: boolean
  pageSize?: number
  selectable?: boolean
  onSelectionChange?: (selectedRows: any[]) => void
}

export function DynamicTable({
  title,
  columns,
  data,
  actions = [],
  searchable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  selectable = false,
  onSelectionChange
}: DynamicTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(col =>
          String(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    return filtered
  }, [data, searchTerm, columnFilters, columns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const handleSelectRow = (row: any) => {
    const newSelection = selectedRows.includes(row)
      ? selectedRows.filter(r => r !== row)
      : [...selectedRows, row]
    
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleSelectAll = () => {
    const newSelection = selectedRows.length === paginatedData.length ? [] : paginatedData
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const exportData = () => {
    const csv = [
      columns.map(col => col.label).join(','),
      ...sortedData.map(row =>
        columns.map(col => `"${row[col.key]}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center space-x-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
            {filterable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            )}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.filter(col => col.filterable !== false).map(column => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.label}
                  </label>
                  <input
                    type="text"
                    placeholder={`Filtrar por ${column.label.toLowerCase()}`}
                    value={columnFilters[column.key] || ''}
                    onChange={(e) => setColumnFilters(prev => ({
                      ...prev,
                      [column.key]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {selectable && (
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map(column => (
                  <th
                    key={column.key}
                    className={`text-left py-3 px-4 font-medium text-gray-900 ${
                      column.sortable !== false ? 'cursor-pointer hover:bg-gray-50' : ''
                    }`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable !== false && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable !== false && (
                        <div className="flex flex-col">
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-4 h-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-blue-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    selectedRows.includes(row) ? 'bg-blue-50' : ''
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {selectable && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row)}
                        onChange={() => handleSelectRow(row)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key} className="py-3 px-4 text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon
                          return (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={() => action.onClick(row)}
                              className={action.color ? `text-${action.color}` : ''}
                            >
                              <Icon className="w-4 h-4" />
                            </Button>
                          )
                        })}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Predefined table configurations for common use cases
export const ProfessorTableConfigs = {
  studentProgress: {
    title: 'Progresso dos Alunos',
    columns: [
      { key: 'name', label: 'Nome', sortable: true },
      { key: 'anonymousId', label: 'ID Anônimo', sortable: true },
      { key: 'totalScore', label: 'Pontuação Total', sortable: true },
      { key: 'averageScore', label: 'Média (%)', sortable: true },
      { key: 'modulesCompleted', label: 'Módulos', sortable: true },
      { key: 'lastActivity', label: 'Última Atividade', sortable: true }
    ],
    actions: [
      { label: 'Visualizar', icon: Eye, onClick: (row: any) => console.log('View', row) },
      { label: 'Editar', icon: Edit, onClick: (row: any) => console.log('Edit', row) }
    ]
  },

  questionBank: {
    title: 'Banco de Questões',
    columns: [
      { key: 'question', label: 'Questão', sortable: true, width: '40%' },
      { key: 'type', label: 'Tipo', sortable: true },
      { key: 'difficulty', label: 'Dificuldade', sortable: true },
      { key: 'moduleId', label: 'Módulo', sortable: true },
      { key: 'correctAnswers', label: 'Acertos', sortable: true },
      { key: 'totalAttempts', label: 'Tentativas', sortable: true }
    ],
    actions: [
      { label: 'Editar', icon: Edit, onClick: (row: any) => console.log('Edit', row) },
      { label: 'Visualizar', icon: Eye, onClick: (row: any) => console.log('View', row) },
      { label: 'Excluir', icon: Trash2, onClick: (row: any) => console.log('Delete', row), color: 'red-600' }
    ]
  }
}
