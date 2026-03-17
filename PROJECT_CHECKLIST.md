# RimbaX AI Tutor - Development Checklist

## 📋 Overview
This checklist tracks the development progress of RimbaX AI Tutor, a free AI-powered personal tutoring system for ASEAN youth.

---

## 🎯 Phase 1: Foundation (Week 1-2)

### Project Setup
- [x] Initialize Next.js 14+ with TypeScript and App Router
- [x] Configure Tailwind CSS with custom design tokens
- [x] Setup ESLint with security plugins
- [x] Configure Prettier for code formatting
- [x] Create folder structure following best practices
- [x] Setup Git repository and .gitignore

### Environment Configuration
- [x] Create `.env.local` file
- [x] Add Supabase credentials (URL, anon key, service role key)
- [ ] Configure Google Cloud credentials for Speech APIs
- [x] Add Gemini API key
- [x] Setup environment variable validation

### Supabase Setup
- [x] Create Supabase project
- [x] Deploy database schema (users, progress, documents, embeddings)
- [x] Configure Row Level Security (RLS) policies
- [x] Setup storage buckets for user files (documents bucket, authenticated policies)
- [x] Create vector similarity search function
- [x] Enable pgvector extension

### Authentication
- [x] Implement Supabase Auth client setup
- [x] Create login page with email/password
- [x] Create signup page with validation
- [x] Add session management
- [x] Implement protected routes
- [x] Add logout functionality
- [x] Setup session timeout (30 min)

### Basic UI Shell
- [x] Create landing page
- [x] Design navigation/header component
- [x] Build dashboard layout
- [x] Add loading states (skeleton screens)
- [x] Create error boundary components
- [x] Implement toast notifications

---

## 🔧 Phase 2: Core Features (Week 3-4)

### File Upload & Processing
- [x] Create file upload interface with drag-and-drop
- [x] Implement file validation (type, size, magic numbers)
- [x] Setup Supabase Storage integration
- [x] Build PDF parser (using pdf-parse)
- [x] Build DOCX parser (using mammoth)
- [x] Build XLSX parser (using xlsx)
- [x] Build TXT parser
- [x] Implement text chunking algorithm
- [ ] Add malware scanning (ClamScan)
- [x] Create document management UI
- [x] Server-side parse API route (/api/parse)
- [x] Full upload pipeline: storage → parse → DB → embeddings (/api/upload)
- [x] Document list + delete API (/api/documents)
- [x] File persistence across page refreshes (Supabase DB + Storage)

### RAG System
- [x] Setup Gemini API client
- [x] Implement embedding generation function
- [x] Create vector storage in Supabase
- [x] Build similarity search function
- [x] Test vector retrieval accuracy
- [x] Implement context assembly for prompts
- [x] Wire RAG into tutor chat (live context from user documents)

### AI Tutoring
- [x] Create chat interface component
- [x] Implement Gemini chat integration
- [x] Build conversation history management
- [x] Add context-aware response generation
- [x] Create system prompt for tutor personality
- [x] Implement streaming responses
- [x] Add typing indicators
- [ ] Build message threading

### Progress Tracking
- [x] Create user_progress table
- [x] Create user_stats table
- [x] Implement XP calculation system
- [x] Build level progression logic
- [x] Create progress dashboard UI
- [x] Add data visualization components

---

## 🎤 Phase 3: Voice & Avatar (Week 5-6)

### Google Speech-to-Text
- [ ] Setup Google Cloud project
- [ ] Enable Speech-to-Text API
- [ ] Create service account credentials
- [ ] Implement audio recording in browser
- [ ] Build transcription API route
- [ ] Add real-time streaming transcription
- [ ] Support multiple languages (EN, MS, ID, VI, TH)
- [ ] Handle audio format conversion
> Note: @google-cloud/speech package is installed, implementation pending.

### Google Text-to-Speech
- [ ] Enable Text-to-Speech API
- [ ] Implement speech synthesis function
- [ ] Select appropriate voice models per language
- [ ] Build audio playback controls
- [ ] Add voice customization options
- [ ] Implement audio caching
> Note: @google-cloud/text-to-speech package is installed, implementation pending.

