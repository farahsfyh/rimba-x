-- ============================================================
-- RimbaX AI Tutor - Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Enable pgvector extension (required for embeddings/RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- User progress (XP, level, streak)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  level INTEGER DEFAULT 1 NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats (session counts, study time)
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_sessions INTEGER DEFAULT 0 NOT NULL,
  total_questions INTEGER DEFAULT 0 NOT NULL,
  topics_completed INTEGER DEFAULT 0 NOT NULL,
  study_time INTEGER DEFAULT 0 NOT NULL, -- in minutes
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (uploaded study materials)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  title TEXT,
  subject TEXT,
  language TEXT DEFAULT 'en',
  processed BOOLEAN DEFAULT FALSE,
  parsed_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document embeddings (for RAG vector search)
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(3072), -- gemini-embedding-001 outputs 3072 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutoring sessions
CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0
);

-- Achievements definitions
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  icon TEXT
);

-- User achievements (unlocked)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- 3. INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_user_id ON document_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_user_id ON tutoring_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================
-- 4. VECTOR SIMILARITY SEARCH FUNCTION (for RAG)
-- ============================================================
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE
    document_embeddings.user_id = match_documents.user_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- user_progress: users can only see/edit their own
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- user_stats: users can only see/edit their own
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- documents: users can only access their own
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- document_embeddings: users can only access their own
CREATE POLICY "Users can view own embeddings" ON document_embeddings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own embeddings" ON document_embeddings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own embeddings" ON document_embeddings FOR DELETE USING (auth.uid() = user_id);

-- tutoring_sessions: users can only access their own
CREATE POLICY "Users can view own sessions" ON tutoring_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON tutoring_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON tutoring_sessions FOR UPDATE USING (auth.uid() = user_id);

-- achievements: anyone can read (public definitions)
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);

-- user_achievements: users can only see their own
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. SEED DEFAULT ACHIEVEMENTS
-- ============================================================
INSERT INTO achievements (key, title, description, xp_reward, icon) VALUES
  ('first_login',       'Welcome to RimbaX!',    'Log in for the first time',               10,  '👋'),
  ('first_upload',      'Knowledge Seeker',       'Upload your first study material',         25,  '📚'),
  ('first_question',    'Curious Mind',           'Ask your first question to the AI tutor',  10,  '🤔'),
  ('streak_3',          '3-Day Streak',           'Study 3 days in a row',                    50,  '🔥'),
  ('streak_7',          'Week Warrior',           'Study 7 days in a row',                   100,  '⚡'),
  ('streak_30',         'Dedicated Learner',      'Study 30 days in a row',                  300,  '🏆'),
  ('level_5',           'Level 5 Reached',        'Reach level 5',                            50,  '⭐'),
  ('level_10',          'Level 10 Reached',       'Reach level 10',                          100,  '🌟'),
  ('questions_10',      'Questioner',             'Ask 10 questions',                         30,  '💬'),
  ('questions_50',      'Knowledge Hunter',       'Ask 50 questions',                        100,  '🎯'),
  ('upload_5',          'Resource Collector',     'Upload 5 study materials',                 75,  '📂'),
  ('complete_topic',    'Topic Master',           'Complete your first topic',               100,  '✅')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- DONE! Your database is ready.
-- Next steps:
--   1. Go to Storage → New bucket → name: "documents" → Private

-- ============================================================
-- MIGRATION: Run this if you already ran the schema above
-- (adds columns that were added in a later version)
-- ============================================================
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE;

-- ============================================================
-- MIGRATION: Switch embedding model to gemini-embedding-001 (3072 dims)
-- Run this if you already created the document_embeddings table with vector(768)
-- ============================================================
-- Step 1: Clear existing embeddings (they were generated with wrong model anyway)
TRUNCATE TABLE document_embeddings;
-- Step 2: Change the column type from 768 to 3072
ALTER TABLE document_embeddings ALTER COLUMN embedding TYPE vector(3072);
-- Step 3: Recreate the search function with correct dimension
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(3072),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    document_embeddings.id,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE
    document_embeddings.user_id = match_documents.user_id
    AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;
--   2. Add this storage policy in Storage → Policies:
--      Allow authenticated users to upload to their own folder
-- ============================================================

-- ============================================================
-- CAREER READINESS EXPANSION (March 2026)
-- Run these statements in Supabase SQL Editor
-- ============================================================

-- 1. Career Profile
CREATE TABLE IF NOT EXISTS career_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name       TEXT,
  current_level   TEXT NOT NULL DEFAULT 'student',
  field_of_study  TEXT,
  institution     TEXT,
  graduation_year INT,
  target_career   TEXT NOT NULL DEFAULT '',
  target_industry TEXT,
  work_experience JSONB NOT NULL DEFAULT '[]',
  skills          TEXT[] NOT NULL DEFAULT '{}',
  certifications  TEXT[] NOT NULL DEFAULT '{}',
  career_goals    TEXT,
  location        TEXT NOT NULL DEFAULT 'Malaysia',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own career profile"
  ON career_profiles FOR ALL USING (auth.uid() = user_id);

-- 2. Skill Gap Analyses
CREATE TABLE IF NOT EXISTS skill_gap_analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_career   TEXT NOT NULL,
  required_skills JSONB NOT NULL DEFAULT '[]',
  current_skills  TEXT[] NOT NULL DEFAULT '{}',
  gap_skills      JSONB NOT NULL DEFAULT '[]',
  match_score     INT NOT NULL DEFAULT 0,
  ai_summary      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE skill_gap_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gap analyses"
  ON skill_gap_analyses FOR ALL USING (auth.uid() = user_id);

-- 3. Learning Modules
CREATE TABLE IF NOT EXISTS learning_modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gap_analysis_id UUID REFERENCES skill_gap_analyses(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  skill_target    TEXT NOT NULL,
  description     TEXT,
  difficulty      TEXT NOT NULL DEFAULT 'beginner',
  estimated_hours INT NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'not_started',
  completion_pct  INT NOT NULL DEFAULT 0,
  resources       JSONB NOT NULL DEFAULT '[]',
  certificate_url TEXT,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own modules"
  ON learning_modules FOR ALL USING (auth.uid() = user_id);

-- 4. Resume Versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  version_name    TEXT NOT NULL DEFAULT 'Resume v1',
  target_role     TEXT,
  content_json    JSONB NOT NULL DEFAULT '{}',
  ai_feedback     TEXT,
  ats_score       INT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own resumes"
  ON resume_versions FOR ALL USING (auth.uid() = user_id);

-- 5. User Certificates
CREATE TABLE IF NOT EXISTS user_certificates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_id   UUID REFERENCES learning_modules(id) ON DELETE SET NULL,
  cert_name   TEXT NOT NULL,
  provider    TEXT,
  cert_url    TEXT,
  verified    BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own certificates"
  ON user_certificates FOR ALL USING (auth.uid() = user_id);

-- 6. Career Achievement Seeds
INSERT INTO achievements (key, title, description, xp_reward, icon) VALUES
  ('career_profile_complete', 'Career Ready',         'Completed your career profile',            50,  '💼'),
  ('first_gap_analysis',      'Know Your Gaps',       'Ran your first skill gap analysis',        75,  '🔍'),
  ('first_module_complete',   'Skill Unlocked',       'Completed your first learning module',    150,  '🎓'),
  ('resume_generated',        'Resume Ready',         'Generated your first AI resume',          100,  '📄'),
  ('all_critical_gaps_closed','Job Ready',            'Closed all critical skill gaps',          500,  '🚀')
ON CONFLICT (key) DO NOTHING;
