# Fluxo de Dados: Site ↔️ Firebase - Diagramas Visuais

**bioestat-platform** - Mapeamento visual do fluxo de dados entre frontend e Firebase

## 🎯 Visão Geral do Fluxo

```mermaid
graph TD
    A[Usuário acessa /jogos] --> B[useFlexibleAccess Hook]
    B --> C[useFirebaseAuth]
    B --> D[useRBAC]
    C --> E[Firebase Auth]
    D --> F[Firestore: users/{userId}]
    F --> G[Dados do usuário carregados]
    G --> H[Renderização da página]
    H --> I[Carrega ranking da turma]
    I --> J[ClassRankingPanel]
    J --> K[enhancedClassService]
    K --> L[Múltiplas consultas Firestore]
    L --> M[Dados consolidados]
    M --> N[Interface final]
```

## 🏗️ Estrutura Visual do Firebase

```
📊 Firestore Database
│
├── 👤 users/
│   ├── {userId_1}/
│   │   ├── 📛 displayName: "João Silva"
│   │   ├── 📧 email: "joao@unicamp.br" 
│   │   ├── 🎭 anonymousId: "2847"
│   │   ├── 👨‍🎓 role: "student"
│   │   └── ⏰ lastActivity: Timestamp
│   │
│   └── {userId_2}/
│       ├── 📛 displayName: "Maria Santos"
│       └── 👩‍🏫 role: "professor"
│
├── 🏆 unified_scores/
│   ├── {studentId_1}/
│   │   ├── 📊 totalScore: 85.5
│   │   ├── 📈 normalizedScore: 85.5
│   │   ├── 📚 moduleScores: {"module-1": 85.5}
│   │   └── 🥇 classRank: 1
│   │
│   └── {studentId_2}/
│       ├── 📊 totalScore: 72.3
│       └── 🥈 classRank: 2
│
├── 🏫 classes/
│   └── {classId}/
│       ├── 📝 name: "Nutrição 2025.1"
│       ├── 👨‍🏫 professorName: "Prof. Maria"
│       ├── 📅 semester: "1º Semestre" 
│       ├── 🗓️ year: "2025"
│       └── 👥 studentsCount: 25
│
├── 📋 classStudents/
│   ├── {classId}_{studentId_1}/
│   │   ├── 🆔 classId: "class_abc"
│   │   ├── 👤 studentId: "student_123"
│   │   ├── 📛 studentName: "João Silva"
│   │   └── 📅 enrolledAt: Timestamp
│   │
│   └── {classId}_{studentId_2}/
│       └── ... (mesmo padrão)
│
└── 📝 quiz_attempts/
    └── {attemptId}/
        ├── 👤 studentId: "student_123"
        ├── 📚 moduleId: "module-1"
        ├── 📊 score: 85.5
        ├── ✅ passed: true
        └── ⏱️ timeSpent: 450000ms
```

## 🔄 Fluxo Detalhado por Componente

### 1. Componente Principal `/jogos/page.tsx`

```
🖥️ Página /jogos
│
├── 🔐 Autenticação
│   ├── useFlexibleAccess() ──────► 👤 users/{userId}
│   │                              │
│   │   ┌─────────────────────────┘
│   │   ▼
│   ├── 📛 Nome: displayName/name/fullName
│   ├── 🎭 ID Anônimo: anonymousId
│   └── 👨‍🎓 Papel: role
│
├── 📚 Módulos Educacionais
│   ├── 🎮 Lista de módulos (estática)
│   ├── 🔓 Verificar desbloqueio
│   └── ▶️ Navegar para quiz
│
├── 📊 Sidebar Desktop
│   ├── 🏫 StudentClassInfo ──────► classes/{classId}
│   └── 🏆 ClassRankingPanel ────► múltiplas coleções
│
└── 📱 Seção Mobile
    ├── 🏫 Informações da Turma
    └── 🏆 Ranking Compacto
```

### 2. Componente `ClassRankingPanel`

