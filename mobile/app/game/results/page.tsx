'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { Share } from '@capacitor/share'

export default function ResultsPage() {
    const router = useRouter()
    const {
        score,
        streak,
        bestStreak,
        correctCount,
        questions,
        resetGame,
    } = useGameStore()

    const totalQuestions = questions.length
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0

    useEffect(() => {
        if (totalQuestions === 0) {
            router.push('/')
        }
    }, [totalQuestions, router])

    const handleShare = async () => {
        try {
            await Share.share({
                title: 'One for the Ages',
                text: `I just scored ${score} points with a ${bestStreak} streak on One for the Ages! Can you beat that? 🎮`,
                url: 'https://ofta.app', // Replace with actual URL
            })
        } catch (error) {
            console.error('Failed to share:', error)
        }
    }

    const handlePlayAgain = () => {
        resetGame()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6 flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-primary-400 mb-2">
                        Game Over!
                    </h1>
                    <p className="text-gray-400">Here's how you did</p>
                </div>

                {/* Stats Card */}
                <div className="bg-dark-800 rounded-2xl p-8 mb-6 shadow-xl">
                    {/* Score */}
                    <div className="text-center mb-8">
                        <p className="text-gray-400 mb-2">Final Score</p>
                        <p className="text-6xl font-bold text-primary-400">{score}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-dark-700 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-1">Accuracy</p>
                            <p className="text-2xl font-bold text-white">{accuracy.toFixed(0)}%</p>
                        </div>
                        <div className="bg-dark-700 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-1">Correct</p>
                            <p className="text-2xl font-bold text-green-400">{correctCount}/{totalQuestions}</p>
                        </div>
                        <div className="bg-dark-700 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-1">Best Streak</p>
                            <p className="text-2xl font-bold text-orange-400">{bestStreak} 🔥</p>
                        </div>
                        <div className="bg-dark-700 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-1">Current Streak</p>
                            <p className="text-2xl font-bold text-orange-400">{streak} 🔥</p>
                        </div>
                    </div>

                    {/* Performance Message */}
                    <div className="bg-dark-700 rounded-lg p-4 text-center">
                        <p className="text-white font-bold">
                            {accuracy >= 90 ? '🌟 Outstanding!' :
                                accuracy >= 75 ? '🎉 Great job!' :
                                    accuracy >= 60 ? '👍 Good effort!' :
                                        accuracy >= 40 ? '💪 Keep practicing!' :
                                            '🎯 Try again!'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={handleShare}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        📤 Share Results
                    </button>

                    <button
                        onClick={handlePlayAgain}
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        🎮 Play Again
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-dark-700 hover:bg-dark-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                    >
                        🏠 Home
                    </button>
                </div>
            </div>
        </div>
    )
}
