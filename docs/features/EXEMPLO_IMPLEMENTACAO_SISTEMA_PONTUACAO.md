# 📋 Exemplo de Implementação do Sistema de Pontuação v2.0

## Visão Geral

Este documento demonstra como implementar o novo sistema de pontuação (v2.0) em um jogo da plataforma AvaliaNutri.

## 🎮 Implementação Básica

### 1. Importação do Hook

```typescript
import { useAdvancedScoring } from '@/hooks/useAdvancedScoring'
import { ScoreDisplay } from '@/components/scoring/ScoreDisplay'
import { EnhancedFinalScoreDisplay } from '@/components/games/EnhancedFinalScoreDisplay'
```

### 2. Configuração do Hook

```typescript
const ExemploJogo = () => {
  const scoring = useAdvancedScoring({
    gameId: 1,
    totalQuestions: 10,
    difficulty: 'medio',
    isCollaborative: false
  })
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [hintsUsed, setHintsUsed] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)
  
  // ... resto do componente
}
```

### 3. Registro de Respostas

```typescript
const handleAnswer = (isCorrect: boolean) => {
  const timeSpent = (Date.now() - questionStartTime) / 1000
  
  // Registra a resposta no sistema de pontuação
  scoring.recordAnswer(isCorrect, timeSpent, hintsUsed)
  
  // Avança para próxima questão ou finaliza jogo
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(prev => prev + 1)
    setQuestionStartTime(Date.now())
    setHintsUsed(0)
  } else {
    // Finaliza o jogo
    const finalScore = scoring.calculateFinalScore()
    setGameFinished(true)
    console.log('Pontuação final:', finalScore)
  }
}
```

### 4. Uso de Dicas

```typescript
const handleHintUsed = () => {
  setHintsUsed(prev => prev + 1)
  // Dica será computada automaticamente na penalização
}
```

### 5. Exibição da Pontuação Final

```typescript
{gameFinished && scoring.scoreCalculation && (
  <EnhancedFinalScoreDisplay
    gameId={1}
    gameTitle="Exemplo de Jogo"
    score={scoring.scoreCalculation.finalScore}
    maxScore={1000}
    timeElapsed={totalTimeElapsed}
    accuracy={scoring.getAccuracy()}
    onRestart={() => {
      scoring.resetScoring()
      setGameFinished(false)
      setCurrentQuestion(0)
    }}
    onComplete={() => router.push('/jogos')}
    scoreCalculation={scoring.scoreCalculation}
    showAdvancedScoring={true}
  />
)}
```

## 📊 Entendendo os Cálculos

### Exemplo de Cálculo Completo

Para um jogo com 10 questões, onde o estudante:
- Acertou 8 questões
- Teve tempo médio de 25 segundos
- Conseguiu sequência máxima de 5 acertos
- Dificuldade média
- Usou 2 dicas

**Cálculo:**
```
Pontuação Base: 8 × 100 = 800 pontos
Bônus de Tempo: 8 × 15 = 120 pontos (respostas rápidas)
Bônus de Sequência: 40 pontos (5 acertos seguidos)
Bônus de Dificuldade: 8 × 25 = 200 pontos (nível médio)
Penalidade por Dicas: 2 × 10 = 20 pontos

Pontuação Final: 800 + 120 + 40 + 200 - 20 = 1140 pontos
Pontuação Normalizada: ~76% (Muito Bom)
```

## 🎯 Boas Práticas

### 1. Configuração de Dificuldade

```typescript
const getDifficultyFromQuestion = (question: Question): 'muito-facil' | 'facil' | 'medio' | 'dificil' | 'muito-dificil' => {
  // Baseado na complexidade da questão
  if (question.complexity <= 2) return 'facil'
  if (question.complexity <= 4) return 'medio'
  if (question.complexity <= 6) return 'dificil'
  return 'muito-dificil'
}
```

### 2. Feedback Visual Durante o Jogo

```typescript
const FeedbackPontuacao = () => {
  const { currentScore, streak, getAccuracy } = scoring
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between">
        <span>Pontuação: {currentScore}</span>
        <span>Sequência: {streak}</span>
        <span>Precisão: {getAccuracy()}%</span>
      </div>
    </div>
  )
}
```

### 3. Validação de Dados

