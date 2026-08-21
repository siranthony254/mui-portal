'use client'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'
import { getPillarColor } from '@/types'
import { PILLARS } from '@/types'
import type { Profile, Enrollment, Task } from '@/types'
import { CheckCircle, Clock, Circle, ChevronRight, MessageSquare, FileText, Users, ArrowRight } from '@/components/icons'
import { cn } from '@/lib/utils'
import { PeerAccountabilityCard } from './PeerAccountabilityCard'
import { MentorAssignmentBanner } from './MentorAssignmentBanner'
import { JourneyMap } from './JourneyMap'

interface Props { enrollment: any; tasks: Task[]; profile: Profile; partnership?: any }

export function StudentDashboard({ enrollment, tasks, profile, partnership }: Props) {
  const cohort = enrollment.cohort
  const mentor = enrollment.mentor
  const activePillars = cohort?.pillars_config || PILLARS
  const currentPillar = activePillars[enrollment.current_pillar - 1] || activePillars[0]
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const submittedTasks = tasks.filter(t => t.status !== 'pending').length

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 px-4">
      {mentor && <MentorAssignmentBanner mentor={mentor} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Welcome back, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{cohort?.name} · Week {enrollment.current_week} of 12</p>
        </div>
        {pendingTasks > 0 && <span className="badge badge-amber self-start sm:self-auto">{pendingTasks} task{pendingTasks > 1 ? 's' : ''} pending</span>}
      </div>

      <section className="card p-0 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <p className="section-title mb-0 text-sm">Your Formation Journey</p>
          <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">
            Week {enrollment.current_week} / 12
          </span>
        </div>
        <div className="p-4 sm:p-6 scale-90 sm:scale-100 origin-left">
          <JourneyMap
            currentWeek={enrollment.current_week}
            currentPillar={enrollment.current_pillar}
            pillars={activePillars}
          />
        </div>
      </section>

      <div className="card p-4 sm:p-5">
        <p className="section-title text-sm">Current focus</p>
        <h3 className="font-semibold text-gray-900 mb-1 text-base">{currentPillar?.name}</h3>
        <p className="text-xs text-gray-500 mb-3">{currentPillar?.subtitle}</p>
        <div className="bg-teal-50 rounded-lg p-3 mb-3">
          <p className="text-[10px] font-medium text-teal-800 mb-1">Goal</p>
          <p className="text-xs text-teal-700">{currentPillar?.goal}</p>
        </div>
        <Link href="/dashboard/content" className="btn-primary w-full justify-center text-xs py-2.5">
          Read this week's content <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="section-title mb-0 text-sm">Week {enrollment.current_week} tasks</p>
          <Link href="/dashboard/tasks" className="text-xs text-teal-700 hover:underline font-medium">View all</Link>
        </div>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No tasks yet for this week.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => (
              <Link key={task.id} href={`/dashboard/tasks/${task.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="mt-0.5 flex-shrink-0">
                  {task.status === 'approved' ? <CheckCircle className="w-4 h-4 text-teal-600" />
                    : task.status === 'submitted' || task.status === 'reviewed' ? <Clock className="w-4 h-4 text-amber-500" />
                    : <Circle className="w-4 h-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-teal-700">{task.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{task.prompt}</p>
                </div>
                <span className={cn('badge flex-shrink-0 text-xs', {
                  'badge-teal': task.status === 'approved',
                  'badge-amber': task.status === 'submitted',
                  'badge-blue': task.status === 'reviewed',
                  'badge-gray': task.status === 'pending',
                })}>{task.status}</span>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-teal-600" />{submittedTasks} submitted</span>
          <span className="flex items-center gap-1"><Circle className="w-3.5 h-3.5 text-gray-300" />{pendingTasks} pending</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Link href="/dashboard/journal" className="btn-secondary flex-1 justify-center text-xs py-2">
            <FileText className="w-3.5 h-3.5" /> Journal
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 sm:p-5">
          <p className="section-title text-sm">Your mentor</p>
          {mentor ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {getInitials(mentor.full_name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{mentor.full_name}</p>
                  <p className="text-xs text-gray-400">Mentor</p>
                </div>
              </div>
              {mentor.bio && <p className="text-xs text-gray-500 line-clamp-3 mb-3">{mentor.bio}</p>}
              <Link href="/dashboard/messages" className="btn-secondary w-full justify-center text-xs py-2">
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-400">Mentor not yet assigned.</p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-xs font-medium text-gray-500 mb-1">Next session</p>
            <Link href="/dashboard/sessions" className="text-xs text-teal-700 hover:underline">
              View session schedule
            </Link>
          </div>
        </div>

        <PeerAccountabilityCard partnership={partnership} />
      </div>
    </div>
  )
}
