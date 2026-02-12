'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../ui/Card'

interface GameLayoutProps {
    children: ReactNode
    gameMode: {
        name: string
        icon: string
        theme?: 'default' | 'mystic' | 'golden'
    }
    score: number
    streak: number
    currentQuestion: number
    totalQuestions: number
    onBack?: () => void
    headerActions?: ReactNode
    className?: string
}

interface ProgressDisplayProps {
    current: number
    total: number
    score: number
    className?: string
}

interface ScoreDisplayProps {
    score: number
    streak: number
    className?: string
}

const ProgressDisplay = ({ current, total, score, className = '' }: ProgressDisplayProps) => {
    const percentage = (current / total) * 100

    return (
        <div className={`flex items-center gap-sm ${className}`}>
            <div className="flex items-center gap-2xs">
                <span className="text-body-large font-bold text-text-primary">
                    {current}
                </span>
                <span className="text-caption text-text-secondary">
                    /{total}
                </span>
                <span className="text-body font-bold text-primary">
                    {score}
                </span>
            </div>
            <div className="flex-1 min-w-[80px]">
                <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-primary-from to-primary-to h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

const ScoreDisplay = ({ score, streak, className = '' }: ScoreDisplayProps) => {
    return (
        <div className={`flex items-center gap-md ${className}`}>
            <div className="text-center">
                <div className="text-title font-bold text-primary">
                    {score.toLocaleString()}
                </div>
                <div className="text-overline text-text-secondary uppercase tracking-wider">
                    Score
                </div>
            </div>
            {streak > 0 && (
                <div className="text-center">
                    <div className="text-title font-bold text-orange-400 flex items-center gap-1">
                        {streak}
                        <span className="text-lg">🔥</span>
                    </div>
                    <div className="text-overline text-text-secondary uppercase tracking-wider">
                        Streak
                    </div>
                </div>
            )}
        </div>
    )
}

export const GameLayout = ({
    children,
    gameMode,
    score,
    streak,
    currentQuestion,
    totalQuestions,
    onBack,
    headerActions,
    className = ''
}: GameLayoutProps) => {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            router.back()
        }
    }

    const themeClasses = {
        default: 'bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary',
        mystic: 'bg-gradient-to-b from-purple-950/20 via-bg-primary to-bg-secondary',
        golden: 'bg-gradient-to-b from-yellow-950/20 via-bg-primary to-bg-secondary'
    }

    return (
        <div className={`min-h-screen ${themeClasses[gameMode.theme || 'default']} ${className}`}>
            {/* Header */}
            <header className="sticky top-0 z-10 backdrop-blur-lg bg-bg-primary/80 border-b border-border-subtle">
                <div className="px-lg py-md">
                    <div className="flex items-center justify-between mb-md">
                        {/* Back button and game mode */}
                        <div className="flex items-center gap-md">
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-xl bg-bg-surface border border-border-subtle hover:bg-bg-surface-active transition-colors"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-text-primary" />
                            </button>
                            <div>
                                <div className="flex items-center gap-xs mb-1">
                                    <span className="text-lg">{gameMode.icon}</span>
                                    <span className="text-body-large font-bold text-primary uppercase tracking-wide">
                                        {gameMode.name}
                                    </span>
                                </div>
                                <div className="text-overline text-text-secondary uppercase tracking-wider">
                                    Question {currentQuestion}/{totalQuestions}
                                </div>
                            </div>
                        </div>

                        {/* Header actions */}
                        <div className="flex items-center gap-md">
                            {headerActions}
                        </div>
                    </div>

                    {/* Progress and Score Row */}
                    <div className="flex items-center justify-between">
                        <ProgressDisplay
                            current={currentQuestion}
                            total={totalQuestions}
                            score={score}
                            className="flex-1 mr-lg"
                        />
                        <ScoreDisplay
                            score={score}
                            streak={streak}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-lg py-lg">
                {children}
            </main>

            {/* Safe area at bottom for mobile */}
            <div className="h-8" />
        </div>
    )
}

export { ProgressDisplay, ScoreDisplay }