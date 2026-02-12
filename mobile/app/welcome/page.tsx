'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { signInAnon, signInEmail, signUpEmail } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { Sparkles, Mail, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function WelcomePage() {
    const router = useRouter()
    const { setUser, registerUser } = useAuthStore()
    const [showEmailAuth, setShowEmailAuth] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleGuestSignIn = async () => {
        try {
            setIsLoading(true)
            setError('')

            const result = await signInAnon()
            setUser(result.user)
            await registerUser(result.user)

            router.push('/')
        } catch (err: any) {
            setError('Failed to sign in as guest. Please try again.')
            console.error('Anonymous sign in failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailAuth = async () => {
        if (!email || !password) {
            setError('Please enter both email and password')
            return
        }

        try {
            setIsLoading(true)
            setError('')

            const result = isSignUp
                ? await signUpEmail(email, password)
                : await signInEmail(email, password)

            setUser(result.user)
            await registerUser(result.user)

            router.push('/')
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already in use. Try signing in instead.')
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid email or password.')
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.')
            } else {
                setError('Authentication failed. Please try again.')
            }
            console.error('Email auth failed:', err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppShell className="flex items-center justify-center">
            <div className="w-full max-w-sm space-y-8">
                {/* Welcome Header */}
                <div className="text-center space-y-4 animate-fade-in-up">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-from to-primary-to bg-clip-text text-transparent">
                            Welcome to OFTA
                        </h1>
                        <p className="text-text-muted">
                            Ready to test your celebrity age knowledge?
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-border-subtle">
                            <Sparkles size={24} className="text-primary" />
                        </div>
                    </div>
                </div>

                {/* Auth Options */}
                <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {!showEmailAuth ? (
                        <>
                            {/* Guest Sign In */}
                            <Button
                                onClick={handleGuestSignIn}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary-from to-primary-to hover:shadow-primary/20 text-white font-semibold py-3"
                            >
                                <User size={18} className="mr-2" />
                                {isLoading ? 'Signing in...' : 'Play as Guest'}
                                <ArrowRight size={18} className="ml-2" />
                            </Button>

                            {/* Email Sign In Option */}
                            <Button
                                variant="outline"
                                onClick={() => setShowEmailAuth(true)}
                                className="w-full border-border-subtle text-text-secondary hover:text-text-primary hover:border-primary/50"
                            >
                                <Mail size={18} className="mr-2" />
                                Sign in with Email
                            </Button>

                            {/* Info Card */}
                            <Card variant="glass" className="p-4 mt-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-text-muted">
                                        Playing as guest allows you to enjoy all game modes
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        Create an account to save progress and compete on leaderboards
                                    </p>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            {/* Email Auth Form */}
                            <Card variant="glass" className="p-6 space-y-4">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-semibold text-text-primary">
                                        {isSignUp ? 'Create Account' : 'Sign In'}
                                    </h3>
                                    <p className="text-sm text-text-muted">
                                        {isSignUp ? 'Join the community' : 'Welcome back'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />

                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                <Button
                                    onClick={handleEmailAuth}
                                    disabled={isLoading || !email || !password}
                                    className="w-full bg-gradient-to-r from-primary-from to-primary-to"
                                >
                                    {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                                </Button>

                                <div className="text-center space-y-2">
                                    <button
                                        onClick={() => setIsSignUp(!isSignUp)}
                                        className="text-sm text-text-muted hover:text-primary"
                                        disabled={isLoading}
                                    >
                                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                                    </button>
                                </div>
                            </Card>

                            {/* Back Button */}
                            <Button
                                variant="ghost"
                                onClick={() => setShowEmailAuth(false)}
                                disabled={isLoading}
                                className="w-full text-text-muted hover:text-text-primary"
                            >
                                ← Back to options
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Enhanced Background Effects */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-1/3 left-1/6 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/6 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>
        </AppShell>
    )
}