interface CohortTimelineProps {
  currentWeek: number
  totalWeeks?: number
  className?: string
}

export function CohortTimeline({ 
  currentWeek, 
  totalWeeks = 12,
  className = ''
}: CohortTimelineProps) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => ({
    number: i + 1,
    isCompleted: i < currentWeek,
    isCurrent: i === currentWeek - 1,
    isFuture: i >= currentWeek
  }))

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Cohort Timeline</h3>
        <span className="text-sm text-teal-700 font-medium">
          Week {currentWeek} of {totalWeeks}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {weeks.map((week, index) => (
          <div
            key={index}
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
              week.isCurrent 
                ? 'bg-teal-50 border-2 border-teal-300' 
                : week.isCompleted 
                  ? 'bg-gray-50' 
                  : 'bg-gray-100 opacity-60'
            }`}
          >
            {/* Week indicator */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                week.isCompleted 
                  ? 'bg-teal-600 text-white' 
                  : week.isCurrent 
                    ? 'bg-teal-400 text-white' 
                    : 'bg-gray-300 text-gray-500'
              }`}
            >
              {week.isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                week.number
              )}
            </div>

            {/* Week label */}
            <div className="flex-1">
              <p className={`font-medium text-sm ${
                week.isCurrent ? 'text-teal-700' : 'text-gray-700'
              }`}>
                Week {week.number}
              </p>
              {week.isCurrent && (
                <p className="text-xs text-teal-600">In Progress</p>
              )}
              {week.isCompleted && (
                <p className="text-xs text-gray-500">Completed</p>
              )}
            </div>

            {/* Status indicator */}
            {week.isCurrent && (
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Overall Progress</span>
          <span>{Math.round((currentWeek / totalWeeks) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${(currentWeek / totalWeeks) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
