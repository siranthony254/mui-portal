import { createClient, createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ShieldCheck, UserPlus, Mail, Lock, User, Award } from '@/components/icons'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Role Management' }

export default async function RoleManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = await createAdminClient()

  // Get all admins
  const { data: admins } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'admin')
    .order('created_at', { ascending: false })

  // Get all mentors
  const { data: mentors } = await admin
    .from('profiles')
    .select('*')
    .eq('role', 'mentor')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <h1 className="page-title uppercase tracking-tighter">Role Management</h1>
        <p className="text-sm text-gray-500 mt-1">Assign admin and mentor roles to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Admin Role Assignment */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin Role</h2>
              <p className="text-xs text-gray-500">Full system access</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <form action={async (formData: FormData) => {
              'use server'
              const email = formData.get('email') as string
              const password = formData.get('password') as string
              const fullName = formData.get('fullName') as string

              const admin = await createAdminClient()

              // Create user in Supabase Auth
              const { data: authData, error: authError } = await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
              })

              if (authError) {
                console.error('Auth error:', authError)
                return
              }

              // Create profile with admin role
              const { error: profileError } = await admin.from('profiles').insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                role: 'admin',
                status: 'approved',
                approved: true,
                onboarded: true
              })

              if (profileError) {
                console.error('Profile error:', profileError)
                return
              }

              revalidatePath('/admin/roles')
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:ring-0 text-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:ring-0 text-sm"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-purple-500 focus:ring-0 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" className="w-full btn-primary bg-purple-700 hover:bg-purple-800">
                <UserPlus className="w-4 h-4" /> Create Admin
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Admins ({admins?.length || 0})</h3>
            <div className="card divide-y divide-gray-50">
              {admins?.map((admin: any) => (
                <div key={admin.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                    {admin.full_name?.charAt(0) || admin.email?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{admin.full_name || admin.email}</p>
                    <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                  </div>
                  <span className="badge badge-purple">Admin</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mentor Role Assignment */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mentor Role</h2>
              <p className="text-xs text-gray-500">Student guidance & review</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <form action={async (formData: FormData) => {
              'use server'
              const email = formData.get('email') as string
              const password = formData.get('password') as string
              const fullName = formData.get('fullName') as string
              const bio = formData.get('bio') as string

              const admin = await createAdminClient()

              // Create user in Supabase Auth
              const { data: authData, error: authError } = await admin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
              })

              if (authError) {
                console.error('Auth error:', authError)
                return
              }

              // Create profile with mentor role
              const { error: profileError } = await admin.from('profiles').insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                bio,
                role: 'mentor',
                status: 'approved',
                approved: true,
                onboarded: false
              })

              if (profileError) {
                console.error('Profile error:', profileError)
                return
              }

              revalidatePath('/admin/roles')
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 text-sm"
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 text-sm"
                  placeholder="mentor@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bio (Optional)</label>
                <textarea
                  name="bio"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:ring-0 text-sm resize-none"
                  placeholder="Brief description of the mentor..."
                />
              </div>
              <button type="submit" className="w-full btn-primary">
                <UserPlus className="w-4 h-4" /> Create Mentor
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Mentors ({mentors?.length || 0})</h3>
            <div className="card divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {mentors?.map((mentor: any) => (
                <div key={mentor.id} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    {mentor.full_name?.charAt(0) || mentor.email?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{mentor.full_name || mentor.email}</p>
                    <p className="text-xs text-gray-500 truncate">{mentor.email}</p>
                  </div>
                  <span className={`badge ${mentor.status === 'approved' ? 'badge-emerald' : 'badge-amber'}`}>
                    {mentor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
