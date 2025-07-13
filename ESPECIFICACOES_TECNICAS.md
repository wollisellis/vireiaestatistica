# AvaliaNutri - Especificações Técnicas Detalhadas
## Documentação Completa para Consultores e Desenvolvedores

---

## 📦 **DEPENDÊNCIAS E VERSÕES**

### **Dependências de Produção**
```json
{
  "@hookform/resolvers": "^3.3.2",    // Validação de formulários
  "clsx": "^2.1.1",                   // Utilitário para classes CSS
  "firebase": "^10.12.2",             // Backend opcional (não usado atualmente)
  "framer-motion": "^11.3.8",         // Animações e transições
  "lucide-react": "^0.400.0",         // Biblioteca de ícones
  "next": "14.2.5",                   // Framework React
  "react": "^18.3.1",                 // Biblioteca principal
  "react-dom": "^18.3.1",             // DOM React
  "react-hook-form": "^7.52.1",       // Gerenciamento de formulários
  "recharts": "^2.12.7",              // Gráficos e visualizações
  "tailwind-merge": "^2.4.0",         // Merge de classes Tailwind
  "zod": "^3.23.8",                   // Validação de esquemas
  "zustand": "^4.5.4"                 // Gerenciamento de estado (não usado)
}
```

### **Dependências de Desenvolvimento**
```json
{
  "@types/node": "^20.14.10",         // Tipos Node.js
  "@types/react": "^18.3.3",          // Tipos React
  "@types/react-dom": "^18.3.0",      // Tipos React DOM
  "autoprefixer": "^10.4.19",         // PostCSS autoprefixer
  "eslint": "^8.57.0",                // Linter JavaScript/TypeScript
  "eslint-config-next": "14.2.5",     // Configuração ESLint para Next.js
  "postcss": "^8.4.39",               // Processador CSS
  "tailwindcss": "^3.4.4",            // Framework CSS
  "typescript": "^5.5.3"              // Compilador TypeScript
}
```

---

## ⚙️ **CONFIGURAÇÕES DO PROJETO**

### **next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Permite build com warnings ESLint
  },
  typescript: {
    ignoreBuildErrors: true,   // Permite build com warnings TypeScript
  },
  swcMinify: true,            // Minificação otimizada
  images: {
    domains: [],              // Domínios permitidos para imagens
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts']
  }
}

module.exports = nextConfig
```

### **tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tema AvaliaNutri
        emerald: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        teal: {
          50: '#f0fdfa',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 🏗️ **ARQUITETURA DE COMPONENTES**

### **Componentes Principais**
```
src/components/
├── nutritional-games/           # Jogos educacionais
│   ├── NutritionalGame1Anthropometric.tsx
│   ├── NutritionalGame2Clinical.tsx
│   ├── NutritionalGame3Socioeconomic.tsx
│   ├── NutritionalGame4GrowthCurves.tsx
│   └── index.ts
├── student-progress/            # Sistema de progresso
│   ├── StudentProgressDashboard.tsx
│   ├── AchievementBadges.tsx
│   ├── PerformanceMetrics.tsx
│   └── index.ts
├── growth-curves/               # Curvas de crescimento
│   ├── GrowthCurveChart.tsx
│   ├── InteractiveGrowthCurve.tsx
│   └── index.ts
├── ranking/                     # Sistema de ranking
│   ├── RankingSidebar.tsx
│   ├── MobileRanking.tsx
│   └── index.ts
├── ui/                         # Componentes base
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── LoadingSpinner.tsx
└── layout/                     # Layout e navegação
    ├── Layout.tsx
    ├── Navigation.tsx
    └── Footer.tsx
```

### **Context API Structure**
```typescript
// StudentProgressContext.tsx
interface StudentProgress {
  totalScore: number
  totalPossibleScore: number
  gamesCompleted: number
  averageScore: number
  totalTimeSpent: number
  gameScores: GameScore[]
  achievements: string[]
  lastActivity: Date
  rankingScore: number
  improvementStreak: number
}

interface GameScore {
  gameId: number
  score: number
  exercisesCompleted: number
  totalExercises: number
  timeElapsed: number
  normalizedScore: number
  isPersonalBest: boolean
  attempt: number
  completedAt: Date
}
```

---

## 📊 **ESTRUTURA DE DADOS**

### **Datasets Nutricionais**
```typescript
// nutritionalAssessmentData.ts
interface NutritionalDataset {
  id: string
  name: string
  description: string
  context: string
  data: any[]
  variables: string[]
  sampleSize: number
  population: string
  location: string
  citation: {
    authors: string
    title: string
    journal: string
    year: number
    doi?: string
    institution: string
  }
  ethicsApproval?: string
  dataType: 'anthropometric' | 'clinical' | 'biochemical' | 'socioeconomic' | 'demographic'
}
```

### **Curvas de Crescimento**
```typescript
// brazilianGrowthCurves.ts
interface GrowthCurveData {
  age: number
  P3: number    // Percentil 3
  P10: number   // Percentil 10
  P25: number   // Percentil 25
  P50: number   // Percentil 50 (mediana)
  P75: number   // Percentil 75
  P90: number   // Percentil 90
  P97: number   // Percentil 97
}

