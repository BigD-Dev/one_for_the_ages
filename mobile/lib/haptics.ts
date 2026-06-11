import { Haptics, ImpactStyle } from '@capacitor/haptics'

class HapticsManager {
    private enabled: boolean = true

    constructor() {
        if (typeof window !== 'undefined') {
            try {
                const settings = localStorage.getItem('ofta-settings')
                if (settings) {
                    const parsed = JSON.parse(settings)
                    this.enabled = parsed.haptics !== false
                }
            } catch {
                // ignore
            }
        }
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled
    }

    async impact(style: ImpactStyle) {
        if (!this.enabled) return
        try {
            await Haptics.impact({ style })
        } catch {
            // not available on web
        }
    }
}

export const haptics = new HapticsManager()
export { ImpactStyle }
