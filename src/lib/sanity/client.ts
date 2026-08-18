import { createClient as createSanityClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'
const isValid = projectId && /^[a-z0-9-]+$/.test(projectId)

export const client = isValid
  ? createSanityClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === 'production',
    })
  : null

export const writeClient = isValid && process.env.SANITY_API_TOKEN
  ? createSanityClient({
      projectId: projectId!,
      dataset,
      apiVersion,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false, // Must be false for writes
    })
  : null
