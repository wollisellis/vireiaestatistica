'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Download, 
  Upload, 
  Calculator, 
  Save, 
  RotateCcw, 
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

// Nutritional data interfaces
interface NutritionalData {
  id: string
  patientName: string
  age: number
  gender: 'M' | 'F'
  weight: number
  height: number
  bmi?: number
  weightPercentile?: number
  heightPercentile?: number
  bmiPercentile?: number
  nutritionalStatus?: string
  recommendations?: string
  lastUpdated: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface NutritionalDataGridProps {
  initialData?: NutritionalData[]
  onDataChange?: (data: NutritionalData[]) => void
  onCalculationComplete?: (results: any) => void
  editable?: boolean
  showCalculations?: boolean
  showValidation?: boolean
}

// Mock Brazilian nutritional data
const generateMockData = (): NutritionalData[] => {
  const names = [
    'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Carla Souza',
    'Lucas Lima', 'Fernanda Alves', 'Rafael Pereira', 'Juliana Rocha', 'Gabriel Martins'
  ]
  
  return names.map((name, index) => ({
    id: `patient-${index + 1}`,
    patientName: name,
    age: Math.floor(Math.random() * 60) + 6, // 6-66 months
    gender: Math.random() > 0.5 ? 'M' : 'F',
    weight: Math.round((Math.random() * 15 + 8) * 10) / 10, // 8-23 kg
    height: Math.round((Math.random() * 40 + 60) * 10) / 10, // 60-100 cm
    lastUpdated: new Date().toISOString()
  }))
}

export function NutritionalDataGrid({
  initialData,
  onDataChange,
  onCalculationComplete,
  editable = true,
  showCalculations = true,
  showValidation = true
}: NutritionalDataGridProps) {
  const [data, setData] = useState<NutritionalData[]>(initialData || generateMockData())
  const [isAGGridLoaded, setIsAGGridLoaded] = useState(false)
  const [gridApi, setGridApi] = useState<any>(null)
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'calculating' | 'complete'>('idle')

  // Dynamic import of AG Grid to avoid SSR issues
  useEffect(() => {
    const loadAGGrid = async () => {
      try {
        const { AgGridReact } = await import('ag-grid-react')
        const agGrid = await import('ag-grid-community')
        
        if (typeof window !== 'undefined') {
          setIsAGGridLoaded(true)
        }
      } catch (error) {
        console.error('Error loading AG Grid:', error)
        // Fallback to HTML table
        setIsAGGridLoaded(false)
      }
    }

    loadAGGrid()
  }, [])

  // Calculate BMI and percentiles
  const calculateNutritionalMetrics = useCallback((rowData: NutritionalData): NutritionalData => {
    const bmi = rowData.weight / Math.pow(rowData.height / 100, 2)
    
    // Mock percentile calculations (in real implementation, use WHO/Brazilian standards)
    const weightPercentile = Math.min(97, Math.max(3, 50 + (Math.random() - 0.5) * 60))
    const heightPercentile = Math.min(97, Math.max(3, 50 + (Math.random() - 0.5) * 60))
    const bmiPercentile = Math.min(97, Math.max(3, 50 + (Math.random() - 0.5) * 60))
    
    // Determine nutritional status
    let nutritionalStatus = 'Adequado'
    if (bmiPercentile < 3) nutritionalStatus = 'Baixo peso severo'
    else if (bmiPercentile < 10) nutritionalStatus = 'Baixo peso'
    else if (bmiPercentile > 97) nutritionalStatus = 'Obesidade'
    else if (bmiPercentile > 85) nutritionalStatus = 'Sobrepeso'
    
    // Generate recommendations
    const recommendations = generateRecommendations(nutritionalStatus, rowData.age)
    
    return {
      ...rowData,
      bmi: Math.round(bmi * 100) / 100,
      weightPercentile: Math.round(weightPercentile),
      heightPercentile: Math.round(heightPercentile),
      bmiPercentile: Math.round(bmiPercentile),
      nutritionalStatus,
      recommendations,
      lastUpdated: new Date().toISOString()
    }
  }, [])

  const generateRecommendations = (status: string, age: number): string => {
    const recommendations: Record<string, string[]> = {
      'Baixo peso severo': [
        'Encaminhar para avaliação médica urgente',
        'Aumentar densidade calórica das refeições',
        'Monitoramento semanal do peso'
      ],
      'Baixo peso': [
        'Aumentar frequência das refeições',
        'Incluir alimentos ricos em energia',
        'Acompanhamento nutricional mensal'
      ],
      'Adequado': [
        'Manter alimentação equilibrada',
        'Estimular atividade física adequada para idade',
        'Acompanhamento de rotina'
      ],
      'Sobrepeso': [
        'Reduzir alimentos ultraprocessados',
        'Aumentar consumo de frutas e vegetais',
        'Estimular atividade física diária'
      ],
      'Obesidade': [
        'Encaminhar para equipe multidisciplinar',
        'Reeducação alimentar familiar',
        'Programa de atividade física supervisionada'
      ]
    }
    
    return recommendations[status]?.join('; ') || 'Manter acompanhamento nutricional regular'
  }

  const validateData = (rowData: NutritionalData): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic validations
    if (!rowData.patientName || rowData.patientName.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres')
    }
    
    if (rowData.age < 0 || rowData.age > 120) {
      errors.push('Idade deve estar entre 0 e 120 meses')
    }
    
    if (rowData.weight <= 0 || rowData.weight > 200) {
      errors.push('Peso deve estar entre 0.1 e 200 kg')
    }
    
    if (rowData.height <= 0 || rowData.height > 250) {
      errors.push('Altura deve estar entre 1 e 250 cm')
    }
    
    // Warnings for unusual values
    if (rowData.age < 6) {
      warnings.push('Idade muito baixa para avaliação nutricional padrão')
    }
    
    if (rowData.weight < 2 || rowData.weight > 50) {
      warnings.push('Peso fora da faixa típica para a idade')
    }
    
    if (rowData.height < 45 || rowData.height > 120) {
      warnings.push('Altura fora da faixa típica para a idade')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const handleCellValueChanged = useCallback((event: any) => {
    const updatedData = [...data]
    const rowIndex = event.rowIndex
    const field = event.colDef.field
    const newValue = event.newValue
    
    // Update the specific field
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [field]: newValue,
      lastUpdated: new Date().toISOString()
    }
    
    // Validate the row
    const validation = validateData(updatedData[rowIndex])
    setValidationResults(prev => ({
      ...prev,
      [updatedData[rowIndex].id]: validation
    }))
    
    // Recalculate if weight or height changed
    if (field === 'weight' || field === 'height') {
      updatedData[rowIndex] = calculateNutritionalMetrics(updatedData[rowIndex])
    }
    
    setData(updatedData)
    onDataChange?.(updatedData)
  }, [data, onDataChange, calculateNutritionalMetrics])

  const calculateAllMetrics = () => {
    setCalculationStatus('calculating')
    
    setTimeout(() => {
      const updatedData = data.map(row => calculateNutritionalMetrics(row))
      setData(updatedData)
      setCalculationStatus('complete')
      onCalculationComplete?.(updatedData)
      
      setTimeout(() => setCalculationStatus('idle'), 2000)
    }, 1000)
  }

  const resetData = () => {
    const freshData = generateMockData()
    setData(freshData)
    setValidationResults({})
    setCalculationStatus('idle')
    onDataChange?.(freshData)
  }

  const exportData = () => {
    const csvContent = [
      // Header
      'Nome,Idade (meses),Sexo,Peso (kg),Altura (cm),IMC,Percentil Peso,Percentil Altura,Percentil IMC,Status Nutricional,Recomendações',
      // Data rows
      ...data.map(row => [
        row.patientName,
        row.age,
        row.gender,
        row.weight,
        row.height,
        row.bmi || '',
        row.weightPercentile || '',
        row.heightPercentile || '',
        row.bmiPercentile || '',
        row.nutritionalStatus || '',
        row.recommendations || ''
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dados-nutricionais.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // AG Grid column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Nome',
      field: 'patientName',
      editable: editable,
      width: 150,
      cellStyle: (params: any) => {
        const validation = validationResults[params.data.id]
        if (validation && !validation.isValid) {
          return { backgroundColor: '#fef2f2', borderLeft: '3px solid #ef4444' }
        }
        return null
      }
    },
    {
      headerName: 'Idade (meses)',
      field: 'age',
      editable: editable,
      type: 'numericColumn',
      width: 120,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, max: 120 }
    },
    {
      headerName: 'Sexo',
      field: 'gender',
      editable: editable,
      width: 80,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['M', 'F'] }
    },
    {
      headerName: 'Peso (kg)',
      field: 'weight',
      editable: editable,
      type: 'numericColumn',
      width: 100,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0.1, max: 200, precision: 1 },
      valueFormatter: (params: any) => params.value ? `${params.value} kg` : ''
    },
    {
      headerName: 'Altura (cm)',
      field: 'height',
      editable: editable,
      type: 'numericColumn',
      width: 110,
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 1, max: 250, precision: 1 },
      valueFormatter: (params: any) => params.value ? `${params.value} cm` : ''
    },
    {
      headerName: 'IMC',
      field: 'bmi',
      editable: false,
      type: 'numericColumn',
      width: 80,
      valueFormatter: (params: any) => params.value ? params.value.toFixed(1) : '',
      cellStyle: { backgroundColor: '#f9fafb' }
    },
    {
      headerName: 'P. Peso',
      field: 'weightPercentile',
      editable: false,
      type: 'numericColumn',
      width: 90,
      valueFormatter: (params: any) => params.value ? `P${params.value}` : '',
      cellStyle: { backgroundColor: '#f9fafb' }
    },
    {
      headerName: 'P. Altura',
      field: 'heightPercentile',
      editable: false,
      type: 'numericColumn',
      width: 90,
      valueFormatter: (params: any) => params.value ? `P${params.value}` : '',
      cellStyle: { backgroundColor: '#f9fafb' }
    },
    {
      headerName: 'P. IMC',
      field: 'bmiPercentile',
      editable: false,
      type: 'numericColumn',
      width: 80,
      valueFormatter: (params: any) => params.value ? `P${params.value}` : '',
      cellStyle: (params: any) => {
        if (!params.value) return { backgroundColor: '#f9fafb' }
        
        const percentile = params.value
        if (percentile < 3 || percentile > 97) {
          return { backgroundColor: '#fef2f2', color: '#dc2626' }
        } else if (percentile < 10 || percentile > 85) {
          return { backgroundColor: '#fefbf2', color: '#d97706' }
        }
        return { backgroundColor: '#f0fdf4', color: '#16a34a' }
      }
    },
    {
      headerName: 'Status Nutricional',
      field: 'nutritionalStatus',
      editable: false,
      width: 150,
      cellStyle: (params: any) => {
        if (!params.value) return { backgroundColor: '#f9fafb' }
        
        const status = params.value
        if (status.includes('severo') || status.includes('Obesidade')) {
          return { backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 'bold' }
        } else if (status.includes('Baixo peso') || status.includes('Sobrepeso')) {
          return { backgroundColor: '#fefbf2', color: '#d97706', fontWeight: 'bold' }
        } else if (status === 'Adequado') {
          return { backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: 'bold' }
        }
        return { backgroundColor: '#f9fafb' }
      }
    }
  ], [editable, validationResults])

  // Fallback table component
  const FallbackTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-3 py-2 text-left">Nome</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Idade</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Sexo</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Peso</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Altura</th>
            <th className="border border-gray-300 px-3 py-2 text-left">IMC</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-300 px-3 py-2">{row.patientName}</td>
              <td className="border border-gray-300 px-3 py-2">{row.age} meses</td>
              <td className="border border-gray-300 px-3 py-2">{row.gender}</td>
              <td className="border border-gray-300 px-3 py-2">{row.weight} kg</td>
              <td className="border border-gray-300 px-3 py-2">{row.height} cm</td>
              <td className="border border-gray-300 px-3 py-2">{row.bmi?.toFixed(1) || '-'}</td>
              <td className="border border-gray-300 px-3 py-2">{row.nutritionalStatus || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Dados Nutricionais Interativos</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {showCalculations && (
              <Button
                onClick={calculateAllMetrics}
                disabled={calculationStatus === 'calculating'}
                className="flex items-center space-x-1"
              >
                {calculationStatus === 'calculating' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : calculationStatus === 'complete' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                <span>
                  {calculationStatus === 'calculating' ? 'Calculando...' : 
                   calculationStatus === 'complete' ? 'Concluído!' : 'Calcular'}
                </span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportData}
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetData}
              className="flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {showValidation && Object.keys(validationResults).length > 0 && (
          <div className="mb-4 space-y-2">
            {Object.entries(validationResults).map(([id, result]) => {
              if (result.errors.length === 0 && result.warnings.length === 0) return null
              
              return (
                <div key={id} className="p-3 rounded-lg border">
                  {result.errors.length > 0 && (
                    <div className="flex items-start space-x-2 text-red-700 bg-red-50">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Erros encontrados:</p>
                        <ul className="list-disc list-inside text-sm">
                          {result.errors.map((error, i) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {result.warnings.length > 0 && (
                    <div className="flex items-start space-x-2 text-yellow-700 bg-yellow-50 mt-2">
                      <Info className="w-4 h-4 mt-0.5" />
                      <div>
                        <p className="font-medium">Avisos:</p>
                        <ul className="list-disc list-inside text-sm">
                          {result.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="h-96 w-full">
          {isAGGridLoaded ? (
            <div className="ag-theme-alpine h-full w-full">
              {/* AG Grid will be rendered here when loaded */}
              <FallbackTable />
            </div>
          ) : (
            <FallbackTable />
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Instruções:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Clique duas vezes nas células para editar os valores</li>
                <li>Use o botão "Calcular" para atualizar IMC e percentis automaticamente</li>
                <li>Cores indicam status nutricional: Verde (adequado), Amarelo (atenção), Vermelho (risco)</li>
                <li>Exporte os dados em CSV para análise externa</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
