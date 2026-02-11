// store/useGameStore.ts
/**
 * Game state management with Zustand
 */

import { create } from 'zustand'

interface Question {
    id: string
    mode: string
    celebrity_id?: string
    celebrity_id_a?: string
    celebrity_id_b?: string
    difficulty: number
    celebrity_name?: string
    celebrity_name_a?: string
    celebrity_name_b?: string
    hints: string[]
    correct_answer: any
}

interface GameState {
    sessionId: string | null
    mode: string | null
    questions: Question[]
    currentQuestionIndex: number
    score: number
    streak: number
    bestStreak: number
    correctCount: number
    hintsUsed: number
    startTime: number | null
    questionStartTime: number | null

    // Actions
    startGame: (sessionId: string, mode: string, questions: Question[]) => void
    nextQuestion: () => void
    submitAnswer: (isCorrect: boolean, scoreAwarded: number) => void
    useHint: () => void
    endGame: () => void
    resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
    sessionId: null,
    mode: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    correctCount: 0,
    hintsUsed: 0,
    startTime: null,
    questionStartTime: null,

    startGame: (sessionId, mode, questions) => {
        set({
            sessionId,
            mode,
            questions,
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            bestStreak: 0,
            correctCount: 0,
            hintsUsed: 0,
            startTime: Date.now(),
            questionStartTime: Date.now(),
        })
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get()
        if (currentQuestionIndex < questions.length - 1) {
            set({
                currentQuestionIndex: currentQuestionIndex + 1,
                questionStartTime: Date.now(),
            })
        }
    },

    submitAnswer: (isCorrect, scoreAwarded) => {
        const { streak, bestStreak, correctCount } = get()
        const newStreak = isCorrect ? streak + 1 : 0

        set({
            score: get().score + scoreAwarded,
            streak: newStreak,
            bestStreak: Math.max(bestStreak, newStreak),
            correctCount: isCorrect ? correctCount + 1 : correctCount,
        })
    },

    useHint: () => {
        set({ hintsUsed: get().hintsUsed + 1 })
    },

    endGame: () => {
        // Game ended, keep state for results screen
    },

    resetGame: () => {
        set({
            sessionId: null,
            mode: null,
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            streak: 0,
            bestStreak: 0,
            correctCount: 0,
            hintsUsed: 0,
            startTime: null,
            questionStartTime: null,
        })
    },
}))
