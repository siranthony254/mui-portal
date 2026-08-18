import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllContent } from '@/lib/sanity/queries'
import { ContentManagerClient } from '@/components/content/ContentManagerClient'
import { AdminContentActions } from '@/components/admin/AdminContentActions'
import { CurriculumOrchestrator } from '@/components/admin/CurriculumOrchestrator'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Content Orchestration' }

export default async function ContentManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [content, { data: cohorts }] = await Promise.all([
    getAllContent().catch(() => []),
    supabase.from('cohorts').select('id, name, pillars_config').order('created_at', { ascending: false })
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Hub</h1>
          <p className="text-sm text-gray-500 font-medium">Design formation journeys and manage digital assets.</p>
        </div>
        <AdminContentActions cohorts={cohorts || []} />
      </div>

      {/* 1. Hierarchical Drill-Down UI */}
      <section className="space-y-6">
        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Curriculum Orchestrator</h2>
        <CurriculumOrchestrator cohorts={cohorts || []} />
      </section>

      {/* 2. Secondary: Legacy/Standalone Content */}
      <section className="pt-12 border-t border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Global Asset Library</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">Legacy</span>
        </div>
        <ContentManagerClient content={content} isAdmin />
      </section>
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

