'use server'

import { writeClient } from '@/lib/sanity/client'
import { revalidatePath } from 'next/cache'

export async function createStandaloneContent(formData: FormData) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const contentType = formData.get('contentType') as string
  const url = formData.get('url') as string
  const youtubeId = formData.get('youtubeId') as string
  const pillarNumber = parseInt(formData.get('pillarNumber') as string)
  const weekNumber = parseInt(formData.get('weekNumber') as string)
  const isRequired = formData.get('isRequired') === 'true'

  try {
    const doc = {
      _type: 'content',
      title,
      description,
      contentType,
      url: contentType !== 'article' ? url : undefined,
      youtubeId: contentType === 'video' ? youtubeId : undefined,
      pillarNumber,
      weekNumber,
      isRequired,
      publishedAt: new Date().toISOString(),
    }

    await writeClient.create(doc)
    revalidatePath('/admin/content')
    revalidatePath('/dashboard/content')
    return { success: true }
  } catch (error: any) {
    console.error('Sanity Create Error:', error)
    return { error: error.message }
  }
}

export async function deleteSanityDocument(id: string) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  try {
    await writeClient.delete(id)
    revalidatePath('/admin/content')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function createAnnouncement(formData: FormData) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  const title = formData.get('title') as string
  const targetRoles = formData.getAll('targetRoles') as string[]
  const cohortId = formData.get('cohortId') as string

  try {
    const doc = {
      _type: 'announcement',
      title,
      targetRoles,
      cohortId: cohortId || undefined,
      publishedAt: new Date().toISOString(),
    }

    await writeClient.create(doc)
    revalidatePath('/admin/announcements')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
