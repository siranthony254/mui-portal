'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function AccordionItem({ title, children, defaultOpen = false, className = '' }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={cn('w-5 h-5 text-gray-500 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-gray-50 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

interface AccordionProps {
  children: React.ReactNode
  className?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}
