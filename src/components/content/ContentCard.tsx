'use client'
import { useState } from 'react'
import { getYouTubeEmbed, getYouTubeThumbnail, cn } from '@/lib/utils'
import type { ContentBlock } from '@/types'
import { Play, FileText, Headphones, FileImage, ExternalLink, Clock, Star, Trash2, Edit3, Lock, CheckCircle } from '@/components/icons'
import { deleteSanityDocument } from '@/lib/actions/sanity'
import { ContentEditor } from './ContentEditor'

const typeIcons: Record<string,any> = { video:Play, article:FileText, audio:Headphones, pdf:FileImage, image:FileImage }
const typeColors: Record<string,string> = { video:'bg-blue-100 text-blue-700', article:'bg-teal-100 text-teal-700', audio:'bg-purple-100 text-purple-700', pdf:'bg-amber-100 text-amber-700', image:'bg-pink-100 text-pink-700' }

function extractYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return m ? m[1] : null
}

export function ContentCard({ content, compact=false, isAdmin=false, isUnlocked=true, isCompleted=false, dayNumber, sessionNumber }: { content: ContentBlock; compact?: boolean; isAdmin?: boolean; isUnlocked?: boolean; isCompleted?: boolean; dayNumber?: number; sessionNumber?: number }) {
  const [playing, setPlaying] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const Icon = typeIcons[content.contentType] || FileText
  const colorClass = typeColors[content.contentType] || 'bg-gray-100 text-gray-600'
  const youtubeId = content.youtubeId || (content.url ? extractYouTubeId(content.url) : null)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content?')) return
    setDeleting(true)
    await deleteSanityDocument(content._id)
    setDeleting(false)
  }

  return (
    <>
      {isEditing && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <ContentEditor content={content} onCancel={() => setIsEditing(false)} />
        </div>
      )}

      {compact ? (
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', colorClass)}><Icon className="w-3.5 h-3.5" /></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
            <p className="text-xs text-gray-400">Week {content.weekNumber}{content.durationMinutes && ` · ${content.durationMinutes} min`}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {content.isRequired && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
            <span className={cn('badge text-xs capitalize', colorClass)}>{content.contentType}</span>
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={cn('card overflow-hidden group transition-all', !isUnlocked && 'opacity-60 bg-gray-50')}>
          {isCompleted && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Completed
              </div>
            </div>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 z-10 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-2xl p-4 shadow-xl text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">Locked</p>
                <p className="text-xs text-gray-500 mt-1">Complete previous session to unlock</p>
              </div>
            </div>
          )}
          {content.contentType === 'video' && youtubeId && (
            <div className="relative aspect-video bg-gray-900">
              {playing ? (
                <iframe src={getYouTubeEmbed(youtubeId)} className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                <button onClick={() => isUnlocked && setPlaying(true)} className="w-full h-full relative group" disabled={!isUnlocked}>
                  <img src={getYouTubeThumbnail(youtubeId)} alt={content.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                      <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start gap-3">
              {content.contentType !== 'video' && (
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', colorClass)}><Icon className="w-4 h-4" /></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{content.title}</h3>
                    {dayNumber && sessionNumber && <span className="badge badge-gray text-xs">Day {dayNumber}, Session {sessionNumber}</span>}
                    {content.isRequired && <span className="badge badge-amber text-xs">Required</span>}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {content.description && <p className="text-xs text-gray-500 leading-relaxed mb-3">{content.description}</p>}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn('badge text-xs capitalize', colorClass)}>{content.contentType}</span>
                  {content.durationMinutes && <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{content.durationMinutes} min</span>}
                  {content.tags?.map(tag => <span key={tag} className="badge badge-gray text-xs">{tag}</span>)}
                </div>
                {content.contentType !== 'video' && content.url && (
                  <a href={content.url} target="_blank" rel="noopener noreferrer"
                    className={cn('inline-flex items-center gap-1.5 mt-3 text-sm font-medium', isUnlocked ? 'text-teal-700 hover:underline' : 'text-gray-400 cursor-not-allowed')}>
                    Open {content.contentType}<ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
