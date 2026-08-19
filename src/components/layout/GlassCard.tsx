import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  opacity?: 'light' | 'medium' | 'dark'
}

export function GlassCard({ children, className = '', blur = 'md', opacity = 'medium' }: GlassCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  const opacityClasses = {
    light: 'bg-white/60',
    medium: 'bg-white/70',
    dark: 'bg-white/80',
  }

  return (
    <div className={cn(
      'rounded-2xl border border-white/20 shadow-xl',
      blurClasses[blur],
      opacityClasses[opacity],
      className
    )}>
      {children}
    </div>
  )
}
