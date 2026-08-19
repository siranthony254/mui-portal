'use client'

import { useState } from 'react'
import { updateCohort } from '@/lib/actions/cohort'
import { PILLARS } from '@/types'
import type { Cohort, Pillar } from '@/types'
import { X, Save, Plus, Trash2, Edit3, ChevronDown, ChevronUp } from '@/components/icons'
import { cn } from '@/lib/utils'

export function CohortEditor({ cohort, onCancel }: { cohort: Cohort; onCancel: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: cohort.name,
    semester: cohort.semester,
    year: cohort.year,
    description: cohort.description || '',
    objectives: cohort.objectives || [],
    pillars_config: cohort.pillars_config || PILLARS.map(p => ({ ...p, objectives: [] })),
  })
  const [activeTab, setActiveTab] = useState<'basic' | 'pillars'>('basic')
  const [expandedPillar, setExpandedPillar] = useState<number | null>(1)

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.objectives]
    newObjectives[index] = value
    setFormData({ ...formData, objectives: newObjectives })
  }

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] })
  }

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index)
    setFormData({ ...formData, objectives: newObjectives })
  }

  const handlePillarChange = (pillarNum: number, field: keyof Pillar, value: any) => {
    const newPillars = formData.pillars_config.map(p => {
      if (p.number === pillarNum) {
        return { ...p, [field]: value }
      }
      return p
    })
    setFormData({ ...formData, pillars_config: newPillars })
  }

  const handlePillarObjectiveChange = (pillarNum: number, objIndex: number, value: string) => {
    const newPillars = formData.pillars_config.map(p => {
      if (p.number === pillarNum) {
        const newObjs = [...(p.objectives || [])]
        newObjs[objIndex] = value
        return { ...p, objectives: newObjs }
      }
      return p
    })
    setFormData({ ...formData, pillars_config: newPillars })
  }

  const addPillarObjective = (pillarNum: number) => {
    const newPillars = formData.pillars_config.map(p => {
      if (p.number === pillarNum) {
        return { ...p, objectives: [...(p.objectives || []), ''] }
      }
      return p
    })
    setFormData({ ...formData, pillars_config: newPillars })
  }

  const removePillarObjective = (pillarNum: number, objIndex: number) => {
    const newPillars = formData.pillars_config.map(p => {
      if (p.number === pillarNum) {
        const newObjs = (p.objectives || []).filter((_, i) => i !== objIndex)
        return { ...p, objectives: newObjs }
      }
      return p
    })
    setFormData({ ...formData, pillars_config: newPillars })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await updateCohort(cohort.id, formData)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      onCancel()
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Cohort</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Control Room / Settings</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex border-b border-gray-100 px-6 bg-white">
        <button
          onClick={() => setActiveTab('basic')}
          className={cn(
            "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
            activeTab === 'basic' ? "border-teal-600 text-teal-700" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Basic Info & Objectives
        </button>
        <button
          onClick={() => setActiveTab('pillars')}
          className={cn(
            "px-4 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
            activeTab === 'pillars' ? "border-teal-600 text-teal-700" : "border-transparent text-gray-400 hover:text-gray-600"
          )}
        >
          Pillar Configuration
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="label">Cohort Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g. Identity & Influence"
                  required
                />
              </div>
              <div>
                <label className="label">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Semester / Cycle</label>
              <input
                value={formData.semester}
                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                className="input"
                placeholder="e.g. Semester 1"
                required
              />
            </div>

            <div>
              <label className="label">Cohort Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="textarea"
                rows={4}
                placeholder="Describe the focus of this cohort..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Cohort Objectives</label>
                <button type="button" onClick={addObjective} className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Objective
                </button>
              </div>
              <div className="space-y-2">
                {formData.objectives.map((obj, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={obj}
                      onChange={e => handleObjectiveChange(i, e.target.value)}
                      className="input"
                      placeholder={`Objective #${i + 1}`}
                    />
                    <button type="button" onClick={() => removeObjective(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.objectives.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No objectives added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pillars' && (
          <div className="space-y-4">
            {formData.pillars_config.map((pillar) => (
              <div key={pillar.number} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setExpandedPillar(expandedPillar === pillar.number ? null : pillar.number)}
                  className={cn(
                    "w-full px-5 py-4 flex items-center justify-between text-left transition-colors",
                    expandedPillar === pillar.number ? "bg-teal-50/50" : "bg-white hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-black">
                      {pillar.number}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{pillar.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pillar.weeks}</p>
                    </div>
                  </div>
                  {expandedPillar === pillar.number ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {expandedPillar === pillar.number && (
                  <div className="p-5 border-t border-gray-100 bg-white space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Pillar Name</label>
                        <input
                          value={pillar.name}
                          onChange={e => handlePillarChange(pillar.number, 'name', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Subtitle</label>
                        <input
                          value={pillar.subtitle}
                          onChange={e => handlePillarChange(pillar.number, 'subtitle', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Weeks</label>
                        <input
                          value={pillar.weeks}
                          onChange={e => handlePillarChange(pillar.number, 'weeks', e.target.value)}
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Main Goal</label>
                        <input
                          value={pillar.goal}
                          onChange={e => handlePillarChange(pillar.number, 'goal', e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Pillar Description</label>
                      <textarea
                        value={pillar.description}
                        onChange={e => handlePillarChange(pillar.number, 'description', e.target.value)}
                        className="textarea"
                        rows={2}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="label mb-0 text-[10px] font-black uppercase tracking-widest text-gray-400">Pillar Objectives</label>
                        <button type="button" onClick={() => addPillarObjective(pillar.number)} className="text-[9px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1">
                          <Plus className="w-2.5 h-2.5" /> Add Objective
                        </button>
                      </div>
                      <div className="space-y-2">
                        {pillar.objectives?.map((obj, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              value={obj}
                              onChange={e => handlePillarObjectiveChange(pillar.number, i, e.target.value)}
                              className="input py-1 text-xs"
                              placeholder={`Objective #${i + 1}`}
                            />
                            <button type="button" onClick={() => removePillarObjective(pillar.number, i)} className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {(pillar.objectives || []).length === 0 && (
                          <p className="text-[10px] text-gray-400 italic">No specific objectives for this pillar.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <X className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}
      </form>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary text-xs uppercase tracking-widest font-black">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-xs uppercase tracking-widest font-black flex items-center gap-2"
        >
          {loading ? 'Saving Changes...' : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  )
}
