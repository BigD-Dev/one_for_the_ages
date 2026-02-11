'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

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
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

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
        if (feedback) return // Already answered

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

            // Haptic feedback
            if (result.is_correct) {
                await Haptics.impact({ style: ImpactStyle.Medium })
            } else {
                await Haptics.impact({ style: ImpactStyle.Heavy })
            }

            // Update game state
            submitAnswer(result.is_correct, result.score_awarded)

            // Show feedback
            const correctChoice = result.correct_answer.choice
            const olderName = correctChoice === 'A' ? currentQuestion.celebrity_name_a : currentQuestion.celebrity_name_b

            if (result.is_correct) {
                setFeedback(`🎉 Correct! ${olderName} is older. +${result.score_awarded} points!`)
            } else {
                setFeedback(`❌ Not quite! ${olderName} is actually older.`)
            }

            // Move to next question after delay
            setTimeout(() => {
                if (isLastQuestion) {
                    handleEndGame()
                } else {
                    nextQuestion()
                    setSelectedCelebrity(null)
                    setFeedback(null)
                }
            }, 2500)

        } catch (error) {
            console.error('Failed to submit answer:', error)
            setFeedback('Failed to submit answer. Please try again.')
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
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading game...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-sm text-gray-400">Question {currentQuestionIndex + 1}/{questions.length}</p>
                    <p className="text-2xl font-bold text-primary-400">Score: {score}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Streak</p>
                    <p className="text-2xl font-bold text-orange-400">{streak} 🔥</p>
                </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    Who's Older?
                </h2>
                <p className="text-gray-400">Tap the older celebrity</p>
            </div>

            {/* Celebrity Cards */}
            <div className="space-y-4 mb-6">
                {/* Celebrity A */}
                <button
                    onClick={() => handleSelect('A')}
                    disabled={!!feedback}
                    className={`w-full p-8 rounded-2xl transition-all ${selectedCelebrity === 'A'
                            ? feedback?.includes('Correct')
                                ? 'bg-green-600 border-2 border-green-400'
                                : 'bg-red-600 border-2 border-red-400'
                            : 'bg-dark-800 hover:bg-dark-700 border-2 border-transparent'
                        } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <p className="text-3xl font-bold text-white">
                        {currentQuestion.celebrity_name_a}
                    </p>
                </button>

                {/* VS Divider */}
                <div className="text-center">
                    <span className="text-2xl font-bold text-gray-500">VS</span>
                </div>

                {/* Celebrity B */}
                <button
                    onClick={() => handleSelect('B')}
                    disabled={!!feedback}
                    className={`w-full p-8 rounded-2xl transition-all ${selectedCelebrity === 'B'
                            ? feedback?.includes('Correct')
                                ? 'bg-green-600 border-2 border-green-400'
                                : 'bg-red-600 border-2 border-red-400'
                            : 'bg-dark-800 hover:bg-dark-700 border-2 border-transparent'
                        } ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <p className="text-3xl font-bold text-white">
                        {currentQuestion.celebrity_name_b}
                    </p>
                </button>
            </div>

            {/* Feedback */}
            {feedback && (
                <div className={`p-4 rounded-lg mb-6 ${feedback.includes('Correct')
                        ? 'bg-green-900/30 border border-green-500'
                        : 'bg-red-900/30 border border-red-500'
                    }`}>
                    <p className="text-white text-center text-lg">{feedback}</p>
                </div>
            )}

            {/* Progress Bar */}
            <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>
        </div>
    )
}
