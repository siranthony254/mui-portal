interface JourneyMapProps {
  currentPillar: number
  totalPillars?: number
  className?: string
}

export function JourneyMap({ 
  currentPillar, 
  totalPillars = 5,
  className = ''
}: JourneyMapProps) {
  const pillars = Array.from({ length: totalPillars }, (_, i) => ({
    number: i + 1,
    isCompleted: i < currentPillar,
    isCurrent: i === currentPillar - 1,
    isLocked: i >= currentPillar
  }))

  return (
    <div className={`relative ${className}`}>
      {/* Connection line */}
      <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded-full" />
      
      {/* Progress line */}
      <div 
        className="absolute top-8 left-8 h-1 bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-500"
        style={{ width: `${((currentPillar - 1) / (totalPillars - 1)) * 100}%` }}
      />

      {/* Pillars */}
      <div className="flex justify-between relative">
        {pillars.map((pillar, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            {/* Pillar circle */}
            <div
              className={`relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                pillar.isCompleted 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 scale-110' 
                  : pillar.isCurrent 
                    ? 'bg-teal-400 text-white shadow-lg shadow-teal-400/30 scale-110 animate-pulse-glow' 
                    : 'bg-gray-200 text-gray-400'
              }`}
            >
              {pillar.isCompleted ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                pillar.number
              )}
            </div>

            {/* Pillar label */}
            <div className="text-center">
              <p className={`font-semibold text-sm ${
                pillar.isCompleted || pillar.isCurrent ? 'text-teal-700' : 'text-gray-400'
              }`}>
                Pillar {pillar.number}
              </p>
              {pillar.isCurrent && (
                <p className="text-xs text-teal-600 font-medium mt-1">Current</p>
              )}
              {pillar.isCompleted && (
                <p className="text-xs text-teal-600 font-medium mt-1">Complete</p>
              )}
              {pillar.isLocked && (
                <p className="text-xs text-gray-400 mt-1">Locked</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
