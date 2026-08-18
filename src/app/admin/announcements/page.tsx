import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getAnnouncements } from '@/lib/sanity/queries'
import { formatDate } from '@/lib/utils'
import { Bell, Zap, Globe, MessageSquare } from '@/components/icons'
import { Metadata } from 'next'
import { AdminNotificationActions } from '@/components/admin/AdminNotificationActions'

export const metadata: Metadata = { title: 'Broadcasts — The Megaphone' }

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [announcements, { data: cohorts }] = await Promise.all([
    getAnnouncements('admin').catch(()=>[]),
    supabase.from('cohorts').select('id, name').order('created_at', { ascending: false })
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">The Megaphone</h1>
          <p className="text-sm text-gray-500 font-medium">Platform-wide broadcasts and targeted alerts.</p>
        </div>
        <AdminNotificationActions cohorts={cohorts || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10">
             <Bell className="w-32 h-32" />
           </div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Live Alerts</p>
              <h3 className="text-2xl font-black mb-4 tracking-tight">Direct-to-Dash</h3>
              <p className="text-sm text-emerald-100/70 leading-relaxed font-medium mb-6">
                Push instant alerts to student and mentor dashboards. These are ideal for session reminders and immediate action items.
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 card p-8 flex flex-col justify-center bg-gray-50 border-dashed border-gray-200">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
                 <Globe className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-gray-900">Global Banner System</h4>
                 <p className="text-sm text-gray-500 max-w-md">Banners are high-visibility messages that appear across all relevant dashboards and persist until dismissed or expired.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Active Banners</h2>
        {announcements.length === 0 ? (
          <div className="card p-12 text-center text-gray-400 italic text-sm">No active banners currently live.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann: any) => (
              <div key={ann._id} className="card p-6 hover:bg-gray-50/50 transition-all border-l-4 border-l-emerald-700">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="font-bold text-gray-900 pr-4">{ann.title}</h3>
                   <div className="flex gap-1">
                      {ann.targetRoles?.map((role: string) => (
                        <span key={role} className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md text-gray-500">{role}</span>
                      ))}
                   </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Live</span>
                   <span>Created {formatDate(ann.publishedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

