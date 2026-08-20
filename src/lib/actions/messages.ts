'use server'

import { createClient } from '@/lib/supabase/server'

export async function getOrCreateConversation(otherUserId: string, cohortId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const participantIds = [user.id, otherUserId].sort()

  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .contains('participant_ids', participantIds)
    .limit(1)
    .single()

  if (existing) return { conversationId: existing.id }

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ participant_ids: participantIds, cohort_id: cohortId || null })
    .select('id')
    .single()

  if (error) return { error: error.message }
  return { conversationId: created.id }
}

export async function sendMessage(conversationId: string, content: string, audioUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  if (!content.trim() && !audioUrl) return { error: 'Message cannot be empty.' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim() || '[Voice Note]',
    audio_url: audioUrl,
    read_by: [user.id],
  })

  if (error) return { error: error.message }

  // 1. Get other participants to notify them
  const { data: convo } = await supabase.from('conversations').select('participant_ids').eq('id', conversationId).single()
  const others = convo?.participant_ids?.filter((id: string) => id !== user.id) || []

  if (others.length > 0) {
    const { data: sender } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    const notifications = others.map((id: string) => ({
      user_id: id,
      title: 'New Message',
      message: `${sender?.full_name || 'Someone'} sent you a message.`,
      type: 'message',
      link: '/dashboard/messages'
    }))

    await supabase.from('notifications').insert(notifications)
  }

  return { success: true }
}
