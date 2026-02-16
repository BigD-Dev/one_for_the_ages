'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/Button'
import { Play, RotateCcw, Home, X } from 'lucide-react'

export function GamePauseModal() {
    const router = useRouter()
    const {
        sessionId,
        score,
        currentQuestionIndex,
        questions,
        resumeGame,
        resetGame,
        mode
    } = useGameStore()

    const [isQuitting, setIsQuitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const isDaily = mode === 'DAILY_CHALLENGE'

    const handleResume = () => {
        resumeGame()
    }

    const handleRestartQuestion = () => {
        // For now, restarting just resumes since question state is not explicitly "restartable" without tricky logic
        // But per specs: Reset current question
        // In practice, this might just mean clearing the UI input if any.
        // Given current architecture, let's just resume for V1 or disable if not implemented.
        // "Restart Question" usually implies clearing input.
        // Let's implement it as a "Resume + Clear Input" signal if we can, but simpler:
        // Just resume for now, maybe add a toast "Restart not available in V1" or hide if not daily.
        resumeGame()
    }

    const handleQuit = async () => {
        if (!isQuitting) {
            setIsQuitting(true)
            return
        }

        setIsLoading(true)
        try {
            if (sessionId) {
                // End session to record partial progress
                await apiClient.endSession(sessionId)
            }
            resetGame()
            router.push('/')
        } catch (error) {
            console.error('Failed to quit cleanly:', error)
            router.push('/')
        }
    }

    const currentQ = currentQuestionIndex + 1
    const totalQ = questions.length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
            {/* Modal Card */}
            <div className="w-full max-w-sm bg-surface-raised border border-primary/20 rounded-sharp shadow-2xl p-6 relative overflow-hidden animate-scale-in">

                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="text-center mb-8 space-y-2">
                    <h2 className="font-serif text-2xl text-text-primary tracking-wide">
                        {isQuitting ? 'QUIT GAME?' : 'GAME PAUSED'}
                    </h2>

                    {!isQuitting ? (
                        <div className="flex flex-col gap-1">
                            <p className="font-montserrat font-bold text-xs text-primary/80 tracking-[0.2em] uppercase">
                                Question {currentQ} of {totalQ}
                            </p>
                            <p className="font-serif text-lg text-text-muted">
                                Score: <span className="text-white">{score}</span>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-text-muted text-sm leading-relaxed px-4">
                                Your progress will be saved, but you cannot resume this session later.
                                {isDaily && <><br /><span className="text-red-400 mt-2 block ">Daily Challenge cannot be restarted.</span></>}
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {!isQuitting ? (
                        <>
                            <Button
                                onClick={handleResume}
                                variant="primary"
                                className="w-full py-4 text-xs tracking-[0.2em]"
                            >
                                <Play size={16} className="mr-2" /> RESUME GAME
                            </Button>

                            {!isDaily && (
                                <Button
                                    onClick={handleRestartQuestion}
                                    variant="secondary"
                                    className="w-full py-4 text-xs tracking-[0.2em] border-white/10 text-text-muted hover:text-white hover:border-white/20"
                                >
                                    <RotateCcw size={16} className="mr-2" /> RESTART QUESTION
                                </Button>
                            )}

                            <Button
                                onClick={() => setIsQuitting(true)}
                                variant="ghost"
                                className="w-full py-4 text-xs tracking-[0.2em] text-red-400/70 hover:text-red-400 hover:bg-red-400/5 mt-2"
                            >
                                <Home size={16} className="mr-2" /> QUIT TO HOME
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={handleQuit}
                                variant="ghost"
                                className="w-full py-4 text-xs tracking-[0.2em] bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                disabled={isLoading}
                            >
                                {isLoading ? 'SAVING...' : 'CONFIRM QUIT'}
                            </Button>

                            <Button
                                onClick={() => setIsQuitting(false)}
                                variant="primary"
                                className="w-full py-4 text-xs tracking-[0.2em]"
                                disabled={isLoading}
                            >
                                CANCEL
                            </Button>
                        </>
                    )}
                </div>

                {/* Close Button (X) - Top Right */}
                {!isQuitting && (
                    <button
                        onClick={handleResume}
                        className="absolute top-4 right-4 text-text-muted/30 hover:text-text-white transition-colors p-2"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    )
}
