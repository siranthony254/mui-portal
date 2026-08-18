import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Metadata } from 'next'
import { ShieldCheck, User, Clock, Zap } from '@/components/icons'

export const metadata: Metadata = { title: 'Audit Logs — Super Admin' }

export default async function AuditLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Security: Only allow Super Admin (your email) to see audit logs?
  // For now, any admin.
  const { data: logs } = await supabase.from('audit_logs')
    .select('*, admin:profiles!admin_id(full_name), target:profiles!target_id(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-gray-500 font-medium">Traceability of all administrative actions on the portal.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs?.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                       <Clock className="w-3 h-3" />
                       {formatDate(log.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                       <span className="text-sm font-bold text-gray-900">{(log.admin as any)?.full_name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="badge badge-gray text-[10px] font-black uppercase tracking-wider">
                        {log.action.replace(/_/g, ' ')}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <User className="w-3.5 h-3.5 text-gray-400" />
                       <span className="text-sm font-medium text-gray-700">{(log.target as any)?.full_name || 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                    No administrative actions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
