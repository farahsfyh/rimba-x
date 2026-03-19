'use client'

import { motion } from 'framer-motion'
import { Trophy, CheckCircle2, Lock, Award, Code, Brain, Briefcase, Sparkles } from 'lucide-react'

// Common Card styling
const SummaryCard = ({ title, value, label, icon: Icon }: { title: string, value: string, label: string, icon: any }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-violet-100 border-t-4 border-t-[#8B5CF6] relative overflow-hidden group">
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-5 transition-opacity">
      <Icon size={120} className="text-violet-800" />
    </div>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-[#8B5CF6] shrink-0 border border-violet-100/50">
         <Icon size={24} />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-xl font-black text-violet-800 leading-tight mb-1">{value}</p>
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
    </div>
  </div>
)

const SkillBadge = ({ title, completed }: { title: string, completed: boolean }) => (
  <div className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition-colors ${completed ? 'bg-violet-50/50 border-violet-100' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
    <span className={`text-xs font-semibold leading-tight ${completed ? 'text-violet-900' : 'text-gray-500'} flex-1 min-w-0`}>{title}</span>
    {completed ? (
      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded-full shrink-0"><CheckCircle2 size={12} /> Completed</span>
    ) : (
      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded-full shrink-0"><Lock size={12} /> Locked</span>
    )}
  </div>
)

export default function AchievementsDashboard() {
  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-6xl mx-auto px-6 py-6">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Your Achievements</h1>
            <p className="text-sm text-gray-500">Track your verified learning milestones and unlocked career competencies.</p>
          </div>
          <div className="px-4 py-2 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-2 shadow-sm">
            <Sparkles size={16} className="text-[#8B5CF6]" />
            <span className="text-xs font-bold text-violet-800">Next milestone: Advanced Learner (3 more to go)</span>
          </div>
        </div>

        {/* 🧠 1. TOP SUMMARY */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <motion.div variants={fadeUp}><SummaryCard title="Total Achievements" value="8 Badges Earned" label="Validated competencies" icon={Award} /></motion.div>
          <motion.div variants={fadeUp}><SummaryCard title="Skill Level" value="Intermediate Learner" label="Upgraded from Beginner" icon={Brain} /></motion.div>
          <motion.div variants={fadeUp}><SummaryCard title="Progress" value="8 / 15 Unlocked" label="15% faster than average students" icon={Trophy} /></motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* 🔥 2. FEATURED ACHIEVEMENT */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-gradient-to-br from-[#8B5CF6] to-[#1E293B] rounded-3xl p-8 !text-white relative overflow-hidden shadow-lg border border-violet-800/20">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={160} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-white/10 shrink-0">
                  🏆
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-500 !text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"><CheckCircle2 size={12} /> Completed</span>
                    <span className="bg-white/20 !text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Intermediate Level</span>
                  </div>
                  <h2 className="text-2xl font-black !text-white mb-2 tracking-tight">Computer Vision Detection Challenge</h2>
                  <p className="text-sm text-white/80/90 leading-relaxed font-medium">Successfully applied a detection workflow and interpreted model outputs in a real-world scenario.</p>
                </div>
              </div>
            </motion.div>

            {/* 📊 4. ACHIEVEMENT GRID */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Certification Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Data Preprocessing Proficiency", desc: "Can correctly prepare and transform data for model input", icon: "📊" },
                  { title: "Technical Presentation Mastery", desc: "Effectively communicate technical findings and modeling logs", icon: "💼" },
                  { title: "Concept Mastery: Vision", desc: "Thorough understanding of classification vs detection theory", icon: "🧠" },
                  { title: "Python Programming Level I", desc: "Autonomous execution of tensor operations and weights loading", icon: "🐍" }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={fadeUp} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-violet-500 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 text-2xl flex items-center justify-center shrink-0 border border-violet-100">{item.icon}</div>
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit mb-1.5"><CheckCircle2 size={10} /> Completed</span>
                        <h4 className="font-bold text-gray-950 text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-normal">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* 🧩 3. SKILL-BASED BADGES */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Competency Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Technical Skills */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-950 mb-4 pb-2 border-b"><Code size={16} className="text-[#8B5CF6]" /> Technical Skills</h4>
                  <div className="space-y-2">
                    <SkillBadge title="Python Programming" completed={true} />
                    <SkillBadge title="Data Preprocessing" completed={true} />
                    <SkillBadge title="Model Evaluation" completed={true} />
                  </div>
                </div>

                {/* AI / ML Skills */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-950 mb-4 pb-2 border-b"><Brain size={16} className="text-[#8B5CF6]" /> AI / ML Skills</h4>
                  <div className="space-y-2">
                    <SkillBadge title="Detection Workflow" completed={true} />
                    <SkillBadge title="Interpretation & Reasoning" completed={true} />
                    <SkillBadge title="Feature Understanding" completed={false} />
                  </div>
                </div>

                {/* Professional Skills */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-black text-gray-950 mb-4 pb-2 border-b"><Briefcase size={16} className="text-[#8B5CF6]" /> Professional Skills</h4>
                  <div className="space-y-2">
                    <SkillBadge title="Communication Skills" completed={true} />
                    <SkillBadge title="Problem Solving" completed={false} />
                    <SkillBadge title="Management" completed={false} />
                  </div>
                </div>

              </div>
            </div>

          </div>

          <div className="space-y-8">
            
            {/* 🎯 6. NEXT TO UNLOCK */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-black text-gray-950 flex items-center gap-2 mb-4">🔒 Next Achievements</h3>
              <div className="space-y-3">
                {[
                  { title: "Advanced Model Evaluation", desc: "Validate outputs using secondary statistical gradients." },
                  { title: "Feature Engineering Mastery", desc: "Build autonomous vectors to improve model scoring outputs." },
                  { title: "AI Engineer Readiness Badge", desc: "Final validation of complete end-to-end operational pipeline." }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 flex gap-4 items-center group hover:bg-violet-50/20 hover:border-violet-100 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200 group-hover:bg-violet-100 group-hover:text-[#8B5CF6] transition-colors"><Lock size={16} /></div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 group-hover:text-violet-900 transition-colors">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-dashed mt-2 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-[#8B5CF6] bg-violet-50 px-3 py-1.5 rounded-full flex items-center gap-1.5"><Sparkles size={12} /> Complete 2 more modules to unlock</span>
                </div>
              </div>
            </motion.div>

            {/* 🕒 5. RECENT ACHIEVEMENTS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-black text-gray-900 flex items-center gap-2 mb-4">🕒 Recently Earned</h3>
              <div className="space-y-3.5">
                {[
                  "Detection Workflow Competency",
                  "Model Evaluation Skill",
                  "Dataset Familiarisation"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-950 text-sm">{item}</p>
                      <p className="text-[10px] text-gray-400">Earned 2 hours ago</p>
                    </div>
                    <Award size={18} className="text-violet-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* 🎮 7. OPTIONAL: Career Badge */}
            <div className="bg-gradient-to-br from-[#8B5CF6] to-[#1E293B] rounded-3xl p-6 !text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10"><Award size={120} /></div>
              <h4 className="text-xs font-black uppercase tracking-widest opacity-80 !text-white mb-1">Career Badge</h4>
              <h3 className="text-xl font-black !text-white mb-1">AI Engineer (Developing)</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium opacity-90">Progress to Certification</span>
                <span className="text-xs font-black">40%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: '40%' }} />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
