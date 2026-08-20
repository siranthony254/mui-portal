'use client'

import { useState } from 'react'
import { createSupplementaryResource } from '@/lib/actions/sanity'
import {
    Video, FileText, Headphones, FileDown,
    Plus, X, Globe, Layers, Zap
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { SimpleRichEditor } from '@/components/ui/SimpleRichEditor'

export function AddResourceForm({ cohorts, onClose }: { cohorts: any[], onClose?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contentType, setContentType] = useState('article')
  const [inputMode, setInputMode] = useState<'url' | 'type'>('url')
  const [articleBody, setArticleBody] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await createSupplementaryResource(formData)

    if (res.error) {
      setError(res.error)
    } else {
      if (onClose) onClose()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-blue-50 max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Supplementary Resource</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Send additional learning materials to students.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Resource Type</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                        { id: 'video', label: 'Video', icon: Video },
                        { id: 'article', label: 'Article', icon: FileText },
                        { id: 'audio', label: 'Audio', icon: Headphones },
                        { id: 'pdf', label: 'PDF', icon: FileDown },
                        { id: 'image', label: 'Image', icon: Globe },
                    ].map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setContentType(t.id)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all",
                                contentType === t.id
                                    ? "border-blue-600 bg-blue-50 text-blue-900"
                                    : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                            )}
                        >
                            <t.icon className="w-5 h-5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
                        </button>
                    ))}
                    <input type="hidden" name="contentType" value={contentType} />
                </div>
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Title</label>
                <input name="title" required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-0 font-bold" placeholder="e.g. Recommended Reading: African Leadership" />
            </div>

            <div className="md:col-span-2 space-y-4">
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setInputMode('url')}
                        className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", inputMode === 'url' ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-100 text-gray-400")}
                    >
                        URL / Link
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode('type')}
                        className={cn("flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all", inputMode === 'type' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-100 text-gray-400")}
                    >
                        Direct Type / Paste
                    </button>
                </div>

                {inputMode === 'url' ? (
                    <div className="animate-reveal">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 block mb-2">URL / Link</label>
                        <input name="url" required type="url" className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-0 font-mono text-sm" placeholder="https://..." />
                    </div>
                ) : (
                    <div className="animate-reveal">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 block mb-2">Content Body</label>
                        <SimpleRichEditor
                            value={articleBody}
                            onChange={setArticleBody}
                            placeholder="Type or paste your content here..."
                            rows={10}
                        />
                        <input type="hidden" name="body" value={articleBody} />
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Target Cohort (Optional)</label>
                <select
                    name="cohortId"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 font-bold text-sm"
                >
                    <option value="">Global (All students)</option>
                    {cohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tags (Comma separated)</label>
                <input name="tags" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 font-medium text-sm" placeholder="leadership, culture, tech" />
            </div>

            <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                <textarea name="description" rows={3} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-0 text-sm font-medium" placeholder="Why should students check this out?" />
            </div>
        </div>

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Sending...' : 'Send Resource'}
            <Zap className="w-5 h-5 fill-white" />
          </button>
        </div>
      </form>
    </div>
  )
}
