'use client'

import React from 'react'
import { StudentProgressProvider, useStudentProgress } from '@/contexts/StudentProgressContext'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function TestComponent() {
  const { progress, updateGameScore } = useStudentProgress()

  const handleTestScore = () => {
    updateGameScore({
      gameId: 1,
      score: 85,
      maxScore: 100,
      timeElapsed: 300,
      completedAt: new Date(),
      exercisesCompleted: 8,
      totalExercises: 8,
      difficulty: 'Muito Fácil'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1 className="text-2xl font-bold">Teste do Context Provider</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Progresso Atual:</h3>
              <p>Total Score: {progress.totalScore}</p>
              <p>Games Completed: {progress.gamesCompleted}</p>
              <p>Average Score: {progress.averageScore}%</p>
            </div>
            
            <Button onClick={handleTestScore}>
              Testar Atualização de Score
            </Button>
            
            <div>
              <h3 className="font-semibold">Game Scores:</h3>
              {progress.gameScores.map((score, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded mt-2">
                  <p>Game {score.gameId}: {score.score}/{score.maxScore}</p>
                  <p>Time: {score.timeElapsed}s</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TestContextPage() {
  return (
    <StudentProgressProvider>
      <TestComponent />
    </StudentProgressProvider>
  )
}
