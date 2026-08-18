# MUI Forge — The Mic'd Up Initiative

MUI Forge is a high-performance, role-based educational management platform built to facilitate the transformation of African campus cultures. It streamlines the journey from student application to leadership formation and real-world problem-solving.

## 🌍 Why This Matters Now

Africa has the youngest population on earth — more than **400 million** people between 15 and 35. By 2050, that number will exceed **830 million**. This is either the greatest resource in human history or the greatest unmanaged risk.

**Campuses are formation ground.** Currently, that formation is often broken. The MUI Forge is the digital infrastructure for a movement that isn't waiting for governments to fix it — we are building the fix from the inside, shaping voices that shape culture.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, Server Actions)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **CMS**: [Sanity v3](https://www.sanity.io/) (Headless CMS for courses and media)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## ✨ Key Features

### 🎓 For Students
- **12-Week Formation Journey**: Structured pillars (Identity, Critical Thinking, Awareness, Capstone).
- **Interactive Journaling**: Offline-first journaling with sync capabilities for personal reflection.
- **Vision Clubs**: Intercampus collaboration groups focused on solving specific societal problems.
- **Course Library**: Access to curated video content and articles via Sanity integration.

### 🤝 For Mentors
- **Student Management**: Review tasks and provide feedback on shared journal entries.
- **Progress Tracking**: Monitor student growth throughout the 12-week cohort.
- **Vision Club Mentorship**: Guide groups through their semester-long "Vision Reports."

### 🛡️ For Admins
- **Cohort Management**: Automated workflow for opening applications, admitting students, and advancing weeks.
- **Analytics Dashboard**: Real-time insights into campus impact and student engagement.
- **Content Orchestration**: Full control over forge announcements and resources.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 20+ 
- A Supabase Project
- A Sanity Project

### 2. Installation
```bash
git clone https://github.com/your-repo/mui-forge.git
cd mui-forge
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 4. Database Setup
Run the SQL migrations provided in the `/supabase` folder:
1. `schema.sql` — Base tables and RLS policies.
2. `fix_profiles_rls_recursion.sql` — RLS optimization.

### 5. Development
```bash
npm run dev
```

---

## 📁 Project Structure

- `src/app`: Next.js App Router (Routes & Layouts)
- `src/components`: UI components (Auth, Dashboard, Layout, Cohort)
- `src/lib`: Shared utilities, Supabase client, and Server Actions
- `src/types`: TypeScript definitions
- `supabase/`: SQL migrations and database configuration
- `sanity/`: Schema and config for content management

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📩 Contact
**Mic'd Up Initiative**  
Email: micdupinitiative@gmail.com  
Web: [micdupinitiative.site](https://micdupinitiative.site)
