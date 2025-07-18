# Contexto do Projeto AvaliaNutri

## Visão Geral
Plataforma educacional para ensino de avaliação nutricional na UNICAMP.

## Tecnologias Principais
- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + Express
- **Autenticação**: JWT
- **Banco de Dados**: MongoDB

## Estrutura de Módulos
1. **Módulo 1**: Introdução à Avaliação Nutricional
2. **Módulo 2**: Antropometria
3. **Módulo 3**: Avaliação Bioquímica
4. **Módulo 4**: Consumo Alimentar
5. **Módulo 5**: Avaliação Clínica

## Convenções do Projeto
- Componentes React em PascalCase
- Hooks customizados prefixados com "use"
- Arquivos TypeScript com extensão .tsx para componentes
- Estilos usando Tailwind CSS classes
- Commits em português com mensagens descritivas

## Endpoints Principais
- `/api/auth/*` - Autenticação
- `/api/modules/*` - Gestão de módulos
- `/api/activities/*` - Atividades e exercícios
- `/api/progress/*` - Progresso dos alunos

## Recursos Implementados
- Sistema de pontuação gamificado
- Dashboard para professores e alunos
- Exercícios interativos
- Relatórios de progresso
- Feedback em tempo real