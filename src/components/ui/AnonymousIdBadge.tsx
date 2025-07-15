import React from 'react'
import { User, Hash } from 'lucide-react'

interface AnonymousIdBadgeProps {
  anonymousId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'student' | 'professor'
  showIcon?: boolean
  className?: string
}

export function AnonymousIdBadge({ 
  anonymousId, 
  size = 'md', 
  variant = 'default',
  showIcon = true,
  className = '' 
}: AnonymousIdBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const variantClasses = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    professor: 'bg-purple-50 text-purple-700 border-purple-200'
  }

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`
      inline-flex items-center gap-1.5 
      font-mono font-semibold 
      border rounded-full
      ${sizeClasses[size]} 
      ${variantClasses[variant]}
      ${className}
    `}>
      {showIcon && (
        <Hash className={iconSize[size]} />
      )}
      <span>{anonymousId}</span>
    </div>
  )
}

// Component for displaying student name with anonymous ID
interface StudentDisplayProps {
  name: string
  anonymousId: string
  email?: string
  showEmail?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical'
}

export function StudentDisplay({ 
  name, 
  anonymousId, 
  email,
  showEmail = false,
  size = 'md',
  layout = 'horizontal'
}: StudentDisplayProps) {
  const nameSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  if (layout === 'vertical') {
    return (
      <div className="text-center">
        <div className={`font-medium text-gray-900 ${nameSize[size]}`}>
          {name}
        </div>
        <div className="mt-1">
          <AnonymousIdBadge 
            anonymousId={anonymousId} 
            size={size} 
            variant="student"
          />
        </div>
        {showEmail && email && (
          <div className="text-xs text-gray-500 mt-1 truncate">
            {email}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className={`font-medium text-gray-900 ${nameSize[size]}`}>
          {name}
        </div>
        {showEmail && email && (
          <div className="text-xs text-gray-500 truncate">
            {email}
          </div>
        )}
      </div>
      <AnonymousIdBadge 
        anonymousId={anonymousId} 
        size={size} 
        variant="student"
      />
    </div>
  )
}

// Component for personalized greeting
interface PersonalizedGreetingProps {
  name: string
  role?: 'student' | 'professor'
  anonymousId?: string
  showId?: boolean
  className?: string
}

export function PersonalizedGreeting({ 
  name, 
  role = 'student',
  anonymousId,
  showId = true,
  className = ''
}: PersonalizedGreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    
    if (hour < 12) {
      return 'Bom dia'
    } else if (hour < 18) {
      return 'Boa tarde'
    } else {
      return 'Boa noite'
    }
  }

  const rolePrefix = role === 'professor' ? 'Prof. ' : ''

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-gray-700">
        {getTimeBasedGreeting()}, <span className="font-semibold text-blue-600">
          {rolePrefix}{name}
        </span>!
      </span>
      {showId && anonymousId && role === 'student' && (
        <AnonymousIdBadge 
          anonymousId={anonymousId} 
          size="sm" 
          variant="student"
        />
      )}
    </div>
  )
}
