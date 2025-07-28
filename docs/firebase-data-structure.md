# Estrutura de Dados: Site ↔️ Firebase

**bioestat-platform** - Documentação técnica da estrutura de dados Firebase

## 📊 Visão Geral

Este documento detalha como os dados fluem entre o frontend (página `/jogos`) e o Firebase Firestore, especificando exatamente onde cada informação é armazenada e como é acessada.

## 🏗️ Estrutura do Firebase Firestore

### 1. Coleção `users` - Perfis dos Usuários

**Localização**: `/users/{userId}`

```javascript
// Documento do usuário
{
  uid: "abc123xyz789",              // ID único do Firebase Auth
  email: "joao.silva@unicamp.br",   // Email institucional
  displayName: "João Silva",        // Nome completo (primeira opção)
  name: "João Silva",               // Nome alternativo (segunda opção)
  fullName: "João Silva Santos",    // Nome completo alternativo (terceira opção)
  role: "student",                  // Papel: "student" | "professor"
  anonymousId: "2847",              // ID anônimo de 4 dígitos (apenas estudantes)
  anonymousIdGeneratedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActivity: Timestamp,
  status: "active",
  institutionId: "unicamp",
  emailVerified: true
}
```

**Como é usado na página `/jogos`**:
- **Nome do estudante**: Extrai primeiro nome de `displayName` → `name` → `fullName`
- **Anonymous ID**: Campo `anonymousId` exibido como `#{anonymousId}`
- **Identificação**: Campo `uid` usado como `userId` em todo o sistema

### 2. Coleção `unified_scores` - Sistema de Pontuação

**Localização**: `/unified_scores/{studentId}`

```javascript
// Documento de pontuação unificada
{
  studentId: "abc123xyz789",        // Referência ao usuário
  userId: "abc123xyz789",           // Alias para compatibilidade
  userName: "João",                 // Nome para exibição
  totalScore: 85.5,                 // Pontuação total bruta
  normalizedScore: 85.5,            // Pontuação normalizada (0-100)
  moduleScores: {                   // Pontuações por módulo
    "module-1": 85.5,
    "module-2": 0,
    "module-3": 0,
    "module-4": 0
  },
  gameScores: {                     // Pontuações por jogo (legacy)
    "game-1": 85.5
  },
  achievements: {                   // Conquistas do estudante
    level: "bronze",
    currentStreak: 1,
    longestStreak: 1
  },
  lastActivity: Timestamp,          // Última atividade
  streak: 1,                        // Sequência atual
  level: 1,                         // Nível alcançado
  completionRate: 25.0,             // Taxa de conclusão (0-100)
  classRank: 1,                     // Posição no ranking da turma
  moduleProgress: {                 // Progresso detalhado por módulo
    "module-1": {
      title: "Indicadores Antropométricos",
      completionPercentage: 100,
      timeSpent: 900000,            // Em milissegundos
      lastActivity: Timestamp,
      averageAttempts: 1.5
    }
  }
}
```

**Como é usado na página `/jogos`**:
- **Pontuação do ranking**: Campo `normalizedScore` limitado entre 0-100
- **Posição no ranking**: Campo `classRank` calculado dinamicamente
- **Progresso**: Campo `moduleProgress` para exibir conquistas

### 3. Coleção `classes` - Turmas

**Localização**: `/classes/{classId}`

```javascript
// Documento da turma
{
  id: "turma_2025_1_nutricao",      // ID único da turma
  name: "Nutrição 2025.1",          // Nome da turma
  description: "Turma de Avaliação Nutricional",
  semester: "1º Semestre",          // Semestre
  year: "2025",                     // Ano
  inviteCode: "NUTR2025",           // Código de convite
  professorId: "prof_abc123",       // ID do professor responsável
  professorName: "Prof. Maria Santos", // Nome do professor
  status: "open",                   // Status: "open" | "closed" | "archived"
  maxStudents: 50,                  // Limite de estudantes
  acceptingNewStudents: true,       // Aceita novos estudantes
  studentsCount: 25,                // Quantidade atual de estudantes
  createdAt: Timestamp,
  updatedAt: Timestamp,
  settings: {                       // Configurações da turma
    allowLateSubmissions: true,
    showLeaderboard: true,
    enableCollaboration: false
  }
}
```

