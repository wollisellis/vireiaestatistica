'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from './Badge'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

interface CountdownTimerProps {
  expiresAt: Date
  className?: string
  showIcon?: boolean
  variant?: 'badge' | 'text' | 'detailed'
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  total: number
  isExpired: boolean
}

export function CountdownTimer({ 
  expiresAt, 
  className = '', 
  showIcon = true,
  variant = 'badge' 
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    total: 0,
    isExpired: false
  })

  const calculateTimeRemaining = (targetDate: Date): TimeRemaining => {
    const now = new Date().getTime()
    const target = targetDate.getTime()
    const difference = target - now

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        total: 0,
        isExpired: true
      }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

    return {
      days,
      hours,
      minutes,
      total: days,
      isExpired: false
    }
  }

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(expiresAt))
    }

    // Atualizar imediatamente
    updateTimer()

    // Atualizar a cada minuto
    const interval = setInterval(updateTimer, 60000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const getUrgencyLevel = (): 'critical' | 'warning' | 'safe' => {
    if (timeRemaining.isExpired) return 'critical'
    if (timeRemaining.total <= 3) return 'critical'
    if (timeRemaining.total <= 7) return 'warning'
    return 'safe'
  }

  const getUrgencyColor = () => {
    const level = getUrgencyLevel()
    switch (level) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary'
      case 'safe': return 'default'
      default: return 'default'
    }
  }

  const getUrgencyIcon = () => {
    const level = getUrgencyLevel()
    switch (level) {
      case 'critical': return AlertTriangle
      case 'warning': return Clock
      case 'safe': return CheckCircle
      default: return Clock
    }
  }

  const formatTimeText = (): string => {
    if (timeRemaining.isExpired) {
      return 'Expirado'
    }

    if (timeRemaining.total === 0 && timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h restantes`
    }

    if (timeRemaining.total === 0 && timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}min restantes`
    }

    if (timeRemaining.total === 1) {
      return `1 dia restante`
    }

    return `${timeRemaining.total} dias restantes`
  }

  const formatDetailedText = (): string => {
    if (timeRemaining.isExpired) {
      return 'Turma expirada - será removida permanentemente'
    }

    const parts = []
    if (timeRemaining.total > 0) parts.push(`${timeRemaining.total} dia${timeRemaining.total !== 1 ? 's' : ''}`)
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`)
    if (timeRemaining.minutes > 0 && timeRemaining.total === 0) parts.push(`${timeRemaining.minutes}min`)

    return `${parts.join(', ')} para exclusão permanente`
  }

  const Icon = getUrgencyIcon()

  if (variant === 'text') {
    return (
      <span className={`text-sm flex items-center gap-1 ${className}`}>
        {showIcon && <Icon className="w-4 h-4" />}
        {formatTimeText()}
      </span>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && (
          <div className={`p-1 rounded-full ${
            getUrgencyLevel() === 'critical' ? 'bg-red-100 text-red-600' :
            getUrgencyLevel() === 'warning' ? 'bg-yellow-100 text-yellow-600' :
            'bg-green-100 text-green-600'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {formatTimeText()}
          </span>
          <span className="text-xs text-gray-500">
            {formatDetailedText()}
          </span>
        </div>
      </div>
    )
  }

  // Variant 'badge' (default)
  return (
    <Badge 
      variant={getUrgencyColor()} 
      className={`flex items-center gap-1 ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {formatTimeText()}
    </Badge>
  )
}

export default CountdownTimer