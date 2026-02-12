'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { GameLayout } from '@/components/game/GameLayout'
import { ZodiacGrid } from '@/components/game/ZodiacGrid'
import { EnhancedCelebrityImage } from '@/components/ui/EnhancedCelebrityImage'
import { Card } from '@/components/ui/Card'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'

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
                setFeedback(`🎉 Correct! ${currentQuestion.celebrity_name!} is a ${signName}! +${result.score_awarded}`)
            } else {
                const correctSign = result.correct_answer?.sign || 'Unknown'
                setFeedback(`❌ ${currentQuestion.celebrity_name!} is actually a ${correctSign}`)
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
            <div className="flex items-center justify-center min-h-screen bg-bg-primary">
                <div className="text-center">
                    <ImagePlaceholder
                        width={48}
                        height={48}
                        variant="pulse"
                        className="mx-auto mb-lg rounded-full"
                    >
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </ImagePlaceholder>
                    <p className="text-text-secondary">Loading Reverse Mode...</p>
                </div>
            </div>
        )
    }

    return (
        <GameLayout
            gameMode={{
                name: 'Reverse Mode',
                icon: '🔮',
                theme: 'mystic'
            }}
            score={score}
            streak={streak}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={questions.length}
        >
            {/* Celebrity Card with Enhanced Image */}
            <Card variant="hero" className="mb-xl">
                <div className="p-xl text-center">
                    <h2 className="text-headline font-bold text-text-primary mb-md">
                        What's their star sign?
                    </h2>

                    <EnhancedCelebrityImage
                        name={currentQuestion.celebrity_name!}
                        size="hero"
                        className="mx-auto mb-lg"
                    >
                        {/* Celebrity name overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-lg">
                            <h3 className="text-title font-bold text-white text-shadow-sm">
                                {currentQuestion.celebrity_name!}
                            </h3>
                        </div>
                    </EnhancedCelebrityImage>

                    {/* Hints Section */}
                    {showHint && currentQuestion.hints?.length > 0 && (
                        <Card variant="elevated" className="mb-lg">
                            <div className="p-lg">
                                <div className="flex items-center gap-xs mb-sm">
                                    <span className="text-lg">💡</span>
                                    <span className="text-caption text-primary font-bold uppercase tracking-wide">
                                        Hint
                                    </span>
                                </div>
                                <p className="text-body text-text-secondary">
                                    {currentQuestion.hints[0]}
                                </p>
                            </div>
                        </Card>
                    )}

                    {!showHint && currentQuestion.hints?.length > 0 && (
                        <Card
                            variant="interactive"
                            onClick={() => setShowHint(true)}
                            className="mb-lg cursor-pointer"
                        >
                            <div className="p-lg text-center">
                                <span className="text-body text-text-secondary">
                                    💡 Show Hint
                                </span>
                            </div>
                        </Card>
                    )}
                </div>
            </Card>

            {/* Zodiac Grid */}
            <ZodiacGrid
                onSelect={handleSelect}
                selectedSign={selectedSign}
                disabled={!!feedback}
                feedback={feedback}
                variant="default"
                showElements
                className="mb-xl"
            />

            {/* Feedback */}
            {feedback && (
                <Card
                    variant="elevated"
                    className={`mb-xl ${
                        feedback.includes('Correct')
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-red-500 bg-red-500/10'
                    }`}
                >
                    <div className="p-lg text-center">
                        <p className="text-body text-text-primary">{feedback}</p>
                    </div>
                </Card>
            )}
        </GameLayout>
    )
}