**Como é usado na página `/jogos`**:
- **Informações da turma**: Campos `name`, `professorName`, `semester`, `year`
- **Contador de alunos**: Campo `studentsCount`

### 4. Coleção `classStudents` - Matrículas

**Localização**: `/classStudents/{classId}_{studentId}`

```javascript
// Documento de matrícula
{
  classId: "turma_2025_1_nutricao", // ID da turma
  studentId: "abc123xyz789",        // ID do estudante
  studentName: "João Silva",        // Nome do estudante
  studentEmail: "joao@unicamp.br",  // Email do estudante
  enrolledAt: Timestamp,            // Data de matrícula
  status: "active",                 // Status: "active" | "inactive" | "removed"
  role: "student",                  // Sempre "student" nesta coleção
  lastActivity: Timestamp,          // Última atividade na turma
  notes: "",                        // Notas do professor (opcional)
  source: "invite_code"             // Como se matriculou
}
```

**Como é usado na página `/jogos`**:
- **Lista de estudantes**: Para buscar todos os alunos da turma
- **Verificação de matrícula**: Para confirmar se estudante pertence à turma

### 5. Coleção `quiz_attempts` - Tentativas de Quiz

**Localização**: `/quiz_attempts/{attemptId}`

```javascript
// Documento de tentativa de quiz
{
  studentId: "abc123xyz789",        // ID do estudante
  moduleId: "module-1",             // ID do módulo
  startedAt: Timestamp,             // Início da tentativa
  completedAt: Timestamp,           // Conclusão da tentativa
  timeSpent: 450000,                // Tempo gasto (milissegundos)
  answers: {                        // Respostas do estudante
    "q1": "A",
    "q2": "B",
    "q3": "C"
  },
  score: 85.5,                      // Pontuação bruta
  percentage: 85.5,                 // Porcentagem (0-100)
  passed: true,                     // Se passou (>= 70%)
  totalQuestions: 10,               // Total de questões
  correctAnswers: 8,                // Respostas corretas
  feedback: {                       // Feedback detalhado
    strengths: ["Questões básicas"],
    improvements: ["Questões avançadas"]
  }
}
```

**Como é usado na página `/jogos`**:
- **Verificar conclusão**: Para saber se módulo foi completado
- **Exibir estatísticas**: Pontuação, tempo, tentativas no modal
- **Fonte primária**: Para buscar progresso do módulo

## 🔄 Fluxo de Dados na Página `/jogos`

### 1. Carregamento Inicial

```javascript
// 1. Autenticação
useFirebaseAuth() → Firebase Auth

// 2. Perfil do usuário
useRBAC() → /users/{userId}

// 3. Acesso flexível
useFlexibleAccess() → combina dados de auth + perfil

// 4. Dados disponíveis no componente
const { user, loading, hasAccess, isProfessor } = useFlexibleAccess()
```

### 2. Exibição do Nome e ID

```javascript
// Localização: src/app/jogos/page.tsx (linhas 475-487)
const displayName = (() => {
  const fullName = user?.displayName || user?.name || user?.fullName
  const firstName = fullName ? fullName.split(' ')[0] : null
  return firstName || 'Aluno'
})()

// Anonymous ID (linhas 493-500)
const anonymousId = user?.anonymousId
// Exibido como: #{anonymousId} (ex: #2847)
```

### 3. Carregamento do Ranking

```javascript
// Localização: src/components/ranking/ClassRankingPanel.tsx
// 1. Buscar turmas do estudante
const studentClasses = await ProfessorClassService.getStudentClasses(userId)

// 2. Para cada turma, buscar estudantes
const studentsData = await enhancedClassService.getClassStudents(classId)

// 3. Para cada estudante, consolidar dados
const studentProgress = await enhancedClassService.getStudentDetailedProgress(
  studentId, classId
)

// 4. Ordenar por pontuação e atribuir posições
const sortedStudents = students
  .sort((a, b) => b.totalScore - a.totalScore)
  .map((student, index) => ({ ...student, position: index + 1 }))
```

### 4. Atualização de Pontuação

