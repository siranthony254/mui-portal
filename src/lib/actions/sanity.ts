'use server'

import { writeClient } from '@/lib/sanity/client'
import { revalidatePath } from 'next/cache'

async function uploadAsset(file: File) {
    if (!writeClient) throw new Error('Sanity Write Client not configured.')
    const asset = await writeClient.assets.upload(file.type.startsWith('image/') ? 'image' : 'file', file)
    return asset
}

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

export async function updateStandaloneContent(id: string, formData: FormData) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const contentType = formData.get('contentType') as string
  const url = formData.get('url') as string
  const youtubeId = formData.get('youtubeId') as string
  const body = formData.get('body') as string
  const pillarNumber = parseInt(formData.get('pillarNumber') as string)
  const weekNumber = parseInt(formData.get('weekNumber') as string)
  const isRequired = formData.get('isRequired') === 'true'

  try {
    const doc = {
      title,
      description,
      contentType,
      url: contentType !== 'article' ? url : undefined,
      youtubeId: contentType === 'video' ? youtubeId : undefined,
      body: body || undefined,
      pillarNumber,
      weekNumber,
      isRequired,
    }

    await writeClient.patch(id).set(doc).commit()
    revalidatePath('/admin/content')
    revalidatePath('/dashboard/content')
    return { success: true }
  } catch (error: any) {
    console.error('Sanity Update Error:', error)
    return { error: error.message }
  }
}

export async function createSupplementaryResource(formData: FormData) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const contentType = formData.get('contentType') as string
  const url = formData.get('url') as string
  const body = formData.get('body') as string
  const cohortId = formData.get('cohortId') as string
  const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean)
  const file = formData.get('file') as File | null

  try {
    let url = formData.get('url') as string

    if (file && file.size > 0) {
        const asset = await uploadAsset(file)
        url = asset.url
    }

    const doc = {
      _type: 'resource',
      title,
      description,
      contentType,
      url: url || undefined,
      body: body ? [{
          _type: 'block',
          _key: Math.random().toString(36).substring(2),
          children: [{ _type: 'span', text: body, marks: [] }],
          markDefs: [],
          style: 'normal'
      }] : undefined,
      cohortId: cohortId || undefined,
      tags: tags || [],
      publishedAt: new Date().toISOString(),
    }

    await writeClient.create(doc)
    revalidatePath('/admin/content')
    revalidatePath('/dashboard/resources')
    return { success: true }
  } catch (error: any) {
    console.error('Sanity Create Resource Error:', error)
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
  sessionNumber: number
  contentBlock: any
  journalPrompt?: string
  file?: File | null
}) {
  if (!writeClient) return { error: 'Sanity Write Client not configured.' }

  try {
    // Handle File Upload if present
    if (data.file && data.file.size > 0) {
        const asset = await uploadAsset(data.file)

        if (data.contentBlock._type === 'imageBlock') {
            data.contentBlock.image = {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            }
        } else if (data.contentBlock._type === 'fileBlock') {
            data.contentBlock.file = {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            }
        } else if (data.contentBlock._type === 'videoBlock') {
            data.contentBlock.videoFile = {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            }
        }

        data.contentBlock.url = asset.url
    }
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

    // 2. Prepare the hierarchy locally: Pillar -> Module (Week) -> Day -> Sessions
    const pillars = curriculum.pillars || []
    let pillar = pillars.find((p: any) => p.number === data.pillarNumber)
    if (!pillar) {
      pillar = { _key: `p${data.pillarNumber}`, number: data.pillarNumber, name: `Pillar ${data.pillarNumber}`, modules: [] }
      pillars.push(pillar)
    }

    const modules = pillar.modules || []
    let module = modules.find((m: any) => m.weekNumber === data.weekNumber)
    if (!module) {
      module = { _key: `w${data.weekNumber}`, weekNumber: data.weekNumber, days: [] }
      modules.push(module)
    }

    const days = module.days || []
    let day = days.find((d: any) => d.dayNumber === data.dayNumber)
    if (!day) {
      day = { _key: `d${data.dayNumber}`, dayNumber: data.dayNumber, title: `Day ${data.dayNumber}`, sessions: [] }
      days.push(day)
    }

    const sessions = day.sessions || []
    let session = sessions.find((s: any) => s.sessionNumber === data.sessionNumber)
    if (!session) {
      session = { _key: `s${data.sessionNumber}`, sessionNumber: data.sessionNumber, title: `Session ${data.sessionNumber}`, contentBlocks: [] }
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

export async function uploadVoiceJournal(data: {
    studentId: string
    weekNumber: number
    pillarNumber: number
    file: File
    duration?: number
}) {
    if (!writeClient) return { error: 'Sanity Write Client not configured.' }

    try {
        const asset = await uploadAsset(data.file)

        const doc = {
            _type: 'voiceJournal',
            studentId: data.studentId,
            weekNumber: data.weekNumber,
            pillarNumber: data.pillarNumber,
            audioFile: {
                _type: 'file',
                asset: {
                    _type: 'reference',
                    _ref: asset._id
                }
            },
            duration: data.duration,
            publishedAt: new Date().toISOString()
        }

        await writeClient.create(doc)
        revalidatePath('/dashboard/journal')
        return { success: true }
    } catch (err: any) {
        console.error("Voice Journal Upload Error:", err)
        return { error: err.message }
    }
}

export async function getVoiceJournals(studentId: string, weekNumber?: number) {
    const query = weekNumber
        ? `*[_type == "voiceJournal" && studentId == $studentId && weekNumber == $weekNumber] | order(publishedAt desc)`
        : `*[_type == "voiceJournal" && studentId == $studentId] | order(publishedAt desc)`

    // We can use the read client here
    const { client } = await import('@/lib/sanity/client')
    if (!client) return []

    try {
        const data = await client.fetch(query, { studentId, weekNumber })
        return data
    } catch (err) {
        console.error("Fetch Voice Journals Error:", err)
        return []
    }
}

export async function uploadSanityAsset(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    try {
        const asset = await uploadAsset(file)
        return { success: true, url: asset.url }
    } catch (err: any) {
        return { error: err.message }
    }
}


