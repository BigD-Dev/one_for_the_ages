'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Lightbulb, Star } from 'lucide-react'

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
            <AppShell className="flex items-center justify-center">
                <GameLoadingSkeleton />
            </AppShell>
        )
    }

    if (alreadyCompleted) {
        return (
            <AppShell className="flex items-center justify-center">
                <div className="max-w-md w-full text-center space-y-6">
                    <Star size={48} className="mx-auto text-gold" />
                    <h1 className="font-serif text-2xl text-gold">Already Completed!</h1>
                    <p className="text-text-muted">You've already done today's challenge</p>
                    <Card className="p-6">
                        <p className="text-text-muted mb-1">Your Score</p>
                        <p className="text-5xl font-bold text-gold font-serif">{previousScore}</p>
                    </Card>
                    <p className="text-text-muted text-sm">Come back tomorrow for a new challenge!</p>
                    <div className="space-y-3">
                        <Button onClick={() => router.push('/leaderboard')} className="w-full">
                            View Leaderboard
                        </Button>
                        <Button variant="secondary" onClick={() => router.push('/')} className="w-full">
                            Home
                        </Button>
                    </div>
                </div>
            </AppShell>
        )
    }

    if (!currentQuestion) {
        return (
            <AppShell className="flex items-center justify-center">
                <p className="text-text-muted">No questions available for today</p>
            </AppShell>
        )
    }

    const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
        <AppShell>
            {/* Daily Header */}
            <Card className="p-4 mb-6 border-gold/20">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gold text-sm font-bold flex items-center gap-1">
                            <Star size={14} /> DAILY CHALLENGE
                        </p>
                        <p className="text-text-muted text-xs">{todayDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-muted font-mono">Q.{currentQuestionIndex + 1}/{questions.length}</p>
                    </div>
                </div>
            </Card>

            {/* Score Bar */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-2xl font-bold text-primary font-mono">Score: {score}</p>
                {streak > 0 && (
                    <p className="text-xl font-bold text-gold font-mono">{streak} streak</p>
                )}
            </div>

            {/* Question Card */}
            <Card className="p-8 mb-6">
                <h2 className="text-xl text-text-muted mb-2 text-center">
                    How old is...
                </h2>
                <p className="text-3xl font-bold text-gold text-center font-serif mb-6">
                    {currentQuestion.celebrity_name}?
                </p>

                {/* Hints */}
                {showHint && currentQuestion.hints?.length > 0 && (
                    <Card className="p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <Lightbulb size={16} className="text-gold mt-0.5" />
                            <p className="text-text-muted text-sm">{currentQuestion.hints[0]}</p>
                        </div>
                    </Card>
                )}

                {!showHint && currentQuestion.hints?.length > 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => setShowHint(true)}
                        className="w-full mb-6 text-text-muted"
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
                {feedback && (
                    <div
                        className={`p-4 mb-6 rounded-sharp border text-center animate-fade-in ${
                            feedback.includes('Correct')
                                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                        }`}
                    >
                        <p>{feedback}</p>
                    </div>
                )}

                {/* Submit */}
                {!feedback && (
                    <Button
                        onClick={handleSubmit}
                        disabled={!guess}
                        className="w-full"
                    >
                        Submit Answer
                    </Button>
                )}
            </Card>

            {/* Progress Bar */}
            <div className="w-full bg-surface rounded-sharp h-1 overflow-hidden">
                <div
                    className="bg-primary h-1 rounded-sharp"
                    style={{ width: `${progressPct}%`, transition: 'width 300ms ease-out' }}
                />
            </div>
        </AppShell>
    )
}
