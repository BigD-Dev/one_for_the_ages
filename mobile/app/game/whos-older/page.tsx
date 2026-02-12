'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CelebrityImage } from '@/components/ui/CelebrityImage'
import { ResultOverlay } from '@/components/ui/ResultOverlay'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { ArrowLeft } from 'lucide-react'

export default function WhosOlderPage() {
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

    const [selectedCelebrity, setSelectedCelebrity] = useState<'A' | 'B' | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showResult, setShowResult] = useState(false)
    const [lastResult, setLastResult] = useState<any>(null)

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const initGame = async () => {
            try {
                const session = await apiClient.startSession({ mode: 'WHO_OLDER' })
                startGame(session.id, 'WHO_OLDER', session.questions)
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

    const handleSelect = async (choice: 'A' | 'B') => {
        if (showResult) return

        setSelectedCelebrity(choice)

        try {
            const responseTimeMs = Date.now() - (useGameStore.getState().questionStartTime || 0)

            const result = await apiClient.submitAnswer(sessionId!, {
                question_template_id: currentQuestion.id,
                question_index: currentQuestionIndex,
                user_answer: { choice },
                response_time_ms: responseTimeMs,
                hints_used: 0,
            })

            if (result.is_correct) {
                await Haptics.impact({ style: ImpactStyle.Medium })
            } else {
                await Haptics.impact({ style: ImpactStyle.Heavy })
            }

            submitAnswer(result.is_correct, result.score_awarded)

            const correctChoice = result.correct_answer.choice
            const olderName = correctChoice === 'A' ? currentQuestion.celebrity_name_a! : currentQuestion.celebrity_name_b!
            const youngerName = correctChoice === 'A' ? currentQuestion.celebrity_name_b! : currentQuestion.celebrity_name_a!

            let feedbackText
            if (result.is_correct) {
                feedbackText = `Correct! ${olderName} is older than ${youngerName}.`
            } else {
                feedbackText = `${olderName} is actually older than ${youngerName}.`
            }

            setLastResult({
                ...result,
                feedbackText,
                celebrityName: olderName,
                userChoice: choice
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
            setSelectedCelebrity(null)
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

    const getCelebChoiceState = (choice: 'A' | 'B') => {
        if (!selectedCelebrity || !showResult) return 'default'

        if (selectedCelebrity === choice) {
            return lastResult?.is_correct ? 'correct' : 'incorrect'
        } else if (lastResult?.correct_answer?.choice === choice && !lastResult?.is_correct) {
            return 'correct'
        }

        return 'default'
    }

    const getChoiceCardClass = (choice: 'A' | 'B') => {
        const state = getCelebChoiceState(choice)

        if (showResult) {
            switch (state) {
                case 'correct':
                    return 'border-green-500'
                case 'incorrect':
                    return 'border-red-500'
                default:
                    return 'opacity-60'
            }
        }

        return 'cursor-pointer'
    }

    const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
        <AppShell>
            {/* Top HUD */}
            <header className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="text-text-muted"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Exit
                </Button>

                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className="text-xs text-text-muted uppercase tracking-wide">Score</p>
                        <p className="text-lg font-bold text-primary font-mono">{score}</p>
                    </div>
                    {streak > 0 && (
                        <div className="text-center">
                            <p className="text-xs text-text-muted uppercase tracking-wide">Streak</p>
                            <p className="text-lg font-bold text-gold font-mono">{streak}</p>
                        </div>
                    )}
                </div>
            </header>

            {/* Progress */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-text-muted uppercase tracking-wide font-mono">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                </div>
                <div className="w-full bg-surface rounded-sharp h-1 overflow-hidden">
                    <div
                        className="bg-primary h-1 rounded-sharp"
                        style={{ width: `${progressPct}%`, transition: 'width 300ms ease-out' }}
                    />
                </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2 mb-6">
                <h1 className="text-2xl font-bold text-text-primary font-serif">Who's Older?</h1>
                <p className="text-text-muted text-sm">Tap the older celebrity</p>
            </div>

            {/* Celebrity Comparison */}
            <div className="space-y-4">
                {/* Celebrity A */}
                <Card
                    className={`p-4 ${getChoiceCardClass('A')}`}
                    onClick={() => !showResult && handleSelect('A')}
                >
                    <div className="flex items-center gap-4">
                        <CelebrityImage
                            name={currentQuestion.celebrity_name_a!}
                            size="lg"
                        />
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-semibold text-text-primary font-serif">
                                {currentQuestion.celebrity_name_a!}
                            </h3>
                            <p className="text-sm text-text-muted">Tap to select</p>
                        </div>
                    </div>
                </Card>

                {/* VS Divider */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface border border-gold/30">
                        <span className="text-sm font-bold text-gold">VS</span>
                    </div>
                </div>

                {/* Celebrity B */}
                <Card
                    className={`p-4 ${getChoiceCardClass('B')}`}
                    onClick={() => !showResult && handleSelect('B')}
                >
                    <div className="flex items-center gap-4">
                        <CelebrityImage
                            name={currentQuestion.celebrity_name_b!}
                            size="lg"
                        />
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-semibold text-text-primary font-serif">
                                {currentQuestion.celebrity_name_b!}
                            </h3>
                            <p className="text-sm text-text-muted">Tap to select</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Result Overlay */}
            {lastResult && (
                <ResultOverlay
                    isVisible={showResult}
                    isCorrect={lastResult.is_correct}
                    celebrityName={lastResult.celebrityName}
                    correctAnswer={lastResult.correct_answer}
                    userAnswer={{ choice: lastResult.userChoice }}
                    scoreAwarded={lastResult.score_awarded}
                    feedbackText={lastResult.feedbackText}
                    onNext={handleNextQuestion}
                    mode="whos-older"
                />
            )}
        </AppShell>
    )
}
