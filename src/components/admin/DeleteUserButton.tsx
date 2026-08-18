'use client'

import { useState } from 'react'
import { deleteUser } from '@/lib/actions/admin'
import { Trash2 } from '@/components/icons'
import { useRouter } from 'next/navigation'

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`PERMANENTLY DELETE user "${userName}"? This action cannot be undone and will remove all their tasks, journals, and records.`)) return

    setLoading(true)
    const res = await deleteUser(userId)
    if (res.success) {
      router.refresh()
    } else {
      alert(`Error: ${res.error}`)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
      title="Permanently Delete User"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
