import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { getInitials, formatDate } from '@/lib/utils'
import { Metadata } from 'next'
export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id',user.id).single()
  if (!profile) redirect('/auth/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4">
      <h1 className="page-title text-lg sm:text-xl">My Profile</h1>
      <div className="card p-4 sm:p-6 flex items-center gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">{getInitials(profile.full_name)}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{profile.full_name}</h2>
          <p className="text-sm text-gray-400 truncate">{profile.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="badge badge-teal text-xs capitalize">{profile.role}</span>
            {profile.institution_type && <span className={`badge text-xs ${profile.institution_type==='tvet'?'badge-blue':profile.institution_type==='kmtc'?'badge-purple':'badge-gray'}`}>{profile.institution_type}</span>}
            <span className="text-xs text-gray-400">Joined {formatDate(profile.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="card p-4 sm:p-6"><p className="section-title text-sm">Edit profile</p><ProfileForm profile={profile} /></div>
    </div>
  )
}
