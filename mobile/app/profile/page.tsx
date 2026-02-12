'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

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
            'AGE_GUESS': '🎯 Age Guess',
            'WHO_OLDER': '⚖️ Who\'s Older',
            'DAILY_CHALLENGE': '⭐ Daily',
            'REVERSE_SIGN': '🔮 Reverse',
        }
        return labels[mode] || mode
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-primary-400">Profile</h1>
                <button onClick={() => router.push('/settings')} className="text-gray-400 hover:text-white">
                    ⚙️
                </button>
            </div>

            {/* User Card */}
            <div className="bg-dark-800 rounded-2xl p-6 mb-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-3xl">
                        {oftaUser?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                    {oftaUser?.display_name || user?.displayName || 'Anonymous Player'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {user?.email || 'Guest Account'}
                </p>
                {stats && (
                    <p className="text-primary-400 text-sm mt-2">
                        🎮 {stats.games_played} games played
                    </p>
                )}
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary-400">{stats.lifetime_score.toLocaleString()}</p>
                        <p className="text-gray-400 text-xs">Total Score</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-orange-400">{stats.best_streak}</p>
                        <p className="text-gray-400 text-xs">Best Streak</p>
                    </div>
                    <div className="bg-dark-800 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{stats.accuracy_pct.toFixed(0)}%</p>
                        <p className="text-gray-400 text-xs">Accuracy</p>
                    </div>
                </div>
            )}

            {/* Section Tabs */}
            <div className="flex bg-dark-800 rounded-xl p-1 mb-6">
                {(['stats', 'history', 'achievements'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveSection(tab)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === tab
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {tab === 'stats' && '📊 Stats'}
                        {tab === 'history' && '📜 History'}
                        {tab === 'achievements' && '🏅 Awards'}
                    </button>
                ))}
            </div>

            {/* Stats Section */}
            {activeSection === 'stats' && stats && (
                <div className="space-y-3">
                    <StatRow label="Total Score" value={stats.lifetime_score.toLocaleString()} icon="🏆" />
                    <StatRow label="Games Played" value={stats.games_played.toString()} icon="🎮" />
                    <StatRow label="Best Streak" value={`${stats.best_streak} 🔥`} icon="⚡" />
                    <StatRow label="Total Correct" value={`${stats.total_correct} / ${stats.total_questions}`} icon="✅" />
                    <StatRow label="Accuracy" value={`${stats.accuracy_pct.toFixed(1)}%`} icon="🎯" />
                    <StatRow label="Daily Challenges" value={stats.daily_challenges.toString()} icon="⭐" />
                    {stats.favourite_category && (
                        <StatRow label="Favourite Category" value={stats.favourite_category} icon="❤️" />
                    )}
                </div>
            )}

            {/* History Section */}
            {activeSection === 'history' && (
                <div className="space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No games played yet</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-lg"
                            >
                                Play Now
                            </button>
                        </div>
                    ) : (
                        history.map((game) => (
                            <div key={game.session_id} className="bg-dark-800 rounded-xl p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-white font-bold">{getModeLabel(game.mode)}</p>
                                        <p className="text-gray-500 text-xs">{formatDate(game.played_at)}</p>
                                    </div>
                                    <p className="text-primary-400 font-bold text-lg">{game.score}</p>
                                </div>
                                <div className="flex gap-4 text-xs text-gray-400">
                                    <span>✅ {game.correct_count}/{game.questions_count}</span>
                                    <span>🎯 {game.accuracy.toFixed(0)}%</span>
                                    <span>🔥 {game.best_streak}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Achievements Section */}
            {activeSection === 'achievements' && (
                <div className="space-y-2">
                    {achievements.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400">No achievements yet</p>
                        </div>
                    ) : (
                        achievements.map((ach) => (
                            <div
                                key={ach.id}
                                className={`rounded-xl p-4 flex items-center gap-4 ${ach.unlocked
                                        ? 'bg-dark-800'
                                        : 'bg-dark-800/50 opacity-50'
                                    }`}
                            >
                                <div className="text-3xl">{ach.icon || '🏅'}</div>
                                <div className="flex-1">
                                    <p className={`font-bold ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                                        {ach.title}
                                    </p>
                                    <p className="text-gray-400 text-xs">{ach.description}</p>
                                </div>
                                {ach.unlocked && (
                                    <span className="text-green-400 text-sm">✓</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function StatRow({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="bg-dark-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <p className="text-gray-300">{label}</p>
            </div>
            <p className="text-white font-bold">{value}</p>
        </div>
    )
}
