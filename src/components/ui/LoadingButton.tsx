import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export function LoadingButton({ loading = false, children, disabled, className = '', ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn-primary ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
