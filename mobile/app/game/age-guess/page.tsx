'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CelebrityImage } from '@/components/ui/CelebrityImage'
import { ResultOverlay } from '@/components/ui/ResultOverlay'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { Lightbulb, ArrowLeft } from 'lucide-react'

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

            {/* Celebrity Card */}
            <Card className="p-6 text-center space-y-4 mb-6">
                <div className="flex justify-center">
                    <CelebrityImage name={currentQuestion.celebrity_name!} size="xl" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg text-text-muted">
                        How old is
                    </h2>
                    <h1 className="text-2xl font-bold text-gold font-serif">
                        {currentQuestion.celebrity_name!}?
                    </h1>
                </div>

                {/* Hints */}
                {showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <Card className="p-3">
                        <div className="flex items-start gap-2">
                            <Lightbulb size={16} className="text-gold mt-0.5" />
                            <p className="text-sm text-text-muted">{currentQuestion.hints[0]}</p>
                        </div>
                    </Card>
                )}

                {!showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <Button
                        variant="secondary"
                        onClick={() => setShowHint(true)}
                        className="text-text-muted"
                    >
                        <Lightbulb size={14} className="mr-1" />
                        Show Hint
                    </Button>
                )}
            </Card>

            {/* Action Area */}
            <div className="space-y-4 pb-4">
                <Input
                    type="number"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="Enter age (0-120)"
                    className={`text-center text-xl ${inputError ? 'border-red-500' : ''}`}
                    min="0"
                    max="120"
                    disabled={showResult}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />

                <Button
                    onClick={handleSubmit}
                    disabled={!guess || showResult}
                    className="w-full"
                >
                    Confirm Age
                </Button>
            </div>

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
