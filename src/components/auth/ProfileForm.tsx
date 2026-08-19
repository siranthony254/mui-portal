'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { COUNTIES } from '@/types'
import { useRouter } from 'next/navigation'

export function ProfileForm({ profile }: { profile: Profile }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true)
    const data = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      full_name: data.get('full_name'), institution: data.get('institution'),
      institution_type: data.get('institution_type'), year_of_study: data.get('year_of_study'),
      county: data.get('county'), phone: data.get('phone'), bio: data.get('bio'),
      expertise: (data.get('expertise') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      interests: (data.get('interests') as string)?.split(',').map(s => s.trim()).filter(Boolean),
    }).eq('id', profile.id)
    setResult(error ? { error: error.message } : { success: 'Profile updated.' })
    setLoading(false); if (!error) router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input name="full_name" defaultValue={profile.full_name} required className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input name="phone" defaultValue={profile.phone||''} className="input" placeholder="07XX XXX XXX" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">County</label><select name="county" defaultValue={profile.county||''} className="select"><option value="">Select...</option>{COUNTIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Institution</label><input name="institution" defaultValue={profile.institution||''} className="input" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select name="institution_type" defaultValue={profile.institution_type||''} className="select"><option value="">Select...</option><option value="university">University</option><option value="tvet">TVET</option><option value="college">College</option><option value="kmtc">KMTC</option></select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Year</label><select name="year_of_study" defaultValue={profile.year_of_study||''} className="select"><option value="">Select...</option><option value="1st year">1st year</option><option value="2nd year">2nd year</option><option value="3rd year">3rd year</option><option value="Final year">Final year</option></select></div>
        {profile.role === 'mentor' && (
          <>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label><input name="expertise" defaultValue={profile.expertise?.join(', ')} className="input" placeholder="e.g. Design, Product, Leadership (comma separated)" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Interests</label><input name="interests" defaultValue={profile.interests?.join(', ')} className="input" placeholder="e.g. Mentoring, Startups, Theology (comma separated)" /></div>
          </>
        )}
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea name="bio" rows={3} defaultValue={profile.bio||''} className="textarea" placeholder="Brief description of yourself..." /></div>
      </div>
      {result?.error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">{result.error}</div>}
      {result?.success && <div className="p-3 bg-teal-50 border border-teal-100 rounded-lg text-sm text-teal-700">{result.success}</div>}
      <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save changes'}</button>
    </form>
  )
}
