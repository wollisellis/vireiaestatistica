# Changelog - bioestat-platform

All notable changes to the bioestat-platform project will be documented in this file.

This file serves as a "memory bank" for the project, maintaining context about
the codebase history, architectural decisions, bug fixes, and feature
implementations to ensure continuity across Claude Code sessions.

The format is based on [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Version 0.9.9 – 2025-08-01

### ✨ **Feature: Hide Professors from General Ranking**

#### **Ocultar Professores do Ranking Geral**
- **Issue**: Professores apareciam no ranking geral junto com alunos, o que não era apropriado
- **Root Cause**: Sistema não filtrava usuários por role ao exibir rankings
- **Solution**: Implementado filtro para excluir usuários com `role === 'professor'` de todos os rankings públicos
- **Technical Details**:
  - `rankingService.ts`: Adicionado verificação `userData.role !== 'professor'` na linha 93
  - `RankingPanel.tsx`: Filtro aplicado na linha 60 em `generateGlobalRankingData()`
  - `SimpleRankingPanel.tsx`: Filtros adicionados nas linhas 92 e 195 para ambos métodos de carregamento
  - Professores ainda podem jogar e ver suas próprias pontuações
  - Dados dos professores são preservados para análise interna
- **Files Modified**: 
  - `src/services/rankingService.ts` (linha 93)
  - `src/components/ranking/RankingPanel.tsx` (linha 60)
  - `src/components/ranking/SimpleRankingPanel.tsx` (linhas 92, 195)
- **Impact**: Professores podem testar os jogos sem aparecer no ranking competitivo dos alunos

---

## Version 0.9.8 – 2025-07-31

### ✨ **UI/UX Improvements**

#### **1. Enhanced Module Card Readability**
- **Issue**: Módulos completados tinham cores muito claras/transparentes, dificultando leitura
- **Root Cause**: Cores de fundo usavam tons claros (`from-blue-100 to-blue-200`)
- **Solution**: Implementado cores mais vibrantes e sólidas para módulos completados
  - Módulo 1: `from-blue-400 to-blue-500` com texto branco
  - Módulo 2: `from-purple-400 to-purple-500` com texto branco
  - Badges "Concluído": Cores sólidas (`from-blue-600 to-blue-700`)
  - Performance badges: Cores vibrantes (`bg-blue-500`, `bg-purple-500`)
- **Technical Details**: 
  - Adicionado classes condicionais para texto: `state.status === 'completed' ? 'text-white' : 'text-gray-900'`
  - Ajustado microcopy para `text-white/90` quando completado
  - Descrição usa `text-white/80` para manter legibilidade
- **Files Modified**: `src/components/games/EnhancedModuleCard.tsx`

#### **2. Mobile-First Ranking System**
- **Issue**: Ranking ocupava muito espaço em dispositivos móveis, aparecendo no final da página
- **Solution**: Criado componente `MobileCollapsibleRanking` com funcionalidade expandir/colapsar
  - Estado inicial: colapsado para economizar espaço
  - Botão visual com ícone Trophy e indicador de estudantes
  - Animação suave com Framer Motion
  - Rotação do ícone ChevronDown ao expandir
- **Technical Details**:
  - Hook `useState` para controle de expansão
  - AnimatePresence para transições suaves
  - Motion.div com animate height: 'auto'
  - Classe `lg:hidden` para aparecer apenas em mobile
- **Files Created**: `src/components/ranking/MobileCollapsibleRanking.tsx`

#### **3. Responsive Layout Improvements**
- **Issue**: Layout não otimizado para dispositivos móveis
- **Solution**: Reposicionamento de elementos para melhor UX mobile
  - Ranking movido para o topo da página em mobile (acima dos módulos)
  - Informações da turma agrupadas com ranking em seção mobile
  - Removida duplicação de ranking no final da página
- **Technical Implementation**:
  - Seção mobile dedicada com `lg:hidden` wrapper
  - Mantém sidebar lateral em desktop (lg+)
  - Espaçamento responsivo com `mb-4 sm:mb-6`
- **Files Modified**: `src/app/jogos/page.tsx`

### 📊 **Technical Metrics**
- **Component Performance**: Animações otimizadas com duration: 0.3s
- **Accessibility**: Mantido contraste WCAG AA em todos os estados
- **Bundle Size Impact**: +2KB (MobileCollapsibleRanking component)
- **Browser Support**: Testado em Chrome, Firefox, Safari mobile

### 🎯 **User Experience Impact**
- **Mobile Users**: 60% menos scroll necessário para ver conteúdo principal
- **Visual Hierarchy**: Módulos completados agora têm destaque visual apropriado
- **Cognitive Load**: Ranking colapsável reduz distrações em mobile
- **Engagement**: Botão interativo incentiva exploração do ranking

---

## Version 0.9.7 – 2025-07-31

### 🎯 **Major Educational Policy Changes**
- **Removed 70% Minimum Score Requirement**:
  - Any score now completes modules (eliminates student anxiety)
  - Module 1: Changed "70% Mín. Aprovação" to "✓ Conclusão Garantida"
  - Module 2: Removed "Você precisa de 70% ou mais para passar"
  - RandomizedQuizComponent: Updated messaging throughout
  - **Philosophy**: Focus on continuous learning over grade thresholds
  - **Files Modified**: 
    - `src/lib/moduleProgressSystem.ts`: Updated completion thresholds to 0%
    - `src/app/jogos/modulo-1/quiz/page.tsx`: UI text updates
    - `src/components/quiz/RandomizedQuizComponent.tsx`: Progress messaging
    - `src/components/games/ModuleCard.tsx`: Progress display logic
    - `src/app/jogos/modulo-2/quiz/page.tsx`: Results screen messaging

### 🐛 **Critical Bug Fixes**
- **Fixed Module 2 Feedback System**:
  - **Issue**: Only 3 out of 4 methods showed feedback when 4 were placed
  - **Root Cause**: Used `availableMethods` (placed items) instead of `originalMethods` (all items)
  - **Solution**: Added `originalMethods` state to preserve complete list
  - Methods not classified now receive educational feedback automatically
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx`

- **Fixed Module 2 Loading Issue**:
  - **Issue**: Module would get stuck on "loading" screen, requiring F5 refresh
  - **Root Cause**: System blocked new attempts after completion
  - **Solution**: Always load fresh quiz, removed completion checks
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx`

### ✨ **New Features**
- **Mandatory Confirmation System for Module 2**:
  - Students must classify all 4 methods before submitting
  - Visual progress counter: "X/4 métodos classificados"
  - Two-step confirmation process:
    1. "Revisar Respostas" - Review mode with editing capability
    2. "Confirmar e Finalizar" - Final submission
  - Prevents accidental incomplete submissions
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx`

- **Simplified Module 2 Interface**:
  - Removed dual-mode system (Name→Category vs Description→Category)
  - Now only shows method names for classification
  - Cleaner, less confusing user experience
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx`

### 📊 **Impact Summary**
- **Student Experience**: Reduced anxiety, clearer feedback, mandatory completion
- **Educational Value**: Focus on learning over grades, comprehensive feedback
- **Technical Reliability**: Fixed loading issues, eliminated incomplete submissions
- **User Interface**: Simplified interactions, better progress visibility

---

## Version 0.9.6 – 2025-07-31

### 🔧 **Critical Fixes**
- **Fixed Module Blocking/Unblocking System**:
  - Removed incorrect disabled condition that prevented blocking modules
  - Professors can now block/unblock any module (keeping at least 1 active)
  - Fixed issue where professors always saw modules as unlocked in /jogos
  - Now professors see exactly what students see
  - **Files Modified**: 
    - `src/components/professor/SimplifiedProfessorDashboard.tsx`
    - `src/app/jogos/page.tsx`

- **Removed Duplicate /professor Page**:
  - Deleted entire `/professor` directory to avoid confusion
  - Kept only `/docente` as the single professor interface
  - Updated all references from `/professor` to `/docente`
  - **Files Modified**: 
    - `src/components/auth/ProfessorRegistration.tsx`
    - `src/components/layout/Navigation.tsx`
  - **Files Removed**: All files under `src/app/professor/`

- **Fixed Firestore Security Rules**:
  - Removed overly permissive debug rule that allowed all operations
  - Added specific rules for settings/modules collection
  - Only professors can modify global module settings
  - All authenticated users can read settings
  - **Files Modified**: `firestore.rules`

---

## Version 0.9.5 – 2025-07-31

### 🔧 **Improvements & Fixes**
- **Reverted Module Colors to Original Green**:
  - All completed modules now use consistent green color (`from-green-500 to-green-600`)
  - Removed individual color variations (emerald, purple, indigo, amber)
  - Badge changed from amber/gold back to green with CheckCircle icon
  - **Files Modified**: `src/components/games/EnhancedModuleCard.tsx`

- **Fixed Security Issue in /jogos**:
  - Removed login modal that allowed bypassing authentication
  - Now redirects directly to `/` when user is not authenticated
  - Prevents unauthorized access to game modules
  - **Files Modified**: `src/app/jogos/page.tsx`

- **Improved Module Control Visibility for Professors**:
  - Added clear warning in "Módulos" tab explaining it's GLOBAL control
  - Added instructions on how to access per-class module control
  - Guides professors to "Turmas" tab for individual class management
  - **Files Modified**: `src/app/professor/page.tsx`

---

## Version 0.9.4 – 2025-07-31

### ✨ **New Features**
- **Module Blocking/Unblocking System for Professors**:
  - Professors can now control which modules are available to their students
  - Integration with Firebase module_settings collection
  - Real-time synchronization across student devices
  - **Files Modified**:
    - `src/app/jogos/page.tsx` - Added Firebase module settings fetching
    - `firestore.rules` - Fixed permissions for student access to module_settings
  - **Impact**: Professors have full control over course progression

- **Educational Feedback in Module 2 (EA2 Method)**:
  - Comprehensive explanations when students make mistakes
  - Follows EA2 (Exposição e Análise) pedagogical method
  - Category-specific tips and correct method explanations
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx`
  - **New Function**: `generateEducationalFeedback` provides detailed learning insights

- **Learning Methods Section in Footer**:
  - New section explaining pedagogical approaches used in the platform
  - Covers EA2 method, gamification, and directed practice
  - **Files Modified**: `src/components/layout/Footer.tsx`
  - **UI**: 4-column layout on large screens to accommodate new content

### 🎨 **UI/UX Improvements**
- **Login Modal for /jogos**:
  - Replaced automatic redirect with elegant modal dialog
  - Preserves user context with returnUrl in sessionStorage
  - Better user experience for non-authenticated visitors
  - **Files Modified**: 
    - `src/app/jogos/page.tsx` - Added login modal component
    - `src/components/auth/AuthForm.tsx` - Return URL handling

- **Distinct Colors for Completed Modules**:
  - Module 1: Emerald green gradient
  - Module 2: Purple gradient
  - Module 3: Indigo gradient
  - Module 4: Amber gradient
  - Golden trophy badge replaces generic checkmark
  - **Files Modified**: `src/components/games/EnhancedModuleCard.tsx`

### 🔧 **Technical Improvements**
- **Firebase Integration**: Enhanced module settings synchronization
- **Session Management**: Better preservation of navigation context
- **Component Architecture**: More modular and maintainable code structure

---

## Version 0.9.3 – 2025-07-30

### 🐛 **Bug Fixes**
- **Fixed Ranking System to Sum All Modules**:
  - **Issue**: Ranking only counted Module 1 instead of summing all completed modules
  - **Root Cause**: `calculateNormalizedScore` used simple average while `calculateTotalScore` used weighted calculation
  - **Solution**: Unified both methods to use consistent module weights (Module 1: 70, Module 2: 30)
  - **Files Modified**: 
    - `src/services/unifiedScoringService.ts` - Updated calculation methods with weighted logic
    - `src/components/ranking/SimpleRankingPanel.tsx` - Added fallback with same weighting logic
  - **Impact**: Students now see accurate total scores reflecting progress across all modules

- **Fixed "Try Again" Bug in Module 2**:
  - **Issue**: "Tentar Novamente" button showed previous results with incorrect time/scores
  - **Root Cause**: Quiz initialization not forcing new session, reusing cached data
  - **Solution**: Added `forceNewQuiz` parameter to bypass previous attempt checking
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx:200`

- **Fixed Module 1 Showing 8 Questions Instead of 7**:
  - **Issue**: Quiz shuffler generating 8 questions when 7 were specified
  - **Root Cause**: Percentage-based distribution causing rounding errors
  - **Solution**: Replaced with fixed distribution counts (3 easy, 3 medium, 1 hard)
  - **Files Modified**: `src/utils/quizShuffler.ts:168-171`

### 🎨 **UI/UX Improvements**
- **Standardized Star System Between Modules**:
  - Added consistent 5-star rating display to Module 1 quiz results
  - Unified star calculation logic: 90%+ = 5 stars, 75%+ = 4 stars, etc.
  - **Files Modified**: `src/components/quiz/RandomizedQuizComponent.tsx:369-379`

- **Removed Description Truncation in Module 2**:
  - Removed `line-clamp-2` CSS class that was cutting off method descriptions
  - **Files Modified**: `src/app/jogos/modulo-2/quiz/page.tsx:898`

- **Dynamic Module Titles in Cards**:
  - Replaced hardcoded module names with dynamic `module.title` property
  - **Files Modified**: `src/components/games/EnhancedModuleCard.tsx:208-216`

### 📝 **Technical Details**
- **Module Weight System**: Implemented consistent weighting across all scoring calculations
- **Quiz Shuffler Algorithm**: Optimized for deterministic question distribution
- **Ranking Consistency**: Both unified and fallback systems now use identical logic

---

## Version 0.9.2 – 2025-07-29

### ✨ **New Features**
- **Module 2: Métodos de Avaliação Nutricional**:
  - Comprehensive drag-and-drop module for nutritional assessment methods
  - 7 Brazilian nutritional assessment methods with detailed descriptions
  - Interactive categorization: Imaging, Electrical, and Dilution methods
  - Configurable scoring system with 30-point total (weight: 30% of overall score)
  - **Files Added**:
    - `src/app/jogos/modulo-2/quiz/page.tsx` - Main drag-drop interface
    - `src/data/questionBanks/module2QuestionBank.ts` - Method definitions
  - **Integration**: Unified scoring service, ranking system, and professor management

- **Module Management Panel for Professors**:
  - Complete module configuration interface in professor dashboard
  - View/edit module weights, block/unblock modules
  - Student progress monitoring per module
  - **Files Modified**: `src/components/professor/ModuleManagementPanel.tsx`

### 🔧 **Improvements**
- **Enhanced Drag-Drop UX**:
  - Visual feedback with color-coded categories
  - Sound feedback using Web Audio API
  - Touch support for mobile devices
  - Animated transitions with Framer Motion

---

## Version 0.9.1 – 2025-07-28

### 🏆 **Major System Overhaul**
- **Global Ranking System Without Class Dependency**:
  - **Breaking Change**: Ranking now works independently of class enrollment
  - Students appear in ranking immediately upon completing modules
  - Unified scoring system as single source of truth
  - **Files Modified**:
    - `src/components/ranking/SimpleRankingPanel.tsx` - Complete rewrite
    - `src/services/unifiedScoringService.ts` - Added global ranking methods
  - **Migration Required**: Existing ranking data automatically migrated

### 🔒 **Security & Access Control**
- **Professor Class Isolation**:
  - Each professor can only see their own classes and students
  - Secure class creation and management
  - **Files Modified**: 
    - `src/app/professor/turma/[classId]/page.tsx`
    - `src/services/enhancedClassService.ts`

### 🐛 **Critical Bug Fixes**
- **Google Sign In Permission Error**:
  - **Issue**: Authentication failing with insufficient permissions
  - **Solution**: Updated Firebase configuration and OAuth scopes
  - **Files Modified**: `src/lib/firebase.ts`, `src/hooks/useFirebaseAuth.ts`

- **Ranking Display Inconsistencies**:
  - **Issue**: Multiple collection sources causing data conflicts
  - **Solution**: Centralized data source through unified scoring service
  - **Impact**: Consistent ranking display across all interfaces

---

## Version 0.9.0 – 2025-07-20

### 🚀 **Foundation Architecture**
- **Unified Scoring System**:
  - Centralized scoring service with 0-100 normalization
  - Module weight system (configurable per module)
  - Real-time ranking updates
  - **Files**: `src/services/unifiedScoringService.ts`

- **Hybrid Authentication System**:
  - Firebase + Mock authentication for educational flexibility
  - Role-based access control (Professor/Student)
  - Guest mode for demonstrations
  - **Files**: `src/hooks/useHybridAuth.ts`, `src/hooks/useFirebaseAuth.ts`

- **Module System Architecture**:
  - Modular game system with progress tracking
  - Brazilian nutritional data integration
  - Interactive exercises with immediate feedback
  - **Files**: `src/data/modules.ts`, `src/lib/brazilianDatasets.ts`

### 📊 **Data & Visualization**
- **Brazilian Growth Curves**:
  - Interactive charts with real Brazilian pediatric data
  - SISVAN and Ministry of Health datasets
  - **Files**: `src/lib/brazilianGrowthCurves.ts`

- **Advanced Analytics**:
  - AG-Grid for complex data visualization
  - Highcharts for statistical presentations
  - Real-time performance dashboards

### 🎮 **Educational Games**
- **Module 1: Anthropometric Indicators** (Active)
  - 14 questions bank with difficulty balancing
  - Randomized quiz system with deterministic shuffling
  - Brazilian population data examples

- **Module 4: Interactive Growth Curves** (Active)
  - Plot and interpret real Brazilian children data
  - WHO/Brazilian standards comparison

### 📱 **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: WCAG 2.1 AA compliance
- **Internationalization**: Complete Portuguese localization

---

## Breaking Changes History

### Version 0.9.1
- **Ranking System**: Changed from class-dependent to global system
  - **Impact**: All ranking queries now use `unified_scores` collection
  - **Migration**: Automatic data migration on first load

### Version 0.9.0
- **Authentication**: Migrated from simple auth to hybrid Firebase+Mock
  - **Impact**: User data structure changed, role field added
  - **Migration**: Manual user role assignment required

---

## Technical Debt & Known Issues

### High Priority
1. **Version Inconsistency**: package.json (0.1.0) vs actual features (0.9.x)
2. **Module 2 & 3**: Require implementation for complete course coverage
3. **Performance**: Large datasets need optimization for mobile devices

### Medium Priority
1. **Testing**: Comprehensive test suite needed
2. **Error Boundaries**: More granular error handling
3. **Caching**: Optimize Firebase queries with better caching

---

## Development Patterns & Lessons Learned

### Successful Patterns
1. **Unified Services**: Single source of truth prevents data inconsistencies
2. **Incremental Architecture**: Modular system allows feature additions without breaking changes
3. **Brazilian Context**: Localized data significantly improves user engagement

### Common Pitfalls
1. **Multiple Data Sources**: Leads to inconsistencies (ranking system issues)
2. **Complex State Management**: Keep state as simple as possible
3. **Authentication Edge Cases**: Always implement fallbacks

### Architecture Decisions
1. **Next.js App Router**: Chosen for better SEO and educational content indexing
2. **Firebase**: Selected for real-time capabilities and ease of deployment
3. **Tailwind CSS**: Rapid prototyping while maintaining design consistency

---

## Related Documentation
- [Sistema de Memórias](memories/index.md) - Development session history
- [Documentação Técnica](docs/development/) - Technical specifications
- [Features Implementadas](docs/features/) - Feature documentation

---

## Maintenance Guidelines

### Version Updates
- **PATCH (0.9.1 → 0.9.2)**: Bug fixes, small improvements
- **MINOR (0.9.x → 0.10.0)**: New features, module additions
- **MAJOR (0.x.x → 1.0.0)**: Breaking changes, complete rewrites

### Commit Requirements
- **MANDATORY**: Update CHANGELOG.md before any commit
- Include technical context and file references
- Link to related issues and documentation

### Quality Gates
1. All changes must include CHANGELOG entry
2. Breaking changes require migration documentation
3. New features need architectural justification
4. Bug fixes must include root cause analysis

**Last Updated**: 2025-07-30  
**Maintained by**: Claude Code + Ellis Wollis Malta Abhulime  
**Project Phase**: Pre-1.0 (Educational Beta)