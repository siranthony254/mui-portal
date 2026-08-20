'use client'

import { useState } from 'react'
import { updateStandaloneContent } from '@/lib/actions/sanity'
import type { ContentBlock } from '@/types'
import { X, Save, Video, FileText, Headphones, FileImage, Star } from '@/components/icons'
import { cn } from '@/lib/utils'
import { SimpleRichEditor } from '@/components/ui/SimpleRichEditor'

export function ContentEditor({ content, onCancel }: { content: ContentBlock; onCancel: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState<string>(
    typeof content.body === 'string' ? content.body : ''
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('body', body)
    const res = await updateStandaloneContent(content._id, formData)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      onCancel()
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-lg w-full">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Content</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Asset Library / Orchestration</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="label">Title</label>
          <input name="title" defaultValue={content.title} required className="input" placeholder="Content title" />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea name="description" defaultValue={content.description} rows={3} className="textarea" placeholder="Brief overview..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Pillar</label>
            <select name="pillarNumber" defaultValue={content.pillarNumber} className="select">
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Pillar {n}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Week</label>
            <select name="weekNumber" defaultValue={content.weekNumber} className="select">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>Week {n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Content Type</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'video', icon: Video },
              { id: 'article', icon: FileText },
              { id: 'audio', icon: Headphones },
              { id: 'pdf', icon: FileImage },
              { id: 'image', icon: FileImage }
            ].map(type => (
              <label key={type.id} className="cursor-pointer">
                <input type="radio" name="contentType" value={type.id} defaultChecked={content.contentType === type.id} className="peer sr-only" />
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-gray-100 peer-checked:border-teal-600 peer-checked:bg-teal-50 text-gray-400 peer-checked:text-teal-700 transition-all">
                  <type.icon className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-widest">{type.id}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">URL / Source</label>
          <input name="url" defaultValue={content.url} className="input" placeholder="https://..." />
        </div>

        <div>
          <label className="label">YouTube ID (Optional)</label>
          <input name="youtubeId" defaultValue={content.youtubeId} className="input" placeholder="e.g. dQw4w9WgXcQ" />
        </div>

        <div>
          <label className="label">Article Content (Markdown/Text)</label>
          <SimpleRichEditor value={body} onChange={setBody} placeholder="Write or paste your article here..." rows={8} />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" name="isRequired" id="isRequired" defaultChecked={content.isRequired} value="true" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
          <label htmlFor="isRequired" className="text-sm font-bold text-gray-700 select-none flex items-center gap-1.5">
            Mark as Required <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-xs font-black uppercase text-gray-400">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary text-xs uppercase tracking-widest font-black flex items-center gap-2">
            {loading ? 'Saving...' : (
              <>
                <Save className="w-4 h-4" />
                Update Content
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
