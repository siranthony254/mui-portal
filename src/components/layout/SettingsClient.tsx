'use client'
import { useState } from 'react'
import { toggleCohortFeature } from '@/lib/actions/cohort'
import { cn } from '@/lib/utils'
import type { Cohort } from '@/types'

export function SettingsClient({ cohorts }: { cohorts: Cohort[] }) {
  const [states, setStates] = useState<Record<string,Cohort>>(Object.fromEntries(cohorts.map(c=>[c.id,c])))
  const [loading, setLoading] = useState<string|null>(null)

  async function handleToggle(cohortId: string, feature: any, value: boolean) {
    const key = `${cohortId}-${feature}`; setLoading(key)
    const res = await toggleCohortFeature(cohortId, feature, value)
    if (res.success) setStates(prev=>({...prev,[cohortId]:{...prev[cohortId]!,[feature]:value}}))
    setLoading(null)
  }

  const features = [
    {key:'applications_open',label:'Applications open',desc:'Allow new students to apply'},
    {key:'chat_enabled',label:'Messaging enabled',desc:'Students & mentors can message each other'},
    {key:'vision_clubs_enabled',label:'Vision clubs visible',desc:'Students can see and join Vision Clubs'},
    {key:'capstone_submissions_enabled',label:'Capstone submissions',desc:'Students can submit final presentations'},
  ]

  return (
    <div className="card p-5">
      <p className="section-title">Per-cohort feature controls</p>
      <p className="text-xs text-gray-400 mb-4">Toggle features on or off for each cohort independently. Changes apply immediately.</p>
      <div className="space-y-6">
        {cohorts.map(cohort=>{
          const current = states[cohort.id]; if (!current) return null
          return (
            <div key={cohort.id}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-900">{cohort.name}</p>
                <span className={cn('badge text-xs',{'badge-teal':cohort.status==='active','badge-amber':cohort.status==='applications_open','badge-gray':cohort.status==='draft'||cohort.status==='completed'})}>{cohort.status.replace('_',' ')}</span>
              </div>
              <div className="space-y-2 pl-3 border-l-2 border-gray-100">
                {features.map(f=>{
                  const isOn = current[f.key as keyof Cohort] as boolean
                  const loadKey = `${cohort.id}-${f.key}`
                  return (
                    <div key={f.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                      <div><p className="text-sm font-medium text-gray-800">{f.label}</p><p className="text-xs text-gray-400">{f.desc}</p></div>
                      <button onClick={()=>handleToggle(cohort.id,f.key,!isOn)} disabled={loading===loadKey}
                        className={cn('relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ml-3',isOn?'bg-teal-600':'bg-gray-200',loading===loadKey&&'opacity-50 cursor-not-allowed')}>
                        <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',isOn?'left-5':'left-0.5')} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
