const PRIMARY_APP_URL = 'https://portal.micdupinitiative.site'

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!appUrl || appUrl.includes('localhost')) {
    return PRIMARY_APP_URL
  }

  return appUrl.replace(/\/$/, '')
}

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/auth/callback`
}
