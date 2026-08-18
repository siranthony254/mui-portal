import { client } from './client'
import type { ContentBlock, Course } from '@/types'

async function sanityFetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  if (!client) return [] as unknown as T
  try { return await client.fetch(query, params || {}) }
  catch { return [] as unknown as T }
}

async function sanityFetchOne<T>(query: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!client) return null
  try { return await client.fetch(query, params || {}) }
  catch { return null }
}

export async function getContentForWeek(p: number, w: number): Promise<ContentBlock[]> {
  return sanityFetch(`*[_type=="content"&&pillarNumber==$p&&weekNumber==$w]|order(isRequired desc){_id,title,description,contentType,url,youtubeId,body,pillarNumber,weekNumber,durationMinutes,isRequired,tags,publishedAt}`,{p,w})
}

export async function getContentForPillar(p: number): Promise<ContentBlock[]> {
  return sanityFetch(`*[_type=="content"&&pillarNumber==$p]|order(weekNumber asc,isRequired desc){_id,title,description,contentType,url,youtubeId,pillarNumber,weekNumber,durationMinutes,isRequired,tags}`,{p})
}

export async function getAllContent(): Promise<ContentBlock[]> {
  return sanityFetch(`*[_type=="content"]|order(pillarNumber asc,weekNumber asc){_id,title,description,contentType,url,youtubeId,pillarNumber,weekNumber,durationMinutes,isRequired,tags,publishedAt}`)
}

export async function getAllCourses(): Promise<Course[]> {
  return sanityFetch(`*[_type=="course"]|order(isCoreCurriculum desc,_createdAt asc){_id,title,"slug":slug.current,description,category,isCoreCurriculum,thumbnail,totalDurationMinutes,publishedAt,"moduleCount":count(modules)}`)
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return sanityFetchOne(`*[_type=="course"&&slug.current==$slug][0]{
    _id, title, "slug": slug.current, description, category, isCoreCurriculum, thumbnail, totalDurationMinutes, publishedAt,
    modules[]{
      _key, title, description,
      sessions[]{
        _key, title,
        contentBlocks[]{
          _key, _type, title, url, description, body, image, caption
        }
      }
    }
  }`,{slug})
}

export async function getAnnouncements(role: string, cohortId?: string): Promise<any[]> {
  const filter = cohortId?` && (cohortId==$cohortId||!defined(cohortId))`:''
  return sanityFetch(`*[_type=="announcement"&&$role in targetRoles${filter}&&(!defined(expiresAt)||expiresAt>now())]|order(publishedAt desc)[0...10]{_id,title,body,targetRoles,cohortId,publishedAt,expiresAt}`,{role,...(cohortId?{cohortId}:{})})
}

export async function getCohortCurriculum(cohortId: string): Promise<any | null> {
  return sanityFetchOne(`*[_type=="curriculum" && cohortId == $cohortId][0]{
    _id,
    cohortId,
    pillars[]{
        _key,
        number,
        name,
        description,
        modules[]{
            _key,
            weekNumber,
            title,
            introduction,
            sessions[]{
                _key,
                dayNumber,
                title,
                journalPrompt,
                contentBlocks[]{
                    _key,
                    _type,
                    title,
                    videoType,
                    youtubeEmbed,
                    videoFile,
                    description,
                    body,
                    image,
                    caption,
                    file,
                    externalUrl
                },
                subsessions[]{
                    _key,
                    title,
                    content
                }
            }
        }
    }
  }`, { cohortId })
}