### 3D Avatar (Ready Player Me)
- [x] Setup Three.js and React Three Fiber
- [ ] Integrate Ready Player Me SDK
- [ ] Create avatar display component
- [ ] Implement avatar loading states
- [ ] Add emotion system (neutral, happy, thinking, confused)
- [ ] Build lip-sync animation
- [ ] Optimize 3D performance
- [ ] Add mobile fallback (text-only mode)

### Voice Session Integration
- [ ] Create unified voice session component
- [ ] Sync avatar with voice output
- [ ] Implement push-to-talk controls
- [ ] Add voice activity detection
- [ ] Build session controls (pause, resume, stop)

---

## 🎮 Phase 4: Gamification (Week 7-8)

### XP & Leveling System
- [x] Define XP reward values for actions
- [x] Implement level calculation formula
- [ ] Create XP gain animations
- [ ] Build level-up celebrations
- [x] Design progress ring component

### Achievements
- [x] Create achievements table
- [x] Define achievement criteria
- [x] Implement achievement checker logic
- [ ] Build achievement unlock animations
- [ ] Create achievement display UI
- [ ] Add achievement notifications

### Streak System
- [x] Implement daily streak tracking
- [x] Create streak increment logic
- [x] Build streak reset on missed days
- [ ] Design streak indicator UI
- [ ] Add streak milestones

### Statistics Dashboard
- [x] Display total sessions count
- [x] Show total questions asked
- [x] Track topics completed
- [x] Calculate total study time
- [x] Create visual charts (using recharts or similar)

---

## 🔐 Phase 5: Security Hardening (Week 9-10)

### Input Validation & Sanitization
- [x] Install DOMPurify for HTML sanitization
- [x] Implement input validation functions
- [x] Add file signature verification
- [ ] Validate all user inputs server-side
- [ ] Test injection attack prevention

### Rate Limiting
- [x] Install express-rate-limit
- [x] Configure API rate limits (100 req/15min)
- [x] Set strict auth limits (5 req/15min)
- [x] Add rate limit headers
- [ ] Test rate limiting

### Security Headers
- [ ] Configure Content Security Policy
- [ ] Add X-Frame-Options header
- [ ] Set X-Content-Type-Options
- [ ] Configure Referrer-Policy
- [ ] Set Permissions-Policy
- [ ] Test headers with security scanner

### Authentication Security
- [ ] Implement PKCE flow
- [ ] Add session timeout middleware
- [ ] Enable auto token refresh
- [ ] Test session expiration
- [ ] Add brute force protection

### CORS Configuration
- [ ] Install and configure CORS middleware
- [ ] Set production domain whitelist
- [ ] Enable credentials
- [ ] Test cross-origin requests

### Error Handling
- [ ] Implement generic error responses
- [ ] Remove stack traces from production
- [ ] Add error logging (without PII)
- [ ] Create custom error classes
- [ ] Test error scenarios

### Dependency Security
- [ ] Run npm audit
- [ ] Fix high/critical vulnerabilities
- [ ] Setup Dependabot or Snyk
- [ ] Create security scan workflow
- [ ] Document security practices

---

## 🎨 Phase 6: Polish & Optimization (Week 9-10)

### Performance Optimization
- [ ] Implement code splitting
- [ ] Add lazy loading for components
- [ ] Optimize images (Next.js Image component)
- [ ] Enable response caching
- [ ] Minimize bundle sizes
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Optimize database queries
- [ ] Add database indexes

### Accessibility (WCAG 2.1 AA)
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios
- [ ] Add focus indicators
- [ ] Test with screen reader
- [ ] Implement skip links
- [ ] Add alt text to images

### Mobile Responsiveness
- [ ] Test on mobile devices (sm breakpoint)
- [ ] Test on tablets (md/lg breakpoints)
- [ ] Optimize touch targets (min 44x44px)
- [ ] Test landscape orientation
- [ ] Verify avatar performance on mobile

### UX Improvements
- [ ] Add loading states to all async actions
- [ ] Create empty states for all lists
- [ ] Improve error messages
- [ ] Add confirmation dialogs
- [ ] Implement undo actions where applicable
- [ ] Add helpful tooltips

---

## 🚀 Phase 7: Testing & Launch (Week 11-12)

