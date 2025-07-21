// Sistema de Design Tokens - bioestat-platform
// Tokens unificados para cores, espaçamentos e tipografia

export const designTokens = {
  // Cores principais - Sistema temático nutritional
  colors: {
    // Cores primárias do sistema (baseadas em emerald/teal para saúde/nutrição)
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5', 
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // emerald-500 - cor principal
      600: '#059669', // emerald-600 - cor primária forte
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    // Cores secundárias (teal para complementar)
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // teal-500 - cor secundária
      600: '#0d9488', // teal-600 - cor secundária forte
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    
    // Estados e feedback
    success: {
      light: '#d1fae5', // emerald-100
      default: '#10b981', // emerald-500
      dark: '#047857', // emerald-700
    },
    
    warning: {
      light: '#fef3c7', // amber-100
      default: '#f59e0b', // amber-500
      dark: '#d97706', // amber-600
    },
    
    error: {
      light: '#fee2e2', // red-100
      default: '#ef4444', // red-500
      dark: '#dc2626', // red-600
    },
    
    info: {
      light: '#dbeafe', // blue-100
      default: '#3b82f6', // blue-500
      dark: '#2563eb', // blue-600
    },
    
    // Cores neutras
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Cores especiais para módulos educacionais
    module: {
      anthropometric: '#10b981', // emerald-500 - Antropométricos
      clinical: '#0d9488', // teal-600 - Clínicos
      socioeconomic: '#3b82f6', // blue-500 - Socioeconômicos
      growth: '#8b5cf6', // violet-500 - Curvas de crescimento
    },
    
    // Gradientes para elementos visuais
    gradients: {
      primary: 'from-emerald-500 to-teal-600',
      success: 'from-emerald-50 to-teal-50',
      dashboard: 'from-emerald-50 via-teal-50 to-cyan-50',
    }
  },
  
  // Espaçamentos consistentes
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },
  
  // Bordas e raios
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
    '2xl': '1rem',  // 16px
    full: '9999px',
  },
  
  // Sombras
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Tipografia
  typography: {
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Consolas', '"Liberation Mono"', 'Menlo', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  // Animações
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    }
  },
  
  // Breakpoints responsivos
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
} as const

// Utilitários para usar os tokens
export const getModuleColor = (moduleId: string) => {
  switch (moduleId) {
    case 'module-1':
      return designTokens.colors.module.anthropometric
    case 'module-2':
      return designTokens.colors.module.clinical
    case 'module-3':
      return designTokens.colors.module.socioeconomic
    case 'module-4':
      return designTokens.colors.module.growth
    default:
      return designTokens.colors.primary[500]
  }
}

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  return designTokens.colors[status].default
}

// Classes CSS utilities para Tailwind
export const cssUtilities = {
  // Botões
  btn: {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    secondary: 'bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg transition-colors',
    outline: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors',
    ghost: 'text-emerald-600 hover:bg-emerald-50 font-medium px-4 py-2 rounded-lg transition-colors',
  },
  
  // Cards
  card: {
    primary: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    elevated: 'bg-white border border-gray-200 rounded-lg shadow-md',
    success: 'bg-emerald-50 border border-emerald-200 rounded-lg',
    info: 'bg-blue-50 border border-blue-200 rounded-lg',
  },
  
  // Status badges
  badge: {
    success: 'bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium',
    warning: 'bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium',
    error: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium',
    info: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
  }
}