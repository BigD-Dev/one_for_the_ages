import confetti from 'canvas-confetti'

export const fireConfetti = () => {
    // Center burst
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'],
        ticks: 120,
        gravity: 0.8,
        scalar: 1.2,
        shapes: ['circle', 'square'],
    })

    // Side bursts for extra effect
    setTimeout(() => {
        confetti({
            particleCount: 40,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#06b6d4', '#22d3ee', '#fbbf24', '#f59e0b'],
        })
        confetti({
            particleCount: 40,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#06b6d4', '#22d3ee', '#fbbf24', '#f59e0b'],
        })
    }, 150)
}

export const fireStreakConfetti = (streakCount: number) => {
    const intensity = Math.min(streakCount * 15, 100)
    confetti({
        particleCount: intensity,
        spread: 60 + streakCount * 5,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#f97316', '#fb923c', '#fbbf24', '#ef4444', '#dc2626'],
        ticks: 80,
        gravity: 1,
        scalar: 0.9,
    })
}
