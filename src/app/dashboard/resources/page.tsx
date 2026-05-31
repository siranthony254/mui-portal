import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContentForPillar } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { PILLARS, getPillarColor } from '@/types'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Resources' }

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('current_pillar').eq('student_id',user.id).in('status',['enrolled','active']).single()
  const currentPillar = enrollment?.current_pillar||1
  const allContent = await Promise.all(PILLARS.map(p=>getContentForPillar(p.number).catch(()=>[])))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Resources</h1><p className="text-sm text-gray-500">All content across all 5 pillars</p></div>
      <div className="space-y-4">
        {PILLARS.map((pillar,idx)=>{
          const content=allContent[idx]||[]
          const isCurrentPillar=pillar.number===currentPillar
          const isFuture=pillar.number>currentPillar
          return (
            <div key={pillar.number} className={cn('card overflow-hidden',isFuture&&'opacity-60')}>
              <div className={cn('px-5 py-3.5 border-b border-gray-100 flex items-center justify-between',isCurrentPillar?'bg-teal-50':'bg-gray-50')}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',isCurrentPillar?'bg-teal-700 text-white':pillar.number<currentPillar?'bg-teal-100 text-teal-700':'bg-gray-200 text-gray-500')}>
                    {pillar.number<currentPillar?'✓':pillar.number}
                  </div>
                  <div><p className={cn('text-sm font-semibold',isCurrentPillar?'text-teal-700':'text-gray-700')}>Pillar {pillar.number}: {pillar.name}</p><p className="text-xs text-gray-400">{pillar.weeks}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  {isCurrentPillar && <span className="badge badge-teal text-xs">Current</span>}
                  <span className="badge badge-gray text-xs">{content.length} items</span>
                </div>
              </div>
              <div className="p-4">
                {content.length===0 ? <p className="text-sm text-gray-400 py-2 text-center">No content yet for this pillar.</p>
                : <div className="space-y-2">{content.map(b=><ContentCard key={b._id} content={b} compact />)}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
