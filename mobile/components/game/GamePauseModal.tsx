'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/useGameStore'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/Button'
import { Play, Home, X, Settings, Flame } from 'lucide-react'

export function GamePauseModal() {
    const router = useRouter()
    const {
        sessionId,
        score,
        streak,
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

    const handleSettings = () => {
        router.push('/settings')
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
            logger.error('Failed to quit cleanly:', error)
            router.push('/')
        }
    }

    const currentQ = currentQuestionIndex + 1
    const totalQ = questions.length

    return (
        <AnimatePresence>
            <motion.div
                key="pause-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            >
                {/* Modal Card */}
                <motion.div
                    key="pause-card"
                    initial={{ opacity: 0, scale: 0.92, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 16 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="w-full max-w-sm bg-surface-raised border border-primary/20 rounded-sharp shadow-2xl p-6 relative overflow-hidden"
                >
                    {/* Decorative top border */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                    <div className="text-center mb-8 space-y-3">
                        <h2 className="font-serif text-2xl text-text-primary tracking-wide">
                            {isQuitting ? 'QUIT GAME?' : 'GAME PAUSED'}
                        </h2>

                        {!isQuitting ? (
                            <div className="flex flex-col gap-2">
                                <p className="font-montserrat font-bold text-xs text-primary/80 tracking-[0.2em] uppercase">
                                    Question {currentQ} of {totalQ}
                                </p>

                                {/* Score & Streak Row */}
                                <div className="flex items-center justify-center gap-6 mt-1">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <span className="font-montserrat font-bold text-[10px] text-text-muted tracking-[0.15em] uppercase">Score</span>
                                        <span className="font-serif text-xl text-white">{score}</span>
                                    </div>
                                    {streak > 0 && (
                                        <>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="font-montserrat font-bold text-[10px] text-text-muted tracking-[0.15em] uppercase">Streak</span>
                                                <span className="flex items-center gap-1 font-serif text-xl text-orange-400">
                                                    <Flame size={14} className="text-orange-400" />
                                                    {streak}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-text-muted text-sm leading-relaxed px-4">
                                    Your progress will be saved, but you cannot resume this session later.
                                    {isDaily && <><br /><span className="text-red-400 mt-2 block">Daily Challenge cannot be restarted.</span></>}
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

                                <Button
                                    onClick={handleSettings}
                                    variant="secondary"
                                    className="w-full py-4 text-xs tracking-[0.2em] border-white/10 text-text-muted hover:text-white hover:border-white/20"
                                >
                                    <Settings size={16} className="mr-2" /> SETTINGS
                                </Button>

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
                            className="absolute top-4 right-4 text-text-muted/30 hover:text-white transition-colors p-2"
                        >
                            <X size={20} />
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
