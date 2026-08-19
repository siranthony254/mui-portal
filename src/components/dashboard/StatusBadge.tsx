interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'inactive' | 'approved' | 'rejected'
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Active', className: 'badge-teal' },
    pending: { label: 'Pending', className: 'badge-amber' },
    completed: { label: 'Completed', className: 'badge-purple' },
    inactive: { label: 'Inactive', className: 'badge-gray' },
    approved: { label: 'Approved', className: 'badge-teal' },
    rejected: { label: 'Rejected', className: 'badge-red' },
  }

  const config = statusConfig[status]

  return (
    <span className={`badge ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
