'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle } from 'lucide-react'

interface FeedbackOverlayProps {
    type: 'spot-on' | 'close' | 'wrong'
    scoreAwarded: number
    correctAnswer: string | number
    onComplete: () => void
    isLastQuestion?: boolean
}

export function FeedbackOverlay({ type, scoreAwarded, correctAnswer, onComplete, isLastQuestion }: FeedbackOverlayProps) {
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        // Auto-transition logic
        const timer = setTimeout(() => {
            setVisible(false)
            setTimeout(onComplete, 300) // Wait for exit animation
        }, 1200) // 1.2s total duration

        return () => clearTimeout(timer)
    }, [onComplete])

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

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
                >
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

                        {/* Decoration Line */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 60 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className={`h-[2px] bg-white/20 mx-auto my-6 rounded-full`}
                        />

                        {/* Reveal Correct Answer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                            className="space-y-1"
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
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
