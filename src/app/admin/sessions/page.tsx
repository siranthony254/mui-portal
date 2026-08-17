import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Calendar, Plus, Video, Trash2 } from '@/components/icons'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Sessions — Admin' }

export default async function AdminSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: cohorts } = await supabase.from('cohorts').select('id, name, semester, year').neq('status', 'completed')
  const { data: sessions } = await supabase.from('cohort_sessions').select('*, cohort:cohorts(name)').order('date', { ascending: false })

  async function createSession(formData: FormData) {
    'use server'
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = await createAdminClient()

    await admin.from('cohort_sessions').insert({
      cohort_id: formData.get('cohort_id'),
      title: formData.get('title'),
      theme: formData.get('theme'),
      description: formData.get('description'),
      date: formData.get('date'),
      time: formData.get('time'),
      join_url: formData.get('join_url'),
      notes: formData.get('notes'),
    })

    revalidatePath('/admin/sessions')
    revalidatePath('/dashboard/sessions')
  }

  async function deleteSession(sessionId: string) {
    'use server'
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = await createAdminClient()
    await admin.from('cohort_sessions').delete().eq('id', sessionId)
    revalidatePath('/admin/sessions')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Sessions</h1>
          <p className="text-sm text-gray-500">Schedule monthly closed cohort gatherings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Schedule New Session
            </h2>
            <form action={createSession} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cohort</label>
                <select name="cohort_id" required className="select text-sm">
                  <option value="">Select cohort...</option>
                  {cohorts?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.semester})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input name="title" required placeholder="Session 2: Seeing Clearly" className="input text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" type="date" required className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input name="time" placeholder="7:00 PM EAT" required className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Theme</label>
                <input name="theme" placeholder="Identity & Formation" className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Join URL (Google Meet/Zoom)</label>
                <input name="join_url" type="url" placeholder="https://meet.google.com/..." className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={2} className="textarea text-sm" />
              </div>
              <button type="submit" className="btn-primary w-full py-2 text-sm">Create Session</button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 px-1">Scheduled Sessions ({sessions?.length || 0})</h2>
          {sessions?.map(session => (
            <div key={session.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{session.title}</h3>
                    <span className="badge badge-gray text-[10px]">{session.cohort?.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{formatDate(session.date)} at {session.time}</p>
                  {session.join_url && (
                    <a href={session.join_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline">
                      <Video className="w-3 h-3" /> Join Link Attached
                    </a>
                  )}
                </div>
              </div>
              <form action={deleteSession.bind(null, session.id)}>
                <button type="submit" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          ))}
          {sessions?.length === 0 && (
            <div className="card p-12 text-center text-gray-400 text-sm">No sessions scheduled yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
