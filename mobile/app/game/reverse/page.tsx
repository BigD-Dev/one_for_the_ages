'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { GameLayout } from '@/components/game/GameLayout'
import { ZodiacGrid } from '@/components/game/ZodiacGrid'
import { CelebrityImage } from '@/components/ui/CelebrityImage'
import { Card } from '@/components/ui/Card'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { AppShell } from '@/components/ui/Layout'
import { Lightbulb } from 'lucide-react'

export default function ReverseModePage() {
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

    const [selectedSign, setSelectedSign] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showHint, setShowHint] = useState(false)

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const initGame = async () => {
            try {
                const session = await apiClient.startSession({ mode: 'REVERSE_SIGN' })
                startGame(session.id, 'REVERSE_SIGN', session.questions)
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

    const handleSelect = async (signName: string) => {
        if (feedback || !currentQuestion) return
        setSelectedSign(signName)

        try {
            const responseTimeMs = Date.now() - (useGameStore.getState().questionStartTime || 0)

            const result = await apiClient.submitAnswer(sessionId!, {
                question_template_id: currentQuestion.id,
                question_index: currentQuestionIndex,
                user_answer: { sign: signName },
                response_time_ms: responseTimeMs,
                hints_used: showHint ? 1 : 0,
            })

            submitAnswer(result.is_correct, result.score_awarded)

            if (result.is_correct) {
                setFeedback(`Correct! ${currentQuestion.celebrity_name!} is a ${signName}! +${result.score_awarded}`)
            } else {
                const correctSign = result.correct_answer?.sign || 'Unknown'
                setFeedback(`${currentQuestion.celebrity_name!} is actually a ${correctSign}`)
            }

            setTimeout(() => {
                if (isLastQuestion) {
                    handleEndGame()
                } else {
                    nextQuestion()
                    setSelectedSign(null)
                    setFeedback(null)
                    setShowHint(false)
                }
            }, 2000)
        } catch (error) {
            console.error('Failed to submit:', error)
            setFeedback('Failed to submit. Try again.')
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
        <GameLayout
            gameMode={{
                name: 'Reverse Mode',
                icon: '♈',
            }}
            score={score}
            streak={streak}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
        >
            {/* Celebrity Card */}
            <Card className="p-6 text-center mb-6">
                <h2 className="text-lg text-text-muted mb-4">
                    What's their star sign?
                </h2>

                <div className="flex justify-center mb-4">
                    <CelebrityImage
                        name={currentQuestion.celebrity_name!}
                        size="xl"
                    />
                </div>

                <h3 className="text-2xl font-bold text-gold font-serif">
                    {currentQuestion.celebrity_name!}
                </h3>

                {/* Hints */}
                {showHint && currentQuestion.hints?.length > 0 && (
                    <Card className="p-4 mt-4 text-left">
                        <div className="flex items-start gap-2">
                            <Lightbulb size={16} className="text-gold mt-0.5" />
                            <p className="text-sm text-text-muted">{currentQuestion.hints[0]}</p>
                        </div>
                    </Card>
                )}

                {!showHint && currentQuestion.hints?.length > 0 && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="mt-4 text-sm text-text-muted underline underline-offset-4 active:opacity-80 transition-opacity duration-150"
                    >
                        Show Hint
                    </button>
                )}
            </Card>

            {/* Zodiac Grid */}
            <ZodiacGrid
                onSelect={handleSelect}
                selectedSign={selectedSign}
                disabled={!!feedback}
                feedback={feedback}
                className="mb-6"
            />

            {/* Feedback */}
            {feedback && (
                <div
                    className={`p-4 rounded-sharp border text-center animate-fade-in ${
                        feedback.includes('Correct')
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                    }`}
                >
                    <p>{feedback}</p>
                </div>
            )}
        </GameLayout>
    )
}
