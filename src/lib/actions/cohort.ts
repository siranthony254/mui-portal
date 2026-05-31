'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function openCohort(cohortId: string) {
  const admin = await createAdminClient()

  const { error: cohortError } = await admin
    .from('cohorts')
    .update({ status: 'active', applications_open: false })
    .eq('id', cohortId)
  if (cohortError) return { error: cohortError.message }

  const { data: waitlist } = await admin
    .from('waitlist')
    .select('student_id')
    .eq('cohort_id', cohortId)
    .eq('status', 'waiting')

  if (!waitlist?.length) return { success: 'Cohort opened. No waitlisted students.' }

  const enrollments = waitlist.map(w => ({
    cohort_id: cohortId, student_id: w.student_id,
    status: 'enrolled', current_pillar: 1, current_week: 1,
  }))

  const { error: enrollError } = await admin
    .from('enrollments')
    .upsert(enrollments, { onConflict: 'cohort_id,student_id' })
  if (enrollError) return { error: enrollError.message }

  await admin.from('waitlist').update({ status: 'admitted' })
    .eq('cohort_id', cohortId).eq('status', 'waiting')

  await createWeeklyTasks(cohortId, 1, 1)

  revalidatePath('/admin')
  revalidatePath('/admin/cohorts')
  return { success: `Cohort opened. ${waitlist.length} students enrolled.` }
}

export async function createWeeklyTasks(cohortId: string, pillar: number, week: number) {
  const admin = await createAdminClient()
  const { data: enrollments } = await admin
    .from('enrollments')
    .select('id, student_id')
    .eq('cohort_id', cohortId)
    .in('status', ['enrolled', 'active'])

  if (!enrollments?.length) return

  const tasks = enrollments.map(e => ({
    enrollment_id: e.id, student_id: e.student_id, cohort_id: cohortId,
    pillar_number: pillar, week_number: week,
    title: getTaskTitle(pillar, week),
    prompt: getTaskPrompt(pillar, week),
    status: 'pending',
  }))

  await admin.from('tasks').upsert(tasks, { onConflict: 'enrollment_id,pillar_number,week_number' })
}

export async function advanceCohortWeek(cohortId: string) {
  const admin = await createAdminClient()
  const { data: cohort } = await admin.from('cohorts').select('current_week').eq('id', cohortId).single()
  if (!cohort || cohort.current_week >= 12) return { error: 'Already at final week.' }

  const newWeek = cohort.current_week + 1
  const newPillar = Math.min(Math.ceil(newWeek / 2.4), 5)

  await admin.from('cohorts').update({ current_week: newWeek }).eq('id', cohortId)
  await createWeeklyTasks(cohortId, newPillar, newWeek)

  revalidatePath('/admin/cohorts')
  return { success: `Advanced to Week ${newWeek}` }
}

export async function toggleCohortFeature(
  cohortId: string,
  feature: 'vision_clubs_enabled' | 'capstone_submissions_enabled' | 'chat_enabled' | 'applications_open',
  value: boolean
) {
  const admin = await createAdminClient()
  const { error } = await admin.from('cohorts').update({ [feature]: value }).eq('id', cohortId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: 'Updated.' }
}

export async function activateVisionClub(clubId: string) {
  const admin = await createAdminClient()
  const { error } = await admin.from('vision_clubs')
    .update({ status: 'active', activated_at: new Date().toISOString() })
    .eq('id', clubId)
  if (error) return { error: error.message }
  revalidatePath('/admin/vision-clubs')
  return { success: 'Vision club activated.' }
}

export async function approveMentor(mentorId: string, approved: boolean) {
  const admin = await createAdminClient()
  const { error } = await admin.from('profiles')
    .update({ approved })
    .eq('id', mentorId)
    .eq('role', 'mentor')
  if (error) return { error: error.message }
  revalidatePath('/admin/mentors')
  return { success: approved ? 'Mentor approved.' : 'Mentor rejected.' }
}

export async function admitStudent(waitlistId: string, cohortId: string, studentId: string) {
  const admin = await createAdminClient()
  const { error: enroll } = await admin.from('enrollments').upsert({
    cohort_id: cohortId, student_id: studentId,
    status: 'enrolled', current_pillar: 1, current_week: 1,
  }, { onConflict: 'cohort_id,student_id' })
  if (enroll) return { error: enroll.message }
  await admin.from('waitlist').update({ status: 'admitted' }).eq('id', waitlistId)
  revalidatePath('/admin/waitlist')
  return { success: 'Student admitted.' }
}

export async function joinWaitlist(cohortId: string, essay: string, motivation: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  const { error } = await supabase.from('waitlist').insert({
    cohort_id: cohortId, student_id: user.id,
    application_essay: essay, motivation,
  })
  if (error) return { error: error.message }
  return { success: 'You are on the waitlist. We will notify you when the cohort opens.' }
}

