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
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px; background-color: #0f6e56; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                MUI Portal
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #e1f5ee; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                Formation. Voice. Culture.
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
            <td style="padding: 24px 40px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} Micdup Initiative (MUI). All rights reserved.</p>
              <p style="margin: 0;">This is an automated notification from your MUI Portal account.</p>
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

export function getStudentWaitlistTemplate({ fullName }: EmailBaseProps) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
      Application Received, ${fullName.split(' ')[0]}! 🎓
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Your application for the MUI cohort has been successfully received and you have been added to our official waitlist.
    </p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #065f46;">
        <strong>What's next?</strong> Our team reviews applications before every cohort cycle. You will receive a direct email once you are admitted to an active cohort.
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
      In the meantime, you can log in to your dashboard to complete your profile, though cohort-specific features will remain locked until your admission.
    </p>
  `
  return getEmailLayout({ title: 'Application Received - MUI Portal', content })
}

export function getMentorApplicationReceivedTemplate({ fullName }: EmailBaseProps) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
      Mentor Request Received 🤝
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Hello ${fullName}, thank you for your interest in mentoring with the Micdup Initiative.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      We have received your professional background details. Our administrative team reviews mentor applications to ensure the best fit for our students.
    </p>
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #475569;">
        <strong>Status:</strong> <span style="color: #d97706; font-weight: 600;">Pending Review</span>
      </p>
    </div>
    <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.5;">
      You will receive a follow-up email once your mentor access is activated. Thank you for your patience and your willingness to serve.
    </p>
  `
  return getEmailLayout({ title: 'Mentor Request Received - MUI Portal', content })
}

export function getMentorApprovedTemplate({ fullName, loginUrl }: EmailBaseProps & { loginUrl: string }) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
      Mentor Access Activated! 🚀
    </h2>
    <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Great news, ${fullName}! Your mentor application has been approved. You now have full access to the Mentor Portal to manage your students and provide feedback on their formation tasks.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="display: inline-block; background-color: #0f6e56; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Go to Mentor Portal
      </a>
    </div>
  `
  return getEmailLayout({ title: 'Mentor Access Activated - MUI Portal', content })
}

export function getStudentAdmissionTemplate({ fullName, cohortName, dashboardUrl }: EmailBaseProps & { cohortName: string; dashboardUrl: string }) {
  const content = `
    <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
      Admission Confirmed: ${cohortName} 🎓
    </h2>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      Dear ${fullName},
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
      You have been officially admitted to <strong>${cohortName}</strong>! Your 12-week formation journey starts now.
    </p>
    <div style="background-color: #f0fdf4; border-left: 4px solid #0f6e56; padding: 16px; border-radius: 4px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #065f46;">
        Your student dashboard is now fully unlocked. You can access weekly pillar content, submit tasks, and connect with your mentor and accountability partner.
      </p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #0f6e56; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
        Open My Dashboard
      </a>
    </div>
  `
  return getEmailLayout({ title: `Admitted to ${cohortName} - MUI Portal`, content })
}
