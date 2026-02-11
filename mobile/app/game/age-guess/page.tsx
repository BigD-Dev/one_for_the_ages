'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

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

        // Start game session
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

            // Haptic feedback
            if (result.is_correct) {
                await Haptics.impact({ style: ImpactStyle.Medium })
            } else {
                await Haptics.impact({ style: ImpactStyle.Heavy })
            }

            // Update game state
            submitAnswer(result.is_correct, result.score_awarded)

            // Show feedback
            const correctAge = result.correct_answer.age
            const error = Math.abs(userGuess - correctAge)

            if (result.is_correct) {
                setFeedback(`🎉 Correct! ${currentQuestion.celebrity_name} is ${correctAge} years old. +${result.score_awarded} points!`)
            } else {
                setFeedback(`❌ Not quite! ${currentQuestion.celebrity_name} is ${correctAge} years old (you were ${error} years off)`)
            }

            // Move to next question after delay
            setTimeout(() => {
                if (isLastQuestion) {
                    handleEndGame()
                } else {
                    nextQuestion()
                    setGuess('')
                    setFeedback(null)
                    setShowHint(false)
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

            {/* Question Card */}
            <div className="bg-dark-800 rounded-2xl p-8 mb-6 shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                    How old is...
                </h2>
                <p className="text-4xl font-bold text-primary-400 text-center mb-6">
                    {currentQuestion.celebrity_name}?
                </p>

                {/* Hints */}
                {showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <div className="bg-dark-700 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-400 mb-2">💡 Hint:</p>
                        <p className="text-white">{currentQuestion.hints[0]}</p>
                    </div>
                )}

                {!showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-gray-300 py-2 px-4 rounded-lg mb-6 transition-colors"
                    >
                        💡 Show Hint
                    </button>
                )}

                {/* Input */}
                <div className="mb-6">
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter age..."
                        className="w-full bg-dark-700 text-white text-2xl text-center py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="0"
                        max="120"
                        disabled={!!feedback}
                    />
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`p-4 rounded-lg mb-6 ${feedback.includes('Correct')
                            ? 'bg-green-900/30 border border-green-500'
                            : 'bg-red-900/30 border border-red-500'
                        }`}>
                        <p className="text-white text-center">{feedback}</p>
                    </div>
                )}

                {/* Submit Button */}
                {!feedback && (
                    <button
                        onClick={handleSubmit}
                        disabled={!guess}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors text-xl"
                    >
                        Submit Answer
                    </button>
                )}
            </div>

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
