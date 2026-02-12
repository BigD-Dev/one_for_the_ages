'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

interface LeaderboardEntry {
    rank: number
    display_name: string
    score?: number
    lifetime_score?: number
    games_played?: number
    accuracy_pct?: number
    best_streak?: number
    is_current_user: boolean
}

export default function LeaderboardPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()

    const [activeTab, setActiveTab] = useState<'daily' | 'alltime'>('daily')
    const [dailyEntries, setDailyEntries] = useState<LeaderboardEntry[]>([])
    const [allTimeEntries, setAllTimeEntries] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
    const [totalPlayers, setTotalPlayers] = useState(0)
    const [myRank, setMyRank] = useState<number | null>(null)

    useEffect(() => {
        loadLeaderboard()
    }, [activeTab, selectedDate])

    const loadLeaderboard = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'daily') {
                const data = await apiClient.getDailyLeaderboard(selectedDate)
                setDailyEntries(data.entries || [])
                setTotalPlayers(data.total_players || 0)
                setMyRank(data.current_user_rank)
            } else {
                const data = await apiClient.getAllTimeLeaderboard()
                setAllTimeEntries(data.entries || [])
                setTotalPlayers(data.total_players || 0)
                setMyRank(data.current_user_rank)
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error)
        }
        setIsLoading(false)
    }

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400'
        if (rank === 2) return 'text-gray-300'
        if (rank === 3) return 'text-amber-600'
        return 'text-gray-400'
    }

    const entries = activeTab === 'daily' ? dailyEntries : allTimeEntries

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white">
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-primary-400">🏆 Leaderboard</h1>
                <div className="w-12"></div>
            </div>

            {/* Tabs */}
            <div className="flex bg-dark-800 rounded-xl p-1 mb-6">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'daily'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    ⭐ Daily
                </button>
                <button
                    onClick={() => setActiveTab('alltime')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'alltime'
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    🌟 All Time
                </button>
            </div>

            {/* Date Picker for Daily */}
            {activeTab === 'daily' && (
                <div className="mb-6">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-dark-800 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                </div>
            )}

            {/* My Rank Banner */}
            {myRank && (
                <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-primary-400 text-sm font-bold">Your Rank</p>
                            <p className="text-white text-2xl font-bold">#{myRank}</p>
                        </div>
                        <p className="text-gray-400 text-sm">of {totalPlayers} players</p>
                    </div>
                </div>
            )}

            {/* Leaderboard List */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading leaderboard...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-6xl mb-4">🏆</p>
                    <p className="text-gray-400 text-lg">No entries yet</p>
                    <p className="text-gray-500 text-sm mt-2">Be the first to submit a score!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry, i) => (
                        <div
                            key={i}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${entry.is_current_user
                                    ? 'bg-primary-500/20 border border-primary-500/30'
                                    : 'bg-dark-800 hover:bg-dark-700'
                                }`}
                        >
                            {/* Rank */}
                            <div className={`w-12 text-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                                {getRankEmoji(entry.rank)}
                            </div>

                            {/* Name */}
                            <div className="flex-1">
                                <p className={`font-bold ${entry.is_current_user ? 'text-primary-400' : 'text-white'}`}>
                                    {entry.display_name}
                                    {entry.is_current_user && ' (You)'}
                                </p>
                                {activeTab === 'alltime' && entry.games_played && (
                                    <p className="text-gray-500 text-xs">
                                        {entry.games_played} games • {entry.accuracy_pct?.toFixed(0)}% accuracy
                                    </p>
                                )}
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <p className="text-white font-bold text-lg">
                                    {activeTab === 'daily' ? entry.score : entry.lifetime_score}
                                </p>
                                <p className="text-gray-500 text-xs">points</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
