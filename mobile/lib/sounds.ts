/**
 * Sound effects manager for OFTA.
 * Reads enabled state from localStorage settings.
 * Gracefully fails if audio is unavailable.
 */

class SoundManager {
  private enabled: boolean = true
  private audioCache: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('ofta-settings')
      if (settings) {
        try {
          const parsed = JSON.parse(settings)
          this.enabled = parsed.sound !== false
        } catch {
          // Invalid settings, default to enabled
        }
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  private getAudio(name: string): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null

    if (!this.audioCache.has(name)) {
      const audio = new Audio(`/sounds/${name}.mp3`)
      audio.preload = 'auto'
      this.audioCache.set(name, audio)
    }
    return this.audioCache.get(name) || null
  }

  play(sound: 'correct' | 'wrong' | 'streak' | 'tick' | 'complete' | 'tap') {
    if (!this.enabled) return
    try {
      const audio = this.getAudio(sound)
      if (audio) {
        audio.currentTime = 0
        audio.volume = sound === 'tick' ? 0.3 : 0.6
        audio.play().catch(() => {})
      }
    } catch {
      // Silently fail - sounds are non-critical
    }
  }
}

export const sounds = new SoundManager()
