import { cn } from '@/lib/utils'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4
}

interface BentoItemProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2 | 3
}

export function BentoGrid({ children, className = '', cols = 3 }: BentoGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[cols], className)}>
      {children}
    </div>
  )
}

export function BentoItem({ children, className = '', colSpan = 1, rowSpan = 1 }: BentoItemProps) {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
  }

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
  }

  return (
    <div className={cn(
      'card overflow-hidden',
      colSpanClasses[colSpan],
      rowSpanClasses[rowSpan],
      className
    )}>
      {children}
    </div>
  )
}
