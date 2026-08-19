import { sendgrid, getFromEmail, getReplyToEmail } from './sendgrid'
import {
  getStudentWaitlistTemplate,
  getMentorApplicationReceivedTemplate,
  getMentorApprovedTemplate,
  getStudentAdmissionTemplate,
} from './templates'

export async function sendStudentWaitlistEmail(to: string, fullName: string) {
  if (!sendgrid) {
    console.log(`[SendGrid Mock] Student waitlist email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentWaitlistTemplate({ fullName })
    await sendgrid.send({
      to,
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      subject: 'Application Received - MUI Forge',
      html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error)
    return { success: false, error: error.message || error }
  }
}

export async function sendMentorRequestReceivedEmail(to: string, fullName: string) {
  if (!sendgrid) {
    console.log(`[SendGrid Mock] Mentor request email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorApplicationReceivedTemplate({ fullName })
    await sendgrid.send({
      to,
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      subject: 'Mentor Request Received - MUI Forge',
      html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error)
    return { success: false, error: error.message || error }
  }
}

export async function sendMentorApprovalNotification(to: string, fullName: string, approved: boolean, loginUrl: string) {
  if (!sendgrid || !approved) {
    console.log(`[SendGrid Mock] Mentor status email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorApprovedTemplate({ fullName, loginUrl })
    await sendgrid.send({
      to,
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      subject: 'Mentor Access Activated! - MUI Forge',
      html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error)
    return { success: false, error: error.message || error }
  }
}

export async function sendStudentAdmissionNotification(to: string, fullName: string, cohortName: string, dashboardUrl: string) {
  if (!sendgrid) {
    console.log(`[SendGrid Mock] Student admission email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentAdmissionTemplate({ fullName, cohortName, dashboardUrl })
    await sendgrid.send({
      to,
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      subject: `Admission Confirmed: ${cohortName} - MUI Forge`,
      html,
    })
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid Error:', error.response?.body || error)
    return { success: false, error: error.message || error }
  }
}
