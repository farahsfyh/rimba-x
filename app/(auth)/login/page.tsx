'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">RimbaX</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <form className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          {/* TODO: hook up forgot password */}
          <div className="text-right -mt-2">
            <Link href="#" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* TODO: wire up Supabase Auth */}
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-5 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-600 font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
