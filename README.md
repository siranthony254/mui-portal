# MUI Portal — Setup Guide

## Tech Stack
- **Next.js 14** (App Router + TypeScript)
- **Supabase** — Email sign-in + PostgreSQL + Realtime
- **Sanity v3** — CMS for all content (videos, articles, courses, announcements)
- **Tailwind CSS** — Styling with MUI brand colors
- **Vercel** — Hosting

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local` and fill in your keys:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — from Sanity dashboard
- `NEXT_PUBLIC_SANITY_DATASET` — `production`

### 3. Set up Supabase
1. Create project at supabase.com
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Email in Authentication → Providers

### 4. Set up Sanity
1. Create project at sanity.io
2. Copy project ID to env
3. Add content via Sanity Studio

### 5. Run locally
```bash
npm run dev
```

### 6. First admin user
After signing up, run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin', approved = true WHERE email = 'your@email.com';
```

## Cohort Workflow (manageable by one person)
1. **Create cohort** → Admin → Cohorts → Create
2. **Open applications** → Toggle "Applications open"
3. **Students apply** → Auto-placed on waitlist
4. **Open cohort** → "Open cohort & admit students" → dashboards unlock instantly
5. **Advance weekly** → "Advance to Week X" button creates tasks automatically
6. **Review tasks** → Mentors review via Mentor portal
7. **Activate features** → Toggle Vision Clubs, Capstone when ready

## Roles
| Role | Access |
|------|--------|
| `admin` | Full portal management |
| `mentor` | Mentor portal (requires admin approval) |
| `student` | Student portal (waitlisted until cohort opens) |

## Contact
micdupinitiative@gmail.com | micdupinitiative.site