```
🏆 ClassRankingPanel
│
├── 🔍 Buscar Turmas do Usuário
│   │
│   ├── ProfessorClassService.getStudentClasses(userId)
│   │   │
│   │   └──► 📋 classStudents/ ──── WHERE studentId == userId
│   │                              WHERE status == "active"
│   │
│   └── Resultado: [{classId, className, professorName}, ...]
│
├── 👥 Buscar Estudantes da Turma (para cada turma)
│   │
│   ├── enhancedClassService.getClassStudents(classId)
│   │   │
│   │   ├──► 📋 classStudents/ ──── WHERE classId == classId
│   │   │                          WHERE status == "active"
│   │   │
│   │   ├──► 👤 users/{studentId} ─ displayName, anonymousId
│   │   │
│   │   └──► 🏆 unified_scores/{studentId} ─ normalizedScore
│   │
│   └── Resultado: [{studentId, studentName, anonymousId, totalScore}, ...]
│
├── 📊 Processar Ranking
│   │
│   ├── Ordenar por totalScore (decrescente)
│   ├── Atribuir posições (1º, 2º, 3º...)
│   └── Limitar por displayLimit (5-10 estudantes)
│
└── 🎨 Renderizar Interface
    │
    ├── 🥇 Ícones de posição (Crown, Medal, Award)
    ├── 🎭 ID Anônimo (#{anonymousId})
    ├── 📊 Pontuação formatada
    └── 🌟 Destaque do usuário atual
```

### 3. Componente `StudentClassInfo`

```
🏫 StudentClassInfo
│
├── 🔍 Buscar Turmas do Estudante
│   │
│   ├── ProfessorClassService.getStudentClasses(studentId)
│   │   │
│   │   ├──► 📋 classStudents/ ──── WHERE studentId == studentId
│   │   │                          WHERE status == "active"
│   │   │
│   │   └──► 🏫 classes/{classId} ─ name, professorName, semester, year
│   │
│   └── Resultado: [{id, name, professorName, semester, year}, ...]
│
└── 🎨 Renderizar Cards das Turmas
    │
    ├── 📝 Nome da turma
    ├── 👨‍🏫 Nome do professor  
    ├── 📅 Semestre e ano
    └── 👥 Contador de estudantes
```

## 🚀 Fluxo de Atualização em Tempo Real

### Quando um módulo é completado:

```
📝 Quiz Concluído
│
├── 💾 Salvar em quiz_attempts/
│   │
│   ├── studentId: "abc123"
│   ├── moduleId: "module-1"
│   ├── score: 85.5
│   ├── percentage: 85.5
│   └── passed: true
│
├── 🔄 Disparar Evento Global
│   │
│   └── window.dispatchEvent('moduleCompleted', {
│         userId, moduleId, score, percentage, passed
│       })
│
├── 📊 Atualizar unified_scores/
│   │
│   ├── unifiedScoringService.updateStudentRanking(userId)
│   │   │
│   │   ├──► 🏆 unified_scores/{userId}
│   │   │     ├── totalScore: recalculado
│   │   │     ├── normalizedScore: recalculado  
│   │   │     ├── moduleScores: atualizado
│   │   │     └── lastActivity: now()
│   │   │
│   │   └──► Cache invalidado (5 min TTL)
│
└── 🎨 Atualizar Interface
    │
    ├── 🏆 ClassRankingPanel escuta evento
    ├── ⏱️ Aguarda 2-5 segundos (debounce)
    ├── 🔄 Recarrega dados do ranking
    └── ✨ Re-renderiza com nova posição
```

## 🎯 Mapeamento de Dados Específicos

### Nome do Estudante

```
👤 Fonte: users/{userId}
│
├── 1ª opção: displayName ──► "João Silva Santos"
├── 2ª opção: name ────────► "João Silva"  
├── 3ª opção: fullName ───► "João Silva Santos"
└── Fallback: "Aluno"

📱 Processamento:
│
├── Extrair primeiro nome: fullName.split(' ')[0]
└── Resultado final: "João"
```

### Anonymous ID (4 dígitos)

