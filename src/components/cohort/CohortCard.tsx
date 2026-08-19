'use client'
import { useState } from 'react'
import Link from 'next/link'
import { openCohort, toggleCohortFeature, advanceCohortWeek, deleteCohort } from '@/lib/actions/cohort'
import { formatDate, cn } from '@/lib/utils'
import { PILLARS } from '@/types'
import { Users, FileText, Lightbulb, Play, MessageSquare, Trash2, Settings } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { CohortEditorWrapper } from '@/components/admin/CohortEditorWrapper'

export function CohortCard({ cohort, enrolledCount }: { cohort: any; enrolledCount: number }) {
  const [loading, setLoading] = useState<string|null>(null)
  const [msg, setMsg] = useState<string|null>(null)
  const [local, setLocal] = useState(cohort)
  const router = useRouter()

  async function handleOpen() {
    if (!confirm(`Open "${cohort.name}" and admit all waitlisted students?`)) return
    setLoading('open')
    const res = await openCohort(cohort.id)
    setMsg(res.success||res.error||null)
    if (res.success) setLocal((p:any) => ({...p, status:'active'}))
    setLoading(null)
  }

  async function handleToggle(feature: any, value: boolean) {
    setLoading(feature)
    const res = await toggleCohortFeature(cohort.id, feature, value)
    if (res.success) setLocal((p:any) => ({...p, [feature]:value}))
    setLoading(null)
  }

  async function handleAdvance() {
    if (!confirm(`Advance to Week ${local.current_week+1}?`)) return
    setLoading('week')
    const res = await advanceCohortWeek(cohort.id)
    setMsg(res.success||res.error||null)
    if (res.success) setLocal((p:any) => ({...p, current_week:p.current_week+1}))
    setLoading(null)
  }

  async function handleDelete() {
    if (!confirm(`PERMANENTLY DELETE cohort "${local.name}"? This will remove all enrollments and progress.`)) return
    setLoading('delete')
    const res = await deleteCohort(cohort.id)
    if (res.success) {
      router.push('/admin/cohorts')
      router.refresh()
    } else {
      setMsg(res.error || 'Failed to delete cohort.')
    }
    setLoading(null)
  }

  const statusColors: Record<string,string> = { draft:'badge-gray', applications_open:'badge-blue', active:'badge-teal', completed:'badge-purple' }
  const progress = Math.round(((local.current_week-1)/12)*100)
  const toggles = [
    {key:'applications_open',label:'Applications open',icon:FileText},
    {key:'vision_clubs_enabled',label:'Vision clubs',icon:Lightbulb},
    {key:'capstone_submissions_enabled',label:'Capstone submissions',icon:Play},
    {key:'chat_enabled',label:'Messaging',icon:MessageSquare},
  ]

  return (
    <div className="card overflow-hidden group">
      <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">{local.name}</h3>
            <span className={`badge text-xs ${statusColors[local.status]}`}>{local.status.replace('_',' ')}</span>
          </div>
          <p className="text-xs text-gray-400">{local.semester} {local.year}{local.start_date && ` · Starts ${formatDate(local.start_date)}`}</p>
          {local.description && <p className="text-xs text-gray-500 mt-2 line-clamp-1 italic">{local.description}</p>}
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-600 flex-shrink-0">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{enrolledCount}</span>
            <span className="text-gray-400">/ {local.max_participants}</span>
          </div>
          <CohortEditorWrapper cohort={local} />
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          {local.status === 'active' && (
            <>
              <div className="flex justify-between mb-2">
                <div><p className="text-sm font-medium text-gray-700">Week {local.current_week} of 12</p></div>
                <span className="text-sm font-semibold text-teal-700">{progress}%</span>
              </div>
              <div className="progress-bar mb-3"><div className="progress-fill" style={{width:`${progress}%`}} /></div>
              <div className="flex items-center gap-1.5 mb-4">
                {(local.pillars_config || PILLARS).map((p: any,i: number) => {
                  const pNum = Math.min(Math.ceil(local.current_week/2.4),5)
                  const done = p.number < pNum; const active = p.number === pNum
                  return (
                    <div key={p.number} className="flex items-center gap-1 flex-1">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                        active?'bg-teal-700 text-white':done?'bg-teal-100 text-teal-700':'bg-gray-100 text-gray-400')}>
                        {done?'✓':p.number}
                      </div>
                      {i < (local.pillars_config?.length || PILLARS.length) - 1 && <div className={cn('h-0.5 flex-1',done?'bg-teal-200':'bg-gray-100')} />}
                    </div>
                  )
                })}
              </div>
              <button onClick={handleAdvance} disabled={loading==='week'||local.current_week>=12} className="btn-secondary text-xs w-full justify-center">
                {loading==='week'?'Advancing...':`Advance to Week ${local.current_week+1}`}
              </button>
            </>
          )}
          {local.status !== 'active' && local.status !== 'completed' && (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs font-medium text-amber-800 mb-1">Ready to open?</p>
              <p className="text-xs text-amber-700 mb-3">Opening admits all waitlisted students and unlocks their dashboards automatically.</p>
              <button onClick={handleOpen} disabled={loading==='open'} className="btn-primary text-xs w-full justify-center bg-amber-600 hover:bg-amber-700 border-amber-600">
                {loading==='open'?'Opening...':'Open cohort & admit students'}
              </button>
            </div>
          )}
          {local.status === 'completed' && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-600">Cohort completed</p>
              <p className="text-xs text-gray-400 mt-1">{enrolledCount} students completed this cohort.</p>
            </div>
          )}
        </div>

        <div>
          <p className="section-title">Feature controls</p>
          <div className="space-y-2">
            {toggles.map(t => {
              const Icon = t.icon; const isOn = local[t.key] as boolean
              return (
                <div key={t.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2"><Icon className="w-3.5 h-3.5 text-gray-400" /><span className="text-sm text-gray-700">{t.label}</span></div>
                  <button onClick={() => handleToggle(t.key, !isOn)} disabled={loading===t.key}
                    className={cn('relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0', isOn?'bg-teal-600':'bg-gray-200', loading===t.key&&'opacity-50')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', isOn?'left-4':'left-0.5')} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {msg && <div className="mx-5 mb-4 p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">{msg}</div>}

      <div className="px-5 pb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href={`/admin/cohorts/${cohort.id}`} className="btn-secondary text-xs">Full settings</Link>
          <Link href={`/admin/students?cohort=${cohort.id}`} className="btn-secondary text-xs"><Users className="w-3.5 h-3.5" />Students ({enrolledCount})</Link>
          <Link href={`/admin/analytics?cohort=${cohort.id}`} className="btn-secondary text-xs">Analytics</Link>
        </div>
        <button
          onClick={handleDelete}
          disabled={loading === 'delete'}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          title="Delete Cohort"
        >
          {loading === 'delete' ? '...' : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
