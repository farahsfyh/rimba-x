'use client'

<<<<<<< HEAD
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Tutor Room',
    href: '/tutor',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3v-3z" />
      </svg>
    ),
  },
  {
    label: 'Upload Resources',
    href: '/upload',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: 'Notes & Exercises',
    href: '/notes',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Progress Tracker',
    href: '/progress',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
=======
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
  LayoutDashboard,
  FileText,
  Brain,
  BookOpen,
  BarChart3,
  LogOut
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Upload Resources',
    href: '/dashboard/upload',
    icon: FileText,
  },
  {
    label: 'Tutor Room',
    href: '/dashboard/tutor',
    icon: Brain,
  },
  {
    label: 'Notes & Exercises',
    href: '/dashboard/notes',
    icon: BookOpen,
  },
  {
    label: 'Progress Tracker',
    href: '/dashboard/progress',
    icon: BarChart3,
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
  },
]

export function Sidebar() {
  const pathname = usePathname()
<<<<<<< HEAD
=======
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-5">
<<<<<<< HEAD
        <span className="text-xl font-bold text-indigo-600">RimbaX</span>
=======
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
            R
          </div>
          <span className="text-xl font-bold text-secondary tracking-tight">
            Rimba<span className="text-primary">X</span>
          </span>
        </Link>
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
<<<<<<< HEAD
          const active = pathname.startsWith(item.href)
=======
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
<<<<<<< HEAD
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className={cn(active ? 'text-indigo-600' : 'text-gray-400')}>
                {item.icon}
              </span>
=======
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} className={cn(active ? 'text-primary' : 'text-gray-400')} />
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
              {item.label}
            </Link>
          )
        })}
      </nav>

<<<<<<< HEAD
      {/* User stub — TODO: replace with real user profile once Auth is wired */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            U
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">My Account</p>
            {/* TODO: show user email from Supabase session */}
          </div>
=======
      {/* User Area */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary border border-primary/20">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.user_metadata?.full_name || 'My Account'}
              </p>
              <p className="truncate text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut size={18} />
            Sign Out
          </button>
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
        </div>
      </div>
    </aside>
  )
}
