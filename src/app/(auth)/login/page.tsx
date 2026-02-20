'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Incorrect email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else if (profile?.role === 'transporter') {
      router.push('/dashboard/transporter')
    } else {
      router.push('/dashboard/client')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" src="/hero_login.mp4" />
        <div className="absolute inset-0 bg-blue-950/50" />
        <div className="relative z-10 flex items-center gap-3">
          <Image src="/logo.png" alt="FreightEx Europe" width={40} height={40} className="rounded-lg" />
          <span className="text-xl font-bold text-white">FreightEx Europe</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight">
            European Container<br />Freight Exchange
          </h1>
          <p className="mt-4 text-blue-200 text-lg">
            Connecting transporters with clients across Europe. Fast, secure and efficient.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: '1,800+', label: 'Active users' },
              { value: '25+', label: 'Countries covered' },
              { value: '10,000+', label: 'Completed shipments' },
            ].map(s => (
              <div key={s.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-blue-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-blue-300 text-sm">© 2026 FreightEx Europe. Toate drepturile rezervate.</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Image src="/logo.png" alt="FreightEx Europe" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-gray-900">FreightEx Europe</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-1 text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@companie.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
