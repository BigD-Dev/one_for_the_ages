'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CelebrityImage } from './CelebrityImage'
import { Card } from './Card'
import { Button } from './Button'
import { CheckCircle, X, ArrowRight, Calendar, Cake, Sparkles } from 'lucide-react'
import { fireConfetti } from '@/lib/confetti'

interface ResultOverlayProps {
    isVisible: boolean
    isCorrect: boolean
    celebrityName: string
    correctAnswer: any
    userAnswer: any
    scoreAwarded: number
    onNext: () => void
    onClose?: () => void
    feedbackText: string
    mode?: 'age-guess' | 'whos-older' | 'astrology' | 'daily'
}

// Animated score counter
const AnimatedScore = ({ score }: { score: number }) => {
    const [displayScore, setDisplayScore] = useState(0)

    useEffect(() => {
        if (score <= 0) return
        const duration = 600
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplayScore(Math.round(score * eased))

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [score])

    return (
        <motion.div
            className="text-sm text-text-muted"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
            +{displayScore} points
        </motion.div>
    )
}

export const ResultOverlay = ({
    isVisible,
    isCorrect,
    celebrityName,
    correctAnswer,
    userAnswer,
    scoreAwarded,
    onNext,
    onClose,
    feedbackText,
    mode = 'age-guess'
}: ResultOverlayProps) => {
    const hasFiredConfetti = useRef(false)

    useEffect(() => {
        if (isVisible && isCorrect && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true
            setTimeout(() => fireConfetti(), 200)
        }
        if (!isVisible) {
            hasFiredConfetti.current = false
        }
    }, [isVisible, isCorrect])

    const getResultIcon = () => {
        if (isCorrect) {
            return (
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                >
                    <CheckCircle size={32} className="text-green-400" fill="currentColor" />
                </motion.div>
            )
        }
        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            >
                <X size={32} className="text-red-400" />
            </motion.div>
        )
    }

    const getResultBackground = () => {
        if (isCorrect) {
            return 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30'
        }
        return 'bg-gradient-to-br from-red-500/20 to-pink-500/10 border-red-500/30'
    }

    const formatBirthDate = (birthDateString: string) => {
        try {
            const date = new Date(birthDateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return birthDateString
        }
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                    />

                    {/* Result Panel */}
                    <motion.div
                        className="relative w-full max-w-md mx-4 mb-8"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                    >
                        <Card
                            variant="glass"
                            className={`p-6 space-y-4 ${getResultBackground()}`}
                        >
                            {/* Close Button */}
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 text-text-muted hover:text-text-primary z-20"
                                >
                                    <X size={20} />
                                </button>
                            )}

                            {/* Result Header */}
                            <div className="text-center space-y-3">
                                <div className="flex justify-center">
                                    {getResultIcon()}
                                </div>

                                <motion.h3
                                    className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                >
                                    {isCorrect ? 'Correct!' : 'Not quite!'}
                                </motion.h3>

                                {scoreAwarded > 0 && <AnimatedScore score={scoreAwarded} />}
                            </div>

                            {/* Celebrity Info */}
                            <motion.div
                                className="flex items-center gap-4 p-4 bg-bg-surface rounded-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <CelebrityImage name={celebrityName} size="md" />
                                <div className="flex-1 space-y-1">
                                    <h4 className="font-semibold text-text-primary">{celebrityName}</h4>

                                    {mode === 'age-guess' && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <Cake size={14} />
                                                <span>Age {correctAnswer.age}</span>
                                            </div>
                                            {correctAnswer.birth_date && (
                                                <div className="flex items-center gap-2 text-xs text-text-muted">
                                                    <Calendar size={12} />
                                                    <span>{formatBirthDate(correctAnswer.birth_date)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {mode === 'astrology' && (
                                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                                            <Sparkles size={14} />
                                            <span>{correctAnswer.sign}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Feedback Text */}
                            <motion.div
                                className="p-3 bg-bg-surface rounded-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p className="text-sm text-text-secondary text-center">
                                    {feedbackText}
                                </p>
                            </motion.div>

                            {/* Fun Fact */}
                            {correctAnswer.fun_fact && (
                                <motion.div
                                    className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <p className="text-xs text-text-muted">
                                        <strong>Fun fact:</strong> {correctAnswer.fun_fact}
                                    </p>
                                </motion.div>
                            )}

                            {/* Next Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <Button
                                    onClick={onNext}
                                    className="w-full bg-gradient-to-r from-primary-from to-primary-to"
                                >
                                    Continue <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </motion.div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
