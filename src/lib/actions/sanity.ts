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

export async function updateCohortCurriculum(data: {
  cohortId: string
  pillarNumber: number
  weekNumber: number
  dayNumber: number
  contentBlock: any
  journalPrompt?: string
}) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  try {
    // 1. Find or create the curriculum document for this cohort
    const query = `*[_type == "curriculum" && cohortId == $cohortId][0]`
    let curriculum = await writeClient.fetch(query, { cohortId: data.cohortId })

    if (!curriculum) {
      curriculum = await writeClient.create({
        _type: 'curriculum',
        cohortId: data.cohortId,
        pillars: []
      })
    }

    // 2. Prepare the hierarchy locally
    const pillars = curriculum.pillars || []
    let pillar = pillars.find((p: any) => p.number === data.pillarNumber)
    if (!pillar) {
      pillar = { _key: `p${data.pillarNumber}`, number: data.pillarNumber, name: `Pillar ${data.pillarNumber}`, modules: [] }
      pillars.push(pillar)
    }

    const modules = pillar.modules || []
    let module = modules.find((m: any) => m.weekNumber === data.weekNumber)
    if (!module) {
      module = { _key: `w${data.weekNumber}`, weekNumber: data.weekNumber, sessions: [] }
      modules.push(module)
    }

    const sessions = module.sessions || []
    let session = sessions.find((s: any) => s.dayNumber === data.dayNumber)
    if (!session) {
      session = { _key: `d${data.dayNumber}`, dayNumber: data.dayNumber, title: `Day ${data.dayNumber}`, contentBlocks: [], subsessions: [] }
      sessions.push(session)
    }

    // Add the new content block
    session.contentBlocks = [...(session.contentBlocks || []), { ...data.contentBlock, _key: Math.random().toString(36).substring(2) }]

    // Update journal prompt if provided
    if (data.journalPrompt) {
      session.journalPrompt = data.journalPrompt
    }

    await writeClient.patch(curriculum._id).set({ pillars }).commit()

    revalidatePath('/admin/content')
    revalidatePath('/dashboard/cohort')
    return { success: true }
  } catch (error: any) {
    console.error('Sanity Curriculum Error:', error)
    return { error: error.message }
  }
}

export async function deleteCurriculumSession(cohortId: string, pillarNumber: number, weekNumber: number, dayNumber: number) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }
  try {
    const query = `*[_type == "curriculum" && cohortId == $cohortId][0]`
    const curriculum = await writeClient.fetch(query, { cohortId })
    if (!curriculum) return { error: 'Curriculum not found' }

    const pillars = curriculum.pillars || []
    const pillar = pillars.find((p: any) => p.number === pillarNumber)
    const module = pillar?.modules?.find((m: any) => m.weekNumber === weekNumber)

    if (module?.sessions) {
      module.sessions = module.sessions.filter((s: any) => s.dayNumber !== dayNumber)
      await writeClient.patch(curriculum._id).set({ pillars }).commit()
      revalidatePath('/admin/content')
      return { success: true }
    }
    return { error: 'Session not found' }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function deleteCurriculumPillar(cohortId: string, pillarNumber: number) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }
  try {
    const query = `*[_type == "curriculum" && cohortId == $cohortId][0]`
    const curriculum = await writeClient.fetch(query, { cohortId })
    if (!curriculum) return { error: 'Curriculum not found' }

    let pillars = curriculum.pillars || []
    pillars = pillars.filter((p: any) => p.number !== pillarNumber)

    await writeClient.patch(curriculum._id).set({ pillars }).commit()
    revalidatePath('/admin/content')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

export async function updateCurriculumPillar(data: {
  cohortId: string
  pillarNumber: number
  name: string
  description?: string
}) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }
  try {
    const query = `*[_type == "curriculum" && cohortId == $cohortId][0]`
    const curriculum = await writeClient.fetch(query, { cohortId: data.cohortId })
    if (!curriculum) return { error: 'Curriculum not found' }

    const pillars = curriculum.pillars || []
    let pillar = pillars.find((p: any) => p.number === data.pillarNumber)

    if (pillar) {
      pillar.name = data.name
      pillar.description = data.description
      await writeClient.patch(curriculum._id).set({ pillars }).commit()
      revalidatePath('/admin/content')
      return { success: true }
    }
    return { error: 'Pillar not found' }
  } catch (e: any) {
    return { error: e.message }
  }
}


