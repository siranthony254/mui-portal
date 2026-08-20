import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getContentForPillar, getSupplementaryResources } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { PILLARS } from '@/types'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
import { BookOpen, Zap, Globe, FileText, Video, Headphones, FileDown } from '@/components/icons'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Resources' }

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments')
    .select('current_pillar, cohort_id, cohort:cohorts(*)')
    .eq('student_id', user.id)
    .in('status', ['enrolled', 'active'])
    .maybeSingle()

  if (!enrollment) {
    // If not enrolled, they might still see global resources
    const globalResources = await getSupplementaryResources()
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="page-header">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Public Resources</h1>
                    <p className="text-sm text-gray-500 font-medium">Supplementary materials for the MUI community.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalResources.map(r => (
                    <ResourceCard key={r._id} resource={r} />
                ))}
            </div>
            {globalResources.length === 0 && (
                <div className="card p-12 text-center">
                    <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No resources available yet.</p>
                </div>
            )}
        </div>
    )
  }

  const cohort = enrollment.cohort as any
  const cohortId = enrollment.cohort_id
  const currentPillar = enrollment.current_pillar || 1
  const activePillars = cohort?.pillars_config || PILLARS

  const [pillarContent, supplementaryResources] = await Promise.all([
    Promise.all(activePillars.map((p: any) => getContentForPillar(p.number).catch(() => []))),
    getSupplementaryResources(cohortId)
  ])

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Learning Hub</h1>
          <p className="text-sm text-gray-500 font-medium">{cohort?.name} · Formation Resources</p>
        </div>
      </div>

      {/* 1. Supplementary Resources - The "Sent" materials */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">Supplementary Materials</h2>
        </div>

        {supplementaryResources.length === 0 ? (
            <div className="card p-8 text-center bg-gray-50 border-dashed border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No supplementary materials sent for this cohort yet.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplementaryResources.map(r => (
                    <ResourceCard key={r._id} resource={r} />
                ))}
            </div>
        )}
      </section>

      {/* 2. Core Curriculum Pillars */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <h2 className="text-xs font-black text-teal-600 uppercase tracking-[0.2em]">Core Curriculum Archive</h2>
        </div>

        <div className="space-y-4">
            {activePillars.map((pillar: any, idx: number) => {
            const content = pillarContent[idx] || []
            const isCurrentPillar = pillar.number === currentPillar
            const isFuture = pillar.number > currentPillar

            return (
                <div key={pillar.number} className={cn('card overflow-hidden transition-all', isFuture && 'opacity-60 grayscale')}>
                <div className={cn('px-6 py-4 border-b border-gray-100 flex items-center justify-between', isCurrentPillar ? 'bg-teal-50/50' : 'bg-gray-50/50')}>
                    <div className="flex items-center gap-4">
                    <div className={cn(
                        'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105',
                        isCurrentPillar ? 'bg-teal-700 text-white' : pillar.number < currentPillar ? 'bg-teal-100 text-teal-700' : 'bg-white text-gray-300'
                    )}>
                        {pillar.number < currentPillar ? '✓' : pillar.number}
                    </div>
                    <div>
                        <p className={cn('text-sm font-black uppercase tracking-tight', isCurrentPillar ? 'text-teal-900' : 'text-gray-900')}>
                            Pillar {pillar.number}: {pillar.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pillar.weeks}</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    {isCurrentPillar && <span className="badge badge-teal text-[10px] font-black uppercase tracking-widest">Active Focus</span>}
                    <span className="badge badge-gray text-[10px] font-black uppercase tracking-widest">{content.length} Assets</span>
                    </div>
                </div>
                <div className="p-4">
                    {content.length === 0 ? (
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4 text-center italic">No archived content for this pillar yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {content.map((b: any) => <ContentCard key={b._id} content={b} compact />)}
                        </div>
                    )}
                </div>
                </div>
            )
            })}
        </div>
      </section>
    </div>
  )
}

function ResourceCard({ resource }: { resource: any }) {
    const typeIcons: Record<string, any> = {
        video: Video,
        article: FileText,
        audio: Headphones,
        pdf: FileDown,
        image: Globe
    }
    const Icon = typeIcons[resource.contentType] || BookOpen

    return (
        <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 hover:border-blue-500 hover:shadow-xl transition-all group flex items-start gap-4"
        >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{resource.title}</h3>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{resource.contentType}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">{resource.description}</p>
                <div className="flex flex-wrap gap-1.5">
                    {resource.tags?.map((tag: string) => (
                        <span key={tag} className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">#{tag}</span>
                    ))}
                </div>
            </div>
        </a>
    )
}
