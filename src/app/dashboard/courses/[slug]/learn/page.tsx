import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getCourseBySlug } from '@/lib/sanity/queries'
import { CoursePlayer } from '@/components/content/CoursePlayer'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug).catch(() => null)
  return { title: `Learning: ${course?.title || 'Course'}` }
}

export default async function LearnCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const course = await getCourseBySlug(slug).catch(() => null)
  if (!course) notFound()

  return (
    <div className="max-w-[1600px] mx-auto">
       <CoursePlayer course={course} />
    </div>
  )
}
