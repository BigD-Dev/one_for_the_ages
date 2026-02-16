'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ArrowLeft, Check, LogOut, Trash2 } from 'lucide-react'

interface UserStats {
    lifetime_score: number
    best_streak: number
    games_played: number
    total_correct: number
    total_questions: number
    accuracy_pct: number
    favourite_category: string | null
    daily_challenges: number
}

export default function ProfilePage() {
    const router = useRouter()
    const { isAuthenticated, oftaUser, user, logout } = useAuthStore()
    const [stats, setStats] = useState<UserStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Settings State (Local for now, persist to localStorage later)
    const [settings, setSettings] = useState({
        sound: true,
        haptics: true,
        notifications: true,
    })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }
        loadProfile()

        // Load settings from localStorage
        const savedSettings = localStorage.getItem('ofta-settings')
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings))
        }
    }, [isAuthenticated])

    const loadProfile = async () => {
        try {
            const statsData = await apiClient.getUserStats().catch(() => null)
            setStats(statsData)
        } catch (error) {
            console.error('Failed to load profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleSetting = (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] }
        setSettings(newSettings)
        localStorage.setItem('ofta-settings', JSON.stringify(newSettings))
    }

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    if (isLoading) {
        return (
            <AppShell className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </AppShell>
        )
    }

    // Derived Stats
    const totalScore = stats?.lifetime_score || 0
    const level = Math.floor(totalScore / 1000) + 1
    const currentXP = totalScore % 1000
    const nextLevelXP = 1000
    const accuracy = stats?.accuracy_pct ? Math.round(stats.accuracy_pct) : 0
    // Mock win rate for now as accuracy
    const winRate = accuracy

    return (
        <AppShell className="bg-canvas pb-24 px-6 pt-6 font-sans">
            {/* Header: Back Button */}
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center text-text-muted hover:text-text-primary transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    <span className="text-sm font-medium tracking-wide uppercase">Back</span>
                </button>
                <h1 className="text-sm font-bold text-text-primary tracking-[0.2em] uppercase">Profile</h1>
                <div className="w-6" /> {/* Spacer for alignment */}
            </header>

            {/* 1️⃣ Identity Header */}
            <section className="flex flex-col items-center mb-10">
                <div className="w-24 h-24 rounded-full border-2 border-primary/30 flex items-center justify-center bg-surface-raised mb-4 shadow-[0_0_15px_rgba(30,122,140,0.15)] relative">
                    <span className="text-4xl font-serif text-primary">
                        {oftaUser?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
                    </span>
                    {/* Optional: Online Indicator */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-canvas" />
                </div>

                <h2 className="text-xl font-bold text-text-primary font-serif mb-1">
                    {oftaUser?.display_name || user?.displayName || 'Anonymous Player'}
                </h2>
                <div className="flex flex-col items-center w-full max-w-[200px] gap-2">
                    <p className="text-xs text-primary tracking-widest uppercase font-bold">
                        Level {level}
                    </p>
                    <div className="w-full">
                        <ProgressBar value={currentXP} max={nextLevelXP} color="bg-primary" />
                        <div className="flex justify-between mt-1 text-[9px] text-text-muted font-mono">
                            <span>{currentXP} XP</span>
                            <span>{nextLevelXP} XP</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2️⃣ Primary Stats Card */}
            <Card className="p-0 border-border-subtle bg-surface-raised overflow-hidden mb-6">
                <div className="grid grid-cols-2 divide-x divide-border-subtle">
                    <StatBox label="Avg. Score" value={stats?.lifetime_score ? Math.round(stats.lifetime_score / (stats.games_played || 1)).toString() : "0"} />
                    <StatBox label="Accuracy" value={`${winRate}%`} color="text-green-400" />
                </div>
                <div className="border-t border-border-subtle grid grid-cols-2 divide-x divide-border-subtle">
                    <StatBox label="Best Score" value={stats?.lifetime_score ? "N/A" : "0"} /> {/* Need Best Score in API */}
                    <StatBox label="Games Played" value={stats?.games_played.toString() || "0"} />
                </div>
            </Card>

            {/* 3️⃣ Streak Section */}
            <Card className="p-5 border-gold/30 bg-gradient-to-r from-surface-raised via-surface-raised to-[#1A1810] mb-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gold animate-pulse">🔥</span>
                            <span className="text-sm font-bold text-gold tracking-widest uppercase">Current Streak</span>
                        </div>
                        <p className="text-3xl font-serif text-text-primary">
                            {stats?.best_streak || 0} <span className="text-base font-sans text-text-muted">Days</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Longest</p>
                        <p className="text-lg font-mono text-text-primary">{stats?.best_streak || 0}</p>
                    </div>
                </div>
            </Card>

            {/* 4️⃣ Settings Controls */}
            <section className="space-y-4 mb-10">
                <h3 className="text-[10px] text-text-muted uppercase tracking-[0.2em] px-1 font-bold">Preferences</h3>
                <Card className="divide-y divide-border-subtle bg-surface-raised border-border-subtle">
                    <SettingRow
                        label="Sound Effects"
                        checked={settings.sound}
                        onChange={() => toggleSetting('sound')}
                    />
                    <SettingRow
                        label="Haptics"
                        checked={settings.haptics}
                        onChange={() => toggleSetting('haptics')}
                    />
                    <SettingRow
                        label="Notifications"
                        checked={settings.notifications}
                        onChange={() => toggleSetting('notifications')}
                    />
                </Card>
            </section>

            {/* 5️⃣ Account Controls */}
            <section className="space-y-4 mb-8">
                <h3 className="text-[10px] text-text-muted uppercase tracking-[0.2em] px-1 font-bold">Account</h3>
                <button
                    onClick={handleLogout}
                    className="w-full py-4 text-sm font-medium text-text-primary bg-surface-raised border border-border-subtle rounded-sharp hover:bg-surface transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut size={16} />
                    Log Out
                </button>
                <div className="flex justify-center">
                    <button className="text-xs text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-widest py-2">
                        Delete Account
                    </button>
                </div>
            </section>

            <div className="text-center pb-8">
                <p className="text-[10px] text-border-subtle font-mono">
                    ID: {oftaUser?.firebase_uid || user?.uid || 'GUEST'} • v1.0.0
                </p>
            </div>
        </AppShell>
    )
}

function StatBox({ label, value, color = "text-text-primary" }: { label: string, value: string, color?: string }) {
    return (
        <div className="p-4 text-center">
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
        </div>
    )
}

function SettingRow({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) {
    return (
        <div className="flex items-center justify-between p-4">
            <span className="text-sm text-text-primary font-medium">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    )
}
