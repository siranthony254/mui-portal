interface AfricanPatternProps {
  variant?: 'geometric' | 'tribal' | 'modern'
  color?: 'teal' | 'amber' | 'purple'
  className?: string
}

export function AfricanPattern({ variant = 'geometric', color = 'teal', className = '' }: AfricanPatternProps) {
  const colors = {
    teal: 'rgba(15, 110, 86, 0.1)',
    amber: 'rgba(245, 158, 11, 0.1)',
    purple: 'rgba(139, 92, 246, 0.1)'
  }

  const patterns = {
    geometric: (
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="african-geometric" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="none" />
            <path d="M0 0L10 10L20 0M10 10L20 20M0 20L10 10" stroke={colors[color]} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#african-geometric)`} />
      </svg>
    ),
    tribal: (
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="african-tribal" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="15" cy="15" r="8" stroke={colors[color]} strokeWidth="0.5" fill="none" />
            <circle cx="15" cy="15" r="4" stroke={colors[color]} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#african-tribal)`} />
      </svg>
    ),
    modern: (
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="african-modern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M0 12.5L12.5 0L25 12.5L12.5 25Z" stroke={colors[color]} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#african-modern)`} />
      </svg>
    )
  }

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {patterns[variant]}
    </div>
  )
}
