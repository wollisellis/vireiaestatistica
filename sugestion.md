# Relatório Consultivo: Plataforma AvaliaNutri - Versão Atualizada

## Visão Geral

Este documento apresenta o plano completo e atualizado para a plataforma educacional AvaliaNutri, incorporando:
- Sistema de colaboração simplificado (sem necessidade de conexão simultânea)
- 4 módulos baseados nas aulas fornecidas
- Integração com dados reais brasileiros (POF 2024, SISVAN, IBGE)
- Sistema completo de gamificação e avaliação

## Parte 1: Estrutura dos 4 Módulos Principais

### Módulo 1 - Introdução à Avaliação Nutricional
**Objetivo:** Compreender os fundamentos da avaliação nutricional e sua importância na prática clínica.

**Conteúdo Base (Aula 2):**
- Conceitos fundamentais de avaliação nutricional
- Diferenças entre avaliação individual e populacional
- Componentes da avaliação: anamnese, antropometria, exames laboratoriais
- Importância do diagnóstico nutricional

**Exercícios Práticos:**
1. **Quiz Conceitual (10 questões):** Definições e importância da avaliação nutricional
2. **Exercício de Classificação:** Arrastar componentes para categorias (Individual vs Populacional)
3. **Caso Clínico Introdutório:** Identificar quais dados coletar em diferentes cenários
4. **Tabela Interativa:** Organizar etapas da avaliação nutricional em ordem lógica

**Dados Reais Integrados:**
- Estatísticas do SISVAN sobre estado nutricional da população brasileira
- Dados da POF 2024 sobre padrões alimentares por região
- Indicadores do DataSUS sobre prevalência de doenças nutricionais

### Módulo 2 - Métodos de Avaliação da Composição Corporal
**Objetivo:** Conhecer e comparar diferentes métodos de avaliação corporal, desde os mais simples até os padrões-ouro.

**Conteúdo Base (Aula 3):**
- Métodos padrão-ouro: DEXA, Tomografia, Ressonância
- Métodos acessíveis: Bioimpedância, Antropometria
- Vantagens e limitações de cada método
- Aplicabilidade clínica

**Exercícios Práticos:**
1. **Matching Game:** Conectar métodos com suas características
2. **Simulador de Custos:** Calcular custo-benefício de diferentes métodos
3. **Interpretação Visual:** Analisar imagens de DEXA e identificar componentes
4. **Caso Comparativo:** Escolher o método mais adequado para diferentes pacientes

**Dados Reais Integrados:**
- Tabela de custos médios dos exames no SUS e rede privada
- Disponibilidade de equipamentos por região (DataSUS)
- Estudos brasileiros comparando métodos em nossa população

### Módulo 3 - Medidas Corporais e Antropometria
**Objetivo:** Dominar as técnicas de medidas antropométricas e sua interpretação clínica.

**Conteúdo Base (Aula 4):**
- Peso e altura: técnicas corretas de aferição
- Circunferências: braço, cintura, quadril, pescoço
- Dobras cutâneas: pontos anatômicos e técnica
- Erros comuns e como evitá-los

**Exercícios Práticos:**
1. **Simulador 3D Interativo:** Identificar pontos anatômicos corretos
2. **Cálculo de IMC com Classificação:** Usando dados da POF 2024
3. **Vídeo Interativo:** Identificar erros em técnicas de medição
4. **Gráfico Dinâmico:** Plotar e interpretar medidas de circunferência

**Dados Reais Integrados:**
- Percentis de IMC da população brasileira (POF 2024)
- Pontos de corte específicos para nossa população
- Comparação com padrões internacionais da OMS

### Módulo 4 - Integração de Dados e Diagnóstico Nutricional
**Objetivo:** Integrar todos os dados coletados para formular diagnósticos nutricionais precisos.

**Conteúdo Base (Aula 5):**
- Integração de dados antropométricos
- Cálculo de índices compostos (IMC, RCQ, %GC)
- Interpretação conjunta de medidas
- Casos clínicos complexos

