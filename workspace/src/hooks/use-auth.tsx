
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  Auth,
  getAuth,
} from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function will run on the client, and we will pass the token
// in the headers of our server action calls.
async function setAuthHeader(token: string) {
    // This is a conceptual function. In practice, we pass the token
    // to each server action that needs it.
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    try {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      if (!firebaseConfig.apiKey) {
        throw new Error("Firebase API Key is missing. Please check your environment variables.");
      }

      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const firebaseAuth = getAuth(app);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        setUser(user);
        if (user) {
            const token = await user.getIdToken();
            // This is where we would ideally set a header for all subsequent server action calls
            // but Next.js does not have a built-in provider for this.
            // Instead, we will fetch the token inside each component that calls a server action.
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e: any) {
      console.error("Firebase initialization error:", e);
      setError(e.message);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setError("Firebase Auth is not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    let caughtError = null;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      caughtError = e;
      console.error(e);
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        setError('Sign-in process was cancelled. Please try again.');
      } else if (e.code === 'auth/popup-blocked') {
        setError('Popup was blocked by the browser. Please allow popups for this site and try again.');
      }
      else {
        setError(`An unknown error occurred during sign-in: ${e.message}`);
      }
    } finally {
        // The loading state is primarily handled by the onAuthStateChanged listener,
        // but if an error occurs, we need to manually set loading to false to unfreeze the UI.
        if (caughtError) {
            setLoading(false);
        }
    }
  };

  const signOut = async () => {
    if (!auth) {
      setError("Firebase Auth is not initialized.");
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (e: any)
    {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    try {
      const token = await user.getIdToken(true); // Force refresh
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  }, [user]);
  
  const value = { user, loading, error, signInWithGoogle, signOut, getIdToken };

  if (loading && !auth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
