interface CulturalDividerProps {
  className?: string
}

export function CulturalDivider({ className = '' }: CulturalDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-teal-600" />
        <div className="w-1 h-1 rounded-full bg-amber-500" />
        <div className="w-2 h-2 rounded-full bg-teal-600" />
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
    </div>
  )
}
