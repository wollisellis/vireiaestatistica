# Changelog - bioestat-platform

All notable changes to the bioestat-platform project will be documented in this file.

This file serves as a "memory bank" for the project, maintaining context about
the codebase history, architectural decisions, bug fixes, and feature
implementations to ensure continuity across Claude Code sessions.

The format is based on [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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