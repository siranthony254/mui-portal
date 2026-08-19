'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  className?: string
}

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={className}>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700 animate-fade-in" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 animate-fade-in">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}
