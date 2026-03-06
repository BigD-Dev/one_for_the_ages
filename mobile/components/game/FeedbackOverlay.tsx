'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

interface FeedbackOverlayProps {
    type: 'spot-on' | 'close' | 'wrong'
    scoreAwarded: number
    correctAnswer: string | number
    onComplete: () => void
    isLastQuestion?: boolean
    streak?: number
}

function getStreakMilestone(streak: number): string | null {
    if (streak >= 10) return 'ON FIRE! 10 IN A ROW!'
    if (streak >= 5) return 'UNSTOPPABLE! 5 STREAK!'
    if (streak >= 3) return 'HAT TRICK! 3 STREAK!'
    return null
}

export function FeedbackOverlay({ type, scoreAwarded, correctAnswer, onComplete, isLastQuestion, streak = 0 }: FeedbackOverlayProps) {
    const [visible, setVisible] = useState(true)

    const handleNext = () => {
        setVisible(false)
        setTimeout(onComplete, 300) // Wait for exit animation
    }

    const getTitle = () => {
        switch (type) {
            case 'spot-on': return 'SPOT ON'
            case 'close': return 'So Close'
            case 'wrong': return 'Wrong'
        }
    }

    const getColor = () => {
        switch (type) {
            case 'spot-on': return 'text-gold'
            case 'close': return 'text-primary'
            case 'wrong': return 'text-red-400'
        }
    }

    const getBorderColor = () => {
        switch (type) {
            case 'spot-on': return 'border-gold/40'
            case 'close': return 'border-primary/40'
            case 'wrong': return 'border-red-400/40'
        }
    }

    const getButtonColor = () => {
        switch (type) {
            case 'spot-on': return 'bg-gold text-black hover:bg-gold/90'
            case 'close': return 'bg-primary text-white hover:bg-primary/90'
            case 'wrong': return 'bg-red-500 text-white hover:bg-red-500/90'
        }
    }

    const streakMilestone = streak > 0 ? getStreakMilestone(streak) : null

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm pb-10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className={`w-full max-w-sm mx-4 bg-surface-raised border ${getBorderColor()} rounded-sharp p-6 space-y-4`}
                    >
                        {/* Streak Milestone Banner */}
                        <AnimatePresence>
                            {streakMilestone && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
                                    className="flex items-center justify-center gap-2 bg-gold/10 border border-gold/30 rounded-sharp py-2 px-4"
                                >
                                    <Flame size={14} className="text-gold" />
                                    <span className="font-montserrat font-bold text-[11px] text-gold tracking-[0.18em] uppercase">
                                        {streakMilestone}
                                    </span>
                                    <Flame size={14} className="text-gold" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="text-center space-y-2">
                            {/* Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                                className={`font-serif text-5xl ${getColor()} tracking-wide`}
                            >
                                {getTitle()}
                            </motion.h1>

                            {/* Score Delta */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
                                className={`font-montserrat font-bold text-2xl tracking-[0.2em] ${getColor()}`}
                            >
                                +{scoreAwarded}
                            </motion.div>
                        </div>

                        {/* Streak Count */}
                        {streak > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.35, duration: 0.3 }}
                                className="flex items-center justify-center gap-1.5"
                            >
                                <Flame size={13} className="text-orange-400" />
                                <span className="font-montserrat text-[11px] text-orange-400/80 tracking-[0.15em] uppercase font-medium">
                                    {streak} streak
                                </span>
                            </motion.div>
                        )}

                        {/* Decoration Line */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 60 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="h-[2px] bg-white/20 mx-auto rounded-full"
                        />

                        {/* Reveal Correct Answer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                            className="text-center space-y-1"
                        >
                            {type === 'wrong' && (
                                <p className="font-montserrat font-bold text-[10px] text-text-muted tracking-[0.2em] uppercase">
                                    Correct Answer
                                </p>
                            )}
                            <p className="font-serif text-2xl text-white">
                                {type === 'spot-on' ? correctAnswer : `Correct: ${correctAnswer}`}
                            </p>
                        </motion.div>

                        {/* Next / See Results Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65, duration: 0.25 }}
                            onClick={handleNext}
                            className={`w-full py-4 rounded-sharp font-montserrat font-bold text-xs tracking-[0.2em] uppercase transition-colors ${getButtonColor()}`}
                        >
                            {isLastQuestion ? 'SEE RESULTS' : 'NEXT'}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
