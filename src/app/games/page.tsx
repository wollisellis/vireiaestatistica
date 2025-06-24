'use client'

import React, { useState } from 'react'
import { GameSelection } from '@/components/games/GameSelection'
import { Game1PValue } from '@/components/games/Game1PValue'
import { Game2Spearman } from '@/components/games/Game2Spearman'
import { Game3CentralTendency } from '@/components/games/Game3CentralTendency'
import { Game4StandardDeviation } from '@/components/games/Game4StandardDeviation'
import { Game5NormalDistribution } from '@/components/games/Game5NormalDistribution'
import { Game6TTests } from '@/components/games/Game6TTests'
import { Game7ChiSquare } from '@/components/games/Game7ChiSquare'
import { Game8ANOVA } from '@/components/games/Game8ANOVA'
import { Game9LinearRegression } from '@/components/games/Game9LinearRegression'
import { Game10ConfidenceIntervals } from '@/components/games/Game10ConfidenceIntervals'
import { Game33StatisticalConceptMatching } from '@/components/games/Game33StatisticalConceptMatching'
import { Game34BeginnerSimulation } from '@/components/games/Game34BeginnerSimulation'
import { Game11IntroductionToData } from '@/components/games/Game11IntroductionToData'
import { Game12SamplingPopulation } from '@/components/games/Game12SamplingPopulation'
import { Game15BasicProbability } from '@/components/games/Game15BasicProbability'
import { Game31DataQualityControl } from '@/components/games/Game31DataQualityControl'
import { Game35StatisticalTestMatching } from '@/components/games/Game35StatisticalTestMatching'
import { Game36InteractiveStatSimulation } from '@/components/games/Game36InteractiveStatSimulation'
import { Game37ConceptRecognition } from '@/components/games/Game37ConceptRecognition'
import { Game38KappaAgreementMatching } from '@/components/games/Game38KappaAgreementMatching'
import { Layout } from '@/components/layout/Layout'

export default function GamesPage() {
  const [currentView, setCurrentView] = useState<'selection' | number>('selection')

  const handleGameSelect = (gameId: number) => {
    setCurrentView(gameId)
  }

  const handleBackToSelection = () => {
    setCurrentView('selection')
  }

  const handleGameComplete = () => {
    // Show completion message and return to selection
    setTimeout(() => {
      setCurrentView('selection')
    }, 2000)
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 1:
        return (
          <Game1PValue
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 2:
        return (
          <Game2Spearman
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 3:
        return (
          <Game3CentralTendency
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 4:
        return (
          <Game4StandardDeviation
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 5:
        return (
          <Game5NormalDistribution
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 6:
        return (
          <Game6TTests
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 7:
        return (
          <Game7ChiSquare
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 8:
        return (
          <Game8ANOVA
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 9:
        return (
          <Game9LinearRegression
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 10:
        return (
          <Game10ConfidenceIntervals
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 11:
        return (
          <Game11IntroductionToData
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 12:
        return (
          <Game12SamplingPopulation
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 15:
        return (
          <Game15BasicProbability
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 31:
        return (
          <Game31DataQualityControl
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 33:
        return (
          <Game33StatisticalConceptMatching
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 34:
        return (
          <Game34BeginnerSimulation
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 35:
        return (
          <Game35StatisticalTestMatching
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 36:
        return (
          <Game36InteractiveStatSimulation
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 37:
        return (
          <Game37ConceptRecognition
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 38:
        return (
          <Game38KappaAgreementMatching
            onBack={handleBackToSelection}
            onComplete={handleGameComplete}
          />
        )
      case 'selection':
      default:
        return <GameSelection onGameSelect={handleGameSelect} />
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </div>
    </Layout>
  )
}
