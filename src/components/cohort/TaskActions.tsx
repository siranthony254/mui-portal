'use client'

import { useState } from 'react'
import { reopenTask } from '@/lib/actions/cohort'
import { Edit3 } from '@/components/icons'
import { useRouter } from 'next/navigation'

export function TaskActions({ taskId }: { taskId: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleEdit = async () => {
        if (!confirm('Re-open this task for editing? Your previous submission will be kept as a draft.')) return
        setLoading(true)
        const res = await reopenTask(taskId)
        if (res.success) {
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleEdit}
            disabled={loading}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800 transition-colors"
        >
            <Edit3 className="w-3.5 h-3.5" />
            {loading ? 'Re-opening...' : 'Edit Submission'}
        </button>
    )
}
