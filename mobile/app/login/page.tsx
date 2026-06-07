'use client'

import { useState, Suspense } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { signInEmail, signUpEmail } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type Mode = 'login' | 'register'

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setUser, registerUser } = useAuthStore()

    const [mode, setMode] = useState<Mode>(() =>
        searchParams.get('mode') === 'register' ? 'register' : 'login'
    )
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            if (mode === 'login') {
                const { user } = await signInEmail(email, password)
                setUser(user)
                await registerUser(user)
            } else {
                const { user } = await signUpEmail(email, password)
                // Update display name via Firebase profile (optional, handled server side)
                setUser(user)
                await registerUser({ ...user, displayName: displayName || null } as any)
            }
            router.push('/')
        } catch (err: any) {
            const code = err?.code || ''
            if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setError('Incorrect email or password.')
            } else if (code === 'auth/email-already-in-use') {
                setError('An account with this email already exists.')
            } else if (code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.')
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppShell className="bg-canvas flex flex-col p-6 min-h-screen">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-canvas to-canvas pointer-events-none" />

            {/* Back */}
            <Link href="/welcome" className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mt-4 w-fit z-10">
                <ArrowLeft size={16} />
                <span className="font-sans text-xs tracking-widest uppercase">Back</span>
            </Link>

            <div className="flex-1 flex flex-col justify-center z-10 max-w-sm mx-auto w-full">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="font-serif text-3xl text-text-primary mb-2">
                        {mode === 'login' ? 'Welcome back.' : 'Create account.'}
                    </h1>
                    <p className="font-sans text-sm text-text-muted">
                        {mode === 'login'
                            ? 'Sign in to restore your streak and stats.'
                            : 'Join to save your progress across devices.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {mode === 'register' && (
                        <div className="space-y-1">
                            <label className="font-sans text-[10px] text-text-muted tracking-widest uppercase">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="How you'll appear on leaderboards"
                                className="w-full bg-surface border border-border-subtle rounded-sharp px-4 py-3 text-text-primary font-sans text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="font-sans text-[10px] text-text-muted tracking-widest uppercase">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                            className="w-full bg-surface border border-border-subtle rounded-sharp px-4 py-3 text-text-primary font-sans text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="font-sans text-[10px] text-text-muted tracking-widest uppercase">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                className="w-full bg-surface border border-border-subtle rounded-sharp px-4 py-3 pr-12 text-text-primary font-sans text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="font-sans text-xs text-red-400 pt-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-sans text-sm tracking-widest uppercase py-4 rounded-sharp transition-all active:scale-[0.98] mt-2"
                    >
                        {isLoading
                            ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                            : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
                        className="font-sans text-sm text-text-muted hover:text-text-primary transition-colors"
                    >
                        {mode === 'login'
                            ? "Don't have an account? Create one"
                            : 'Already have an account? Sign in'}
                    </button>
                </div>

            </div>
        </AppShell>
    )
}
