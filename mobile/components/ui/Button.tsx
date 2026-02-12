import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'icon' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    href?: string
}

export const Button = ({ children, variant = 'primary', size = 'md', className = '', href, ...props }: ButtonProps) => {
    const base = "relative inline-flex items-center justify-center font-medium transition-all duration-200 outline-none select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"

    const variants = {
        primary: "bg-gradient-to-r from-primary-from to-primary-to text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40",
        secondary: "bg-bg-surface-active text-text-secondary border border-border-subtle hover:text-text-primary rounded-xl",
        outline: "bg-transparent text-text-secondary border border-border-subtle hover:text-text-primary hover:border-primary/50 rounded-xl",
        icon: "bg-transparent text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-bg-surface-active",
        ghost: "bg-transparent text-text-muted hover:text-text-primary"
    }

    const sizes = {
        sm: "text-sm px-4 h-9",
        md: "text-base px-6 h-12",
        lg: "text-lg px-8 h-14 font-bold tracking-wide"
    }

    const iconSize = variant === 'icon' ? '' : sizes[size]
    const classes = `${base} ${variants[variant]} ${iconSize} ${className}`

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        )
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}
