'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Layers } from '@/components/icons'
import { cn } from '@/lib/utils'

export function CreateCohortForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Cohort Objectives State
  const [objectives, setObjectives] = useState<string[]>([])

  // Pillars Config State
  const [pillars, setPillars] = useState<any[]>([
    { number: 1, name: 'Identity', subtitle: 'Understanding self & belief systems', goal: 'Clarity of self', weeks: 'Weeks 1–2', description: '', objectives: [] }
  ])

  const router = useRouter()

  const addObjective = () => setObjectives([...objectives, ''])
  const removeObjective = (index: number) => setObjectives(objectives.filter((_, i) => i !== index))
  const updateObjective = (index: number, value: string) => {
    const newObjs = [...objectives]
    newObjs[index] = value
    setObjectives(newObjs)
  }

  const addPillar = () => {
    setPillars([...pillars, { number: pillars.length + 1, name: '', subtitle: '', goal: '', weeks: `Weeks ${pillars.length * 2 + 1}–${pillars.length * 2 + 2}`, description: '', objectives: [] }])
  }

  const removePillar = (index: number) => {
    setPillars(pillars.filter((_, i) => i !== index).map((p, i) => ({ ...p, number: i + 1, weeks: `Weeks ${i * 2 + 1}–${i * 2 + 2}` })))
  }

  const updatePillar = (index: number, field: string, value: any) => {
    const newPillars = [...pillars]
    newPillars[index] = { ...newPillars[index], [field]: value }
    setPillars(newPillars)
  }

  const updatePillarObjective = (pIndex: number, oIndex: number, value: string) => {
    const newPillars = [...pillars]
    const currentObjs = Array.isArray(newPillars[pIndex].objectives) ? newPillars[pIndex].objectives : []
    const newObjs = [...currentObjs]
    newObjs[oIndex] = value
    newPillars[pIndex].objectives = newObjs
    setPillars(newPillars)
  }

  const addPillarObjective = (pIndex: number) => {
    const newPillars = [...pillars]
    const currentObjs = Array.isArray(newPillars[pIndex].objectives) ? newPillars[pIndex].objectives : []
    newPillars[pIndex].objectives = [...currentObjs, '']
    setPillars(newPillars)
  }

  const removePillarObjective = (pIndex: number, oIndex: number) => {
    const newPillars = [...pillars]
    const currentObjs = Array.isArray(newPillars[pIndex].objectives) ? newPillars[pIndex].objectives : []
    newPillars[pIndex].objectives = currentObjs.filter((_: any, i: number) => i !== oIndex)
    setPillars(newPillars)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult(null)
    const data = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error } = await supabase.from('cohorts').insert({
      name: data.get('name'),
      semester: data.get('semester'),
      year: parseInt(data.get('year') as string),
      max_participants: parseInt(data.get('max_participants') as string) || 25,
      description: data.get('description'),
      objectives: objectives.filter(o => o.trim() !== ''),
      start_date: data.get('start_date') || null,
      end_date: data.get('end_date') || null,
      pillars_config: pillars.map(p => ({
        ...p,
        objectives: (p.objectives as string[]).filter(o => o.trim() !== '')
      })),
      status: 'draft',
      current_week: 1,
      applications_open: false,
      vision_clubs_enabled: false,
      capstone_submissions_enabled: false,
      chat_enabled: true,
    })

    if (error) {
        setResult({ error: error.message })
    } else {
        setResult({ success: 'Cohort created.' });
        setOpen(false);
        router.refresh()
    }
    setLoading(false)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 active:scale-95">
      <Plus className="w-4 h-4" />
      Create New Cohort
    </button>
  )

  return (
    <div className="card p-8 shadow-2xl border-emerald-50 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center shadow-lg">
                    <Plus className="w-4 h-4 text-white" />
                </div>
                Create New Cohort
            </h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <Layers className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cohort Identity</label>
                    <input name="name" type="text" required placeholder="e.g. MUI Forge — Sem 1 2026" className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold" />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cohort Description</label>
                    <textarea name="description" rows={3} placeholder="What is the focus of this specific cohort?" className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 text-sm font-medium" />
                </div>

                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Cohort Objectives</label>
                        <button type="button" onClick={addObjective} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Add Objective
                        </button>
                    </div>
                    {objectives.map((obj, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                value={obj}
                                onChange={(e) => updateObjective(i, e.target.value)}
                                placeholder={`Objective #${i+1}`}
                                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:border-emerald-500 focus:ring-0"
                            />
                            <button type="button" onClick={() => removeObjective(i)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {objectives.length === 0 && <p className="text-[10px] text-gray-400 italic px-1">No objectives added yet.</p>}
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Academic Semester</label>
                    <select name="semester" required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold text-sm">
                        <option value="">Select...</option>
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="January Intake">January Intake</option>
                        <option value="May Intake">May Intake</option>
                        <option value="September Intake">September Intake</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Year</label>
                    <input name="year" type="number" required defaultValue={new Date().getFullYear()} min={2024} max={2035} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold" />
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Participants</label>
                    <input name="max_participants" type="number" defaultValue={25} min={5} max={50} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                        <input name="start_date" type="date" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                        <input name="end_date" type="date" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 font-bold text-xs" />
                    </div>
                </div>
            </div>

            {/* 2. Dynamic Pillars Configuration */}
            <section className="space-y-6 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Formation Pillars</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Define the 2-week structure for this cohort.</p>
                    </div>
                    <button
                        type="button"
                        onClick={addPillar}
                        className="bg-gray-100 hover:bg-emerald-700 hover:text-white text-emerald-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        + Add Pillar
                    </button>
                </div>

                <div className="space-y-4">
                    {pillars.map((pillar, index) => (
                        <div key={index} className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-100 space-y-4 animate-reveal relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-lg">
                                        {pillar.number}
                                    </div>
                                    <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Pillar Configuration</h4>
                                </div>
                                {pillars.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePillar(index)}
                                        className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        value={pillar.name}
                                        onChange={(e) => updatePillar(index, 'name', e.target.value)}
                                        placeholder="Pillar Name (e.g. Identity)"
                                        required
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-bold"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={pillar.subtitle}
                                        onChange={(e) => updatePillar(index, 'subtitle', e.target.value)}
                                        placeholder="Subtitle (e.g. Understanding self)"
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={pillar.goal}
                                        onChange={(e) => updatePillar(index, 'goal', e.target.value)}
                                        placeholder="Main Goal (e.g. Clarity of self)"
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <input
                                        value={pillar.weeks}
                                        onChange={(e) => updatePillar(index, 'weeks', e.target.value)}
                                        placeholder="Weeks (e.g. Weeks 1-2)"
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <textarea
                                        value={pillar.description}
                                        onChange={(e) => updatePillar(index, 'description', e.target.value)}
                                        placeholder="Pillar Description..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pillar Objectives</label>
                                        <button type="button" onClick={() => addPillarObjective(index)} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 flex items-center gap-1">
                                            <Plus className="w-2.5 h-2.5" /> Add
                                        </button>
                                    </div>
                                    {(pillar.objectives as string[]).map((obj, oi) => (
                                        <div key={oi} className="flex gap-2">
                                            <input
                                                value={obj}
                                                onChange={(e) => updatePillarObjective(index, oi, e.target.value)}
                                                placeholder={`Objective #${oi+1}`}
                                                className="flex-1 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-0"
                                            />
                                            <button type="button" onClick={() => removePillarObjective(index, oi)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {(pillar.objectives as string[]).length === 0 && <p className="text-[9px] text-gray-400 italic">No pillar objectives yet.</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {result?.error && <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-xs font-bold text-red-700 animate-shake">{result.error}</div>}

            <div className="flex gap-4 pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-emerald-700/40 hover:bg-emerald-800 transition-all disabled:opacity-50"
                >
                    {loading ? 'Initializing Cohort...' : 'Deploy Cohort Infrastructure'}
                </button>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all"
                >
                    Cancel
                </button>
            </div>
        </form>
    </div>
  )
}
