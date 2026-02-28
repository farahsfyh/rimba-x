'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully!')
        router.push('/login')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg shadow-primary/20">
          R
        </div>
        <h1 className="text-2xl font-bold text-secondary tracking-tight">
          Rimba<span className="text-primary">X</span>
        </h1>
        <p className="mt-1 text-sm text-text-muted">Create a new password</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-5 text-center text-sm text-text-muted">
        Remembered your password?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
