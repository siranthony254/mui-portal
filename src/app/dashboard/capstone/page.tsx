import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mic2, CheckCircle } from '@/components/icons'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'Capstone' }

export default async function CapstonePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: enrollment } = await supabase.from('enrollments').select('*,cohort:cohorts(name,capstone_submissions_enabled,current_week)').eq('student_id',user.id).in('status',['enrolled','active']).single()
  const cohort = enrollment?.cohort as any
  const capstoneEnabled = cohort?.capstone_submissions_enabled===true
  const { data: capstoneTask } = enrollment ? await supabase.from('tasks').select('*').eq('enrollment_id',enrollment.id).eq('pillar_number',5).eq('week_number',12).single() : { data:null }
  const isSubmitted = capstoneTask?.status && capstoneTask.status!=='pending'
  const isApproved = capstoneTask?.status==='approved'
  if (!enrollment) return <div className="max-w-lg mx-auto py-16 text-center"><p className="text-sm text-gray-400">You are not currently enrolled in a cohort.</p></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Capstone Presentation</h1>
      <div className="card p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0"><Mic2 className="w-5 h-5 text-teal-700" /></div>
          <div><h2 className="font-semibold text-gray-900 mb-1">Your capstone presentation</h2><p className="text-sm text-gray-600">A 10–15 minute recorded talk presenting your position on the problem you identified in Pillar 3 and the solution you developed in Pillar 4. It will be archived on MUI platforms permanently.</p></div>
        </div>
      </div>
      <div className="card p-5">
        <p className="section-title">Before you submit</p>
        <div className="space-y-2">
          {[{label:'Completed Identity pillar (1)',done:enrollment.current_pillar>1},{label:'Completed Understanding pillar (2)',done:enrollment.current_pillar>2},{label:'Completed Awareness pillar (3)',done:enrollment.current_pillar>3},{label:'Completed Solution Thinking pillar (4)',done:enrollment.current_pillar>4},{label:'Started Voice & Responsibility pillar (5)',done:enrollment.current_pillar>=5},{label:'Capstone submissions open',done:capstoneEnabled}].map(item=>(
            <div key={item.label} className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done?'bg-teal-100':'bg-gray-100'}`}>
                {item.done?<CheckCircle className="w-3.5 h-3.5 text-teal-600" />:<div className="w-1.5 h-1.5 rounded-full bg-gray-400" />}
              </div>
              <span className={`text-sm ${item.done?'text-gray-900':'text-gray-400'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!capstoneEnabled ? (
        <div className="card p-6 text-center"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3"><Lock className="w-5 h-5 text-gray-400" /></div><p className="text-sm font-medium text-gray-700 mb-1">Capstone submissions not yet open</p><p className="text-xs text-gray-400">The MUI team will open capstone submissions when you reach Week 9. Currently Week {cohort?.current_week}.</p></div>
      ) : isApproved ? (
        <div className="card p-6 text-center"><div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-5 h-5 text-teal-700" /></div><p className="text-sm font-semibold text-gray-900 mb-1">Capstone approved! 🎉</p><p className="text-xs text-gray-500 mb-3">Your voice is now on record. Thank you for completing the MUI formation journey.</p>{capstoneTask?.submission_url && <a href={capstoneTask.submission_url} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm justify-center">View your presentation</a>}</div>
      ) : isSubmitted ? (
        <div className="card p-5"><div className="flex items-center gap-2 mb-3"><CheckCircle className="w-5 h-5 text-amber-500" /><p className="text-sm font-medium text-gray-900">Submitted — under review</p></div><p className="text-xs text-gray-500 mb-3">Your mentor is reviewing your capstone.</p>{capstoneTask?.submission_url && <a href={capstoneTask.submission_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-700 hover:underline">View your presentation link →</a>}</div>
      ) : capstoneTask ? (
        <div className="card p-5"><h3 className="font-semibold text-gray-900 mb-1">{capstoneTask.title}</h3><div className="bg-gray-50 rounded-lg p-4 mb-4"><p className="text-xs font-medium text-gray-500 mb-1">Task prompt</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{capstoneTask.prompt}</p></div><Link href={`/dashboard/tasks/${capstoneTask.id}`} className="btn-primary text-sm">Submit capstone presentation</Link></div>
      ) : (
        <div className="card p-5 text-center"><p className="text-sm text-gray-400">Your capstone task will appear here when you reach Week 12.</p></div>
      )}

      <div className="card p-5">
        <p className="section-title">Capstone tips</p>
        <div className="space-y-2">
          {['Start with your throughline: one sentence (max 15 words) that captures your argument.','Build on your Pillar 3 problem and Pillar 4 solution — this is not a new topic.','Acknowledge the strongest counterargument and respond to it honestly.','End with a call to action — not a summary.','Record in a quiet space. Audio clarity matters more than video quality.'].map((tip,i)=>(
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-semibold text-teal-700">{i+1}</span></div>
              <p className="text-sm text-gray-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