**Exercícios Práticos:**
1. **Caso Clínico Colaborativo Simplificado:** Diagnóstico em dupla
2. **Calculadora Integrada:** Inserir dados e obter diagnóstico
3. **Árvore de Decisão Interativa:** Seguir fluxograma diagnóstico
4. **Relatório Automatizado:** Gerar laudo nutricional completo

**Dados Reais Integrados:**
- Casos reais anonimizados do HC-UNICAMP
- Estatísticas de diagnósticos nutricionais por faixa etária (SISVAN)
- Correlações entre medidas antropométricas e desfechos clínicos

## Parte 2: Sistema de Colaboração Simplificado

### Novo Modelo de Colaboração (Sem Tempo Real)

**Como Funciona:**
1. **Iniciação:** Aluno 1 inicia o caso colaborativo e recebe um código único
2. **Compartilhamento:** Aluno 1 compartilha o código com Aluno 2 (presencialmente)
3. **Discussão Presencial:** Ambos discutem o caso juntos em sala
4. **Submissão Única:** Aluno 1 submete as respostas acordadas
5. **Pontuação Compartilhada:** Sistema atribui mesma pontuação para ambos IDs

**Vantagens:**
- Não requer conexão simultânea
- Promove discussão presencial
- Simplifica implementação técnica
- Mantém rastreabilidade via IDs

**Implementação Técnica:**
```javascript
// Estrutura no Firebase
collaborativeCases: {
  caseId: {
    initiatorId: "student1_anonymousId",
    partnerId: "student2_anonymousId",
    caseCode: "ABC123",
    responses: {},
    score: null,
    submittedAt: null
  }
}
```

## Parte 3: Funcionalidades da Área do Professor

### Dashboard Principal do Professor

1. **Visão Geral da Turma**
   - Número de alunos ativos
   - Progresso médio por módulo
   - Alertas de alunos com dificuldades

2. **Gestão de Módulos**
   - Liberar/bloquear módulos por data
   - Configurar prazos de entrega
   - Personalizar ordem dos módulos

3. **Análise de Desempenho**
   - Relatórios por questão (taxa de acerto/erro)
   - Identificação de conceitos problemáticos
   - Exportação de dados para Excel

4. **Gestão de Casos Colaborativos**
   - Visualizar duplas formadas
   - Acompanhar discussões (logs de tempo)
   - Avaliar qualidade das respostas

5. **Banco de Questões**
   - Adicionar novas questões
   - Editar questões existentes
   - Importar questões em lote

### Sistema de Redirecionamentos

```typescript
// Middleware de redirecionamento
export function redirectMiddleware(userRole: string, currentPath: string) {
  const routes = {
    student: {
      default: '/dashboard',
      restricted: ['/professor', '/admin']
    },
    professor: {
      default: '/professor/dashboard',
      restricted: ['/admin']
    },
    guest: {
      default: '/',
      restricted: ['/dashboard', '/professor', '/admin']
    }
  };
  
  return routes[userRole];
}
```

## Parte 4: Integração de Dados Reais Brasileiros

### Fontes de Dados Confirmadas

1. **POF 2024 (Pesquisa de Orçamentos Familiares)**
   - Consumo alimentar por região
   - Gastos com alimentação
   - Padrões de compra

2. **SISVAN (Sistema de Vigilância Alimentar e Nutricional)**
   - Estado nutricional por município
   - Acompanhamento de grupos vulneráveis
   - Indicadores de segurança alimentar

3. **DataSUS**
   - Internações por doenças nutricionais
   - Mortalidade relacionada à nutrição
   - Cobertura de programas nutricionais

4. **IBGE - Pesquisa Nacional de Saúde**
   - Antropometria da população
   - Prevalência de doenças crônicas
   - Hábitos alimentares

### Implementação da Integração

