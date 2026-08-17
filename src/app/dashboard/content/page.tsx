import { redirect } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { getContentForWeek } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { PILLARS } from '@/types'
import { ArrowRight, BookOpen } from '@/components/icons'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pillar Content' }

export default async function PillarContentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('*, cohort:cohorts(*)')
    .eq('student_id', user.id)
    .in('status', ['enrolled', 'active'])
    .single()

  if (!enrollment) redirect('/dashboard')

  const week = enrollment.current_week
  const pillarNum = enrollment.current_pillar
  const pillar = PILLARS[pillarNum - 1]

  const content = await getContentForWeek(pillarNum, week).catch(() => [])

  const { data: tasks } = await supabase.from('tasks')
    .select('id, status')
    .eq('enrollment_id', enrollment.id)
    .eq('week_number', week)
    .limit(1)

  const activeTask = tasks?.[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pillar {pillarNum}: {pillar?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Week {week} of 12 — Formation Content</p>
        </div>
      </div>

      {content.length > 0 ? (
        <div className="space-y-8">
          {content.map((block) => (
            <div key={block._id} className="space-y-4">
               <ContentCard content={block} />
               {block.body && (
                 <div className="card p-6 prose prose-sm max-w-none prose-teal bg-white">
                    {/* In a real Sanity app we'd use PortableText here */}
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {typeof block.body === 'string' ? block.body : 'Detailed reading material is available in the linked resource above.'}
                    </p>
                 </div>
               )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Content not yet available</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">Formation material for this week will be uploaded by the MUI team shortly.</p>
        </div>
      )}

      {activeTask && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="bg-teal-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-teal-900">Finished the reading?</h3>
              <p className="text-sm text-teal-700 mt-1">Move to this week's formation task to capture your reflections.</p>
            </div>
            <Link
              href={`/dashboard/tasks/${activeTask.id}`}
              className="btn-primary whitespace-nowrap flex items-center gap-2"
            >
              Go to Task <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
