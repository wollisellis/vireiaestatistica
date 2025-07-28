# Padrões de Acesso Firebase - bioestat-platform

**Guia de boas práticas, otimizações e padrões de acesso aos dados Firebase**

## 🎯 Visão Geral

Este documento descreve os padrões estabelecidos para acessar dados do Firebase de forma eficiente, segura e consistente na bioestat-platform.

## 🏗️ Arquitetura de Acesso

### Camadas da Aplicação

```
🎨 Presentation Layer (Components)
│   ├── /jogos/page.tsx
│   ├── ClassRankingPanel.tsx
│   └── StudentClassInfo.tsx
│
🔧 Service Layer (Business Logic)
│   ├── unifiedScoringService.ts
│   ├── enhancedClassService.ts
│   └── professorClassService.ts
│
🔗 Hook Layer (Data Access)
│   ├── useFirebaseAuth.ts
│   ├── useRBAC.ts
│   └── useFlexibleAccess.ts
│
🔥 Firebase Layer
│   ├── Firebase Auth
│   └── Firestore Database
```

## 🚀 Serviços Principais e Seus Padrões

### 1. UnifiedScoringService - Sistema de Pontuação

**Responsabilidade**: Gerenciar pontuações e rankings de estudantes

```javascript
// ✅ Padrão: Singleton com cache
class UnifiedScoringService {
  private static instance: UnifiedScoringService
  private cache: Map<string, { data: UnifiedScore, timestamp: number }>
  
  static getInstance(): UnifiedScoringService {
    if (!UnifiedScoringService.instance) {
      UnifiedScoringService.instance = new UnifiedScoringService()
    }
    return UnifiedScoringService.instance
  }
}
```

**Padrões de Acesso**:

```javascript
// ✅ BOM: Cache primeiro, depois Firestore
async getUnifiedScore(studentId: string): Promise<UnifiedScore | null> {
  // 1. Verificar cache
  const cached = this.cache.get(studentId)
  if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
    return cached.data
  }
  
  // 2. Buscar no Firestore
  const scoreDoc = await getDoc(doc(db, 'unified_scores', studentId))
  
  // 3. Atualizar cache
  if (scoreDoc.exists()) {
    const score = scoreDoc.data() as UnifiedScore
    this.cache.set(studentId, { data: score, timestamp: Date.now() })
    return score
  }
  
  return null
}

// ❌ RUIM: Sempre buscar no Firestore
async getUnifiedScoreBad(studentId: string) {
  return await getDoc(doc(db, 'unified_scores', studentId))
}
```

### 2. EnhancedClassService - Gestão de Turmas

**Responsabilidade**: Buscar dados detalhados de turmas e estudantes

```javascript
// ✅ Padrão: Múltiplos métodos com fallback
static async getEnhancedClassStudents(classId: string): Promise<EnhancedStudentOverview[]> {
  // Método 1: Query otimizada (preferencial)
  let students = await this.getStudentsMethod1(classId)
  
  if (students.length === 0) {
    // Método 2: Query alternativa
    students = await this.getStudentsMethod2(classId)
  }
  
  if (students.length === 0) {
    // Método 3: Fallback completo
    students = await this.getStudentsMethod3(classId)
  }
  
  return students
}
```

**Query Otimizada por Range**:

```javascript
// ✅ BOM: Range query eficiente
const studentsQuery = query(
  collection(db, 'classStudents'),
  where('__name__', '>=', `${classId}_`),
  where('__name__', '<', `${classId}_\uf8ff`)
)

// ❌ RUIM: Query completa com filtro
const allStudents = await getDocs(collection(db, 'classStudents'))
const filtered = allStudents.docs.filter(doc => 
  doc.data().classId === classId
)
```

### 3. ProfessorClassService - Gestão de Professores

**Responsabilidade**: Operações específicas de professores e matrículas

