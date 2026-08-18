'use client'

import { useState, useEffect } from 'react'
import { VerifyAdminPIN } from './VerifyAdminPIN'

export function AdminSecurityGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    // Check session storage for verification status
    const verified = sessionStorage.getItem('admin_verified') === 'true'
    setIsVerified(verified)
  }, [])

  if (isVerified === null) return null // Loading state

  if (!isVerified) {
    return <VerifyAdminPIN />
  }

  return <>{children}</>
}
