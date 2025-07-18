# 🚀 COMANDOS PARA DEPLOY - AVALIANUTRI

## **1. CRIAR REPOSITÓRIO NO GITHUB**

1. Vá para: https://github.com
2. Clique em "New repository"
3. Nome: `avalianutri-platform`
4. Descrição: `Plataforma educacional para avaliação nutricional - AvaliaNutri`
5. Público
6. NÃO adicione README, .gitignore ou license
7. Clique "Create repository"

## **2. COMANDOS PARA EXECUTAR NO POWERSHELL**

```bash
# Remover remote atual (se existir)
git remote remove origin

# Adicionar o remote correto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/avalianutri-platform.git

# Fazer push
git push -u origin main
```

## **3. EXEMPLO COM SEU USUÁRIO**

Se seu usuário do GitHub for `wollisellis`:

```bash
git remote remove origin
git remote add origin https://github.com/wollisellis/avalianutri-platform.git
git push -u origin main
```

## **4. DEPLOY NO VERCEL**

### **Opção A: Via Dashboard Vercel**
1. Vá para: https://vercel.com
2. Faça login com GitHub
3. Clique "New Project"
4. Selecione o repositório `avalianutri-platform`
5. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install --legacy-peer-deps`
   - **Output Directory**: `.next`
6. Clique "Deploy"

### **Opção B: Via CLI Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## **5. CONFIGURAÇÕES IMPORTANTES NO VERCEL**

### **Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

### **Build Settings:**
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x

## **6. VERIFICAÇÃO PÓS-DEPLOY**

Teste estas URLs após o deploy:
```
https://seu-app.vercel.app/          # Deve redirecionar para /jogos
https://seu-app.vercel.app/jogos     # Lista dos 4 jogos
https://seu-app.vercel.app/jogos/1   # Jogo 1: Indicadores Antropométricos
https://seu-app.vercel.app/jogos/2   # Jogo 2: Indicadores Clínicos
https://seu-app.vercel.app/jogos/3   # Jogo 3: Fatores Socioeconômicos
https://seu-app.vercel.app/jogos/4   # Jogo 4: Curvas de Crescimento
```

## **7. TROUBLESHOOTING**

### **Se der erro de build no Vercel:**
1. Vá para o dashboard do Vercel
2. Clique no projeto
3. Vá para "Settings" > "Environment Variables"
4. Adicione: `SKIP_ENV_VALIDATION=true`
5. Redeploy

### **Se der erro de dependências:**
1. No dashboard Vercel
2. "Settings" > "General"
3. "Install Command": `npm install --legacy-peer-deps --force`
4. Redeploy

### **Se der erro 404:**
1. Verifique se o arquivo `next.config.js` está correto
2. Verifique se todas as rotas existem
3. Redeploy

## **8. COMANDOS DE EMERGÊNCIA**

### **Forçar push (se necessário):**
```bash
git push -f origin main
```

### **Recriar repositório:**
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/NOVO_REPO.git
git push -u origin main
```

### **Limpar cache do Vercel:**
1. Dashboard Vercel > Projeto
2. "Deployments" > "..." > "Redeploy"
3. Marcar "Use existing Build Cache" = OFF
4. Redeploy
