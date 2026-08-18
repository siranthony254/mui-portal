'use client'
import { useState } from 'react'
import { ContentCard } from './ContentCard'
import type { ContentBlock } from '@/types'
import { PILLARS } from '@/types'
import { cn } from '@/lib/utils'
import { Search } from '@/components/icons'

export function ContentManagerClient({ content, isAdmin=false }: { content: ContentBlock[]; isAdmin?: boolean }) {
  const [pillarFilter, setPillarFilter] = useState<number|null>(null)
  const [typeFilter, setTypeFilter] = useState<string|null>(null)
  const [search, setSearch] = useState('')

  const filtered = content.filter(c => {
    if (pillarFilter && c.pillarNumber !== pillarFilter) return false
    if (typeFilter && c.contentType !== typeFilter) return false
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search content..." className="input pl-9 text-sm" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={()=>setPillarFilter(null)} className={cn('badge text-xs cursor-pointer',pillarFilter===null?'badge-teal':'badge-gray')}>All pillars</button>
          {PILLARS.map(p=><button key={p.number} onClick={()=>setPillarFilter(pillarFilter===p.number?null:p.number)} className={cn('badge text-xs cursor-pointer',pillarFilter===p.number?'badge-teal':'badge-gray')}>P{p.number}: {p.name}</button>)}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['video','article','audio','pdf','image'].map(type=><button key={type} onClick={()=>setTypeFilter(typeFilter===type?null:type)} className={cn('badge text-xs cursor-pointer capitalize',typeFilter===type?'badge-blue':'badge-gray')}>{type}</button>)}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} of {content.length} items</p>
        <a href={`https://sanity.io/manage`} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-700 hover:underline">Manage in Sanity Studio →</a>
      </div>

      {pillarFilter ? (
        <div className="space-y-3">{filtered.map(c=><ContentCard key={c._id} content={c} compact isAdmin={isAdmin} />)}</div>
      ) : (
        PILLARS.map(pillar => {
          const items = filtered.filter(c=>c.pillarNumber===pillar.number)
          if (!items.length) return null
          return (
            <div key={pillar.number} className="card overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-gray-900">Pillar {pillar.number}: {pillar.name}</p><p className="text-xs text-gray-400">{pillar.weeks}</p></div>
                <span className="badge badge-gray text-xs">{items.length} items</span>
              </div>
              <div className="p-4 space-y-2">{items.map(c=><ContentCard key={c._id} content={c} compact isAdmin={isAdmin} />)}</div>
            </div>
          )
        })
      )}

      {filtered.length===0 && (
        <div className="card p-10 text-center"><p className="text-sm text-gray-400">{content.length===0?'No content yet. Add content blocks in Sanity Studio.':'No content matches your filters.'}</p></div>
      )}
    </div>
  )
}
