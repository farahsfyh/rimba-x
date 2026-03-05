'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
    FileText,
    Brain,
    BookOpen,
    BarChart3,
    Clock,
    Flame,
    Trophy,
    Sparkles,
    Upload,
    Play,
    CheckCircle2,
    CircleDashed,
    Compass,
    ChevronRight,
    MessageCircle,
    Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const motivationalMessages = [
    "Every day is a chance to learn something new.",
    "Small steps every day lead to big results.",
    "Your future self will thank you for studying today.",
    "Consistency is the key to mastery.",
    "Believe you can and you're halfway there.",
];

const mockDailyTasks = [
    { id: '1', text: "Complete 1 Tutor Session", completed: false },
    { id: '2', text: "Review Notes for 15 minutes", completed: true },
    { id: '3', text: "Upload a new study material", completed: false },
];

interface UserStatsData {
    total_sessions: number;
    total_questions: number;
    topics_completed: number;
    study_time: number;
}

interface UserProgressData {
    level: number;
    xp: number;
    streak: number;
}

// -------------------------------------------------------------
// SUBCOMPONENTS
// -------------------------------------------------------------

function HeroGreeting({ userName, greeting, motivationalMessage }: any) {
    const router = useRouter();
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative overflow-hidden gradient-hero rounded-xl p-4 md:p-5"
        >
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute bottom-4 right-8 w-16 h-16 bg-violet-400/20 rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                        {greeting}, <span className="text-amber-300">{userName}</span> 👋
                    </h1>
                    <p className="text-white/80 text-sm">
                        {motivationalMessage || "Every day is a chance to learn something new."}
                    </p>
                </div>

                <motion.button
                    onClick={() => router.push('/dashboard/tutor')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex shrink-0 items-center gap-1.5 bg-white text-indigo-700 text-sm font-semibold px-4 py-2 rounded-lg glow-button hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
                >
                    <Play className="w-4 h-4 fill-indigo-700" />
                    Resume Learning
                </motion.button>
            </div>
        </motion.section>
    );
}

function XPProgress({ currentXP = 0, maxXP = 100, level = 1 }: any) {
    const progressPercent = Math.min((currentXP / maxXP) * 100, 100);
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-800">
                        Level {level} Progress
                    </span>
                </div>
                <span className="text-sm font-medium text-gray-500">
                    {currentXP} / {maxXP} XP
                </span>
            </div>

            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className="h-full gradient-xp-bar rounded-full glow-xp"
                    style={{ minWidth: progressPercent > 0 ? '8px' : '0' }}
                />
            </div>
        </motion.section>
    );
}

function StatsGrid({ streak, level, xp, documentsCount, studyTime }: any) {
    const stats = [
        {
            icon: <Flame className="w-4 h-4 text-orange-500" />,
            value: 14,
            label: 'Day Streak',
            accentColor: 'bg-orange-100',
        },
        {
            icon: <Trophy className="w-4 h-4 text-cyan-500" />,
            value: `Lvl ${level || 1}`,
            label: `2,450 XP Earned`,
            accentColor: 'bg-cyan-100',
        },
        {
            icon: <Upload className="w-4 h-4 text-emerald-500" />,
            value: documentsCount || 0,
            label: 'Materials',
            accentColor: 'bg-emerald-100',
        },
        {
            icon: <Clock className="w-4 h-4 text-violet-500" />,
            value: 128,
            label: 'Min Studied',
            accentColor: 'bg-violet-100',
        },
    ];

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col w-full relative h-full"
        >
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-600 border border-gray-100">
                    <BarChart3 size={16} />
                </div>
                <div>
                    <h3 className="text-lg font-bold tracking-wide text-gray-900">Your Stats</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Performance Overview</p>
                </div>
            </div>

            <div className="flex flex-col flex-1 pb-1 justify-center gap-2">
                {stats.map((stat, index) => (
                    <div key={stat.label} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-default group">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md ${stat.accentColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">{stat.label}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 leading-none">{stat.value}</div>
                    </div>
                ))}
            </div>
        </motion.section>
    );
}


