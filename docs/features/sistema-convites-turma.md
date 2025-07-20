# Sistema de Convites e Códigos de Turma

## Visão Geral

O sistema de convites permite que professores criem turmas e gerem códigos únicos para que estudantes se matriculem automaticamente. O sistema é integrado com Firebase Firestore e inclui interface completa para compartilhamento via múltiplos canais.

## Arquitetura

### Componentes Principais

1. **ClassInviteService** - Serviço de geração e validação de códigos
2. **ClassInviteModal** - Interface para compartilhamento de convites
3. **ImprovedClassManagement** - Gerenciamento de turmas do professor
4. **EntrarTurmaPage** - Página de matrícula do estudante

### Fluxo de Dados

```
Professor → Cria Turma → ClassInviteService.createClassInvite() → Código Gerado
                     ↓
                Firebase Firestore (classInvites + classes)
                     ↓
              ClassInviteModal → Múltiplas opções de compartilhamento
                     ↓
        Estudante → EntrarTurmaPage → Validação → Matrícula Automática
```

## Funcionalidades

### 1. Geração de Códigos

**Algoritmo de Geração:**
- Primeiros 4 caracteres do nome da turma (sem especiais)
- Últimos 2 dígitos do ano
- 2 caracteres aleatórios
- Exemplo: "NUTRI25AB"

**Implementação:**
```typescript
static generateClassCode(className: string, year: number): string {
  const classPrefix = className
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .substring(0, 4)
    .padEnd(4, 'X')
  
  const yearSuffix = year.toString().slice(-2)
  const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
  
  return `${classPrefix}${yearSuffix}${randomSuffix}`
}
```

### 2. Criação de Convites

**Método:** `ClassInviteService.createClassInvite()`

**Parâmetros:**
- `classId` - ID da turma
- `className` - Nome da turma
- `professorId` - ID do professor
- `options` - Configurações opcionais (expiração, limite de usos)

**Processo:**
1. Gera código único
2. Cria documento em `classInvites/{code}`
3. Atualiza turma com `inviteCode`
4. Retorna código gerado

### 3. Interface de Compartilhamento

**ClassInviteModal** fornece:

#### Métodos de Compartilhamento
- **WhatsApp** - Mensagem formatada com código
- **Email** - Template completo com instruções
- **QR Code** - Geração visual (em desenvolvimento)
- **Cópia direta** - Código e link

#### Informações Exibidas
- Nome e período da turma
- Código da turma
- Link direto de matrícula
- Contador de estudantes
- Instruções passo a passo

### 4. Validação e Matrícula

**Validação:** `ClassInviteService.validateInviteCode()`

**Verificações:**
- Código existe
- Convite ativo
- Não expirado
- Limite de usos não excedido

**Matrícula:** `ClassInviteService.registerStudentWithCode()`

**Processo:**
1. Valida código
2. Cria registro em `classStudents`
3. Incrementa contador da turma
4. Atualiza uso do convite

## Integração com Interface

### ImprovedClassManagement

**Estados relevantes:**
```typescript
const [showInviteModal, setShowInviteModal] = useState(false)
const [inviteClass, setInviteClass] = useState<ClassInfo | null>(null)
```

**Funções de controle:**
- `showClassInvites(classInfo)` - Abre modal para turma específica
- `closeInviteModal()` - Fecha modal e limpa estado

**Integração nos cards:**
```typescript
<EnhancedClassCard
  onShowInvites={() => showClassInvites(cls)}
  // ... outras props
/>
```

### EntrarTurmaPage

**Fluxo de matrícula:**
1. Detecta código via URL ou input manual
2. Valida código com `validateInviteCode()`
3. Exibe informações da turma
4. Processa login/registro do estudante
5. Executa matrícula com `registerStudentWithCode()`
6. Redireciona para dashboard

## Estrutura no Firebase

### Coleção: classInvites

```typescript
{
  id: string,
  classId: string,
  code: string,
  createdAt: Date,
  expiresAt?: Date,
  isActive: boolean,
  maxUses?: number,
  currentUses: number,
  createdBy: string
}
```

### Coleção: classStudents

```typescript
{
  studentId: string,
  studentName: string,
  studentEmail: string,
  registeredAt: Date,
  inviteCode: string,
  status: 'pending' | 'active' | 'inactive'
}
```

### Atualização: classes

```typescript
{
  // ... dados da turma
  code: string,         // Código atual
  inviteCode: string,   // Código de convite
  lastInviteCreated: Date
}
```

## Configuração de Segurança

### Firestore Rules

```javascript
// Convites - leitura pública para validação
match /classInvites/{code} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.role == 'professor';
}

// Estudantes da turma - acesso controlado
match /classStudents/{studentId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```

## Tratamento de Erros

### Cenários de Erro

1. **Código inválido/inexistente**
   - Retorna `{ isValid: false, error: "Código inválido" }`

2. **Convite expirado**
   - Verifica `expiresAt` vs data atual

3. **Limite de usos excedido**
   - Compara `currentUses` vs `maxUses`

4. **Falha na matrícula**
   - Roll-back automático
   - Log detalhado do erro

### Recuperação Automática

- **Firebase offline** - Dados em cache
- **Timeout de rede** - Retry automático
- **Concorrência** - Transações atômicas

## Métricas e Monitoramento

### Eventos Rastreados

- Criação de convites
- Validações de código
- Matrículas bem-sucedidas
- Tentativas de código inválido
- Compartilhamentos por canal

### Logs Importantes

```typescript
console.log('Convite criado:', classId, 'código:', code)
console.log('Código validado:', code, 'resultado:', validation)
console.log('Estudante matriculado:', studentId, 'turma:', classId)
```

## Melhorias Futuras

### Funcionalidades Planejadas

1. **QR Code Generation** - Geração visual de códigos
2. **Convites por lote** - Upload de lista de emails
3. **Analytics avançado** - Dashboard de métricas
4. **Notificações** - Email automático para professor
5. **Códigos temporários** - Convites com expiração automática

### Otimizações

1. **Cache inteligente** - Códigos frequentemente usados
2. **Compressão de URLs** - Links mais curtos
3. **Pre-loading** - Dados da turma em cache
4. **Rate limiting** - Proteção contra spam

## Troubleshooting

### Problemas Comuns

**Código não gerado:**
- Verificar conexão Firebase
- Validar permissões do professor
- Checar logs do console

**Modal não aparece:**
- Verificar estado `showInviteModal`
- Confirmar `inviteClass` não é null
- Validar props do `EnhancedClassCard`

**Matrícula falha:**
- Verificar autenticação do estudante
- Validar formato do email institucional
- Checar capacidade da turma

### Debug

```typescript
// Ativar logs detalhados
localStorage.setItem('debug:invites', 'true')

// Verificar estado do modal
console.log('Modal state:', { showInviteModal, inviteClass })

// Testar validação de código
const result = await ClassInviteService.validateInviteCode('NUTRI25AB')
console.log('Validation result:', result)
```

## Exemplo de Uso

### Criação Completa de Turma com Convite

```typescript
// 1. Professor cria turma
const classId = await ProfessorClassService.createClass(
  professorId,
  'Prof. Dr. Dennys',
  'Avaliação Nutricional - Turma A',
  '1º Semestre',
  2025
)

// 2. Código é gerado automaticamente no processo acima
// 3. Modal de convites aparece automaticamente
// 4. Professor compartilha via WhatsApp/Email
// 5. Estudante acessa link e se matricula
```

Este sistema fornece uma experiência completa e integrada para gestão de convites de turma, desde a criação até a matrícula automática dos estudantes.