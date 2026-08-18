'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Plus, Trash2, Save, Lock } from '@/components/icons'
import { formatDate } from '@/lib/utils'

interface Note {
  id: string
  content: string
  created_at: string
  is_sealed_letter: boolean
}

interface Props {
  studentId: string
  mentorId: string
}

export function MentorNotes({ studentId, mentorId }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotes()
  }, [studentId])

  async function fetchNotes() {
    setFetching(true)
    const { data } = await supabase.from('mentor_notes')
      .select('*')
      .eq('student_id', studentId)
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false })

    if (data) setNotes(data)
    setFetching(false)
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault()
    if (!newNote.trim()) return

    setLoading(true)
    const { data, error } = await supabase.from('mentor_notes').insert({
      student_id: studentId,
      mentor_id: mentorId,
      content: newNote.trim(),
      is_sealed_letter: false
    }).select().single()

    if (!error && data) {
      setNotes([data, ...notes])
      setNewNote('')
    }
    setLoading(false)
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from('mentor_notes').delete().eq('id', id)
    if (!error) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" /> Private Mentor Notes
        </h2>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Mentee cannot see these</span>
      </div>

      <div className="card p-6 bg-gray-900 text-white">
        <form onSubmit={handleAddNote} className="space-y-3 mb-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a private observation about this student's growth..."
            className="w-full p-4 text-xs bg-white/5 border border-white/10 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-600 resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newNote.trim()}
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> {loading ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        </form>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {fetching ? (
            <div className="text-center py-4 opacity-50">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 opacity-20">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No notes yet</p>
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="p-4 bg-white/5 border border-white/10 rounded-xl group relative">
                <p className="text-xs text-emerald-50/80 leading-relaxed pr-6">
                  {note.content}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    {formatDate(note.created_at)}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
           <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
             <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center flex-shrink-0">
               <Save className="w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sealed Letter</p>
               <p className="text-[11px] text-emerald-100/60 leading-tight">These notes will help you write the sealed personal letter at the end of the semester.</p>
             </div>
           </div>
        </div>
      </div>
    </section>
  )
}
