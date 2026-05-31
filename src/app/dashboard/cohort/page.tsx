import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContentForPillar } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { PILLARS, getPillarColor } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'My Cohort' }

export default async function CohortPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(*)').eq('student_id',user.id).in('status',['enrolled','active']).single()
  if (!enrollment) redirect('/dashboard')

  const { data: peers } = await supabase.from('enrollments').select('student_id,profiles:profiles!student_id(full_name,institution,institution_type)').eq('cohort_id',enrollment.cohort_id).neq('student_id',user.id).in('status',['enrolled','active']).limit(24)
  const content = await getContentForPillar(enrollment.current_pillar).catch(()=>[])
  const weekContent = content.filter(c=>c.weekNumber===enrollment.current_week)
  const currentPillar = PILLARS[enrollment.current_pillar-1]
  const cohort = enrollment.cohort as any

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="page-title">{cohort?.name}</h1><p className="text-sm text-gray-500 mt-0.5">{cohort?.semester} {cohort?.year} · Week {enrollment.current_week} of 12</p></div>

      <div className="card p-5">
        <p className="section-title">Formation pillars</p>
        <div className="grid grid-cols-5 gap-2">
          {PILLARS.map(p=>{
            const done=p.number<enrollment.current_pillar; const active=p.number===enrollment.current_pillar; const locked=p.number>enrollment.current_pillar
            return (
              <div key={p.number} className={cn('rounded-xl p-3 text-center border transition-all',active?'border-teal-200 bg-teal-50':done?'border-gray-100 bg-gray-50':'border-gray-100 bg-white opacity-40')}>
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold mx-auto mb-1.5',active?'bg-teal-700 text-white':done?'bg-teal-100 text-teal-700':'bg-gray-100 text-gray-400')}>{done?'✓':p.number}</div>
                <p className={cn('text-xs font-medium leading-tight',active?'text-teal-700':done?'text-gray-600':'text-gray-400')}>{p.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{p.weeks}</p>
              </div>
            )
          })}
        </div>
      </div>

      {weekContent.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title mb-0">Week {enrollment.current_week} content</p>
            <span className={cn('badge text-xs',getPillarColor(enrollment.current_pillar))}>{currentPillar?.name}</span>
          </div>
          <div className="space-y-3">{weekContent.map(b=><ContentCard key={b._id} content={b} />)}</div>
        </div>
      )}

      {content.length > 0 && (
        <div className="card p-5">
          <p className="section-title">All Pillar {enrollment.current_pillar} content</p>
          <div className="space-y-2">{content.map(b=><ContentCard key={b._id} content={b} compact />)}</div>
        </div>
      )}

      {peers && peers.length > 0 && (
        <div className="card p-5">
          <p className="section-title">Your cohort — {peers.length+1} students</p>
          <div className="flex flex-wrap gap-2">
            {peers.map((peer:any)=>{
              const p=peer.profiles; if (!p) return null
              return (
                <div key={peer.student_id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">{getInitials(p.full_name)}</div>
                  <div><p className="text-xs font-medium text-gray-900">{p.full_name.split(' ')[0]}</p><p className="text-xs text-gray-400 capitalize">{p.institution_type}</p></div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
