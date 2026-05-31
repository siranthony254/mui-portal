const fallbackAdminEmails = ['officialsiranthony@gmail.com']

export function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS?.split(',') ?? []

  return [...fallbackAdminEmails, ...envEmails]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false
  return getAdminEmails().includes(email.trim().toLowerCase())
}
