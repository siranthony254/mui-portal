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

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  if (!content.trim()) return { error: 'Message cannot be empty.' }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content.trim(),
    read_by: [user.id],
  })

  if (error) return { error: error.message }
  return { success: true }
}
