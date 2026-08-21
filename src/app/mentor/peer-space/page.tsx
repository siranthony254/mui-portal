import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { Users, MessageSquare, BookOpen, Bell, Globe, ArrowRight } from '@/components/icons'
import Link from 'next/link'

export default async function MentorPeerSpacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20 px-4">
      <div className="page-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Mentor Peer Space</h1>
          <p className="text-sm text-gray-500 font-medium">Private community for MUI Mentors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Main Content: Group Chat & Announcements */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          <section className="card p-6 sm:p-8 bg-emerald-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <MessageSquare className="w-24 h-24 sm:w-32 sm:h-32" />
             </div>
             <div className="relative z-10">
               <h2 className="text-lg sm:text-xl font-black mb-2">Mentor Peer Chat</h2>
               <p className="text-emerald-100/70 text-sm mb-4 sm:mb-6 max-w-md">
                 Share observations, ask for advice, and support your fellow mentors in this private space.
               </p>
               <button className="bg-white text-emerald-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-xl w-full sm:w-auto justify-center">
                 Open Peer Chat <ArrowRight className="w-4 h-4" />
               </button>
             </div>
          </section>

          <section className="space-y-4">
             <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Programme Announcements</h2>
             <div className="space-y-3">
               {[
                 { t: "Cohort 1 Mid-Semester Review", d: "The mid-semester review call is scheduled for next Tuesday at 6 PM.", date: "2 days ago" },
                 { t: "New Guidance Document: Check-in Questions", d: "We've added a new PDF with suggested questions for your 1-on-1s.", date: "1 week ago" }
               ].map((ann, i) => (
                 <div key={i} className="card p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                     <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{ann.t}</h3>
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ann.date}</span>
                   </div>
                   <p className="text-sm text-gray-500 leading-relaxed">{ann.d}</p>
                 </div>
               ))}
             </div>
          </section>
        </div>

        {/* Sidebar: Resources & Meetings */}
        <div className="lg:col-span-4 space-y-8">
           <section className="space-y-4">
             <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Shared Resources</h2>
             <div className="card divide-y divide-gray-50">
                {[
                  { n: "Mentor Handbook v2.pdf", s: "2.4 MB" },
                  { n: "Pillar 1 Briefing.pdf", s: "1.1 MB" },
                  { n: "Check-in Template.docx", s: "45 KB" }
                ].map((res, i) => (
                  <div key={i} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{res.n}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{res.s}</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex-shrink-0">Download</button>
                  </div>
                ))}
             </div>
           </section>

           <section className="card p-4 sm:p-6 bg-teal-50 border-teal-100">
              <h3 className="text-xs font-black text-teal-800 uppercase tracking-[0.2em] mb-4">Next Peer Meeting</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                      <Bell className="w-5 h-5 text-teal-600" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-900">Monthly Call</p>
                      <p className="text-xs text-teal-700">Oct 24, 2026 · 6:00 PM</p>
                   </div>
                </div>
                <button className="w-full bg-teal-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-800 transition-colors">
                  View Agenda
                </button>
              </div>
           </section>
        </div>
      </div>
    </div>
  )
}
