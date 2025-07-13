'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
}

interface SelectTriggerProps {
  children: React.ReactNode
  className?: string
}

interface SelectContentProps {
  children: React.ReactNode
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
}

interface SelectValueProps {
  placeholder?: string
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')

  const handleSelect = (itemValue: string) => {
    setSelectedValue(itemValue)
    onValueChange?.(itemValue)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              'aria-expanded': isOpen,
            })
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect,
              selectedValue,
            })
          }
        }
        return null
      })}
    </div>
  )
}

export function SelectTrigger({ children, className = '', ...props }: SelectTriggerProps & any) {
  return (
    <button
      type="button"
      className={`w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  )
}

export function SelectContent({ children, onSelect, selectedValue }: SelectContentProps & any) {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            onSelect,
            isSelected: child.props.value === selectedValue,
          })
        }
        return child
      })}
    </div>
  )
}

export function SelectItem({ value, children, onSelect, isSelected }: SelectItemProps & any) {
  return (
    <div
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
        isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
      }`}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: SelectValueProps) {
  return <span className="text-gray-500">{placeholder}</span>
}
