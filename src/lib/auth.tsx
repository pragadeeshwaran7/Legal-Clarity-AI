
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
            const userRef = doc(db, 'users', rawUser.uid);
            const docSnap = await getDoc(userRef);

            if (!docSnap.exists()) {
                const formattedUser = formatUser(rawUser);
                await setDoc(userRef, formattedUser);
            }
            
            const userFromDb = (await getDoc(userRef)).data() as User;
            setUser(userFromDb);

        } else {
            setUser(null);
        }
        setLoading(false);
        return false;
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                await handleUser(result.user);
            }
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await firebaseSignOut(auth);
            handleUser(null);
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
