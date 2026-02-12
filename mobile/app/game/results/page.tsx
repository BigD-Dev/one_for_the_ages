'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { Share } from '@capacitor/share'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

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
                text: `I just scored ${score} points with a ${bestStreak} streak on One for the Ages! Can you beat that?`,
                url: 'https://ofta.app',
            })
        } catch (error) {
            console.error('Failed to share:', error)
        }
    }

    const handlePlayAgain = () => {
        resetGame()
        router.push('/')
    }

    const getPerformanceLabel = () => {
        if (accuracy === 100) return 'PERFECT SCORE'
        if (accuracy >= 90) return 'OUTSTANDING'
        if (accuracy >= 75) return 'GREAT JOB'
        if (accuracy >= 60) return 'GOOD EFFORT'
        if (accuracy >= 40) return 'KEEP PRACTICING'
        return 'TRY AGAIN'
    }

    return (
        <AppShell className="flex items-center justify-center gold-dust">
            <div className="max-w-md w-full space-y-6">
                {/* Header */}
                <div className="text-center animate-fade-in">
                    <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-sans">
                        {getPerformanceLabel()}
                    </p>
                    <p className="text-6xl font-bold text-gold font-serif">
                        {score}
                    </p>
                    <p className="text-sm text-gold mt-1 font-mono">
                        +{score} XP
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-text-primary font-mono">
                            {Math.round(accuracy)}%
                        </p>
                        <p className="text-xs text-text-muted uppercase tracking-wide mt-1">Accuracy</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-400 font-mono">
                            {correctCount}/{totalQuestions}
                        </p>
                        <p className="text-xs text-text-muted uppercase tracking-wide mt-1">Correct</p>
                    </Card>
                    <Card className="p-4 text-center">
                        <p className="text-2xl font-bold text-gold font-mono">
                            {bestStreak}
                        </p>
                        <p className="text-xs text-text-muted uppercase tracking-wide mt-1">Best Streak</p>
                    </Card>
                </div>

                {/* Actions */}
                <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <Button
                        onClick={handleShare}
                        variant="secondary"
                        className="w-full"
                    >
                        Share Results
                    </Button>

                    <Button
                        onClick={handlePlayAgain}
                        className="w-full"
                    >
                        Play Again
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="w-full text-text-muted"
                    >
                        Home
                    </Button>
                </div>
            </div>
        </AppShell>
    )
}
