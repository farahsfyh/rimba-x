# 🎓 RimbaX AI Tutor

**Free AI-Powered Personal Tutoring for ASEAN Youth**

Transform static learning materials into real-time, human-like tutoring experiences powered by Google Gemini AI.

---

## 📖 Overview

RimbaX is a free, AI-powered personal tutoring system designed specifically for ASEAN students (university, TVET, and rural secondary schools) who lack access to expensive private tutors. Upload your study materials and get intelligent, conversational tutoring.

### 🎯 Mission
Provide personalized, accessible education to underserved students across Southeast Asia through cutting-edge AI technology.

---

## ✨ Features

- 📚 **Multi-Format Document Support** - Upload PDF, DOCX, XLSX, and TXT files
- 🤖 **AI-Powered Tutoring** - Context-aware tutoring using Google Gemini AI
- 🎤 **Voice Interaction** - Speak naturally in 5 languages (EN, MS, ID, VI, TH)
- 🎭 **3D Avatar Tutor** - Interactive Ready Player Me avatar with emotions
- 🎮 **Gamification** - XP, levels, achievements, and daily streaks
- 🔒 **Enterprise-Grade Security** - OWASP Top 10 protection

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Supabase Account ([Sign up](https://supabase.com/))
- Google Cloud Account ([Sign up](https://cloud.google.com/))
- Google AI Studio ([Sign up](https://aistudio.google.com/))

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.local.example .env.local

# 3. Add your API keys to .env.local
# (See SETUP_GUIDE.md for detailed instructions)

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup and installation guide
- **[PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md)** - Development progress checklist  
- **[PROGRESS_SUMMARY.md](./PROGRESS_SUMMARY.md)** - Current status and next steps

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 14+, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Node.js 20+ |
| Database | Supabase PostgreSQL with pgvector |
| AI | Google Gemini API (gemini-1.5-flash) |
| Voice | Google Cloud Speech APIs |
| Security | DOMPurify, rate-limit, helmet, CORS |

---

## 🏗️ Project Structure

```
rimbax-ai-tutor/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utility libraries
│   ├── ai/             # Gemini AI, RAG, embeddings
│   ├── security/       # Validation, sanitization
│   ├── parsers/        # Document parsers
│   └── gamification/   # XP, levels, achievements
├── types/              # TypeScript types
└── public/             # Static assets
```

---

## 🔐 Security

- ✅ Input Validation & Sanitization
- ✅ SQL Injection Prevention
- ✅ XSS Protection (CSP headers)
- ✅ API Rate Limiting
- ✅ File Upload Validation
- ✅ Row Level Security (Supabase)
- ✅ Session Management (30-min timeout)

### ⚠️ Known Issues
- **xlsx vulnerability** (High) - Monitoring for updates

---

## 🎯 Development Status

### ✅ Complete
- Project setup and dependencies
- Security utilities
- AI integration (Gemini, RAG)
- Document parsers
- Gamification system
- Landing page

### 🔄 In Progress
- Environment configuration
- Authentication pages
- File upload system
- Chat interface

### 📝 Planned
- Voice interaction
- 3D avatar
- Progress dashboard
- Deployment

See [PROJECT_CHECKLIST.md](./PROJECT_CHECKLIST.md) for detailed progress.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ for ASEAN Youth

- Google Gemini - AI capabilities
- Supabase - Backend infrastructure
- Ready Player Me - 3D avatars

---

**For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**
