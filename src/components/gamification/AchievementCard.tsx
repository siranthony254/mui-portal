interface AchievementCardProps {
  title: string
  description: string
  icon?: React.ReactNode
  progress?: number
  total?: number
  unlocked?: boolean
  date?: string
  className?: string
}

export function AchievementCard({ 
  title, 
  description, 
  icon,
  progress = 0,
  total = 1,
  unlocked = false,
  date,
  className = ''
}: AchievementCardProps) {
  const percentage = total > 0 ? (progress / total) * 100 : 0

  return (
    <div
      className={`card p-5 relative overflow-hidden transition-all duration-300 hover:shadow-card-hover ${
        unlocked ? 'bg-gradient-to-br from-teal-50 to-white' : 'opacity-70'
      } ${className}`}
    >
      {unlocked && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="relative">
        <div className="flex items-start gap-4">
          {icon && (
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              unlocked 
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
                : 'bg-gray-200 text-gray-400'
            }`}>
              {icon}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{title}</h3>
              {unlocked && (
                <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                  Unlocked
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            
            {!unlocked && total > 1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>{progress}/{total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}
            
            {date && (
              <p className="text-xs text-gray-400 mt-2">Unlocked {date}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
