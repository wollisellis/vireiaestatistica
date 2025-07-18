# VireiEstatística - Local Development Setup

## 🎯 Current Status: ✅ FIREBASE INTEGRATED & WORKING LOCALLY

The biostatistics learning platform is now successfully running locally with Firebase authentication and database integration, plus fallback to mock authentication for development without Firebase configuration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation & Running

1. **Navigate to the project directory:**
   ```bash
   cd bioestat-platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 What You'll See

### Authentication Interface
- **Sign Up Form**: Create a new account with email, password, and full name
- **Sign In Form**: Login with existing credentials
- **Mock Authentication**: Works without requiring Supabase backend
- **Form Validation**: Real-time validation with error messages

### Dashboard (After Login)
- **Welcome Section**: Personalized greeting with user information
- **Statistics Cards**: Total score, level reached, games completed, study time
- **Progress Tracking**: Visual progress bars for overall and current level completion
- **Quick Actions**: Continue learning, review concepts, view achievements
- **Recent Games**: List of completed and available games

## 🔧 Technical Features Working

### ✅ Frontend Components
- **Responsive Design**: Works on desktop and mobile
- **Smooth Animations**: Framer Motion animations throughout
- **Modern UI**: Tailwind CSS styling with custom components
- **TypeScript**: Full type safety and IntelliSense support

### ✅ Firebase Authentication System (with Mock Fallback)
- **Real Authentication**: Firebase Auth with email/password
- **Guest Mode**: "Continuar como Visitante" button for demonstration
- **Persistent Login**: Firebase session management
- **User Profiles**: Real user data stored in Firestore
- **Progress Tracking**: Real-time progress with Firestore
- **Mock Fallback**: Automatic fallback when Firebase not configured
- **Error Handling**: Proper error states and loading indicators

### ✅ Navigation & Layout
- **Responsive Navigation**: Adaptive menu for different screen sizes
- **Protected Routes**: Authentication-based route protection
- **Loading States**: Smooth loading transitions

## 🎨 UI Components Available

### Core Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Card**: Flexible card layouts with headers, content, and footers
- **ProgressBar**: Animated progress indicators with different colors
- **Navigation**: Responsive navigation with active states

### Chart Components
- **StatChart**: Recharts-based statistical visualizations
- **Chart Types**: Bar, line, scatter, and pie charts
- **Statistical Functions**: Mean, median, mode, standard deviation calculations

## 🌐 Localization & Guest Access

### Brazilian Portuguese Interface
- **Complete Translation**: All UI text in Brazilian Portuguese (pt-BR)
- **Authentication Forms**: "Entrar", "Cadastrar", "Continuar como Visitante"
- **Dashboard**: "Bem-vindo de volta", "Progresso de Aprendizado"
- **Navigation**: "Início", "Jogos", "Progresso", "Ranking", "Aprender", "Perfil"
- **Error Messages**: Localized validation and error messages

### Guest Access Feature
- **Skip Login**: "Continuar como Visitante" button on auth page
- **Demo Mode**: Access platform without creating account
- **Mock Data**: Pre-populated progress and achievements for demonstration
- **Easy Testing**: Perfect for showcasing the platform

## 🔄 Data System (Firebase + Mock Fallback)

The application uses Firebase for real data with automatic fallback to mock data:

### Firebase Data (when configured)
- **Real Users**: Stored in Firestore `users` collection
- **Authentication**: Firebase Auth with email/password
- **Real-time Updates**: Live progress synchronization
- **Secure**: Firestore security rules protect user data

### Mock Data (fallback)
```javascript
// Regular User
{
  id: 'mock-user-123',
  email: 'ellis@example.com',
  full_name: 'Ellis Wollis Malta Abhulime',
  total_score: 1250,
  level_reached: 3,
  games_completed: 2
}

// Guest User (when using "Continuar como Visitante")
{
  id: 'guest-user',
  email: 'visitante@vireiestatistica.com',
  full_name: 'Usuário Visitante',
  total_score: 850,
  level_reached: 2,
  games_completed: 1
}
```

### Game Progress
- Nível 1: Média, Mediana e Moda (85% pontuação, concluído)
- Nível 2: Desvio Padrão e Variância (92% pontuação, concluído)
- Nível 3: Fundamentos de Visualização de Dados (não iniciado)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📁 Project Structure

```
bioestat-platform/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── auth/              # Authentication components
│   │   │   └── AuthForm.tsx
│   │   ├── layout/            # Layout components
│   │   │   ├── Layout.tsx
│   │   │   └── Navigation.tsx
│   │   ├── charts/            # Chart components
│   │   │   └── StatChart.tsx
│   │   └── Dashboard.tsx      # Main dashboard
│   ├── hooks/                 # Custom React hooks
│   │   ├── useSupabase.ts     # Supabase integration
│   │   └── useMockAuth.ts     # Mock authentication
│   ├── lib/                   # Utilities
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   └── database/              # Database schema
│       └── schema.sql         # Supabase schema
├── .env.local                 # Environment variables
└── package.json               # Dependencies
```

## 🔮 Next Steps

### Phase 2: Game Development
1. **Game Framework**: Build the core game engine
2. **First 5 Games**: Implement basic statistics games
3. **Real Datasets**: Add nutrition/sports science data
4. **Interactive Elements**: Create engaging game mechanics

### Backend Integration (Optional)
1. **Supabase Setup**: Configure real authentication
2. **Database Migration**: Run the provided SQL schema
3. **Real Progress Tracking**: Replace mock data with database

## 🐛 Known Issues & Limitations

### Current Limitations
- **Mock Data Only**: All user data is simulated
- **No Persistence**: Progress resets on browser refresh (except login state)
- **Limited Games**: Only mock game data, no actual games yet
- **No Real Charts**: Chart components ready but need real data

### Performance Notes
- **Build Time**: Initial builds may take 60-90 seconds
- **Dev Server**: Usually starts in 3-7 seconds
- **Hot Reload**: Works correctly for component changes

## 🎯 Testing the Application

### Authentication Flow
1. **Visit** http://localhost:3000
2. **Portuguese Interface**: Notice all text is in Brazilian Portuguese
3. **Guest Access**: Click "Continuar como Visitante" for immediate access
4. **Registration**: Try "Cadastrar" with email and password (6+ characters)
5. **Login**: Use "Entrar" with existing credentials
6. **Firebase/Mock**: Works with or without Firebase configuration

### Guest Mode Testing
1. Click "Continuar como Visitante" on the auth page
2. Access dashboard immediately with demo data
3. See "Usuário Visitante" profile with sample progress
4. Test all features without creating an account
5. Perfect for demonstrations and testing

### UI Components
1. **Responsive Design**: Test by resizing browser window
2. **Portuguese Text**: Verify all labels are in pt-BR
3. **Animations**: Check hover effects and transitions
4. **Navigation**: Test "Início", "Jogos", "Progresso" etc.
5. **Loading States**: Verify "Carregando..." appears correctly

## 🔧 Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Clear npm cache
npm cache clean --force
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check for compilation errors
npx tsc --noEmit
```

**Port already in use:**
```bash
# Use different port
npm run dev -- -p 3001
```

## 📞 Support

The application is now fully functional for local development and testing. All core UI components are working, authentication flow is complete, and the foundation is ready for game development in Phase 2.
