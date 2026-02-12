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
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in-up': 'fade-in-up 250ms ease-out forwards',
            },
        },
    },
    plugins: [],
}
