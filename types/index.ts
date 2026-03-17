// ================================
// USER TYPES
// ================================

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name?: string;
  avatar_url?: string;
  language: 'en' | 'ms' | 'id' | 'vi' | 'th';
  created_at: string;
  updated_at: string;
}

// ================================
// PROGRESS & GAMIFICATION TYPES
// ================================

export interface UserProgress {
  id: string;
  user_id: string;
  level: number;
  xp: number;
  streak: number;
  last_active_date: string;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_sessions: number;
  total_questions: number;
  topics_completed: number;
  study_time: number; // in minutes
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// ================================
// DOCUMENT TYPES
// ================================

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  title?: string;
  subject?: string;
  language: string;
  processed: boolean;
  created_at: string;
}

export interface DocumentEmbedding {
  id: string;
  user_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  embedding: number[];
  created_at: string;
}

export interface ParsedDocument {
  text: string;
  metadata: {
    title?: string;
    pageCount?: number;
    format: string;
  };
}

// ================================
// TUTORING SESSION TYPES
// ================================

export interface TutoringSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration?: number; // in seconds
  message_count: number;
  topic?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface ConversationHistory {
  id: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

// ================================
// AI TYPES
// ================================

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  messageId: string;
}

export interface EmbeddingRequest {
  text: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}

// ================================
// CAREER READINESS TYPES
// ================================

export interface WorkExperience {
  company: string;
  role: string;
  years: number;
  description: string;
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course';
  free: boolean;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  current_level: 'student' | 'fresh_grad' | 'working';
  field_of_study: string | null;
  institution: string | null;
  graduation_year: number | null;
  target_career: string;
  target_industry: string | null;
  work_experience: WorkExperience[];
  skills: string[];
  certifications: string[];
  career_goals: string | null;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'important' | 'nice';
  category: string;
  estimatedHours: number;
  resources: LearningResource[];
}

export interface RequiredSkill {
  skill: string;
  importance: 'critical' | 'important' | 'nice';
  category: string;
}

export interface SkillGapAnalysis {
  id: string;
  user_id: string;
  target_career: string;
  required_skills: RequiredSkill[];
  current_skills: string[];
  gap_skills: SkillGap[];
  match_score: number;
  ai_summary: string;
  created_at: string;
}

export interface LearningModule {
  id: string;
  user_id: string;
  gap_analysis_id: string | null;
  title: string;
  skill_target: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completion_pct: number;
  resources: LearningResource[];
  certificate_url: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ResumeContent {
  summary: string;
  experience: { company: string; role: string; duration: string; bullets: string[] }[];
  education: { institution: string; degree: string; year: string }[];
  skills: { technical: string[]; soft: string[] };
  certifications: string[];
  projects: { name: string; description: string; url?: string }[];
  improvement_tips: string[];
}

export interface ResumeVersion {
  id: string;
  user_id: string;
  version_name: string;
  target_role: string | null;
  content_json: ResumeContent;
  ai_feedback: string | null;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserCertificate {
  id: string;
  user_id: string;
  module_id: string | null;
  cert_name: string;
  provider: string | null;
  cert_url: string | null;
  verified: boolean;
  earned_at: string;
}

// ================================
// VOICE TYPES
// ================================

export interface TranscriptionRequest {
  audioBuffer: Buffer;
  languageCode: 'en-US' | 'ms-MY' | 'id-ID' | 'vi-VN' | 'th-TH';
}

export interface TranscriptionResponse {
  text: string;
}

export interface SpeechSynthesisRequest {
  text: string;
  languageCode: string;
  voiceName?: string;
}

export interface SpeechSynthesisResponse {
  audioContent: Buffer;
}

// ================================
// AVATAR TYPES
// ================================

export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'confused' | 'celebrating';
export type AvatarAnimation = 'idle' | 'speaking' | 'nodding' | 'gesturing';

export interface AvatarState {
  emotion: AvatarEmotion;
  animation: AvatarAnimation;
}

export interface AvatarProps {
  avatarUrl: string;
  emotion?: AvatarEmotion;
  isSpeaking?: boolean;
}

// ================================
// API RESPONSE TYPES
// ================================

export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export interface ApiError {
  error: string;
  field?: string;
  code?: string;
}

// ================================
// COMPONENT PROP TYPES
// ================================

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface FileUploadProps {
  onUpload: (file: File) => void;
  acceptedFormats: string[];
  maxSize: number; // in bytes
  loading?: boolean;
}

// ================================
// FORM TYPES
// ================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
}

// ================================
// UTILITY TYPES
// ================================

export type LanguageCode = 'en' | 'ms' | 'id' | 'vi' | 'th';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  voiceCode: string;
}
