'use client'

<<<<<<< HEAD
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Logo / Brand */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">RimbaX</h1>
        <p className="mt-1 text-sm text-gray-500">Create your account</p>
=======
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) {
        toast.error(error.message)
      } else {
        if (data.session) {
          toast.success('Account created and logged in!')
          router.push('/dashboard')
        } else {
          toast.success('Sign up successful! Please check your email for confirmation.')
          router.push('/login')
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      console.error(err)
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
        <p className="mt-1 text-sm text-text-muted">Create your account</p>
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
<<<<<<< HEAD
        <form className="flex flex-col gap-5">
          <Input
            label="Full Name"
=======
        <form className="flex flex-col gap-5" onSubmit={handleSignup}>
          <Input
            label="Full Name"
            name="fullName"
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
            type="text"
            placeholder="Your name"
            autoComplete="name"
            required
<<<<<<< HEAD
          />
          <Input
            label="Email"
=======
            value={formData.fullName}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
<<<<<<< HEAD
          />
          <Input
            label="Password"
=======
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Password"
            name="password"
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
<<<<<<< HEAD
          />
          <Input
            label="Confirm Password"
=======
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
<<<<<<< HEAD
          />

          {/* TODO: wire up Supabase Auth */}
          <Button type="submit" className="w-full">
=======
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Button type="submit" className="w-full" loading={loading}>
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
            Create Account
          </Button>
        </form>
      </div>

      {/* Footer link */}
<<<<<<< HEAD
      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
=======
      <p className="mt-5 text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
          Sign in
        </Link>
      </p>
    </div>
  )
}
<<<<<<< HEAD
=======

>>>>>>> 567f977 (set up Supabase integration and enhance primary interface)