```javascript
// ✅ Padrão: Queries específicas e bem indexadas
static async getStudentClasses(studentId: string): Promise<ClassInfo[]> {
  const enrollmentsQuery = query(
    collection(db, 'classStudents'),
    where('studentId', '==', studentId),
    where('status', '==', 'active')
  )
  
  const enrollmentsSnapshot = await getDocs(enrollmentsQuery)
  const classIds = enrollmentsSnapshot.docs.map(doc => doc.data().classId)
  
  // Buscar dados das turmas em paralelo
  const classPromises = classIds.map(classId => 
    getDoc(doc(db, 'classes', classId))
  )
  
  const classResults = await Promise.all(classPromises)
  return classResults
    .filter(doc => doc.exists())
    .map(doc => ({ id: doc.id, ...doc.data() }))
}
```

## 🔐 Padrões de Segurança

### 1. Validação de Entrada

```javascript
// ✅ BOM: Sempre validar parâmetros
async getStudentData(studentId: string) {
  if (!studentId || typeof studentId !== 'string') {
    throw new Error('Student ID inválido')
  }
  
  if (!studentId.match(/^[a-zA-Z0-9_-]+$/)) {
    throw new Error('Student ID contém caracteres inválidos')
  }
  
  // Prosseguir com a busca...
}

// ❌ RUIM: Não validar entrada
async getStudentDataBad(studentId: any) {
  return await getDoc(doc(db, 'users', studentId))
}
```

### 2. Controle de Acesso

```javascript
// ✅ BOM: Verificar permissões antes do acesso
async getStudentScores(requesterId: string, targetStudentId: string) {
  // Verificar se é o próprio estudante
  if (requesterId === targetStudentId) {
    return await this.getUnifiedScore(targetStudentId)
  }
  
  // Verificar se é professor
  const requesterDoc = await getDoc(doc(db, 'users', requesterId))
  if (requesterDoc.data()?.role === 'professor') {
    return await this.getUnifiedScore(targetStudentId)
  }
  
  throw new Error('Acesso negado')
}
```

### 3. Sanitização de Dados

```javascript
// ✅ BOM: Sanitizar dados de saída
function sanitizeUserData(userData: any) {
  return {
    id: userData.uid,
    name: userData.displayName?.substring(0, 100) || 'Usuário',
    email: userData.email,
    role: userData.role === 'professor' ? 'professor' : 'student',
    anonymousId: userData.anonymousId?.match(/^\d{4}$/) ? userData.anonymousId : null
  }
}
```

## ⚡ Padrões de Performance

### 1. Batch Operations

```javascript
// ✅ BOM: Operações em lote
async updateMultipleScores(updates: Array<{studentId: string, score: number}>) {
  const batch = writeBatch(db)
  
  updates.forEach(({ studentId, score }) => {
    const scoreRef = doc(db, 'unified_scores', studentId)
    batch.update(scoreRef, {
      totalScore: score,
      normalizedScore: Math.min(100, Math.max(0, score)),
      updatedAt: serverTimestamp()
    })
  })
  
  await batch.commit()
}

// ❌ RUIM: Operações sequenciais
async updateMultipleScoresBad(updates: Array<{studentId: string, score: number}>) {
  for (const { studentId, score } of updates) {
    await updateDoc(doc(db, 'unified_scores', studentId), {
      totalScore: score,
      updatedAt: serverTimestamp()
    })
  }
}
```

### 2. Consultas Paralelas

```javascript
// ✅ BOM: Promise.all para consultas independentes
async getStudentOverview(studentId: string) {
  const [userDoc, scoreDoc, classesSnapshot] = await Promise.all([
    getDoc(doc(db, 'users', studentId)),
    getDoc(doc(db, 'unified_scores', studentId)),
    getDocs(query(
      collection(db, 'classStudents'),
      where('studentId', '==', studentId)
    ))
  ])
  
  return {
    userData: userDoc.data(),
    scoreData: scoreDoc.data(),
    classes: classesSnapshot.docs.map(doc => doc.data())
  }
}

// ❌ RUIM: Consultas sequenciais
async getStudentOverviewBad(studentId: string) {
  const userDoc = await getDoc(doc(db, 'users', studentId))
  const scoreDoc = await getDoc(doc(db, 'unified_scores', studentId))
  const classesSnapshot = await getDocs(query(
    collection(db, 'classStudents'),
    where('studentId', '==', studentId)
  ))
  
  return { /* ... */ }
}
```

