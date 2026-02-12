'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { signOut } from '@/lib/firebase'

export default function SettingsPage() {
    const router = useRouter()
    const { isAuthenticated, oftaUser, user, logout } = useAuthStore()

    const [displayName, setDisplayName] = useState(oftaUser?.display_name || '')
    const [country, setCountry] = useState(oftaUser?.country || '')
    const [isSaving, setIsSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleSaveProfile = async () => {
        setIsSaving(true)
        setSaveMsg(null)
        try {
            await apiClient.updateProfile({ display_name: displayName, country })
            setSaveMsg('✅ Profile saved!')
        } catch (error) {
            console.error('Failed to save:', error)
            setSaveMsg('❌ Failed to save')
        }
        setIsSaving(false)
    }

    const handleLogout = async () => {
        try {
            await signOut()
            logout()
            router.push('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await apiClient.deleteAccount()
            await signOut()
            logout()
            router.push('/')
        } catch (error) {
            console.error('Delete failed:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-primary-400">⚙️ Settings</h1>
                <div className="w-12"></div>
            </div>

            {/* Profile Section */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Profile</h2>
                <div className="bg-dark-800 rounded-2xl p-6 space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your display name"
                            className="w-full bg-dark-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="e.g. UK, US, Nigeria"
                            className="w-full bg-dark-700 text-white py-3 px-4 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Email</label>
                        <p className="text-gray-500 py-3 px-4 bg-dark-700 rounded-lg">
                            {user?.email || 'Not set (Guest)'}
                        </p>
                    </div>

                    {saveMsg && (
                        <p className="text-center text-sm">{saveMsg}</p>
                    )}

                    <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4">About</h2>
                <div className="bg-dark-800 rounded-2xl p-6 space-y-3">
                    <div className="flex justify-between">
                        <p className="text-gray-400">App Version</p>
                        <p className="text-white">1.0.0</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-gray-400">Auth Provider</p>
                        <p className="text-white capitalize">
                            {user?.isAnonymous ? 'Guest' : 'Email'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="space-y-3">
                <button
                    onClick={handleLogout}
                    className="w-full bg-dark-800 hover:bg-dark-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                >
                    🚪 Sign Out
                </button>

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-dark-800 hover:bg-red-900/30 text-red-400 font-bold py-4 px-6 rounded-xl transition-colors border border-transparent hover:border-red-500/30"
                >
                    🗑️ Delete Account
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
                    <div className="bg-dark-800 rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Delete Account?</h3>
                        <p className="text-gray-400 mb-6">
                            This will permanently delete your account, stats, and game history.
                            This cannot be undone.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Yes, Delete Everything
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full bg-dark-700 hover:bg-dark-600 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