```
🎭 Geração: generateAnonymousId()
│
├── Math.floor(Math.random() * 9000) + 1000
├── Resultado: 1000-9999 (4 dígitos exatos)
└── Exemplo: "2847"

💾 Armazenamento: users/{userId}.anonymousId
│
└── Usado apenas para estudantes (role: "student")

🎨 Exibição na UI:
│
├── Formato: "#{anonymousId}"
└── Exemplo: "#2847"
```

### Pontuação do Ranking

```
🏆 Fonte: unified_scores/{studentId}
│
├── totalScore: 85.5 (pontuação bruta)
├── normalizedScore: 85.5 (0-100 normalizada)
└── moduleScores: {"module-1": 85.5}

🔄 Processamento:
│
├── Limitação: Math.min(100, Math.max(0, score))
├── Ordenação: score decrescente
└── Posicionamento: index + 1

📊 Exibição:
│
├── Pontuação: formatScore(score) ──► "85.5" ou "85"
├── Posição: getRankIcon(position) ─► 👑 🥈 🥉 #4
└── Destaque: isCurrentUser ────────► cor diferente
```

## 🔐 Fluxo de Segurança

```
🔒 Firestore Security Rules
│
├── 👤 users/{userId}
│   ├── READ: próprio usuário OU professor
│   ├── WRITE: apenas próprio usuário
│   └── CREATE: email institucional válido
│
├── 🏆 unified_scores/{studentId}  
│   ├── READ: próprio estudante OU professor
│   ├── WRITE: próprio estudante OU professor
│   └── DELETE: nunca permitido
│
├── 📝 quiz_attempts/{attemptId}
│   ├── READ: próprio estudante OU professor
│   ├── CREATE: apenas próprio estudante
│   └── UPDATE/DELETE: nunca permitido (imutável)
│
└── 🏫 classes/{classId}
    ├── READ: todos os usuários autenticados
    ├── WRITE: apenas professores
    └── CREATE: apenas professores
```

## 📱 Fluxo Responsivo

```
🖥️ Desktop (lg+)
│
├── 🏆 ClassRankingPanel
│   ├── expanded: true
│   ├── displayLimit: 10 estudantes
│   └── showNames: false (apenas anonymousId)
│
└── 📊 Sidebar completa visível

📱 Tablet (md-lg)  
│
├── 🏆 ClassRankingPanel
│   ├── expanded: false
│   ├── displayLimit: 8 estudantes
│   └── compact: false
│
└── 📊 Sidebar ainda visível

📱 Mobile (sm-)
│
├── 🏆 ClassRankingPanel
│   ├── compact: true
│   ├── displayLimit: 5 estudantes
│   └── showNames: false
│
└── 📊 Sidebar movida para seção separada no final
```

## ⚡ Otimizações de Performance

### Cache Strategy

```
🚀 unifiedScoringService
│
├── 💾 Cache em memória (Map)
│   ├── TTL: 5 minutos (300.000ms)
│   ├── Key: studentId
│   └── Value: {data: UnifiedScore, timestamp: number}
│
├── 🔄 Cache hit: retorna dados imediatos
├── 🔄 Cache miss: consulta Firestore
└── 🔄 Cache expired: renovar dados
```

### Batch Operations

```
📦 Busca de múltiplos estudantes
│
├── 🔍 getClassStudents() usa Promise.all()
├── 📊 Consultas paralelas para cada estudante:
│   ├── users/{studentId}
│   └── unified_scores/{studentId}
├── ⚡ Reduz latência total
└── 🎯 Consolida dados em um resultado
```

### Debouncing

```
⏱️ Atualizações do ranking
│
├── 📝 moduleCompleted event disparado
├── ⏳ Debounce de 2-5 segundos
│   ├── Usuário atual: 2s
│   └── Outros usuários: 5s
├── 🔄 updateStudentRanking() chamado
└── 🎨 Interface atualizada
```

Este fluxo garante que os dados sejam sempre consistentes e atualizados, mantendo boa performance mesmo com múltiplos usuários simultâneos.