```typescript
// Serviço de dados reais
class BrazilianHealthDataService {
  async fetchPOFData(year: number, region?: string) {
    // Integração com API do IBGE
  }
  
  async fetchSISVANIndicators(municipality: string) {
    // Integração com SISVAN
  }
  
  async getDataSUSStatistics(indicator: string) {
    // Integração com DataSUS
  }
}
```

## Parte 5: Sistema de Gamificação Atualizado

### Elementos de Gamificação

1. **Sistema de Pontos**
   - Pontos base por questão: 100
   - Bônus por acerto sem dicas: +20%
   - Penalidade por dica: -10% por dica
   - Bônus colaborativo: +15% quando em dupla

2. **Conquistas (Badges)**
   - "Mestre da Antropometria": 100% no Módulo 3
   - "Diagnosticador Expert": 5 casos clínicos perfeitos
   - "Colaborador Exemplar": 3 casos colaborativos com nota máxima
   - "Pesquisador de Dados": Usar todos os dados reais disponíveis

3. **Rankings**
   - Individual: Por pontuação total
   - Por Módulo: Melhores em cada área
   - Colaborativo: Melhores duplas
   - Semanal: Reset para manter engajamento

4. **Desbloqueios Progressivos**
   - Módulos liberados por conclusão
   - Casos especiais por desempenho
   - Conteúdo extra por conquistas

## Parte 6: Arquitetura Técnica

### Stack Tecnológico

**Frontend:**
- Next.js 14 com App Router
- TypeScript para type safety
- Tailwind CSS para estilização
- Recharts para gráficos interativos
- React DnD para drag-and-drop

**Backend:**
- Firebase Authentication (login segmentado)
- Firestore (banco de dados flexível)
- Cloud Functions (lógica serverless)
- Storage (PDFs e imagens)

**Integrações:**
- APIs do IBGE para dados POF
- Web scraping para SISVAN
- API REST para DataSUS

### Estrutura de Dados

```typescript
// Tipos principais
interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  isLocked: boolean;
  unlockDate?: Date;
  content: Content[];
  exercises: Exercise[];
}

interface CollaborativeCase {
  id: string;
  moduleId: string;
  initiatorId: string;
  partnerId?: string;
  caseCode: string;
  startedAt: Date;
  submittedAt?: Date;
  responses: Record<string, any>;
  score?: number;
  feedback?: string;
}

interface RealDataIntegration {
  source: 'POF' | 'SISVAN' | 'DataSUS' | 'IBGE';
  year: number;
  data: any;
  lastUpdated: Date;
}
```

## Parte 7: Cronograma de Implementação

### Fase 1 - Infraestrutura Base (Semana 1-2)
- [ ] Configurar Firebase com novo schema
- [ ] Implementar sistema de autenticação
- [ ] Criar estrutura de rotas e redirecionamentos
- [ ] Desenvolver componentes base da UI

### Fase 2 - Módulos de Conteúdo (Semana 3-4)
- [ ] Implementar Módulo 1 completo
- [ ] Implementar Módulo 2 completo
- [ ] Criar sistema de exercícios interativos
- [ ] Integrar primeiros dados reais

### Fase 3 - Funcionalidades Avançadas (Semana 5-6)
- [ ] Implementar Módulos 3 e 4
- [ ] Desenvolver sistema colaborativo simplificado
- [ ] Criar dashboard completo do professor
- [ ] Implementar sistema de gamificação

### Fase 4 - Integrações e Testes (Semana 7-8)
- [ ] Integrar todas as fontes de dados reais
- [ ] Realizar testes com usuários
- [ ] Otimizar performance
- [ ] Deploy em produção

## Conclusão

Esta versão atualizada da plataforma AvaliaNutri incorpora:
- Colaboração simplificada sem necessidade de tempo real
- 4 módulos robustos baseados no conteúdo real das aulas
- Integração extensiva com dados brasileiros atualizados
- Sistema completo de gamificação e engajamento
- Área administrativa completa para professores

A plataforma está pronta para ser implementada seguindo o cronograma proposto, com foco em criar uma experiência educacional rica, interativa e baseada em dados reais relevantes para o contexto brasileiro.
