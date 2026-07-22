import { resend, getFromEmail, getReplyToEmail } from './resend'
import {
  getStudentApplicationTemplate,
  getMentorApplicationTemplate,
  getSignInMagicLinkTemplate,
  getMentorStatusTemplate,
  getStudentAdmissionTemplate,
} from './templates'

export async function sendStudentApplicationEmail(to: string, fullName: string, loginUrl: string) {
  if (!resend) {
    console.log(`[Resend Mock] Student application email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentApplicationTemplate({ fullName, loginUrl })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Welcome to MUI Portal - Confirm Application',
      html,
    })
    if (error) {
      console.error('Resend API error sending student application email:', error)
      return { success: false, error: error.message || error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending student application email via Resend:', error)
    return { success: false, error }
  }
}

export async function sendMentorApplicationEmail(to: string, fullName: string) {
  if (!resend) {
    console.log(`[Resend Mock] Mentor application email to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorApplicationTemplate({ fullName })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Mentor Application Received - MUI Portal',
      html,
    })
    if (error) {
      console.error('Resend API error sending mentor application email:', error)
      return { success: false, error: error.message || error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending mentor application email via Resend:', error)
    return { success: false, error }
  }
}

export async function sendSignInLinkEmail(to: string, magicLink: string, fullName?: string) {
  if (!resend) {
    console.log(`[Resend Mock] Sign-in link email to ${to}: ${magicLink}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getSignInMagicLinkTemplate({ fullName, magicLink })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: 'Sign in to your MUI Portal Account',
      html,
    })
    if (error) {
      console.error('Resend API error sending sign-in link email:', error)
      return { success: false, error: error.message || error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending sign-in link email via Resend:', error)
    return { success: false, error }
  }
}

export async function sendMentorApprovalNotification(to: string, fullName: string, approved: boolean, loginUrl: string) {
  if (!resend) {
    console.log(`[Resend Mock] Mentor status email (${approved ? 'Approved' : 'Updated'}) to ${to}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getMentorStatusTemplate({ fullName, approved, loginUrl })
    const subject = approved ? 'Congratulations! Mentor Application Approved - MUI Portal' : 'Mentor Application Update - MUI Portal'
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject,
      html,
    })
    if (error) {
      console.error('Resend API error sending mentor approval email:', error)
      return { success: false, error: error.message || error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending mentor approval email via Resend:', error)
    return { success: false, error }
  }
}

export async function sendStudentAdmissionNotification(to: string, fullName: string, cohortName: string, dashboardUrl: string) {
  if (!resend) {
    console.log(`[Resend Mock] Student admission email to ${to} for cohort ${cohortName}`)
    return { success: true, mocked: true }
  }

  try {
    const html = getStudentAdmissionTemplate({ fullName, cohortName, dashboardUrl })
    const { data, error } = await resend.emails.send({
      from: getFromEmail(),
      replyTo: getReplyToEmail(),
      to: [to],
      subject: `Congratulations! Admitted to ${cohortName} - MUI Portal`,
      html,
    })
    if (error) {
      console.error('Resend API error sending student admission email:', error)
      return { success: false, error: error.message || error }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending student admission email via Resend:', error)
    return { success: false, error }
  }
}
