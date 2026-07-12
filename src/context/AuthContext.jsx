import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(null);

/* ── Ensure user doc exists in Firestore ─────────────────── *
 *  overrides: optional { fullName } from signup              */
export async function ensureUserDocument(firebaseUser, overrides = {}) {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) return snap.data();

    // First-time user — create their document
    const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || null,
        phone: firebaseUser.phoneNumber || null,
        fullName: overrides.fullName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
        role: 'Member',
        createdAt: new Date().toISOString(),
    };

    await setDoc(ref, newUser);
    return newUser;
}

export function AuthProvider({ children }) {
    const [profile, setProfile] = useState(null);
    const [userData, setUserData] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const userData = await ensureUserDocument(firebaseUser);
                    setUserData(userData);
                    const name = userData.fullName || userData.email?.split('@')[0] || 'User';
                    const initials = name
                        .split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase();

                    setProfile({
                        full_name: name,
                        role: userData.role || 'Member',
                        email: userData.email || firebaseUser.email,
                        phone: userData.phone || firebaseUser.phoneNumber,
                        mfaEnabled: userData.mfaEnabled || false,
                        initials,
                    });
                } catch (err) {
                    console.error('[AuthContext] Firestore error:', err);
                    // Fallback profile from Firebase Auth data
                    const fallbackName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
                    setProfile({
                        full_name: fallbackName,
                        role: 'Member',
                        email: firebaseUser.email,
                        initials: fallbackName.slice(0, 2).toUpperCase(),
                    });
                }
            } else {
                setUser(null);
                setProfile(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    async function signOut() {
        await firebaseSignOut(auth);
        setUser(null);
        setProfile(null);
        setUserData(null);
    }

    return (
        <AuthContext.Provider value={{ profile, userData, user, loading, authError, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
