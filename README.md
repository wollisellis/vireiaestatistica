# VireiEstatística - Plataforma Interativa de Aprendizado de Bioestatística

> **Uma plataforma educacional inovadora para aprender bioestatística através de jogos interativos e exemplos do mundo real da pesquisa em nutrição e ciências do esporte.**

Criado por **Ellis Wollis Malta Abhulime** - Mestrando em Nutrição, Esporte e Metabolismo na Unicamp (Universidade Estadual de Campinas)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.19.1-purple)](https://www.framer.com/motion/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## 🎯 Visão Geral do Projeto

VireiEstatística é uma plataforma abrangente de aprendizado baseada na web, projetada especificamente para educação em bioestatística em programas de nutrição e ciências do esporte. A plataforma transforma o aprendizado estatístico tradicional através de:

- **22 Jogos Progressivos**: De estatística descritiva básica a métodos epidemiológicos avançados
- **Abordagem Ultra-Iniciante**: Assumindo zero conhecimento prévio com analogias do dia a dia
- **Localização Completa em Português**: Interface e conteúdo totalmente em português brasileiro
- **Modo Visitante**: Acesso de demonstração sem necessidade de cadastro
- **Conjuntos de Dados Reais**: Dados autênticos de pesquisa em nutrição e ciências do esporte
- **Visualizações Interativas**: Gráficos dinâmicos e animações para melhor compreensão de conceitos
- **Aprendizado Gamificado**: Pontos, conquistas e acompanhamento de progresso para aumentar o engajamento
- **Design Responsivo**: Experiência perfeita em desktop e dispositivos móveis

## 🚀 Stack Tecnológico

- **Frontend**: Next.js 15.3.4 com TypeScript e App Router
- **Autenticação**: Sistema dual Firebase + Mock Auth com modo visitante
- **Banco de Dados**: Cloud Firestore para sincronização em tempo real
- **Estilização**: Tailwind CSS 4.0 com sistema de design customizado
- **Animações**: Framer Motion 12.19.1 para transições suaves
- **Gráficos**: Recharts 3.0 para visualização de dados estatísticos
- **Formulários**: React Hook Form com validação Zod
- **Ícones**: Lucide React para interface consistente
- **Estado**: Zustand para gerenciamento de estado global
- **Internacionalização**: Sistema de traduções completo em português

## 📚 Conteúdo Educacional

### Filosofia Pedagógica

**Abordagem Ultra-Iniciante**: A plataforma assume zero conhecimento estatístico prévio, utilizando:
- **Analogias do Dia a Dia**: Cada conceito é explicado através de situações familiares
- **Linguagem Simples**: Terminologia técnica introduzida gradualmente com explicações claras
- **Exemplos Brasileiros**: Contextos de nutrição e esporte relevantes para estudantes brasileiros
- **Progressão Cuidadosa**: Cada jogo prepara para o próximo, construindo conhecimento passo a passo

### Catálogo Completo de Jogos (22 Jogos)

#### **🟢 Fundamentos (Muito Fácil)**
- **Jogo 11**: Introdução aos Dados - Tipos de variáveis e conceitos básicos
- **Jogo 12**: Amostragem e População - Conceitos fundamentais de pesquisa
- **Jogo 15**: Probabilidade Básica - Fundamentos de probabilidade com exemplos cotidianos

#### **🔵 Estatística Descritiva (Fácil)**
- **Jogo 3**: Tendência Central - Média, mediana e moda com dados nutricionais
- **Jogo 4**: Desvio Padrão - Variabilidade usando métricas de desempenho esportivo
- **Jogo 5**: Distribuição Normal - Propriedades e aplicações em contextos nutricionais

#### **🟡 Estatística Inferencial (Médio)**
- **Jogo 1**: Valor-p - Significância estatística em estudos nutricionais
- **Jogo 2**: Correlação de Spearman - Relações entre variáveis de desempenho atlético
- **Jogo 6**: Testes t - Intervenções nutricionais e comparações de grupos
- **Jogo 7**: Qui-quadrado - Associações entre variáveis categóricas em esportes
- **Jogo 8**: ANOVA - Comparações múltiplas em estudos nutricionais
- **Jogo 9**: Regressão Linear - Modelos preditivos para variáveis nutricionais
- **Jogo 10**: Intervalos de Confiança - Estimativas populacionais

#### **🟠 Métodos Avançados (Difícil)**
- **Jogo 31**: Controle de Qualidade de Dados - Identificação e correção de problemas
- **Jogo 33**: Conceitos Estatísticos (Matching) - Associação de conceitos com aplicações
- **Jogo 34**: Simulações para Iniciantes - Exploração interativa de conceitos

#### **🔴 Jogos Interativos Avançados (Muito Difícil)**
- **Jogo 35**: Seleção de Testes Estatísticos - Matching de situações com análises apropriadas
- **Jogo 36**: Simulações Estatísticas Interativas - Manipulação de parâmetros em tempo real
- **Jogo 37**: Reconhecimento de Conceitos - Identificação de problemas estatísticos
- **Jogo 38**: Kappa de Cohen - Concordância entre avaliadores com interpretação

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- npm ou yarn como gerenciador de pacotes
- Projeto Firebase (opcional - plataforma funciona com autenticação mock)

### Configuração para Desenvolvimento Local

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/wollisellis/vireiestatistica.git
   cd bioestat-platform
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o Firebase (Opcional):**
   - Crie um projeto Firebase em [console.firebase.google.com](https://console.firebase.google.com)
   - Ative Authentication (provedor Email/Password)
   - Crie um banco Firestore
   - Copie sua configuração Firebase

4. **Configure variáveis de ambiente (Opcional):**
   Crie um arquivo `.env.local` no diretório raiz:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Abra seu navegador:**
   Navegue para [http://localhost:3000](http://localhost:3000)

### 🎯 Modo Visitante (Demonstração)

A plataforma inclui um **modo visitante** que permite acesso completo sem cadastro:
- Clique em "Continuar como Visitante" na tela de login
- Acesso a todos os 22 jogos
- Progresso temporário salvo durante a sessão
- Ideal para demonstrações e avaliação da plataforma

## 🎮 Funcionalidades

### 🔐 Sistema de Autenticação Dual
- Registro e login seguro de usuários
- Integração Firebase Authentication
- **Modo Visitante**: Acesso sem cadastro para demonstrações
- Sessões persistentes de usuário
- Gerenciamento de perfil

### 📊 Dashboard Interativo
- Acompanhamento de progresso em tempo real
- Estatísticas de desempenho e análises
- Sistema de conquistas com badges
- Recomendações de aprendizado personalizadas
- Indicadores visuais de conclusão

### 🎯 Aprendizado Baseado em Jogos
- **22 Jogos Progressivos**: Dificuldade crescente cuidadosamente planejada
- **Feedback Imediato**: Explicações detalhadas após cada resposta
- **Manipulação Interativa**: Simulações com parâmetros ajustáveis
- **Cenários do Mundo Real**: Aplicações em nutrição e ciências do esporte
- **Analogias do Dia a Dia**: Conceitos complexos explicados de forma simples

### 🌐 Localização Completa em Português
- Interface totalmente em português brasileiro
- Terminologia científica com explicações acessíveis
- Exemplos contextualizados para estudantes brasileiros
- Abordagem cultural apropriada para o ensino superior brasileiro

### 📱 Design Responsivo
- Abordagem mobile-first
- Interações otimizadas para toque
- Otimizado para tablets e smartphones
- Experiência consistente em todos os dispositivos

### 🎓 Integração Acadêmica
- Baseado na Apostila_Estat_2022.pdf (currículo universitário)
- Alinhado com padrões de bioestatística para nutrição
- Progressão pedagógica cientificamente fundamentada
- Adequado para cursos de graduação e pós-graduação

## 🔧 Comandos de Desenvolvimento

```bash
# Servidor de desenvolvimento (sem Turbopack - mais estável)
npm run dev

# Build para produção
npm run build

# Servidor de produção
npm start

# Linting
npm run lint

# Verificação de tipos TypeScript
npx tsc --noEmit

# Limpar cache (se houver problemas)
# Windows PowerShell:
Remove-Item -Recurse -Force .next
# Linux/Mac:
rm -rf .next
```

## 🚨 Solução de Problemas

### Erro Turbopack Runtime
Se encontrar o erro "Cannot find module '../chunks/ssr/[turbopack]_runtime.js'":

1. **✅ CORRIGIDO**: O script `dev` foi alterado para usar webpack estável
2. **Limpar cache**: Execute o comando de limpeza acima
3. **Reinstalar**: `npm install`

### Problemas de Autenticação
- **Modo Visitante**: Sempre disponível como fallback
- **Firebase**: Configuração opcional - plataforma funciona com mock auth
- **Persistência**: Progresso salvo localmente para visitantes

## 📖 Contexto Acadêmico e Currículo

Esta plataforma foi desenvolvida como parte dos estudos avançados em Nutrição, Esporte e Metabolismo na Unicamp, especificamente projetada para apoiar o currículo do curso de Bioestatística. A plataforma atende à necessidade de:

### Estrutura Pedagógica Baseada em Apostila_Estat_2022.pdf

```
🟢 Fundamentos (Muito Fácil) - Zero conhecimento assumido
├── Jogo 11: Introdução aos Dados
├── Jogo 12: Amostragem e População
└── Jogo 15: Probabilidade Básica

🔵 Estatística Descritiva (Fácil)
├── Jogo 3: Tendência Central
├── Jogo 4: Desvio Padrão
└── Jogo 5: Distribuição Normal

🟡 Estatística Inferencial (Médio)
├── Jogo 1: Valor-p
├── Jogo 2: Correlação de Spearman
├── Jogo 6: Testes t
├── Jogo 7: Qui-quadrado
├── Jogo 8: ANOVA
├── Jogo 9: Regressão Linear
└── Jogo 10: Intervalos de Confiança

🟠 Métodos Avançados (Difícil)
├── Jogo 31: Controle de Qualidade
├── Jogo 33: Conceitos Estatísticos
└── Jogo 34: Simulações para Iniciantes

🔴 Aplicações Interativas (Muito Difícil)
├── Jogo 35: Seleção de Testes Estatísticos
├── Jogo 36: Simulações Estatísticas Interativas
├── Jogo 37: Reconhecimento de Conceitos
└── Jogo 38: Kappa de Cohen e Concordância
```

### Princípios Educacionais
- **Aprendizado Interativo**: Superando a educação estatística tradicional baseada em palestras
- **Aplicação do Mundo Real**: Usando dados autênticos de pesquisa em nutrição e ciências do esporte
- **Acessibilidade**: Tornando conceitos estatísticos complexos acessíveis para estudantes
- **Engajamento**: Gamificando o processo de aprendizado para melhorar retenção e compreensão
- **Abordagem Ultra-Iniciante**: Assumindo zero conhecimento prévio com analogias do dia a dia

## 🤝 Contribuindo

Contribuições são bem-vindas de educadores, desenvolvedores e pesquisadores! Veja nossas [Diretrizes de Contribuição](CONTRIBUTING.md) para detalhes sobre:

### Como Contribuir
1. **Fork o repositório**
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit suas mudanças** (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push para a branch** (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

### Diretrizes Importantes
- **Mantenha a abordagem ultra-iniciante** - sempre assuma zero conhecimento prévio
- **Use português brasileiro** - interface e conteúdo em pt-BR
- **Inclua exemplos brasileiros** - contextos de nutrição e esporte relevantes
- **Teste em ambos os modos** - visitante e autenticado
- **Documente novas funcionalidades** - README e comentários no código
- **Padrões de código** - siga as convenções TypeScript/React estabelecidas
- **Processo de Pull Request** - descreva claramente as mudanças
- **Relatório de problemas** - use templates de issue
- **Sugestões de funcionalidades** - alinhadas com objetivos educacionais
- **Contribuições de conteúdo educacional** - baseadas em evidências científicas

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍🎓 Autor e Afiliação Acadêmica

**Ellis Wollis Malta Abhulime**
- 🎓 Mestrando em Nutrição, Esporte e Metabolismo
- 🏛️ Universidade Estadual de Campinas (Unicamp)
- 📧 Email: [elliswollismalta@gmail.com](mailto:elliswollismalta@gmail.com)
- 💻 GitHub: [@wollisellis](https://github.com/wollisellis)
- 🔬 Área de Pesquisa: Bioestatística aplicada à nutrição e ciências do esporte

## 🙏 Agradecimentos

- **Faculdade de Ciências Aplicadas da Unicamp** pelo suporte acadêmico
- **Professores do curso de Bioestatística** pela orientação curricular
- **Comunidade open-source** pelas excelentes ferramentas e bibliotecas
- **Pesquisadores em nutrição e ciências do esporte** cujos dados tornam esta plataforma possível
- **Estudantes beta-testers** pelo feedback valioso durante o desenvolvimento
- **Orientadores acadêmicos** pela supervisão e direcionamento científico

## 🔗 Links Úteis

- **🌐 Demo ao Vivo**: [Em Breve]
- **📚 Documentação**: [GitHub Wiki](https://github.com/wollisellis/vireiestatistica/wiki)
- **🐛 Problemas**: [GitHub Issues](https://github.com/wollisellis/vireiestatistica/issues)
- **💬 Discussões**: [GitHub Discussions](https://github.com/wollisellis/vireiestatistica/discussions)
- **📖 Apostila Base**: Apostila_Estat_2022.pdf (currículo de referência)

## 🎯 Status do Projeto

- ✅ **22 Jogos Funcionais** - Todos testados e operacionais
- ✅ **Modo Visitante** - Acesso sem cadastro implementado
- ✅ **Localização Completa** - Interface 100% em português brasileiro
- ✅ **Sistema de Progresso** - Acompanhamento visual implementado
- ✅ **Abordagem Ultra-Iniciante** - Zero conhecimento assumido
- ✅ **Responsivo** - Funciona em desktop e mobile
- ✅ **Turbopack Fix** - Erro de runtime resolvido

---

**Feito com ❤️ para o avanço da educação em bioestatística na nutrição e ciências do esporte**

*"Assumimos zero conhecimento, construímos compreensão completa"* ✨

### 🚀 Próximos Passos
- [ ] Deploy em produção
- [ ] Integração com LMS universitários
- [ ] Expansão para outros cursos de saúde
- [ ] Análise de dados de uso para melhorias
- [ ] Publicação científica sobre eficácia pedagógica
