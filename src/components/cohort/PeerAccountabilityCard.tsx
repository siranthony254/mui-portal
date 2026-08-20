'use client'

import { useState } from 'react'
import { logPeerCheckIn } from '@/lib/actions/cohort'
import { getInitials, formatDate } from '@/lib/utils'
import { Users, CheckCircle, Clock, MessageSquare } from '@/components/icons'
import type { AccountabilityPartnership } from '@/types'
import Link from 'next/link'

interface Props {
  partnership: AccountabilityPartnership | null
}

export function PeerAccountabilityCard({ partnership }: Props) {
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [reflection, setReflection] = useState('')

  if (!partnership) {
    return (
      <div className="card p-5">
        <p className="section-title">Peer Accountability</p>
        <p className="text-xs text-gray-400">Your accountability partner will be assigned once the cohort stabilizes.</p>
      </div>
    )
  }

  const partner = partnership.partner
  if (!partner) return null

  async function handleLogCheckIn() {
    setLoading(true)
    const res = await logPeerCheckIn(partnership!.id, reflection)
    if (res.success) {
      setShowForm(false)
      setReflection('')
    }
    setLoading(false)
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title mb-0">Accountability Partner</p>
        <Link
            href={`/dashboard/messages?user=${partner.id}`}
            className="p-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all"
            title="Chat with partner"
        >
            <MessageSquare className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
          {getInitials(partner.full_name)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{partner.full_name}</p>
          <p className="text-[11px] text-gray-400 capitalize">{partner.institution || 'MUI Cohort Participant'}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last Check-in</p>
          {partnership.last_check_in_at ? (
            <span className="flex items-center gap-1 text-[10px] text-teal-600 font-medium">
              <CheckCircle className="w-3 h-3" /> {formatDate(partnership.last_check_in_at)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium">
              <Clock className="w-3 h-3" /> Never
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Structured bi-weekly check-ins are core to your formation. Anchor your progress with your partner.
        </p>
      </div>

      {showForm ? (
        <div className="space-y-3">
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="One or two sentences on what you discussed..."
            className="textarea text-xs min-h-[60px]"
            maxLength={200}
          />
          <div className="flex gap-2">
            <button
              onClick={handleLogCheckIn}
              disabled={loading}
              className="btn-primary flex-1 py-1.5 text-[11px]"
            >
              {loading ? 'Logging...' : 'Confirm Check-in'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="btn-secondary py-1.5 text-[11px]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary w-full justify-center text-xs py-1.5 flex items-center gap-2"
        >
          <Users className="w-3.5 h-3.5" /> Log this week's check-in
        </button>
      )}
    </div>
  )
}
