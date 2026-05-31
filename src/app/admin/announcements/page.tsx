import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getAnnouncements } from '@/lib/sanity/queries'
import { formatDate } from '@/lib/utils'
import { Bell } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Announcements' }

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const announcements = await getAnnouncements('admin').catch(()=>[])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <a href={`https://sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">+ Create in Sanity Studio</a>
      </div>
      <div className="card p-4 bg-blue-50 border-blue-100">
        <p className="text-sm font-medium text-blue-800 mb-1">How announcements work</p>
        <p className="text-xs text-blue-700">Create announcements in Sanity Studio. Set target roles and optional cohort ID to target specific groups. Expired announcements are hidden automatically.</p>
      </div>
      {announcements.length===0 ? (
        <div className="card p-10 text-center"><Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No announcements published yet.</p></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann:any)=>(
            <div key={ann._id} className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{ann.title}</h3>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {ann.targetRoles?.map((role:string)=><span key={role} className={`badge text-xs ${role==='admin'?'badge-purple':role==='mentor'?'badge-blue':'badge-teal'}`}>{role}</span>)}
                {ann.cohortId && <span className="badge badge-amber text-xs">Cohort specific</span>}
              </div>
              <p className="text-xs text-gray-400">Published {formatDate(ann.publishedAt)}{ann.expiresAt&&` · Expires ${formatDate(ann.expiresAt)}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
