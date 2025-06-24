import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return score.toLocaleString()
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function calculatePercentage(score: number, maxScore: number): number {
  return Math.round((score / maxScore) * 100)
}

export function getDifficultyColor(level: number): string {
  if (level <= 5) return 'text-green-600'
  if (level <= 10) return 'text-yellow-600'
  if (level <= 15) return 'text-orange-600'
  return 'text-red-600'
}

export function getDifficultyLabel(level: number): string {
  if (level <= 5) return 'Beginner'
  if (level <= 10) return 'Intermediate'
  if (level <= 15) return 'Advanced'
  return 'Expert'
}
