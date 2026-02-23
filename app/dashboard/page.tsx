'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import {
    FileText,
    Brain,
    BookOpen,
    BarChart3,
    ArrowRight
} from 'lucide-react';

const quickLinks = [
    {
        label: 'Upload Resources',
        href: '/dashboard/upload',
        description: 'Add PDFs, notes and study materials',
        icon: FileText,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
    },
    {
        label: 'Tutor Room',
        href: '/dashboard/tutor',
        description: 'Ask questions and chat with your AI tutor',
        icon: Brain,
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        label: 'Notes & Exercises',
        href: '/dashboard/notes',
        description: 'Review generated notes and practice exercises',
        icon: BookOpen,
        color: 'text-accent',
        bg: 'bg-accent/10'
    },
    {
        label: 'Progress Tracker',
        href: '/dashboard/progress',
        description: 'See your study stats and achievements',
        icon: BarChart3,
        color: 'text-success',
        bg: 'bg-success/10'
    },
]

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, [supabase]);

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';

    return (
        <div className="max-w-4xl mx-auto">
            {/* Greeting */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-secondary">
                    Welcome back, <span className="text-primary">{userName}</span> 👋
                </h1>
                <p className="mt-2 text-muted">Ready to continue your learning journey?</p>
            </div>

            {/* Quick nav cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {quickLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative flex flex-col p-6 rounded-2xl bg-white border border-gray-100 shadow-soft-sm hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
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

                            <div className="mt-4 flex items-center text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                Explore <ArrowRight size={16} className="ml-1" />
                            </div>

                            <div className="absolute top-4 right-4 text-gray-100 group-hover:text-primary/5 transition-colors">
                                <Icon size={48} />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}
