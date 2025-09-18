// Import the functions you need from the SDKs you need
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'studio-8098281947-f265b',
  appId: '1:857554194929:web:5592d32921a6918134f450',
  apiKey: 'AIzaSyC39QYRu84Foq4eVkvFGXsnLwQiq0N9R7Q',
  authDomain: 'studio-8098281947-f265b.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '857554194929',
};

// Initialize Firebase for SSR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db};
