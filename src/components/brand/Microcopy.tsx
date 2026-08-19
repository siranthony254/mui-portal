import { microcopy, getMicrocopy } from '@/lib/brand/microcopy'

interface MicrocopyProps {
  category: keyof typeof microcopy
  key?: string
  className?: string
}

export function Microcopy({ category, key, className = '' }: MicrocopyProps) {
  const text = getMicrocopy(category, key)
  
  if (typeof text === 'string') {
    return <span className={className}>{text}</span>
  }
  
  // If it's an object, render as a list or handle accordingly
  if (typeof text === 'object') {
    return (
      <div className={className}>
        {Object.entries(text).map(([k, v]) => (
          <div key={k}>{v}</div>
        ))}
      </div>
    )
  }
  
  return null
}

// Specific microcopy components for common use cases
export function WelcomeMessage({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900">{microcopy.welcome.heading}</h2>
      <p className="text-gray-600 mt-2">{microcopy.welcome.subheading}</p>
    </div>
  )
}

export function EmptyState({ type, className = '' }: { type: 'tasks' | 'messages' | 'journal'; className?: string }) {
  const messages = {
    tasks: microcopy.empty.tasks,
    messages: microcopy.empty.messages,
    journal: microcopy.empty.journal,
  }
  
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-gray-500">{messages[type]}</p>
    </div>
  )
}

export function SuccessMessage({ action, className = '' }: { action: 'saved' | 'submitted' | 'updated' | 'created'; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-teal-700 ${className}`}>
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span>{microcopy.success[action]}</span>
    </div>
  )
}
