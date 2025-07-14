# 🚨 SOLUÇÃO RÁPIDA: Erro "Failed to get document because the client is offline"

## 🎯 Problema
Você está vendo este erro porque o Firebase não está configurado com credenciais reais.

## ⚡ Solução em 5 Minutos

### 1. Acesse o Firebase Console
👉 https://console.firebase.google.com/

### 2. Obtenha as Credenciais
1. Selecione seu projeto (ou crie um novo)
2. Clique no ícone de **engrenagem** (⚙️) → **"Configurações do projeto"**
3. Na aba **"Geral"**, role até **"Seus apps"**
4. Se não tiver um app web, clique **"Adicionar app"** → **Web** (`</>`)
5. Dê um nome (ex: "AvaliaNutri") → **"Registrar app"**
6. **COPIE** as credenciais que aparecem

### 3. Configure o .env.local
Abra `bioestat-platform/.env.local` e substitua:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=SUA_API_KEY_REAL_AQUI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Ative Authentication
No Firebase Console:
- **Authentication** → **Sign-in method**
- Ative **Email/Password** e **Google**

### 5. Crie o Firestore
- **Firestore Database** → **Criar banco de dados**
- Escolha **"Modo de teste"** → Selecione localização

### 6. Reinicie o Servidor
```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

## ✅ Pronto!
O erro deve desaparecer e você poderá criar contas e fazer login.

---

## 🔧 Se ainda não funcionar:

### Erro comum: "Invalid API key"
- Verifique se copiou a API key completa
- Não deve ter espaços extras

### Erro: "Permission denied"
- Certifique-se que criou o Firestore Database
- Use "modo de teste" por enquanto

### Ainda com problemas?
1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique o console do navegador (F12)
3. Certifique-se que todas as variáveis estão no `.env.local`

## 📝 Importante
- **NUNCA** commite o `.env.local`
- As variáveis do Vercel já estão corretas
- Isso é só para desenvolvimento local
