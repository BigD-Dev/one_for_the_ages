'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[OFTA] Error Boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-serif text-text-primary mb-4">Something went wrong</h1>
          <p className="text-text-muted mb-8 text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
            className="bg-primary text-white font-bold py-3 px-8 rounded-sharp uppercase tracking-wider text-sm"
          >
            Back to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
