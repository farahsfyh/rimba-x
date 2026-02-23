<<<<<<< HEAD
import Link from 'next/link'

const quickLinks = [
  { label: 'Tutor Room', href: '/tutor', description: 'Ask questions and chat with your AI tutor' },
  { label: 'Upload Resources', href: '/upload', description: 'Add PDFs, notes and study materials' },
  { label: 'Notes & Exercises', href: '/notes', description: 'Review generated notes and practice exercises' },
  { label: 'Progress Tracker', href: '/progress', description: 'See your study stats and achievements' },
]

export default function DashboardPage() {
  return (
    <div className="max-w-3xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
        {/* TODO: personalise with user name from Supabase session */}
        <p className="mt-1 text-sm text-gray-500">What would you like to do today?</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {item.label}
            </p>
            <p className="mt-1 text-xs text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
=======
// This folder is deprecated in favor of /app/dashboard/
export default function Deprecated() {
  return null;
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
}
