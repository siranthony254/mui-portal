interface BadgeProps {
  icon?: React.ReactNode
  title: string
  description?: string
  earned?: boolean
  color?: 'teal' | 'amber' | 'purple' | 'sky'
  className?: string
}

export function Badge({ 
  icon, 
  title, 
  description, 
  earned = true,
  color = 'teal',
  className = ''
}: BadgeProps) {
  const colors = {
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
      icon: 'text-teal-600'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: 'text-amber-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    sky: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      icon: 'text-sky-600'
    }
  }

  const theme = colors[color]

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        earned 
          ? `${theme.bg} ${theme.border} ${theme.text} hover:shadow-lg hover:scale-105` 
          : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 grayscale'
      } ${className}`}
    >
      {icon && (
        <div className={`w-12 h-12 rounded-full ${earned ? theme.bg : 'bg-gray-200'} flex items-center justify-center mb-3 ${earned ? theme.icon : 'text-gray-400'}`}>
          {icon}
        </div>
      )}
      <h3 className="font-bold text-sm">{title}</h3>
      {description && (
        <p className="text-xs mt-1 opacity-80">{description}</p>
      )}
      {!earned && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs">🔒</span>
          </div>
        </div>
      )}
    </div>
  )
}
