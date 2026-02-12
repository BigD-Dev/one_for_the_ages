'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CelebrityImage } from '@/components/ui/CelebrityImage'
import { ResultOverlay } from '@/components/ui/ResultOverlay'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { PageTransition, FadeIn } from '@/components/ui/PageTransition'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Flame, Lightbulb, ArrowLeft } from 'lucide-react'

export default function AgeGuessPage() {
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
        resetGame,
    } = useGameStore()

    const [guess, setGuess] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [showHint, setShowHint] = useState(false)
    const [showResult, setShowResult] = useState(false)
    const [lastResult, setLastResult] = useState<any>(null)
    const [inputError, setInputError] = useState(false)

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const initGame = async () => {
            try {
                const session = await apiClient.startSession({ mode: 'AGE_GUESS' })
                startGame(session.id, 'AGE_GUESS', session.questions)
                setIsLoading(false)
            } catch (error) {
                console.error('Failed to start game:', error)
                router.push('/')
            }
        }

        if (!sessionId) {
            initGame()
        } else {
            setIsLoading(false)
        }
    }, [isAuthenticated, sessionId, router, startGame])

    const handleSubmit = async () => {
        if (!guess || !currentQuestion) {
            setInputError(true)
            setTimeout(() => setInputError(false), 600)
            return
        }

        const userGuess = parseInt(guess, 10)
        if (isNaN(userGuess) || userGuess < 0 || userGuess > 120) {
            setInputError(true)
            setTimeout(() => setInputError(false), 600)
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

            // Haptic feedback
            if (result.is_correct) {
                await Haptics.impact({ style: ImpactStyle.Medium })
            } else {
                await Haptics.impact({ style: ImpactStyle.Heavy })
            }

            submitAnswer(result.is_correct, result.score_awarded)

            const correctAge = result.correct_answer.age
            const error = Math.abs(userGuess - correctAge)

            let feedbackText
            if (result.is_correct) {
                feedbackText = `Perfect! ${currentQuestion.celebrity_name!} is ${correctAge} years old.`
            } else {
                feedbackText = `${currentQuestion.celebrity_name!} is ${correctAge} years old. You were ${error} year${error !== 1 ? 's' : ''} off.`
            }

            setLastResult({
                ...result,
                userGuess,
                feedbackText,
                celebrityName: currentQuestion.celebrity_name!
            })
            setShowResult(true)

        } catch (error) {
            console.error('Failed to submit answer:', error)
        }
    }

    const handleNextQuestion = () => {
        setShowResult(false)
        if (isLastQuestion) {
            handleEndGame()
        } else {
            nextQuestion()
            setGuess('')
            setShowHint(false)
        }
    }

    const handleEndGame = async () => {
        try {
            await apiClient.endSession(sessionId!)
            endGame()
            router.push('/game/results')
        } catch (error) {
            console.error('Failed to end game:', error)
        }
    }

    if (isLoading || !currentQuestion) {
        return (
            <AppShell className="flex items-center justify-center">
                <GameLoadingSkeleton />
            </AppShell>
        )
    }

    return (
        <AppShell>
            <PageTransition>
                {/* Top HUD */}
                <FadeIn delay={0}>
                    <header className="flex justify-between items-center mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/')}
                            className="text-text-muted hover:text-text-primary"
                        >
                            <ArrowLeft size={18} className="mr-1" />
                            Exit
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-xs text-text-muted uppercase tracking-wide">Score</p>
                                <p className="text-lg font-bold text-primary">{score}</p>
                            </div>
                            <motion.div
                                className="flex items-center gap-1 px-2 py-1 bg-bg-surface rounded-full border border-border-subtle"
                                animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
                                transition={{ duration: 0.3 }}
                                key={streak}
                            >
                                <Flame size={14} className="text-orange-500" fill="currentColor" />
                                <span className="text-sm font-bold text-orange-100">{streak}</span>
                            </motion.div>
                        </div>
                    </header>
                </FadeIn>

                {/* Progress */}
                <FadeIn delay={0.05}>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-text-muted uppercase tracking-wide">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                        </div>
                        <div className="w-full bg-bg-surface rounded-full h-1 overflow-hidden">
                            <motion.div
                                className="bg-primary h-1 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </FadeIn>

                {/* Game Stage */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        className="flex-1 flex flex-col justify-center space-y-6"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Celebrity Card */}
                        <Card variant="glass" className="p-6 text-center space-y-4">
                            <motion.div
                                className="flex justify-center"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            >
                                <CelebrityImage name={currentQuestion.celebrity_name!} size="xl" />
                            </motion.div>

                            <div className="space-y-2">
                                <motion.h2
                                    className="text-lg font-medium text-text-secondary"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    How old is
                                </motion.h2>
                                <motion.h1
                                    className="text-2xl font-bold gradient-text-animated"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {currentQuestion.celebrity_name!}?
                                </motion.h1>
                            </div>

                            {/* Hints */}
                            <AnimatePresence>
                                {showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Card className="p-3 bg-bg-surface-active border-border-active">
                                            <div className="flex items-start gap-2">
                                                <Lightbulb size={16} className="text-yellow-500 mt-0.5" />
                                                <p className="text-sm text-text-secondary">{currentQuestion.hints[0]}</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowHint(true)}
                                    className="border-border-subtle text-text-muted"
                                >
                                    <Lightbulb size={14} className="mr-1" />
                                    Show Hint
                                </Button>
                            )}
                        </Card>
                    </motion.div>
                </AnimatePresence>

                {/* Action Area */}
                <FadeIn delay={0.25}>
                    <div className="space-y-4 pb-4">
                        <div className="space-y-3">
                            <Input
                                type="number"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                placeholder="Enter age (0-120)"
                                className={`text-center text-xl ${inputError ? 'border-red-500 animate-shake' : ''}`}
                                min="0"
                                max="120"
                                disabled={showResult}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />

                            <Button
                                onClick={handleSubmit}
                                disabled={!guess || showResult}
                                className="w-full bg-gradient-to-r from-primary-from to-primary-to"
                                size="lg"
                                magnetic
                            >
                                Submit Answer
                            </Button>
                        </div>
                    </div>
                </FadeIn>
            </PageTransition>

            {/* Result Overlay */}
            {lastResult && (
                <ResultOverlay
                    isVisible={showResult}
                    isCorrect={lastResult.is_correct}
                    celebrityName={lastResult.celebrityName}
                    correctAnswer={lastResult.correct_answer}
                    userAnswer={{ age: lastResult.userGuess }}
                    scoreAwarded={lastResult.score_awarded}
                    feedbackText={lastResult.feedbackText}
                    onNext={handleNextQuestion}
                    mode="age-guess"
                />
            )}
        </AppShell>
    )
}
