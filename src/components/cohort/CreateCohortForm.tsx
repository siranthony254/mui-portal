'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CreateCohortForm() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setResult(null)
    const data = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('cohorts').insert({
      name: data.get('name'), semester: data.get('semester'),
      year: parseInt(data.get('year') as string),
      max_participants: parseInt(data.get('max_participants') as string) || 25,
      start_date: data.get('start_date') || null, end_date: data.get('end_date') || null,
      status: 'draft', current_week: 1, applications_open: false,
      vision_clubs_enabled: false, capstone_submissions_enabled: false, chat_enabled: true,
    })
    if (error) { setResult({ error: error.message }) }
    else { setResult({ success: 'Cohort created.' }); setOpen(false); router.refresh() }
    setLoading(false)
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-primary text-sm">+ Create new cohort</button>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Cohort name *</label><input name="name" type="text" required placeholder="e.g. MUI Cohort 1 — Sem 1 2026" className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label><select name="semester" required className="select"><option value="">Select...</option><option value="Semester 1">Semester 1</option><option value="Semester 2">Semester 2</option><option value="January Intake">January Intake</option><option value="May Intake">May Intake</option><option value="September Intake">September Intake</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><input name="year" type="number" required defaultValue={new Date().getFullYear()} min={2024} max={2035} className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Max participants</label><input name="max_participants" type="number" defaultValue={25} min={5} max={50} className="input" /><p className="text-xs text-gray-400 mt-1">MUI recommends 15–25</p></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Start date</label><input name="start_date" type="date" className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">End date</label><input name="end_date" type="date" className="input" /></div>
      </div>
      {result?.error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{result.error}</div>}
      {result?.success && <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">{result.success}</div>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create cohort'}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
