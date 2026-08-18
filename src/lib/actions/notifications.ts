'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMyNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase.from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}

export async function markAsRead(id: string) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ read: true }).eq('id', id)
  revalidatePath('/dashboard')
}
