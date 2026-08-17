'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, UserCheck, Users, ShieldCheck, Zap, Globe, Lightbulb, MessageSquare, Menu, X } from '@/components/icons'
import { cn } from '@/lib/utils'

export function LandingContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">MUI Portal</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-emerald-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/auth/register" className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                Apply for the cohort
              </Link>
              <Link href="/auth/mentor-apply" className="text-sm font-semibold text-white bg-emerald-700 px-4 py-2 rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
                Apply as a mentor
              </Link>
            </div>

            {/* Mobile Nav Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 py-4 px-4 space-y-3 shadow-lg">
            <Link
              href="/auth/login"
              className="block px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/auth/register"
              className="block px-4 py-3 text-base font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply for the cohort
            </Link>
            <Link
              href="/auth/mentor-apply"
              className="block px-4 py-3 text-base font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply as a mentor
            </Link>
          </div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-emerald-50/50 skew-x-12 translate-x-32 hidden md:block" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 mx-auto md:mx-0">
              <Zap className="w-3 h-3" /> The formation track
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Join a Generation of <span className="text-emerald-700">Bold Voices</span> and Responsible Influencers.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto md:mx-0">
              Voices shape society. Real problems will be solved by bold people who were heard, formed, and trusted even while they were still in school.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link href="/auth/register" className="btn-primary py-4 px-8 text-lg rounded-2xl flex items-center justify-center gap-2 group shadow-lg shadow-emerald-700/20">
                Join the next cohort <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/mentor-apply" className="btn-secondary py-4 px-8 text-lg rounded-2xl border-2 border-gray-200 hover:border-emerald-700 hover:text-emerald-700 text-center">
                Become a mentor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mission & movement */}
      <section className="py-16 md:py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-3">Our Mission</h2>
            <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">Transforming Campus Culture</p>
            <p className="max-w-2xl mx-auto text-gray-500 leading-relaxed text-sm md:text-base">
              MUI is a mission-driven institution committed to amplifying authentic culture-shaping voices through storytelling, research, and intentional formation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Users, title: 'Discover & Shape', desc: 'Identifying emerging talent and providing leadership formation to lead with responsible influence.' },
              { icon: BookOpen, title: 'Curate Narratives', desc: 'Producing purpose-driven media that shapes what youth consume across campuses.' },
              { icon: MessageSquare, title: 'Host Dialogue', desc: 'Creating spaces for intellectual exchange through talks, podcasts, and summits.' },
              { icon: ShieldCheck, title: 'Produce Insight', desc: 'Converting conversations into societal impact through youth-led research and insights.' },
            ].map((item) => (
              <div key={item.title} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Tools of Influence */}
      <section className="py-16 md:py-24 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 text-center md:text-left">Tools of Influence</h2>
                <p className="text-gray-500 leading-relaxed text-center md:text-left text-sm md:text-base">
                  We equip you with the mechanisms needed to impact culture effectively and sustainably.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Storytelling', desc: 'Podcasts, documentaries, and long-form conversations that elevated substance.' },
                  { title: 'Mentorship', desc: 'Selective cohorts focusing on character, clarity of purpose, and stewardship.' },
                  { title: 'Research & Lived Experience', desc: 'Evidence-based insights that direct content and policy influence.' },
                  { title: 'Generative Community', desc: 'Turning students from audiences into contributors and active thinkers.' },
                ].map((tool) => (
                  <div key={tool.title} className="flex gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{tool.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative order-1 lg:order-2 w-full max-w-md md:max-w-none mx-auto lg:mx-0">
              <div className="aspect-square bg-emerald-700 rounded-3xl rotate-3 absolute inset-0 -z-10 shadow-2xl opacity-10" />
              <div className="aspect-square bg-white border-4 md:border-8 border-emerald-50 rounded-3xl shadow-xl p-6 md:p-10 flex flex-col justify-center">
                 <p className="text-xl md:text-2xl font-black text-emerald-800 leading-tight italic">
                   "Shaping people before platforms. We envision a generation formed into holistic excellence — intellectually grounded and morally anchored."
                 </p>
                 <div className="mt-8 flex items-center gap-3">
                   <div className="w-12 h-0.5 bg-emerald-700" />
                   <p className="text-xs md:text-sm font-bold text-emerald-900 tracking-widest uppercase">The MUI Vision</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Formation Track (The Experience) */}
      <section className="py-16 md:py-24 bg-emerald-900 text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="space-y-6">
               <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center md:text-left">The 12-Week Formation Track</h2>
               <p className="text-emerald-100 leading-relaxed text-base md:text-lg text-center md:text-left">
                 Being a leader at MUI is defined by stewardship and responsibility. It is a 3-month journey of identity, awareness, and clarity.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { title: 'Weekly Tasks', desc: 'Personal formation reflections' },
                   { title: 'Pillar Content', desc: 'Multimedia deep-dives' },
                   { title: 'Monthly Sessions', desc: 'Closed cohort live gatherings' },
                   { title: 'Peer Accountability', desc: 'Structured partner check-ins' },
                 ].map((feat) => (
                   <div key={feat.title} className="p-4 bg-emerald-800/50 rounded-2xl border border-emerald-700/50">
                     <p className="font-bold text-sm mb-1">{feat.title}</p>
                     <p className="text-xs text-emerald-200">{feat.desc}</p>
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-emerald-800 rounded-3xl p-6 md:p-8 border border-emerald-700 w-full max-w-lg mx-auto lg:mx-0">
               <h3 className="text-xl font-bold mb-6">Program Requirements</h3>
               <ul className="space-y-4">
                 {[
                   'Must be aligned with MUI values and carry a lane of influence.',
                   'Emerging student leaders, creatives, and thinkers.',
                   'Commitment to weekly tasks and monthly sessions.',
                   'Strict adherence to progress tracking and accountability.',
                 ].map((req, i) => (
                   <li key={i} className="flex gap-3 text-sm text-emerald-100">
                     <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                     <span>{req}</span>
                   </li>
                 ))}
               </ul>
               <div className="mt-8 pt-8 border-t border-emerald-700">
                 <Link href="/auth/register" className="flex items-center justify-between group">
                   <span className="font-bold">Ready to apply?</span>
                   <div className="w-10 h-10 rounded-full bg-emerald-400 text-emerald-900 flex items-center justify-center group-hover:bg-white transition-colors">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                 </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Values & Footer */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-8 border-b border-gray-100 pb-16 mb-16 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">Our Core Values</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {['Excellence', 'Transformation', 'Integrity', 'Innovation', 'Empowerment'].map(v => (
                  <span key={v} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs md:text-sm font-bold text-gray-700">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
               <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-emerald-700 flex items-center gap-2 hover:underline">
                 Visit Parent Site <Globe className="w-4 h-4" />
               </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs md:text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Micdup Initiative. Built for voices that shape society.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
