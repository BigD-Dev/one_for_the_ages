'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { logger } from '@/lib/logger'
import { signOut, auth } from '@/lib/firebase'
import { reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { AppShell } from '@/components/ui/Layout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
    const router = useRouter()
    const { isAuthenticated, oftaUser, user, logout } = useAuthStore()

    const [displayName, setDisplayName] = useState(oftaUser?.display_name || '')
    const [country, setCountry] = useState(oftaUser?.country || '')
    const [isSaving, setIsSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState<string | null>(null)
    const [deleteStep, setDeleteStep] = useState<null | 'confirm' | 'password'>(null)
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteError, setDeleteError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleSaveProfile = async () => {
        setIsSaving(true)
        setSaveMsg(null)
        try {
            await apiClient.updateProfile({ display_name: displayName, country })
            setSaveMsg('Profile saved!')
        } catch (error) {
            logger.error('Failed to save:', error)
            setSaveMsg('Failed to save')
        }
        setIsSaving(false)
    }

    const handleLogout = async () => {
        try {
            await signOut()
            logout()
            router.push('/')
        } catch (error) {
            logger.error('Logout failed:', error)
        }
    }

    const handleDeleteAccount = async () => {
        setDeleteError(null)
        setIsDeleting(true)
        try {
            const currentUser = auth.currentUser
            if (currentUser && !currentUser.isAnonymous) {
                const credential = EmailAuthProvider.credential(currentUser.email!, deletePassword)
                await reauthenticateWithCredential(currentUser, credential)
            }
            await apiClient.deleteAccount()
            await signOut()
            logout()
            router.push('/')
        } catch (error: any) {
            logger.error('Delete failed:', error)
            const code = error?.code || ''
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                setDeleteError('Incorrect password. Please try again.')
            } else {
                setDeleteError('Something went wrong. Please try again.')
            }
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AppShell>
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="text-text-muted">
                    <ArrowLeft size={18} className="mr-1" /> Back
                </Button>
                <h1 className="text-xl font-bold text-text-primary font-serif">Settings</h1>
                <div className="w-16" />
            </header>

            {/* Profile Section */}
            <div className="mb-8">
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Profile</h2>
                <Card className="p-6 space-y-4">
                    <div>
                        <label className="block text-text-muted text-sm mb-1">Display Name</label>
                        <Input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                        />
                    </div>
                    <div>
                        <label className="block text-text-muted text-sm mb-1">Country</label>
                        <Input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="e.g. UK, US, Nigeria"
                        />
                    </div>
                    <div>
                        <label className="block text-text-muted text-sm mb-1">Email</label>
                        <p className="text-text-muted py-3 px-4 bg-surface rounded-sharp border border-border-subtle">
                            {user?.email || 'Not set (Guest)'}
                        </p>
                    </div>

                    {saveMsg && (
                        <p className="text-center text-sm text-text-muted">{saveMsg}</p>
                    )}

                    <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Card>
            </div>

            {/* App Info */}
            <div className="mb-8">
                <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">About</h2>
                <Card className="p-6 space-y-3">
                    <div className="flex justify-between border-b border-border-subtle pb-3">
                        <p className="text-text-muted">App Version</p>
                        <p className="text-text-primary font-mono">1.0.0</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-text-muted">Auth Provider</p>
                        <p className="text-text-primary capitalize font-mono">
                            {user?.isAnonymous ? 'Guest' : 'Email'}
                        </p>
                    </div>
                </Card>
            </div>

            {/* Account Actions */}
            <div className="space-y-3">
                <Button
                    variant="secondary"
                    onClick={handleLogout}
                    className="w-full"
                >
                    Sign Out
                </Button>

                <button
                    onClick={() => { setDeleteStep('confirm'); setDeleteError(null); setDeletePassword('') }}
                    className="w-full py-4 px-6 rounded-sharp text-red-400 font-medium border border-border-subtle bg-surface active:opacity-80 transition-opacity duration-150"
                >
                    Delete Account
                </button>
            </div>

            {/* Step 1: Confirm */}
            {deleteStep === 'confirm' && (
                <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-6 pb-10">
                    <Card className="p-6 w-full max-w-sm space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-red-400 font-serif">Delete Account?</h3>
                            <p className="text-text-muted text-sm">
                                This will permanently delete your account, all stats, and game history. This cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => setDeleteStep('password')}
                            className="w-full bg-red-600/10 border border-red-600/40 text-red-400 font-bold py-4 rounded-sharp active:opacity-80 transition-opacity text-sm tracking-widest uppercase"
                        >
                            Yes, delete my account
                        </button>
                        <Button variant="secondary" onClick={() => setDeleteStep(null)} className="w-full">
                            Cancel
                        </Button>
                    </Card>
                </div>
            )}

            {/* Step 2: Password confirmation */}
            {deleteStep === 'password' && (
                <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-6 pb-10">
                    <Card className="p-6 w-full max-w-sm space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-text-primary font-serif">Confirm with password</h3>
                            <p className="text-text-muted text-sm">
                                Enter your password one last time to permanently delete your account.
                            </p>
                        </div>
                        <Input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => { setDeletePassword(e.target.value); setDeleteError(null) }}
                            placeholder="Your password"
                            autoFocus
                        />
                        {deleteError && (
                            <p className="text-xs text-red-400 text-center">{deleteError}</p>
                        )}
                        <button
                            onClick={handleDeleteAccount}
                            disabled={!deletePassword || isDeleting}
                            className="w-full bg-red-600 text-white font-bold py-4 rounded-sharp active:opacity-80 disabled:opacity-40 transition-opacity text-sm tracking-widest uppercase"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete my account'}
                        </button>
                        <Button variant="secondary" onClick={() => setDeleteStep('confirm')} className="w-full">
                            Back
                        </Button>
                    </Card>
                </div>
            )}
        </AppShell>
    )
}