### 3. Paginação e Limites

```javascript
// ✅ BOM: Sempre usar limite
const rankingQuery = query(
  collection(db, 'unified_scores'),
  orderBy('normalizedScore', 'desc'),
  limit(10) // Limitar resultados
)

// Para paginação:
const nextPageQuery = query(
  collection(db, 'unified_scores'),
  orderBy('normalizedScore', 'desc'),
  startAfter(lastDoc),
  limit(10)
)

// ❌ RUIM: Buscar todos os documentos
const allScores = await getDocs(collection(db, 'unified_scores'))
```

## 🔄 Padrões de Sincronização

### 1. Listeners em Tempo Real

```javascript
// ✅ BOM: Listener específico e com cleanup
useEffect(() => {
  if (!studentId) return
  
  const unsubscribe = onSnapshot(
    doc(db, 'unified_scores', studentId),
    (doc) => {
      if (doc.exists()) {
        setScore(doc.data() as UnifiedScore)
      }
    },
    (error) => {
      console.error('Erro no listener:', error)
    }
  )
  
  return () => unsubscribe()
}, [studentId])

// ❌ RUIM: Listener sem cleanup
useEffect(() => {
  onSnapshot(doc(db, 'unified_scores', studentId), (doc) => {
    setScore(doc.data())
  })
}, [])
```

### 2. Events Customizados

```javascript
// ✅ BOM: Sistema de eventos para comunicação entre componentes
class EventSystem {
  static dispatchModuleCompleted(data: {
    userId: string,
    moduleId: string,
    score: number,
    percentage: number
  }) {
    window.dispatchEvent(new CustomEvent('moduleCompleted', {
      detail: data
    }))
  }
  
  static onModuleCompleted(callback: (data: any) => void) {
    const handler = (event: CustomEvent) => callback(event.detail)
    window.addEventListener('moduleCompleted', handler)
    return () => window.removeEventListener('moduleCompleted', handler)
  }
}

// Uso nos componentes:
useEffect(() => {
  const unsubscribe = EventSystem.onModuleCompleted((data) => {
    console.log('Módulo completado:', data)
    refreshRanking()
  })
  
  return unsubscribe
}, [])
```

## 🧪 Padrões de Tratamento de Erros

### 1. Try-Catch com Logs Estruturados

```javascript
// ✅ BOM: Tratamento estruturado de erros
async getStudentData(studentId: string) {
  try {
    console.log(`[Service] Buscando dados do estudante: ${studentId}`)
    
    const userDoc = await getDoc(doc(db, 'users', studentId))
    
    if (!userDoc.exists()) {
      console.warn(`[Service] ⚠️ Usuário não encontrado: ${studentId}`)
      return null
    }
    
    console.log(`[Service] ✅ Dados encontrados para: ${studentId}`)
    return userDoc.data()
    
  } catch (error) {
    console.error(`[Service] ❌ Erro ao buscar estudante ${studentId}:`, {
      error: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Re-throw para permitir tratamento upstream
    throw new Error(`Falha ao buscar dados do estudante: ${error.message}`)
  }
}
```

### 2. Retry Pattern com Backoff

```javascript
// ✅ BOM: Retry com backoff exponencial
async retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      const isRetryable = 
        error.code === 'unavailable' || 
        error.code === 'deadline-exceeded'
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error
      }
      
      // Backoff exponencial: 1s, 2s, 4s
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
      
      console.log(`[Retry] Tentativa ${attempt + 2}/${maxRetries} em ${delay}ms`)
    }
  }
}
```

## 📊 Padrões de Cache

### 1. Cache com TTL

```javascript
// ✅ BOM: Sistema de cache com expiração
class CacheManager {
  private cache = new Map<string, CacheEntry>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutos
  
  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    })
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  invalidate(pattern: string) {
    const regex = new RegExp(pattern)
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }
}
```

### 2. Cache Invalidation

