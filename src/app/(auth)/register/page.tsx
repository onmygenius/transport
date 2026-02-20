'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Truck, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserRole = 'transporter' | 'client'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole>('client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
          company_name: companyName,
          phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email!</h2>
          <p className="mt-2 text-gray-500">
            We sent a confirmation link to <span className="font-medium text-gray-900">{email}</span>.
            Click the link to activate your account.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FreightEx Europe</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Join the European<br />freight network
          </h1>
          <p className="mt-4 text-blue-200 text-lg">
            Create your free account and start posting or finding shipments across Europe.
          </p>
          <div className="mt-8 space-y-3">
            {[
              'Access to thousands of available shipments',
              'Direct payment between parties (no middleman)',
              'Direct chat with partners',
              'Pan-European route coverage (25+ countries)',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-blue-300 shrink-0" />
                <span className="text-blue-100">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm">© 2026 FreightEx Europe. Toate drepturile rezervate.</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FreightEx Europe</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create new account</h2>
            <p className="mt-1 text-gray-500">Free registration — 14-day trial included</p>
          </div>

          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setRole('client')}
              className={cn(
                'flex-1 rounded-xl border-2 p-4 text-left transition-all',
                role === 'client'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <p className={cn('font-semibold text-sm', role === 'client' ? 'text-blue-700' : 'text-gray-700')}>
                Client / Shipper
              </p>
              <p className="text-xs text-gray-500 mt-0.5">I post transport requests</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('transporter')}
              className={cn(
                'flex-1 rounded-xl border-2 p-4 text-left transition-all',
                role === 'transporter'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              <p className={cn('font-semibold text-sm', role === 'transporter' ? 'text-blue-700' : 'text-gray-700')}>
                Transporter
              </p>
              <p className="text-xs text-gray-500 mt-0.5">I offer transport services</p>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Contact person</Label>
                <Input
                  id="fullName"
                  placeholder="Ion Popescu"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+40 700 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                id="companyName"
                placeholder="Trans Cargo Ltd"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="office@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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

            <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              By registering, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create free account'
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
