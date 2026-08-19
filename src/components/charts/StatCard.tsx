interface StatCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: 'teal' | 'amber' | 'purple' | 'sky'
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon,
  color = 'teal',
  className = ''
}: StatCardProps) {
  const bgColors = {
    teal: 'bg-teal-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    sky: 'bg-sky-50'
  }

  const textColors = {
    teal: 'text-teal-700',
    amber: 'text-amber-700',
    purple: 'text-purple-700',
    sky: 'text-sky-700'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  }

  return (
    <div className={`card p-6 hover:shadow-card-hover transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${trendColors[trend]}`}>
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl ${bgColors[color]} ${textColors[color]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
