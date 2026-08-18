import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mic'd Up Initiative Forge",
    short_name: 'MUI Forge',
    description: 'Form your voice. Shape culture.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f6e56',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: 'https://micdupinitiative.site/wp-content/uploads/2023/06/cropped-MUI-Logo-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'https://micdupinitiative.site/wp-content/uploads/2023/06/cropped-MUI-Logo-32x32.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
