# Variáveis de Ambiente para Vercel

## Configuração Atual na Vercel

Baseado na sua configuração atual, você precisa ter estas variáveis na Vercel:

### Variáveis Firebase (OBRIGATÓRIAS)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBewwlrvwExkStQSyihgbb_OoI34oHFVZ0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vireiestatistica-ba7c5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vireiestatistica-ba7c5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vireiestatistica-ba7c5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=717809660419
NEXT_PUBLIC_FIREBASE_APP_ID=1:717809660419:web:564836c9876cf33d2a9436
```

### Variáveis Google Analytics (OPCIONAL)
```
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-844YYZ35X6
```

### Variáveis da Aplicação (OBRIGATÓRIAS)
```
NEXT_PUBLIC_APP_URL=https://seu-dominio-vercel.vercel.app
```

## Problema Identificado

Você tem uma configuração incorreta na Vercel:
- `NEXT_PUBLIC_APP_URL` está com valor `G-844YYZ35X6` (que é um Measurement ID)
- Está faltando `NEXT_PUBLIC_FIREBASE_PROJECT_ID`

## Correções Necessárias na Vercel

1. **Adicionar variável que está faltando:**
   - Nome: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - Valor: `vireiestatistica-ba7c5`
   - Environment: All Environments

2. **Corrigir variável existente:**
   - Nome: `NEXT_PUBLIC_APP_URL`
   - Valor atual (INCORRETO): `G-844YYZ35X6`
   - Valor correto: `https://seu-dominio-vercel.vercel.app`

3. **Adicionar variável opcional (se quiser Google Analytics):**
   - Nome: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
   - Valor: `G-844YYZ35X6`
   - Environment: All Environments

## Como Aplicar as Correções

1. Acesse seu projeto na Vercel
2. Vá para Settings → Environment Variables
3. Adicione/edite as variáveis conforme listado acima
4. Faça um novo deploy para aplicar as mudanças

## Verificação

Após aplicar as correções, o Firebase deve conectar corretamente ao projeto `vireiestatistica-ba7c5` em vez de tentar conectar ao `demo-project`.
