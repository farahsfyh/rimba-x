'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
    FileText,
    Brain,
    BookOpen,
    BarChart3,
    ArrowRight,
    Clock2,
    Flame,
    Trophy,
    Sparkles,
    Upload,
    Zap,
} from 'lucide-react';

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

const quickLinks = [
    {
        label: 'Upload Resources',
        href: '/dashboard/upload',
        description: 'Add PDFs, notes and study materials',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        gradient: 'from-blue-500 to-blue-600',
    },
    {
        label: 'Tutor Room',
        href: '/dashboard/tutor',
        description: 'Ask questions and chat with your AI tutor',
        icon: Brain,
        color: 'text-primary',
        bg: 'bg-primary/5',
        gradient: 'from-primary to-accent',
    },
    {
        label: 'Notes & Exercises',
        href: '/dashboard/notes',
        description: 'Review generated notes and practice exercises',
        icon: BookOpen,
        color: 'text-accent',
        bg: 'bg-accent/5',
        gradient: 'from-accent to-cyan-500',
    },
    {
        label: 'Progress Tracker',
        href: '/dashboard/progress',
        description: 'See your study stats and achievements',
        icon: BarChart3,
        color: 'text-success',
        bg: 'bg-success/5',
        gradient: 'from-success to-emerald-500',
    },
];

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [progress, setProgress] = useState<UserProgressData | null>(null);
    const [documentsCount, setDocumentsCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            // Get user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Fetch stats
                const { data: statsData } = await supabase
                    .from('user_stats')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                if (statsData) setStats(statsData);

                // Fetch progress
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();
                if (progressData) setProgress(progressData);

                // Fetch documents count
                const { count } = await supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);
                setDocumentsCount(count || 0);
            }
        };
        fetchData();
    }, [supabase]);

    const userName =
        user?.user_metadata?.full_name ||
        user?.email?.split('@')[0] ||
        'Learner';
    const greeting = getGreeting();
    const level = progress?.level || 1;
    const xp = progress?.xp || 0;
    const streak = progress?.streak || 0;
    const xpForNext = level * 100;
    const xpProgress = Math.min((xp / xpForNext) * 100, 100);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Greeting Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-3xl font-bold text-secondary">
                    {greeting},{' '}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-accent">
                        {userName}
                    </span>{' '}
                    👋
                </h1>
                <p className="mt-2 text-muted">
                    Ready to continue your learning journey?
                </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Flame size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">{streak}</p>
                        <p className="text-xs text-muted">Day Streak</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">Lvl {level}</p>
                        <p className="text-xs text-muted">
                            {xp} / {xpForNext} XP
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
                        <Upload size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">
                            {documentsCount}
                        </p>
                        <p className="text-xs text-muted">Materials</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                        <Clock2 size={20} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-secondary">
                            {stats?.study_time || 0}
                        </p>
                        <p className="text-xs text-muted">Min Studied</p>
                    </div>
                </div>
            </motion.div>

            {/* XP Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="p-5 rounded-2xl bg-linear-to-r from-primary/5 to-accent/5 border border-primary/10"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-primary" />
                        <span className="text-sm font-semibold text-secondary">
                            Level {level} Progress
                        </span>
                    </div>
                    <span className="text-xs font-medium text-muted">
                        {xp} / {xpForNext} XP
                    </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-linear-to-r from-primary to-accent rounded-full"
                    />
                </div>
            </motion.div>

            {/* Quick Nav Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {quickLinks.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + idx * 0.08 }}
                        >
                            <Link
                                href={item.href}
                                className="group relative flex flex-col p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 shadow-sm hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Gradient top bar */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                />

                                <div
                                    className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <Icon size={24} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                                        {item.label}
                                    </h3>
                                    <p className="text-sm text-muted leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2.5 group-hover:translate-x-0">
                                    Explore <ArrowRight size={16} className="ml-1" />
                                </div>

                                <div className="absolute top-4 right-4 text-gray-50 group-hover:text-primary/5 transition-colors">
                                    <Icon size={48} />
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Start CTA (if no documents yet) */}
            {documentsCount === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="p-6 rounded-2xl bg-linear-to-r from-primary to-accent text-white text-center"
                >
                    <Zap size={32} className="mx-auto mb-3 opacity-80" />
                    <h3 className="text-xl font-bold mb-2">Get Started!</h3>
                    <p className="text-white/80 text-sm mb-4 max-w-md mx-auto">
                        Upload your first study material and let our AI tutor create a
                        personalized learning experience for you.
                    </p>
                    <Link
                        href="/dashboard/upload"
                        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                    >
                        <Upload size={18} />
                        Upload Your First File
                    </Link>
                </motion.div>
            )}
        </div>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}
