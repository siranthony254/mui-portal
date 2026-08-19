interface ProgressBarProps {
  progress: number
  color?: 'teal' | 'amber' | 'purple' | 'sky'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ 
  progress, 
  color = 'teal', 
  showLabel = false,
  className = ''
}: ProgressBarProps) {
  const colors = {
    teal: 'from-teal-600 to-teal-400',
    amber: 'from-amber-600 to-amber-400',
    purple: 'from-purple-600 to-purple-400',
    sky: 'from-sky-600 to-sky-400'
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-gray-600">Progress</span>
        )}
        <span className="text-xs font-semibold text-gray-900">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  )
}
