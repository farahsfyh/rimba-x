# RimbaX Career Readiness Expansion — Implementation Plan

> **Built on top of:** Next.js 16.1.6 · Supabase · Gemini 2.0 Flash · pgvector · Tailwind CSS · TypeScript  
> **Zero new paid services** — all features use existing stack + free tiers  
> **Preserves:** All existing auth, RAG, tutor chat, gamification, TTS, avatar, exercises, notes  

---

## Table of Contents

1. [Feature Overview & User Journey](#1-feature-overview--user-journey)
2. [New Database Schema (Additive Only)](#2-new-database-schema-additive-only)
3. [New API Routes](#3-new-api-routes)
4. [New Pages & UI Routes](#4-new-pages--ui-routes)
5. [New lib/ Modules](#5-new-lib-modules)
6. [New Components](#6-new-components)
7. [Sidebar Navigation Updates](#7-sidebar-navigation-updates)
8. [Gamification Integration](#8-gamification-integration)
9. [Data Flows](#9-data-flows)
10. [Free Tier & Scalability Notes](#10-free-tier--scalability-notes)
11. [Implementation Order](#11-implementation-order)
12. [New Environment Variables](#12-new-environment-variables)

---

## 1. Feature Overview & User Journey

### The "Bob Flow"

```
1. Bob signs up → completes Career Profile (education, experience, skills, goals)
        ↓
2. AI Career Analysis → detects skill gaps vs. target career
        ↓
3. Personalised Learning Modules generated → Bob studies via existing AI tutor + uploads
        ↓
4. Bob earns Certificates on module completion (linked to Google/Coursera free resources)
        ↓
5. Bob generates AI-polished Resume → applies to Malaysian companies
```

### The 5 New Feature Pillars

| # | Feature | Builds On | New? |
|---|---------|-----------|------|
| 1 | **Career Profile** | Supabase user tables | New tables + page |
| 2 | **Career Path Recommendation** | Gemini + existing learning-path AI | New API + page |
| 3 | **Skill Gap Analysis** | Career Profile + Gemini | New API route |
| 4 | **Personalised Learning Modules** | Existing adaptive learning path | Extended |
| 5 | **AI Resume Builder** | Career Profile + Gemini | New API + page |

> **Certificate system** uses free external providers (Google Career Certificates, Coursera audit, MyFutureJobs) — RimbaX tracks completion and links out, no custom cert infrastructure needed.

---

## 2. New Database Schema (Additive Only)

All new tables follow the same RLS pattern: `user_id = auth.uid()`.  
**No existing tables are modified.**

```sql
-- ─────────────────────────────────────────────
-- 1. Career Profile
-- ─────────────────────────────────────────────
CREATE TABLE career_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name     text,
  current_level text,                          -- 'student' | 'fresh_grad' | 'working'
  field_of_study text,
  institution   text,
  graduation_year int,
  target_career text,                          -- e.g. "Data Analyst"
  target_industry text,                        -- e.g. "Finance", "Tech"
  work_experience jsonb DEFAULT '[]',          -- [{ company, role, years, description }]
  skills        text[] DEFAULT '{}',           -- e.g. ['Excel', 'Python', 'SQL']
  certifications text[] DEFAULT '{}',          -- existing certs
  career_goals  text,
  location      text DEFAULT 'Malaysia',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own career profile"
  ON career_profiles FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 2. Skill Gap Analysis Results
-- ─────────────────────────────────────────────
CREATE TABLE skill_gap_analyses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_career   text NOT NULL,
  required_skills jsonb NOT NULL,   -- [{ skill, importance: 'critical'|'important'|'nice', category }]
  current_skills  text[],
  gap_skills      jsonb NOT NULL,   -- [{ skill, importance, resources: [...], estimatedHours }]
  match_score     int,              -- 0-100
  ai_summary      text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE skill_gap_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gap analyses"
  ON skill_gap_analyses FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 3. Learning Modules (extends existing learning path)
-- ─────────────────────────────────────────────
CREATE TABLE learning_modules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gap_analysis_id uuid REFERENCES skill_gap_analyses(id) ON DELETE SET NULL,
  title           text NOT NULL,
  skill_target    text NOT NULL,           -- skill this module closes
  description     text,
  difficulty      text,                    -- 'beginner' | 'intermediate' | 'advanced'
  estimated_hours int,
  status          text DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
  completion_pct  int DEFAULT 0,
  resources       jsonb DEFAULT '[]',      -- [{ title, url, type: 'video'|'article'|'course', free: bool }]
  certificate_url text,                    -- link to free cert (Google, Coursera, etc.)
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own modules"
  ON learning_modules FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 4. Resume Versions
-- ─────────────────────────────────────────────
CREATE TABLE resume_versions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  version_name    text DEFAULT 'Resume v1',
  target_role     text,
  content_json    jsonb NOT NULL,          -- structured resume sections
  ai_feedback     text,
  ats_score       int,                     -- ATS compatibility score 0-100
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own resumes"
  ON resume_versions FOR ALL USING (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- 5. Certificate Tracker
-- ─────────────────────────────────────────────
CREATE TABLE user_certificates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id       uuid REFERENCES learning_modules(id) ON DELETE SET NULL,
  cert_name       text NOT NULL,
  provider        text,                    -- 'Google', 'Coursera', 'LinkedIn Learning', etc.
  cert_url        text,
  verified        bool DEFAULT false,
  earned_at       timestamptz DEFAULT now()
);

ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own certificates"
  ON user_certificates FOR ALL USING (user_id = auth.uid());
```

---

## 3. New API Routes

### `POST /api/career/profile`
Create or update the user's career profile.

| Detail | Value |
|--------|-------|
| Auth | Required |
| Rate limit | 20 req / 1 hour (reuse existing rate-limit.ts) |

**Request body:**
```ts
{
  full_name?: string
  current_level: 'student' | 'fresh_grad' | 'working'
  field_of_study?: string
  institution?: string
  graduation_year?: number
  target_career: string
  target_industry?: string
  work_experience?: { company: string; role: string; years: number; description: string }[]
  skills: string[]
  certifications?: string[]
  career_goals?: string
  location?: string
}
```

**Flow:**
1. Validate with Zod (extend existing `validation.ts`)
2. Upsert into `career_profiles` (unique on `user_id`)
3. Return `{ success: true, profile }`

---

### `GET /api/career/profile`
Fetch the user's current career profile.

---

### `POST /api/career/analyse`
Run AI skill gap analysis based on career profile.

| Detail | Value |
|--------|-------|
| Auth | Required |
| Rate limit | 10 req / 1 hour |
| Model | `gemini-2.0-flash` |

**Flow:**
```
1. Fetch career_profile for user
2. Build Gemini prompt:
   - "Target career: {target_career} in {target_industry}, Malaysia"
   - "Current skills: {skills[]}"
   - "Return JSON: { required_skills[], gap_skills[], match_score, ai_summary }"
3. Parse JSON response
4. INSERT into skill_gap_analyses
5. Auto-generate learning_modules rows (one per gap skill)
6. Award XP (reuse awardXP() from gamification/index.ts)
7. Return { analysis, modules }
```

**Gemini prompt template** (`lib/ai/career-prompts.ts`):
```
You are a Malaysian career advisor with knowledge of the local job market.
Given the following candidate profile, perform a skill gap analysis.
Return ONLY valid JSON (no markdown):
{
  "required_skills": [{ "skill": string, "importance": "critical"|"important"|"nice", "category": string }],
  "gap_skills": [{ "skill": string, "importance": string, "estimatedHours": number, "resources": [{ "title": string, "url": string, "type": "video"|"article"|"course", "free": true }] }],
  "match_score": number,   // 0-100
  "ai_summary": string     // 2-3 sentences, in English, Malaysia-context aware
}
```

---

### `GET /api/career/modules`
Fetch all learning modules for the authenticated user.

**Query params:** `?status=not_started|in_progress|completed`

---

### `PATCH /api/career/modules/[id]`
Update module progress (completion_pct, status, certificate_url).

**Flow:**
1. Validate ownership
2. UPDATE `learning_modules`
3. If `status === 'completed'`: award XP (150 XP), insert into `user_certificates` if cert_url provided
4. Return updated module

---

### `POST /api/career/resume`
Generate or regenerate a resume using AI.

| Detail | Value |
|--------|-------|
| Auth | Required |
| Rate limit | 5 req / 1 hour |
| Model | `gemini-2.0-flash` |

**Request body:**
```ts
{
  target_role: string
  version_name?: string
  tone?: 'professional' | 'creative' | 'technical'  // default: professional
}
```

**Flow:**
```
1. Fetch career_profile + user_certificates + completed learning_modules
2. Build Gemini prompt with all context
3. Generate structured resume JSON:
   {
     summary: string,
     experience: [...],
     education: [...],
     skills: { technical: [], soft: [] },
     certifications: [...],
     projects: [...],
     ats_score: number,
     improvement_tips: string[]
   }
4. INSERT into resume_versions
5. Return { resume, ats_score, improvement_tips }
```

---

### `GET /api/career/resume`
Fetch all resume versions for the user.

---

### `POST /api/career/recommend`
Get career path recommendations based on the user's profile (lightweight, no DB write).

| Detail | Value |
|--------|-------|
| Auth | Required |
| Rate limit | 10 req / 1 hour |

**Returns:** Top 3 career paths with fit score, required skills, salary range (MY), and growth outlook — all generated by Gemini with Malaysian context.

---

## 4. New Pages & UI Routes

All new pages live inside `(dashboard)/` to inherit the existing Sidebar layout.  
**No routing changes needed to existing pages.**

```
app/
  (dashboard)/
    career/
      page.tsx             ← Career Hub (overview + quick actions)
    career/
      profile/
        page.tsx           ← Career Profile form
      analyse/
        page.tsx           ← Skill Gap Analysis results
      modules/
        page.tsx           ← Learning Modules list
        [id]/
          page.tsx         ← Individual module detail + AI tutor integration
      resume/
        page.tsx           ← Resume Builder (generate + edit + export PDF)
      recommend/
        page.tsx           ← Career Path Recommendations
```

### Page Descriptions

**`/career`** — Career Hub  
Dashboard-style landing. Shows: career profile completeness %, match score, active modules, resume count, quick-action cards. First-time users see an onboarding CTA.

**`/career/profile`** — Career Profile  
Multi-step form (3 steps): (1) Background, (2) Skills & Experience, (3) Goals. Uses existing `Input`, `Card`, `Button` components. Saves to `/api/career/profile`.

**`/career/analyse`** — Skill Gap Analysis  
Shows the latest gap analysis result. Displays: match score ring (reuse `ProgressRing`), required skills grouped by category, gap skills with free resource links, and an "Generate Learning Modules" CTA. Triggers `/api/career/analyse`.

**`/career/modules`** — Learning Modules  
Kanban-style or list view of modules grouped by status. Each module card shows skill target, difficulty badge, estimated hours, progress bar, and free resource links. Links to individual module page.

**`/career/modules/[id]`** — Module Detail  
Full module view. Integrates with existing AI tutor (deep link with pre-filled context: "Help me learn {skill_target}"). Shows curated free resources (YouTube, Coursera audit, Google free courses). Certificate logging on completion.

**`/career/resume`** — AI Resume Builder  
Three-panel layout:  
- Left: profile summary inputs (target role, tone)  
- Centre: live rendered resume preview  
- Right: ATS score gauge + AI improvement tips  
Export to PDF reuses existing `jspdf` + `html2canvas` already in dependencies.

**`/career/recommend`** — Career Path Recommendations  
Card grid of top 3 recommended careers. Each card: career title, fit score, required skills, avg Malaysian salary range, job market outlook. "Set as Target" button updates career profile.

---

## 5. New lib/ Modules

```
lib/
  career/
    prompts.ts         ← All Gemini prompt templates for career features
    parser.ts          ← Parse + validate Gemini JSON responses for career endpoints
    resources.ts       ← Curated free resource catalogue (static + enriched by AI)
    resume-builder.ts  ← Resume content structuring + PDF layout helpers
```

### `lib/career/prompts.ts`
Centralised prompt templates. Follows same pattern as `lib/ai/gemini.ts`.

```ts
export const SKILL_GAP_PROMPT = (profile: CareerProfile) => `...`
export const CAREER_RECOMMEND_PROMPT = (profile: CareerProfile) => `...`
export const RESUME_GEN_PROMPT = (profile: CareerProfile, certs: Certificate[], modules: Module[]) => `...`
```

### `lib/career/resources.ts`
A curated static map of skills → free learning resources, used as a seed when AI generates modules. This ensures free resources are always returned even when Gemini does not provide URLs.

```ts
export const FREE_RESOURCES: Record<string, Resource[]> = {
  'Python': [
    { title: 'CS50P – Python (Harvard)', url: 'https://cs50.harvard.edu/python', type: 'course', free: true },
    { title: 'Python for Everybody (Coursera audit)', url: 'https://coursera.org/learn/python', type: 'course', free: true },
  ],
  'Excel': [
    { title: 'Microsoft Excel – Official Free Training', url: 'https://support.microsoft.com/en-us/training', type: 'article', free: true },
  ],
  // ... extend for top 50 in-demand Malaysian skills
}
```

### `lib/career/parser.ts`
Safe JSON parser for AI career responses. Strips markdown fences, validates shape, falls back gracefully — same pattern used in existing `exercises/generate/route.ts`.

---

## 6. New Components

All new components live in `components/career/` and follow the existing `components/ui/` design system.

```
components/
  career/
    CareerProfileForm.tsx       ← Multi-step profile wizard
    SkillGapCard.tsx            ← Single skill gap item with resource links
    SkillMatchScore.tsx         ← Circular score display (wraps ProgressRing)
    ModuleCard.tsx              ← Learning module card with progress bar
    ModuleKanban.tsx            ← Board view: Not Started / In Progress / Done
    ResumePreview.tsx           ← Styled resume render for PDF export
    ATSScoreGauge.tsx           ← ATS score visual (0-100 gauge)
    CareerRecommendCard.tsx     ← Career recommendation card
    CertificateBadge.tsx        ← Certificate display tile
    SkillTagInput.tsx           ← Tag-based skill input (add/remove chips)
```

**Reused existing components (no changes needed):**
- `ProgressRing` → `SkillMatchScore`
- `Card`, `CardHeader`, `CardSection` → all career pages
- `Button`, `Input`, `Modal` → forms and dialogs
- `StatusBadge` → module difficulty + status labels
- `LoadingSkeleton` → loading states during AI analysis
- `ErrorMessage` → API error display

---

## 7. Sidebar Navigation Updates

Edit `components/dashboard/Sidebar.tsx` — **add** the following nav items under a new "Career" section:

```ts
// New nav group to add to Sidebar.tsx
const careerNav = [
  { label: 'Career Hub',        href: '/career',            icon: BriefcaseIcon },
  { label: 'Skill Gap Analysis', href: '/career/analyse',   icon: BarChart2Icon },
  { label: 'Learning Modules',  href: '/career/modules',    icon: BookOpenIcon },
  { label: 'Resume Builder',    href: '/career/resume',     icon: FileTextIcon },
]
```

All icons from existing `lucide-react` dependency — no new installs.

---

## 8. Gamification Integration

Reuse `lib/gamification/index.ts` with **no changes**. New XP trigger points:

| Action | XP Award | Trigger Location |
|--------|----------|-----------------|
| Career profile created | 50 XP | `POST /api/career/profile` |
| Skill gap analysis run | 75 XP | `POST /api/career/analyse` |
| Module marked in_progress | 25 XP | `PATCH /api/career/modules/[id]` |
| Module completed | 150 XP | `PATCH /api/career/modules/[id]` |
| Resume first generated | 100 XP | `POST /api/career/resume` |
| Certificate added | 200 XP | `PATCH /api/career/modules/[id]` |

New **Achievement seeds** to add to the `achievements` table:

```sql
INSERT INTO achievements (key, title, description, xp_reward, icon) VALUES
  ('career_profile_complete', 'Career Ready', 'Completed your career profile', 50, '💼'),
  ('first_gap_analysis',      'Know Your Gaps', 'Ran your first skill gap analysis', 75, '🔍'),
  ('first_module_complete',   'Skill Unlocked', 'Completed your first learning module', 150, '🎓'),
  ('resume_generated',        'Resume Ready', 'Generated your first AI resume', 100, '📄'),
  ('all_critical_gaps_closed','Job Ready',    'Closed all critical skill gaps', 500, '🚀');
```

---

## 9. Data Flows

### Career Profile Setup
```
Browser → POST /api/career/profile (JSON)
  → Zod validation (extend existing validation.ts)
  → sanitizeText() (reuse existing sanitization.ts)
  → rate limit check (reuse existing rate-limit.ts)
  → UPSERT career_profiles WHERE user_id
  → awardXP(userId, 50) if first creation
  → return { profile }
```

### Skill Gap Analysis
```
Browser → POST /api/career/analyse
  → GET career_profiles WHERE user_id
  → SKILL_GAP_PROMPT(profile) → Gemini 2.0 Flash (JSON mode)
  → parser.parseGapAnalysis(response)      safe JSON parse
  → INSERT skill_gap_analyses
  → INSERT learning_modules (one per gap_skill, pre-seed resources from lib/career/resources.ts)
  → awardXP(userId, 75)
  → return { analysis, modules }
```

### Module Progress Update
```
Browser → PATCH /api/career/modules/[id]
  → verify ownership (SELECT WHERE id AND user_id)
  → UPDATE learning_modules SET completion_pct, status
  → IF completed:
      awardXP(userId, 150)
      IF cert_url: INSERT user_certificates
                   awardXP(userId, 200)
  → return { module }
```

### Resume Generation
```
Browser → POST /api/career/resume { target_role, tone }
  → Fetch career_profile
  → Fetch completed learning_modules (skills earned)
  → Fetch user_certificates
  → RESUME_GEN_PROMPT(profile, certs, modules) → Gemini 2.0 Flash
  → Parse structured resume JSON
  → Compute ATS score (keyword match vs target_role, Gemini-assisted)
  → INSERT resume_versions
  → awardXP(userId, 100) if first resume
  → return { resume, ats_score, improvement_tips }
```

### PDF Export (Resume)
```
Browser (ResumePreview component)
  → html2canvas(resumeElement) → canvas
  → jsPDF.addImage(canvas) → PDF blob
  → trigger download
  (fully client-side, zero API cost, reuses existing jspdf + html2canvas)
```

---

## 10. Free Tier & Scalability Notes

| Concern | Solution |
|---------|----------|
| **Gemini API costs** | All career AI calls use `gemini-2.0-flash` (cheapest, already used). Skill gap analysis is JSON-only (no streaming), keeping token count low. Rate limits (10 req/hr) prevent abuse. |
| **No new paid services** | Certificate system links out to Google/Coursera/LinkedIn free tiers — no cert infrastructure or file generation. |
| **DB storage** | `skill_gap_analyses` and `resume_versions` store JSON blobs. Supabase free tier (500MB) is sufficient for MVP scale. `career_profiles` is one row per user. |
| **Scalability** | All new tables follow the same RLS + uuid PK pattern. Adding an `organisation_id` FK later enables multi-tenant B2B without schema changes. |
| **PDF export** | Client-side only (`html2canvas` + `jspdf` — already in dependencies). Zero server cost. |
| **Resource catalogue** | `lib/career/resources.ts` is a static in-code map (no DB table). Fast, free, no API calls. AI enriches it per-user at analysis time. |
| **Rate limits** | All new routes plug into existing `rate-limit.ts` with Redis/in-memory fallback — no changes needed to the rate limiter. |

---

## 11. Implementation Order

Recommended sprint sequence to ship incrementally without breaking existing features:

### Phase 1 — Foundation (DB + Profile)
1. Add new SQL tables to `supabase-schema.sql`
2. Run migrations in Supabase dashboard
3. Extend `types/index.ts` with `CareerProfile`, `SkillGap`, `LearningModule`, `ResumeVersion`, `Certificate` types
4. Extend `types/database.ts` with new table types
5. Build `POST /api/career/profile` + `GET /api/career/profile`
6. Build `CareerProfileForm.tsx` + `/career/profile` page
7. Add Career section to Sidebar

### Phase 2 — Skill Gap Analysis + Modules
1. Create `lib/career/prompts.ts` + `lib/career/parser.ts` + `lib/career/resources.ts`
2. Build `POST /api/career/analyse`
3. Build `SkillGapCard`, `SkillMatchScore` components
4. Build `/career/analyse` page
5. Build `GET /api/career/modules` + `PATCH /api/career/modules/[id]`
6. Build `ModuleCard`, `ModuleKanban` components
7. Build `/career/modules` + `/career/modules/[id]` pages
8. Wire module detail page to existing `/tutor` (deep link with skill context pre-filled)

### Phase 3 — Resume Builder
1. Create `lib/career/resume-builder.ts`
2. Build `POST /api/career/resume` + `GET /api/career/resume`
3. Build `ResumePreview`, `ATSScoreGauge` components
4. Build `/career/resume` page with PDF export

### Phase 4 — Career Recommendations + Career Hub
1. Build `POST /api/career/recommend`
2. Build `CareerRecommendCard` component
3. Build `/career/recommend` page
4. Build `/career` hub landing page
5. Add new achievement seeds to DB
6. Wire gamification XP events into all new API routes

### Phase 5 — Polish (Addresses existing placeholders)
1. Build out `progress/page.tsx` to include career modules progress
2. Build `achievements` page — now includes career achievements
3. Add career profile completeness % to home dashboard

---

## 12. New Environment Variables

**No new environment variables required.**

All features use:
- `GEMINI_API_KEY` — already set (all AI calls)
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set (new tables auto-accessible)
- `SUPABASE_SERVICE_ROLE_KEY` — already set (init-user pattern reused for career profile init)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — already set (rate limiting reused)

---

## Appendix A — Career Profile TypeScript Types

Add to `types/index.ts`:

```ts
export interface CareerProfile {
  id: string
  user_id: string
  full_name: string | null
  current_level: 'student' | 'fresh_grad' | 'working'
  field_of_study: string | null
  institution: string | null
  graduation_year: number | null
  target_career: string
  target_industry: string | null
  work_experience: WorkExperience[]
  skills: string[]
  certifications: string[]
  career_goals: string | null
  location: string
  created_at: string
  updated_at: string
}

export interface WorkExperience {
  company: string
  role: string
  years: number
  description: string
}

export interface SkillGap {
  skill: string
  importance: 'critical' | 'important' | 'nice'
  category: string
  estimatedHours: number
  resources: LearningResource[]
}

export interface LearningResource {
  title: string
  url: string
  type: 'video' | 'article' | 'course'
  free: boolean
}

export interface LearningModule {
  id: string
  user_id: string
  gap_analysis_id: string | null
  title: string
  skill_target: string
  description: string | null
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_hours: number
  status: 'not_started' | 'in_progress' | 'completed'
  completion_pct: number
  resources: LearningResource[]
  certificate_url: string | null
  completed_at: string | null
  created_at: string
}

export interface ResumeVersion {
  id: string
  user_id: string
  version_name: string
  target_role: string | null
  content_json: ResumeContent
  ai_feedback: string | null
  ats_score: number | null
  created_at: string
  updated_at: string
}

export interface ResumeContent {
  summary: string
  experience: { company: string; role: string; duration: string; bullets: string[] }[]
  education: { institution: string; degree: string; year: string }[]
  skills: { technical: string[]; soft: string[] }
  certifications: string[]
  projects: { name: string; description: string; url?: string }[]
  improvement_tips: string[]
}

export interface UserCertificate {
  id: string
  user_id: string
  module_id: string | null
  cert_name: string
  provider: string | null
  cert_url: string | null
  verified: boolean
  earned_at: string
}
```

---

*Last updated: March 2026 — Career Readiness Expansion v1.0*
