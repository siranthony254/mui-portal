'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import type { Profile } from '@/types'
import { LayoutDashboard, Users, BookOpen, MessageSquare, Settings, BarChart2, Flag, Award, Mic2, ClipboardList, Bell, UserCheck, Lightbulb } from '@/components/icons'

function getNav(role: string, base: string) {
  if (role === 'admin') return [
    { title:'Overview', items:[
      {id:'dashboard',label:'Dashboard',href:`${base}`,icon:LayoutDashboard},
      {id:'cohorts',label:'Cohorts',href:`${base}/cohorts`,icon:Award},
      {id:'waitlist',label:'Waitlist',href:`${base}/waitlist`,icon:ClipboardList},
      {id:'analytics',label:'Analytics',href:`${base}/analytics`,icon:BarChart2},
    ]},
    { title:'People', items:[
      {id:'students',label:'Students',href:`${base}/students`,icon:Users},
      {id:'mentors',label:'Mentors',href:`${base}/mentors`,icon:UserCheck},
      {id:'ambassadors',label:'Ambassadors',href:`${base}/ambassadors`,icon:Flag},
    ]},
    { title:'Content', items:[
      {id:'content',label:'Content Manager',href:`${base}/content`,icon:BookOpen},
      {id:'courses',label:'Courses',href:`${base}/courses`,icon:Mic2},
      {id:'vclubs',label:'Vision Clubs',href:`${base}/vision-clubs`,icon:Lightbulb},
    ]},
    { title:'Comms', items:[
      {id:'messages',label:'Messages',href:`${base}/messages`,icon:MessageSquare},
      {id:'announcements',label:'Announcements',href:`${base}/announcements`,icon:Bell},
      {id:'settings',label:'Settings',href:`${base}/settings`,icon:Settings},
    ]},
  ]
  if (role === 'mentor') return [
    { title:'My Cohort', items:[
      {id:'dashboard',label:'Dashboard',href:`${base}`,icon:LayoutDashboard},
      {id:'students',label:'My Students',href:`${base}/students`,icon:Users},
      {id:'tasks',label:'Task Reviews',href:`${base}/tasks`,icon:ClipboardList},
    ]},
    { title:'Comms', items:[
      {id:'messages',label:'Messages',href:`${base}/messages`,icon:MessageSquare},
    ]},
  ]
  return [
    { title:'My Journey', items:[
      {id:'dashboard',label:'Dashboard',href:`${base}`,icon:LayoutDashboard},
      {id:'cohort',label:'My Cohort',href:`${base}/cohort`,icon:Award},
      {id:'tasks',label:'Weekly Tasks',href:`${base}/tasks`,icon:ClipboardList},
      {id:'capstone',label:'Capstone',href:`${base}/capstone`,icon:Mic2},
    ]},
    { title:'Learn', items:[
      {id:'courses',label:'Courses',href:`${base}/courses`,icon:BookOpen},
      {id:'resources',label:'Resources',href:`${base}/resources`,icon:BookOpen},
    ]},
    { title:'Community', items:[
      {id:'vclubs',label:'Vision Clubs',href:`${base}/vision-clubs`,icon:Lightbulb},
      {id:'messages',label:'Messages',href:`${base}/messages`,icon:MessageSquare},
    ]},
    { title:'Account', items:[
      {id:'profile',label:'My Profile',href:`${base}/profile`,icon:Users},
    ]},
  ]
}

function getBase(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'mentor') return '/mentor'
  return '/dashboard'
}

export function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const base = getBase(profile.role)
  const nav = getNav(profile.role, base)

  return (
    <aside className="portal-sidebar">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">MUI Portal</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {nav.map(section => (
          <div key={section.title}>
            <p className="section-title px-2">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon
                const active = pathname === item.href || (item.href !== base && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href} className={cn('nav-item', active && 'nav-item-active')}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50">
          <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {getInitials(profile.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