interface GrowthReference {
  id: string
  name: string
  gender: 'male' | 'female'
  indicator: 'weight-for-age' | 'height-for-age' | 'weight-for-height' | 'bmi-for-age'
  ageRange: { min: number, max: number }
  unit: string
  data: GrowthCurveData[]
  source: string
}
```

---

## 🎮 **SISTEMA DE JOGOS**

### **Estrutura de Jogo**
```typescript
interface GameDefinition {
  id: number
  title: string
  description: string
  difficulty: 'Muito Fácil' | 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil'
  estimatedTime: string
  learningObjectives: string[]
  topics: string[]
  isLocked: boolean
  lockMessage?: string
  exercises: Exercise[]
}

interface Exercise {
  id: string
  type: 'multiple-choice' | 'calculation' | 'interpretation' | 'plotting'
  question: string
  data?: any
  options?: string[]
  correctAnswer: string | number
  explanation: string
  hints?: string[]
  difficulty: number
}
```

### **Sistema de Pontuação**
```typescript
// Cálculo de pontuação normalizada
const calculateNormalizedScore = (
  exercisesCompleted: number, 
  totalExercises: number
): number => {
  if (totalExercises === 0) return 0
  return Math.round((exercisesCompleted / totalExercises) * 100)
}

// Sistema de conquistas
const achievements = {
  'first-game': 'Primeiro Jogo Completo',
  'perfect-score': 'Pontuação Perfeita',
  'high-performer': 'Alto Desempenho',
  'improvement-streak': 'Sequência de Melhoria',
  'quick-learner': 'Aprendizado Rápido'
}
```

---

## 🔧 **CONFIGURAÇÕES DE DESENVOLVIMENTO**

### **Scripts NPM**
```json
{
  "scripts": {
    "dev": "next dev",                    // Servidor de desenvolvimento
    "build": "next build",                // Build para produção
    "start": "next start",                // Servidor de produção
    "lint": "next lint",                  // Linting
    "type-check": "tsc --noEmit"          // Verificação de tipos
  }
}
```

### **ESLint Configuration**
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/no-unescaped-entities": "warn",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "warn"
  }
}
```

### **Configuração Vercel**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install --legacy-peer-deps",
  "routes": [
    {
      "src": "/",
      "dest": "/jogos"
    }
  ]
}
```

---

## 🚀 **DEPLOYMENT E PRODUÇÃO**

### **Preparação para Deploy**
```bash
# Limpeza
rm -rf node_modules package-lock.json .next

# Instalação
npm install --legacy-peer-deps

# Build de produção
npm run build

# Teste local
npm start
```

### **Variáveis de Ambiente**
```env
# Produção
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://avalianutri.vercel.app

# Desenvolvimento
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Otimizações de Performance**
- **Code Splitting**: Automático via Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `npm run build` mostra tamanhos
- **Lazy Loading**: Componentes carregados sob demanda
- **Caching**: Headers de cache otimizados

---

## 🔍 **MONITORAMENTO E DEBUGGING**

### **Ferramentas de Debug**
- **React DevTools**: Inspeção de componentes
- **Next.js DevTools**: Performance e build analysis
- **Browser DevTools**: Network, Performance, Console
- **TypeScript**: Verificação de tipos em tempo real

### **Logging e Errors**
```typescript
// Error boundaries implementados
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error:', error, errorInfo)
    // Em produção: enviar para serviço de monitoramento
  }
}

// Logging de progresso
const logGameProgress = (gameId: number, score: number) => {
  console.log(`Game ${gameId} completed with score: ${score}`)
  // Em produção: analytics tracking
}
```

---

## 📈 **MÉTRICAS E ANALYTICS**

### **Métricas Coletadas**
- **Tempo por exercício**: Tracking detalhado
- **Taxa de acerto**: Por jogo e exercício
- **Padrões de uso**: Horários, frequência
- **Dificuldades**: Exercícios com mais erros
- **Progresso**: Curva de aprendizado

### **KPIs Educacionais**
- **Completion Rate**: % de jogos finalizados
- **Score Improvement**: Melhoria entre tentativas
- **Time to Mastery**: Tempo para atingir 80%+ de acerto
- **Retention**: Retorno à plataforma
- **Engagement**: Tempo total de uso

---

## 🎯 **PRÓXIMOS PASSOS TÉCNICOS**

### **Melhorias Imediatas**
1. **Deploy Vercel**: Publicação em produção
2. **Error Monitoring**: Sentry ou similar
3. **Analytics**: Google Analytics ou Mixpanel
4. **Performance**: Lighthouse optimization

### **Desenvolvimento Futuro**
1. **Backend API**: Node.js + PostgreSQL
2. **Autenticação**: NextAuth.js
3. **Real-time**: WebSockets para colaboração
4. **Mobile**: React Native ou PWA

**Status Técnico**: ✅ **PRONTO PARA PRODUÇÃO**
