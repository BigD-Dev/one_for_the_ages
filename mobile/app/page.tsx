'use client'

import Link from 'next/link'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Trophy, Flame, Play, Star, Sparkles, Zap, Timer, ArrowRight, User, Settings, Crown } from 'lucide-react'

export default function Home() {
    return (
        <AppShell>
            {/* Top HUD */}
            <header className="flex justify-between items-center mb-8 pt-2">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-from to-primary-to bg-clip-text text-transparent">
                        OFTA
                    </h1>
                    <span className="text-xs text-text-muted font-medium tracking-wider">ONE FOR THE AGES</span>
                </div>

                <div className="flex gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-surface rounded-full border border-border-subtle">
                        <Flame size={16} className="text-orange-500" fill="currentColor" />
                        <span className="text-sm font-bold text-orange-100">3</span>
                    </div>
                </div>
            </header>

            {/* Daily Challenge (Hero) */}
            <section className="mb-8">
                <div className="flex justify-between items-end mb-3 px-1">
                    <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest">Daily Ritual</h2>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                        <Timer size={12} /> Resets in 04:22
                    </span>
                </div>

                <Card
                    variant="glass"
                    className="p-1 relative overflow-hidden group border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-transparent"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <Crown size={80} className="text-yellow-500 transform rotate-12 group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="p-5 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <Badge variant="warn" className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                                LIMITED TIME
                            </Badge>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1">Daily Challenge</h3>
                        <p className="text-yellow-200/70 text-sm mb-6 max-w-[80%]">
                            10 questions. One attempt. Global glory.
                        </p>

                        <Button href="/game/daily" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:shadow-yellow-500/20 border border-white/10">
                            <Play size={18} className="mr-2" /> Play Today's 10
                        </Button>
                    </div>
                </Card>
            </section>

            {/* Game Modes */}
            <section className="flex-1">
                <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Game Modes</h2>

                <div className="grid grid-cols-1 gap-3">
                    {/* Age Guess */}
                    <Link href="/game/age-guess">
                        <Card variant="glass" className="p-4 flex items-center justify-between group hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                    <Sparkles size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg">Age Guess</h3>
                                    <p className="text-xs text-text-muted">The classic mode</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-bg-surface-active flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                                <ArrowRight size={16} />
                            </div>
                        </Card>
                    </Link>

                    {/* Who's Older */}
                    <Link href="/game/whos-older">
                        <Card variant="glass" className="p-4 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg">Who's Older?</h3>
                                    <p className="text-xs text-text-muted">Speed comparison</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-bg-surface-active flex items-center justify-center text-text-muted group-hover:text-emerald-400 transition-colors">
                                <ArrowRight size={16} />
                            </div>
                        </Card>
                    </Link>

                    {/* Reverse Mode */}
                    <Link href="/game/reverse">
                        <Card variant="glass" className="p-4 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                    <Star size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-primary text-lg">Astrology</h3>
                                    <p className="text-xs text-text-muted">Guess the sign</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-bg-surface-active flex items-center justify-center text-text-muted group-hover:text-purple-400 transition-colors">
                                <ArrowRight size={16} />
                            </div>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* Bottom Nav */}
            <nav className="mt-8 grid grid-cols-3 gap-2">
                <Button variant="ghost" size="sm" href="/leaderboard" className="flex flex-col h-auto py-2 gap-1 text-xs">
                    <Trophy size={20} />
                    <span>Rankings</span>
                </Button>
                <Button variant="ghost" size="sm" href="/profile" className="flex flex-col h-auto py-2 gap-1 text-xs">
                    <User size={20} />
                    <span>Profile</span>
                </Button>
                <Button variant="ghost" size="sm" href="/settings" className="flex flex-col h-auto py-2 gap-1 text-xs">
                    <Settings size={20} />
                    <span>Config</span>
                </Button>
            </nav>
        </AppShell>
    )
}
