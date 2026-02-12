'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Settings } from 'lucide-react'

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

interface Achievement {
    id: string
    title: string
    description: string
    icon: string | null
    unlocked: boolean
    unlocked_at: string | null
}

interface GameHistory {
    session_id: string
    mode: string
    score: number
    correct_count: number
    questions_count: number
    best_streak: number
    accuracy: number
    played_at: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { isAuthenticated, oftaUser, user } = useAuthStore()

    const [stats, setStats] = useState<UserStats | null>(null)
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [history, setHistory] = useState<GameHistory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeSection, setActiveSection] = useState<'stats' | 'history' | 'achievements'>('stats')

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }
        loadProfile()
    }, [isAuthenticated])

    const loadProfile = async () => {
        try {
            const [statsData, achData, historyData] = await Promise.all([
                apiClient.getUserStats().catch(() => null),
                apiClient.getUserAchievements().catch(() => ({ achievements: [] })),
                apiClient.getUserHistory().catch(() => ({ games: [] })),
            ])
            setStats(statsData)
            setAchievements(achData?.achievements || [])
            setHistory(historyData?.games || [])
        } catch (error) {
            console.error('Failed to load profile:', error)
        }
        setIsLoading(false)
    }

    const getModeLabel = (mode: string) => {
        const labels: Record<string, string> = {
            'AGE_GUESS': 'Age Guess',
            'WHO_OLDER': "Who's Older",
            'DAILY_CHALLENGE': 'Daily',
            'REVERSE_SIGN': 'Reverse',
        }
        return labels[mode] || mode
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    if (isLoading) {
        return (
            <AppShell className="flex items-center justify-center">
                <div className="skeleton w-12 h-12 rounded-full" />
            </AppShell>
        )
    }

    return (
        <AppShell>
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={() => router.push('/')} className="text-text-muted">
                    <ArrowLeft size={18} className="mr-1" /> Back
                </Button>
                <h1 className="text-xl font-bold text-text-primary font-serif">Profile</h1>
                <button onClick={() => router.push('/settings')} className="text-text-muted active:opacity-80 transition-opacity duration-150 p-2">
                    <Settings size={18} />
                </button>
            </header>

            {/* User Card */}
            <Card className="p-6 mb-6 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-gold mx-auto mb-4 flex items-center justify-center bg-surface">
                    <span className="text-3xl font-serif text-gold">
                        {oftaUser?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-text-primary font-serif">
                    {oftaUser?.display_name || user?.displayName || 'Anonymous Player'}
                </h2>
                <p className="text-text-muted text-sm">
                    {user?.email || 'Guest Account'}
                </p>
                {stats && (
                    <p className="text-primary text-sm mt-2 font-mono">
                        {stats.games_played} games played
                    </p>
                )}
            </Card>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary font-mono">{stats.lifetime_score.toLocaleString()}</p>
                        <p className="text-text-muted text-xs">Total Score</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-gold font-mono">{stats.best_streak}</p>
                        <p className="text-text-muted text-xs">Best Streak</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-400 font-mono">{stats.accuracy_pct.toFixed(0)}%</p>
                        <p className="text-text-muted text-xs">Accuracy</p>
                    </Card>
                </div>
            )}

            {/* Section Tabs */}
            <div className="flex bg-surface rounded-sharp border border-border-subtle p-1 mb-6">
                {(['stats', 'history', 'achievements'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSection(tab)}
                        className={`flex-1 py-2 rounded-sharp text-sm font-medium transition-colors duration-150 ${
                            activeSection === tab
                                ? 'bg-primary text-white'
                                : 'text-text-muted'
                        }`}
                    >
                        {tab === 'stats' && 'Stats'}
                        {tab === 'history' && 'History'}
                        {tab === 'achievements' && 'Awards'}
                    </button>
                ))}
            </div>

            {/* Stats Section */}
            {activeSection === 'stats' && stats && (
                <div className="space-y-1">
                    <StatRow label="Total Score" value={stats.lifetime_score.toLocaleString()} />
                    <StatRow label="Games Played" value={stats.games_played.toString()} />
                    <StatRow label="Best Streak" value={stats.best_streak.toString()} />
                    <StatRow label="Total Correct" value={`${stats.total_correct} / ${stats.total_questions}`} />
                    <StatRow label="Accuracy" value={`${stats.accuracy_pct.toFixed(1)}%`} />
                    <StatRow label="Daily Challenges" value={stats.daily_challenges.toString()} />
                    {stats.favourite_category && (
                        <StatRow label="Favourite Category" value={stats.favourite_category} />
                    )}
                </div>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
                <div className="space-y-1">
                    {history.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-text-muted">No games played yet</p>
                            <Button onClick={() => router.push('/')} className="mt-4">
                                Play Now
                            </Button>
                        </div>
                    ) : (
                        history.map((game) => (
                            <Card key={game.session_id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-text-primary font-medium">{getModeLabel(game.mode)}</p>
                                        <p className="text-text-muted text-xs">{formatDate(game.played_at)}</p>
                                    </div>
                                    <p className="text-primary font-bold font-mono">{game.score}</p>
                                </div>
                                <div className="flex gap-4 text-xs text-text-muted font-mono">
                                    <span>{game.correct_count}/{game.questions_count} correct</span>
                                    <span>{game.accuracy.toFixed(0)}% acc</span>
                                    <span>{game.best_streak} streak</span>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Achievements Section */}
            {activeSection === 'achievements' && (
                <div className="space-y-1">
                    {achievements.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-text-muted">No achievements yet</p>
                        </div>
                    ) : (
                        achievements.map((ach) => (
                            <Card
                                key={ach.id}
                                className={`p-4 flex items-center gap-4 ${!ach.unlocked ? 'opacity-50' : ''}`}
                            >
                                <div className="text-2xl">{ach.icon || '*'}</div>
                                <div className="flex-1">
                                    <p className={`font-medium ${ach.unlocked ? 'text-text-primary' : 'text-text-muted'}`}>
                                        {ach.title}
                                    </p>
                                    <p className="text-text-muted text-xs">{ach.description}</p>
                                </div>
                                {ach.unlocked && (
                                    <span className="text-green-400 text-sm font-mono">Done</span>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            )}
        </AppShell>
    )
}

function StatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-3 px-4 border-b border-border-subtle">
            <p className="text-text-muted">{label}</p>
            <p className="text-text-primary font-bold font-mono">{value}</p>
        </div>
    )
}
