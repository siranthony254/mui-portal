'use client'

import { useState, useEffect } from 'react'
import { VerifyAdminPIN } from './VerifyAdminPIN'

export function AdminSecurityGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    // SECURITY PIN DISABLED: Always verified
    setIsVerified(true)
  }, [])

  if (isVerified === null) return null // Loading state

  if (!isVerified) {
    return <VerifyAdminPIN />
  }

  return <>{children}</>
}
