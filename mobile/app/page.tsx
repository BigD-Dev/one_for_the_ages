'use client'

import Link from 'next/link'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, Flame, Play, Sparkles, Zap, Crown, User, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
    return (
        <AppShell>
            <div className="flex flex-col h-full">
                {/* Top Header */}
                <header className="flex justify-between items-center py-6 px-1">
                    <motion.h1
                        className="text-5xl font-black tracking-tighter gradient-text-animated"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        OFTA
                    </motion.h1>

                    <motion.div
                        className="flex items-center gap-2 px-4 py-2 glass rounded-full"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <Flame size={18} className="text-orange-500 fill-orange-500" />
                        <span className="text-base font-bold text-white">3</span>
                    </motion.div>
                </header>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-y-auto pb-6 space-y-8">

                    {/* Daily Challenge - Hero Card */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest">
                                Today's Challenge
                            </h2>
                            <div className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
                                04:22:10
                            </div>
                        </div>

                        <Card className="relative overflow-hidden border-amber-500/40 bg-gradient-to-br from-amber-950/60 via-amber-900/30 to-black/60">
                            {/* Background Crown */}
                            <div className="absolute -top-4 -right-8 opacity-[0.07]">
                                <Crown size={180} className="text-amber-400 rotate-12" />
                            </div>

                            <div className="relative p-6 space-y-4">
                                {/* Badge */}
                                <div className="inline-flex items-center px-3 py-1 bg-amber-500/20 text-amber-200 text-xs font-bold rounded-full border border-amber-500/40 uppercase tracking-wide">
                                    <Crown size={12} className="mr-1.5" />
                                    Limited Time
                                </div>

                                {/* Title */}
                                <h3 className="text-4xl font-black text-white tracking-tight leading-none">
                                    Daily<br />Challenge
                                </h3>

                                {/* Description */}
                                <p className="text-amber-100/70 text-sm leading-relaxed max-w-[85%]">
                                    10 questions. Global leaderboard. Beat the world average!
                                </p>

                                {/* CTA Button */}
                                <Button
                                    href="/game/daily"
                                    className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:via-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/30 border border-amber-400/30"
                                >
                                    <Play size={20} className="fill-white" />
                                    <span>Start Challenge</span>
                                </Button>
                            </div>
                        </Card>
                    </motion.section>

                    {/* Game Modes Grid */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 px-1">
                            Game Modes
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Age Guess */}
                            <Link href="/game/age-guess" className="block">
                                <Card className="h-44 p-6 flex flex-col justify-between hover:border-cyan-500/60 hover:shadow-cyan-500/20 hover:shadow-xl transition-all duration-300 group">
                                    <div className="p-3.5 w-fit rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 text-cyan-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <Sparkles size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl leading-none mb-1.5">
                                            Age<br/>Guess
                                        </h3>
                                        <p className="text-[10px] text-cyan-300/60 uppercase tracking-widest font-bold">
                                            Classic Mode
                                        </p>
                                    </div>
                                </Card>
                            </Link>

                            {/* Who's Older */}
                            <Link href="/game/whos-older" className="block">
                                <Card className="h-44 p-6 flex flex-col justify-between hover:border-emerald-500/60 hover:shadow-emerald-500/20 hover:shadow-xl transition-all duration-300 group">
                                    <div className="p-3.5 w-fit rounded-2xl bg-gradient-to-br from-emerald-500/30 to-green-500/20 text-emerald-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                        <Zap size={28} strokeWidth={2.5} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl leading-none mb-1.5">
                                            Who's<br/>Older?
                                        </h3>
                                        <p className="text-[10px] text-emerald-300/60 uppercase tracking-widest font-bold">
                                            Speed Round
                                        </p>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    </motion.section>
                </div>

                {/* Bottom Navigation - Fixed */}
                <nav className="pt-4 pb-safe">
                    <motion.div
                        className="glass rounded-3xl p-2 mx-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <Link href="/leaderboard">
                                <div className="flex flex-col items-center py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                                    <Trophy size={22} className="text-white/70 mb-1.5" strokeWidth={2} />
                                    <span className="text-[11px] font-bold text-white/60">Ranks</span>
                                </div>
                            </Link>

                            <Link href="/profile">
                                <div className="flex flex-col items-center py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                                    <User size={22} className="text-white/70 mb-1.5" strokeWidth={2} />
                                    <span className="text-[11px] font-bold text-white/60">Profile</span>
                                </div>
                            </Link>

                            <Link href="/settings">
                                <div className="flex flex-col items-center py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer">
                                    <Settings size={22} className="text-white/70 mb-1.5" strokeWidth={2} />
                                    <span className="text-[11px] font-bold text-white/60">Settings</span>
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                </nav>
            </div>
        </AppShell>
    )
}