function DailyTasks({ savedRoadmap }: any) {
    const [tasks, setTasks] = useState(mockDailyTasks);

    const toggleTask = (id: string) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    };

    if (savedRoadmap) {
        return (
            <motion.section
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                    <Compass size={120} className="text-gray-900" />
                </div>
                <div className="flex items-center gap-3 mb-6 relative z-10 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-200">
                        <Compass size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-wide">Learning Path</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1">Your Roadmap</p>
                    </div>
                </div>

                <div className="space-y-0 relative flex-1 overflow-y-auto pr-2 z-10 styled-scrollbar min-h-0">
                    {savedRoadmap.modules?.flatMap((m: any) => m.courses).slice(0, 4).map((course: any, i: number, arr: any[]) => (
                        <div key={i} className="flex gap-4 relative group mb-4">
                            {i < arr.length - 1 && (
                                <div className="absolute left-[11px] top-6 bottom-[-20px] w-[2px] bg-gray-200" />
                            )}
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-600 font-bold text-[10px] shrink-0 z-10 group-hover:bg-gray-50 transition-colors">
                                    {i + 1}
                                </div>
                            </div>
                            <div className="pb-2 flex-1">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">{course.difficulty}</span>
                                <h4 className="text-xs font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{course.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">{course.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="shrink-0">
                    <Link href="/dashboard/learning-path" className="mt-4 pt-4 border-t border-gray-100 text-[11px] text-center text-indigo-600 hover:text-indigo-700 transition-colors block font-medium w-full">
                        Generate a new path →
                    </Link>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .styled-scrollbar::-webkit-scrollbar { width: 4px; }
                    .styled-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .styled-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
                    .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                `}} />
            </motion.section>
        );
    }

    const completedCount = tasks.filter((t) => t.completed).length;

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col"
        >
            <div className="flex items-center justify-between mb-5 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">Daily Tasks</h2>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                    {completedCount}/{tasks.length}
                </span>
            </div>

            <ul className="space-y-3 mb-5 flex-1 overflow-y-auto" role="list">
                {tasks.map((task, index) => (
                    <motion.li
                        key={task.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            className="flex items-center gap-3 w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
                            aria-label={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.text}`}
                        >
                            {task.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <CircleDashed
                                    className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-gray-400 transition-colors"
                                />
                            )}
                            <span
                                className={`text-sm transition-colors ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'}`}
                            >
                                {task.text}
                            </span>
                        </button>
                    </motion.li>
                ))}
            </ul>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 shrink-0">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600 font-medium">
                    Complete tasks to earn extra XP!
                </span>
            </div>
        </motion.section>
    );
}

// -------------------------------------------------------------
// MAIN DASHBOARD PAGE
// -------------------------------------------------------------

function ActiveModules({ modules }: { modules: any[] }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col w-full relative h-full"
        >
            <div className="flex flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <Target size={16} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-wide text-gray-900">Active Modules</h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">In Progress</p>
                    </div>
                </div>
                <Link href="/dashboard/learning-path" className="shrink-0 text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 transition-all px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm active:scale-95 text-center">
                    View
                </Link>
            </div>

            <div className="flex flex-col gap-3">
                {!modules || modules.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No active modules yet.
                    </div>
                ) : (
                    modules.slice(0, 3).map((mod: any, i: number) => (
                        <div key={i} className="flex flex-col p-4 rounded-lg bg-white border border-gray-100 hover:border-indigo-300 transition-all cursor-pointer group hover:shadow-sm hover:-translate-y-0.5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{mod.difficulty}</span>
                                <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                                    <Clock size={12} /> {mod.estimated_time}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{mod.course_title}</h4>
                            <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-indigo-600 text-[11px] font-bold uppercase tracking-wider inline-flex gap-1 items-center">
                                <span>Resume</span>
                                <span className="group-hover:translate-x-1 transition-transform text-indigo-500"><Play size={12} className="fill-indigo-500" /></span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.section>
    )
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [progress, setProgress] = useState<UserProgressData | null>(null);
    const [documentsCount, setDocumentsCount] = useState(0);
    const [motivationalMessage, setMotivationalMessage] = useState("");
    const [savedRoadmap, setSavedRoadmap] = useState<any | null>(null);
    const [activeModules, setActiveModules] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        setMotivationalMessage(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('rimbax_roadmap');
        if (stored) {
            try {
                setSavedRoadmap(JSON.parse(stored));
            } catch (e) { }
        }
    }, []);

    // Fetch stats and active modules
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: statsData } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
                if (statsData) setStats(statsData);

                const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
                if (progressData) setProgress(progressData);

                const { count } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
                setDocumentsCount(count || 0);

                // Fetch active modules from newly created module_learning table
                const { data: learningData } = await supabase.from('module_learning').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
                if (learningData) setActiveModules(learningData);
            }
        };
        fetchData();
    }, [supabase]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student";
    const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

    // Level calc logic
    const level = progress?.level || 1;
    const xp = progress?.xp || 0;
    const xpForNext = level * 100;

    return (
        <main className="min-h-[calc(100vh-80px)] w-full pt-2 pb-6 px-4 md:pt-4 md:pb-10 md:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Hero Greeting Banner */}
                <HeroGreeting
                    userName={userName}
                    greeting={greeting}
                    motivationalMessage={motivationalMessage}
                />

                {/* XP Progress */}
                <XPProgress currentXP={xp} maxXP={xpForNext} level={level} />

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Stats & Actions */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <StatsGrid
                                streak={progress?.streak}
                                level={level}
                                xp={xp}
                                documentsCount={documentsCount}
                                studyTime={stats?.study_time}
                            />
                            <ActiveModules modules={activeModules} />
                        </div>
                    </div>

                    {/* Right Column: Daily Tasks / Roadmap */}
                    <div className="xl:col-span-1 flex flex-col gap-6">
                        <DailyTasks savedRoadmap={savedRoadmap} />
                    </div>
                </div>
            </div>
        </main>
    );
}
