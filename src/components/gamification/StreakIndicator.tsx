interface StreakIndicatorProps {
  streak: number
  maxStreak?: number
  className?: string
}

export function StreakIndicator({ 
  streak, 
  maxStreak = 7,
  className = ''
}: StreakIndicatorProps) {
  const percentage = (streak / maxStreak) * 100

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        {/* Flame icon */}
        <svg
          className={`w-8 h-8 transition-all duration-300 ${
            streak > 0 ? 'text-amber-500 animate-pulse' : 'text-gray-300'
          }`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C12 2 8 6 8 10C8 12 9 14 10 15C9 16 7 17 7 19C7 21.5 9 23 12 23C15 23 17 21.5 17 19C17 17 15 16 14 15C15 14 16 12 16 10C16 6 12 2 12 2ZM12 21C10.5 21 9.5 20 9.5 19C9.5 18 10.5 17 12 17C13.5 17 14.5 18 14.5 19C14.5 20 13.5 21 12 21Z" />
        </svg>
        
        {/* Streak count badge */}
        {streak > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {streak}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          {streak > 0 ? `${streak} day streak` : 'Start your streak'}
        </p>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              streak > 0 ? 'bg-amber-500' : 'bg-gray-300'
            }`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
