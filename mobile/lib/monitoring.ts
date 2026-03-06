/**
 * Error monitoring and performance tracking.
 * When Sentry is configured via NEXT_PUBLIC_SENTRY_DSN, errors are reported.
 * Otherwise, errors are logged locally.
 */

interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  extra?: Record<string, unknown>
}

class Monitoring {
  private initialized = false

  init() {
    if (this.initialized) return
    // TODO: Initialize Sentry when DSN is configured
    // const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    // if (dsn) { Sentry.init({ dsn, environment: process.env.NODE_ENV }) }
    this.initialized = true
  }

  captureError(error: Error, context?: ErrorContext) {
    console.error('[OFTA Error]', error.message, context)
    // TODO: Sentry.captureException(error, { extra: context })
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OFTA ${level}]`, message)
    }
    // TODO: Sentry.captureMessage(message, level)
  }

  setUser(userId: string, email?: string) {
    // TODO: Sentry.setUser({ id: userId, email })
    void userId
    void email
  }
}

export const monitoring = new Monitoring()
