import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { NotificationAutomation } from '@/components/admin/NotificationAutomation'

export const metadata: Metadata = { title: 'Notification Automation — Control Room' }

export default async function AutomationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Notification Automation</h1>
          <p className="text-sm text-gray-500 font-medium">Configure automated notification schedules and intelligent delivery rules</p>
        </div>
      </div>

      <NotificationAutomation />
    </div>
  )
}
