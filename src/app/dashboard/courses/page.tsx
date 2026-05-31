import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllCourses } from '@/lib/sanity/queries'
import Link from 'next/link'
import { BookOpen, Clock, Star } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Courses' }

const catColors: Record<string,string> = { formation:'badge-teal', thinking:'badge-blue', context:'badge-amber', wellbeing:'badge-purple' }
const catLabels: Record<string,string> = { formation:'Formation', thinking:'Critical thinking', context:'African context', wellbeing:'Wellbeing' }

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const courses = await getAllCourses().catch(()=>[])
  const core = courses.filter(c=>c.isCoreCurriculum)
  const supplementary = courses.filter(c=>!c.isCoreCurriculum)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header"><h1 className="page-title">Courses</h1><span className="badge badge-gray">{courses.length} available</span></div>
      {core.length>0 && (<div><div className="flex items-center gap-2 mb-3"><p className="section-title mb-0">Core curriculum</p><span className="badge badge-amber text-xs">Required for cohort</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{core.map(c=><CourseCard key={c._id} course={c} />)}</div></div>)}
      {supplementary.length>0 && (<div><p className="section-title">Supplementary courses</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{supplementary.map(c=><CourseCard key={c._id} course={c} />)}</div></div>)}
      {courses.length===0 && <div className="card p-10 text-center"><BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-400">No courses published yet. Check back soon.</p></div>}
    </div>
  )
}

function CourseCard({ course }: { course: any }) {
  return (
    <Link href={`/dashboard/courses/${course.slug}`} className="card p-5 hover:shadow-card-hover transition-shadow group">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        {course.isCoreCurriculum && <span className="flex items-center gap-1 badge badge-amber text-xs"><Star className="w-3 h-3" />Core</span>}
        {course.category && <span className={cn('badge text-xs',catColors[course.category]||'badge-gray')}>{catLabels[course.category]||course.category}</span>}
      </div>
      <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors mb-2">{course.title}</h3>
      {course.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {course.moduleCount>0 && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.moduleCount} module{course.moduleCount>1?'s':''}</span>}
        {course.totalDurationMinutes>0 && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{Math.round(course.totalDurationMinutes/60)}h {course.totalDurationMinutes%60}m</span>}
      </div>
    </Link>
  )
}
