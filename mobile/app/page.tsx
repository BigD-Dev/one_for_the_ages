'use client'

import Link from 'next/link'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, Flame, Play, Sparkles, Zap, Crown, User, Settings } from 'lucide-react'

export default function Home() {
    return (
        <AppShell>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <header className="flex justify-between items-center py-2">
                    <h1 className="text-2xl font-bold">OFTA</h1>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        <Flame size={16} className="text-orange-500" />
                        <span className="text-sm font-semibold">3</span>
                    </div>
                </header>

                {/* Daily Challenge */}
                <section>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase">Today's Challenge</h2>
                        <span className="text-xs font-mono bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                            04:22:10
                        </span>
                    </div>

                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2">
                                    <Crown size={12} />
                                    Limited Time
                                </span>
                                <h3 className="text-xl font-bold mb-2">Daily Challenge</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    10 questions. Global leaderboard. Beat the world average!
                                </p>
                            </div>
                        </div>
                        <Button href="/game/daily" className="w-full">
                            <Play size={16} className="mr-2" />
                            Start Challenge
                        </Button>
                    </Card>
                </section>

                {/* Game Modes */}
                <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Game Modes</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/game/age-guess" className="block">
                            <Card className="h-full hover:border-blue-500 transition-colors">
                                <Sparkles size={24} className="text-blue-500 mb-3" />
                                <h3 className="font-bold text-lg leading-tight mb-1">Age Guess</h3>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Classic Mode</p>
                            </Card>
                        </Link>

                        <Link href="/game/whos-older" className="block">
                            <Card className="h-full hover:border-green-500 transition-colors">
                                <Zap size={24} className="text-green-500 mb-3" />
                                <h3 className="font-bold text-lg leading-tight mb-1">Who's Older?</h3>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Speed Round</p>
                            </Card>
                        </Link>
                    </div>
                </section>

                {/* Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white dark:bg-black border-gray-200 dark:border-gray-800">
                    <div className="max-w-md mx-auto grid grid-cols-3 gap-4">
                        <Link href="/leaderboard" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                            <Trophy size={20} />
                            <span className="text-[10px] font-medium uppercase">Ranks</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                            <User size={20} />
                            <span className="text-[10px] font-medium uppercase">Profile</span>
                        </Link>
                        <Link href="/settings" className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
                            <Settings size={20} />
                            <span className="text-[10px] font-medium uppercase">Settings</span>
                        </Link>
                    </div>
                </nav>
                <div className="h-16" /> {/* Spacer for fixed nav */}
            </div>
        </AppShell>
    )
}
