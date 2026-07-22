import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY || ''
export const resend = apiKey && apiKey !== 'your_resend_api_key_here' ? new Resend(apiKey) : null

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'MUI Portal <onboarding@resend.dev>'
}

export function getReplyToEmail(): string {
  return process.env.RESEND_REPLY_TO_EMAIL || 'micdupinitiative@gmail.com'
}

