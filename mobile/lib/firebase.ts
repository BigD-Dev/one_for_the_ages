// lib/firebase.ts
/**
 * Firebase configuration and initialization
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import {
    getAuth,
    Auth,
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth

if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
}

export { auth }

// ────────────────────────────────────────────────
// Auth helpers
// ────────────────────────────────────────────────

export const signInAnon = () => signInAnonymously(auth)

export const signInEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

export const signUpEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)

export const signOut = () => firebaseSignOut(auth)

export const onAuthChange = (callback: (user: User | null) => void) =>
    onAuthStateChanged(auth, callback)

export const getCurrentUser = () => auth.currentUser

export const getIdToken = async () => {
    const user = auth.currentUser
    if (!user) return null
    return user.getIdToken()
}