### Testing
- [ ] Write unit tests for utilities
- [ ] Test API routes
- [ ] Test authentication flows
- [ ] Test file upload process
- [ ] Test RAG system accuracy
- [ ] Conduct user acceptance testing
- [ ] Fix identified bugs

### Documentation
- [ ] Complete README.md
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Write developer documentation
- [ ] Document environment setup

### Deployment
- [x] Choose hosting platform (Vercel/Netlify)
- [x] Configure production environment variables
- [ ] Setup CI/CD pipeline
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Test production deployment

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Configure analytics (privacy-focused)
- [ ] Monitor API usage
- [ ] Track performance metrics
- [ ] Setup uptime monitoring

### Launch Preparation
- [ ] Create marketing materials
- [ ] Prepare demo video
- [ ] Write launch announcement
- [ ] Setup support channels
- [ ] Create feedback collection system

---

## 📊 Post-Launch

### Continuous Improvement
- [ ] Monitor user engagement metrics
- [ ] Collect user feedback
- [ ] Analyze feature usage
- [ ] Plan A/B tests
- [ ] Prioritize feature requests
- [ ] Regular security audits
- [ ] Update dependencies monthly

---

## ✅ Pre-Launch Security Checklist

- [ ] All user inputs sanitized
- [ ] SQL injection protection verified
- [ ] XSS prevention implemented
- [ ] CSRF tokens in place
- [ ] Rate limiting active
- [ ] File upload validation complete
- [ ] Malware scanning enabled
- [ ] Environment variables secured
- [ ] Security headers configured
- [ ] RLS policies tested
- [ ] Dependency vulnerabilities checked
- [ ] Error messages sanitized

---

---

## 💼 Phase 8: Career Readiness Expansion (March 2026)

### Database & Types
- [x] Add `career_profiles` table with RLS
- [x] Add `skill_gap_analyses` table with RLS
- [x] Add `learning_modules` table with RLS
- [x] Add `resume_versions` table with RLS
- [x] Add `user_certificates` table with RLS
- [x] Extend `types/index.ts` with all career types
- [x] Extend `types/database.ts` with new table types
- [x] Add career achievement seeds to DB schema

### Career lib/ Modules
- [x] `lib/career/prompts.ts` — Gemini prompt templates (skill gap, resume, recommend)
- [x] `lib/career/parser.ts` — Safe JSON parser for AI career responses
- [x] `lib/career/resources.ts` — Static curated free learning resource catalogue

### Career API Routes
- [x] `POST /api/career/profile` — Create/update career profile
- [x] `GET /api/career/profile` — Fetch career profile
- [x] `POST /api/career/analyse` — AI skill gap analysis + module generation
- [x] `GET /api/career/modules` — List learning modules (filterable by status)
- [x] `PATCH /api/career/modules/[id]` — Update module progress/status
- [x] `POST /api/career/resume` — Generate AI resume
- [x] `GET /api/career/resume` — List resume versions
- [x] `POST /api/career/recommend` — Career path recommendations

### Career Components
- [x] `components/career/CareerProfileForm.tsx` — Multi-step profile wizard
- [x] `components/career/SkillTagInput.tsx` — Tag-based skill input
- [x] `components/career/SkillGapCard.tsx` — Single skill gap with resources
- [x] `components/career/SkillMatchScore.tsx` — Match score ring
- [x] `components/career/ModuleCard.tsx` — Learning module card
- [x] `components/career/ResumePreview.tsx` — Styled resume render
- [x] `components/career/ATSScoreGauge.tsx` — ATS score gauge
- [x] `components/career/CareerRecommendCard.tsx` — Career recommendation card
- [x] `components/career/CertificateBadge.tsx` — Certificate display tile

### Career Pages
- [x] `/career` — Career Hub landing
- [x] `/career/profile` — Career Profile multi-step form
- [x] `/career/analyse` — Skill Gap Analysis results
- [x] `/career/modules` — Learning Modules list
- [x] `/career/resume` — AI Resume Builder + PDF export

### Navigation & Integration
- [x] Add Career section to Sidebar
- [x] Wire gamification XP to all career API events
- [x] Add career achievement seeds

---

## 🎯 Current Status

**Phase:** 8 - Career Readiness Expansion (complete)
**Completed:** ~92%

Last Updated: March 18, 2026
