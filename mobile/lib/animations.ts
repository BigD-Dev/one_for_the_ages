/**
 * Animation System for OFTA Mobile Game
 * Provides consistent animation presets and utilities
 */

export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'spring'

export interface AnimationConfig {
    duration: number
    easing: EasingFunction
    delay?: number
    fill?: 'none' | 'forwards' | 'backwards' | 'both'
}

/**
 * Pre-defined animation configurations for consistent game feel
 */
export const ANIMATION_PRESETS = {
    // Card animations
    cardReveal: {
        duration: 300,
        easing: 'easeOut' as EasingFunction,
        delay: 0
    },
    cardPress: {
        duration: 150,
        easing: 'easeInOut' as EasingFunction
    },
    cardHover: {
        duration: 200,
        easing: 'easeOut' as EasingFunction
    },

    // Score animations
    scoreCount: {
        duration: 800,
        easing: 'easeOut' as EasingFunction
    },
    scoreBonus: {
        duration: 500,
        easing: 'bounce' as EasingFunction,
        delay: 100
    },

    // Game state transitions
    questionTransition: {
        duration: 400,
        easing: 'easeInOut' as EasingFunction
    },
    resultReveal: {
        duration: 600,
        easing: 'spring' as EasingFunction,
        delay: 200
    },

    // UI feedback
    buttonPress: {
        duration: 100,
        easing: 'easeInOut' as EasingFunction
    },
    notification: {
        duration: 300,
        easing: 'easeOut' as EasingFunction
    },

    // Loading states
    shimmer: {
        duration: 2000,
        easing: 'linear' as EasingFunction
    },
    pulse: {
        duration: 1000,
        easing: 'easeInOut' as EasingFunction
    }
} as const

/**
 * CSS custom properties for easing functions
 */
export const EASING_FUNCTIONS = {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
}

/**
 * Generate CSS transition string from animation config
 */
export const getTransition = (config: AnimationConfig, property = 'all'): string => {
    const { duration, easing, delay = 0 } = config
    const easingFunction = EASING_FUNCTIONS[easing]
    return `${property} ${duration}ms ${easingFunction} ${delay}ms`
}

/**
 * Generate keyframe animation CSS
 */
export const getAnimation = (name: string, config: AnimationConfig): string => {
    const { duration, easing, delay = 0, fill = 'forwards' } = config
    const easingFunction = EASING_FUNCTIONS[easing]
    return `${name} ${duration}ms ${easingFunction} ${delay}ms ${fill}`
}

/**
 * Common keyframe definitions for CSS
 */
export const KEYFRAMES = {
    fadeInUp: `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `,

    fadeInScale: `
        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `,

    slideInRight: `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `,

    bounce: `
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
                transform: translate3d(0, 0, 0);
            }
            40%, 43% {
                transform: translate3d(0, -8px, 0);
            }
            70% {
                transform: translate3d(0, -4px, 0);
            }
            90% {
                transform: translate3d(0, -2px, 0);
            }
        }
    `,

    pulse: `
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.8;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
    `,

    glow: `
        @keyframes glow {
            0% {
                box-shadow: 0 0 5px currentColor;
            }
            50% {
                box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
            }
            100% {
                box-shadow: 0 0 5px currentColor;
            }
        }
    `,

    shimmer: `
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `
}

/**
 * Animation utility classes for Tailwind
 */
export const ANIMATION_CLASSES = {
    // Entrance animations
    'animate-fade-in-up': getAnimation('fadeInUp', ANIMATION_PRESETS.cardReveal),
    'animate-fade-in-scale': getAnimation('fadeInScale', ANIMATION_PRESETS.cardReveal),
    'animate-slide-in-right': getAnimation('slideInRight', ANIMATION_PRESETS.questionTransition),

    // Interactive animations
    'animate-bounce-gentle': getAnimation('bounce', ANIMATION_PRESETS.scoreBonus),
    'animate-pulse-glow': getAnimation('glow', ANIMATION_PRESETS.notification),

    // Loading animations
    'animate-shimmer': getAnimation('shimmer', ANIMATION_PRESETS.shimmer),
    'animate-pulse-soft': getAnimation('pulse', ANIMATION_PRESETS.pulse)
}

/**
 * Stagger delay utility for sequential animations
 */
export const getStaggerDelay = (index: number, baseDelay = 50): number => {
    return index * baseDelay
}

/**
 * Generate staggered animation classes
 */
export const getStaggeredAnimation = (
    baseAnimation: string,
    index: number,
    staggerMs = 100
): string => {
    return `${baseAnimation} [animation-delay:${index * staggerMs}ms]`
}