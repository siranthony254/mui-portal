import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllCourses } from '@/lib/sanity/queries'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Courses' }

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const courses = await getAllCourses().catch(()=>[])
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">Courses</h1>
        <a href={`https://sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">+ Add in Sanity Studio</a>
      </div>
      {courses.length===0 ? <div className="card p-10 text-center"><p className="text-sm text-gray-400">No courses published yet.</p></div> : (
        <div className="space-y-3">{courses.map(c=>(
          <div key={c._id} className="card p-4 flex items-center justify-between">
            <div><p className="text-sm font-semibold text-gray-900">{c.title}</p><p className="text-xs text-gray-400 mt-0.5">{c.category} · {c.moduleCount} modules</p></div>
            <div className="flex items-center gap-2">{c.isCoreCurriculum&&<span className="badge badge-amber text-xs">Core</span>}<span className="badge badge-teal text-xs capitalize">{c.category}</span></div>
          </div>
        ))}</div>
      )}
    </div>
  )
}
