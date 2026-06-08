'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/ui/Layout'
import { signInAnon } from '@/lib/firebase'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

export default function Welcome() {
    const router = useRouter()
    const { setUser, registerUser } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)

    const handleGuest = async () => {
        setIsLoading(true)
        try {
            if (process.env.NODE_ENV === 'development') {
                const devUser = {
                    uid: 'dev_user_123',
                    email: 'dev@ofta.com',
                    displayName: 'Guest',
                    emailVerified: false,
                    isAnonymous: true,
                    metadata: {},
                    providerData: [],
                    refreshToken: '',
                    tenantId: null,
                    delete: async () => {},
                    getIdToken: async () => 'DEV_TOKEN_123',
                    getIdTokenResult: async () => ({} as any),
                    reload: async () => {},
                    toJSON: () => ({}),
                    phoneNumber: null,
                    photoURL: null,
                    providerId: 'firebase',
                }
                setUser(devUser as any)
                apiClient.setToken('DEV_TOKEN_123')
                await registerUser(devUser as any)
            } else {
                const { user } = await signInAnon()
                setUser(user)
                await registerUser(user)
            }
            router.push('/')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AppShell hideLogo className="bg-canvas relative overflow-hidden flex flex-col justify-between p-8">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-canvas to-canvas pointer-events-none" />

            {/* Logo */}
            <div className="pt-12 flex justify-center">
                <img
                    src="/images/logo.png"
                    alt="One for the Ages"
                    className="h-40 w-auto opacity-80"
                />
            </div>

            {/* Headlines */}
            <div className="space-y-4 text-center z-10">
                <h2 className="font-serif text-3xl text-text-primary leading-tight">
                    Everyone's an expert...
                </h2>
                <h2 className="font-serif text-3xl text-text-primary leading-tight opacity-90 italic">
                    until the clock starts.
                </h2>
            </div>

            {/* Actions */}
            <div className="space-y-6 pb-12 w-full max-w-xs mx-auto z-10 text-center">

                <Link
                    href="/login?mode=register"
                    className="block w-full bg-primary text-white font-sans text-sm tracking-wide py-4 rounded-sharp hover:bg-primary/90 transition-colors uppercase text-center"
                >
                    Get Started
                </Link>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/login"
                        className="font-sans text-sm text-text-primary underline decoration-gold/50 underline-offset-4 hover:text-gold transition-colors"
                    >
                        Log In
                    </Link>

                    <button
                        onClick={handleGuest}
                        disabled={isLoading}
                        className="font-sans text-xs text-text-muted hover:text-text-primary transition-colors tracking-widest uppercase opacity-80 disabled:opacity-40"
                    >
                        {isLoading ? 'Starting...' : 'Continue as Guest'}
                    </button>
                </div>

                <p className="font-sans text-xs text-text-muted mt-8">
                    Upgrade anytime without losing progress.
                </p>

            </div>
        </AppShell>
    )
}
