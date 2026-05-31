import { redirect, notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { TaskSubmitForm } from '@/components/cohort/TaskSubmitForm'
import { formatDate, cn } from '@/lib/utils'
import { PILLARS, getPillarColor } from '@/types'
import { CheckCircle, Clock, ArrowLeft } from '@/components/icons'
import Link from 'next/link'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Task' }

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: task } = await supabase.from('tasks').select('*').eq('id', id).eq('student_id', user.id).single()
  if (!task) notFound()
  const pillar = PILLARS[task.pillar_number - 1]
  const isSubmitted = task.status !== 'pending'
  const isApproved = task.status === 'approved'

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/tasks" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />Back to tasks
      </Link>
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('badge text-xs', getPillarColor(task.pillar_number))}>Pillar {task.pillar_number}: {pillar?.name}</span>
              <span className="badge badge-gray text-xs">Week {task.week_number}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
          </div>
          {isApproved && <div className="flex items-center gap-1.5 text-teal-700"><CheckCircle className="w-5 h-5" /><span className="text-sm font-medium">Approved</span></div>}
          {!isApproved && isSubmitted && <div className="flex items-center gap-1.5 text-amber-600"><Clock className="w-5 h-5" /><span className="text-sm font-medium">Under review</span></div>}
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your task</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.prompt}</p>
        </div>
        {pillar && <div className="bg-teal-50 rounded-xl p-4"><p className="text-xs font-medium text-teal-800 mb-1">Why this matters — {pillar.name}</p><p className="text-xs text-teal-700">{pillar.description}</p></div>}
      </div>
      {task.mentor_feedback && (
        <div className="card p-5 mb-4" style={{borderLeft:'4px solid #60a5fa'}}>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Mentor feedback</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.mentor_feedback}</p>
          {task.reviewed_at && <p className="text-xs text-gray-400 mt-2">Reviewed {formatDate(task.reviewed_at)}</p>}
        </div>
      )}
      {isSubmitted ? (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your submission</p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{task.submission}</p>
          {task.submission_url && <a href={task.submission_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-teal-700 hover:underline mt-3">View attached link →</a>}
          {task.submitted_at && <p className="text-xs text-gray-400 mt-3">Submitted {formatDate(task.submitted_at)}</p>}
        </div>
      ) : <TaskSubmitForm taskId={task.id} />}
    </div>
  )
}
