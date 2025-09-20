import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This function ensures that we initialize Firebase only once.
function getFirebase() {
  if (typeof window !== "undefined") {
    // Only run this code in the browser
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      return { app, auth, db };
    }
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    return { app, auth, db };
  }
  // On the server, we return null or a simplified object
  // as Firebase client SDK cannot be used here.
  return { app: null, auth: null, db: null };
}

// We export a function that can be called to get the instances.
// This prevents the code from running on the server during import.
let firebaseInstances: { app: FirebaseApp | null; auth: Auth | null; db: Firestore | null; };
export function getClientFirebase() {
    if (!firebaseInstances) {
        firebaseInstances = getFirebase();
    }
    return firebaseInstances;
}

// For convenience, we can still export the instances directly,
// but they will be null on the server.
const { app, auth, db } = getFirebase();
export { app, auth, db };