```javascript
// ✅ BOM: Invalidação inteligente de cache
class UnifiedScoringService {
  async updateStudentScore(studentId: string, newScore: number) {
    // 1. Atualizar no Firestore
    await updateDoc(doc(db, 'unified_scores', studentId), {
      totalScore: newScore,
      normalizedScore: Math.min(100, Math.max(0, newScore)),
      updatedAt: serverTimestamp()
    })
    
    // 2. Invalidar caches relacionados
    this.cache.delete(studentId) // Cache do próprio estudante
    this.cacheManager.invalidate(`class_ranking_.*`) // Rankings de turmas
    this.cacheManager.invalidate(`student_progress_${studentId}`) // Progresso
    
    // 3. Notificar outros componentes
    EventSystem.dispatchScoreUpdated({ studentId, newScore })
  }
}
```

## 🎨 Padrões de UI/UX

### 1. Loading States

```javascript
// ✅ BOM: Estados de loading granulares
const [loadingStates, setLoadingStates] = useState({
  auth: true,
  userProfile: true,
  classData: true,
  ranking: true
})

const isFullyLoaded = Object.values(loadingStates).every(state => !state)

// Mostrar skeleton apenas para partes específicas
if (loadingStates.ranking) {
  return <RankingSkeleton />
}
```

### 2. Error Boundaries

```javascript
// ✅ BOM: Error boundary específico para Firebase
class FirebaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    // Classificar tipos de erro
    const isNetworkError = error.code === 'unavailable'
    const isPermissionError = error.code === 'permission-denied'
    
    return {
      hasError: true,
      error: {
        ...error,
        isNetworkError,
        isPermissionError
      }
    }
  }
  
  render() {
    if (this.state.hasError) {
      return <FirebaseErrorUI error={this.state.error} />
    }
    
    return this.props.children
  }
}
```

## 📏 Métricas e Monitoramento

### 1. Performance Tracking

```javascript
// ✅ BOM: Métricas de performance
class PerformanceTracker {
  static async measureFirestoreOperation(
    operationName: string,
    operation: () => Promise<any>
  ) {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      
      console.log(`[Perf] ${operationName}: ${duration.toFixed(2)}ms`)
      
      // Enviar métricas se necessário
      if (duration > 2000) {
        console.warn(`[Perf] ⚠️ Operação lenta: ${operationName}`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      console.error(`[Perf] ❌ ${operationName} falhou em ${duration.toFixed(2)}ms`)
      throw error
    }
  }
}
```

### 2. Usage Analytics

```javascript
// ✅ BOM: Analytics de uso (respeitando privacidade)
class AnalyticsService {
  static trackPageView(pageName: string, userRole: string) {
    // Apenas dados não identificáveis
    console.log(`[Analytics] ${userRole} acessou ${pageName}`)
  }
  
  static trackModuleCompletion(moduleId: string, score: number, timeSpent: number) {
    console.log(`[Analytics] Módulo ${moduleId} concluído`, {
      score: Math.round(score),
      timeSpent: Math.round(timeSpent / 1000), // em segundos
      timestamp: new Date().toISOString()
    })
  }
}
```

## 🔧 Configuração e Ambiente

### 1. Configuração por Ambiente

```javascript
// ✅ BOM: Configuração específica por ambiente
const firebaseConfig = {
  development: {
    cacheExpiration: 1 * 60 * 1000, // 1 minuto
    enableDebugLogs: true,
    maxRetries: 1
  },
  production: {
    cacheExpiration: 5 * 60 * 1000, // 5 minutos
    enableDebugLogs: false,
    maxRetries: 3
  }
}

const config = firebaseConfig[process.env.NODE_ENV] || firebaseConfig.development
```

### 2. Feature Flags

```javascript
// ✅ BOM: Feature flags para funcionalidades experimentais
const FEATURE_FLAGS = {
  ENABLE_REALTIME_RANKING: process.env.NODE_ENV === 'development',
  ENABLE_ADVANCED_ANALYTICS: false,
  CACHE_STUDENT_PROFILES: true
}

// Uso condicional:
if (FEATURE_FLAGS.ENABLE_REALTIME_RANKING) {
  // Implementar listener em tempo real
}
```

Estes padrões garantem que o acesso aos dados Firebase seja consistente, performático e seguro em toda a aplicação.