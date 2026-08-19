import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect, notFound } from 'next/navigation'
import { CohortCard } from '@/components/cohort/CohortCard'
import { SealedLetterManager } from '@/components/admin/SealedLetterManager'
import { CohortEditorWrapper } from '@/components/admin/CohortEditorWrapper'
import Link from 'next/link'
import { ArrowLeft, Zap, ShieldCheck, Clock, Edit3 } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Cohort Control Room' }

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: cohort } = await supabase.from('cohorts').select('*').eq('id',id).single()
  if (!cohort) notFound()

  const { count: enrolledCount } = await supabase.from('enrollments')
    .select('*',{count:'exact',head:true})
    .eq('cohort_id',id)
    .in('status',['enrolled','active'])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/admin/cohorts" className="inline-flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to cohorts
        </Link>
        <div className="flex gap-2">
            <CohortEditorWrapper cohort={cohort} />
            <span className="badge badge-gray text-[10px] font-black uppercase tracking-widest">{cohort.semester} {cohort.year}</span>
            <span className="badge badge-teal text-[10px] font-black uppercase tracking-widest">{cohort.status}</span>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">{cohort.name}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Operational Control Room
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
           <CohortCard cohort={cohort} enrolledCount={enrolledCount||0} />

           <div className="card p-6 bg-gray-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Clock className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-4">Programme Pulse</h3>
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-xs font-bold text-gray-400">Total Enrollment</span>
                      <span className="text-lg font-black">{enrolledCount} Students</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-xs font-bold text-gray-400">Completion Rate</span>
                      <span className="text-lg font-black">--%</span>
                   </div>
                </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
           <SealedLetterManager cohortId={id} />
        </div>
      </div>
    </div>
  )
}
