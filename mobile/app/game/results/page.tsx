'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { Share } from '@capacitor/share'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from '@/components/ui/PageTransition'
import { fireConfetti } from '@/lib/confetti'

// Animated counter component
const AnimatedCounter = ({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) => {
    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {value}{suffix}
        </motion.span>
    )
}

export default function ResultsPage() {
    const router = useRouter()
    const hasFiredConfetti = useRef(false)
    const {
        score,
        streak,
        bestStreak,
        correctCount,
        questions,
        resetGame,
    } = useGameStore()

    const totalQuestions = questions.length
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0

    useEffect(() => {
        if (totalQuestions === 0) {
            router.push('/')
            return
        }

        if (!hasFiredConfetti.current && accuracy >= 60) {
            hasFiredConfetti.current = true
            setTimeout(() => fireConfetti(), 500)
        }
    }, [totalQuestions, router, accuracy])

    const handleShare = async () => {
        try {
            await Share.share({
                title: 'One for the Ages',
                text: `I just scored ${score} points with a ${bestStreak} streak on One for the Ages! Can you beat that?`,
                url: 'https://ofta.app',
            })
        } catch (error) {
            console.error('Failed to share:', error)
        }
    }

    const handlePlayAgain = () => {
        resetGame()
        router.push('/')
    }

    const getPerformanceMessage = () => {
        if (accuracy >= 90) return 'Outstanding!'
        if (accuracy >= 75) return 'Great job!'
        if (accuracy >= 60) return 'Good effort!'
        if (accuracy >= 40) return 'Keep practicing!'
        return 'Try again!'
    }

    return (
        <AppShell>
            <PageTransition className="flex-1 flex items-center justify-center">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <FadeIn delay={0}>
                        <div className="text-center mb-8">
                            <motion.h1
                                className="text-5xl font-bold gradient-text-animated mb-2"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                            >
                                Game Over!
                            </motion.h1>
                            <p className="text-text-secondary">Here's how you did</p>
                        </div>
                    </FadeIn>

                    {/* Stats Card */}
                    <FadeIn delay={0.15}>
                        <Card variant="glass" className="p-8 mb-6">
                            {/* Score */}
                            <div className="text-center mb-8">
                                <p className="text-text-secondary mb-2">Final Score</p>
                                <motion.p
                                    className="text-6xl font-bold text-primary"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
                                >
                                    {score}
                                </motion.p>
                            </div>

                            {/* Stats Grid */}
                            <StaggerChildren className="grid grid-cols-2 gap-4 mb-6">
                                <StaggerItem>
                                    <Card variant="solid" className="p-4 text-center bg-bg-surface-active">
                                        <p className="text-text-secondary text-sm mb-1">Accuracy</p>
                                        <AnimatedCounter
                                            value={Math.round(accuracy)}
                                            suffix="%"
                                            className="text-2xl font-bold text-text-primary"
                                        />
                                    </Card>
                                </StaggerItem>
                                <StaggerItem>
                                    <Card variant="solid" className="p-4 text-center bg-bg-surface-active">
                                        <p className="text-text-secondary text-sm mb-1">Correct</p>
                                        <AnimatedCounter
                                            value={correctCount}
                                            suffix={`/${totalQuestions}`}
                                            className="text-2xl font-bold text-green-400"
                                        />
                                    </Card>
                                </StaggerItem>
                                <StaggerItem>
                                    <Card variant="solid" className="p-4 text-center bg-bg-surface-active">
                                        <p className="text-text-secondary text-sm mb-1">Best Streak</p>
                                        <AnimatedCounter
                                            value={bestStreak}
                                            className="text-2xl font-bold text-orange-400"
                                        />
                                    </Card>
                                </StaggerItem>
                                <StaggerItem>
                                    <Card variant="solid" className="p-4 text-center bg-bg-surface-active">
                                        <p className="text-text-secondary text-sm mb-1">Current Streak</p>
                                        <AnimatedCounter
                                            value={streak}
                                            className="text-2xl font-bold text-orange-400"
                                        />
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>

                            {/* Performance Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Card variant="solid" className="p-4 text-center bg-bg-surface-active">
                                    <p className="text-text-primary font-bold text-lg">
                                        {getPerformanceMessage()}
                                    </p>
                                </Card>
                            </motion.div>
                        </Card>
                    </FadeIn>

                    {/* Actions */}
                    <FadeIn delay={0.3}>
                        <div className="space-y-3">
                            <Button
                                onClick={handleShare}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                                size="lg"
                            >
                                Share Results
                            </Button>

                            <Button
                                onClick={handlePlayAgain}
                                className="w-full bg-gradient-to-r from-primary-from to-primary-to"
                                size="lg"
                                magnetic
                            >
                                Play Again
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => router.push('/')}
                                className="w-full"
                                size="lg"
                            >
                                Home
                            </Button>
                        </div>
                    </FadeIn>
                </div>
            </PageTransition>
        </AppShell>
    )
}
