import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllContent } from '@/lib/sanity/queries'
import { ContentManagerClient } from '@/components/content/ContentManagerClient'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Content Manager' }

export default async function ContentManagerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const content = await getAllContent().catch(() => [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="page-header">
        <div><h1 className="page-title">Content Manager</h1><p className="text-sm text-gray-500 mt-0.5">All content is managed through Sanity CMS.</p></div>
        <a href={`https://sanity.io/manage/personal/project/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">Open Sanity Studio →</a>
      </div>
      <div className="card p-4">
        <p className="section-title">How to add content</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3"><p className="font-medium text-blue-800 mb-1">Videos (YouTube)</p><p className="text-xs text-blue-600">Sanity Studio → Content Blocks → New. Set type to Video. Paste YouTube URL. Assign to pillar + week.</p></div>
          <div className="bg-teal-50 rounded-lg p-3"><p className="font-medium text-teal-800 mb-1">Articles / Text</p><p className="text-xs text-teal-600">Set type to Article. Write body content in the rich text editor.</p></div>
          <div className="bg-amber-50 rounded-lg p-3"><p className="font-medium text-amber-800 mb-1">PDFs / Audio</p><p className="text-xs text-amber-600">Set the type accordingly. Paste the external URL (Google Drive, SoundCloud, etc.).</p></div>
        </div>
      </div>
      <ContentManagerClient content={content} />
    </div>
  )
}
