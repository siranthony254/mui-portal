import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/layout/SettingsClient'
import { Metadata } from 'next'
import { ShieldCheck, ArrowRight } from '@/components/icons'
import Link from 'next/link'
export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: cohorts } = await supabase.from('cohorts').select('*').order('created_at',{ascending:false})

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="card p-5">
        <p className="section-title">Platform architecture</p>
        <div className="space-y-2">
          {[{label:'Frontend',value:'Next.js 14 (App Router) + TypeScript'},{label:'Database & Auth',value:'Supabase (PostgreSQL + OTP)'},{label:'Content CMS',value:'Sanity v3'},{label:'Hosting',value:'Vercel'}].map(item=>(
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="badge badge-gray text-xs">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card p-5">
        <p className="section-title">External management</p>
        <div className="space-y-2">
          {[{label:'Sanity Studio',desc:'Add content blocks, courses, announcements',href:`https://sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`},{label:'Supabase Dashboard',desc:'View database, auth users, run queries',href:'https://supabase.com/dashboard'},{label:'Vercel Dashboard',desc:'Deployment logs, env variables',href:'https://vercel.com/dashboard'}].map(link=>(
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors group">
              <div><p className="text-sm font-medium text-gray-900 group-hover:text-teal-700">{link.label}</p><p className="text-xs text-gray-400 mt-0.5">{link.desc}</p></div>
              <span className="text-gray-300 group-hover:text-teal-500 text-lg">→</span>
            </a>
          ))}
        </div>
      </div>

      <div className="card p-5 bg-gray-900 text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ShieldCheck className="w-20 h-20" />
        </div>
        <div className="relative z-10">
          <p className="section-title text-gray-500">Super Admin Layer</p>
          <h3 className="text-lg font-black mb-2">Platform Audit Logs</h3>
          <p className="text-xs text-gray-400 leading-relaxed mb-6 max-w-sm">
            Review every administrative action taken on the portal. This layer provides full traceability for security and oversight.
          </p>
          <Link href="/admin/audit-logs" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            View Audit Logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {cohorts && cohorts.length > 0 && <SettingsClient cohorts={cohorts} />}
    </div>
  )
}
