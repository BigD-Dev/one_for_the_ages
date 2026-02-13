'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/ui/Layout'
import { CelebrityImage } from '@/components/ui/CelebrityImage'
import { GameLoadingSkeleton } from '@/components/ui/SkeletonLoader'
import { useGameStore } from '@/store/useGameStore'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { ArrowLeft, Clock, Info, Pause, Play, X, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AgeGuessPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const {
        sessionId,
        questions,
        currentQuestionIndex,
        score,
        streak,
        startGame,
        nextQuestion,
        submitAnswer,
        endGame,
    } = useGameStore()

    const [guess, setGuess] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [feedback, setFeedback] = useState<{
        type: 'spot-on' | 'close' | 'wrong' | null
        correctAge: number | null
        scoreAwarded: number
        diff: number
    }>({ type: null, correctAge: null, scoreAwarded: 0, diff: 0 })

    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
            return
        }

        const initGame = async () => {
            try {
                const session = await apiClient.startSession({ mode: 'AGE_GUESS' })
                startGame(session.id, 'AGE_GUESS', session.questions)
                setIsLoading(false)
            } catch (error) {
                console.error('Failed to start game:', error)
                router.push('/')
            }
        }

        if (!sessionId) {
            initGame()
        } else {
            setIsLoading(false)
        }
    }, [isAuthenticated, sessionId, router, startGame])

    const handleSubmit = async () => {
        if (!guess || !currentQuestion || isSubmitting || feedback.type) return

        const userGuess = parseInt(guess, 10)
        if (isNaN(userGuess) || userGuess < 0 || userGuess > 120) return

        setIsSubmitting(true)
        try {
            const questionStartTime = useGameStore.getState().questionStartTime || Date.now()
            const responseTimeMs = Date.now() - questionStartTime

            const result = await apiClient.submitAnswer(sessionId!, {
                question_template_id: currentQuestion.id,
                question_index: currentQuestionIndex,
                user_answer: { age: userGuess },
                response_time_ms: responseTimeMs,
                hints_used: showHint ? 1 : 0,
            })

            const correctAge = result.correct_answer.age
            const diff = Math.abs(userGuess - correctAge)

            let type: 'spot-on' | 'close' | 'wrong' = 'wrong'
            if (diff === 0) {
                type = 'spot-on'
                await Haptics.impact({ style: ImpactStyle.Heavy })
            } else if (diff <= 2) {
                type = 'close'
                await Haptics.impact({ style: ImpactStyle.Medium })
            } else {
                await Haptics.impact({ style: ImpactStyle.Light })
            }

            setFeedback({
                type,
                correctAge,
                scoreAwarded: result.score_awarded,
                diff
            })

            submitAnswer(result.is_correct, result.score_awarded)

            // Auto-advance after 1.5s if perfect, or show "Next" button
            if (type === 'spot-on') {
                setTimeout(() => handleNext(), 1500)
            }

        } catch (error) {
            console.error('Failed to submit:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleNext = () => {
        if (isLastQuestion) {
            handleEndGame()
        } else {
            setFeedback({ type: null, correctAge: null, scoreAwarded: 0, diff: 0 })
            setGuess('')
            setShowHint(false)
            nextQuestion()
        }
    }

    const handleEndGame = async () => {
        try {
            setIsLoading(true)
            await apiClient.endSession(sessionId!)
            endGame()
            router.push('/game/results')
        } catch (error) {
            console.error('Failed to end:', error)
            router.push('/game/results')
        }
    }

    if (isLoading || !currentQuestion) {
        return (
            <AppShell className="flex items-center justify-center bg-canvas">
                <GameLoadingSkeleton />
            </AppShell>
        )
    }

    const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
        <AppShell className="bg-canvas flex flex-col p-6 min-h-screen relative overflow-hidden">

            {/* 1️⃣ Top HUD */}
            <header className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <span className="font-montserrat font-bold text-[10px] text-text-muted tracking-[0.2em] uppercase opacity-60">
                        Age Guess
                    </span>
                    <span className="font-serif text-lg text-text-primary">
                        {currentQuestionIndex + 1} <span className="text-text-muted/30">/</span> {questions.length}
                    </span>
                </div>

                <div className="text-right">
                    <span className="font-montserrat font-bold text-[10px] text-primary tracking-[0.2em] uppercase opacity-60">
                        Score
                    </span>
                    <p className="font-serif text-2xl text-text-primary">
                        {score}
                    </p>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-white/5 h-[2px] mb-8 overflow-hidden rounded-full">
                <div
                    className="h-full bg-primary transition-all duration-700 ease-out"
                    style={{ width: `${progressPct}%` }}
                />
            </div>

            {/* 2️⃣ Celebrity Card */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-12">
                <div className="relative w-full max-w-[280px] aspect-square group">
                    <CelebrityImage
                        name={currentQuestion.celebrity_name!}
                        size="xl"
                        rounded="sharp"
                        className="transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 pointer-events-none rounded-sharp" />

                    {/* Floating Streak Badge if relevant */}
                    {streak > 2 && (
                        <div className="absolute top-4 right-4 bg-gold text-canvas font-montserrat font-bold text-[10px] px-2 py-1 rounded-sharp animate-flame">
                            {streak} STREAK
                        </div>
                    )}
                </div>

                <div className="text-center space-y-2">
                    <h2 className="font-serif text-3xl text-text-primary leading-tight">
                        {currentQuestion.celebrity_name}
                    </h2>
                    {feedback.type && (
                        <p className={`font-montserrat font-bold text-xs tracking-[0.2em] uppercase ${feedback.type === 'spot-on' ? 'text-green-400' : 'text-primary'}`}>
                            Correct Age: {feedback.correctAge}
                        </p>
                    )}
                </div>
            </div>

            {/* 3️⃣ Slot Input Area */}
            <div className="space-y-8 mb-8">
                <div className="flex justify-center flex-col items-center">
                    <div className="relative group">
                        <input
                            type="number"
                            inputMode="numeric"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="--"
                            disabled={!!feedback.type}
                            className={`w-32 bg-surface-raised border-2 border-white/5 rounded-sharp text-center text-6xl font-serif text-gold py-6 focus:border-primary transition-all placeholder:opacity-10 outline-none
                                ${feedback.type ? 'opacity-50' : 'animate-pulse-slow'}
                            `}
                        />
                        <div className="absolute -inset-4 border border-primary/5 rounded-sharp -z-10 group-focus-within:border-primary/20 transition-all" />
                    </div>
                </div>

                {/* 4️⃣ Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!guess || isSubmitting || !!feedback.type}
                    className="w-full bg-primary text-white font-montserrat font-bold text-sm tracking-[0.4em] uppercase py-6 rounded-sharp shadow-xl shadow-primary/10 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale"
                >
                    {isSubmitting ? 'Verifying...' : 'Submit Guess'}
                </button>
            </div>

            {/* 5️⃣ Secondary Controls */}
            <footer className="flex justify-between items-center px-2 pb-4">
                <button
                    onClick={() => setShowHint(true)}
                    className="flex items-center gap-2 text-text-muted/40 hover:text-text-muted transition-colors"
                >
                    <Info size={14} />
                    <span className="font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase">Hint (-20%)</span>
                </button>

                <button
                    onClick={() => setIsPaused(true)}
                    className="flex items-center gap-2 text-text-muted/40 hover:text-text-muted transition-colors"
                >
                    <Pause size={14} />
                    <span className="font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase">Pause</span>
                </button>
            </footer>

            {/* 🔥 FEEDBACK OVERLAYS */}

            {/* Immediate Response Overlay */}
            {feedback.type && (
                <div className="fixed inset-0 z-40 bg-canvas/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                    <div className="text-center space-y-4 animate-scale-in">
                        {feedback.type === 'spot-on' && (
                            <>
                                <h1 className="font-serif text-6xl text-gold">SPOT ON</h1>
                                <p className="font-montserrat font-bold text-sm tracking-[0.3em] text-gold/60 uppercase">+{feedback.scoreAwarded}</p>
                            </>
                        )}
                        {feedback.type === 'close' && (
                            <>
                                <h1 className="font-serif text-6xl text-primary">So Close</h1>
                                <p className="font-montserrat font-bold text-sm tracking-[0.3em] text-primary/60 uppercase">+{feedback.scoreAwarded}</p>
                            </>
                        )}
                        {feedback.type === 'wrong' && (
                            <>
                                <h1 className="font-serif text-4xl text-text-muted opacity-40">Correct Age: {feedback.correctAge}</h1>
                                <p className="font-montserrat font-bold text-sm tracking-[0.3em] text-text-muted/30 uppercase">+0</p>
                            </>
                        )}

                        {feedback.type !== 'spot-on' && (
                            <button
                                onClick={handleNext}
                                className="mt-8 px-12 py-4 bg-text-primary text-canvas font-montserrat font-bold text-xs tracking-[0.4em] uppercase rounded-sharp"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Hint Card */}
            {showHint && !feedback.type && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8 animate-fade-in backdrop-blur-md">
                    <div className="bg-surface-raised border border-white/10 p-8 rounded-sharp w-full max-w-xs space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <span className="font-montserrat font-bold text-[10px] text-gold tracking-[0.2em] uppercase">Intel Received</span>
                            <button onClick={() => setShowHint(false)}><X size={16} /></button>
                        </div>
                        <p className="font-serif text-xl text-text-primary italic leading-relaxed">
                            "{currentQuestion.hints?.[0] || 'No hint available.'}"
                        </p>
                        <button
                            onClick={() => setShowHint(false)}
                            className="w-full bg-white/5 text-text-primary font-montserrat font-bold text-[10px] tracking-[0.2em] uppercase py-4 rounded-sharp"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* Pause Overlay */}
            {isPaused && (
                <div className="fixed inset-0 z-50 bg-canvas flex flex-col items-center justify-center p-8 animate-fade-in">
                    <h1 className="font-serif text-5xl text-text-primary mb-12">Paused</h1>
                    <div className="w-full max-w-xs space-y-4">
                        <button
                            onClick={() => setIsPaused(false)}
                            className="w-full bg-primary text-white font-montserrat font-bold text-xs tracking-[0.4em] uppercase py-6 rounded-sharp flex items-center justify-center gap-3"
                        >
                            <Play size={16} /> Resume
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-white/5 text-text-muted font-montserrat font-bold text-xs tracking-[0.4em] uppercase py-6 rounded-sharp"
                        >
                            Quit Game
                        </button>
                    </div>
                </div>
            )}

        </AppShell>
    )
}
