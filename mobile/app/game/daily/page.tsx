'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { PageTransition, FadeIn } from '@/components/ui/PageTransition'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Flame, Lightbulb, Star } from 'lucide-react'

export default function DailyChallengePage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const {
        sessionId,
        questions,
        currentQuestionIndex,
        score,
        streak,
        startGame,
        nextQuestion,
        submitAnswer,
        endGame,
    } = useGameStore()

    const [guess, setGuess] = useState('')
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showHint, setShowHint] = useState(false)
    const [todayDate] = useState(() => new Date().toISOString().split('T')[0])
    const [alreadyCompleted, setAlreadyCompleted] = useState(false)
    const [previousScore, setPreviousScore] = useState<number | null>(null)

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const initDaily = async () => {
            try {
                const packStatus = await apiClient.getDailyPack(todayDate)
                if (packStatus.is_completed) {
                    setAlreadyCompleted(true)
                    setPreviousScore(packStatus.user_score)
                    setIsLoading(false)
                    return
                }

                const session = await apiClient.startSession({
                    mode: 'DAILY_CHALLENGE',
                    pack_date: todayDate,
                })
                startGame(session.id, 'DAILY_CHALLENGE', session.questions)
                setIsLoading(false)
            } catch (error) {
                console.error('Failed to start daily:', error)
                router.push('/')
            }
        }

        if (!sessionId) {
            initDaily()
        } else {
            setIsLoading(false)
        }
    }, [isAuthenticated, sessionId, router, startGame, todayDate])

    const handleSubmit = async () => {
        if (!guess || !currentQuestion) return

        const userGuess = parseInt(guess, 10)
        if (isNaN(userGuess) || userGuess < 0 || userGuess > 120) {
            setFeedback('Please enter a valid age (0-120)')
            return
        }

        try {
            const responseTimeMs = Date.now() - (useGameStore.getState().questionStartTime || 0)

            const result = await apiClient.submitAnswer(sessionId!, {
                question_template_id: currentQuestion.id,
                question_index: currentQuestionIndex,
                user_answer: { age: userGuess },
                response_time_ms: responseTimeMs,
                hints_used: showHint ? 1 : 0,
            })

            submitAnswer(result.is_correct, result.score_awarded)

            const correctAge = result.correct_answer.age
            const error = Math.abs(userGuess - correctAge)

            if (result.is_correct) {
                setFeedback(`Correct! ${currentQuestion.celebrity_name} is ${correctAge}. +${result.score_awarded} pts!`)
            } else {
                setFeedback(`${currentQuestion.celebrity_name} is ${correctAge} (off by ${error})`)
            }

            setTimeout(() => {
                if (isLastQuestion) {
                    handleEndGame()
                } else {
                    nextQuestion()
                    setGuess('')
                    setFeedback(null)
                    setShowHint(false)
                }
            }, 2000)
        } catch (error) {
            console.error('Failed to submit answer:', error)
            setFeedback('Failed to submit. Try again.')
        }
    }

    const handleEndGame = async () => {
        try {
            await apiClient.endSession(sessionId!)
            try {
                await apiClient.submitDailyScore(todayDate)
            } catch (e) {
                console.error('Failed to submit daily score:', e)
            }
            endGame()
            router.push('/game/results')
        } catch (error) {
            console.error('Failed to end game:', error)
        }
    }

    if (isLoading) {
        return (
            <AppShell theme="golden" className="flex items-center justify-center">
                <GameLoadingSkeleton />
            </AppShell>
        )
    }

    if (alreadyCompleted) {
        return (
            <AppShell theme="golden">
                <PageTransition className="flex-1 flex items-center justify-center">
                    <div className="max-w-md w-full text-center">
                        <motion.div
                            className="text-6xl mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <Star size={64} className="mx-auto text-yellow-400" fill="currentColor" />
                        </motion.div>
                        <FadeIn delay={0.1}>
                            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Already Completed!</h1>
                            <p className="text-text-secondary mb-2">You've already done today's challenge</p>
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <Card variant="glass" className="p-6 mb-6">
                                <p className="text-text-secondary mb-1">Your Score</p>
                                <motion.p
                                    className="text-5xl font-bold text-yellow-400"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.4 }}
                                >
                                    {previousScore}
                                </motion.p>
                            </Card>
                            <p className="text-text-muted mb-6">Come back tomorrow for a new challenge!</p>
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/leaderboard')}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                    size="lg"
                                >
                                    View Leaderboard
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

    if (!currentQuestion) {
        return (
            <AppShell theme="golden" className="flex items-center justify-center">
                <p className="text-text-secondary">No questions available for today</p>
            </AppShell>
        )
    }

    return (
        <AppShell theme="golden">
            <PageTransition>
                {/* Daily Header */}
                <FadeIn delay={0}>
                    <Card variant="glass" className="p-4 mb-6 border-yellow-500/30 bg-gradient-to-r from-yellow-600/10 to-orange-600/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-yellow-400 text-sm font-bold flex items-center gap-1">
                                    <Star size={14} fill="currentColor" /> DAILY CHALLENGE
                                </p>
                                <p className="text-text-muted text-xs">{todayDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-text-secondary">Q {currentQuestionIndex + 1}/{questions.length}</p>
                            </div>
                        </div>
                    </Card>
                </FadeIn>

                {/* Score Bar */}
                <FadeIn delay={0.05}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-2xl font-bold text-yellow-400">Score: {score}</p>
                        </div>
                        <motion.div
                            className="flex items-center gap-1"
                            animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
                            key={streak}
                        >
                            <p className="text-2xl font-bold text-orange-400">{streak}</p>
                            <Flame size={20} className="text-orange-500" fill="currentColor" />
                        </motion.div>
                    </div>
                </FadeIn>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        <Card variant="glass" className="p-8 mb-6 border-yellow-500/10">
                            <motion.h2
                                className="text-3xl font-bold text-text-primary mb-4 text-center"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                How old is...
                            </motion.h2>
                            <motion.p
                                className="text-4xl font-bold text-yellow-400 text-center mb-6"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {currentQuestion.celebrity_name}?
                            </motion.p>

                            {/* Hints */}
                            <AnimatePresence>
                                {showHint && currentQuestion.hints?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6"
                                    >
                                        <Card variant="solid" className="p-4 bg-bg-surface-active">
                                            <div className="flex items-start gap-2">
                                                <Lightbulb size={16} className="text-yellow-500 mt-0.5" />
                                                <p className="text-text-secondary">{currentQuestion.hints[0]}</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!showHint && currentQuestion.hints?.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowHint(true)}
                                    className="w-full mb-6 border-yellow-500/30 text-yellow-200"
                                >
                                    <Lightbulb size={14} className="mr-1" /> Show Hint (-20% score)
                                </Button>
                            )}

                            {/* Input */}
                            <div className="mb-6">
                                <Input
                                    type="number"
                                    value={guess}
                                    onChange={(e) => setGuess(e.target.value)}
                                    placeholder="Enter age..."
                                    className="text-center text-2xl"
                                    min="0"
                                    max="120"
                                    disabled={!!feedback}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                            </div>

                            {/* Feedback */}
                            <AnimatePresence>
                                {feedback && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Card
                                            variant="solid"
                                            className={`p-4 mb-6 ${
                                                feedback.includes('Correct')
                                                    ? 'bg-green-500/10 border border-green-500/30'
                                                    : 'bg-red-500/10 border border-red-500/30'
                                            }`}
                                        >
                                            <p className="text-text-primary text-center">{feedback}</p>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            {!feedback && (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!guess}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                    size="lg"
                                    magnetic
                                >
                                    Submit Answer
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="w-full bg-bg-surface rounded-full h-2 overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </PageTransition>
        </AppShell>
    )
}
