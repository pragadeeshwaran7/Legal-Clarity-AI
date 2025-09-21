
'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => {},
    signOut: async () => {},
});

const formatUser = (user: User) => ({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    provider: user.providerData[0].providerId,
    photoUrl: user.photoURL,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const handleUser = async (rawUser: User | null) => {
        if (rawUser) {
            // We will just use the user object from auth directly.
            // This avoids the firestore call which is failing.
            setUser(rawUser);
            
            // We can still try to write to firestore in the background
            // without blocking the user.
            const userRef = doc(db, 'users', rawUser.uid);
            getDoc(userRef).then(docSnap => {
                if (!docSnap.exists()) {
                    const formattedUser = formatUser(rawUser);
                    setDoc(userRef, formattedUser).catch(error => {
                        console.error("Error creating user document:", error);
                    });
                }
            }).catch(error => {
                console.error("Error checking for user document:", error);
            });

        } else {
            setUser(null);
        }
        setLoading(false);
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // handleUser will be called by onAuthStateChanged
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
            // handleUser will be called by onAuthStateChanged
        } catch (error) {
            console.error("Error signing out: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleUser);
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
