'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'

export function SimpleRichEditor({ value, onChange, placeholder, rows = 10 }: { value: string; onChange: (val: string) => void; placeholder?: string; rows?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Reset focus and selection
    setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-white rounded-lg text-xs font-bold transition-all" title="Bold">B</button>
        <button type="button" onClick={() => insertText('_', '_')} className="p-2 hover:bg-white rounded-lg text-xs italic transition-all" title="Italic">I</button>
        <button type="button" onClick={() => insertText('### ')} className="p-2 hover:bg-white rounded-lg text-xs font-black transition-all" title="Heading">H</button>
        <button type="button" onClick={() => insertText('- ')} className="p-2 hover:bg-white rounded-lg text-xs transition-all" title="List">•</button>
        <button type="button" onClick={() => insertText('[', '](url)')} className="p-2 hover:bg-white rounded-lg text-xs text-blue-600 underline transition-all" title="Link">Link</button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:ring-0 text-sm font-medium leading-relaxed"
      />
    </div>
  )
}
