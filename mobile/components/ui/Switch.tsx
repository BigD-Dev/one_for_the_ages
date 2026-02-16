'use client'

interface SwitchProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    id?: string
}

export function Switch({ checked, onCheckedChange, disabled, id }: SwitchProps) {
    return (
        <button
            id={id}
            role="switch"
            aria-checked={checked}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={`
                w-11 h-6 rounded-full relative transition-colors duration-200 ease-in-out border
                ${checked ? 'bg-primary border-primary' : 'bg-surface-raised border-border-subtle'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
        >
            <div
                className={`
                    w-4 h-4 rounded-full bg-white absolute top-[3px] transition-transform duration-200 ease-in-out shadow-sm
                    ${checked ? 'translate-x-[22px]' : 'translate-x-[3px]'}
                `}
            />
        </button>
    )
}
