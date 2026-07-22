interface EmailBaseProps {
  fullName: string
}

function getEmailLayout({ title, content }: { title: string; content: string }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111827; border-radius: 12px; border: 1px solid #1f2937; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); text-align: center; border-bottom: 1px solid #1e293b;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: #ffffff;">
                MUI Portal
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Making Unique Impact
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0d1322; border-top: 1px solid #1f2937; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Micdup Initiative (MUI Portal). All rights reserved.</p>
              <p style="margin: 0;">You received this email because of your account activity on MUI Portal.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export function getStudentApplicationTemplate({ fullName, loginUrl }: EmailBaseProps & { loginUrl: string }) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">
      Welcome to MUI Portal, ${fullName}! 🎉
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      Thank you for submitting your student application. We are excited to have you join our transformative cohort program.
    </p>
    <div style="background-color: #1e293b; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #94a3b8;">
        <strong style="color: #38bdf8;">Next Step:</strong> Confirm your sign-up and log in to complete your profile and access your dashboard.
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
        Confirm Sign-Up & Log In
      </a>
    </div>
    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
      If the button above does not work, copy and paste this URL into your browser:<br>
      <a href="${loginUrl}" style="color: #3b82f6; word-break: break-all;">${loginUrl}</a>
    </p>
  `
  return getEmailLayout({ title: 'Student Application Received - MUI Portal', content })
}

export function getMentorApplicationTemplate({ fullName }: EmailBaseProps) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">
      Mentor Application Received! 🤝
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      Hello ${fullName}, thank you for applying to be a mentor at MUI Portal.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      Our administrative team is reviewing your application details. Once approved, you will receive an email confirmation granting access to mentor management, cohort tracking, and student task feedback tools.
    </p>
    <div style="background-color: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #94a3b8;">
        <strong>Application Status:</strong> <span style="color: #fbbf24; font-weight: 600;">Under Review</span>
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #94a3b8;">
      Thank you for offering your guidance and mentorship to empower the next generation of leaders.
    </p>
  `
  return getEmailLayout({ title: 'Mentor Application Received - MUI Portal', content })
}

export function getSignInMagicLinkTemplate({ fullName, magicLink }: { fullName?: string; magicLink: string }) {
  const name = fullName ? fullName : 'there'
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">
      Sign in to MUI Portal 🔑
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      Hello ${name}, click the button below to instantly sign in to your MUI Portal account.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${magicLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Sign In to Dashboard
      </a>
    </div>
    <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
      This link is intended only for you and will expire shortly. If you did not request this sign-in link, you can safely ignore this email.
    </p>
    <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
      If the button above does not work, copy and paste this link:<br>
      <a href="${magicLink}" style="color: #3b82f6; word-break: break-all;">${magicLink}</a>
    </p>
  `
  return getEmailLayout({ title: 'Sign In to MUI Portal', content })
}

export function getMentorStatusTemplate({ fullName, approved, loginUrl }: EmailBaseProps & { approved: boolean; loginUrl: string }) {
  const statusTitle = approved ? 'Mentor Application Approved! 🚀' : 'Mentor Application Update'
  const statusBody = approved
    ? `Great news, ${fullName}! Your mentor application has been officially approved by the MUI Portal admin team. You can now log in to your mentor dashboard and begin guiding students.`
    : `Hello ${fullName}, thank you for your interest in being a mentor. At this time, your mentor application status has been updated. Please log in or reach out to administration if you have questions.`

  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">
      ${statusTitle}
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      ${statusBody}
    </p>
    ${approved ? `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Access Mentor Dashboard
      </a>
    </div>
    ` : ''}
  `
  return getEmailLayout({ title: `${statusTitle} - MUI Portal`, content })
}

export function getStudentAdmissionTemplate({ fullName, cohortName, dashboardUrl }: EmailBaseProps & { cohortName: string; dashboardUrl: string }) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #f8fafc;">
      Congratulations! You are Admitted! 🎓
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      Dear ${fullName},
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
      You have officially been admitted to <strong>${cohortName}</strong> on MUI Portal! Your formation journey is about to begin.
    </p>
    <div style="background-color: #1e293b; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #94a3b8;">
        Visit your dashboard now to view your active enrollment, current week formation tasks, and vision club access.
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Go to Student Dashboard
      </a>
    </div>
  `
  return getEmailLayout({ title: `Admitted to ${cohortName} - MUI Portal`, content })
}
