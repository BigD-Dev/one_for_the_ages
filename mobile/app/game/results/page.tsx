'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ResultConfetti } from '@/components/game/ResultConfetti'
import { Medal, Share2, Target, Calendar, BarChart3, Home } from 'lucide-react'

export default function ResultsPage() {
    const router = useRouter()
    const { lastGameResult, score: currentScore, mode, resetGame } = useGameStore()
    const [showConfetti, setShowConfetti] = useState(false)
    const [animatedScore, setAnimatedScore] = useState(0)

    // Fallback if accessed directly (dev) or error state
    // Fallback if accessed directly (dev) or error state
    const result = lastGameResult || {
        totalScore: currentScore,
        questionsCount: 10,
        correctCount: 0,
        bestStreak: 0,
        accuracy: 0,
        newHighScore: false,
        lifetimeScore: currentScore,
        globalRank: 0
    }

    // Animate from (Lifetime - Session) -> Lifetime
    const finalScore = result.lifetimeScore || result.totalScore
    const deltaScore = result.totalScore
    const startingScore = Math.max(0, finalScore - deltaScore)

    useEffect(() => {
        // Trigger animations
        setTimeout(() => setShowConfetti(true), 100)

        // Count up animation
        let startTimestamp: number
        const duration = 1500

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3)

            setAnimatedScore(Math.floor(startingScore + (finalScore - startingScore) * ease))

            if (progress < 1) {
                window.requestAnimationFrame(step)
            }
        }

        window.requestAnimationFrame(step)
    }, [result.totalScore, startingScore, finalScore])

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'One For The Ages',
                    text: `I just scored ${deltaScore} points in ${mode || 'Challenge'} Mode! My Total XP is now ${finalScore}. Can you beat me?`,
                    url: window.location.origin
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(`I just scored ${result.totalScore} in One For The Ages!`)
            alert('Score copied to clipboard!')
        }
    }

    const handleHome = () => {
        resetGame()
        router.push('/')
    }

    // Determine badge
    let Badge = null
    if (result.newHighScore) {
        Badge = (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold mb-8 shadow-[0_0_20px_rgba(201,162,39,0.2)]"
            >
                <Medal size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">New High Score</span>
            </motion.div>
        )
    } else if (result.correctCount === result.questionsCount && result.questionsCount > 0) {
        Badge = (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 mb-8 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
            >
                <Target size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Perfect Round</span>
            </motion.div>
        )
    }

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative overflow-hidden p-6">
            <ResultConfetti isActive={showConfetti} />

            <div className="w-full max-w-md mx-auto flex flex-col items-center z-10">

                {/* 1. Celebration Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-xl font-bold text-text-primary uppercase tracking-widest mb-2">
                        Challenge Complete
                    </h1>
                    <div className="w-16 h-0.5 bg-primary/50 mx-auto rounded-full" />
                </motion.div>

                {/* 2. Animated Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                    className="text-center mb-10 relative"
                >
                    <div className="text-6xl font-black text-primary tabular-nums tracking-tighter drop-shadow-lg">
                        {animatedScore}
                    </div>
                    {deltaScore > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="text-sm font-bold text-text-muted mt-2"
                        >
                            +{deltaScore} this round
                        </motion.div>
                    )}
                </motion.div>

                {/* 3. Performance Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="w-full space-y-3 mb-10"
                >
                    <div className="flex justify-between items-center p-4 bg-surface rounded-sharp border border-border-subtle">
                        <div className="flex items-center gap-3 text-text-muted">
                            <Target size={18} />
                            <span className="text-sm font-medium uppercase tracking-wide">Accuracy</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary">
                            {Math.round(result.accuracy)}%
                        </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-surface rounded-sharp border border-border-subtle">
                        <div className="flex items-center gap-3 text-text-muted">
                            <BarChart3 size={18} />
                            <span className="text-sm font-medium uppercase tracking-wide">Correct</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary">
                            {result.correctCount} <span className="text-text-muted text-sm">/ {result.questionsCount}</span>
                        </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-surface rounded-sharp border border-border-subtle">
                        <div className="flex items-center gap-3 text-text-muted">
                            <Calendar size={18} />
                            <span className="text-sm font-medium uppercase tracking-wide">Streak</span>
                        </div>
                        <span className="text-lg font-bold text-text-primary flex items-center gap-2">
                            {result.bestStreak} <span className="text-orange-500">🔥</span>
                        </span>
                    </div>

                    {result.globalRank && result.globalRank > 0 && (
                        <div className="flex justify-between items-center p-4 bg-surface rounded-sharp border border-primary/30">
                            <div className="flex items-center gap-3 text-primary">
                                <Medal size={18} />
                                <span className="text-sm font-medium uppercase tracking-wide">Global Rank</span>
                            </div>
                            <span className="text-lg font-bold text-primary">
                                #{result.globalRank}
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* 4. Achievement Badge */}
                {Badge}

                {/* 5. Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="w-full space-y-4"
                >
                    <button
                        onClick={handleShare}
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-sharp border-none shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                    >
                        <Share2 size={18} />
                        Share to Story
                    </button>

                    <button
                        onClick={handleHome}
                        className="w-full py-4 bg-surface hover:bg-surface-raised text-text-muted font-bold rounded-sharp border border-border-subtle active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                    >
                        <Home size={18} />
                        Back to Home
                    </button>
                </motion.div>

            </div>
        </div>
    )
}
