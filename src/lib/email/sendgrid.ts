import sgMail from '@sendgrid/mail'

const apiKey = process.env.SENDGRID_API_KEY || ''
if (apiKey && apiKey !== 'SG.your_api_key_here') {
  sgMail.setApiKey(apiKey)
}

export const sendgrid = apiKey && apiKey !== 'SG.your_api_key_here' ? sgMail : null

export function getFromEmail(): string {
  return process.env.SENDGRID_FROM_EMAIL || 'MUI Forge <noreply@formation.micdupinitiative.site>'
}

export function getReplyToEmail(): string {
  return process.env.SENDGRID_REPLY_TO_EMAIL || 'micdupinitiative@gmail.com'
}