```javascript
// Localização: src/services/unifiedScoringService.ts
// Quando módulo é completado:
window.dispatchEvent(new CustomEvent('moduleCompleted', {
  detail: { userId, moduleId, score, percentage, passed }
}))

// Listener na página:
window.addEventListener('moduleCompleted', (event) => {
  // Atualiza ranking após 2-5 segundos
  setTimeout(() => {
    unifiedScoringService.updateStudentRanking(userId)
  }, 2000)
})
```

## 🚀 Funções de Geração de Dados

### Anonymous ID (4 dígitos)

```javascript
// Localização: src/lib/firebase.ts (linha 362)
export const generateAnonymousId = (): string => {
  // Gera exatamente 4 dígitos (1000-9999)
  const fourDigitNumber = Math.floor(Math.random() * 9000) + 1000
  return `${fourDigitNumber}`
}

// Usado durante cadastro de estudantes:
const anonymousId = role === 'student' ? generateAnonymousId() : undefined
```

## 🔐 Regras de Segurança

```javascript
// Localização: firestore.rules
// Usuários podem ler apenas seus próprios dados
match /users/{userId} {
  allow read, update: if request.auth.uid == userId;
  allow read: if isProfessor(); // Professores veem todos
}

// Pontuações são protegidas
match /unified_scores/{studentId} {
  allow read, write: if request.auth.uid == studentId;
  allow read: if isProfessor();
}

// Tentativas de quiz são imutáveis após criação
match /quiz_attempts/{attemptId} {
  allow read, create: if request.resource.data.studentId == request.auth.uid;
  allow update, delete: if false; // Nunca permitir edição
}
```

## 📊 Exemplo de Consulta Completa

Para buscar todos os dados exibidos na página `/jogos`:

```javascript
// 1. Dados do usuário atual
const userDoc = await getDoc(doc(db, 'users', userId))
const userData = userDoc.data()

// 2. Pontuação do usuário
const scoreDoc = await getDoc(doc(db, 'unified_scores', userId))
const scoreData = scoreDoc.data()

// 3. Turmas do usuário
const classesQuery = query(
  collection(db, 'classStudents'),
  where('studentId', '==', userId),
  where('status', '==', 'active')
)
const classesSnapshot = await getDocs(classesQuery)

// 4. Para cada turma, buscar ranking
for (const classDoc of classesSnapshot.docs) {
  const classData = classDoc.data()
  
  // Buscar outros estudantes da turma
  const studentsQuery = query(
    collection(db, 'classStudents'),
    where('classId', '==', classData.classId),
    where('status', '==', 'active')
  )
  const studentsSnapshot = await getDocs(studentsQuery)
  
  // Para cada estudante, buscar pontuação
  const rankings = await Promise.all(
    studentsSnapshot.docs.map(async (studentDoc) => {
      const student = studentDoc.data()
      const scoreDoc = await getDoc(doc(db, 'unified_scores', student.studentId))
      const userDoc = await getDoc(doc(db, 'users', student.studentId))
      
      return {
        studentId: student.studentId,
        studentName: userDoc.data()?.displayName || student.studentName,
        anonymousId: userDoc.data()?.anonymousId,
        totalScore: scoreDoc.data()?.normalizedScore || 0
      }
    })
  )
  
  // Ordenar por pontuação
  rankings.sort((a, b) => b.totalScore - a.totalScore)
}
```

## 🎯 Pontos Importantes

1. **Anonymous ID**: Apenas estudantes têm, gerado automaticamente durante cadastro
2. **Pontuação**: Sempre normalizada entre 0-100, fonte principal é `unified_scores`
3. **Ranking**: Calculado dinamicamente, ordenado por `normalizedScore` decrescente
4. **Turmas**: Um estudante pode estar em múltiplas turmas
5. **Atualização**: Ranking atualizado automaticamente quando módulo é completado
6. **Performance**: Sistema usa cache de 5 minutos no `unifiedScoringService`

## 📱 Responsividade dos Dados

A página `/jogos` adapta a exibição conforme o dispositivo:
- **Desktop**: Ranking expandido (10 estudantes)
- **Tablet**: Ranking médio (8 estudantes)  
- **Mobile**: Ranking compacto (5 estudantes)

Todos os dados vêm das mesmas fontes Firebase, apenas a apresentação muda.