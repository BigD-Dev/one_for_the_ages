'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

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
                // Check if already completed
                const packStatus = await apiClient.getDailyPack(todayDate)
                if (packStatus.is_completed) {
                    setAlreadyCompleted(true)
                    setPreviousScore(packStatus.user_score)
                    setIsLoading(false)
                    return
                }

                // Start daily session
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
                setFeedback(`🎉 Correct! ${currentQuestion.celebrity_name} is ${correctAge}. +${result.score_awarded} pts!`)
            } else {
                setFeedback(`❌ ${currentQuestion.celebrity_name} is ${correctAge} (off by ${error})`)
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
            // Submit score to daily leaderboard
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
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading today's challenge...</p>
                </div>
            </div>
        )
    }

    if (alreadyCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6 flex items-center justify-center">
                <div className="max-w-md w-full text-center">
                    <div className="text-6xl mb-4">⭐</div>
                    <h1 className="text-3xl font-bold text-yellow-400 mb-4">Already Completed!</h1>
                    <p className="text-gray-400 mb-2">You've already done today's challenge</p>
                    <div className="bg-dark-800 rounded-2xl p-6 mb-6">
                        <p className="text-gray-400 mb-1">Your Score</p>
                        <p className="text-5xl font-bold text-yellow-400">{previousScore}</p>
                    </div>
                    <p className="text-gray-500 mb-6">Come back tomorrow for a new challenge!</p>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/leaderboard')}
                            className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 px-6 rounded-lg transition-all hover:scale-105"
                        >
                            🏆 View Leaderboard
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="block w-full bg-dark-700 hover:bg-dark-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                        >
                            🏠 Home
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <p className="text-gray-400">No questions available for today</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6">
            {/* Daily Header */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-yellow-400 text-sm font-bold">⭐ DAILY CHALLENGE</p>
                        <p className="text-gray-400 text-xs">{todayDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Q {currentQuestionIndex + 1}/{questions.length}</p>
                    </div>
                </div>
            </div>

            {/* Score Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-2xl font-bold text-yellow-400">Score: {score}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-orange-400">{streak} 🔥</p>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-dark-800 rounded-2xl p-8 mb-6 shadow-xl border border-yellow-500/10">
                <h2 className="text-3xl font-bold text-white mb-4 text-center">
                    How old is...
                </h2>
                <p className="text-4xl font-bold text-yellow-400 text-center mb-6">
                    {currentQuestion.celebrity_name}?
                </p>

                {/* Hints */}
                {showHint && currentQuestion.hints?.length > 0 && (
                    <div className="bg-dark-700 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-400 mb-2">💡 Hint:</p>
                        <p className="text-white">{currentQuestion.hints[0]}</p>
                    </div>
                )}

                {!showHint && currentQuestion.hints?.length > 0 && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-gray-300 py-2 px-4 rounded-lg mb-6 transition-colors"
                    >
                        💡 Show Hint (-20% score)
                    </button>
                )}

                {/* Input */}
                <div className="mb-6">
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter age..."
                        className="w-full bg-dark-700 text-white text-2xl text-center py-4 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        min="0"
                        max="120"
                        disabled={!!feedback}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
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

                {/* Submit */}
                {!feedback && (
                    <button
                        onClick={handleSubmit}
                        disabled={!guess}
                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-all text-xl"
                    >
                        Submit Answer
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>
        </div>
    )
}
