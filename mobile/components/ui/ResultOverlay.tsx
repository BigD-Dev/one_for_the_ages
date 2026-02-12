'use client'

import { useEffect, useState } from 'react'
import { CelebrityImage } from './CelebrityImage'
import { Card } from './Card'
import { Button } from './Button'
import { CheckCircle, X, ArrowRight, Calendar, Cake, Sparkles } from 'lucide-react'

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
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => setIsAnimating(true), 50)
        } else {
            setIsAnimating(false)
        }
    }, [isVisible])

    if (!isVisible) return null

    const getResultIcon = () => {
        if (isCorrect) {
            return <CheckCircle size={32} className="text-green-400" fill="currentColor" />
        } else {
            return <X size={32} className="text-red-400" />
        }
    }

    const getResultBackground = () => {
        if (isCorrect) {
            return 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30'
        } else {
            return 'bg-gradient-to-br from-red-500/20 to-pink-500/10 border-red-500/30'
        }
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
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                    isAnimating ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            {/* Result Panel */}
            <Card
                variant="glass"
                className={`relative w-full max-w-md mx-4 mb-8 p-6 space-y-4 transition-all duration-500 ease-out ${
                    isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                } ${getResultBackground()}`}
            >
                {/* Close Button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Result Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        {getResultIcon()}
                    </div>

                    <h3 className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite!'}
                    </h3>

                    {scoreAwarded > 0 && (
                        <div className="text-sm text-text-muted">
                            +{scoreAwarded} points
                        </div>
                    )}
                </div>

                {/* Celebrity Info */}
                <div className="flex items-center gap-4 p-4 bg-bg-surface rounded-lg">
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
                                <span>{correctAnswer.sign} ♈</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Text */}
                <div className="p-3 bg-bg-surface rounded-lg">
                    <p className="text-sm text-text-secondary text-center">
                        {feedbackText}
                    </p>
                </div>

                {/* Fun Fact (if available) */}
                {correctAnswer.fun_fact && (
                    <div className="p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <p className="text-xs text-text-muted">💡 <strong>Fun fact:</strong> {correctAnswer.fun_fact}</p>
                    </div>
                )}

                {/* Next Button */}
                <Button
                    onClick={onNext}
                    className="w-full bg-gradient-to-r from-primary-from to-primary-to"
                >
                    Continue <ArrowRight size={16} className="ml-2" />
                </Button>
            </Card>
        </div>
    )
}