export async function submitTask(taskId: string, submission: string, submissionUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }
  const { error } = await supabase.from('tasks').update({
    submission, submission_url: submissionUrl,
    status: 'submitted', submitted_at: new Date().toISOString(),
  }).eq('id', taskId).eq('student_id', user.id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tasks')
  return { success: 'Task submitted successfully.' }
}

export async function reviewTask(taskId: string, feedback: string, approved: boolean) {
  const admin = await createAdminClient()
  const { error } = await admin.from('tasks').update({
    mentor_feedback: feedback,
    status: approved ? 'approved' : 'reviewed',
    reviewed_at: new Date().toISOString(),
  }).eq('id', taskId)
  if (error) return { error: error.message }
  revalidatePath('/mentor/tasks')
  return { success: 'Review saved.' }
}

function getTaskTitle(pillar: number, week: number): string {
  const titles: Record<string, string> = {
    '1-1': 'My Formation Influences',
    '1-2': 'Inherited vs Examined Beliefs',
    '2-3': 'What Education Is Actually For',
    '2-4': 'Information vs Understanding vs Wisdom',
    '3-5': 'A Real Problem I See',
    '3-6': 'Root Cause Analysis',
    '4-7': 'From Complaint to Diagnosis',
    '4-8': 'My Solution Proposal',
    '5-9': 'My Throughline Statement',
    '5-10': 'Draft Talk Recording',
    '5-11': 'Full Capstone Draft',
    '5-12': 'Capstone Presentation',
  }
  return titles[`${pillar}-${week}`] || `Pillar ${pillar} — Week ${week} Task`
}

function getTaskPrompt(pillar: number, week: number): string {
  const prompts: Record<string, string> = {
    '1-1': `Write a 300–500 word reflection completing this sentence: "My thinking has been shaped by..." Name at least three specific experiences, people, or systems that formed how you see yourself and the world. Be honest — not the answer you think sounds good, but the actual answer.`,
    '1-2': `Identify two beliefs you hold that you inherited (from family, culture, or school) and two beliefs you have examined and chosen yourself. For each inherited belief: when did you first receive it? Have you tested it? For each examined belief: what evidence or experience led you to it?`,
    '2-3': `Complete this sentence in 400+ words: "I have been educated to..." Then answer: is what you were educated to do the same as what you were educated to become? What is the gap between the credential your institution is giving you and the formation it was supposed to provide?`,
    '2-4': `Choose one concept from your current field of study. Apply the Feynman Technique: explain it in simple language as if teaching a 12-year-old. Where does your explanation break down? That breakdown point is the edge of your understanding. Describe what you found there.`,
    '3-5': `Name one specific, real problem you have observed in your campus, institution, or immediate community. Not "the system is broken" — a named, specific problem with evidence. Who does it affect? How frequently? What evidence supports your observation? Submit your problem statement (200–400 words).`,
    '3-6': `Take the problem you identified last week and apply the 5 Whys. Ask "why?" five times, letting each answer become the next "why?" question. Write out all five levels. What root cause did you reach? Is it different from how you originally understood the problem?`,
    '4-7': `Using the problem and root cause from Pillar 3, write a case-style breakdown: (1) What is visibly happening, (2) What is actually causing it, (3) Who has tried to address it and what happened, (4) What a thoughtful response would need to do. Maximum 500 words.`,
    '4-8': `Propose a specific, implementable response to your identified problem. Your proposal must: name the root cause it addresses, describe concrete actions that are realistic with available resources, anticipate one unintended consequence and how you would manage it. 400–600 words.`,
    '5-9': `Write your capstone throughline in one sentence (maximum 15 words): "My talk will argue that..." This sentence is the spine of everything. Share it and explain in 100 words why you chose this position and why it matters.`,
    '5-10': `Record a 2–3 minute rough draft of your capstone talk. Audio note or video — does not need to be polished. Just speak your throughline, your evidence, and your call to action. Upload the link and write 100 words on what you noticed when you heard yourself.`,
    '5-11': `Submit the full written draft of your capstone talk (800–1,200 words). Structure: opening hook, the problem, your argument, the evidence, the counterargument you acknowledge, your response to it, and a closing that is a call to action — not a summary.`,
    '5-12': `Your capstone presentation. Record a 10–15 minute talk presenting your position on the problem you have been working on since Pillar 3. This is your Level 3 output — it will be archived on MUI platforms. Submit the video link and a 100-word reflection on what changed for you during this 12-week journey.`,
  }
  return prompts[`${pillar}-${week}`] || `Complete your Week ${week} formation task for Pillar ${pillar}.`
}
