import { resend, getFromEmail, getReplyToEmail } from './resend'
import {
  getStudentWaitlistTemplate,
  getMentorApplicationReceivedTemplate,
  getMentorApprovedTemplate,
  getStudentAdmissionTemplate,
} from './templates'

export async function sendStudentWaitlistEmail(to: string, fullName: string) {
  if (!resend) {
    console.log(`[Resend Mock] Student waitlist email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentWaitlistTemplate({ fullName })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Application Received - MUI Portal',
      html,
    })
    if (error) return { success: false, error: error.message || error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

export async function sendMentorRequestReceivedEmail(to: string, fullName: string) {
  if (!resend) {
    console.log(`[Resend Mock] Mentor request email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorApplicationReceivedTemplate({ fullName })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Mentor Request Received - MUI Portal',
      html,
    })
    if (error) return { success: false, error: error.message || error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

export async function sendMentorApprovalNotification(to: string, fullName: string, approved: boolean, loginUrl: string) {
  if (!resend || !approved) {
    console.log(`[Resend Mock] Mentor status email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorApprovedTemplate({ fullName, loginUrl })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Mentor Access Activated! - MUI Portal',
      html,
    })
    if (error) return { success: false, error: error.message || error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

export async function sendStudentAdmissionNotification(to: string, fullName: string, cohortName: string, dashboardUrl: string) {
  if (!resend) {
    console.log(`[Resend Mock] Student admission email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentAdmissionTemplate({ fullName, cohortName, dashboardUrl })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: `Admission Confirmed: ${cohortName} - MUI Portal`,
      html,
    })
    if (error) return { success: false, error: error.message || error }
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}
