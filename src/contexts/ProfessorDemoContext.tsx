'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Demo data for professor guest mode
interface StudentDemoData {
  id: string
  anonymousId: string
  name: string
  email: string
  totalScore: number
  completedModules: number[]
  achievements: string[]
  lastActivity: string
  progress: {
    moduleId: number
    score: number
    completedAt: string
    timeSpent: number
  }[]
}

interface ClassAnalytics {
  totalStudents: number
  averageScore: number
  completionRate: number
  modulePerformance: {
    moduleId: number
    moduleName: string
    averageScore: number
    completionRate: number
    commonMistakes: string[]
  }[]
  topPerformers: StudentDemoData[]
  strugglingStudents: StudentDemoData[]
}

interface ProfessorDemoContextType {
  students: StudentDemoData[]
  analytics: ClassAnalytics
  moduleSettings: {
    moduleId: number
    isLocked: boolean
    unlockDate?: string
  }[]
  toggleModuleLock: (moduleId: number) => void
  exportStudentData: () => void
  resetClassProgress: () => void
}

const ProfessorDemoContext = createContext<ProfessorDemoContextType | undefined>(undefined)

// Generate realistic demo data
const generateDemoStudents = (): StudentDemoData[] => {
  const names = [
    'Ana Silva', 'Bruno Santos', 'Carla Oliveira', 'Diego Costa', 'Elena Ferreira',
    'Felipe Lima', 'Gabriela Rocha', 'Henrique Alves', 'Isabela Martins', 'João Pereira',
    'Larissa Souza', 'Marcos Ribeiro', 'Natália Castro', 'Pedro Araújo', 'Rafaela Gomes'
  ]

  return names.map((name, index) => {
    const completedModules = Math.random() > 0.3 ? [1, 2] : [1]
    if (Math.random() > 0.5) completedModules.push(3)
    if (Math.random() > 0.7) completedModules.push(4)

    const baseScore = 60 + Math.random() * 35 // 60-95 range
    const totalScore = Math.floor(baseScore * completedModules.length)

    return {
      id: `student-${index + 1}`,
      anonymousId: `ALUNO${String(index + 1).padStart(3, '0')}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@dac.unicamp.br`,
      totalScore,
      completedModules,
      achievements: generateAchievements(completedModules.length, baseScore),
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: completedModules.map(moduleId => ({
        moduleId,
        score: Math.floor(baseScore + (Math.random() - 0.5) * 20),
        completedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        timeSpent: Math.floor(15 + Math.random() * 30) // 15-45 minutes
      }))
    }
  })
}

const generateAchievements = (moduleCount: number, avgScore: number): string[] => {
  const achievements = ['first-game']
  
  if (moduleCount >= 2) achievements.push('quick-learner')
  if (avgScore > 85) achievements.push('high-achiever')
  if (moduleCount >= 3) achievements.push('dedicated-student')
  if (avgScore > 90) achievements.push('perfectionist')
  
  return achievements
}

const generateAnalytics = (students: StudentDemoData[]): ClassAnalytics => {
  const totalStudents = students.length
  const averageScore = students.reduce((sum, s) => sum + s.totalScore, 0) / totalStudents / 4 // Normalize by modules
  const completionRate = students.filter(s => s.completedModules.length >= 2).length / totalStudents

  const moduleNames = [
    'Avaliação Antropométrica',
    'Medidas Avançadas',
    'Ciclos da Vida',
    'Avaliação Clínica'
  ]

  const modulePerformance = [1, 2, 3, 4].map(moduleId => {
    const studentsWithModule = students.filter(s => s.completedModules.includes(moduleId))
    const avgScore = studentsWithModule.length > 0 
      ? studentsWithModule.reduce((sum, s) => {
          const moduleProgress = s.progress.find(p => p.moduleId === moduleId)
          return sum + (moduleProgress?.score || 0)
        }, 0) / studentsWithModule.length
      : 0

    return {
      moduleId,
      moduleName: moduleNames[moduleId - 1],
      averageScore: Math.floor(avgScore),
      completionRate: studentsWithModule.length / totalStudents,
      commonMistakes: [
        'Cálculo incorreto de IMC',
        'Interpretação de percentis',
        'Classificação nutricional'
      ]
    }
  })

  const sortedByScore = [...students].sort((a, b) => b.totalScore - a.totalScore)
  
  return {
    totalStudents,
    averageScore: Math.floor(averageScore),
    completionRate,
    modulePerformance,
    topPerformers: sortedByScore.slice(0, 5),
    strugglingStudents: sortedByScore.slice(-3)
  }
}

export function ProfessorDemoProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<StudentDemoData[]>([])
  const [analytics, setAnalytics] = useState<ClassAnalytics>({
    totalStudents: 0,
    averageScore: 0,
    completionRate: 0,
    modulePerformance: [],
    topPerformers: [],
    strugglingStudents: []
  })
  const [moduleSettings, setModuleSettings] = useState([
    { moduleId: 1, isLocked: false },
    { moduleId: 2, isLocked: false },
    { moduleId: 3, isLocked: true, unlockDate: '2024-02-15' },
    { moduleId: 4, isLocked: true, unlockDate: '2024-03-01' }
  ])

  useEffect(() => {
    // Initialize demo data
    console.log('ProfessorDemoContext: Initializing demo data...')
    const demoStudents = generateDemoStudents()
    const demoAnalytics = generateAnalytics(demoStudents)

    console.log('ProfessorDemoContext: Generated students:', demoStudents.length)
    console.log('ProfessorDemoContext: Generated analytics:', demoAnalytics)

    setStudents(demoStudents)
    setAnalytics(demoAnalytics)

    // Load module settings from localStorage if available
    const savedSettings = localStorage.getItem('nt600-module-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setModuleSettings(parsed)
      } catch (error) {
        console.error('Error loading module settings:', error)
      }
    }

    // Listen for storage changes to sync module settings across components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nt600-module-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue)
          setModuleSettings(newSettings)
        } catch (error) {
          console.error('Error parsing storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const toggleModuleLock = (moduleId: number) => {
    const updatedSettings = moduleSettings.map(module =>
      module.moduleId === moduleId
        ? { ...module, isLocked: !module.isLocked }
        : module
    )

    setModuleSettings(updatedSettings)

    // Persist to localStorage for cross-component synchronization
    localStorage.setItem('nt600-module-settings', JSON.stringify(updatedSettings))

    // Trigger storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nt600-module-settings',
      newValue: JSON.stringify(updatedSettings)
    }))
  }

  const exportStudentData = () => {
    const csvData = students.map(student => ({
      'ID Anônimo': student.anonymousId,
      'Nome': student.name,
      'Email': student.email,
      'Pontuação Total': student.totalScore,
      'Módulos Concluídos': student.completedModules.length,
      'Conquistas': student.achievements.length,
      'Última Atividade': new Date(student.lastActivity).toLocaleDateString('pt-BR')
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dados_estudantes_demo.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetClassProgress = () => {
    const resetStudents = generateDemoStudents()
    setStudents(resetStudents)
    setAnalytics(generateAnalytics(resetStudents))
  }

  const contextValue: ProfessorDemoContextType = {
    students,
    analytics,
    moduleSettings,
    toggleModuleLock,
    exportStudentData,
    resetClassProgress
  }

  return (
    <ProfessorDemoContext.Provider value={contextValue}>
      {children}
    </ProfessorDemoContext.Provider>
  )
}

export function useProfessorDemo() {
  const context = useContext(ProfessorDemoContext)
  if (context === undefined) {
    throw new Error('useProfessorDemo must be used within a ProfessorDemoProvider')
  }
  return context
}
