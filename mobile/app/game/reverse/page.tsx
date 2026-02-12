'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'

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

    const starSigns = [
        { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
        { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
        { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
        { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
        { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
        { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
        { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
        { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
        { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
        { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
        { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
        { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' },
    ]

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
                setFeedback(`🎉 Correct! ${currentQuestion.celebrity_name} is a ${signName}! +${result.score_awarded}`)
            } else {
                const correctSign = result.correct_answer?.sign || 'Unknown'
                setFeedback(`❌ ${currentQuestion.celebrity_name} is actually a ${correctSign}`)
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
            <div className="flex items-center justify-center min-h-screen bg-dark-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading Reverse Mode...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-purple-950/30 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-purple-400 text-sm font-bold">🔮 REVERSE MODE</p>
                    <p className="text-xs text-gray-400">Q {currentQuestionIndex + 1}/{questions.length}</p>
                </div>
                <div className="flex gap-6">
                    <div>
                        <p className="text-2xl font-bold text-purple-400">{score}</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-orange-400">{streak} 🔥</p>
                    </div>
                </div>
            </div>

            {/* Question */}
            <div className="bg-dark-800 rounded-2xl p-6 mb-6 shadow-xl border border-purple-500/20">
                <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    What's their star sign?
                </h2>
                <p className="text-3xl font-bold text-purple-400 text-center mb-4">
                    {currentQuestion.celebrity_name}
                </p>

                {/* Hints */}
                {showHint && currentQuestion.hints?.length > 0 && (
                    <div className="bg-dark-700 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-400">💡 {currentQuestion.hints[0]}</p>
                    </div>
                )}

                {!showHint && currentQuestion.hints?.length > 0 && (
                    <button
                        onClick={() => setShowHint(true)}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-gray-300 py-2 px-4 rounded-lg mb-4 text-sm transition-colors"
                    >
                        💡 Show Hint
                    </button>
                )}
            </div>

            {/* Star Signs Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {starSigns.map((sign) => {
                    let btnClass = 'bg-dark-800 hover:bg-dark-700 border-dark-600'

                    if (feedback && selectedSign === sign.name) {
                        btnClass = feedback.includes('Correct')
                            ? 'bg-green-900/50 border-green-500'
                            : 'bg-red-900/50 border-red-500'
                    }

                    return (
                        <button
                            key={sign.name}
                            onClick={() => handleSelect(sign.name)}
                            disabled={!!feedback}
                            className={`${btnClass} border rounded-xl p-3 text-center transition-all disabled:opacity-70`}
                        >
                            <p className="text-2xl mb-1">{sign.emoji}</p>
                            <p className="text-white text-xs font-bold">{sign.name}</p>
                            <p className="text-gray-500 text-[10px]">{sign.dates}</p>
                        </button>
                    )
                })}
            </div>

            {/* Feedback */}
            {feedback && (
                <div className={`p-4 rounded-lg mb-4 ${feedback.includes('Correct')
                        ? 'bg-green-900/30 border border-green-500'
                        : 'bg-red-900/30 border border-red-500'
                    }`}>
                    <p className="text-white text-center">{feedback}</p>
                </div>
            )}

            {/* Progress */}
            <div className="w-full bg-dark-700 rounded-full h-2">
                <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
            </div>
        </div>
    )
}
