# 🚀 COMANDOS PARA CONFIGURAR GIT E DEPLOY

## **OPÇÃO 1: Se você JÁ tem um repositório no GitHub**

```bash
# 1. Adicionar o remote origin (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 2. Verificar se foi adicionado
git remote -v

# 3. Fazer push da branch master
git push -u origin master
```

## **OPÇÃO 2: Se você NÃO tem repositório no GitHub ainda**

### **2.1. Criar repositório no GitHub:**
1. Vá para https://github.com
2. Clique em "New repository"
3. Nome: `avalianutri-platform` (ou outro nome)
4. Deixe público ou privado conforme preferir
5. NÃO adicione README, .gitignore ou license (já temos)
6. Clique "Create repository"

### **2.2. Conectar repositório local:**
```bash
# Adicionar remote (use a URL que apareceu no GitHub)
git remote add origin https://github.com/SEU_USUARIO/avalianutri-platform.git

# Renomear branch para main (padrão atual do GitHub)
git branch -M main

# Fazer primeiro push
git push -u origin main
```

## **OPÇÃO 3: Comandos prontos para copiar e colar**

### **Se seu repositório GitHub usa branch 'main':**
```bash
git remote add origin https://github.com/wollisellis/avalianutri-platform.git
git branch -M main
git push -u origin main
```

### **Se seu repositório GitHub usa branch 'master':**
```bash
git remote add origin https://github.com/wollisellis/avalianutri-platform.git
git push -u origin master
```

## **VERIFICAÇÃO APÓS PUSH**

```bash
# Verificar status
git status

# Verificar remotes
git remote -v

# Verificar branches
git branch -a
```

## **PRÓXIMOS PASSOS PARA VERCEL**

### **Após push bem-sucedido:**

1. **Vá para https://vercel.com**
2. **Faça login com GitHub**
3. **Clique "New Project"**
4. **Selecione seu repositório**
5. **Configure:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Output Directory: `.next`
6. **Clique "Deploy"**

### **Variáveis de ambiente no Vercel:**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
```

## **COMANDOS DE EMERGÊNCIA**

### **Se der erro de conflito:**
```bash
# Forçar push (cuidado!)
git push -f origin main
```

### **Se precisar recriar o repositório:**
```bash
# Remover remote atual
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/SEU_USUARIO/NOVO_REPO.git

# Push
git push -u origin main
```

## **TROUBLESHOOTING**

### **Erro: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
```

### **Erro: "failed to push some refs"**
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### **Erro: "src refspec main does not match any"**
```bash
git branch -M main
git push -u origin main
```
