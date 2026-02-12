'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface GameLayoutProps {
    children: ReactNode
    gameMode: {
        name: string
        icon: string
    }
    score: number
    streak: number
    currentQuestion: number
    totalQuestions: number
    onBack?: () => void
    className?: string
}

export const GameLayout = ({
    children,
    gameMode,
    score,
    streak,
    currentQuestion,
    totalQuestions,
    onBack,
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

    const percentage = (currentQuestion / totalQuestions) * 100

    return (
        <div className={`min-h-screen bg-canvas ${className}`}>
            {/* Header */}
            <header className="sticky top-0 z-10 bg-canvas border-b border-border-subtle">
                <div className="px-5 py-3">
                    <div className="flex items-center justify-between">
                        {/* Back + Mode */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-sharp bg-surface border border-border-subtle active:opacity-80 transition-opacity duration-150"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-text-primary" />
                            </button>
                            <span className="text-sm font-medium text-text-muted uppercase tracking-wide">
                                {gameMode.name}
                            </span>
                        </div>

                        {/* Question counter */}
                        <span className="text-sm text-text-muted font-mono">
                            Q.{currentQuestion}/{totalQuestions}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 w-full bg-surface rounded-sharp h-1 overflow-hidden">
                        <div
                            className="bg-primary h-1 rounded-sharp"
                            style={{ width: `${percentage}%`, transition: 'width 300ms ease-out' }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-5 py-5">
                {children}
            </main>

            <div className="h-8" />
        </div>
    )
}
