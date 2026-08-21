import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCohortCurriculum } from '@/lib/sanity/queries'
import { AdminContentActions } from '@/components/admin/AdminContentActions'
import { ContentHubManager } from '@/components/admin/ContentHubManager'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Content Orchestration' }

export default async function ContentManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cohorts } = await supabase.from('cohorts').select('id, name, pillars_config').order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Content Hub</h1>
          <p className="text-sm text-gray-500 font-medium">Design formation journeys and manage digital assets.</p>
        </div>
        <AdminContentActions cohorts={cohorts || []} />
      </div>

      <ContentHubManager cohorts={cohorts || []} />
    </div>
  )
}


function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}