```typescript
const validateScoringData = (metrics: QuestionMetrics[]) => {
  return metrics.every(metric => 
    metric.timeSpent > 0 && 
    metric.hintsUsed >= 0 && 
    metric.attempts >= 1
  )
}
```

## 🔧 Personalização Avançada

### 1. Ajuste de Bonificações

```typescript
// Para jogos mais difíceis, pode-se ajustar as bonificações
const CustomScoringConfig = {
  timeBonus: {
    fast: 30,    // Ao invés de 25
    normal: 10   // Ao invés de 5
  },
  difficultyBonus: {
    'muito-dificil': 100  // Ao invés de 75
  }
}
```

### 2. Conquistas Personalizadas

```typescript
const checkCustomAchievements = (scoreCalculation: ScoreCalculation) => {
  const achievements = []
  
  if (scoreCalculation.timeBonus > 200) {
    achievements.push({
      title: 'Relâmpago',
      description: 'Respondeu todas muito rapidamente',
      icon: '⚡'
    })
  }
  
  if (scoreCalculation.breakdown.hintsUsed === 0) {
    achievements.push({
      title: 'Autodidata',
      description: 'Completou sem usar dicas',
      icon: '🧠'
    })
  }
  
  return achievements
}
```

## 📈 Monitoramento e Analytics

### 1. Coleta de Métricas

```typescript
const trackGameMetrics = (scoreCalculation: ScoreCalculation) => {
  // Enviar para serviço de analytics
  analytics.track('game_completed', {
    game_id: gameId,
    final_score: scoreCalculation.finalScore,
    normalized_score: scoreCalculation.normalizedScore,
    performance_rating: scoreCalculation.performance.rating,
    time_bonus: scoreCalculation.timeBonus,
    streak_bonus: scoreCalculation.streakBonus,
    difficulty_bonus: scoreCalculation.difficultyBonus,
    hints_used: scoreCalculation.breakdown.hintsUsed,
    accuracy: scoreCalculation.breakdown.accuracy
  })
}
```

### 2. Comparação de Desempenho

```typescript
const comparePerformance = (currentScore: ScoreCalculation, historicalData: ScoreCalculation[]) => {
  const averageNormalizedScore = historicalData.reduce((sum, score) => 
    sum + score.normalizedScore, 0) / historicalData.length
  
  const improvement = currentScore.normalizedScore - averageNormalizedScore
  
  return {
    improvement,
    isImproving: improvement > 0,
    message: improvement > 0 
      ? `Melhoria de ${improvement.toFixed(1)}% em relação à média!`
      : `${Math.abs(improvement).toFixed(1)}% abaixo da média pessoal`
  }
}
```

## 🎨 Personalização Visual

### 1. Tema Personalizado

```typescript
const CustomTheme = {
  colors: {
    excellent: '#10B981',
    good: '#3B82F6',
    average: '#F59E0B',
    poor: '#EF4444'
  },
  emojis: {
    excellent: '🌟',
    good: '👍',
    average: '📚',
    poor: '💪'
  }
}
```

### 2. Animações Personalizadas

```typescript
const AnimatedScoreDisplay = ({ score }: { score: number }) => {
  const [displayScore, setDisplayScore] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < score) {
          return Math.min(prev + 10, score)
        }
        clearInterval(interval)
        return prev
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [score])
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="text-4xl font-bold">{displayScore}</span>
    </motion.div>
  )
}
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Pontuação não está sendo calculada corretamente**
   - Verifique se as métricas estão sendo registradas corretamente
   - Confirme se os tipos de dificuldade estão corretos

2. **Normalização inconsistente**
   - Garanta que o número total de questões está correto
   - Verifique se não há valores negativos nas métricas

3. **Performance lenta**
   - Use useCallback para funções que não mudam
   - Considere memoização para cálculos complexos

### Depuração

```typescript
const debugScoring = (scoring: any) => {
  console.log('Métricas das questões:', scoring.questionMetrics)
  console.log('Pontuação atual:', scoring.currentScore)
  console.log('Sequência atual:', scoring.streak)
  console.log('Precisão:', scoring.getAccuracy())
  console.log('Tempo médio:', scoring.getAverageTime())
}
```

---

**Desenvolvido por Ellis Abhulime - Unicamp**
*Sistema de pontuação v2.0 - Equilibrado, consistente e transparente*