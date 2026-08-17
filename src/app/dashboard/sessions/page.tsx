import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Calendar, Video, FileText } from '@/components/icons'
import { SessionHomework } from '@/components/cohort/SessionHomework'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Monthly Sessions' }

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('cohort_id,cohort:cohorts(name)').eq('student_id', user.id).in('status', ['enrolled', 'active', 'completed']).single()
  if (!enrollment) redirect('/dashboard')

  const { data: sessions } = await supabase.from('cohort_sessions').select('*, completions:session_homework_completions(student_id)').eq('cohort_id', enrollment.cohort_id).order('date', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Monthly Sessions</h1>
        <p className="text-sm text-gray-500">{enrollment.cohort?.name} · Closed Cohort Sessions</p>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isPast = new Date(session.date) < new Date()
            const isCompleted = session.completions?.some((c: any) => c.student_id === user.id) || false
            return (
              <div key={session.id} className="card overflow-hidden">
                <div className={`px-5 py-4 border-b border-gray-100 flex items-center justify-between ${!isPast ? 'bg-teal-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${!isPast ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${!isPast ? 'text-teal-900' : 'text-gray-700'}`}>{session.title}</h3>
                      <p className="text-xs text-gray-500">{formatDate(session.date)} · {session.time}</p>
                    </div>
                  </div>
                  {!isPast && <span className="badge badge-teal">Upcoming</span>}
                </div>

                <div className="p-5 space-y-4">
                  {session.theme && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Theme</p>
                      <p className="text-sm text-gray-800 font-medium">{session.theme}</p>
                    </div>
                  )}

                  {session.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">{session.description}</p>
                  )}

                  {!isPast && session.homework && (
                    <SessionHomework
                      sessionId={session.id}
                      homework={session.homework}
                      isCompleted={isCompleted}
                    />
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    {session.join_url && !isPast && (
                      <a href={session.join_url} target="_blank" rel="noopener noreferrer"
                        className="btn-primary flex items-center gap-2 text-sm py-2">
                        <Video className="w-4 h-4" /> Join Session
                      </a>
                    )}
                    {session.notes && (
                      <div className="w-full">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Session Notes</p>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                           <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions scheduled</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">Closed cohort sessions will appear here once they are scheduled by the MUI team.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <div className="mt-0.5"><FileText className="w-5 h-5 text-blue-600" /></div>
        <div>
          <p className="text-sm font-semibold text-blue-900">About Monthly Sessions</p>
          <p className="text-xs text-blue-700 leading-relaxed mt-1">
            These are closed cohort gatherings for real-time formation, discussion, and Q&A.
            Join links are activated 15 minutes before the start time. Notes and summaries
            are typically posted within 48 hours after the session.
          </p>
        </div>
      </div>
    </div>
  )
}
