'use client'

import { useState } from 'react'
import { Card } from '../ui/Card'

interface ZodiacSign {
    name: string
    emoji: string
    dates: string
    element?: 'fire' | 'earth' | 'air' | 'water'
    traits?: string[]
}

interface ZodiacGridProps {
    onSelect: (signName: string) => void
    selectedSign?: string | null
    disabled?: boolean
    feedback?: string | null
    variant?: 'default' | 'compact' | 'detailed'
    showElements?: boolean
    className?: string
}

const zodiacSigns: ZodiacSign[] = [
    { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19', element: 'fire', traits: ['Bold', 'Energetic'] },
    { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20', element: 'earth', traits: ['Reliable', 'Patient'] },
    { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20', element: 'air', traits: ['Curious', 'Social'] },
    { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22', element: 'water', traits: ['Nurturing', 'Intuitive'] },
    { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22', element: 'fire', traits: ['Confident', 'Generous'] },
    { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22', element: 'earth', traits: ['Analytical', 'Practical'] },
    { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22', element: 'air', traits: ['Balanced', 'Diplomatic'] },
    { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21', element: 'water', traits: ['Intense', 'Mysterious'] },
    { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21', element: 'fire', traits: ['Adventurous', 'Philosophical'] },
    { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19', element: 'earth', traits: ['Ambitious', 'Disciplined'] },
    { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18', element: 'air', traits: ['Independent', 'Innovative'] },
    { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20', element: 'water', traits: ['Creative', 'Compassionate'] },
]

const elementColors = {
    fire: 'border-orange-500/30 bg-orange-500/5',
    earth: 'border-green-500/30 bg-green-500/5',
    air: 'border-blue-500/30 bg-blue-500/5',
    water: 'border-purple-500/30 bg-purple-500/5'
}

export const ZodiacGrid = ({
    onSelect,
    selectedSign,
    disabled = false,
    feedback,
    variant = 'default',
    showElements = false,
    className = ''
}: ZodiacGridProps) => {
    const [hoveredSign, setHoveredSign] = useState<string | null>(null)

    const getSignClasses = (sign: ZodiacSign) => {
        const isSelected = selectedSign === sign.name
        const isHovered = hoveredSign === sign.name
        const isCorrect = feedback && feedback.includes('Correct') && isSelected
        const isIncorrect = feedback && feedback.includes('actually') && isSelected

        let classes = 'transition-all duration-200'

        if (disabled) {
            classes += ' opacity-70 cursor-not-allowed'
        } else {
            classes += ' cursor-pointer hover:scale-105'
        }

        if (isSelected) {
            if (isCorrect) {
                classes += ' border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
            } else if (isIncorrect) {
                classes += ' border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20'
            } else {
                classes += ' border-primary bg-primary/10 shadow-lg shadow-primary/20'
            }
        } else if (isHovered && !disabled) {
            classes += ' border-border-active bg-bg-surface-active'
            if (showElements && sign.element) {
                classes += ` ${elementColors[sign.element]}`
            }
        }

        return classes
    }

    const handleSelect = (signName: string) => {
        if (!disabled) {
            onSelect(signName)
        }
    }

    return (
        <div className={`grid grid-cols-3 gap-md ${className}`}>
            {zodiacSigns.map((sign) => (
                <Card
                    key={sign.name}
                    variant="interactive"
                    className={getSignClasses(sign)}
                    onClick={() => handleSelect(sign.name)}
                    onMouseEnter={() => setHoveredSign(sign.name)}
                    onMouseLeave={() => setHoveredSign(null)}
                >
                    <div className="p-md text-center">
                        {/* Emoji */}
                        <div className="text-2xl mb-sm">
                            {sign.emoji}
                        </div>

                        {/* Name */}
                        <div className="text-body font-bold text-text-primary mb-xs">
                            {sign.name}
                        </div>

                        {/* Dates */}
                        <div className="text-overline text-text-secondary leading-tight">
                            {sign.dates}
                        </div>

                        {/* Element (if enabled and hovered) */}
                        {showElements && variant === 'detailed' && (hoveredSign === sign.name || selectedSign === sign.name) && (
                            <div className="mt-xs">
                                <div className={`
                                    text-overline uppercase tracking-wider font-bold
                                    ${sign.element === 'fire' ? 'text-orange-400' :
                                      sign.element === 'earth' ? 'text-green-400' :
                                      sign.element === 'air' ? 'text-blue-400' :
                                      'text-purple-400'}
                                `}>
                                    {sign.element}
                                </div>
                            </div>
                        )}

                        {/* Traits (for detailed variant) */}
                        {variant === 'detailed' && hoveredSign === sign.name && sign.traits && (
                            <div className="mt-xs">
                                <div className="text-overline text-text-muted">
                                    {sign.traits.join(' • ')}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    )
}