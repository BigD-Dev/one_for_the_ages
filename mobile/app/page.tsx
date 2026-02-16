'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/ui/Layout'
import { ArtifactCard } from '@/components/ArtifactCard'
import { BottomNav } from '@/components/ui/BottomNav'
import { Hourglass, Scale, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

export default function Home() {
    const { user: authUser, isAuthenticated, setUser, setOftaUser } = useAuthStore()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [timeLeft, setTimeLeft] = useState('')

    // Dev Auto-Login Logic
    useEffect(() => {
        const performDevLogin = async () => {
            if (!isAuthenticated && process.env.NODE_ENV === 'development') {
                console.log(' performing dev auto-login...')
                const devUser = {
                    uid: 'dev_user_123',
                    email: 'dev@ofta.com',
                    displayName: 'Dev Player',
                    emailVerified: true,
                    isAnonymous: false,
                    metadata: {},
                    providerData: [],
                    refreshToken: '',
                    tenantId: null,
                    delete: async () => { },
                    getIdToken: async () => 'DEV_TOKEN_123',
                    getIdTokenResult: async () => ({} as any),
                    reload: async () => { },
                    toJSON: () => ({}),
                    phoneNumber: null,
                    photoURL: null,
                    providerId: 'firebase',
                }

                // Set user in store (this sets isAuthenticated=true)
                setUser(devUser as any)

                // Set token manually for API client
                apiClient.setToken('DEV_TOKEN_123')

                // Register in backend to ensure DB record exists
                try {
                    const oftaUser = await apiClient.register({
                        firebase_uid: 'dev_user_123',
                        display_name: 'Dev Player',
                        email: 'dev@ofta.com',
                        auth_provider: 'email',
                    })
                    setOftaUser(oftaUser)
                    console.log('✅ Dev user logged in & registered:', oftaUser)
                } catch (error) {
                    console.error('❌ Dev login failed:', error)
                }
            }
        }

        performDevLogin()
    }, [isAuthenticated, setUser, setOftaUser])

    // 1. Time-based greeting logic
    const getGreeting = () => {
        const hour = currentTime.getHours()
        if (hour < 12) return 'Good Morning'
        if (hour < 18) return 'Good Afternoon'
        return 'Good Evening'
    }

    // 2. Countdown logic for "Resets in..."
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())

            const now = new Date()
            const tomorrow = new Date(now)
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const diff = tomorrow.getTime() - now.getTime()
            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff / (1000 * 60)) % 60)
            const seconds = Math.floor((diff / 1000) % 60)

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }, 1000)

        return () => clearInterval(timer)
    }, [])


    // Mock User Data
    const user = {
        name: authUser?.displayName || 'Diran',
        level: 12,
        streak: 7,
        accuracy: 71,
        bestScore: 820,
        rank: '#1,245'
    }

    return (
        <AppShell className="bg-canvas pb-24">
            <div className="flex flex-col space-y-8 px-6 pt-8">

                {/* 1️⃣ Header Section: Identity + Streak */}
                <header className="space-y-1">
                    <h1 className="font-serif text-2xl text-text-primary tracking-tight">
                        {getGreeting()}, {user.name}
                    </h1>
                    <div className="flex items-center gap-2 font-sans text-xs tracking-widest uppercase">
                        <span className="text-text-muted">Level {user.level}</span>
                        <span className="text-border-subtle">•</span>
                        <div className="flex items-center gap-1.5 text-gold">
                            <span>{user.streak} Day Streak</span>
                            <span className="animate-flame drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]">🔥</span>
                        </div>
                    </div>
                </header>

                {/* 2️⃣ Daily Challenge (Hero Card) */}
                <section>
                    <div className="relative group">
                        <ArtifactCard
                            variant="hero"
                            title="Daily Challenge"
                            subtitle="10 Questions • One Attempt"
                            className="bg-gradient-to-br from-surface-raised to-canvas border-gold/30 hover:border-gold/50"
                        />
                        {/* Custom content inside Hero Area */}
                        <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start gap-4 pointer-events-none">
                            <div className="font-sans text-[10px] text-gold tracking-[0.2em] uppercase opacity-70">
                                Resets in {timeLeft}
                            </div>
                            <Link href="/game/daily" className="pointer-events-auto w-full">
                                <button className="w-full bg-primary text-white font-sans text-xs tracking-widest uppercase py-4 rounded-sharp flex items-center justify-center gap-2 active:bg-primary/80 transition-all shadow-lg shadow-black/40">
                                    Play Today’s Challenge
                                    <ArrowRight size={14} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 3️⃣ Game Modes Section */}
                <section className="space-y-4">
                    <h2 className="font-sans text-[10px] text-text-muted tracking-[0.3em] uppercase pl-1">
                        Game Modes
                    </h2>
                    <div className="flex flex-col gap-3">
                        <ArtifactCard
                            href="/game/age-guess"
                            variant="wide"
                            title="Age Guess"
                            subtitle="Precision Mode"
                            icon={<Hourglass size={18} />}
                            className="h-24 aspect-auto"
                        />
                        <ArtifactCard
                            href="/game/whos-older"
                            variant="wide"
                            title="Who’s Older?"
                            subtitle="Versus Mode"
                            icon={<Scale size={18} />}
                            className="h-24 aspect-auto"
                        />
                        <ArtifactCard
                            href="/game/reverse"
                            variant="wide"
                            title="Reverse / Zodiac"
                            subtitle="Astrological Timeline"
                            icon={<Star size={18} />}
                            className="h-24 aspect-auto"
                        />
                    </div>
                </section>

                {/* 4️⃣ Quick Stats Preview */}
                <section className="border-t border-border-subtle pt-6 flex justify-between items-center text-center">
                    <div className="space-y-1">
                        <p className="font-sans text-[10px] text-text-muted uppercase tracking-widest">Accuracy</p>
                        <p className="font-serif text-lg text-text-primary">{user.accuracy}%</p>
                    </div>
                    <div className="w-[1px] h-8 bg-border-subtle" />
                    <div className="space-y-1">
                        <p className="font-sans text-[10px] text-text-muted uppercase tracking-widest">Best Score</p>
                        <p className="font-serif text-lg text-text-primary">{user.bestScore}</p>
                    </div>
                    <div className="w-[1px] h-8 bg-border-subtle" />
                    <div className="space-y-1">
                        <p className="font-sans text-[10px] text-text-muted uppercase tracking-widest">Rank</p>
                        <p className="font-serif text-lg text-gold">{user.rank}</p>
                    </div>
                </section>

            </div>

            {/* 5️⃣ Bottom Navigation */}
            <BottomNav />
        </AppShell>
    )
}
