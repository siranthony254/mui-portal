import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: "MUI Portal", template: "%s | MUI Portal" },
  description: "Form your voice. Shape culture.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
