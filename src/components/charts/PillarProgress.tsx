import { ProgressBar } from './ProgressBar'

interface PillarProgressProps {
  currentPillar: number
  totalPillars?: number
  className?: string
}

export function PillarProgress({ 
  currentPillar, 
  totalPillars = 5,
  className = ''
}: PillarProgressProps) {
  const progress = (currentPillar / totalPillars) * 100

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Formation Journey
        </span>
        <span className="text-xs font-bold text-teal-700">
          Pillar {currentPillar} of {totalPillars}
        </span>
      </div>
      
      {/* Pillar indicators */}
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: totalPillars }).map((_, i) => {
          const isCompleted = i < currentPillar
          const isCurrent = i === currentPillar - 1
          
          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                isCompleted 
                  ? 'bg-teal-600' 
                  : isCurrent 
                    ? 'bg-teal-400' 
                    : 'bg-gray-200'
              }`}
            />
          )
        })}
      </div>

      {/* Overall progress */}
      <ProgressBar progress={progress} color="teal" />
    </div>
  )
}
