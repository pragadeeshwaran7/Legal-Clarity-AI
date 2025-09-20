import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This function ensures that we initialize Firebase only once.
let firebaseInstances: { app: FirebaseApp; auth: Auth; db: Firestore; } | null = null;

export function getClientFirebase() {
    if (typeof window !== "undefined") {
        if (firebaseInstances) {
            return firebaseInstances;
        }

        const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        if (!getApps().length) {
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            firebaseInstances = { app, auth, db };
        } else {
            const app = getApp();
            const auth = getAuth(app);
            const db = getFirestore(app);
            firebaseInstances = { app, auth, db };
        }
        return firebaseInstances;
    }
    
    // On the server, we return null as Firebase client SDK cannot be used here.
    return { app: null, auth: null, db: null };
}

// For convenience, we can still export the instances directly for client-side components
// that can guarantee they run only in the browser. However, using getClientFirebase is safer.
const { app, auth, db } = getClientFirebase();
export { app, auth, db };
