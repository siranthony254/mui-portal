'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, Users, ShieldCheck, Zap, Globe, MessageSquare, Menu, X } from '@/components/icons'
import { cn } from '@/lib/utils'

export function LandingContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center transition-transform group-hover:rotate-12 group-active:scale-95 shadow-lg shadow-emerald-700/20">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">MUI Forge</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/auth/login" className="text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                Dashboard
              </Link>
              <Link href="/auth/register" className="text-sm font-bold text-emerald-700 bg-emerald-50 px-6 py-2.5 rounded-full hover:bg-emerald-100 transition-all active:scale-95 uppercase tracking-widest">
                Join Cohort
              </Link>
              <Link href="/auth/mentor-apply" className="text-sm font-bold text-white bg-emerald-700 px-6 py-2.5 rounded-full hover:bg-emerald-800 transition-all active:scale-95 shadow-md shadow-emerald-700/20 uppercase tracking-widest">
                Mentor
              </Link>
            </div>

            {/* Mobile Nav Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-emerald-900 bg-emerald-50 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-emerald-50 py-6 px-6 space-y-4 shadow-2xl animate-fade-in-up">
            <Link
              href="/auth/login"
              className="block px-4 py-4 text-sm font-bold text-gray-900 border-b border-gray-50 uppercase tracking-widest"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/auth/register"
              className="block px-4 py-4 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-2xl uppercase tracking-widest"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply for the cohort
            </Link>
            <Link
              href="/auth/mentor-apply"
              className="block px-4 py-4 text-sm font-bold text-white bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-700/20 uppercase tracking-widest text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply as a mentor
            </Link>
          </div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/50 rounded-full blur-[120px] -z-10 animate-float" />
        <div className="absolute bottom-0 left-[-5%] w-[30%] h-[30%] bg-emerald-50 rounded-full blur-[80px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] animate-reveal">
              <Zap className="w-3.5 h-3.5 fill-emerald-800" /> Shaping the future of campuses
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-gray-900 leading-[0.95] tracking-tighter animate-reveal [animation-delay:200ms]">
              Voices that <span className="text-emerald-700">Shape</span> <br/>
              <span className="italic animate-culture-hero">Culture.</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto animate-reveal [animation-delay:400ms]">
              Real problems will be solved by bold people who were heard, formed, and trusted even while they were still in school.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 animate-reveal [animation-delay:600ms]">
              <Link href="/auth/register" className="w-full sm:w-auto bg-emerald-700 text-white py-5 px-10 text-lg font-bold rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-800 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-700/40 group">
                Apply for the Cohort <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/mentor-apply" className="w-full sm:w-auto bg-white text-emerald-900 py-5 px-10 text-lg font-bold rounded-2xl border-2 border-emerald-100 hover:border-emerald-700 hover:text-emerald-700 transition-all flex items-center justify-center">
                Become a Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Mission & Movement */}
      <section className="py-24 md:py-32 bg-gray-900 text-white rounded-[3rem] md:rounded-[5rem] mx-4 my-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-20">
            <div className="space-y-6">
              <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">The Movement</h2>
              <p className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Beyond the <br/> <span className="text-emerald-400 underline decoration-8 underline-offset-8">Status Quo.</span>
              </p>
            </div>
            <p className="text-lg md:text-xl text-emerald-100/60 leading-relaxed font-medium">
              The Mic’d Up Initiative is committed to transforming campus culture by amplifying authentic culture-shaping voices through storytelling, research, and intentional formation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
            {[
              { icon: Users, title: 'Discover & Shape', desc: 'Identifying emerging talent and providing leadership formation to lead with responsible influence.' },
              { icon: BookOpen, title: 'Curate Narratives', desc: 'Producing purpose-driven media that shapes what youth consume across campuses.' },
              { icon: MessageSquare, title: 'Host Dialogue', desc: 'Creating spaces for intellectual exchange through talks, podcasts, and summits.' },
              { icon: ShieldCheck, title: 'Produce Insight', desc: 'Converting conversations into societal impact through youth-led research and insights.' },
            ].map((item, i) => (
              <div key={item.title} className="group bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] hover:bg-emerald-500 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-8 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-emerald-950 transition-colors">{item.title}</h3>
                <p className="text-emerald-100/50 group-hover:text-emerald-900 font-medium leading-relaxed transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Tools of Influence */}
      <section className="py-24 md:py-40 px-6 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="flex-1 space-y-12">
              <div className="space-y-6">
                <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em]">Mechanisms of Impact</h2>
                <p className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                  Tools of <span className="text-emerald-700">Influence.</span>
                </p>
                <p className="text-lg text-gray-500 font-medium">
                  We equip you with the specific tools needed to impact campus culture effectively and sustainably.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {[
                  { title: 'Intentional Storytelling', desc: 'Podcasts and documentaries designed to elevate substance and perspective.' },
                  { title: 'Structured Mentorship', desc: 'Selective cohorts focusing on character, clarity of purpose, and leadership.' },
                  { title: 'Insightful Research', desc: 'Evidence-based insights that direct content and policy influence.' },
                ].map((tool) => (
                  <div key={tool.title} className="flex gap-6 items-start group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-700 group-hover:text-white transition-colors duration-300">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-gray-900 tracking-tight">{tool.title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative w-full">
              <div className="aspect-[4/5] bg-emerald-50 rounded-[4rem] flex flex-col items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 text-emerald-200">
                  <Globe className="w-32 h-32 rotate-12" />
                </div>
                <blockquote className="relative space-y-6">
                   <p className="text-3xl md:text-4xl font-black text-emerald-950 leading-tight">
                     "Shaping people <br/> <span className="text-emerald-600">before</span> platforms."
                   </p>
                   <footer className="flex items-center gap-3">
                     <div className="w-10 h-0.5 bg-emerald-700" />
                     <cite className="text-xs font-black text-emerald-900 uppercase tracking-widest not-italic">The MUI Vision</cite>
                   </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Why This Matters Now */}
      <section className="py-24 md:py-40 bg-emerald-900 relative px-6 sm:px-6 lg:px-8 rounded-[3rem] md:rounded-[5rem] mx-4 mb-24 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-emerald-800/20 rounded-full blur-[120px] -z-0" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-950 rounded-full blur-[80px] -z-0" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">The Urgency</h2>
              <p className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.95]">
                Why This <br /> Matters Now.
              </p>
              <div className="w-20 h-1.5 bg-emerald-500 rounded-full" />
            </div>

            {/* Right Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                  <Globe className="w-64 h-64 text-emerald-900" />
                </div>

                <div className="relative z-10 space-y-10">
                  <p className="text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
                    Africa has the youngest population on earth — more than <span className="text-emerald-700 font-bold">400 million</span> people between 15 and 35. By 2050, that number will exceed <span className="text-emerald-700 font-bold">830 million</span>. This is either the greatest resource in human history, or the greatest unmanaged risk — depending entirely on what happens to those young people during their formation years.
                  </p>

                  <div className="pt-8 border-t border-emerald-50">
                    <p className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
                      Campuses are <span className="text-emerald-600">formation ground</span>. And right now, formation is broken. We are not waiting for governments to fix it. <span className="underline decoration-emerald-500 decoration-4 underline-offset-8">We are building the fix from inside.</span>
                    </p>
                  </div>

                  <div className="pt-4">
                    <Link href="/auth/register" className="inline-flex items-center gap-4 group/btn bg-emerald-700 text-white px-8 py-4 rounded-2xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
                      <span className="text-sm font-black uppercase tracking-widest">Apply Now</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Values & Footer */}
      <footer className="py-24 px-6 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 border-b border-gray-100 pb-20 mb-12">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter">Our Core DNA.</h2>
              <div className="flex flex-wrap gap-3">
                {['Excellence', 'Transformation', 'Integrity', 'Innovation', 'Empowerment'].map(v => (
                  <span key={v} className="px-6 py-2 bg-emerald-50 text-emerald-900 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                    {v}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:text-right flex flex-col lg:items-end justify-center space-y-4">
              <p className="text-gray-400 font-medium">Join the movement shaping the generation.</p>
              <a href="https://micdupinitiative.site" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-emerald-700 text-lg font-black hover:text-emerald-900 transition-colors uppercase tracking-widest">
                Parent Institution <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 grayscale opacity-50">
              <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest">MUI Forge</span>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} Micdup Initiative. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
