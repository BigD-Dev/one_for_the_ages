interface NumericInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    className?: string
}

export const NumericInput = ({ error, className = '', ...props }: NumericInputProps) => {
    return (
        <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`
        w-full h-16 text-center text-4xl font-bold bg-bg-surface-active 
        rounded-2xl border transition-all duration-200 outline-none
        placeholder:text-text-muted/30 tracking-wider
        ${error
                    ? 'border-text-error text-text-error animate-shake'
                    : 'border-border-active focus:border-primary focus:shadow-lg focus:shadow-primary/10'
                }
        ${className}
      `}
            {...props}
        />
    )
}
