/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--accent-primary)',
                    glow: 'var(--accent-glow)',
                    from: 'var(--accent-gradient-start)',
                    to: 'var(--accent-gradient-end)',
                },
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    surface: 'var(--bg-surface)',
                    'surface-active': 'var(--bg-surface-active)',
                },
                border: {
                    subtle: 'var(--border-subtle)',
                    active: 'var(--border-active)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                    muted: 'var(--text-muted)',
                    success: 'var(--text-success)',
                    error: 'var(--text-error)',
                },
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
            },
            fontSize: {
                'display': 'var(--text-display)',
                'headline': 'var(--text-headline)',
                'title': 'var(--text-title)',
                'body-large': 'var(--text-body-large)',
                'body': 'var(--text-body)',
                'caption': 'var(--text-caption)',
                'overline': 'var(--text-overline)',
            },
            spacing: {
                '2xs': 'var(--space-2xs)',
                'xs': 'var(--space-xs)',
                'sm': 'var(--space-sm)',
                'md': 'var(--space-md)',
                'lg': 'var(--space-lg)',
                'xl': 'var(--space-xl)',
                '2xl': 'var(--space-2xl)',
                '3xl': 'var(--space-3xl)',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fadeInUp 300ms cubic-bezier(0, 0, 0.2, 1) forwards',
                'fade-in-scale': 'fadeInScale 300ms cubic-bezier(0, 0, 0.2, 1) forwards',
                'slide-in-right': 'slideInRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'bounce-gentle': 'bounce 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
                'pulse-glow': 'glow 1000ms cubic-bezier(0.4, 0, 0.2, 1) infinite',
                'shimmer': 'shimmer 2000ms linear infinite',
                'pulse-soft': 'pulse 1000ms cubic-bezier(0.4, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
}
