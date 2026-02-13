'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { Share } from '@capacitor/share'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Share2, ArrowRight } from 'lucide-react'

export default function ResultsPage() {
    const router = useRouter()
    const {
        score,
        streak,
        bestStreak,
        correctCount,
        questions,
        resetGame,
    } = useGameStore()

    const [isAnimated, setIsAnimated] = useState(false)

    const totalQuestions = questions.length
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0

    useEffect(() => {
        if (totalQuestions === 0) {
            router.push('/')
            return
        }
        setIsAnimated(true)
    }, [totalQuestions, router])

    const handleShare = async () => {
        try {
            await Share.share({
                title: 'One for the Ages',
                text: `I just scored ${score} points on today's Daily Challenge! Can you beat my ${bestStreak} streak?`,
                url: 'https://ofta.app',
            })
        } catch (error) {
            console.error('Failed to share:', error)
        }
    }

    const handlePlayAgain = () => {
        resetGame()
        router.push('/')
    }

    const getPerformanceLabel = () => {
        if (accuracy === 100) return 'GOD TIER'
        if (accuracy >= 90) return 'ELITE'
        if (accuracy >= 75) return 'CHALLENGER'
        if (accuracy >= 60) return 'SURVIVOR'
        if (accuracy >= 40) return 'ROOKIE'
        return 'ARCHIVED'
    }

    const getPerformanceColor = () => {
        if (accuracy === 100) return 'text-gold'
        if (accuracy >= 75) return 'text-primary'
        return 'text-text-muted'
    }

    return (
        <AppShell className="bg-canvas flex flex-col p-8 md:p-12 overflow-hidden">

            <header className="mb-12 text-center animate-fade-in">
                <h1 className="font-montserrat font-bold text-[10px] text-text-muted tracking-[0.4em] uppercase">
                    Match Results
                </h1>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center space-y-12">

                {/* Score & Label */}
                <div className={`text-center space-y-2 transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <p className={`font-montserrat font-bold text-xs tracking-[0.3em] uppercase ${getPerformanceColor()}`}>
                        {getPerformanceLabel()}
                    </p>
                    <div className="relative">
                        <p className="font-serif text-8xl text-text-primary tracking-tighter">
                            {score}
                        </p>
                        <div className="absolute -top-4 -right-8 bg-gold text-canvas font-montserrat font-bold text-[10px] px-2 py-1 rounded-sharp shadow-lg rotate-12">
                            NEW BEST
                        </div>
                    </div>
                    <p className="font-sans text-sm text-text-muted font-bold tracking-widest uppercase opacity-60">
                        Total Points Earned
                    </p>
                </div>

                {/* Performance Grid */}
                <div className={`w-full max-w-sm grid grid-cols-3 gap-3 transition-all duration-1000 delay-300 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-surface-raised border border-white/5 rounded-sharp p-4 text-center space-y-1">
                        <p className="font-montserrat font-bold text-[10px] text-text-muted uppercase tracking-widest opacity-60">Accuracy</p>
                        <p className="font-serif text-xl text-text-primary">{Math.round(accuracy)}%</p>
                    </div>
                    <div className="bg-surface-raised border border-white/5 rounded-sharp p-4 text-center space-y-1">
                        <p className="font-montserrat font-bold text-[10px] text-text-muted uppercase tracking-widest opacity-60">Correct</p>
                        <p className="font-serif text-xl text-text-primary">{correctCount}/{totalQuestions}</p>
                    </div>
                    <div className="bg-surface-raised border border-white/5 rounded-sharp p-4 text-center space-y-1">
                        <p className="font-montserrat font-bold text-[10px] text-text-muted uppercase tracking-widest opacity-60">Streak</p>
                        <p className="font-serif text-xl text-gold">{bestStreak}</p>
                    </div>
                </div>

                {/* Level Up Progress (Mock) */}
                <div className={`w-full max-w-sm space-y-3 transition-all duration-1000 delay-500 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex justify-between items-end">
                        <p className="font-montserrat font-bold text-[10px] text-text-muted uppercase tracking-widest">Level 12</p>
                        <p className="font-montserrat font-bold text-[10px] text-gold uppercase tracking-widest">+120 XP</p>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold transition-all duration-1500 delay-700" style={{ width: '75%' }} />
                    </div>
                </div>

            </main>

            <footer className={`mt-auto pt-12 space-y-4 transition-all duration-1000 delay-700 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                    onClick={handleShare}
                    className="w-full h-16 bg-surface-raised border border-white/10 text-text-primary font-montserrat font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3 active:bg-white/5 transition-all"
                >
                    <Share2 size={18} />
                    Share Record
                </button>

                <button
                    onClick={handlePlayAgain}
                    className="w-full h-16 bg-primary text-white font-montserrat font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-3 active:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                >
                    Play Again
                    <ArrowRight size={18} />
                </button>

                <button
                    onClick={() => router.push('/')}
                    className="w-full h-12 text-text-muted font-montserrat font-bold text-[10px] tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity"
                >
                    Return to Lobby
                </button>
            </footer>

        </AppShell>
    )
}
