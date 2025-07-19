# Configuração do Firebase para AvaliaNutri

## Aplicar Regras de Segurança do Firestore

1. Acesse o Console do Firebase: https://console.firebase.google.com
2. Selecione o projeto: vireiestatistica-ba7c5
3. No menu lateral, vá para: Firestore Database > Rules
4. Copie todo o conteúdo do arquivo `firestore.rules`
5. Cole no editor de regras do Firebase Console
6. Clique em "Publish" para aplicar as regras

## Estrutura de Dados Esperada

### Coleção: users
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "Nome do Usuário",
  "role": "student" | "professor",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Coleção: module_progress
```json
{
  "studentId": "user123",
  "studentName": "Nome do Estudante",
  "modules": [...],
  "totalNormalizedScore": 0,
  "overallProgress": 0,
  "lastActivity": "timestamp"
}
```

### Coleção: classes
```json
{
  "id": "class123",
  "name": "Nutrição - Turma A",
  "code": "NUT-2024-A",
  "professorId": "prof123",
  "professorName": "Nome do Professor",
  "semester": "1º Semestre",
  "year": 2024,
  "isActive": true,
  "createdAt": "timestamp"
}
```

### Coleção: notifications
```json
{
  "type": "achievement",
  "recipientId": "user123",
  "recipientRole": "student",
  "title": "Nova Conquista!",
  "message": "Você completou o módulo 1",
  "read": false,
  "createdAt": "timestamp"
}
```

## Corrigir Erros de Permissão

Se você está recebendo erros de "Missing or insufficient permissions", verifique:

1. **Usuário não autenticado**: Certifique-se de que o usuário está logado
2. **Papel do usuário não definido**: Verifique se o documento do usuário tem o campo `role`
3. **Documento não existe**: Alguns documentos podem não existir ainda

### Criar usuário professor manualmente (se necessário)

No Firestore Console, crie um documento na coleção `users`:

```json
{
  "email": "professor@unicamp.br",
  "displayName": "Professor Demo",
  "role": "professor",
  "createdAt": "timestamp atual",
  "updatedAt": "timestamp atual"
}
```

O ID do documento deve ser o mesmo UID do usuário no Authentication.

## Índices Compostos Necessários

O Firestore pode solicitar a criação de índices compostos. Quando isso acontecer:

1. Clique no link de erro no console do navegador
2. Ou vá para: Firestore > Indexes
3. Crie os índices conforme solicitado

Índices recomendados:
- module_progress: (studentId ASC, lastActivity DESC)
- notifications: (recipientId ASC, createdAt DESC)
- classes: (professorId ASC, createdAt DESC)

## Modo de Desenvolvimento

Para desenvolvimento local, você pode temporariamente usar regras mais permissivas:

```javascript
// APENAS PARA DESENVOLVIMENTO - NÃO USE EM PRODUÇÃO
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**IMPORTANTE**: Sempre volte às regras seguras antes de ir para produção!