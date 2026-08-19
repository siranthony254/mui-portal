'use client'

import { useState } from 'react'

interface EmojiFeedbackProps {
  onSelect?: (emoji: string) => void
  readonly?: boolean
  selected?: string
  className?: string
}

const emojis = [
  { emoji: '😍', label: 'Excellent' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😕', label: 'Needs Work' },
  { emoji: '😔', label: 'Poor' },
]

export function EmojiFeedback({ 
  onSelect, 
  readonly = false,
  selected,
  className = ''
}: EmojiFeedbackProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {emojis.map((item) => (
        <button
          key={item.emoji}
          onClick={() => !readonly && onSelect?.(item.emoji)}
          disabled={readonly}
          className={`text-3xl transition-all hover:scale-125 hover:-translate-y-1 ${
            selected === item.emoji ? 'scale-125 -translate-y-1' : ''
          } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          title={item.label}
        >
          {item.emoji}
        </button>
      ))}
    </div>
  )
}
