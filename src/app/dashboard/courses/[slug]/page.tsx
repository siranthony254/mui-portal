import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCourseBySlug } from '@/lib/sanity/queries'
import { ContentCard } from '@/components/content/ContentCard'
import { ArrowLeft, Clock, BookOpen, Play, ChevronRight } from '@/components/icons'
import Link from 'next/link'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug).catch(()=>null)
  return { title: course?.title || 'Course' }
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const course = await getCourseBySlug(slug).catch(()=>null)
  if (!course) notFound()
  const totalItems = course.modules?.reduce((acc:number,m:any)=>acc+(m.sessions?.length||0),0)||0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-3.5 h-3.5" />Back to courses</Link>
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {course.isCoreCurriculum && <span className="badge badge-amber text-xs">Core curriculum</span>}
          {course.category && <span className="badge badge-teal text-xs capitalize">{course.category}</span>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>
        {course.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{course.description}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" />{course.modules?.length||0} modules · {totalItems} items</span>
          {course.totalDurationMinutes>0 && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{Math.round(course.totalDurationMinutes/60)}h {course.totalDurationMinutes%60}m</span>}
        </div>
        <Link
          href={`/dashboard/courses/${slug}/learn`}
          className="btn-primary inline-flex items-center gap-2 py-3 px-8"
        >
          <Play className="w-4 h-4" /> Start Learning
        </Link>
      </div>
      {course.modules?.length>0 ? (
        <div className="space-y-4">
          {course.modules.map((module:any,idx:number)=>(
            <div key={module._key} className="card overflow-hidden">
              <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">{idx+1}</div>
                  <div><p className="text-sm font-semibold text-gray-900">{module.title}</p>{module.description&&<p className="text-xs text-gray-400 mt-0.5">{module.description}</p>}</div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {module.sessions?.length>0 ? (
                  <div className="space-y-2">
                    {module.sessions.map((session: any, sIdx: number) => (
                      <Link
                        key={session._key}
                        href={`/dashboard/courses/${slug}/learn`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                             {sIdx + 1}
                           </div>
                           <span className="text-sm font-medium text-gray-700 group-hover:text-teal-900">{session.title}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-2">No sessions yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : <div className="card p-10 text-center"><p className="text-sm text-gray-400">No modules published yet.</p></div>}
    </div>
  )
}
