'use client'

interface ZodiacSign {
    name: string
    emoji: string
    dates: string
}

interface ZodiacGridProps {
    onSelect: (signName: string) => void
    selectedSign?: string | null
    disabled?: boolean
    feedback?: string | null
    className?: string
}

const zodiacSigns: ZodiacSign[] = [
    { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
    { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
    { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
    { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
    { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
    { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
    { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
    { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
    { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
    { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
    { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
    { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' },
]

export const ZodiacGrid = ({
    onSelect,
    selectedSign,
    disabled = false,
    feedback,
    className = ''
}: ZodiacGridProps) => {
    const getSignClasses = (sign: ZodiacSign) => {
        const isSelected = selectedSign === sign.name
        const isCorrect = feedback && feedback.includes('Correct') && isSelected
        const isIncorrect = feedback && feedback.includes('actually') && isSelected

        let classes = 'bg-surface rounded-sharp border p-3 text-center'

        if (disabled) {
            classes += ' opacity-70 cursor-not-allowed'
        } else {
            classes += ' cursor-pointer active:opacity-80 transition-opacity duration-150'
        }

        if (isSelected) {
            if (isCorrect) {
                classes += ' border-green-500'
            } else if (isIncorrect) {
                classes += ' border-red-500'
            } else {
                classes += ' border-primary'
            }
        } else {
            classes += ' border-border-subtle'
        }

        return classes
    }

    return (
        <div className={`grid grid-cols-3 gap-3 ${className}`}>
            {zodiacSigns.map((sign) => (
                <button
                    key={sign.name}
                    className={getSignClasses(sign)}
                    onClick={() => !disabled && onSelect(sign.name)}
                    disabled={disabled}
                >
                    <div className="text-2xl mb-1">{sign.emoji}</div>
                    <div className="text-sm font-medium text-text-primary">{sign.name}</div>
                    <div className="text-[10px] text-text-muted leading-tight">{sign.dates}</div>
                </button>
            ))}
        </div>
    )
}
