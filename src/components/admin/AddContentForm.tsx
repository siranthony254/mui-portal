'use client'

import { useState } from 'react'
import { createStandaloneContent } from '@/lib/actions/sanity'
import { Zap, Video, FileText, Headphones, FileDown, Globe, Plus, X } from '@/components/icons'
import { cn } from '@/lib/utils'

export function AddContentForm({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contentType, setContentType] = useState('video')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await createStandaloneContent(formData)

    if (res.error) {
      setError(res.error)
    } else {
      if (onClose) onClose()
    }
    setLoading(false)
  }

  const types = [
    { id: 'video', label: 'Video', icon: Video },
    { id: 'article', label: 'Article', icon: FileText },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'pdf', label: 'PDF', icon: FileDown },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Orchestrate Content</h2>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Type Selector */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Content Type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setContentType(t.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all",
                  contentType === t.id
                    ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                )}
              >
                <t.icon className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                <input type="radio" name="contentType" value={t.id} checked={contentType === t.id} className="hidden" readOnly />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Content Title</label>
              <input name="title" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold" placeholder="e.g. Identity and Self-Awareness" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Short Description</label>
              <textarea name="description" rows={3} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 text-sm font-medium" placeholder="What is this content about?" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pillar</label>
                <select name="pillarNumber" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm">
                  {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>Pillar {p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Week</label>
                <select name="weekNumber" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-bold text-sm">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(w => <option key={w} value={w}>Week {w}</option>)}
                </select>
              </div>
            </div>

            {contentType === 'video' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YouTube Video ID</label>
                <input name="youtubeId" required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-mono text-sm" placeholder="e.g. dQw4w9WgXcQ" />
              </div>
            )}

            {contentType !== 'article' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Resource URL</label>
                <input name="url" type="url" required={contentType !== 'video'} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-emerald-500 focus:ring-0 font-mono text-sm" placeholder="https://..." />
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
               <input type="checkbox" name="isRequired" value="true" defaultChecked className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
               <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Mark as required content</span>
            </div>
          </div>
        </div>

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

        <div className="flex justify-end gap-3 pt-4">
          {onClose && (
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 text-white px-10 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50"
          >
            {loading ? 'Orchestrating...' : 'Push to Portal'}
            <Zap className="w-4 h-4 fill-white" />
          </button>
        </div>
      </form>
    </div>
  )
}
