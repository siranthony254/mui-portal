import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect, notFound } from 'next/navigation'
import { CohortCard } from '@/components/cohort/CohortCard'
import Link from 'next/link'
import { ArrowLeft } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Cohort Settings' }

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: cohort } = await supabase.from('cohorts').select('*').eq('id',id).single()
  if (!cohort) notFound()
  const { count: enrolledCount } = await supabase.from('enrollments').select('*',{count:'exact',head:true}).eq('cohort_id',id).in('status',['enrolled','active'])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/cohorts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-3.5 h-3.5" />Back to cohorts</Link>
      <h1 className="page-title">{cohort.name}</h1>
      <CohortCard cohort={cohort} enrolledCount={enrolledCount||0} />
    </div>
  )
}
