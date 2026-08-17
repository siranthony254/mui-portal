'use client'

import { useState } from 'react'
import { PortableText } from '@portabletext/react'
import { urlFor } from '@/lib/sanity/image'
import { getYouTubeEmbed, cn } from '@/lib/utils'
import { Play, FileText, FileImage, ChevronRight, ChevronLeft, Menu, X, BookOpen, Clock } from '@/components/icons'
import type { Course, CourseModule, CourseSession, VideoBlock, TextBlock, ImageBlock } from '@/types'

interface Props {
  course: Course
}

export function CoursePlayer({ course }: Props) {
  const [activeModuleIdx, setActiveModuleIdx] = useState(0)
  const [activeSessionIdx, setActiveSessionIdx] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const modules = course.modules || []
  const activeModule = modules[activeModuleIdx]
  const activeSession = activeModule?.sessions?.[activeSessionIdx]

  const totalSessions = modules.reduce((acc, m) => acc + (m.sessions?.length || 0), 0)

  // Flat session list for prev/next
  const flatSessions = modules.flatMap((m, mIdx) =>
    (m.sessions || []).map((s, sIdx) => ({ ...s, mIdx, sIdx }))
  )
  const currentFlatIdx = flatSessions.findIndex(s => s.mIdx === activeModuleIdx && s.sIdx === activeSessionIdx)

  function navigate(direction: 'next' | 'prev') {
    const nextIdx = direction === 'next' ? currentFlatIdx + 1 : currentFlatIdx - 1
    const target = flatSessions[nextIdx]
    if (target) {
      setActiveModuleIdx(target.mIdx)
      setActiveSessionIdx(target.sIdx)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-120px)] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Sidebar */}
      <div className={cn(
        "bg-gray-50 border-r border-gray-100 transition-all duration-300 overflow-y-auto flex flex-col",
        sidebarOpen ? "w-full lg:w-80 h-[50vh] lg:h-auto" : "w-0 h-0 lg:h-auto opacity-0"
      )}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-900 truncate">{course.title}</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Course Content</p>
        </div>
        <div className="flex-1">
          {modules.map((module, mIdx) => (
            <div key={module._key} className="border-b border-gray-200 last:border-0">
              <div className="px-4 py-3 bg-gray-100/50">
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Module {mIdx + 1}</p>
                <h3 className="text-xs font-semibold text-gray-900">{module.title}</h3>
              </div>
              <div className="py-1">
                {module.sessions?.map((session, sIdx) => {
                  const isActive = mIdx === activeModuleIdx && sIdx === activeSessionIdx
                  return (
                    <button
                      key={session._key}
                      onClick={() => { setActiveModuleIdx(mIdx); setActiveSessionIdx(sIdx); }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-3",
                        isActive ? "bg-teal-50 text-teal-700 border-r-2 border-teal-700" : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                        isActive ? "bg-teal-700 text-white" : "bg-gray-200 text-gray-400"
                      )}>
                        {sIdx + 1}
                      </div>
                      <span className="truncate">{session.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Top Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex-1 text-center px-4">
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
               {activeModule?.title}
             </p>
          </div>

          <div className="flex items-center gap-2">
             <span className="text-xs text-gray-400 mr-2">{currentFlatIdx + 1} / {totalSessions}</span>
             <button
              disabled={currentFlatIdx === 0}
              onClick={() => navigate('prev')}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button
              disabled={currentFlatIdx === flatSessions.length - 1}
              onClick={() => navigate('next')}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
          {!activeSession ? (
            <div className="h-full flex items-center justify-center text-gray-400">
               Select a session to start learning.
            </div>
          ) : (
            <div className="space-y-10">
              <header>
                 <h1 className="text-3xl font-bold text-gray-900 mb-2">{activeSession.title}</h1>
                 <div className="h-1 w-20 bg-teal-600 rounded-full" />
              </header>

              <div className="space-y-12">
                {activeSession.contentBlocks?.map((block, idx) => {
                  if (block._type === 'videoBlock') {
                    const video = block as VideoBlock
                    return (
                      <div key={block._key} className="space-y-4">
                        {video.title && <h4 className="text-lg font-semibold text-gray-800">{video.title}</h4>}
                        <div className="aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
                          <iframe
                            src={getYouTubeEmbed(video.url)}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {video.description && <p className="text-sm text-gray-500 italic">{video.description}</p>}
                      </div>
                    )
                  }

                  if (block._type === 'textBlock') {
                    const text = block as TextBlock
                    return (
                      <div key={block._key} className="prose prose-teal max-w-none prose-sm md:prose-base leading-relaxed text-gray-700">
                        <PortableText value={text.body} />
                      </div>
                    )
                  }

                  if (block._type === 'imageBlock') {
                    const img = block as ImageBlock
                    const imgUrl = urlFor(img.image)?.url()
                    return (
                      <div key={block._key} className="space-y-3">
                        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                          {imgUrl && <img src={imgUrl} alt={img.caption || ''} className="w-full h-auto" />}
                        </div>
                        {img.caption && <p className="text-center text-xs text-gray-500">{img.caption}</p>}
                      </div>
                    )
                  }

                  return null
                })}
              </div>

              {/* Session Footer Navigation */}
              <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                 <div>
                    {currentFlatIdx === flatSessions.length - 1 ? (
                      <p className="text-sm text-teal-700 font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4" /> You've reached the end of this course!
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Up next: <span className="font-semibold text-gray-800">{flatSessions[currentFlatIdx+1]?.title}</span>
                      </p>
                    )}
                 </div>
                 <div className="flex gap-3">
                   <button
                    disabled={currentFlatIdx === 0}
                    onClick={() => navigate('prev')}
                    className="btn-secondary py-2 px-6 flex items-center gap-2"
                   >
                     <ChevronLeft className="w-4 h-4" /> Previous
                   </button>
                   <button
                    disabled={currentFlatIdx === flatSessions.length - 1}
                    onClick={() => navigate('next')}
                    className="btn-primary py-2 px-6 flex items-center gap-2"
                   >
                     Next <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
