'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from './Card'

interface InfoButtonProps {
  title: string
  content: string | React.ReactNode
  symbol?: string
  formula?: string
  example?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function InfoButton({ 
  title, 
  content, 
  symbol, 
  formula, 
  example, 
  size = 'md',
  className = '' 
}: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center ${buttonSizeClasses[size]} rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ${className}`}
        title={`Mais informações sobre: ${title}`}
      >
        <Info className={sizeClasses[size]} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Symbol Display */}
                    {symbol && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {symbol}
                        </div>
                        <div className="text-sm text-gray-600">Símbolo</div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="text-gray-700">
                      {typeof content === 'string' ? (
                        <p>{content}</p>
                      ) : (
                        content
                      )}
                    </div>

                    {/* Formula */}
                    {formula && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-2">Fórmula:</div>
                        <div className="font-mono text-center text-lg">
                          {formula}
                        </div>
                      </div>
                    )}

                    {/* Example */}
                    {example && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-700 mb-2">Exemplo:</div>
                        <div className="text-sm text-green-800">
                          {example}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
