'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReverseHUDProps {
    current: number
    total: number
    score: number
    onBack?: () => void
}

export const ReverseHUD = ({ current, total, score, onBack }: ReverseHUDProps) => {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) onBack()
        else router.back()
    }

    return (
        <header className="sticky top-0 z-10 bg-canvas border-b border-border-subtle px-5 py-4">
            <div className="grid grid-cols-3 items-center">
                {/* Left: Mode + Back */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBack}
                        className="p-1.5 rounded-sharp bg-surface border border-border-subtle active:opacity-80 transition-opacity"
                        aria-label="Back"
                    >
                        <ArrowLeft size={18} className="text-text-muted" />
                    </button>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
                        Reverse Mode
                    </span>
                </div>

                {/* Center: Progress */}
                <div className="text-center">
                    <span className="text-sm font-mono text-text-primary">
                        {current} / {total}
                    </span>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                    <span className="text-sm font-bold text-primary">
                        {score}
                    </span>
                </div>
            </div>

            {/* Progress Bar (Optional thin line) */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-border-subtle w-full">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(current / total) * 100}%` }}
                />
            </div>
        </header>
    )
}
