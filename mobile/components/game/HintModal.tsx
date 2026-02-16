'use client'

import { useState } from 'react'
import { useGameStore } from '@/store/useGameStore'
import { Button } from '@/components/ui/Button'
import { X, Lightbulb } from 'lucide-react'

interface HintModalProps {
    hint: string
    onClose: () => void
    onUseHint: () => void
    isDaily?: boolean
}

export function HintModal({ hint, onClose, onUseHint, isDaily = false }: HintModalProps) {
    const [step, setStep] = useState<'confirm' | 'reveal'>('confirm')

    const penalty = isDaily ? 30 : 20

    const handleConfirm = () => {
        onUseHint()
        setStep('reveal')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-surface-raised border border-primary/20 rounded-sharp shadow-2xl p-6 relative overflow-hidden animate-scale-in">

                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <div className="text-center mb-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-2">
                        <Lightbulb size={24} />
                    </div>

                    <h2 className="font-serif text-2xl text-text-primary tracking-wide">
                        {step === 'confirm' ? 'HINT' : 'HINT REVEALED'}
                    </h2>

                    {step === 'confirm' ? (
                        <div className="space-y-2 px-2">
                            <p className="font-serif text-lg text-text-muted leading-relaxed">
                                Using a hint reduces this question&apos;s score by <span className="text-amber-400 font-bold">{penalty}%</span>.
                            </p>
                            <p className="font-montserrat text-xs text-text-muted/60 tracking-wider uppercase mt-4">
                                Continue?
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <p className="font-serif text-xl text-white italic leading-relaxed px-4 py-2 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg">
                                "{hint}"
                            </p>
                            <p className="font-montserrat font-bold text-xs text-amber-500/80 tracking-[0.2em] uppercase">
                                Score reduced by {penalty}%
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {step === 'confirm' ? (
                        <>
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="flex-1 py-4 text-xs tracking-[0.2em] text-text-muted/70 hover:text-white"
                            >
                                CANCEL
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                variant="primary"
                                className="flex-1 py-4 text-xs tracking-[0.2em]"
                            >
                                USE HINT
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={onClose}
                            variant="primary"
                            className="w-full py-4 text-xs tracking-[0.2em]"
                        >
                            GOT IT
                        </Button>
                    )}
                </div>

                {/* Close Button (X) - Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted/30 hover:text-text-white transition-colors p-2"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    )
}
