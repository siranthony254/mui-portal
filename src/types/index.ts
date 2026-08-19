export type UserRole = 'admin' | 'mentor' | 'student'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  institution?: string
  institution_type?: 'university' | 'tvet' | 'college' | 'kmtc'
  year_of_study?: string
  county?: string
  phone?: string
  bio?: string
  approved: boolean
  created_at: string
  updated_at: string
}

export type CohortStatus = 'draft' | 'applications_open' | 'active' | 'completed'

export interface Cohort {
  id: string
  name: string
  semester: string
  year: number
  status: CohortStatus
  start_date?: string
  end_date?: string
  max_participants: number
  current_week: number
  description?: string
  objectives?: string[]
  pillars_config?: Pillar[]
  applications_open: boolean
  vision_clubs_enabled: boolean
  capstone_submissions_enabled: boolean
  chat_enabled: boolean
  created_at: string
}

export type EnrollmentStatus = 'waitlisted' | 'enrolled' | 'active' | 'completed' | 'dropped'

export interface Enrollment {
  id: string
  cohort_id: string
  student_id: string
  mentor_id?: string
  status: EnrollmentStatus
  current_pillar: number
  current_week: number
  enrolled_at: string
  completed_at?: string
  cohort?: Cohort
  student?: Profile
  mentor?: Profile
}

export interface Pillar {
  number: 1 | 2 | 3 | 4 | 5
  name: string
  subtitle: string
  goal: string
  weeks: string
  description: string
  objectives?: string[]
}

export const PILLARS: Pillar[] = [
  {
    number: 1,
    name: 'Identity',
    subtitle: 'Understanding self & belief systems',
    goal: 'Clarity of self',
    weeks: 'Weeks 1–2',
    description: 'Participants articulate: "This is what has shaped how I think."',
  },
  {
    number: 2,
    name: 'Understanding',
    subtitle: 'Rethinking education & knowledge',
    goal: 'Clarity of thinking',
    weeks: 'Weeks 3–4',
    description: 'Participants distinguish information, understanding, and wisdom.',
  },
  {
    number: 3,
    name: 'Awareness',
    subtitle: 'Seeing real problems clearly',
    goal: 'Clarity of environment',
    weeks: 'Weeks 5–6',
    description: 'Participants identify a real, specific problem around them.',
  },
  {
    number: 4,
    name: 'Solution Thinking',
    subtitle: 'Moving from complaints to clarity',
    goal: 'Clarity of reasoning',
    weeks: 'Weeks 7–8',
    description: 'Participants diagnose problems and propose thoughtful responses.',
  },
  {
    number: 5,
    name: 'Voice & Responsibility',
    subtitle: 'Owning ideas and expressing them',
    goal: 'Clarity of expression',
    weeks: 'Weeks 9–12',
    description: 'Participants clearly express an idea and stand behind it publicly.',
  },
]

export type TaskStatus = 'pending' | 'submitted' | 'reviewed' | 'approved'

export interface Task {
  id: string
  enrollment_id: string
  student_id: string
  cohort_id: string
  pillar_number: number
  week_number: number
  title: string
  prompt: string
  submission?: string
  submission_url?: string
  status: TaskStatus
  mentor_feedback?: string
  submitted_at?: string
  reviewed_at?: string
  created_at: string
}

export interface JournalEntry {
  id: string
  student_id: string
  pillar_number: number
  week_number: number
  content: string
  is_shared: boolean
  created_at: string
  updated_at: string
}

export const JOURNAL_PROMPTS: Record<number, string> = {
  1: "Who or what has been the loudest voice in your head this week? Whose expectations are you trying to meet?",
  2: "What is one thing you believed as a child that you no longer believe? What changed?",
  3: "Reflect on your current education: Are you being trained to follow, or formed to lead? Where is the friction?",
  4: "When was the last time you admitted you didn't understand something you were supposed to know? How did it feel?",
  5: "What is one 'small' problem you see every day that everyone else seems to have accepted as normal?",
  6: "If you had to explain the problem you identified to someone who has never been to your campus, what would you say?",
  7: "How much of your frustration with your community is 'complaint' and how much is 'grief'? What is the difference?",
  8: "What would it cost you personally to be part of the solution you proposed? Are you willing to pay it?",
  9: "If you could only say one thing to your generation and be certain they would hear it, what would it be?",
  10: "Where did you feel the most resistance when drafting your talk? Why is that part hard to say?",
  11: "Look back at your Week 1 journal. How has your definition of 'responsibility' changed since then?",
  12: "The cohort is ending, but the work is beginning. What is the one thing you are taking with you that cannot be taken away?",
}

export type ContentType = 'video' | 'article' | 'audio' | 'pdf' | 'image'

export interface ContentBlock {
  _id: string
  _type: 'content'
  title: string
  description: string
  contentType: ContentType
  url?: string
  youtubeId?: string
  body?: any[]
  pillarNumber: number
  weekNumber: number
  durationMinutes?: number
  isRequired: boolean
  tags: string[]
  publishedAt: string
}

export interface Course {
  _id: string
  _type: 'course'
  title: string
  slug: { current: string }
  description: string
  category: string
  isCoreCurriculum: boolean
  thumbnail?: any
  modules: CourseModule[]
  totalDurationMinutes: number
  publishedAt: string
  moduleCount?: number
}

export interface CourseModule {
  _key: string
  title: string
  description?: string
  sessions: CourseSession[]
}

export interface CourseSession {
  _key: string
  title: string
  contentBlocks: Array<VideoBlock | TextBlock | ImageBlock>
}

export interface VideoBlock {
  _key: string
  _type: 'videoBlock'
  title?: string
  url: string
  description?: string
}

export interface TextBlock {
  _key: string
  _type: 'textBlock'
  body: any[]
}

export interface ImageBlock {
  _key: string
  _type: 'imageBlock'
  image: any
  caption?: string
}

export interface VisionClub {
  id: string
  cohort_id: string
  name: string
  problem_statement: string
  description?: string
  status: 'pending' | 'active' | 'completed'
  mentor_id?: string
  created_by: string
  campus_count: number
  activated_at?: string
  created_at: string
}

export interface Conversation {
  id: string
  participant_ids: string[]
  cohort_id?: string
  last_message?: string
  last_message_at?: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read_by: string[]
  created_at: string
  sender?: Profile
}

export interface AccountabilityPartnership {
  id: string
  cohort_id: string
  student_id_1: string
  student_id_2: string
  last_check_in_at?: string
  created_at: string
  partner?: Profile
}

export interface CheckInLog {
  id: string
  partnership_id: string
  student_id: string
  reflection?: string
  check_in_date: string
  created_at: string
}

export function getPillarColor(pillar: number): string {
  const colors: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-800',
    2: 'bg-blue-100 text-blue-800',
    3: 'bg-amber-100 text-amber-800',
    4: 'bg-red-100 text-red-800',
    5: 'bg-purple-100 text-purple-800',
  }
  return colors[pillar] || 'bg-gray-100 text-gray-700'
}

export const COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Kitui','Machakos',
  'Meru','Nyeri','Muranga','Kiambu','Kajiado','Makueni','Kilifi','Kwale',
  'Garissa','Wajir','Mandera','Marsabit','Isiolo','Samburu','Laikipia',
  'Nyandarua','Kirinyaga','Embu','Tharaka Nithi','Siaya','Kisii','Nyamira',
  'Migori','Homabay','Bomet','Kericho','Baringo','Uasin Gishu','Nandi',
  'Trans Nzoia','Turkana','West Pokot','Bungoma','Busia','Vihiga','Kakamega','Other',
]

