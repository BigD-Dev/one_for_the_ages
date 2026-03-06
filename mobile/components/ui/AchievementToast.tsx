'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface AchievementToastProps {
  title: string
  description: string
  isVisible: boolean
  onDismiss: () => void
}

export function AchievementToast({ title, description, isVisible, onDismiss }: AchievementToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-6 left-4 right-4 z-50"
          onClick={onDismiss}
        >
          <div className="bg-surface-raised border border-gold/30 rounded-sharp p-4 flex items-center gap-4 shadow-2xl shadow-gold/10 mx-auto max-w-md">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <Trophy size={24} className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold mb-1">
                Achievement Unlocked
              </p>
              <p className="text-sm font-bold text-text-primary truncate">{title}</p>
              <p className="text-xs text-text-muted truncate">{description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
